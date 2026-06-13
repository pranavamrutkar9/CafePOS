# Part 6: Kitchen Display & Real-Time (Socket.io)

---

## 6.1 Custom Server Setup

Next.js App Router doesn't natively support attaching Socket.io to API routes in a persistent way. Use a custom server.

`server.ts` (project root):

```typescript
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server, {
    cors: { origin: '*' },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
  });

  // Make io instance globally accessible to API routes
  (global as any).io = io;

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`Ready on http://localhost:${port}`);
  });
});
```

`src/lib/socket.ts`:

```typescript
import { Server } from 'socket.io';

export function getIO(): Server | null {
  return (global as any).io || null;
}
```

Update `package.json` scripts:

```json
{
  "scripts": {
    "dev": "ts-node server.ts",
    "build": "next build",
    "start": "NODE_ENV=production ts-node server.ts"
  }
}
```

Install: `npm install -D ts-node`

> **Why this matters:** This is the single piece of infrastructure that makes "real time" actually real time. Get this running early and test it with a simple `socket.emit`/`socket.on` console log before building UI on top of it.

---

## 6.2 KDS API Routes

### Get active orders — `src/app/api/kds/orders/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const orders = await prisma.order.findMany({
    where: {
      kitchenStage: { not: null },
      status: { not: 'CANCELLED' },
    },
    include: {
      items: { include: { product: true }, where: { product: { showOnKDS: true } } },
    },
    orderBy: { sentToKitchenAt: 'asc' },
  });

  // Filter out orders with zero KDS-visible items
  const filtered = orders.filter(o => o.items.length > 0);
  return NextResponse.json(filtered);
}
```

### Advance stage — `src/app/api/kds/orders/[id]/stage/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getIO } from '@/lib/socket';

const NEXT_STAGE: Record<string, string | null> = {
  TO_COOK: 'PREPARING',
  PREPARING: 'COMPLETED',
  COMPLETED: null, // no further stage; clicking does nothing or archives
};

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({ where: { id: params.id } });
  if (!order || !order.kitchenStage) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const next = NEXT_STAGE[order.kitchenStage];
  if (!next) return NextResponse.json(order); // already completed

  const updated = await prisma.order.update({
    where: { id: params.id },
    data: { kitchenStage: next as any },
    include: { items: { include: { product: true } } },
  });

  getIO()?.emit('order:stage-updated', updated);
  return NextResponse.json(updated);
}
```

### Toggle item completion — `src/app/api/kds/items/[id]/toggle/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getIO } from '@/lib/socket';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const item = await prisma.orderItem.findUnique({ where: { id: params.id } });
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const updated = await prisma.orderItem.update({
    where: { id: params.id },
    data: { kdsCompleted: !item.kdsCompleted },
  });

  getIO()?.emit('item:toggled', { orderId: item.orderId, itemId: item.id, kdsCompleted: updated.kdsCompleted });
  return NextResponse.json(updated);
}
```

---

## 6.3 KDS Page — `src/app/kds/page.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { TicketCard } from '@/components/kds/TicketCard';

const STAGES = ['TO_COOK', 'PREPARING', 'COMPLETED'] as const;
const STAGE_LABELS: Record<string, string> = {
  TO_COOK: 'To Cook',
  PREPARING: 'Preparing',
  COMPLETED: 'Completed',
};

