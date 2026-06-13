# Cafe POS — Final Schema-Aligned Implementation Prompts (for IDE agent)

Schema is already finalized (Prisma/SQLite, string-based statuses, no enums). Run this additive
migration FIRST, before any session work begins:

```prisma
model Order {
  sessionId      String?
  session        Session?  @relation(fields: [sessionId], references: [id])
  discountLabel  String?
  paymentMethod  String?
}

model OrderItem {
  discountLabel   String?
  sentToKitchenAt DateTime?
}

model Session {
  openingCash   Float    @default(0)
  closingCash   Float?
  status        String   @default("OPEN")
  orders        Order[]
}

model Booking {
  id         String    @id @default(uuid())
  customerId String?
  customer   Customer? @relation(fields: [customerId], references: [id])
  tableId    String?
  table      Table?    @relation(fields: [tableId], references: [id])
  datetime   DateTime
  status     String    @default("PENDING")
}
```
Also add `bookings Booking[]` to Customer and Table. Run `prisma migrate dev --name align-schema`.

**String value conventions (no enums — use these exact strings):**
- `Order.status`: `"DRAFT" | "ACTIVE" | "PAID" | "CANCELLED"`
- `KitchenTicket.status`: `"TO_COOK" | "PREPARING" | "COMPLETED"`
- `Session.status`: `"OPEN" | "CLOSED"`
- `Table.status`: `"AVAILABLE" | "OCCUPIED"`
- `Coupon.type` / `Promotion.type`: `"PERCENT" | "FIXED"`
- `Promotion.scope`: `"PRODUCT" | "ORDER"`
- `User.role`: `"ADMIN" | "EMPLOYEE"`
- `PaymentMethod.type`: `"CASH" | "CARD" | "UPI"`
- `Order.paymentMethod`: `"CASH" | "CARD" | "UPI"`

**Totals order (discount before tax):** `subtotal → product discounts → order discount → tax → total`

**Re-send to kitchen rule:** `OrderItem.sentToKitchenAt` nullable. Sending only picks up items
where this is null, then stamps them. New items go onto the *existing* KitchenTicket as
additional lines, not a new ticket.

**Coupon vs Promotion stacking rule:** if `Order.couponId` is set, ignore order-level (scope="ORDER")
Promotions for that order — coupon wins. Product-level (scope="PRODUCT") Promotions always apply
regardless. Comment this in `order.totals.ts`.

**Payment:** single method only (`Order.paymentMethod` one of CASH/CARD/UPI). No split payments.

---

## Session 1 (~6hrs) — Auth, Skeletons, Pipes

### Prompt — A (Auth + Session gate)
```
Implement Auth Service using the existing User model (fields: name, email, password_hash, role):
  POST /auth/signup {name, email, password} → bcrypt-hash password into password_hash,
    role defaults to "EMPLOYEE", return JWT {userId, role}
  POST /auth/login {email, password} → verify, return JWT {userId, role}
  Add auth middleware: verify JWT, attach req.user = {userId, role}
  Add role middleware: requireRole("ADMIN") — returns 403 if req.user.role !== "ADMIN"

Build /login and /signup pages (Next.js, src/app/(auth)/):
- Two-column layout. Login: Email/Username, Password (eye icon to toggle visibility), "Login"
  button, "Sign Up here" link → /signup.
- Signup: Name, Email/Username, Password (eye toggle), "Sign Up" button, "Login" link → /login.
- Store JWT (httpOnly cookie or localStorage — pick cookie for simplicity with Next middleware).

On successful login:
  GET /sessions/current → returns Session where status="OPEN", or null
  - if a Session is returned → router.push('/pos')
  - else → show a "Session Open" modal: openingCash number input, "Open Session" button →
    POST /sessions/open {employeeId: userId, openingCash} (creates Session with
    status="OPEN", openedAt=now) → then router.push('/pos')
Do NOT build /sessions/open route logic yet beyond a stub that returns 501 — full Session CRUD
is Session 2 Prompt A. For now just call it; if it 501s, push to /pos anyway so B/C aren't blocked.
```

