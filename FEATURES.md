# CampusBite – Full Feature Description

One platform for every food outlet, store and event stall on campus: order, pay from a wallet, track live, collect with a QR code.

## 1. Users and accounts (Supabase Auth)
| Role | Who | Sees |
|---|---|---|
| Customer | Students, faculty, outsiders, event team members | Menus, wallet, own orders |
| Staff | Shop manager / owner / employee | Only their outlet's queue and menu |
| Admin | Campus management | Everything, plus event mode and reports |

- Login by college email (students/faculty), phone OTP or email (outsiders), Google sign-in optional.
- Customer types drive rules: faculty/student pricing, outsider top-up limits, event team credits.
- Row Level Security keeps each shop's data private from other shops.

## 2. Outlets and menus
- All 13 permanent outlets in 5 locations: Gazebo (4), North Square (4), AB3 Amphitheatre, AB1, AB2, plus Aavin Centre and V Mart.
- Per item: price, category, veg/non-veg tag, photo, available/sold out.
- Multi-time menus for AB3 (breakfast / lunch / snacks / dinner shown by time of day).
- Search and filters: veg only, under ₹50, juices, open now.
- Open/closed switch per shop; staff toggle items sold out in one tap.

## 3. Wallet and payments (Razorpay)
- Top-up by UPI, card or netbanking. Server creates the Razorpay order, verifies the signature, then credits.
- Webhook backup credits the wallet even if the student closes the browser mid-payment.
- Instant wallet debit at checkout, so no cash or counter payment.
- Transaction history: top-ups, orders, refunds, admin credits.
- Event team wallets credited by admin, optionally restricted to event stalls.
- Refund to wallet when a shop cancels an order or item is out of stock.
- Low-balance nudge and quick top-up amounts (₹100 / 200 / 500).

## 4. Ordering
- Cart per outlet, quantities, special notes ("less spicy").
- Server-side validation: outlet open, items available, price from database.
- Pickup token (3 digits) plus signed QR code for every order.
- Reorder from history; favourites.

## 5. Live tracking (Supabase Realtime)
- Status: Placed → Preparing → Ready → Collected (Cancelled).
- The customer's screen updates the moment staff change status; no refresh.
- Push / browser notification on "Ready".
- Estimated wait time per outlet, based on the current queue.

## 6. QR collection
- Each order has a unique QR containing order id + HMAC signature.
- Staff scans it (phone camera or USB scanner): system checks signature, outlet, status "Ready", not already collected, then marks Collected.
- Blocks screenshots of old orders, other outlets' orders, forged codes and double collection.
- Fallback: staff types the 3-digit token.

## 7. Staff console
- Live queue sorted oldest-first, sound alert on new order.
- One-tap status buttons, scan-to-collect, cancel with reason.
- Menu management: prices, sold out, open/close.
- Daily summary: orders, revenue, best sellers, average prep time.
- "Now serving" display screen for the counter TV showing ready tokens.

## 8. Admin console
- **Event mode**: one switch closes all regular outlets for ordering and shows only event stalls.
- Register event stalls, assign staff, set stall menus.
- Credit / debit event team wallets, bulk credit from a CSV.
- Sales dashboard per outlet, per location, per day; peak hours; wallet float total.
- User management: assign roles, deactivate accounts.
- Audit log of wallet credits, refunds, price changes.
- Export CSV/Excel for accounts office.

## 9. Website and app
- Responsive website (works on any phone).
- Installable PWA (add to home screen, notifications) as the "app". Native Android/iOS later via Flutter/React Native on the same API.

## 10. Extra ideas (later phases)
- Pre-order for a pickup time slot (between classes); slot limits at peak hours.
- Loyalty points, coupons, combo offers, student meal plans.
- Ratings and feedback per outlet; complaint tickets.
- Tamil / Hindi / English interface.
- V Mart barcode billing and stock levels.
- Faculty monthly billing to payroll.
- Guardian view: parents top up a student's wallet.
- Fraud checks: velocity limits on top-ups, suspicious refunds.
- Analytics: forecast demand so canteens prep the right quantity.

## 11. What to show in the prototype demo (10 minutes)
1. Student logs in, tops up ₹200 with a Razorpay test payment; wallet updates.
2. Browses Gazebo / North Square / AB3, orders from Dakshin Chitra; wallet debits.
3. Order page shows token and QR, status "Placed".
4. Shop staff console: order arrives live; press Preparing, then Ready.
5. Student's phone flips to "Ready" instantly (Realtime).
6. Staff scans the QR: collected. Scan again: "Already collected". Scan a fake QR: rejected.
7. Admin turns on Event mode: regular outlets vanish; stalls appear. Credit ₹500 to an event team; they order from a stall.
8. Admin dashboard shows sales per outlet.

## 12. Architecture
Browser/PWA → FastAPI (Python) → Supabase (Postgres, Auth, Realtime) ; Razorpay ↔ FastAPI (create order, verify, webhook).
Reads and live updates go browser → Supabase directly under RLS; anything that moves money goes only through FastAPI and database functions.

## 13. Points to settle with management
- Wallet rules: refund policy, expiry, whether unused balance is refundable to bank (check with the institution's finance/legal team on prepaid-instrument regulations).
- Who settles with shops: weekly payout from the college account, with commission if any.
- GST invoicing per outlet.
- Data privacy for student data.