export default function KdsPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/kds/orders').then(r => r.json()).then(setOrders);
    fetch('/api/categories').then(r => r.json()).then(setCategories);

    const socket: Socket = io();

    socket.on('order:new', (order) => {
      setOrders(prev => [...prev, order]);
    });

    socket.on('order:stage-updated', (order) => {
      setOrders(prev => prev.map(o => o.id === order.id ? order : o));
    });

    socket.on('item:toggled', ({ orderId, itemId, kdsCompleted }) => {
      setOrders(prev => prev.map(o =>
        o.id === orderId
          ? { ...o, items: o.items.map((i: any) => i.id === itemId ? { ...i, kdsCompleted } : i) }
          : o
      ));
    });

    return () => { socket.disconnect(); };
  }, []);

  function matchesFilters(order: any) {
    const matchesSearch = !search ||
      order.orderNumber.toString().includes(search) ||
      order.items.some((i: any) => i.product.name.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = !categoryFilter ||
      order.items.some((i: any) => i.product.categoryId === categoryFilter);
    return matchesSearch && matchesCategory;
  }

  async function advanceStage(orderId: string) {
    const res = await fetch(`/api/kds/orders/${orderId}/stage`, { method: 'POST' });
    const updated = await res.json();
    setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
  }

  async function toggleItem(itemId: string) {
    await fetch(`/api/kds/items/${itemId}/toggle`, { method: 'POST' });
    // optimistic update handled via socket echo
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="border-b p-3 flex gap-3 items-center">
        <input
          placeholder="Search order # or item..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded p-2 flex-1 max-w-xs"
        />
        <div className="flex gap-2 overflow-x-auto">
          <button onClick={() => setCategoryFilter(null)}
            className={`px-3 py-1 rounded-full text-sm border ${!categoryFilter ? 'bg-black text-white' : ''}`}>
            All
          </button>
          {categories.map(c => (
            <button key={c.id} onClick={() => setCategoryFilter(c.id)}
              className="px-3 py-1 rounded-full text-sm border"
              style={{ borderColor: c.color, backgroundColor: categoryFilter === c.id ? c.color : 'transparent' }}>
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-3 p-3 overflow-hidden">
        {STAGES.map(stage => {
          const stageOrders = orders.filter(o => o.kitchenStage === stage && matchesFilters(o));
          return (
            <div key={stage} className="border rounded-lg flex flex-col overflow-hidden">
              <div className="p-2 border-b bg-gray-50 font-semibold flex justify-between">
                <span>{STAGE_LABELS[stage]}</span>
                <span className="text-sm text-gray-500">{stageOrders.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {stageOrders.length === 0 && (
                  <p className="text-sm text-gray-400 text-center mt-8">No orders</p>
                )}
                {stageOrders.map(order => (
                  <TicketCard key={order.id} order={order} onAdvance={() => advanceStage(order.id)} onToggleItem={toggleItem} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

---

## 6.4 Ticket Card — `src/components/kds/TicketCard.tsx`

```tsx
'use client';

export function TicketCard({ order, onAdvance, onToggleItem }: any) {
  return (
    <div className="border rounded-lg p-3 bg-white shadow-sm">
      <div
        className="cursor-pointer"
        onClick={onAdvance}
        title="Click to advance to next stage"
      >
        <div className="font-bold text-lg mb-2">#{order.orderNumber}</div>
      </div>

      <div className="space-y-1">
        {order.items.map((item: any) => (
          <div
            key={item.id}
            onClick={(e) => { e.stopPropagation(); onToggleItem(item.id); }}
            className={`flex justify-between text-sm cursor-pointer p-1 rounded hover:bg-gray-50
              ${item.kdsCompleted ? 'line-through text-gray-400' : ''}`}
          >
            <span>{item.product.name}</span>
            <span>x{item.quantity}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

> **Interaction summary:**
> - Click anywhere on the card body (outside items) → advances whole order to next stage
> - Click an individual item → toggles strikethrough for that item only, `e.stopPropagation()` prevents the card-level click from also firing

---

## 6.5 Testing Real-Time Flow

1. Open two browser windows: one on `/pos/[tableId]`, one on `/kds`
2. In POS, add items and click "Send to Kitchen"
3. KDS window should show a new ticket in "To Cook" **without refreshing**
4. Click the ticket → moves to "Preparing"
5. Click an item inside it → strikethrough appears
6. Click ticket again → moves to "Completed"

If the ticket doesn't appear in real time, check:
- `server.ts` is the entry point (`npm run dev` runs `ts-node server.ts`, not `next dev`)
- Browser console for socket connection errors
- `getIO()` returns non-null in the API route (add a console.log to verify)

---

## Checkpoint

- [ ] Custom server running, Socket.io connected
- [ ] Sending order from POS appears instantly on KDS
- [ ] Stage advancement works via card click
- [ ] Item-level strikethrough works independently
- [ ] Search and category filters work on KDS
- [ ] Only `showOnKDS: true` products appear

Next: **Part 7 — Orders List, Order Detail, Customer Management, Payment & Receipts**