### Prompt — B (POS shell)
```
Build src/app/(pos)/pos/page.tsx — three-column layout:
- Top bar: Logo, search <input>, cashier icon button, compass/orders icon button, new-order
  icon button, table-count badge (e.g. "12 ⊽" — clickable, routes to /pos/tables), profile
  icon, hamburger menu icon (opens dropdown: Products, Category, Payment method,
  Coupon & Promotion, Booking, User/Employee, KDS, Reports, Log-Out).
- Left/Product column: category pill tabs (horizontal scroll), product cards below in a grid
  — each card shows name + price + a small colored dot (color sourced from category.color).
- Center/Cart column: list of cart line items — each shows product name, qty stepper (-/+),
  "₹{unitPrice} each" subtext, line total on the right. Below the list: action row with three
  buttons — "Customer" (person icon), "Discount" (% icon), "Send" (mail icon, for receipt
  email — separate from "Send to Kitchen"). Below that: order summary block —
  Sub total / Tax(GST 5%) / [Discount — conditional, hidden for now] / Total.
  Also include a full-width "Send to Kitchen" button above the action row.
- Right/Payment column: three buttons — Cash, UPI, Card (selected one shows an X to deselect).
  Below: "Amount" label + total value + selected-method sublabel. Below that: a reusable
  <NumPad /> component (digits 1-9, 0, +/-, X/clear, and three labeled keys: "Prices",
  "Disc.", "Qty") with an onKeyPress(key: string) prop — wire the prop but logic is TBD
  (Session 3).

Use a local mock array for products/categories/cart for now (hardcode 6-8 items across 2-3
categories with distinct hex colors). Build cartStore.ts (zustand) with addItem/updateQty/
removeItem/clear actions operating on the mock data — this store gets rewired to real API
calls in Session 2.
```

### Prompt — C (Sockets + KDS shell)
```
Backend: install socket.io, create src/socket/index.ts — initialize Socket.io on the same HTTP
server as Express. Define rooms: 'kds' (joined by KDS clients) and 'session:{sessionId}'
(joined by POS clients for their active session). Export an `io` instance and helper
`emitToKds(event, payload)` / `emitToSession(sessionId, event, payload)`.

Frontend: src/lib/socket.ts — singleton socket.io-client instance, connect on app load,
export `joinKdsRoom()` and `joinSessionRoom(sessionId)` helpers.

Build src/app/(pos)/kds/page.tsx (standalone layout, no shared sidebar):
- Top bar: Logo, "KDS" text, cashier/orders/new-order icon buttons, profile icon, hamburger
  menu (same dropdown list as POS).
- Below top bar: tab row — "All [N]" | "To Cook [N]" | "Preparing [N]" | "Completed [N]" (N =
  counts, hardcode 0s for now) + a search <input> on the right + pagination control "1-3 < >".
- Left sidebar (fixed width): "Product" section with a filter list (checkbox or highlight-on-
  click items — hardcode: Burger, Pizza, Coffee, Water) and "Category" section similarly
  (hardcode: Desert, Quick Bites, Drink). Include a "Clear Filter" link/button at top of sidebar.
- Main area: horizontal-scroll row of ticket cards. Each card: header "#{orderNumber}", then a
  list of "{qty} x {productName}" lines — support a `completed: boolean` per line that renders
  with strikethrough CSS.

On mount, joinKdsRoom(). Backend: write a temporary script/endpoint
(POST /debug/emit-dummy-ticket) that calls emitToKds('kitchen_ticket_created', {dummy ticket
payload}). Call it via curl/Postman, confirm the KDS page renders the new card without a page
refresh. Document the KDS route (e.g. http://localhost:3000/kds) in README for second-screen
demo use, then remove the debug endpoint before Session 4.
```

---

## Session 2 (~6hrs) — Sessions, Admin CRUD, Order Creation, Real-time Tables

