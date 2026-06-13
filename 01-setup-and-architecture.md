# Odoo Cafe POS — Build Guide (Part 1: Setup & Architecture)

## Tech Stack

- **Framework:** Next.js 14+ (App Router, TypeScript)
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Auth:** NextAuth.js (credentials provider) or custom JWT
- **Real-time:** Socket.io (custom server) — powers the Kitchen Display
- **Styling:** Tailwind CSS + shadcn/ui
- **Charts:** Recharts
- **PDF/XLS export:** `pdfkit` / `exceljs`
- **QR code (UPI):** `qrcode` npm package
- **Email (receipts):** Resend or Nodemailer
- **State management:** Zustand (lightweight, good for POS cart state)
- **Voice (Feature #2):** Web Speech API (browser native, no backend needed for MVP)

> **If splitting frontend/backend:** Use this exact Prisma schema and route logic but expose it via Express REST routes instead of Next.js API routes. Frontend (Next.js) calls `process.env.NEXT_PUBLIC_API_URL`. Everything else in this guide stays identical — Part 2 (DB schema) and Part 5 (KDS realtime) are 100% portable.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Next.js App                          │
│                                                            │
│  /app                                                      │
│   ├── (auth)/login, /signup                               │
│   ├── (backend)/dashboard, products, categories,          │
│   │              payment-methods, coupons, floors,         │
│   │              users, reports                            │
│   ├── (pos)/pos/[tableId]   ← Order View                  │
│   ├── (pos)/orders                                         │
│   ├── (pos)/customers                                      │
│   ├── (pos)/table-view                                     │
│   ├── kds                  ← Kitchen Display (separate URL)│
│   └── api/...               ← All backend routes          │
│                                                            │
│  /lib                                                      │
│   ├── prisma.ts                                            │
│   ├── auth.ts                                              │
│   ├── socket.ts                                            │
│   └── ai/  (upsell, voice parser, predictive load)         │
│                                                            │
│  /prisma/schema.prisma                                     │
│  /server.ts  (custom server wrapping Next + Socket.io)    │
└─────────────────────────────────────────────────────────┘
              │                          │
              ▼                          ▼
        PostgreSQL DB              Socket.io (KDS realtime)
```

---

## Step 1: Project Initialization

```bash
npx create-next-app@latest odoo-cafe-pos --typescript --tailwind --app --src-dir
cd odoo-cafe-pos

# Core dependencies
npm install prisma @prisma/client next-auth @next-auth/prisma-adapter
npm install zustand recharts qrcode
npm install socket.io socket.io-client
npm install bcryptjs jsonwebtoken
npm install exceljs pdfkit
npm install resend
npm install zod react-hook-form @hookform/resolvers

# shadcn/ui setup
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input dialog tabs badge table select switch

# Dev dependencies
npm install -D @types/bcryptjs @types/jsonwebtoken @types/qrcode
```

---

## Step 2: PostgreSQL Setup

**Local (Docker — recommended for hackathon speed):**

```bash
docker run --name cafe-pos-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=cafe_pos -p 5432:5432 -d postgres:16
```

**Or use a hosted free tier:** Neon, Supabase, or Railway (instant Postgres URL, no Docker needed — recommended if your machine can't run Docker).

Create `.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cafe_pos"
NEXTAUTH_SECRET="generate-a-random-32-char-string"
NEXTAUTH_URL="http://localhost:3000"
RESEND_API_KEY="your-resend-key"
```

---

## Step 3: Initialize Prisma

```bash
npx prisma init
```

This creates `/prisma/schema.prisma` — populated fully in **Part 2** of this guide.

---

## Folder Structure (Target)

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (backend)/
│   │   ├── dashboard/page.tsx
│   │   ├── products/page.tsx
│   │   ├── categories/page.tsx
│   │   ├── payment-methods/page.tsx
│   │   ├── coupons/page.tsx
│   │   ├── floors/page.tsx
│   │   ├── users/page.tsx
│   │   └── reports/page.tsx
│   ├── pos/
│   │   ├── page.tsx              (Floor pop-up / launch)
│   │   ├── [tableId]/page.tsx    (Order View)
│   │   ├── orders/page.tsx
│   │   ├── customers/page.tsx
│   │   └── table-view/page.tsx
│   ├── kds/page.tsx
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── products/route.ts
│       ├── categories/route.ts
│       ├── payment-methods/route.ts
│       ├── coupons/route.ts
│       ├── promotions/route.ts
│       ├── floors/route.ts
│       ├── tables/route.ts
│       ├── orders/route.ts
│       ├── orders/[id]/route.ts
│       ├── customers/route.ts
│       ├── sessions/route.ts
│       ├── reports/route.ts
│       ├── upsell/route.ts        (Feature 1)
│       ├── voice-order/route.ts   (Feature 2)
│       └── kds/load/route.ts      (Feature 3)
├── components/
│   ├── pos/ (ProductGrid, Cart, PaymentPanel, FloorPopup, ...)
│   ├── kds/ (TicketCard, StageColumn, LoadMeter)
│   ├── backend/ (ProductForm, CategoryForm, ...)
│   └── ui/ (shadcn components)
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── socket.ts
│   ├── store/ (Zustand stores: cartStore, sessionStore)
│   └── ai/ (upsell.ts, voiceParser.ts, loadPredictor.ts)
└── prisma/
    └── schema.prisma
```

---

## Build Order (Recommended Sequence)

1. **Part 2** — Database schema (Prisma) — do this first, everything depends on it
2. **Part 3** — Auth (signup/login) + redirect to POS
3. **Part 4** — Backend admin modules (Products, Categories, Payment Methods, Floors, Coupons, Users)
4. **Part 5** — POS Terminal core (Floor popup → Order View → Cart → Payment)
5. **Part 6** — Kitchen Display + Socket.io real-time
6. **Part 7** — Orders list, Order Detail, Customer management
7. **Part 8** — Reports & Dashboard
8. **Part 9** — Standout Feature implementations (all 5)
9. **Part 10** — Deployment & demo prep

Each part is a separate file in this guide. Follow them in order — later parts assume earlier ones are done.
