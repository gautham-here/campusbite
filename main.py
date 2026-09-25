"""CampusBite API. Run: uvicorn main:app --reload"""
import os, hmac, hashlib, io
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel, Field
from supabase import create_client
import razorpay, qrcode

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://YOUR-PROJECT.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "dummy-service-key")
RAZORPAY_ID = os.getenv("RAZORPAY_KEY_ID", "rzp_test_dummy")
RAZORPAY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "dummy_secret")
QR_SECRET = os.getenv("QR_SECRET", "campusbite_secret_qr_key_2026").encode()

sb = None
if "YOUR-PROJECT" not in SUPABASE_URL and SUPABASE_KEY != "dummy-service-key":
    try:
        sb = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print("Supabase client init warning:", e)

rz = None
try:
    rz = razorpay.Client(auth=(RAZORPAY_ID, RAZORPAY_SECRET))
except Exception:
    pass

app = FastAPI(title="CampusBite API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])  # tighten in prod

# ---------- auth ----------
def current_user(authorization: str = Header(...)) -> dict:
    if not sb:
        raise HTTPException(500, "Supabase backend not configured")
    res = sb.auth.get_user(authorization.split()[-1])
    if not res or not res.user:
        raise HTTPException(401, "Invalid session")
    return sb.table("profiles").select("*").eq("id", res.user.id).single().execute().data

def require(*roles):
    def dep(u: dict = Depends(current_user)):
        if u["role"] not in roles:
            raise HTTPException(403, "Not allowed for your role")
        return u
    return dep

# ---------- QR helpers (signed, so a screenshot of a fake code is rejected) ----------
def sign(order_id: int, token: str) -> str:
    return hmac.new(QR_SECRET, f"{order_id}:{token}".encode(), hashlib.sha256).hexdigest()[:16]

def qr_png(payload: str) -> bytes:
    buf = io.BytesIO(); qrcode.make(payload).save(buf, format="PNG"); return buf.getvalue()

# ---------- public ----------
@app.get("/outlets")
def outlets():
    if not sb:
        return {"event_mode": False, "outlets": []}
    ev = sb.table("settings").select("event_mode").single().execute().data.get("event_mode", False)
    rows = sb.table("outlets").select("*, menu_items(*)").eq("is_event", ev).execute().data
    return {"event_mode": ev, "outlets": rows}

# ---------- wallet + Razorpay ----------
class TopUp(BaseModel):
    amount: int = Field(ge=10, le=10000)

@app.post("/wallet/topup")
def topup(b: TopUp, u=Depends(current_user)):
    if not rz:
        raise HTTPException(400, "Razorpay client not configured")
    o = rz.order.create({"amount": b.amount * 100, "currency": "INR", "notes": {"user_id": u["id"]}})
    sb.table("payments").insert({"razorpay_order_id": o["id"], "user_id": u["id"], "amount": b.amount}).execute()
    return {"order_id": o["id"], "amount": b.amount, "key_id": RAZORPAY_ID}

@app.post("/wallet/direct-topup")
def direct_topup(b: TopUp, u=Depends(current_user)):
    import uuid
    ref = f"test_topup_{uuid.uuid4().hex[:8]}"
    bal = sb.rpc("credit_wallet", {"p_user": u["id"], "p_amount": b.amount, "p_kind": "direct_topup", "p_ref": ref}).execute().data
    return {"balance": bal, "ref": ref}

class Verify(BaseModel):
    razorpay_order_id: str; razorpay_payment_id: str; razorpay_signature: str

@app.post("/wallet/verify")
def verify(b: Verify, u=Depends(current_user)):
    try:
        rz.utility.verify_payment_signature(b.model_dump())
    except razorpay.errors.SignatureVerificationError:
        raise HTTPException(400, "Payment signature invalid")
    p = sb.table("payments").select("*").eq("razorpay_order_id", b.razorpay_order_id).eq("user_id", u["id"]).single().execute().data
    bal = sb.rpc("credit_wallet", {"p_user": u["id"], "p_amount": p["amount"], "p_kind": "topup", "p_ref": b.razorpay_payment_id}).execute().data
    sb.table("payments").update({"status": "paid"}).eq("razorpay_order_id", b.razorpay_order_id).execute()
    return {"balance": bal}

@app.post("/webhooks/razorpay")   # safety net if the student closes the tab after paying
async def webhook(req: Request, x_razorpay_signature: str = Header(...)):
    body = (await req.body()).decode()
    try:
        rz.utility.verify_webhook_signature(body, x_razorpay_signature, os.environ["RAZORPAY_WEBHOOK_SECRET"])
    except Exception:
        raise HTTPException(400, "Bad signature")
    ev = await req.json()
    if ev.get("event") == "payment.captured":
        pay = ev["payload"]["payment"]["entity"]
        row = sb.table("payments").select("*").eq("razorpay_order_id", pay["order_id"]).single().execute().data
        sb.rpc("credit_wallet", {"p_user": row["user_id"], "p_amount": row["amount"], "p_kind": "topup", "p_ref": pay["id"]}).execute()
    return {"ok": True}

@app.get("/wallet")
def wallet(u=Depends(current_user)):
    bal = sb.table("wallets").select("balance").eq("user_id", u["id"]).single().execute().data["balance"]
    tx = sb.table("wallet_txns").select("*").eq("user_id", u["id"]).order("id", desc=True).limit(50).execute().data
    return {"balance": bal, "transactions": tx}

# ---------- orders + QR ----------
class Line(BaseModel):
    item_id: int; qty: int = Field(ge=1, le=20)
class NewOrder(BaseModel):
    outlet_id: str; items: list[Line]

@app.post("/orders")
def create_order(b: NewOrder, u=Depends(current_user)):
    try:
        r = sb.rpc("place_order", {"p_user": u["id"], "p_outlet": b.outlet_id, "p_items": [l.model_dump() for l in b.items]}).execute()
    except Exception as e:
        raise HTTPException(400, getattr(e, "message", str(e)))
    o = r.data if isinstance(r.data, dict) else r.data[0]
    return {**o, "qr_url": f"/orders/{o['id']}/qr"}

@app.get("/orders/{oid}/qr")
def order_qr(oid: int, u=Depends(current_user)):
    o = sb.table("orders").select("*").eq("id", oid).single().execute().data
    if o["user_id"] != u["id"]:
        raise HTTPException(403, "Not your order")
    return Response(qr_png(f"CB1.{oid}.{sign(oid, o['token'])}"), media_type="image/png")

# ---------- staff ----------
ADVANCE = {"placed": "preparing", "preparing": "ready"}

@app.get("/staff/orders")
def staff_orders(u=Depends(require("staff", "admin"))):
    q = sb.table("orders").select("*, order_items(*)").in_("status", ["placed", "preparing", "ready"]).order("id")
    if u["role"] == "staff": q = q.eq("outlet_id", u["outlet_id"])
    return q.execute().data

@app.post("/staff/orders/{oid}/advance")
def advance(oid: int, u=Depends(require("staff", "admin"))):
    o = sb.table("orders").select("*").eq("id", oid).single().execute().data
    if u["role"] == "staff" and o["outlet_id"] != u["outlet_id"]: raise HTTPException(403, "Other outlet's order")
    if o["status"] not in ADVANCE: raise HTTPException(400, f"Order is already {o['status']}")
    sb.table("orders").update({"status": ADVANCE[o["status"]], "updated_at": "now()"}).eq("id", oid).execute()
    return {"status": ADVANCE[o["status"]]}

class Scan(BaseModel):
    payload: str

@app.post("/staff/scan")
def scan(b: Scan, u=Depends(require("staff", "admin"))):
    try:
        _, oid, sig = b.payload.split("."); oid = int(oid)
    except ValueError:
        raise HTTPException(400, "Not a CampusBite QR")
    o = sb.table("orders").select("*").eq("id", oid).single().execute().data
    if not hmac.compare_digest(sig, sign(oid, o["token"])): raise HTTPException(400, "Fake or altered QR")
    if u["role"] == "staff" and o["outlet_id"] != u["outlet_id"]: raise HTTPException(403, "Order belongs to another outlet")
    if o["status"] == "collected": raise HTTPException(409, "Already collected")
    if o["status"] != "ready": raise HTTPException(409, f"Order is still {o['status']}")
    sb.table("orders").update({"status": "collected", "updated_at": "now()"}).eq("id", oid).execute()
    return {"ok": True, "order_id": oid, "token": o["token"]}

class Avail(BaseModel):
    available: bool

@app.post("/staff/items/{item_id}/availability")
def availability(item_id: int, b: Avail, u=Depends(require("staff", "admin"))):
    sb.table("menu_items").update({"available": b.available}).eq("id", item_id).execute()
    return {"ok": True}

# ---------- admin ----------
class Mode(BaseModel):
    on: bool

@app.post("/admin/event-mode")
def event_mode(b: Mode, u=Depends(require("admin"))):
    sb.table("settings").update({"event_mode": b.on}).eq("id", 1).execute()
    return {"event_mode": b.on}

class Credit(BaseModel):
    user_id: str; amount: int = Field(gt=0, le=50000); note: str = "event credit"

@app.post("/admin/credit")
def credit(b: Credit, u=Depends(require("admin"))):
    import uuid
    bal = sb.rpc("credit_wallet", {"p_user": b.user_id, "p_amount": b.amount, "p_kind": b.note, "p_ref": f"admin:{uuid.uuid4()}"}).execute().data
    return {"balance": bal}

@app.get("/admin/sales")
def sales(u=Depends(require("admin"))):
    rows = sb.table("orders").select("outlet_id,total,status").neq("status", "cancelled").execute().data
    out = {}
    for r in rows:
        s = out.setdefault(r["outlet_id"], {"orders": 0, "revenue": 0}); s["orders"] += 1; s["revenue"] += r["total"]
    return out