### Prompt — A
```
1. Session Management (model already has: employeeId, openedAt, closedAt, openingCash,
   closingCash, status):
   POST /sessions/open {employeeId, openingCash} → create Session, status="OPEN"
   POST /sessions/:id/close {closingCash} → status="CLOSED", closedAt=now()
   GET /sessions/current → Session.findFirst({status:"OPEN"}) or null
   GET /sessions/last → Session.findFirst({status:"CLOSED"}, orderBy closedAt desc)
   (Implement these for real now — Session 1's auth flow already calls /sessions/open.)

2. Floors/Tables CRUD:
   GET/POST /floors, GET/POST/PATCH/DELETE /tables {number, seats, floorId}
   Table.status is derived/managed by order-creation logic (Session 2C), not directly editable
   via this CRUD — admin CRUD only manages number/seats/floor assignment.
   Build src/app/(pos)/pos/tables/page.tsx: grid of numbered table cards (render Table.number
   1-16 or however many seeded), each card shows number + seats. Status styling wired in 2C.

3. Employees (/employees, src/app/(dashboard)/employees/):
   GET /users, PATCH /users/:id {role} (toggle User<->Employee via role field — note: schema
   role is "ADMIN"|"EMPLOYEE"; map UI label "User"→ADMIN, "Employee"→EMPLOYEE), 
   PATCH /users/:id/password {newPassword} → re-hash.
   No "archive" field exists on User — add a `disabled Boolean @default(false)` column to User
   in this session's migration if you want Archive/Disable to function; otherwise treat as UI-
   only toggle with a TODO.
   UI: table — Name | Type (dropdown: User/Employee, bound to role) | Status (Active/Disable
   badge, bound to `disabled`). Row checkbox reveals action menu: Delete (DELETE /users/:id) /
   Archived (PATCH disabled=true) / Change Password (modal: "Change password for {name}",
   password input, "Enter" button → PATCH /users/:id/password).

4. Customers (/customers): full CRUD on existing Customer model {name, email, phone}.
   UI: search input + list of customer cards (Name, email icon+email, phone icon+phone, 3-dot
   menu). 3-dot → "Edit" opens inline popup form (Name/Email/Phone editable, "Discard"/"Save"
   buttons, red "DELETE" button). "New" button at top adds a blank card in edit mode.

5. Payment Methods (/payment-methods): full CRUD on existing PaymentMethod model {type,
   enabled, upiId}.
   UI: table — Type (dropdown Cash/Card/UPI) | Id (shows upiId if type=UPI) | Activate
   (checkbox bound to enabled) | delete icon. "New" row. If type=UPI, show an additional
   "UPI ID" text input + a "QR Preview" box — use the `qrcode` npm package to render a live
   QR code (data URL) from the typed UPI ID, updating on each keystroke (debounce ~300ms).
```

### Prompt — B
```
Order Service (backend):
  POST /orders {tableId, sessionId, employeeId} → create Order with status="DRAFT",
    subtotal=0, tax=0, discount=0, total=0
  PATCH /orders/:id/items {productId, qty} →
    - if qty=0 or item not present and qty<=0 → no-op/error
    - upsert OrderItem (orderId, productId): if exists update qty & lineTotal=qty*unitPrice,
      else create with unitPrice=Product.price, lineTotal=qty*unitPrice
    - if qty becomes 0, delete the OrderItem
    - call recalculateOrderTotals(orderId), return full updated Order with items
  GET /orders/:id → Order with items[] + product details joined
  GET /orders → query params: status, customerId, tableId, dateFrom, dateTo, sessionId, page,
    limit (default 20) — return {data, total, page, limit}

src/modules/orders/order.totals.ts — recalculateOrderTotals(orderId):
  1. fetch order + items + products
  2. subtotal = sum(item.lineTotal)
  3. [Session 3 will extend step 3-4 with promotion/coupon logic — for now, discount=0]
  4. tax = round((subtotal - discount) * 0.05, 2)   // GST 5%, discount applied before tax
  5. total = subtotal - discount + tax
  6. Order.update({subtotal, tax, discount, total})
  Export this function — Session 3 imports and extends it.

Frontend: rewire cartStore.ts to call real API:
  - on /pos mount (no ?orderId yet — that's 2C), addItem/updateQty/removeItem call
    PATCH /orders/:id/items and update local state from the response (subtotal/tax/total come
    from API, never computed client-side)
  - replace mock product list with GET /products (build minimal product list endpoint if A
    hasn't shipped it yet — coordinate)
  - category tabs filter the product grid client-side by categoryId; product card dot color =
    category.color
```

