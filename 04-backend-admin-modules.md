# Part 4: Backend Admin Modules

Build order: Categories → Products → Payment Methods → Floors/Tables → Coupons & Promotions → Users.

Categories first because Products depend on them.

---

## 4.1 Categories

### API Routes — `src/app/api/categories/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const categories = await prisma.category.findMany({ include: { products: true } });
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const { name, color } = await req.json();
  const category = await prisma.category.create({ data: { name, color } });
  return NextResponse.json(category, { status: 201 });
}
```

`src/app/api/categories/[id]/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { name, color } = await req.json();
  const category = await prisma.category.update({
    where: { id: params.id },
    data: { name, color },
  });
  return NextResponse.json(category);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await prisma.category.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
```

### UI — `src/app/(backend)/categories/page.tsx`

Build a table listing categories with a color swatch, plus a modal form (Name, Color picker). Use `<input type="color">` for simplicity — it's native and fast.

Key UX detail from spec: **color propagates everywhere** (product cards, POS category tabs, order view). Since all those views read `category.color` from the same DB record, this is automatic — no extra work needed once the schema relation is used consistently.

---

## 4.2 Products

### API Routes — `src/app/api/products/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const products = await prisma.product.findMany({ include: { category: true } });
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, price, unit, tax, description, categoryId, newCategory, showOnKDS } = body;

  let finalCategoryId = categoryId;

  // "Create a new category on the fly without leaving the product form"
  if (newCategory) {
    const created = await prisma.category.create({
      data: { name: newCategory.name, color: newCategory.color },
    });
    finalCategoryId = created.id;
  }

  const product = await prisma.product.create({
    data: { name, price, unit, tax, description, categoryId: finalCategoryId, showOnKDS },
  });

  return NextResponse.json(product, { status: 201 });
}
```

`src/app/api/products/[id]/route.ts` — standard PUT/DELETE mirroring categories pattern.

### UI — Product Form Component

Key requirement: **Category field allows picking existing OR creating new inline.**

```tsx
// src/components/backend/ProductForm.tsx
'use client';

import { useState, useEffect } from 'react';

export function ProductForm({ onSubmit, initial }: any) {
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryMode, setCategoryMode] = useState<'existing' | 'new'>('existing');
  const [form, setForm] = useState({
    name: initial?.name || '',
    price: initial?.price || 0,
    unit: initial?.unit || 'PIECE',
    tax: initial?.tax || 0,
    description: initial?.description || '',
    categoryId: initial?.categoryId || '',
    newCategory: { name: '', color: '#888888' },
    showOnKDS: initial?.showOnKDS ?? true,
  });

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(setCategories);
  }, []);

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="space-y-3">
      <input placeholder="Product Name" value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border p-2 rounded" required />

      <input type="number" placeholder="Price" value={form.price}
        onChange={e => setForm({ ...form, price: parseFloat(e.target.value) })} className="w-full border p-2 rounded" required />

      <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} className="w-full border p-2 rounded">
        <option value="PIECE">Per Piece</option>
        <option value="KG">Per Kg</option>
        <option value="LITRE">Per Litre</option>
      </select>

      <input type="number" placeholder="Tax %" value={form.tax}
        onChange={e => setForm({ ...form, tax: parseFloat(e.target.value) })} className="w-full border p-2 rounded" />

      <textarea placeholder="Description" value={form.description}
        onChange={e => setForm({ ...form, description: e.target.value })} className="w-full border p-2 rounded" />

      {/* Category: existing or new, inline */}
      <div className="border p-3 rounded space-y-2">
        <div className="flex gap-4">
          <label><input type="radio" checked={categoryMode === 'existing'} onChange={() => setCategoryMode('existing')} /> Existing Category</label>
          <label><input type="radio" checked={categoryMode === 'new'} onChange={() => setCategoryMode('new')} /> New Category</label>
        </div>

        {categoryMode === 'existing' ? (
          <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} className="w-full border p-2 rounded">
            <option value="">Select category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        ) : (
          <div className="flex gap-2">
            <input placeholder="New category name" value={form.newCategory.name}
              onChange={e => setForm({ ...form, newCategory: { ...form.newCategory, name: e.target.value } })}
              className="flex-1 border p-2 rounded" />
            <input type="color" value={form.newCategory.color}
              onChange={e => setForm({ ...form, newCategory: { ...form.newCategory, color: e.target.value } })} />
          </div>
        )}
      </div>

      <label className="flex items-center gap-2">
        <input type="checkbox" checked={form.showOnKDS}
          onChange={e => setForm({ ...form, showOnKDS: e.target.checked })} />
        Show on Kitchen Display
      </label>

      <button type="submit" className="bg-black text-white px-4 py-2 rounded">Save Product</button>
    </form>
  );
}
```

On submit, send `newCategory` only when `categoryMode === 'new'`; otherwise omit it and send `categoryId`.

---

## 4.3 Payment Methods

### API — `src/app/api/payment-methods/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PaymentType } from '@prisma/client';

export async function GET() {
  // Ensure all three method rows exist (idempotent seed-on-read)
  for (const type of [PaymentType.CASH, PaymentType.CARD, PaymentType.UPI]) {
    await prisma.paymentMethod.upsert({
      where: { type },
      update: {},
      create: { type, enabled: false },
    });
  }
  const methods = await prisma.paymentMethod.findMany();
  return NextResponse.json(methods);
}

