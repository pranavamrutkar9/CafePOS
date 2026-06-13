# Part 8: Reports & Dashboard

---

## 8.1 Reports API — `src/app/api/reports/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const period = searchParams.get('period') || 'today'; // today | week | month | custom
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const employeeId = searchParams.get('employeeId');
  const sessionId = searchParams.get('sessionId');
  const productId = searchParams.get('productId');

  const now = new Date();
  let startDate: Date;
  let endDate: Date = now;

  switch (period) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - now.getDay());
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'custom':
      startDate = from ? new Date(from) : new Date(0);
      endDate = to ? new Date(to) : now;
      break;
    default:
      startDate = new Date(0);
  }

  const where: any = {
    status: 'PAID',
    createdAt: { gte: startDate, lte: endDate },
    ...(employeeId && { employeeId }),
    ...(sessionId && { sessionId }),
    ...(productId && { items: { some: { productId } } }),
  };

  const orders = await prisma.order.findMany({
    where,
    include: { items: { include: { product: { include: { category: true } } } } },
  });

  // Summary metrics
  const totalOrders = orders.length;
  const revenue = orders.reduce((sum, o) => sum + o.total, 0);
  const avgOrderValue = totalOrders > 0 ? revenue / totalOrders : 0;

  // Sales trend (group by day)
  const trendMap: Record<string, { revenue: number; count: number }> = {};
  orders.forEach(o => {
    const day = o.createdAt.toISOString().split('T')[0];
    if (!trendMap[day]) trendMap[day] = { revenue: 0, count: 0 };
    trendMap[day].revenue += o.total;
    trendMap[day].count += 1;
  });
  const salesTrend = Object.entries(trendMap).map(([date, v]) => ({ date, ...v })).sort((a, b) => a.date.localeCompare(b.date));

  // Top products
  const productMap: Record<string, { name: string; qty: number; revenue: number }> = {};
  orders.forEach(o => o.items.forEach(i => {
    if (!productMap[i.productId]) productMap[i.productId] = { name: i.product.name, qty: 0, revenue: 0 };
    productMap[i.productId].qty += i.quantity;
    productMap[i.productId].revenue += i.lineTotal;
  }));
  const topProducts = Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

  // Top categories
  const categoryMap: Record<string, { name: string; color: string; revenue: number }> = {};
  orders.forEach(o => o.items.forEach(i => {
    const cat = i.product.category;
    if (!categoryMap[cat.id]) categoryMap[cat.id] = { name: cat.name, color: cat.color, revenue: 0 };
    categoryMap[cat.id].revenue += i.lineTotal;
  }));
  const topCategories = Object.values(categoryMap).sort((a, b) => b.revenue - a.revenue);

  // Top orders
  const topOrders = [...orders].sort((a, b) => b.total - a.total).slice(0, 10)
    .map(o => ({ orderNumber: o.orderNumber, total: o.total, createdAt: o.createdAt }));

  return NextResponse.json({
    summary: { totalOrders, revenue, avgOrderValue },
    salesTrend, topProducts, topCategories, topOrders,
  });
}
```

---

## 8.2 Dashboard Page — `src/app/(backend)/dashboard/page.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function Dashboard() {
  const [period, setPeriod] = useState('today');
  const [data, setData] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [filters, setFilters] = useState({ employeeId: '', sessionId: '', productId: '' });

  useEffect(() => {
    fetch('/api/users').then(r => r.json()).then(setEmployees);
    fetch('/api/products').then(r => r.json()).then(setProducts);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams({ period, ...filters });
    fetch(`/api/reports?${params}`).then(r => r.json()).then(setData);
  }, [period, filters]);

  async function exportReport(format: 'pdf' | 'xls') {
    const params = new URLSearchParams({ period, ...filters, format });
    window.open(`/api/reports/export?${params}`, '_blank');
  }

  if (!data) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap gap-2 items-center">
        {['today', 'week', 'month'].map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`px-3 py-1 rounded-full border text-sm capitalize ${period === p ? 'bg-black text-white' : ''}`}>
            {p === 'today' ? 'Today' : p === 'week' ? 'This Week' : 'This Month'}
          </button>
        ))}

        <select onChange={e => setFilters(f => ({ ...f, employeeId: e.target.value }))} className="border rounded p-1 text-sm">
          <option value="">All Employees</option>
          {employees.map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>

        <select onChange={e => setFilters(f => ({ ...f, productId: e.target.value }))} className="border rounded p-1 text-sm">
          <option value="">All Products</option>
          {products.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>

        <div className="ml-auto flex gap-2">
          <button onClick={() => exportReport('pdf')} className="border rounded px-3 py-1 text-sm">Export PDF</button>
          <button onClick={() => exportReport('xls')} className="border rounded px-3 py-1 text-sm">Export XLS</button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="border rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold">{data.summary.totalOrders}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-gray-500">Revenue</p>
          <p className="text-2xl font-bold">₹{data.summary.revenue.toFixed(2)}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-gray-500">Avg Order Value</p>
          <p className="text-2xl font-bold">₹{data.summary.avgOrderValue.toFixed(2)}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Sales Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.salesTrend}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#000" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Top Categories</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={data.topCategories} dataKey="revenue" nameKey="name" outerRadius={80} label>
                {data.topCategories.map((c: any, i: number) => <Cell key={i} fill={c.color} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Top Products</h3>
          <table className="w-full text-sm">
            <thead><tr className="text-left border-b"><th>Product</th><th>Qty</th><th>Revenue</th></tr></thead>
            <tbody>
              {data.topProducts.map((p: any, i: number) => (
                <tr key={i} className="border-b"><td className="py-1">{p.name}</td><td>{p.qty}</td><td>₹{p.revenue.toFixed(2)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Top Categories</h3>
          <table className="w-full text-sm">
            <thead><tr className="text-left border-b"><th>Category</th><th>Revenue</th></tr></thead>
            <tbody>
              {data.topCategories.map((c: any, i: number) => (
                <tr key={i} className="border-b"><td className="py-1">{c.name}</td><td>₹{c.revenue.toFixed(2)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-2">Top Orders</h3>
        <table className="w-full text-sm">
          <thead><tr className="text-left border-b"><th>Order #</th><th>Date</th><th>Amount</th></tr></thead>
          <tbody>
            {data.topOrders.map((o: any, i: number) => (
              <tr key={i} className="border-b"><td className="py-1">#{o.orderNumber}</td><td>{new Date(o.createdAt).toLocaleDateString()}</td><td>₹{o.total.toFixed(2)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

## 8.3 Export — `src/app/api/reports/export/route.ts`

```typescript
import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

// Reuses the report data logic — extract it into a shared function in production
async function getReportData(searchParams: URLSearchParams) {
  // Call the same logic as /api/reports — refactor into src/lib/reportData.ts and import here
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/reports?${searchParams}`);
  return res.json();
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const format = searchParams.get('format');
  const data = await getReportData(searchParams);

  if (format === 'xls') {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Top Products');
    sheet.addRow(['Product', 'Quantity Sold', 'Revenue']);
    data.topProducts.forEach((p: any) => sheet.addRow([p.name, p.qty, p.revenue]));

    const buffer = await workbook.xlsx.writeBuffer();
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="report.xlsx"',
      },
    });
  }

  if (format === 'pdf') {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));

    doc.fontSize(18).text('Sales Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Total Orders: ${data.summary.totalOrders}`);
    doc.text(`Revenue: ₹${data.summary.revenue.toFixed(2)}`);
    doc.text(`Average Order Value: ₹${data.summary.avgOrderValue.toFixed(2)}`);
    doc.moveDown();
    doc.text('Top Products:', { underline: true });
    data.topProducts.forEach((p: any) => doc.text(`${p.name} — Qty: ${p.qty}, Revenue: ₹${p.revenue.toFixed(2)}`));

    doc.end();

    return new Promise<NextResponse>((resolve) => {
      doc.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve(new NextResponse(buffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="report.pdf"',
          },
        }));
      });
    });
  }

  return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
}
```

---

## Checkpoint

- [ ] Dashboard loads with Today/Week/Month period filters
- [ ] Employee, Session, Product filters update all components
- [ ] Sales Trend chart, Top Categories pie chart render
- [ ] Top Products, Top Categories, Top Orders tables populate
- [ ] PDF and XLS export download correctly

Next: **Part 9 — Standout Feature Implementations (All 5)**
