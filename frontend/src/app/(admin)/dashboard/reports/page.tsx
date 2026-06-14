'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '@/api/axios';
import { Download, Calendar, Users, ShoppingBag, FileText } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[#EFECE7] p-3.5 rounded-xl shadow-md text-xs font-medium">
        <p className="text-[#8E827B] mb-0.5">{label}</p>
        <p className="text-cafe-primary font-bold text-sm">
          ₹{payload[0].value.toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[#EFECE7] p-3.5 rounded-xl shadow-md text-xs font-medium">
        <p className="text-cafe-text mb-0.5">{payload[0].name}</p>
        <p className="text-cafe-primary font-bold text-sm">
          ₹{payload[0].value.toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

export default function ReportsPage() {
  const [period, setPeriod] = useState('today');
  const [data, setData] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [filters, setFilters] = useState({ employeeId: '', sessionId: '', productId: '' });

  useEffect(() => {
    // Fetch filter data
    api.get('/employees').then(res => setEmployees(res.data || [])).catch(() => {});
    api.get('/products').then(res => setProducts(res.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams({ period, ...filters });
    api.get(`/reports?${params.toString()}`)
      .then(res => setData(res.data))
      .catch((e) => console.error(e));
  }, [period, filters]);

  async function exportReport(format: 'pdf' | 'xls') {
    const params = new URLSearchParams({ period, ...filters, format });
    window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/reports/export?${params.toString()}`, '_blank');
  }

  if (!data) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#C86A50]/20 border-t-[#C86A50] animate-spin" />
        <p className="text-sm text-[#8E827B] font-medium animate-pulse">Brewing your reports...</p>
      </div>
    );
  }

  const chartColors = ['#C86A50', '#D99C4C', '#557A61', '#D3524B', '#5076a8'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-cafe-text">Reports Dashboard</h1>
      </div>

      {/* Filter and Export Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#EFECE7] flex flex-wrap gap-3 items-center justify-between shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Period Selectors */}
          <div className="flex bg-[#FAF8F5] border border-[#EFECE7] p-1 rounded-xl">
            {['today', 'week', 'month'].map(p => (
              <button 
                key={p} 
                onClick={() => setPeriod(p)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                  period === p 
                    ? 'bg-white text-cafe-primary shadow-xs border border-[#EFECE7]' 
                    : 'text-[#8E827B] hover:text-cafe-text'
                }`}
              >
                {p === 'today' ? 'Today' : p === 'week' ? 'This Week' : 'This Month'}
              </button>
            ))}
          </div>

          {/* Employee Dropdown */}
          <div className="flex items-center gap-2">
            <Users size={15} className="text-[#8E827B]" />
            <select 
              value={filters.employeeId} 
              onChange={e => setFilters(f => ({ ...f, employeeId: e.target.value }))} 
              className="paper-input rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none"
            >
              <option value="">All Employees</option>
              {employees.map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>

          {/* Product Dropdown */}
          <div className="flex items-center gap-2">
            <ShoppingBag size={15} className="text-[#8E827B]" />
            <select 
              value={filters.productId} 
              onChange={e => setFilters(f => ({ ...f, productId: e.target.value }))} 
              className="paper-input rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none"
            >
              <option value="">All Products</option>
              {products.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>

        {/* Exports */}
        <div className="flex gap-2">
          <button 
            onClick={() => exportReport('pdf')} 
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold border border-[#EFECE7] text-cafe-text bg-[#FAF8F5] hover:bg-white hover:border-[#ebdcd0] rounded-xl transition-colors cursor-pointer"
          >
            <FileText size={14} className="text-[#8E827B]" />
            Export PDF
          </button>
          <button 
            onClick={() => exportReport('xls')} 
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold border border-[#EFECE7] text-cafe-text bg-[#FAF8F5] hover:bg-white hover:border-[#ebdcd0] rounded-xl transition-colors cursor-pointer"
          >
            <Download size={14} className="text-[#8E827B]" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="paper-card rounded-xl p-6">
          <p className="text-xs font-semibold text-[#8E827B] uppercase tracking-wider">Total Orders</p>
          <p className="text-3xl font-extrabold text-cafe-text mt-2">{data.summary.totalOrders}</p>
        </div>
        <div className="paper-card rounded-xl p-6 border-l-4 border-l-[#557A61]">
          <p className="text-xs font-semibold text-[#8E827B] uppercase tracking-wider">Revenue</p>
          <p className="text-3xl font-extrabold text-cafe-success mt-2">₹{data.summary.revenue.toFixed(2)}</p>
        </div>
        <div className="paper-card rounded-xl p-6">
          <p className="text-xs font-semibold text-[#8E827B] uppercase tracking-wider">Avg Order Value</p>
          <p className="text-3xl font-extrabold text-cafe-text mt-2">₹{data.summary.avgOrderValue.toFixed(2)}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[#EFECE7] p-6 shadow-xs">
          <h3 className="font-bold text-cafe-text text-base mb-6">Sales Trend</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.salesTrend}>
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: '#8E827B' }} 
                  axisLine={{ stroke: '#EFECE7' }} 
                  tickLine={{ stroke: '#EFECE7' }} 
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#8E827B' }} 
                  axisLine={{ stroke: '#EFECE7' }} 
                  tickLine={{ stroke: '#EFECE7' }} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#C86A50" 
                  strokeWidth={3} 
                  dot={{ r: 3.5, fill: '#C86A50', strokeWidth: 0 }} 
                  activeDot={{ r: 6, fill: '#b3563d' }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#EFECE7] p-6 shadow-xs">
          <h3 className="font-bold text-cafe-text text-base mb-6">Top Categories</h3>
          {data.topCategories.length > 0 ? (
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={data.topCategories} 
                    dataKey="revenue" 
                    nameKey="name" 
                    outerRadius={80} 
                    innerRadius={45}
                    paddingAngle={3}
                    label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                    labelLine={{ stroke: '#EFECE7' }}
                  >
                    {data.topCategories.map((c: any, i: number) => (
                      <Cell key={i} fill={chartColors[i % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    iconType="circle" 
                    iconSize={8}
                    wrapperStyle={{ fontSize: 11, color: '#2C2623' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
             <div className="h-[250px] flex items-center justify-center text-[#8E827B] text-sm">No data available</div>
          )}
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[#EFECE7] overflow-hidden shadow-xs">
          <div className="p-5 border-b border-[#EFECE7]">
            <h3 className="font-bold text-cafe-text">Top Products</h3>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-[#8E827B] uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">Product</th>
                <th className="px-5 py-3.5 text-center">Qty</th>
                <th className="px-5 py-3.5 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFECE7] text-cafe-text">
              {data.topProducts.map((p: any, i: number) => (
                <tr key={i} className="hover:bg-[#FAF8F5]/50 transition-colors">
                  <td className="px-5 py-3.5 font-medium">{p.name}</td>
                  <td className="px-5 py-3.5 text-center font-medium text-[#8E827B]">{p.qty}</td>
                  <td className="px-5 py-3.5 text-right font-semibold">₹{p.revenue.toFixed(2)}</td>
                </tr>
              ))}
              {data.topProducts.length === 0 && (
                <tr><td colSpan={3} className="px-5 py-8 text-center text-[#8E827B]">No data available</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-xl border border-[#EFECE7] overflow-hidden shadow-xs">
          <div className="p-5 border-b border-[#EFECE7]">
            <h3 className="font-bold text-cafe-text">Top Orders</h3>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-[#8E827B] uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">Order #</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFECE7] text-cafe-text">
              {data.topOrders.map((o: any, i: number) => (
                <tr key={i} className="hover:bg-[#FAF8F5]/50 transition-colors">
                  <td className="px-5 py-3.5 font-medium">#{o.orderNumber}</td>
                  <td className="px-5 py-3.5 text-[#8E827B]">{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5 text-right font-bold text-cafe-success">₹{o.total.toFixed(2)}</td>
                </tr>
              ))}
              {data.topOrders.length === 0 && (
                <tr><td colSpan={3} className="px-5 py-8 text-center text-[#8E827B]">No data available</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