export async function PUT(req: Request) {
  const { type, enabled, upiId } = await req.json();
  const method = await prisma.paymentMethod.update({
    where: { type },
    data: { enabled, ...(upiId !== undefined && { upiId }) },
  });
  return NextResponse.json(method);
}
```

### UI

Simple list with toggle switches (shadcn `Switch`). For UPI, show a text input for UPI ID that's only enabled/required when the UPI toggle is on. Validate UPI ID format (`name@bank`) before saving.

```tsx
// Snippet: UPI row
<div className="flex items-center justify-between border p-3 rounded">
  <div>
    <p className="font-medium">UPI QR</p>
    {upi.enabled && (
      <input placeholder="cafe@ybl" value={upi.upiId || ''}
        onChange={e => setUpiId(e.target.value)}
        className="border p-1 rounded text-sm mt-1" />
    )}
  </div>
  <Switch checked={upi.enabled} onCheckedChange={(val) => updateMethod('UPI', val, upi.upiId)} />
</div>
```

---

## 4.4 Floor & Table Management

### API — `src/app/api/floors/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const floors = await prisma.floor.findMany({ include: { tables: true } });
  return NextResponse.json(floors);
}

export async function POST(req: Request) {
  const { name } = await req.json();
  const floor = await prisma.floor.create({ data: { name } });
  return NextResponse.json(floor, { status: 201 });
}
```

`src/app/api/tables/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const { number, seats, floorId, active } = await req.json();
  const table = await prisma.table.create({ data: { number, seats, floorId, active } });
  return NextResponse.json(table, { status: 201 });
}
```

`src/app/api/tables/[id]/route.ts` — PUT (edit number/seats/active) and DELETE.

### UI

Floor management page: list floors as tabs/sections, each showing its tables in a grid with edit/delete actions and an "Add Table" button (Table Number, Seats, Active toggle).

---

## 4.5 Coupons & Promotions

### API — `src/app/api/coupons/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  return NextResponse.json(await prisma.coupon.findMany());
}

export async function POST(req: Request) {
  const { code, discountType, value } = await req.json();
  const coupon = await prisma.coupon.create({ data: { code, discountType, value } });
  return NextResponse.json(coupon, { status: 201 });
}
```

### API — `src/app/api/promotions/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  return NextResponse.json(await prisma.promotion.findMany({ include: { product: true } }));
}

export async function POST(req: Request) {
  const body = await req.json();
  const promotion = await prisma.promotion.create({
    data: {
      name: body.name,
      trigger: body.trigger, // 'PRODUCT_QUANTITY' | 'ORDER_AMOUNT'
      discountType: body.discountType,
      value: body.value,
      productId: body.trigger === 'PRODUCT_QUANTITY' ? body.productId : null,
      minQuantity: body.trigger === 'PRODUCT_QUANTITY' ? body.minQuantity : null,
      minOrderAmount: body.trigger === 'ORDER_AMOUNT' ? body.minOrderAmount : null,
      startTime: body.startTime || null,
      endTime: body.endTime || null,
      daysOfWeek: body.daysOfWeek || [],
    },
  });
  return NextResponse.json(promotion, { status: 201 });
}
```

### UI — Promotion Form

Two-step conditional form:

1. Radio: **"Apply to Product"** vs **"Apply to Order"**
2. If Product → select Product + Minimum Quantity input
3. If Order → Minimum Order Amount input
4. Common fields: Discount Type (Percentage/Fixed), Value
5. Optional (Feature 5): Time window — Start Time, End Time, Days of Week checkboxes

```tsx
{trigger === 'PRODUCT_QUANTITY' && (
  <>
    <select value={productId} onChange={e => setProductId(e.target.value)}>...products...</select>
    <input type="number" placeholder="Minimum Quantity" value={minQuantity} onChange={...} />
  </>
)}

{trigger === 'ORDER_AMOUNT' && (
  <input type="number" placeholder="Minimum Order Amount" value={minOrderAmount} onChange={...} />
)}
```

---

## 4.6 User / Employee Management

### API — `src/app/api/users/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, isArchived: true },
  });
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  const { name, email, password, role } = await req.json();
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { name, email, password: hashed, role } });
  return NextResponse.json(user, { status: 201 });
}
```

`src/app/api/users/[id]/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Archive / Unarchive
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { isArchived, newPassword } = await req.json();

  const data: any = {};
  if (isArchived !== undefined) data.isArchived = isArchived;
  if (newPassword) data.password = await bcrypt.hash(newPassword, 10);

  const user = await prisma.user.update({ where: { id: params.id }, data });
  return NextResponse.json({ id: user.id, isArchived: user.isArchived });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await prisma.user.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
```

### UI

Table listing all users (Name, Email, Role badge, Status). Each row has a dropdown menu: **Change Password** (opens modal with new password input → PATCH `newPassword`), **Archive/Unarchive** (PATCH `isArchived`), **Delete** (DELETE with confirm dialog).

---

## Checkpoint

At this point you should be able to:
- [ ] Create/edit/delete categories with color
- [ ] Create products, picking or creating categories inline
- [ ] Toggle payment methods, save UPI ID
- [ ] Create floors and tables
- [ ] Create coupons and both types of promotions
- [ ] List, archive, delete, and change password for users

Next: **Part 5 — POS Terminal Core (Floor Pop-up → Order View)**
