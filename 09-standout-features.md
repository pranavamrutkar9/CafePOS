# Part 9: Standout Feature Implementations

All 5 features layer on top of the core build (Parts 1-8). Build order below is by effort — do 5 → 4 → 3 → 1 → 2 if time-constrained (2 is the most effort for the least guaranteed payoff, but the biggest "wow" if it works).

---

## Feature 5: Dynamic "Happy Hour" Auto-Promotions

**Effort: Low | Impact: Medium-High**

Schema already supports `startTime`, `endTime`, `daysOfWeek` on `Promotion` (Part 2).

### 9.5.1 Promotion Engine — `src/lib/promotions.ts`

```typescript
import { prisma } from './prisma';

export function isPromotionActiveNow(promo: { startTime: string | null; endTime: string | null; daysOfWeek: number[] }): boolean {
  if (!promo.startTime || !promo.endTime) return true; // not time-bound

  const now = new Date();
  const currentDay = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [startH, startM] = promo.startTime.split(':').map(Number);
  const [endH, endM] = promo.endTime.split(':').map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  const dayMatches = promo.daysOfWeek.length === 0 || promo.daysOfWeek.includes(currentDay);
  const timeMatches = currentMinutes >= startMinutes && currentMinutes <= endMinutes;

  return dayMatches && timeMatches;
}

export async function getActivePromotions() {
  const all = await prisma.promotion.findMany({ where: { active: true } });
  return all.filter(isPromotionActiveNow);
}

export async function applyPromotionsToCart(items: any[], subtotal: number) {
  const activePromos = await getActivePromotions();
  let orderDiscount = 0;
  const updatedItems = [...items];

  for (const promo of activePromos) {
    if (promo.trigger === 'PRODUCT_QUANTITY' && promo.productId && promo.minQuantity) {
      const item = updatedItems.find(i => i.productId === promo.productId);
      if (item && item.quantity >= promo.minQuantity) {
        const discount = promo.discountType === 'PERCENTAGE'
          ? item.lineTotal * (promo.value / 100)
          : promo.value;
        item.discount = discount;
        item.lineTotal -= discount;
      }
    }

    if (promo.trigger === 'ORDER_AMOUNT' && promo.minOrderAmount && subtotal >= promo.minOrderAmount) {
      orderDiscount += promo.discountType === 'PERCENTAGE'
        ? subtotal * (promo.value / 100)
        : promo.value;
    }
  }

  return { items: updatedItems, orderDiscount };
}
```

### 9.5.2 Apply on Cart Update

In `cartStore.ts`, call this whenever items change — or simpler for a hackathon, call it server-side during "Send to Kitchen" so the persisted order reflects active promos at send-time. Add to `send-to-kitchen/route.ts`:

```typescript
import { applyPromotionsToCart } from '@/lib/promotions';

// Before computing subtotal/tax/total:
const { items: promoItems, orderDiscount: promoDiscount } = await applyPromotionsToCart(items, items.reduce((s: number, i: any) => s + i.lineTotal, 0));
// merge promoDiscount into orderDiscount, use promoItems instead of items
```

### 9.5.3 UI: Active Promo Banner

In `ProductGrid.tsx`, fetch active promotions and show a small banner:

```tsx
{activePromos.length > 0 && (
  <div className="bg-amber-50 border border-amber-300 rounded p-2 mb-3 text-sm text-amber-700">
    🎉 {activePromos.map(p => p.name).join(', ')} active now!
  </div>
)}
```

Add `src/app/api/promotions/active/route.ts` returning `getActivePromotions()`.

---

## Feature 3: Predictive Kitchen Load Balancing

**Effort: Low-Medium | Impact: High (very visible in demo)**

### 9.3.1 Load Calculation API — `src/app/api/kds/load/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Simple heuristic: each item in TO_COOK/PREPARING adds an estimated prep time
const AVG_PREP_MINUTES_PER_ITEM = 3;

