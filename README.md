# CampusBite – VIT Chennai (React + FastAPI + Supabase + Razorpay)

## Setup (about 20 minutes)
1. **Supabase**: create a free project. SQL Editor: paste and run `schema.sql`.
2. **Keys**: copy `.env.example` to `.env`. Fill the Supabase URL + service-role key (Settings > API), Razorpay *test* keys, and any long random `QR_SECRET`.
3. **Install and seed**:
   `pip install -r requirements.txt` then `python seed.py`
4. **Run API**: `uvicorn main:app --reload` (docs at http://localhost:8000/docs)
5. **Users**: Supabase > Authentication > add users. Then in Table Editor > `profiles`, set `role` (`staff` / `admin`) and `outlet_id` (e.g. `g3`) for staff, `cust_type` for customers.
6. **Frontend**: install Node.js 20+, run `cd frontend`, `npm install`, copy `frontend/.env.example` to `frontend/.env`, fill the `VITE_` values, and run `npm run dev`. Open the printed Vite URL.
7. **Razorpay webhook** (optional): point `https://<public-url>/webhooks/razorpay` at event `payment.captured`.

## Demo flow
Customer tops up (Razorpay test card) → orders → order page shows live status + QR →
staff calls `POST /staff/orders/{id}/advance` twice (or via staff UI) → customer sees "Ready" without refresh →
staff scans the QR with `POST /staff/scan` → order becomes "collected". Admin: `POST /admin/event-mode`.

## Deploy the web app

Run `cd frontend && npm run build`, then deploy `frontend/dist` to Vercel, Netlify, Cloudflare Pages, or another static host. Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_API_URL` in the host environment. Deploy the FastAPI service separately on a Python host such as Render or Railway, keep its server-only secrets from `.env.example`, and set `VITE_API_URL` to its public HTTPS URL.

## Build Android/iOS apps

The same React build is configured for Capacitor. After installing Android Studio and/or Xcode, run `cd frontend`, `npx cap add android` and/or `npx cap add ios` once, then `npm run cap:android` or `npm run cap:ios`. Capacitor packages the web client while sharing the FastAPI and Supabase services with the website. Device builds must use HTTPS API URLs; `localhost` points to the phone, not your computer.

## Security notes
- Service-role key lives only in the Python server. Browser uses the anon key + Row Level Security.
- Prices, totals and wallet debit are computed inside the database function `place_order`, never trusted from the client.
- Wallet credits are idempotent (unique payment id), so verify + webhook can't double-credit.
- QR contains an HMAC signature, so a made-up code fails at the scan endpoint.
