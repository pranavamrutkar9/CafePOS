# Part 2: Database Schema (Prisma)

Replace the contents of `prisma/schema.prisma` with the full schema below. This single schema supports the entire spec plus all 5 standout features.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────────────────
// USERS / AUTH
// ─────────────────────────────────────────────

enum Role {
  ADMIN
  EMPLOYEE
}

model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String
  role      Role     @default(EMPLOYEE)
  isArchived Boolean @default(false)
  createdAt DateTime @default(now())

  sessions  PosSession[]
  orders    Order[]
}

// ─────────────────────────────────────────────
// PRODUCTS & CATEGORIES
// ─────────────────────────────────────────────

model Category {
  id        String    @id @default(cuid())
  name      String
  color     String    // hex code, e.g. "#FFB703"
  products  Product[]
}

enum UnitOfMeasure {
  PIECE
  KG
  LITRE
}

model Product {
  id          String         @id @default(cuid())
  name        String
  price       Float
  unit        UnitOfMeasure  @default(PIECE)
  tax         Float          @default(0)   // percentage
  description String?
  categoryId  String
  category    Category       @relation(fields: [categoryId], references: [id])
  showOnKDS   Boolean         @default(true) // Feature: only products assigned to KDS appear there
  createdAt   DateTime        @default(now())

  orderItems        OrderItem[]
  promotions        Promotion[]
}

// ─────────────────────────────────────────────
// PAYMENT METHODS
// ─────────────────────────────────────────────

enum PaymentType {
  CASH
  CARD
  UPI
}

model PaymentMethod {
  id      String      @id @default(cuid())
  type    PaymentType @unique
  enabled Boolean     @default(false)
  upiId   String?     // required if type == UPI

  payments Payment[]
}

// ─────────────────────────────────────────────
// COUPONS & PROMOTIONS
// ─────────────────────────────────────────────

enum DiscountType {
  PERCENTAGE
  FIXED
}

model Coupon {
  id           String       @id @default(cuid())
  code         String       @unique
  discountType DiscountType
  value        Float
  active       Boolean      @default(true)

  orders Order[]
}

enum PromotionTrigger {
  PRODUCT_QUANTITY
  ORDER_AMOUNT
}

model Promotion {
  id            String           @id @default(cuid())
  name          String
  trigger       PromotionTrigger
  discountType  DiscountType
  value         Float

  // PRODUCT_QUANTITY trigger fields
  productId     String?
  product       Product?         @relation(fields: [productId], references: [id])
  minQuantity   Int?

  // ORDER_AMOUNT trigger fields
  minOrderAmount Float?

  // Feature 5: time-window auto promotions
  startTime     String?          // "15:00"
  endTime       String?          // "17:00"
  daysOfWeek    Int[]            @default([]) // 0=Sun..6=Sat, empty = every day
  active        Boolean          @default(true)
}

// ─────────────────────────────────────────────
// FLOOR / TABLES
// ─────────────────────────────────────────────

model Floor {
  id     String  @id @default(cuid())
  name   String
  tables Table[]
}

model Table {
  id        String   @id @default(cuid())
  number    Int
  seats     Int
  active    Boolean  @default(true)
  floorId   String
  floor     Floor    @relation(fields: [floorId], references: [id])

  orders Order[]
}

// ─────────────────────────────────────────────
// CUSTOMERS
// ─────────────────────────────────────────────

model Customer {
  id    String  @id @default(cuid())
  name  String
  email String?
  phone String?

  orders Order[]
}

// ─────────────────────────────────────────────
// POS SESSIONS
// ─────────────────────────────────────────────

model PosSession {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  openedAt    DateTime  @default(now())
  closedAt    DateTime?
  closingAmount Float?

  orders Order[]
}

// ─────────────────────────────────────────────
// ORDERS
// ─────────────────────────────────────────────

enum OrderStatus {
  DRAFT
  PAID
  CANCELLED
}

enum KitchenStage {
  TO_COOK
  PREPARING
  COMPLETED
}

model Order {
  id          String      @id @default(cuid())
  orderNumber Int         @default(autoincrement())
  status      OrderStatus @default(DRAFT)

  tableId     String?
  table       Table?      @relation(fields: [tableId], references: [id])

  customerId  String?
  customer    Customer?   @relation(fields: [customerId], references: [id])

  employeeId  String
  employee    User        @relation(fields: [employeeId], references: [id])

  sessionId   String
  session     PosSession  @relation(fields: [sessionId], references: [id])

  couponId    String?
  coupon      Coupon?     @relation(fields: [couponId], references: [id])

  appliedPromotionIds String[] @default([])

  subtotal    Float       @default(0)
  tax         Float       @default(0)
  discount    Float       @default(0)
  total       Float       @default(0)

  // Kitchen
  kitchenStage KitchenStage? // null = not sent to kitchen yet
  sentToKitchenAt DateTime?

  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  items    OrderItem[]
  payments Payment[]
}

