# Part 7: Orders List, Customer Management, Payment & Receipts

---

## 7.1 Orders List — `src/app/pos/orders/page.tsx`

### API — `src/app/api/orders/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  const activeSession = await prisma.posSession.findFirst({ where: { userId, closedAt: null } });
  if (!activeSession) return NextResponse.json([]);

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status');

  const orders = await prisma.order.findMany({
    where: {
      sessionId: activeSession.id,
      ...(status && { status: status as any }),
      OR: search ? [
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { orderNumber: isNaN(Number(search)) ? undefined : Number(search) },
      ].filter(Boolean) as any : undefined,
    },
    include: { customer: true, items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(orders);
}
```

### UI

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch(`/api/orders?search=${encodeURIComponent(search)}`).then(r => r.json()).then(setOrders);
  }, [search]);

  return (
    <div className="p-4">
      <input
        placeholder="Search by customer, order #, or date..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="border rounded p-2 w-full max-w-md mb-4"
      />
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left border-b">
            <th className="p-2">Order #</th>
            <th className="p-2">Date</th>
            <th className="p-2">Customer</th>
            <th className="p-2">Amount</th>
            <th className="p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.id} className="border-b cursor-pointer hover:bg-gray-50"
              onClick={() => router.push(`/pos/orders/${o.id}`)}>
              <td className="p-2">#{o.orderNumber}</td>
              <td className="p-2">{new Date(o.createdAt).toLocaleString()}</td>
              <td className="p-2">{o.customer?.name || '—'}</td>
              <td className="p-2">₹{o.total.toFixed(2)}</td>
              <td className="p-2">
                <span className={`px-2 py-0.5 rounded text-xs
                  ${o.status === 'PAID' ? 'bg-green-100 text-green-700' :
                    o.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                  {o.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 7.2 Order Detail — `src/app/pos/orders/[id]/page.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store/cartStore';

export default function OrderDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const loadOrder = useCartStore(s => s.loadOrder);

  useEffect(() => {
    fetch(`/api/orders/${params.id}`).then(r => r.json()).then(setOrder);
  }, [params.id]);

  async function deleteOrder() {
    if (!confirm('Delete this draft order?')) return;
    await fetch(`/api/orders/${params.id}`, { method: 'DELETE' });
    router.push('/pos/orders');
  }

  function editOrder() {
    loadOrder(order);
    router.push(`/pos/${order.tableId}`);
  }

  if (!order) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4 max-w-2xl">
      <h1 className="text-xl font-bold mb-1">Order #{order.orderNumber}</h1>
      <p className="text-sm text-gray-500 mb-4">{new Date(order.createdAt).toLocaleString()}</p>

      <div className="space-y-1 text-sm mb-4">
        <p><strong>Customer:</strong> {order.customer?.name || '—'}</p>
        <p><strong>Status:</strong> {order.status}</p>
        <p><strong>Amount:</strong> ₹{order.total.toFixed(2)}</p>
      </div>

      <h3 className="font-semibold mb-2">Products</h3>
      <table className="w-full text-sm mb-4">
        <tbody>
          {order.items.map((i: any) => (
            <tr key={i.id} className="border-b">
              <td className="p-1">{i.product.name}</td>
              <td className="p-1">x{i.quantity}</td>
              <td className="p-1 text-right">₹{i.lineTotal.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {order.status === 'DRAFT' && (
        <div className="flex gap-2">
          <button onClick={deleteOrder} className="border border-red-500 text-red-500 rounded px-4 py-2">Delete</button>
          <button onClick={editOrder} className="bg-black text-white rounded px-4 py-2">Edit Order</button>
        </div>
      )}
    </div>
  );
}
```

`src/app/api/orders/[id]/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { customer: true, items: { include: { product: true } }, coupon: true },
  });
  return NextResponse.json(order);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({ where: { id: params.id } });
  if (order?.status !== 'DRAFT') {
    return NextResponse.json({ error: 'Only draft orders can be deleted' }, { status: 400 });
  }
  await prisma.order.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
```

---

## 7.3 Customer Management

### API — `src/app/api/customers/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const search = new URL(req.url).searchParams.get('search') || '';
  const customers = await prisma.customer.findMany({
    where: { name: { contains: search, mode: 'insensitive' } },
    take: 20,
  });
  return NextResponse.json(customers);
}

export async function POST(req: Request) {
  const { name, email, phone } = await req.json();
  const customer = await prisma.customer.create({ data: { name, email, phone } });
  return NextResponse.json(customer, { status: 201 });
}
```

`src/app/api/customers/[id]/route.ts` — standard PUT/DELETE.

### Customer Popup — `src/components/pos/CustomerPopup.tsx`

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/lib/store/cartStore';

export function CustomerPopup({ onClose }: { onClose: () => void }) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '' });
  const setCustomer = useCartStore(s => s.setCustomer);

  useEffect(() => {
    if (search) fetch(`/api/customers?search=${search}`).then(r => r.json()).then(setResults);
    else setResults([]);
  }, [search]);

  function select(customer: any) {
    setCustomer(customer.id);
    onClose();
  }

  async function createNew() {
    const res = await fetch('/api/customers', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCustomer),
    });
    const customer = await res.json();
    select(customer);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 space-y-3">
        <h3 className="font-bold">Assign Customer</h3>

        {!creating ? (
          <>
            <input placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} className="w-full border rounded p-2" />
            {results.map(c => (
              <div key={c.id} onClick={() => select(c)} className="border rounded p-2 cursor-pointer hover:bg-gray-50">
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-gray-500">{c.email} · {c.phone}</p>
              </div>
            ))}
            <button onClick={() => setCreating(true)} className="text-sm underline">+ New Customer</button>
          </>
        ) : (
          <>
            <input placeholder="Name" value={newCustomer.name} onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })} className="w-full border rounded p-2" />
            <input placeholder="Email" value={newCustomer.email} onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })} className="w-full border rounded p-2" />
            <input placeholder="Phone" value={newCustomer.phone} onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })} className="w-full border rounded p-2" />
            <button onClick={createNew} className="w-full bg-black text-white rounded p-2">Create & Assign</button>
          </>
        )}

        <button onClick={onClose} className="text-sm underline">Close</button>
      </div>
    </div>
  );
}
```

---

## 7.4 Payment Panel — `src/components/pos/PaymentPanel.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useCartStore } from '@/lib/store/cartStore';
import QRCode from 'qrcode';

export function PaymentPanel() {
  const [methods, setMethods] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [cashReceived, setCashReceived] = useState('');
  const [cardRef, setCardRef] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [paid, setPaid] = useState(false);
  const total = useCartStore(s => s.total());
  const { orderId } = useCartStore();

  useEffect(() => {
    fetch('/api/payment-methods').then(r => r.json()).then((all: any[]) => setMethods(all.filter(m => m.enabled)));
  }, []);

  useEffect(() => {
    const upi = methods.find(m => m.type === 'UPI');
    if (selected === 'UPI' && upi?.upiId) {
      const upiString = `upi://pay?pa=${upi.upiId}&am=${total.toFixed(2)}&cu=INR`;
      QRCode.toDataURL(upiString).then(setQrDataUrl);
    }
  }, [selected, total, methods]);

  async function completePayment(extra: any = {}) {
    if (!orderId) return alert('Send order to kitchen first');

    const res = await fetch(`/api/orders/${orderId}/pay`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ methodType: selected, amount: total, ...extra }),
    });

    if (res.ok) setPaid(true);
  }

  if (paid) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-full text-center">
        <div className="text-4xl mb-2">✓</div>
        <p className="font-semibold mb-4">Payment Successful</p>
        <button className="border rounded px-4 py-2 mb-2 w-full">Print Receipt</button>
        <button className="border rounded px-4 py-2 w-full">Email Receipt</button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <h3 className="font-semibold">Payment</h3>
      <div className="flex gap-2">
        {methods.map(m => (
          <button key={m.type} onClick={() => setSelected(m.type)}
            className={`flex-1 border rounded p-2 text-sm ${selected === m.type ? 'bg-black text-white' : ''}`}>
            {m.type}
          </button>
        ))}
      </div>

      {selected === 'CASH' && (
        <div className="space-y-2">
          <input type="number" placeholder="Amount received" value={cashReceived}
            onChange={e => setCashReceived(e.target.value)} className="w-full border rounded p-2" />
          {cashReceived && (
            <p className="text-sm">Change due: ₹{Math.max(0, parseFloat(cashReceived) - total).toFixed(2)}</p>
          )}
          <button onClick={() => completePayment({ amountReceived: parseFloat(cashReceived) })}
            disabled={!cashReceived || parseFloat(cashReceived) < total}
            className="w-full bg-black text-white rounded p-2 disabled:opacity-50">
            Confirm Cash Payment
          </button>
        </div>
      )}

      {selected === 'CARD' && (
        <div className="space-y-2">
          <input placeholder="Transaction reference" value={cardRef}
            onChange={e => setCardRef(e.target.value)} className="w-full border rounded p-2" />
          <button onClick={() => completePayment({ transactionRef: cardRef })}
            disabled={!cardRef}
            className="w-full bg-black text-white rounded p-2 disabled:opacity-50">
            Confirm Card Payment
          </button>
        </div>
      )}

      {selected === 'UPI' && (
        <div className="space-y-2 text-center">
          <p className="font-semibold">₹{total.toFixed(2)}</p>
          {qrDataUrl && <img src={qrDataUrl} alt="UPI QR" className="mx-auto w-40 h-40" />}
          <div className="flex gap-2">
            <button onClick={() => setSelected(null)} className="flex-1 border rounded p-2">Cancel</button>
            <button onClick={() => completePayment({})} className="flex-1 bg-black text-white rounded p-2">Confirmed</button>
          </div>
        </div>
      )}
    </div>
  );
}
```

### API — `src/app/api/orders/[id]/pay/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PaymentType } from '@prisma/client';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { methodType, amount, amountReceived, transactionRef } = await req.json();

  const method = await prisma.paymentMethod.findUnique({ where: { type: methodType as PaymentType } });
  if (!method) return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });

  await prisma.payment.create({
    data: { orderId: params.id, methodId: method.id, amount, amountReceived, transactionRef },
  });

  const order = await prisma.order.update({
    where: { id: params.id },
    data: { status: 'PAID' },
  });

  return NextResponse.json(order);
}
```

---

## 7.5 Email Receipt

`src/app/api/orders/[id]/email-receipt/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { customer: true, items: { include: { product: true } } },
  });

  if (!order?.customer?.email) {
    return NextResponse.json({ error: 'No customer email on file' }, { status: 400 });
  }

  const itemsHtml = order.items.map(i =>
    `<tr><td>${i.product.name}</td><td>x${i.quantity}</td><td>₹${i.lineTotal.toFixed(2)}</td></tr>`
  ).join('');

  await resend.emails.send({
    from: 'cafe@yourdomain.com',
    to: order.customer.email,
    subject: `Receipt for Order #${order.orderNumber}`,
    html: `<h2>Receipt #${order.orderNumber}</h2><table>${itemsHtml}</table><p>Total: ₹${order.total.toFixed(2)}</p>`,
  });

  return NextResponse.json({ success: true });
}
```

---

## Checkpoint

- [ ] Orders list filters by customer/order#/date
- [ ] Order detail shows full breakdown; Draft orders show Delete/Edit
- [ ] Edit Order loads cart with that order's items for re-editing
- [ ] Customer search/create/assign works from Order View
- [ ] Cash payment computes change correctly
- [ ] UPI generates QR from saved UPI ID with amount
- [ ] Card payment requires transaction reference
- [ ] Order status flips to PAID after payment

Next: **Part 8 — Reports & Dashboard**