export async function GET() {
  const activeOrders = await prisma.order.findMany({
    where: { kitchenStage: { in: ['TO_COOK', 'PREPARING'] } },
    include: { items: true },
  });

  const totalItems = activeOrders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);
  const estimatedQueueMinutes = totalItems * AVG_PREP_MINUTES_PER_ITEM;

  let level: 'green' | 'yellow' | 'red' = 'green';
  if (estimatedQueueMinutes > 30) level = 'red';
  else if (estimatedQueueMinutes > 12) level = 'yellow';

  // Per-order ETA: position in queue * avg time
  const ordersWithEta = activeOrders.map((order, idx) => {
    const itemsAhead = activeOrders.slice(0, idx).reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);
    const orderItems = order.items.reduce((s, i) => s + i.quantity, 0);
    return {
      orderId: order.id,
      etaMinutes: (itemsAhead + orderItems) * AVG_PREP_MINUTES_PER_ITEM,
    };
  });

  return NextResponse.json({ level, estimatedQueueMinutes, ordersWithEta });
}
```

### 9.3.2 KDS Load Meter — `src/components/kds/LoadMeter.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';

const COLORS = { green: '#22c55e', yellow: '#eab308', red: '#ef4444' };

export function LoadMeter() {
  const [load, setLoad] = useState<any>(null);

  useEffect(() => {
    const fetchLoad = () => fetch('/api/kds/load').then(r => r.json()).then(setLoad);
    fetchLoad();
    const interval = setInterval(fetchLoad, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, []);

  if (!load) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full border" style={{ borderColor: COLORS[load.level as keyof typeof COLORS] }}>
      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[load.level as keyof typeof COLORS] }} />
      <span className="text-sm font-medium">~{load.estimatedQueueMinutes} min queue</span>
    </div>
  );
}
```

Add `<LoadMeter />` to the KDS top bar and to the POS Order View (next to "Current Table Indicator") so customers/employees see the same number — closes the loop described in the original pitch.

### 9.3.3 Per-Order ETA on Ticket Card

Pass `etaMinutes` (from `ordersWithEta`) into `TicketCard` and render: `<span className="text-xs text-gray-500">ETA: {etaMinutes}m</span>`.

---

## Feature 4: Offline-First PWA Mode

**Effort: Medium | Impact: High (architectural credibility)**

### 9.4.1 PWA Setup

```bash
npm install next-pwa
```

`next.config.js`:

```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

module.exports = withPWA({
  // existing next config
});
```

Add `public/manifest.json`:

```json
{
  "name": "Odoo Cafe POS",
  "short_name": "CafePOS",
  "start_url": "/pos",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [{ "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" }]
}
```

Link it in `src/app/layout.tsx` `<head>`: `<link rel="manifest" href="/manifest.json" />`

### 9.4.2 Offline Queue with IndexedDB

```bash
npm install idb
```

`src/lib/offlineQueue.ts`:

```typescript
import { openDB } from 'idb';

const DB_NAME = 'cafe-pos-offline';
const STORE = 'pending-orders';

async function getDb() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE, { keyPath: 'localId' });
    },
  });
}

export async function queueOrder(payload: any) {
  const db = await getDb();
  const localId = `local-${Date.now()}-${Math.random()}`;
  await db.add(STORE, { localId, payload, createdAt: Date.now() });
  return localId;
}

export async function getPendingOrders() {
  const db = await getDb();
  return db.getAll(STORE);
}

export async function removePendingOrder(localId: string) {
  const db = await getDb();
  await db.delete(STORE, localId);
}

export async function syncPendingOrders() {
  const pending = await getPendingOrders();
  for (const item of pending) {
    try {
      const res = await fetch('/api/orders/send-to-kitchen', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.payload),
      });
      if (res.ok) await removePendingOrder(item.localId);
    } catch {
      // still offline, stop trying
      break;
    }
  }
}
```

### 9.4.3 Wire into Send to Kitchen

In `CartPanel.tsx`'s `sendToKitchen`:

```typescript
import { queueOrder, syncPendingOrders } from '@/lib/offlineQueue';