model OrderItem {
  id          String   @id @default(cuid())
  orderId     String
  order       Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)

  productId   String
  product     Product  @relation(fields: [productId], references: [id])

  quantity    Int
  unitPrice   Float
  lineTotal   Float
  discount    Float    @default(0) // product-level promo discount

  // KDS item-level tracking (Feature: strikethrough per item)
  kdsCompleted Boolean @default(false)
}

// ─────────────────────────────────────────────
// PAYMENTS
// ─────────────────────────────────────────────

model Payment {
  id              String        @id @default(cuid())
  orderId         String
  order           Order         @relation(fields: [orderId], references: [id])

  methodId        String
  method          PaymentMethod @relation(fields: [methodId], references: [id])

  amount          Float
  amountReceived  Float?        // for cash (to calc change)
  transactionRef  String?       // for card

  createdAt       DateTime      @default(now())
}
```

---

## Run Migration

```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

## Prisma Client Singleton

`src/lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

---

## Seed Script

Create `prisma/seed.ts` to populate test data (categories, products, payment methods, a floor with tables, an admin user). This is critical for demo speed — you don't want to manually create 20 products through the UI on demo day.

```typescript
import { PrismaClient, Role, UnitOfMeasure, PaymentType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: { name: 'Admin', email: 'admin@cafe.com', password: hashedPassword, role: Role.ADMIN },
  });

  // Employee
  const empPassword = await bcrypt.hash('employee123', 10);
  await prisma.user.create({
    data: { name: 'Cashier 1', email: 'cashier@cafe.com', password: empPassword, role: Role.EMPLOYEE },
  });

  // Categories
  const beverages = await prisma.category.create({ data: { name: 'Beverages', color: '#FFB703' } });
  const snacks = await prisma.category.create({ data: { name: 'Snacks', color: '#8ECAE6' } });
  const desserts = await prisma.category.create({ data: { name: 'Desserts', color: '#FB8500' } });

  // Products
  await prisma.product.createMany({
    data: [
      { name: 'Cappuccino', price: 120, categoryId: beverages.id, unit: UnitOfMeasure.PIECE, tax: 5, showOnKDS: true },
      { name: 'Latte', price: 130, categoryId: beverages.id, unit: UnitOfMeasure.PIECE, tax: 5, showOnKDS: true },
      { name: 'Iced Tea', price: 90, categoryId: beverages.id, unit: UnitOfMeasure.PIECE, tax: 5, showOnKDS: true },
      { name: 'Sandwich', price: 150, categoryId: snacks.id, unit: UnitOfMeasure.PIECE, tax: 5, showOnKDS: true },
      { name: 'Croissant', price: 80, categoryId: snacks.id, unit: UnitOfMeasure.PIECE, tax: 5, showOnKDS: true },
      { name: 'Brownie', price: 100, categoryId: desserts.id, unit: UnitOfMeasure.PIECE, tax: 5, showOnKDS: false },
    ],
  });

  // Payment methods
  await prisma.paymentMethod.createMany({
    data: [
      { type: PaymentType.CASH, enabled: true },
      { type: PaymentType.CARD, enabled: true },
      { type: PaymentType.UPI, enabled: true, upiId: 'cafe@ybl' },
    ],
  });

  // Floor + Tables
  const floor1 = await prisma.floor.create({ data: { name: 'Ground Floor' } });
  await prisma.table.createMany({
    data: [
      { number: 1, seats: 2, floorId: floor1.id, active: true },
      { number: 2, seats: 4, floorId: floor1.id, active: true },
      { number: 3, seats: 4, floorId: floor1.id, active: true },
      { number: 4, seats: 6, floorId: floor1.id, active: true },
    ],
  });

  console.log('Seed complete.');
}

main().finally(() => prisma.$disconnect());
```

Add to `package.json`:
```json
"prisma": {
  "seed": "ts-node prisma/seed.ts"
}
```

Run:
```bash
npm install -D ts-node
npx prisma db seed
```

---

## Schema Design Notes

- **`OrderItem.discount`** stores the product-level promotion discount per line (Section 2.6 — applies to product cards in cart).
- **`Order.discount`** stores order-level coupon/promotion discount (separate line in order summary).
- **`Order.kitchenStage`** is nullable — `null` means not yet sent to kitchen; once set, KDS picks it up.
- **`OrderItem.kdsCompleted`** powers the per-item strikethrough on the KDS without affecting `kitchenStage`.
- **`Product.showOnKDS`** implements "Only products assigned to the Kitchen Display appear on this screen" (Section 4).
- **`Promotion.startTime/endTime/daysOfWeek`** are additions for Feature 5 (time-based auto-promotions) — not in the base spec but needed for that feature.
- **`Category.color`** is read everywhere (product cards, tabs, order view) — single source of truth, propagates automatically since all views query the same `Category` relation.
