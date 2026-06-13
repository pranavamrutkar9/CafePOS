# Part 10: Deployment & Demo Prep

---

## 10.1 Deployment Options

### Important constraint: Custom Server (Socket.io)

Standard Vercel deployment does NOT support the custom `server.ts` with Socket.io in the same way — Vercel serverless functions don't maintain persistent WebSocket connections. Options:

**Option A — Railway / Render (Recommended for hackathon)**
Both support long-running Node processes out of the box — deploy `server.ts` as-is.

```bash
# Railway
railway login
railway init
railway up
```

Add environment variables in the Railway dashboard: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `RESEND_API_KEY`.

**Option B — Vercel + separate Socket.io service**
Deploy Next.js app (without custom server) to Vercel, and run a tiny separate Socket.io server (e.g., on Railway) that the frontend connects to via `NEXT_PUBLIC_SOCKET_URL`. More setup, but Vercel's DX is faster for the rest of the app. Only worth it if you're already deep into Vercel and out of time to switch.

**Option C — Run locally for demo (simplest, zero deploy risk)**
For a live hackathon demo, running on `localhost` (or your laptop's local IP so judges/teammates on the same network can hit the KDS from a tablet) avoids all deployment risk entirely. Use `ngrok` if you need a public URL temporarily:

```bash
ngrok http 3000
```

---

## 10.2 Database for Production

Use a hosted Postgres (Neon, Supabase, or Railway Postgres) — update `DATABASE_URL` and run:

```bash
npx prisma migrate deploy
npx prisma db seed
```

---

## 10.3 Pre-Demo Checklist

### Data Setup
- [ ] Seed script run with realistic product names, prices, categories with distinct colors
- [ ] At least 2 floors with 4-6 tables each
- [ ] All 3 payment methods enabled, UPI ID set to a real-looking value
- [ ] 1-2 coupons created (e.g., `WELCOME10` = 10% off)
- [ ] 1 product-quantity promotion (e.g., "Buy 3 Cappuccinos, 10% off")
- [ ] 1 order-amount promotion (e.g., "Orders over ₹500, ₹50 off")
- [ ] If demoing Feature 5: 1 time-window promo active during your demo slot
- [ ] Seed some historical PAID orders so Feature 1 (upsell) has data and Reports/Dashboard isn't empty

### Devices
- [ ] Laptop/tablet #1: POS Terminal (logged in as Employee)
- [ ] Laptop/tablet #2 or second browser window: Kitchen Display (`/kds`, no login)
- [ ] Both on same network if testing real-time locally

### Walkthrough Script (Suggested Demo Flow)

1. **Login as Admin** → show Dashboard with charts/tables (pre-populated from seed data)
2. **Quick backend tour:** Products (show inline category creation), Payment Methods (toggle UPI), Promotions (show the active happy-hour promo)
3. **Logout, login as Employee** → lands directly in POS, Floor Pop-up appears
4. **Select a table** → Order View loads
5. **Use Voice Order** (Feature 2) — speak an order, watch it populate the cart — biggest wow moment, do it early while energy is high
6. **Add another item manually** → show Upsell suggestion chip appear (Feature 1)
7. **Apply a coupon** → show discount line in summary; then try an invalid code to show the error state
8. **Send to Kitchen** → switch to KDS screen, show ticket appear in real-time in "To Cook"
9. **On KDS:** click an item to strikethrough it, then click the ticket to advance stages — show Predictive Load Meter updating (Feature 3)
10. **Back on POS:** process payment — show all three methods (Cash with change calc, UPI QR generation, Card with reference)
11. **Demonstrate offline mode** (Feature 4) — toggle network off in DevTools, add an item, send to kitchen, show "saved offline" message, toggle network back on, show it syncs
12. **Close session** → show closing summary
13. **Back to Dashboard** → show the new order reflected in reports after changing the filter

### Fallback Plans
- If voice recognition fails on stage (mic permissions, noise): have a pre-recorded screen capture as backup, or fall back to Approach A (keyword matching) which is more deterministic
- If Socket.io real-time breaks: have a "Refresh" button on KDS as a manual fallback so the demo doesn't stall
- If offline demo is risky on venue WiFi: pre-record this segment

---

## 10.4 Time Budget (Suggested, for a 24-36hr Hackathon)

| Phase | Hours | Parts |
|---|---|---|
| Setup, schema, auth | 3-4 | 1, 2, 3 |
| Backend admin modules | 4-5 | 4 |
| POS Terminal core | 5-6 | 5 |
| KDS + real-time | 3-4 | 6 |
| Orders/Customers/Payments | 3-4 | 7 |
| Reports & Dashboard | 2-3 | 8 |
| Standout features (5,3,4 minimum) | 4-6 | 9 |
| Polish, seed data, demo prep | 2-3 | 10 |
| **Buffer** | 2-3 | — |

If you're a team of 2-3, parallelize: one person on Parts 1-3 + 6 (infra/realtime), another on Parts 4-5 (admin + POS UI), another on Parts 7-9 (orders/payments/features) once the schema is locked.

---

## 10.5 Common Pitfalls

- **Socket.io not connecting in production:** ensure your hosting provider supports WebSockets (Railway/Render do; some serverless platforms don't)
- **Prisma `groupBy` with `_count`:** syntax is strict — double check against Prisma docs version you're using, it changed across major versions
- **UPI QR string format:** `upi://pay?pa=<id>&am=<amount>&cu=INR` is the minimal valid format most UPI apps recognize; test by scanning with an actual UPI app
- **Timezone issues in time-window promotions (Feature 5):** `Date.getHours()` uses server timezone — set `TZ` env var explicitly if deploying to a different region than your demo location
- **IndexedDB not available in private/incognito browsing** in some browsers — test the offline feature in a normal window

---

## You're Done

This completes the full build guide:

1. Setup & Architecture
2. Database Schema
3. Authentication
4. Backend Admin Modules
5. POS Terminal Core
6. Kitchen Display & Real-time
7. Orders, Customers, Payments & Receipts
8. Reports & Dashboard
9. Standout Features (all 5)
10. Deployment & Demo Prep

Good luck.
