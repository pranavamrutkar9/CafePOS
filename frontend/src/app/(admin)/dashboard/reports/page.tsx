'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { apiClient } from '@/lib/apiClient';

export default function ReportsPage() {
  const [period, setPeriod] = useState('today');
  const [data, setData] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [filters, setFilters] = useState({ employeeId: '', sessionId: '', productId: '' });

  useEffect(() => {
    // Fetch filter data
    apiClient.get('/employees').then(data => setEmployees(data || [])).catch(() => {});
    apiClient.get('/products').then(data => setProducts(data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams({ period, ...filters });
    apiClient.get(`/reports?${params.toString()}`)
      .then(setData)
      .catch((e) => console.error(e));
  }, [period, filters]);

  async function exportReport(format: 'pdf' | 'xls') {
    const params = new URLSearchParams({ period, ...filters, format });
    window.open(`http://localhost:5000/api/reports/export?${params.toString()}`, '_blank');
  }

  if (!data) return <div className="p-4">Loading reports...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Reports Dashboard</h1>
      </div>

      <div className="flex flex-wrap gap-2 items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex gap-2">
          {['today', 'week', 'month'].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium capitalize transition-colors ${period === p ? 'bg-cafe-primary text-white border-cafe-primary' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}>
              {p === 'today' ? 'Today' : p === 'week' ? 'This Week' : 'This Month'}
            </button>
          ))}
        </div>

        <select onChange={e => setFilters(f => ({ ...f, employeeId: e.target.value }))} className="border border-gray-200 rounded-lg p-2 text-sm ml-4">
          <option value="">All Employees</option>
          {employees.map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>

        <select onChange={e => setFilters(f => ({ ...f, productId: e.target.value }))} className="border border-gray-200 rounded-lg p-2 text-sm">
          <option value="">All Products</option>
          {products.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>

        <div className="ml-auto flex gap-2">
          <button onClick={() => exportReport('pdf')} className="bg-gray-100 text-gray-700 border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-200 transition-colors">Export PDF</button>
          <button onClick={() => exportReport('xls')} className="bg-gray-100 text-gray-700 border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-200 transition-colors">Export XLS</button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500 font-medium">Total Orders</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{data.summary.totalOrders}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500 font-medium">Revenue</p>
          <p className="text-3xl font-bold text-green-600 mt-2">₹{data.summary.revenue.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500 font-medium">Avg Order Value</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">₹{data.summary.avgOrderValue.toFixed(2)}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 text-lg mb-6">Sales Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.salesTrend}>
              <XAxis dataKey="date" tick={{fontSize: 12}} />
              <YAxis tick={{fontSize: 12}} />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#FF8A3D" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 text-lg mb-6">Top Categories</h3>
          {data.topCategories.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={data.topCategories} dataKey="revenue" nameKey="name" outerRadius={80} label>
                  {data.topCategories.map((c: any, i: number) => {
                    // Extract hex color if using tailwind classes, fallback to generic colors
                    const colors = ['#f59e0b', '#ef4444', '#ec4899', '#3b82f6', '#10b981'];
                    return <Cell key={i} fill={colors[i % colors.length]} />;
                  })}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
             <div className="h-[250px] flex items-center justify-center text-gray-400">No data available</div>
          )}
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Top Products</h3>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium text-center">Qty</th>
                <th className="px-5 py-3 font-medium text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.topProducts.map((p: any, i: number) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900">{p.name}</td>
                  <td className="px-5 py-3 text-center">{p.qty}</td>
                  <td className="px-5 py-3 text-right">₹{p.revenue.toFixed(2)}</td>
                </tr>
              ))}
              {data.topProducts.length === 0 && (
                <tr><td colSpan={3} className="px-5 py-8 text-center text-gray-400">No data available</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Top Orders</h3>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-5 py-3 font-medium">Order #</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.topOrders.map((o: any, i: number) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900">#{o.orderNumber}</td>
                  <td className="px-5 py-3 text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-right font-medium text-green-600">₹{o.total.toFixed(2)}</td>
                </tr>
              ))}
              {data.topOrders.length === 0 && (
                <tr><td colSpan={3} className="px-5 py-8 text-center text-gray-400">No data available</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