async function sendToKitchen() {
  setSending(true);
  const payload = useCartStore.getState();

  if (!navigator.onLine) {
    await queueOrder(payload);
    setSentMsg('Saved offline — will sync when connection returns');
    setSending(false);
    return;
  }

  try {
    const res = await fetch('/api/orders/send-to-kitchen', { /* ... */ });
    // existing success path
  } catch {
    await queueOrder(payload);
    setSentMsg('Saved offline — will sync when connection returns');
  } finally {
    setSending(false);
  }
}
```

### 9.4.4 Auto-Sync Listener

In `src/app/providers.tsx` or a top-level component:

```typescript
useEffect(() => {
  window.addEventListener('online', syncPendingOrders);
  return () => window.removeEventListener('online', syncPendingOrders);
}, []);
```

### 9.4.5 Cache Product Catalog

`next-pwa` auto-generates a service worker with runtime caching for static assets. For the product catalog API response specifically, add a `runtimeCaching` rule in `next.config.js`:

```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  runtimeCaching: [
    {
      urlPattern: /\/api\/products/,
      handler: 'NetworkFirst',
      options: { cacheName: 'products-cache', expiration: { maxEntries: 1 } },
    },
  ],
});
```

> **Demo tip:** To show this off, open DevTools → Network → set to "Offline", add items, click Send to Kitchen, show the "saved offline" message, then go back online and watch it auto-sync to the KDS.

---

## Feature 1: AI-Powered Smart Upsell & Combo Suggestions

**Effort: Medium | Impact: High**

### 9.1.1 Simple Co-occurrence Approach (no external AI needed)

Compute "frequently bought together" from historical `OrderItem` data.

`src/app/api/upsell/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const productId = new URL(req.url).searchParams.get('productId');
  if (!productId) return NextResponse.json([]);

  // Find orders that included this product
  const ordersWithProduct = await prisma.orderItem.findMany({
    where: { productId },
    select: { orderId: true },
  });
  const orderIds = ordersWithProduct.map(o => o.orderId);

  if (orderIds.length === 0) return NextResponse.json([]);

  // Find other products frequently in those same orders
  const coOccurring = await prisma.orderItem.groupBy({
    by: ['productId'],
    where: { orderId: { in: orderIds }, productId: { not: productId } },
    _count: { productId: true },
    orderBy: { _count: { productId: 'desc' } },
    take: 3,
  });

  const products = await prisma.product.findMany({
    where: { id: { in: coOccurring.map(c => c.productId) } },
  });

  return NextResponse.json(products);
}
```

### 9.1.2 UI: Suggestion Chip on Add-to-Cart

In `cartStore.ts`'s `addItem`, after adding, fetch suggestions and surface them:

`src/components/pos/UpsellSuggestions.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useCartStore } from '@/lib/store/cartStore';

export function UpsellSuggestions() {
  const items = useCartStore(s => s.items);
  const addItem = useCartStore(s => s.addItem);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  useEffect(() => {
    if (items.length === 0) return setSuggestions([]);
    const lastItem = items[items.length - 1];
    fetch(`/api/upsell?productId=${lastItem.productId}`)
      .then(r => r.json())
      .then((products: any[]) => {
        // Exclude products already in cart
        const inCart = new Set(items.map(i => i.productId));
        setSuggestions(products.filter(p => !inCart.has(p.id)));
      });
  }, [items.length]);

  if (suggestions.length === 0) return null;

  return (
    <div className="border-t p-2">
      <p className="text-xs text-gray-500 mb-1">Customers also added:</p>
      <div className="flex gap-2 overflow-x-auto">
        {suggestions.map(p => (
          <button key={p.id} onClick={() => addItem(p)}
            className="border rounded-full px-3 py-1 text-xs whitespace-nowrap bg-amber-50 border-amber-300">
            + {p.name} (₹{p.price})
          </button>
        ))}
      </div>
    </div>
  );
}
```

Place `<UpsellSuggestions />` in `CartPanel.tsx`, between the items list and the order summary.

> **Cold start problem:** With a freshly seeded DB, there's no order history, so co-occurrence returns nothing. Either (a) seed some fake `Order`/`OrderItem` rows in `seed.ts` so suggestions work on demo day, or (b) fall back to a simple rule: "same category, different product" when no co-occurrence data exists.

---

## Feature 2: Voice-Activated Order Taking

**Effort: Medium-High | Impact: Very High (demo wow-factor)**

### 9.2.1 Voice Capture — Web Speech API (browser-native, free)

`src/components/pos/VoiceOrderButton.tsx`:

```tsx
'use client';