### Prompt — C
```
Backend: on POST /orders success, after creating the order, set Table.status="OCCUPIED" for
that tableId, then emitToSession(sessionId, 'table_occupied', {tableId}).
On payment completion (Session 3 will call this), set Table.status="AVAILABLE" and emit
'table_available'.

/pos/tables/page.tsx (build out from Session 1C... wait, this is the Session 2 version of the
tables page — if 1C didn't exist, build now):
  - GET /tables (with floor grouping if multiple floors seeded) → render numbered grid
  - card styling: status="OCCUPIED" → highlighted/red border, status="AVAILABLE" → default
  - on card click:
    - GET /orders?tableId={id}&status=DRAFT,ACTIVE&limit=1
    - if found → router.push(`/pos?orderId=${found.id}`)
    - else → POST /orders {tableId, sessionId, employeeId} (sessionId/employeeId from
      current session context, e.g. a React context populated after login) →
      router.push(`/pos?orderId=${newOrder.id}`)
  - on mount, joinSessionRoom(sessionId); listen for 'table_occupied'/'table_available' and
    update the corresponding table card's status in local state without refetching all tables

/pos/page.tsx: read `orderId` from useSearchParams(). If present:
  - GET /orders/:id on mount, populate cartStore from order.items (map each OrderItem →
    cart line: productId, name, qty, unitPrice, lineTotal, discountLabel,
    sentToKitchenAlready = !!item.sentToKitchenAt — store this flag, it's needed in Session 3)
  - if absent, cart starts empty and the page is in a "no active order" state — disable
    Send/Discount/Payment actions until an order exists (or auto-redirect to /pos/tables)
```

---

## Session 3 (~6hrs) — Discounts, Payment, Kitchen Flow, Re-send

### Prompt — A
```
Coupon & Promotion module (src/app/(dashboard)/coupons-promotions/, menu label
"Coupon & Promotion"):

Backend CRUD:
  GET/POST/PATCH/DELETE /coupons {code, type, value, active}
  GET/POST/PATCH/DELETE /promotions {scope, type, value, minQty, minAmount, active, productId}
  GET /coupons/active → Coupon.findMany({active:true})
  GET /promotions/active → Promotion.findMany({active:true})

UI — List view: single table merging both, columns: Promotions Name | Type ("Coupon" if from
Coupon model, "Automated Promo" if from Promotion model) | Active programs (just show "1" per
row, or omit if ambiguous) | Activate (toggle bound to active/enabled) | delete icon.
Note: Coupon model has no "name" field — use `code` as the display name for Coupon rows.
"New" button opens create form.

Create form — two toggles control which fields show:
  Apply: [Order ⊽ / Product]   (maps to Promotion.scope, irrelevant if Type=Coupon)
  Type:  [Coupon ⊽ / Promotion] (determines whether you're creating a Coupon or Promotion row)
- Promotion Name field: for Coupon rows, write this value into `code` (uppercase, no spaces);
  for Promotion rows, this is just a UI label — Promotion model has no name field, so either
  add a `name String?` column to Promotion in this session's migration, or skip storing it
  and derive a display name from scope+value (e.g. "20% off orders over ₹500").
- Type=Coupon → show "Coupon Code" text field (same as code, can auto-derive from name)
- Type=Promotion + Apply=Product → show "Min Qty" → Promotion.minQty, requires productId
  (add a product picker dropdown)
- Type=Promotion + Apply=Order → show "Order Amount" → Promotion.minAmount
- Always: "Redeem Discount" value + unit dropdown (%/₹) → Promotion.value / Coupon.value +
  Promotion.type / Coupon.type ("PERCENT"|"FIXED")

Extend order.totals.ts recalculateOrderTotals(orderId) — insert as step 3:
  3a. Product-level promotions: for each OrderItem, find active Promotion where
      scope="PRODUCT" AND productId=item.productId AND item.qty >= minQty. If found:
        if type="PERCENT" → itemDiscount = item.lineTotal * (value/100)
        if type="FIXED"   → itemDiscount = value
        item.lineTotal -= itemDiscount
        item.discountLabel = type==="PERCENT" ? `${value}% off on ₹${originalLineTotal}` :
          `₹${value} off`
        save OrderItem
  3b. recompute subtotal = sum(item.lineTotal) after 3a
  3c. Order-level discount:
      - if Order.couponId is set → fetch Coupon, compute orderDiscount from
        Coupon.type/value against subtotal; discountLabel = `- ₹${amount}(${value}%)` or
        `- ₹${value}`
      - else if Order.couponId is null → check active Promotion where scope="ORDER" AND
        subtotal >= minAmount (pick highest-value match if multiple); compute orderDiscount
        similarly
      - else discount=0, discountLabel=null
      Order.discount = orderDiscount, Order.discountLabel = discountLabel
  (steps 4-5 unchanged: tax = (subtotal-discount)*0.05, total = subtotal-discount+tax)
```

