# Part 5: POS Terminal Core (Session → Floor → Order View)

---

## 5.1 Session Open/Close

### API — `src/app/api/sessions/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;

  const active = await prisma.posSession.findFirst({
    where: { userId, closedAt: null },
  });

  const last = await prisma.posSession.findFirst({
    where: { userId, closedAt: { not: null } },
    orderBy: { closedAt: 'desc' },
  });

  return NextResponse.json({ active, last });
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  const posSession = await prisma.posSession.create({ data: { userId } });
  return NextResponse.json(posSession, { status: 201 });
}
```

`src/app/api/sessions/[id]/close/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  // Sum all PAID orders in this session
  const paidOrders = await prisma.order.findMany({
    where: { sessionId: params.id, status: 'PAID' },
  });
  const closingAmount = paidOrders.reduce((sum, o) => sum + o.total, 0);

  const closed = await prisma.posSession.update({
    where: { id: params.id },
    data: { closedAt: new Date(), closingAmount },
  });

  return NextResponse.json(closed);
}
```

### UI — `src/app/pos/page.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PosLanding() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/sessions').then(r => r.json()).then(setData);
  }, []);

  async function openSession() {
    await fetch('/api/sessions', { method: 'POST' });
    router.push('/pos/table-view'); // shows Floor Pop-up
  }

  if (!data) return <div>Loading...</div>;

  if (data.active) {
    router.push('/pos/table-view');
    return null;
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="border rounded-lg p-8 text-center space-y-4 max-w-sm">
        <h2 className="text-xl font-semibold">No Active Session</h2>
        <p className="text-sm text-gray-500">
          Last Open Session: {data.last ? new Date(data.last.openedAt).toLocaleString() : 'N/A'}
        </p>
        <p className="text-sm text-gray-500">
          Last Closing Sale: ₹{data.last?.closingAmount?.toFixed(2) ?? '0.00'}
        </p>
        <button onClick={openSession} className="bg-black text-white px-6 py-3 rounded-lg w-full">
          Open Session
        </button>
      </div>
    </div>
  );
}
```

---

## 5.2 Floor Pop-up

### API — reuse `GET /api/floors` (Part 4)

### Component — `src/components/pos/FloorPopup.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function FloorPopup({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const [floors, setFloors] = useState<any[]>([]);
  const [activeOrders, setActiveOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch('/api/floors').then(r => r.json()).then(setFloors);
    // Tables with an active (DRAFT) order
    fetch('/api/orders?status=DRAFT').then(r => r.json()).then((orders: any[]) => {
      setActiveOrders(new Set(orders.map(o => o.tableId).filter(Boolean)));
    });
  }, []);

  function selectTable(tableId: string) {
    router.push(`/pos/${tableId}`);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Select a Table</h2>
        {floors.map(floor => (
          <div key={floor.id} className="mb-6">
            <h3 className="font-semibold mb-2">{floor.name}</h3>
            <div className="grid grid-cols-4 gap-3">
              {floor.tables.map((t: any) => {
                const isActive = activeOrders.has(t.id);
                return (
                  <button
                    key={t.id}
                    onClick={() => selectTable(t.id)}
                    disabled={!t.active}
                    className={`rounded-lg p-4 text-center border-2 transition
                      ${isActive ? 'bg-amber-100 border-amber-400' : 'bg-gray-50 border-gray-200'}
                      ${!t.active ? 'opacity-40 cursor-not-allowed' : 'hover:border-black'}`}
                  >
                    <div className="text-2xl font-bold">{t.number}</div>
                    <div className="text-xs text-gray-500">{t.seats} seats</div>
                    {isActive && <div className="text-xs text-amber-600 mt-1">Occupied</div>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {onClose && <button onClick={onClose} className="mt-4 text-sm underline">Close</button>}
      </div>
    </div>
  );
}
```

`src/app/pos/table-view/page.tsx` renders `<FloorPopup />` full-screen (no `onClose`, since this IS the table-view route per Section 3.7).

---

## 5.3 Cart State (Zustand)

`src/lib/store/cartStore.ts`:

```typescript
import { create } from 'zustand';

export interface CartItem {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  discount: number; // product-level promo discount
  tax: number; // tax rate %
}

interface CartState {
  orderId: string | null; // null = new draft order
  tableId: string | null;
  customerId: string | null;
  items: CartItem[];
  couponCode: string | null;
  orderDiscount: number;

  setTable: (tableId: string) => void;
  setOrderId: (id: string | null) => void;
  addItem: (product: any) => void;
  updateQuantity: (productId: string, qty: number) => void;
  removeItem: (productId: string) => void;
  setCustomer: (id: string | null) => void;
  applyCoupon: (code: string, discount: number) => void;
  clearCart: () => void;
  loadOrder: (order: any) => void;

  subtotal: () => number;
  taxTotal: () => number;
  total: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  orderId: null,
  tableId: null,
  customerId: null,
  items: [],
  couponCode: null,
  orderDiscount: 0,

  setTable: (tableId) => set({ tableId }),
  setOrderId: (id) => set({ orderId: id }),

  addItem: (product) => set(state => {
    const existing = state.items.find(i => i.productId === product.id);
    if (existing) {
      return {
        items: state.items.map(i =>
          i.productId === product.id
            ? { ...i, quantity: i.quantity + 1, lineTotal: (i.quantity + 1) * i.unitPrice - i.discount }
            : i
        ),
      };
    }
    return {
      items: [...state.items, {
        productId: product.id, name: product.name, unitPrice: product.price,
        quantity: 1, lineTotal: product.price, discount: 0, tax: product.tax,
      }],
    };
  }),

  updateQuantity: (productId, qty) => set(state => ({
    items: qty <= 0
      ? state.items.filter(i => i.productId !== productId)
      : state.items.map(i => i.productId === productId
          ? { ...i, quantity: qty, lineTotal: qty * i.unitPrice - i.discount }
          : i),
  })),

  removeItem: (productId) => set(state => ({ items: state.items.filter(i => i.productId !== productId) })),

  setCustomer: (id) => set({ customerId: id }),

  applyCoupon: (code, discount) => set({ couponCode: code, orderDiscount: discount }),

  clearCart: () => set({ orderId: null, tableId: null, customerId: null, items: [], couponCode: null, orderDiscount: 0 }),

  loadOrder: (order) => set({
    orderId: order.id,
    tableId: order.tableId,
    customerId: order.customerId,
    couponCode: order.coupon?.code || null,
    orderDiscount: order.discount,
    items: order.items.map((i: any) => ({
      productId: i.productId, name: i.product.name, unitPrice: i.unitPrice,
      quantity: i.quantity, lineTotal: i.lineTotal, discount: i.discount, tax: i.product.tax,
    })),
  }),

  subtotal: () => get().items.reduce((sum, i) => sum + i.lineTotal, 0),
  taxTotal: () => get().items.reduce((sum, i) => sum + (i.lineTotal * i.tax / 100), 0),
  total: () => get().subtotal() + get().taxTotal() - get().orderDiscount,
}));
```

---

## 5.4 Order View — `src/app/pos/[tableId]/page.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useCartStore } from '@/lib/store/cartStore';
import { ProductGrid } from '@/components/pos/ProductGrid';
import { CartPanel } from '@/components/pos/CartPanel';
import { PaymentPanel } from '@/components/pos/PaymentPanel';

export default function OrderView({ params }: { params: { tableId: string } }) {
  const setTable = useCartStore(s => s.setTable);
  const clearCart = useCartStore(s => s.clearCart);

  useEffect(() => {
    clearCart();
    setTable(params.tableId);
    // TODO: check if this table already has a DRAFT order and loadOrder() if so
  }, [params.tableId]);

  return (
    <div className="grid grid-cols-[1fr_380px_320px] h-[calc(100vh-56px)]">
      <ProductGrid />
      <CartPanel />
      <PaymentPanel />
    </div>
  );
}
```

---

## 5.5 Product Grid — `src/components/pos/ProductGrid.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useCartStore } from '@/lib/store/cartStore';

export function ProductGrid() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const addItem = useCartStore(s => s.addItem);

  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(setProducts);
    fetch('/api/categories').then(r => r.json()).then(setCategories);
  }, []);

  const filtered = products.filter(p =>
    (!activeCategory || p.categoryId === activeCategory) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 overflow-y-auto border-r">
      <input
        placeholder="Search products..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full border rounded p-2 mb-3"
      />

      <div className="flex gap-2 mb-4 overflow-x-auto">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-3 py-1 rounded-full text-sm border ${!activeCategory ? 'bg-black text-white' : ''}`}
        >
          All
        </button>
        {categories.map(c => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            className={`px-3 py-1 rounded-full text-sm border whitespace-nowrap`}
            style={{
              backgroundColor: activeCategory === c.id ? c.color : 'transparent',
              borderColor: c.color,
              color: activeCategory === c.id ? '#fff' : c.color,
            }}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {filtered.map(p => (
          <button
            key={p.id}
            onClick={() => addItem(p)}
            className="border rounded-lg p-3 text-left hover:shadow-md transition"
            style={{ borderLeftColor: p.category.color, borderLeftWidth: 4 }}
          >
            <div className="font-medium text-sm">{p.name}</div>
            <div className="text-xs text-gray-500">₹{p.price.toFixed(2)}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

## 5.6 Cart Panel — `src/components/pos/CartPanel.tsx`

```tsx
'use client';

import { useState } from 'react';
import { useCartStore } from '@/lib/store/cartStore';
import { DiscountPopup } from './DiscountPopup';
import { CustomerPopup } from './CustomerPopup';

export function CartPanel() {
  const { items, updateQuantity, removeItem, subtotal, taxTotal, total, orderDiscount, couponCode } = useCartStore();
  const [showDiscount, setShowDiscount] = useState(false);
  const [showCustomer, setShowCustomer] = useState(false);
  const [sending, setSending] = useState(false);
  const [sentMsg, setSentMsg] = useState('');

  async function sendToKitchen() {
    setSending(true);
    setSentMsg('');
    try {
      const res = await fetch('/api/orders/send-to-kitchen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(useCartStore.getState()),
      });
      if (!res.ok) throw new Error('Failed');
      const order = await res.json();
      useCartStore.getState().setOrderId(order.id);
      setSentMsg('Sent to Kitchen ✓');
    } catch {
      setSentMsg('Failed to send — retry');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="border-r flex flex-col h-full">
      <div className="flex gap-2 p-3 border-b">
        <button onClick={() => setShowCustomer(true)} className="text-sm border rounded px-2 py-1 flex-1">Customer</button>
        <button onClick={() => setShowDiscount(true)} className="text-sm border rounded px-2 py-1 flex-1">Discount</button>
        <button className="text-sm border rounded px-2 py-1 flex-1">Send</button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {items.length === 0 && <p className="text-sm text-gray-400 text-center mt-8">Cart is empty</p>}
        {items.map(item => (
          <div key={item.productId} className="border rounded p-2">
            <div className="flex justify-between text-sm font-medium">
              <span>{item.name}</span>
              <span>₹{item.lineTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
              <span>₹{item.unitPrice.toFixed(2)} each</span>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="border rounded w-6 h-6">-</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="border rounded w-6 h-6">+</button>
              </div>
            </div>
            {item.discount > 0 && (
              <div className="text-xs text-green-600 mt-1">Promo: -₹{item.discount.toFixed(2)}</div>
            )}
          </div>
        ))}
      </div>

      <div className="border-t p-3 space-y-1 text-sm">
        <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal().toFixed(2)}</span></div>
        <div className="flex justify-between"><span>Tax</span><span>₹{taxTotal().toFixed(2)}</span></div>
        {orderDiscount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount {couponCode ? `(${couponCode})` : ''}</span>
            <span>-₹{orderDiscount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-base pt-1 border-t">
          <span>Total</span><span>₹{total().toFixed(2)}</span>
        </div>

        <button
          onClick={sendToKitchen}
          disabled={items.length === 0 || sending}
          className="w-full bg-black text-white rounded p-2 mt-2 disabled:opacity-50"
        >
          {sending ? 'Sending...' : 'Send to Kitchen'}
        </button>
        {sentMsg && <p className="text-center text-xs mt-1">{sentMsg}</p>}
      </div>

      {showDiscount && <DiscountPopup onClose={() => setShowDiscount(false)} />}
      {showCustomer && <CustomerPopup onClose={() => setShowCustomer(false)} />}
    </div>
  );
}
```

---

## 5.7 Discount Popup — `src/components/pos/DiscountPopup.tsx`

```tsx
'use client';

import { useState } from 'react';
import { useCartStore } from '@/lib/store/cartStore';

export function DiscountPopup({ onClose }: { onClose: () => void }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const applyCoupon = useCartStore(s => s.applyCoupon);
  const subtotal = useCartStore(s => s.subtotal());

  async function redeem() {
    setError('');
    const res = await fetch(`/api/coupons/validate?code=${encodeURIComponent(code)}`);
    const data = await res.json();

    if (!res.ok || !data.valid) {
      setError(data.error || 'Invalid or expired coupon code');
      return;
    }

    const discount = data.discountType === 'PERCENTAGE'
      ? subtotal * (data.value / 100)
      : data.value;

    applyCoupon(data.code, discount);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-80 space-y-3">
        <h3 className="font-bold">Enter Coupon Code</h3>
        <input
          value={code}
          onChange={e => setCode(e.target.value)}
          className={`w-full border rounded p-2 ${error ? 'border-red-500' : ''}`}
          placeholder="e.g. WELCOME10"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 border rounded p-2">Cancel</button>
          <button onClick={redeem} className="flex-1 bg-black text-white rounded p-2">Apply</button>
        </div>
      </div>
    </div>
  );
}
```

`src/app/api/coupons/validate/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const code = new URL(req.url).searchParams.get('code');
  const coupon = await prisma.coupon.findUnique({ where: { code: code || '' } });

  if (!coupon || !coupon.active) {
    return NextResponse.json({ valid: false, error: 'Invalid or expired coupon code' }, { status: 404 });
  }

  return NextResponse.json({ valid: true, code: coupon.code, discountType: coupon.discountType, value: coupon.value });
}
```

---

## 5.8 Send to Kitchen API — `src/app/api/orders/send-to-kitchen/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getIO } from '@/lib/socket';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { orderId, tableId, customerId, items, orderDiscount, couponCode } = body;
  const userId = (session.user as any).id;

  const activeSession = await prisma.posSession.findFirst({ where: { userId, closedAt: null } });
  if (!activeSession) return NextResponse.json({ error: 'No active session' }, { status: 400 });

  const subtotal = items.reduce((s: number, i: any) => s + i.lineTotal, 0);
  const tax = items.reduce((s: number, i: any) => s + (i.lineTotal * i.tax / 100), 0);
  const total = subtotal + tax - (orderDiscount || 0);

  const coupon = couponCode ? await prisma.coupon.findUnique({ where: { code: couponCode } }) : null;

  const data = {
    tableId, customerId, employeeId: userId, sessionId: activeSession.id,
    couponId: coupon?.id, subtotal, tax, discount: orderDiscount || 0, total,
    kitchenStage: 'TO_COOK' as const, sentToKitchenAt: new Date(),
    items: {
      [orderId ? 'deleteMany' : 'create']: orderId ? {} : items.map((i: any) => ({
        productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice,
        lineTotal: i.lineTotal, discount: i.discount,
      })),
    },
  };

  let order;
  if (orderId) {
    // Edit flow: wipe old items, recreate
    await prisma.orderItem.deleteMany({ where: { orderId } });
    order = await prisma.order.update({
      where: { id: orderId },
      data: {
        ...data,
        items: { create: items.map((i: any) => ({
          productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice,
          lineTotal: i.lineTotal, discount: i.discount,
        })) },
      },
      include: { items: { include: { product: true } } },
    });
  } else {
    order = await prisma.order.create({ data, include: { items: { include: { product: true } } } });
  }

  // Emit to KDS in real-time
  const io = getIO();
  io?.emit('order:new', order);

  return NextResponse.json(order, { status: 201 });
}
```

---

## Checkpoint

- [ ] Open session → Floor pop-up shows tables, occupied tables visually distinct
- [ ] Selecting table → Order View loads
- [ ] Adding products updates cart with correct totals
- [ ] Quantity +/- works
- [ ] Discount popup validates coupon, shows inline error on invalid code
- [ ] Send to Kitchen creates an Order with `kitchenStage: TO_COOK` and emits a socket event

Next: **Part 6 — Kitchen Display & Real-time (Socket.io)**