import { useState, useRef } from 'react';
import { useCartStore } from '@/lib/store/cartStore';

export function VoiceOrderButton() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsing, setParsing] = useState(false);
  const recognitionRef = useRef<any>(null);
  const addItem = useCartStore(s => s.addItem);

  function startListening() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition not supported in this browser. Try Chrome.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onresult = async (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      setParsing(true);

      const res = await fetch('/api/voice-order', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text }),
      });
      const { items } = await res.json();

      items.forEach((match: any) => {
        for (let i = 0; i < match.quantity; i++) addItem(match.product);
      });

      setParsing(false);
    };

    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={startListening}
        disabled={listening || parsing}
        className={`rounded-full w-10 h-10 flex items-center justify-center border ${listening ? 'bg-red-500 text-white animate-pulse' : ''}`}
        title="Voice order"
      >
        🎤
      </button>
      {parsing && <span className="text-xs text-gray-500">Parsing...</span>}
      {transcript && !parsing && <span className="text-xs text-gray-500">"{transcript}"</span>}
    </div>
  );
}
```

### 9.2.2 Parsing Endpoint — `src/app/api/voice-order/route.ts`

Two approaches, pick based on remaining time:

**Approach A — Simple keyword/number matching (no AI API, fast to build, works offline):**

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const NUMBER_WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
};

export async function POST(req: Request) {
  const { transcript } = await req.json();
  const products = await prisma.product.findMany();

  const lowerTranscript = transcript.toLowerCase();
  const matches: { product: any; quantity: number }[] = [];

  for (const product of products) {
    const productNameLower = product.name.toLowerCase();
    if (lowerTranscript.includes(productNameLower)) {
      // Look for a number word or digit before the product name
      const regex = new RegExp(`(\\d+|${Object.keys(NUMBER_WORDS).join('|')})\\s+${productNameLower}`);
      const match = lowerTranscript.match(regex);
      let quantity = 1;
      if (match) {
        const qtyStr = match[1];
        quantity = NUMBER_WORDS[qtyStr] || parseInt(qtyStr) || 1;
      }
      matches.push({ product, quantity });
    }
  }

  return NextResponse.json({ items: matches });
}
```

**Approach B — Claude API for robust NLU (handles typos, complex phrasing, multiple items separated by "and"):**

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const { transcript } = await req.json();
  const products = await prisma.product.findMany();
  const productList = products.map(p => `${p.id}: ${p.name}`).join('\n');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: `Given this product list:\n${productList}\n\nParse this spoken order: "${transcript}"\n\nRespond ONLY with JSON array: [{"productId": "...", "quantity": N}]. No other text.`,
      }],
    }),
  });

  const data = await response.json();
  const text = data.content[0].text.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(text);

  const items = parsed.map((p: any) => ({
    product: products.find(prod => prod.id === p.productId),
    quantity: p.quantity,
  })).filter((m: any) => m.product);

  return NextResponse.json({ items });
}
```

> Approach A is more reliable for a hackathon demo because it's deterministic and doesn't depend on an external API key working live on stage. Approach B handles "two cappuccinos and a sandwich" (multiple items, conjunctions) much better. **Recommendation:** build A first as a safety net, then layer B in — if B fails or times out, fall back to A.

### 9.2.3 Place in UI

Add `<VoiceOrderButton />` next to the Product Search Bar in `ProductGrid.tsx`.

---

## Feature Priority Summary

| Feature | Effort | Demo Impact | Order |
|---|---|---|---|
| 5. Happy Hour Promotions | Low | Medium-High | Build 1st |
| 3. Predictive Kitchen Load | Low-Med | High | Build 2nd |
| 4. Offline-First PWA | Medium | High (architecture) | Build 3rd |
| 1. Smart Upsell | Medium | High | Build 4th |
| 2. Voice Ordering | Med-High | Very High | Build 5th (stretch) |

If time runs out, **stop after Feature 4** — you'll have a complete core POS + 3 differentiated features, which is more than most hackathon submissions.

Next: **Part 10 — Deployment & Demo Prep**