### Prompt — B
```
Discount popup ("Discount" action in /pos cart):
  GET /coupons/active on open. Modal "Coupon Code":
  - text <input> "Enter Coupon Code"
  - if coupons.length > 1, render each as a radio: `○ {value}% Discount` (or `○ ₹{value} off`
    for FIXED) — clicking a radio fills the text input with that coupon's code
  - "Enter" button → find matching Coupon by typed code among active coupons; if found,
    PATCH /orders/:id {couponId: coupon.id} then call/trigger recalculateOrderTotals (either
    have the PATCH endpoint call it server-side, or a follow-up call) → refresh cart from
    response. If no match, show inline error "Invalid coupon code".

Cart discount rendering — two distinct UI locations:
  - Product-level: for any OrderItem with discountLabel set, render a highlighted sub-row
    immediately below that item's main row, showing `item.discountLabel` text.
  - Order-level: in the summary block, if Order.discountLabel is set, render a row between
    "Tax(GST 5%)" and "Total": label "Discount", value `Order.discountLabel`.

Payment Modal (triggered by selecting Cash/UPI/Card in the right column, then a "Pay"/confirm
action — add a "Pay" button below the NumPad if not already present):
  - Cash: "Received Amount" number input; live-compute
    changeDue = receivedAmount - Order.total, display "Change Due: ₹{changeDue}" (clamp to 0
    if negative, show validation message "Insufficient amount" if receivedAmount < total and
    disable Confirm).
  - Card: "Transaction Reference" text input (required, non-empty to enable Confirm).
  - UPI: GET enabled PaymentMethod where type="UPI" → render its QR (regenerate via qrcode
    from upiId + amount, e.g. UPI deep-link format `upi://pay?pa={upiId}&am={total}`), show
    Order.total below QR, "Confirm" and "Cancel" buttons.
  On Confirm (any method):
    PATCH /orders/:id {status: "PAID", paymentMethod: "CASH"|"CARD"|"UPI"}
    → backend: set Table.status="AVAILABLE" for order.tableId, emitToSession(sessionId,
      'payment_completed', {orderId}) and 'table_available' {tableId}
    → frontend: close modal, /pos/tables listener (built in 2C) flips the table back to
      available

"Customer" action (cart action row): opens popup —
  GET /customers?search={query} (add search support to Customer GET if not present) → list
  with same card UI as /customers page (Name/email/phone/3-dot Edit). Selecting a customer:
  PATCH /orders/:id {customerId} → refresh order. "New" creates inline then auto-selects.
