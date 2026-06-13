Complete Frontend Implementation Prompt — Odoo Café POS

Project Context
You are building the complete frontend for a Restaurant Point-of-Sale web application called Odoo Café POS. The backend is already built using Node.js/Express with Prisma ORM and SQLite. Do not modify the backend. Connect every UI action to the existing REST API endpoints. The frontend uses React + Vite, React Router v6, Tailwind CSS, and Axios.

Global Theme & Design System
Apply these design tokens globally across every page and component:

Background: #1a1a1a
Card/Surface: #2a2a2a
Elevated Surface: #333333
Primary Accent: #c0392b (dark red — used for primary buttons, active states, logo bg)
Secondary Accent: #8b4513 (brownish — used for paid status, secondary buttons)
Success: #27ae60
Warning: #f39c12
Text Primary: #f0f0f0
Text Muted: #888888
Border: #444444
Font: handwritten/rounded feel — use 'Segoe UI' or similar, with slightly loose letter-spacing
All buttons have slightly rounded corners (border-radius: 6px)
Cards have subtle borders (1px solid #444)
All modals/popups have dark overlays with centered or anchored cards
Status badges: Draft = dark grey pill, Paid = brown/amber pill, Cancelled = red pill, Active = green pill, Disabled = grey pill


Authentication Context
Create AuthContext that stores: { user: { id, name, email, role }, token }. Persist to localStorage. On app load, rehydrate from storage. Expose login(), logout(), signup() methods. Every Axios request must attach Authorization: Bearer <token> header via an Axios interceptor. Create a PrivateRoute component that redirects to /login if no token exists.

Route Structure
/login
/signup
/pos                    → POS Order View (default after login)
/pos/orders             → Orders list
/pos/customers          → Customer management
/pos/table-view         → Table/floor view
/kds                    → Kitchen Display (standalone, no auth required header)
/backend/products
/backend/categories
/backend/payment-methods
/backend/promotions
/backend/users
/backend/reports

Page 1 — Login & Signup (/login, /signup)
Layout: Full dark page. Two side-by-side cards centered on screen. Left card = Login, Right card = Signup. Both cards have same dimensions, dark surface #2a2a2a, thin border.
Login Card:

Title "Login" in large light font
Email/Username input
Password input with eye icon toggle (show/hide)
"Login" button — full width, primary red accent
"Sign Up here" link below button — cyan/blue color, navigates to /signup

Signup Card:

Title "SignUp" in large light font
Name input
Email/Username input
Password input with eye icon toggle
"Sign Up" button — full width, primary red accent
"Login" link below — cyan/blue color, navigates to /login

Behavior:

Login calls POST /api/auth/login with { email, password }
Signup calls POST /api/auth/signup with { name, email, password }
On success: save token + user to AuthContext + localStorage, redirect to /pos
Show inline field-level validation errors in red below each input
Show API error as a banner above the form
No page reload


Page 2 — POS Shell Layout
This layout wraps /pos, /pos/orders, /pos/customers, /pos/table-view. It is the persistent navbar visible on all POS pages.
Top Navbar (left to right):

Logo button — red background square, text "Logo", clicking it goes to /pos
Product search bar — medium width input with search icon, searches products by name, results show as dropdown below
POS Order icon button (cash register icon)
Orders icon button (compass/target icon)
New Order icon button (plus-square icon)
Table View indicator — shows ⌂ [FloorName] [TableNumber] ✓ pulled from global POS state
Employee avatar icon button — shows current user initials
Hamburger menu button (three lines) — opens dropdown

Hamburger Dropdown (right-aligned):

Items: Products, Category, Payment Method, Coupon & Promotion, User/Employee, KDS, Reports, Log-Out. Each navigates to the corresponding /backend/* route except KDS goes to /kds and Log-Out calls logout() then redirects to /login.
Global POS State (POSContext):

Store: { currentTable, currentFloor, currentOrder, cartItems, selectedPaymentMethod, activeSession }. Expose actions: setTable(), addToCart(), updateQty(), removeFromCart(), clearCart(), applyDiscount(), setCustomer().

Page 3 — Floor Pop-up & Table Selection
Trigger: Appears automatically on first load of /pos if no table is selected, and when Table View icon is clicked.
Layout: Full-screen dark overlay with a centered modal card.
Inside Modal:

Title "Select Table"
Floor tabs across the top — one tab per floor fetched from GET /api/floors. Active tab highlighted in red accent.
Under each floor tab: grid of square table cards (4 columns). Each card shows table number (large) and seat count (small below).
Available tables: dark grey background #333
Tables with active orders (status = OCCUPIED or has a DRAFT order): red/amber tinted background with a colored dot indicator
Clicking a table sets it in POSContext, closes modal, navigates to /pos
Modal cannot be dismissed without selecting a table on first load

API calls:

GET /api/floors — fetch all floors with their tables
GET /api/orders?status=DRAFT — to determine which tables are occupied


Page 4 — Order View (/pos) — Three Column Layout
This is the primary POS screen divided into three equal-height columns filling the viewport below the navbar.

LEFT COLUMN — Products
Top: Category filter tabs in a horizontal scrollable row. Each tab is a rounded pill. Color of each pill matches the category color set in the backend. "All" tab shown first in neutral color. Active tab has white text and category color background.
Below tabs: Scrollable grid of product cards (3 per row). Each card:

Product name (top)
Price in ₹ (bottom)
Small colored dot for category
Green dot if available, red dot if unavailable (based on product status)
On click: add to cart or increment qty if already in cart

Product search in navbar also filters this grid in real time.
API: GET /api/products with optional ?category= filter, GET /api/categories

CENTER COLUMN — Cart
Header shows current table number.
Cart item list (scrollable):

Each row: Product Name | − [qty] + | Unit Price | Line Total
If a product-level promotion applies, show a small red badge below the item line: e.g. 30% off on ₹540
Remove item via long-press or a small × on the row

Order Summary (pinned at bottom of cart):

Subtotal: ₹xxx
Tax (GST X%): ₹xxx
Discount: −₹xxx (shown only if discount applied, in red)
Total: ₹xxx (large, bold)

Action buttons row (above summary):

👤 Customer — opens Customer panel
⊘ Discount — opens Discount/Coupon popup
📋 Send — opens receipt email popup

"Send to Kitchen" button — full width, dark surface with a refresh/send icon. Calls POST /api/kitchen/tickets.
API: Cart state managed locally in POSContext. Order created/updated via POST /api/orders and PATCH /api/orders/:id

RIGHT COLUMN — Payment
Top: Payment method buttons — one per enabled method fetched from GET /api/payment-methods?enabled=true. Each is a wide button with icon (cash icon for Cash, UPI icon for UPI, card icon for Card). Selected method is highlighted in red accent. Deselected methods are dark surface.
If UPI selected: show a red × button to deselect.
Below payment buttons: display "Amount" label and the total in large ₹ format with the method name below it.
Numpad (3×4 grid): digits 0–9, +/−, backspace (red). Also show: Prices, Disc., Qty mode buttons to the right of the numpad — these toggle what the numpad input affects.

Page 5 — Payment Completion Flows
Cash Flow:

When Cash selected and order total confirmed — show "Amount Received" input. Compute and display "Change Due: ₹xx" dynamically. Confirm button calls PATCH /api/orders/:id with { status: 'PAID', paymentMethod: 'CASH' }.
UPI Flow:

Generate QR code using a library like qrcode.react from the UPI ID stored in the payment method record. Show total amount. Show Confirmed button (calls PATCH to mark paid) and Cancel button.
Card Flow:

Show a Transaction Reference input. Confirm marks order paid.
After Payment:

Show Receipt Modal with: order number, date, table, items list, subtotal, tax, discount, total, payment method
Two buttons: Print (uses window.print()) and Send Email (opens small popup with email input pre-filled from linked customer email)
Send email calls POST /api/orders/:id/send-receipt
Clear cart, reset table status, return to floor popup


Page 6 — Discount / Coupon Popup
Triggered by Discount button in cart. Renders as a centered modal over the POS screen.
Layout:

Title "Coupon Code"
Text input: "Enter Coupon Code"
Enter button in red accent

On Enter:

Call POST /api/coupons/validate with { code, orderId }
If valid coupon: apply discount to cart via POSContext, show success state, close popup
If automated promotions are also eligible: show them as a radio button list below the input (e.g. "30% Discount", "25% Discount"). User selects one and clicks Enter to apply.
Invalid code: show red error text "Invalid or expired coupon code"
Applied discount appears as a line item in the cart summary


Page 7 — Orders Page (/pos/orders)
Layout: Full page below navbar.
Top bar: Title "Order" (left), search input (center) — filters by customer name, order number, or date.
Orders Table:

Columns: Date | Order Number (blue link) | Customer | Amount | Status badge
Fetch from GET /api/orders?sessionId=current
Status badges: Draft = grey pill, Paid = amber pill, Cancelled = red pill.
Order Detail View (opens on clicking order number):

Renders as a modal/slide-over panel showing:

Order #XXXXX
Date
Customer name
Amount in red ₹
Status badge
Products list with quantities

If Draft status:

Delete button (full width, red) — calls DELETE /api/orders/:id
Edit Order button (full width, amber) — loads order into POSContext cart, navigates to /pos

If Paid: view-only, no action buttons shown.

Page 8 — Customer Management Panel
Accessible from the Customer button in cart. Renders as a right-side slide-over panel.
Top: + New button (left), search input with search icon (right). Search calls GET /api/customers?search=
Customer List:

Each row shows: Name (left), email and phone with icons (center), three-dot menu (right).
Three-dot menu options: Edit
Edit opens an inline popup card:

Name input (placeholder: e.g Eric Smith)
Email input with mail icon
Phone input with phone icon
Discard button | Save button (calls PATCH /api/customers/:id)
DELETE button (full width red, calls DELETE /api/customers/:id)

New Customer form (same fields): calls POST /api/customers
Clicking a customer row (not the menu): links them to current order via PATCH /api/orders/:id with { customerId }. Customer name then appears in cart footer area.

Page 9 — Table View Page (/pos/table-view)
Same as Floor Pop-up but as a full page. Shows floor tabs and table grid. Available and occupied tables visually distinct. Clicking a table sets it as current and navigates to /pos.

Page 10 — Kitchen Display System (/kds)
This page opens at a fixed URL /kds and is intended for a separate browser tab or device. No auth header required in the navbar — show only Logo and a simple top bar.
Layout: Full dark page.
Top bar: Filter sidebar toggle, "All" tab, status tabs with counts: To Cook [7], Preparing [3], Completed [2]. Search bar. Pagination 1-3 < >.
Left Sidebar (filterable): Two sections:

Product list (Burger, Pizza, Coffee, Water etc.) — clicking filters tickets to those containing that product
Category list (Desert, Quick Bites, Drink) — clicking filters by category
"Clear Filter ×" button at top of sidebar

Main Area: Three-column kanban layout (To Cook | Preparing | Completed).
Each ticket card:

Order number as header (e.g. #2205)
List of items: 3 × Masala Tea, 3 × Lassi, 3 × Coffee, 3 × Water
Completed items shown with strikethrough text
Clicking the whole card: moves ticket to next stage (PATCH /api/kitchen/tickets/:id with next status)
Clicking an individual item line: marks that item completed, strikes through it (PATCH /api/kitchen/tickets/:id/items/:itemId)

Polling: Fetch GET /api/kitchen/tickets every 5 seconds to get new tickets in real time.

Page 11 — Backend Shell
All /backend/* pages share a layout with the same top navbar as POS shell (Logo, icons, hamburger). Below the navbar show a breadcrumb: e.g. Products > Category. The content area is a white-on-dark full-width container.

Page 12 — Products (/backend/products)
Top bar: New button (with + icon), asterisk action button (visible only when rows are selected — bulk action), search input ("Lassi OR Drink"), search icon.
Table columns: Checkbox | Name | Category (colored badge pill) | Prices | Tax
Fetch from GET /api/products
Clicking a row or New button navigates to the product create/edit form.
Product Form:

Product Name input
Category: tag-style multi input — type to search existing categories from GET /api/categories. If typed value not found, show "Create & Edit" option in dropdown that opens the Category mini-popup.
Prices input (₹)
Tax: fixed dropdown — 5%, 18%, 28%
Unit input
Product Description textarea
Save button

Category mini-popup (Create on the fly):

Modal with title "Category"
Product Name input
Color picker: row of colored circle radio buttons (green, red, purple, yellow, blue)
Save and Discard buttons
On Save: creates category via POST /api/categories and auto-selects it in the product form

API: POST /api/products, PATCH /api/products/:id, DELETE /api/products/:id

Page 13 — Categories (/backend/categories)
Top bar: New button.
Table: Two columns — Product Category (inline editable text) | Color (row of 5 colored circle radio buttons, one selectable) | Delete icon (trash).
Clicking New adds a blank row at the bottom with a text cursor in the name field.
Rows have a drag handle (::) on the left for reordering.
Color selection is inline — clicking a circle immediately sets that category's color.
Changes saved on blur via PATCH /api/categories/:id. Delete calls DELETE /api/categories/:id after confirmation.
API: GET /api/categories, POST /api/categories, PATCH /api/categories/:id, DELETE /api/categories/:id

Page 14 — Payment Methods (/backend/payment-methods)
Top bar: New button.
List view table: drag handle | Name | Type (dropdown: Cash/Card/UPI) | UPI ID (shown only if type=UPI) | Active checkbox toggle | Delete icon
Clicking a row opens a detail form below or as a separate view:
Detail Form:

Payment Method Name input
Type dropdown: Cash / Card / UPI
Active toggle checkbox
If type = UPI: show additional section with UPI ID text input and a live QR code preview generated dynamically from the UPI ID using qrcode.react. This section is completely hidden for Cash and Card types.

API: GET /api/payment-methods, POST /api/payment-methods, PATCH /api/payment-methods/:id, DELETE /api/payment-methods/:id

Page 15 — Coupon & Promotion (/backend/promotions)
Top bar: New button, search input.
List table: drag handle | Promotions Name | Type (Coupon / Automated Promo) | Active programme count | Activate toggle | Delete icon
Clicking a row or New opens the form.
Form — Coupon type:

Promotion Name
Type dropdown: Coupon / Promotion
If Coupon: show Coupon Code text input
Redeem: Discount value input + type toggle button (% or ₹)
Description

Form — Promotion (Automated) type:

Promotion Name
Type: Promotion
Apply dropdown: Product / Order
If Product: show Min Qty input. When min qty reached in cart, discount auto-applies.
If Order: show Order Amount input. When cart total exceeds it, discount auto-applies.
Redeem: Discount value + % or ₹ toggle
Description

API: GET /api/promotions, POST /api/promotions, PATCH /api/promotions/:id, DELETE /api/promotions/:id

Page 16 — User / Employee Management (/backend/users)
Top bar: New button, asterisk action button (visible on row selection), search input.
Table: Checkbox | Avatar icon | Name | Type dropdown (User / Employee) | Status badge (Active green / Disabled grey) | > chevron
Clicking > or selecting rows + action button shows action menu: Delete, Archived, Change Password.
Change Password Modal:

Title: "Change Password for [Name]"
Single password input: "new password enter here"
Enter button

New User Form:

Name, Email, Password inputs
Role dropdown: User / Employee

API: GET /api/users, POST /api/users, PATCH /api/users/:id, DELETE /api/users/:id, PATCH /api/users/:id/password, PATCH /api/users/:id/archive

Page 17 — Reports (/backend/reports)
Top filter bar:

"Select period" chip with date range picker (opens calendar popup). Options: Today, This Week, This Month, Custom.
User filter chip (dropdown of employees)
Session filter chip
Product filter chip
* more filters button
PDF and XLS export buttons (right side) — PDF calls GET /api/reports/export?format=pdf, XLS calls same with format=xls

All filters are dismissible chips with ×.
Summary Row (3 cards):

Total Orders: number + "% since last period" badge in green/red
Revenue: ₹ amount + comparison badge
Average Order Value: ₹ amount + comparison badge

Charts Row:

Left: Sales Trend — area/line chart (time on X axis, revenue on Y). Use Recharts.
Right: Top Categories — pie/donut chart with legend showing category names and percentages. Use Recharts.

Top Orders Table:

Columns: Order | Sessions | Point of Sale | Date | Customer | Employee | Total. Highlighted row = highest value order.
Bottom Tables (side by side):

Top Products: Product name | Qty | Revenue
Top Categories: Category name | Revenue

All charts and tables re-fetch and re-render when any filter chip changes.
API: GET /api/reports/summary, GET /api/reports/sales-trend, GET /api/reports/top-orders, GET /api/reports/top-products, GET /api/reports/top-categories

Cross-Cutting Implementation Rules
Axios Setup: Create /api/axios.js with baseURL from VITE_API_URL env variable. Add request interceptor to inject Bearer token. Add response interceptor — on 401 call logout() and redirect to /login.
Error Handling: Every API call wrapped in try/catch. Network errors show a toast notification (bottom-right, dark surface, red border). Form errors show inline below the relevant field.
Loading States: Every data-fetching component shows a skeleton loader or spinner while loading. Buttons show a spinner and disable during async operations.
Toast Notifications: Implement a global toast system (or use react-hot-toast). Show success toasts in green, error toasts in red, info toasts in neutral.
Responsive Behavior: POS screen is designed for tablet/desktop (minimum 1024px). Backend pages are similarly desktop-first. No mobile breakpoints required unless explicitly stated.
Empty States: Every list/table shows a centered "No records found" message with a faint icon when the API returns an empty array.
Confirmation Dialogs: Every destructive action (Delete, Archive) shows a small confirmation popup before calling the API.
Session Management: On login, call POST /api/sessions to create a new session and store sessionId in POSContext. On logout/close session, call PATCH /api/sessions/:id with { closedAt, closingAmount } and show a session summary modal before redirecting to login.
Real-time KDS: KDS page polls GET /api/kitchen/tickets every 5 seconds. Use setInterval in a useEffect with cleanup.
Category Colors: When fetching categories, use the stored color hex/name to dynamically apply background colors to category tabs, product card dots, and category badges throughout the app.
QR Code: Use qrcode.react package. For UPI, generate from the string upi://pay?pa=[upiId]&am=[amount]&cu=INR.