```

### Prompt — C
```
"Send to Kitchen" button (full-width button in /pos cart, built in Session 1B):
  POST /kds/tickets {orderId}:
    1. unsent = OrderItem.findMany({orderId, sentToKitchenAt: null})
    2. if unsent.length === 0 → return 400 {message: "Nothing new to send"}
    3. existingTicket = KitchenTicket.findFirst({orderId})
    4. if !existingTicket:
         ticket = KitchenTicket.create({orderId, status:"TO_COOK"})
         emitToKds('kitchen_ticket_created', {ticketId: ticket.id, orderId, items: [...]})
       else:
         ticket = existingTicket
         emitToKds('kitchen_ticket_updated', {ticketId: ticket.id, orderId, newItems: [...]})
    5. for each item in unsent:
         KitchenTicketItem.create({ticketId: ticket.id, orderItemId: item.id,
           completed: false})
         OrderItem.update({id: item.id, sentToKitchenAt: now()})
    6. if Order.status === "DRAFT" → Order.update({status: "ACTIVE"})
    7. return updated ticket

  Frontend: clicking "Send to Kitchen" calls this endpoint, then refreshes the order (to get
  updated sentToKitchenAt flags so re-sent items don't duplicate on a second click), shows a
  toast "Sent to kitchen" or the 400 error message if nothing new.

/kds page (built in Session 1C):
  on 'kitchen_ticket_created' → fetch ticket details (GET /kds/tickets/:id with items+product
  names+qty) → prepend new card "#{order.id or a short orderNumber}" with item lines
  on 'kitchen_ticket_updated' → fetch the same, find existing card by ticketId, append new
  item lines to it (don't create a new card)

  Click on ticket card body (not an item line):
    PATCH /kds/tickets/:id/advance → status TO_COOK→PREPARING→PREPARING→COMPLETED (no-op if
    already COMPLETED) → emitToKds('ticket_preparing' | 'ticket_completed', {ticketId,
    newStatus}) → frontend updates that card's status, recompute tab counts (All/To
    Cook/Preparing/Completed) from current ticket list

  Click on individual item line:
    PATCH /kds/tickets/:id/items/:itemId {completed: true} → KitchenTicketItem.update →
    emitToKds('ticket_item_completed', {ticketId, itemId}) → frontend renders that line with
    strikethrough, ticket card stays in its current column/status

  Wire left sidebar Product/Category filters (multi-select, "Clear Filter" resets) and top
  tabs (All/To Cook/Preparing/Completed) to filter the in-memory ticket list client-side:
    - tab filter: ticket.status === selected tab (or all if "All")
    - product/category filter: ticket has at least one item whose product matches selected
      filters
  Update tab count badges to reflect filtered or unfiltered totals (use unfiltered totals —
  counts should reflect overall kitchen load, not the current filter view).
```

### Prompt — Integration (end of Session 3, whoever's free)
```
Write backend/prisma/seed.ts (or src/db/seed.ts per your structure):
  - 5 Categories with distinct colors (hex)
  - 20 Products distributed across categories, varied prices/tax
  - 2 Floors, 10 Tables total across them
  - 3 Users: 1 ADMIN ("Admin", admin@cafe.com), 2 EMPLOYEE ("Eric", "Sara") — bcrypt-hashed
    passwords, e.g. "password123"
  - 10 Customers with name/email/phone
  - 3 Coupons (active=true): e.g. WELCOME20 (PERCENT,20), FLAT50 (FIXED,50), SUMMER30
    (PERCENT,30)
  - 2 Promotions scope="PRODUCT" (active=true, varied minQty 2-3, tied to specific seeded
    productIds, value 10-20% or fixed)
  - 2 Promotions scope="ORDER" (active=true, minAmount 500/1000, value 5-10% or fixed ₹)
  - 3 PaymentMethods: CASH (enabled), CARD (enabled), UPI (enabled, upiId="cafe@ybl")
Add `"seed": "ts-node prisma/seed.ts"` (or equivalent) to package.json. Run it now and confirm
via Prisma Studio or a quick query that all rows exist.
```

---

## Session 4 (~4-5hrs) — Orders, Reports, Receipt, Booking stub, Polish

### Prompt — A
```
Reports module (src/app/(dashboard)/reports/):
Backend reports.service.ts — accept query params: period ("today"|"week"|"month"|"custom"
with dateFrom/dateTo), userId, sessionId, productId. All queries filter Order where
status="PAID" and createdAt within range (and employeeId=userId / sessionId=sessionId /
items.some(productId) if provided):
  GET /reports/summary → {totalOrders, revenue, avgOrderValue, totalOrdersPctChange,
    revenuePctChange, avgOrderPctChange} (pctChange vs equivalent prior period)
  GET /reports/sales-trend → [{label: "9AM"|date, revenue, orderCount}] grouped by
    hour (if period=today) or day (otherwise)
  GET /reports/top-categories → [{category, revenuePct}] (pie chart data, % of total revenue)
  GET /reports/top-orders → top 10 Orders by total, with sessionId, tableId/POS label,
    createdAt, customer.name, employee.name, total
  GET /reports/top-products → [{productName, qty, revenue}] top 10 by revenue
  GET /reports/top-category-table → [{category, revenue}] top categories by revenue (table
    form, distinct from the pie chart)
  GET /reports/export?format=pdf|xls&...sameFilters → generate file (use a simple library;
    if time-constrained, return CSV with .xls extension as a stub — note this in code comment)

UI:
  - Filter row: removable pills "Select period [x]" (clicking opens a date-range picker for
    custom; default options Today/Week/Month), "User [x]" (dropdown of employees), "Session
    [x]" (dropdown of past sessions), "Product [x]" (dropdown/search of products) — each pill
    has an [x] to remove that filter. "Pdf/Xls" buttons trigger the export endpoint as a
    download.
  - Three metric cards: "Total order" (count, subtext "{pct}% Since last period", green/red by
    sign), "Revenue" (₹ value, same pct subtext), "Average Order" (₹ value, same pct subtext).
  - "Sales" line chart (use recharts) — x-axis from sales-trend labels, y-axis revenue.
  - "Top selling Category" pie chart (recharts) with legend showing category name + percentage.
  - "Top Orders" table: Order(id) | Session | Point of Sale (table number) | Date | Customer |
    Employee | Total.
  - Two side-by-side tables: "Top Product" (Name|Qty|Revenue) and "Top Category"
    (Category|Revenue).
```

### Prompt — B
```
/orders page (src/app/(dashboard)/orders/):
  GET /orders?search={query}&page={n} — backend: search should match against Order.id
  (partial), Customer.name (partial, case-insensitive), or createdAt (date string match).
  UI: search <input>, table — Date | Order (id, styled as link/blue) | Customer | Amount |
  Status badge. Status badge styling: DRAFT="Draft" (gray), ACTIVE="In Progress" (yellow),
  PAID="Paid" (green/brown per mockup), CANCELLED="Cancelled" (red, strikethrough row).

/orders/[id]/page.tsx:
  GET /orders/:id → card: "Order #{id}", Date (createdAt), Customer (name or "—"), Amount
  (total), Status badge, Products (list: "{qty} x {productName} — ₹{lineTotal}", show
  discountLabel sub-text if present).
  - status="DRAFT" → show red full-width "Delete" button → PATCH /orders/:id
    {status:"CANCELLED"} then router.push('/orders')
  - status="DRAFT" OR "ACTIVE" → show "Edit Order" button → router.push(`/pos?orderId=${id}`)
    (confirm in testing: this loads the SAME order, no duplicate Order row is created — Session
    2C's /pos logic already handles this via the orderId param)
  - status="PAID" → view-only, show "Print Receipt" button only
  - status="CANCELLED" → view-only, no action buttons

Print Receipt: build a <Receipt /> component with @media print CSS (hide nav/header, single
column, monospace-ish font, show order id/date/customer/items/totals/payment method) —
trigger via window.print() from a "Print Receipt" button, rendered in a way that only the
receipt component is visible when printing (use a print-only wrapper div with
`@media print { .no-print { display: none } }`).
```

### Prompt — C
```
Receipt email popup ("Send" action in /pos cart, separate from "Send to Kitchen"):
  Modal "Reciept send via Email": Email <input> (prefilled with Order.customer.email if a
  customer is assigned, else empty placeholder "admin@example.com"), send-arrow icon button.
  POST /orders/:id/send-receipt {email}:
    - build receipt content (items, totals, date) as plain text or simple HTML
    - if SMTP env vars not configured → console.log the receipt content + recipient,
      return {sent: false, simulated: true}
    - else → nodemailer.sendMail(...) → return {sent: true}
  Frontend: show toast "Receipt sent" or "Receipt logged (email not configured)" based on
  response.

Booking stub (src/app/(dashboard)/booking/page.tsx): add "Booking" to the hamburger menu
dropdown list, positioned between "Coupon & Promotion" and "User/Employee" (update the shared
menu component used by /pos, /kds, and all dashboard pages — single source of truth for menu
order). Page content: GET /bookings → simple table (Date/Time | Customer | Table | Status), "New
Booking" form (Customer dropdown, Table dropdown, datetime picker) → POST /bookings. Minimal —
do not build edit/cancel flows unless time remains.

Session UI (src/app/(dashboard)/session/page.tsx or integrate into a header widget):
  GET /sessions/last → display "Last session: {closedAt}", "Last closing amount: ₹{closingCash}"
  GET /sessions/current → if OPEN, show "Close Session" button:
    - on click, GET aggregate {count, sum(total)} for Order where sessionId=current.id AND
      status="PAID" → show modal "Closing Summary: {count} orders, ₹{sum} revenue" +
      closingCash input → POST /sessions/:id/close {closingCash}
  if no current session, show "Open Session" button (reuses Session 1A's flow)

Float for integration bugfixing in final hours. Priority bug-check order: (1) re-send to
kitchen doesn't duplicate, (2) Edit Order from /orders doesn't create a duplicate Order, (3)
table status sync across two tabs, (4) discount calc order (discount-before-tax) matches
manually-computed expected values.
```

---

## Structured Review Checklist

### After Session 1
- `SELECT * FROM User;` → password_hash is bcrypt, not plaintext
- Login: wrong password / wrong email / success all behave correctly
- JWT on jwt.io decodes to `{userId, role}`
- EMPLOYEE token → protected ADMIN route → 403
- `/pos` renders 3 columns + NumPad keys all present (no logic required)
- Two tabs: `/kds` + `/pos`, trigger dummy socket emit → ticket card appears on `/kds` with no refresh

### After Session 2
- Login with no OPEN session → Session Open modal appears, openingCash stored on new Session row
- `POST /orders` → check `tableId`, `sessionId`, `employeeId` all populated in DB
- Add cart item → `Order.subtotal/tax/total` in DB === values shown in UI
- Browser A clicks Table 5 → Browser B's `/pos/tables` flips Table 5 to OCCUPIED within ~1s
- Type a UPI ID in Payment Method form → QR image updates live (no submit needed)

### After Session 3 — most critical
- Product promotion (minQty=3, 20%): cart at qty=2 → no discountLabel on item; qty=3 → sub-row
  "20% off on ₹X" appears, `OrderItem.lineTotal` reduced in DB
- Order promotion (minAmount=500): subtotal ₹400 → `Order.discount=0`; ₹600 → `Order.discount`
  set, summary shows "Discount" row, `total` recomputed with discount-before-tax
- Apply coupon `WELCOME20` → `Order.couponId` set in DB, total recalculated; if an order-level
  Promotion was also eligible, confirm coupon took precedence (per stacking rule)
- Send to Kitchen with 2 items → `KitchenTicket` + 2 `KitchenTicketItem` rows created, both
  `OrderItem.sentToKitchenAt` stamped
- Add a 3rd item, Send to Kitchen again → NEW `KitchenTicketItem` added to the SAME
  `KitchenTicket` (verify `ticketId` matches), `/kds` card shows 3rd line appended to existing
  card (not a new card)
- Click item line on `/kds` → strikethrough only that line, `KitchenTicketItem.completed=true`,
  ticket status unchanged
- Click ticket card → status TO_COOK→PREPARING, tab counts update; click again →
  PREPARING→COMPLETED
- Cash payment: receivedAmount < total → Confirm disabled + validation message; receivedAmount
  > total → correct change shown
- UPI/Cash/Card confirm → `Order.status="PAID"`, `Order.paymentMethod` set, `Table.status`
  flips to AVAILABLE, second tab on `/pos/tables` reflects it

### After Session 4
- Seed 10 PAID orders (or use real test data from Session 3) → Reports revenue card matches
  `SELECT SUM(total) FROM Order WHERE status='PAID';`
- Change period filter Today→Week → chart/table data actually changes (not just visual state)
- `/orders` search: partial customer name, exact order id, date string — all return correct
  matches
- Open a DRAFT order, click "Edit Order" → lands on `/pos?orderId=X`, modify qty, totals
  update → confirm `SELECT COUNT(*) FROM Order WHERE id='X'` is still 1 (no duplicate)
- PAID order detail page → no Delete/Edit buttons visible; Print Receipt opens print preview
  with no nav chrome, fits one page
- Hamburger menu order on every page: Products, Category, Payment method, Coupon & Promotion,
  Booking, User/Employee, KDS, Reports, Log-Out

---

## Final Demo Script (rehearse once before presenting)
```
Login → Session Open modal → Open Session
Select Table → /pos loads with orderId
Add Products (trigger product-level promotion by reaching minQty)
Apply Coupon (order-level discount appears)
Send to Kitchen → second screen /kds shows ticket
Add one more item → Send to Kitchen again → item appended to same ticket
Advance ticket through To Cook → Preparing → Completed
Pay via UPI (QR shown) → table flips to available
Send receipt email (toast confirms)
Check /orders → new PAID order visible
Check /reports → revenue/metrics updated
Close Session → closing summary shown
```

## Out of Scope / Decisions Locked In
- Split payments: not supported, single `Order.paymentMethod`
- Coupon + order-level Promotion: never stack — coupon wins if both eligible
- Dashboard as separate page: NOT built — Reports is the sole analytics destination (confirmed)
- Promotion `startTime`/`endTime`/`daysOfWeek` fields: unused unless time-based promos become a
  stretch goal — leave null

## Cut List (in order if behind schedule)
Reports export (PDF/XLS, CSV stub acceptable) → email receipt (console.log stub acceptable) →
Booking module (keep menu entry + empty page) → order-level Promotions (keep Coupons only) →
Card payment (keep Cash + UPI) → multi-floor tables (single floor, fewer tables)