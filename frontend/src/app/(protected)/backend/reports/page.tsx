"use client";

import { useState, useMemo } from "react";
import { Download, FileText, X, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

const COLORS = ["#c0392b", "#2980b9", "#f39c12", "#27ae60", "#8e44ad"];

export default function ReportsPage() {
  const [filterDate, setFilterDate] = useState("Last 7 Days");
  const [filterUser, setFilterUser] = useState("All");
  const [filterSession, setFilterSession] = useState("All");
  const [filterProduct, setFilterProduct] = useState("All");

  // Mock data generator based on filters to show interactivity
  const { summary, trendData, pieData, topOrders, topProducts, topCategories } = useMemo(() => {
    // Math.random seed mock to "change" data when filters change
    const multiplier = filterDate === "Last 7 Days" ? 1 : filterDate === "This Month" ? 4 : 0.5;
    
    return {
      summary: {
        orders: Math.floor(125 * multiplier),
        revenue: 1450.50 * multiplier,
        aov: (1450.50 / 125) * (multiplier > 1 ? 1.1 : 0.9),
      },
      trendData: [
        { name: "Mon", revenue: 120 * multiplier },
        { name: "Tue", revenue: 200 * multiplier },
        { name: "Wed", revenue: 150 * multiplier },
        { name: "Thu", revenue: 280 * multiplier },
        { name: "Fri", revenue: 350 * multiplier },
        { name: "Sat", revenue: 420 * multiplier },
        { name: "Sun", revenue: 390 * multiplier },
      ],
      pieData: [
        { name: "Hot Coffee", value: 400 * multiplier },
        { name: "Cold Brew", value: 300 * multiplier },
        { name: "Pastries", value: 300 * multiplier },
        { name: "Sandwiches", value: 200 * multiplier },
      ],
      topOrders: [
        { id: "ORD-101", sessions: "S-12", pos: "POS-1", date: "Today", customer: "John Doe", employee: "Admin", total: 45.50 },
        { id: "ORD-098", sessions: "S-12", pos: "POS-2", date: "Today", customer: "Walk-in", employee: "Staff", total: 12.00 },
        { id: "ORD-085", sessions: "S-11", pos: "POS-1", date: "Yesterday", customer: "Jane Smith", employee: "Admin", total: 85.00 },
      ],
      topProducts: [
        { name: "Espresso", qty: Math.floor(150 * multiplier), rev: 450 * multiplier },
        { name: "Cappuccino", qty: Math.floor(120 * multiplier), rev: 480 * multiplier },
        { name: "Turkey Club", qty: Math.floor(80 * multiplier), rev: 680 * multiplier },
        { name: "Latte", qty: Math.floor(75 * multiplier), rev: 337 * multiplier },
      ],
      topCategories: [
        { name: "Hot Coffee", rev: 1267 * multiplier },
        { name: "Sandwiches", rev: 850 * multiplier },
        { name: "Pastries", rev: 620 * multiplier },
        { name: "Cold Brew", rev: 450 * multiplier },
      ]
    };
  }, [filterDate, filterUser, filterSession, filterProduct]);

  const clearFilters = () => {
    setFilterDate("Last 7 Days");
    setFilterUser("All");
    setFilterSession("All");
    setFilterProduct("All");
  };

  return (
    <div className="h-full flex flex-col space-y-6 pb-6 animate-in fade-in">
      
      {/* Header & Filters */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <h1 className="text-2xl font-bold text-white shrink-0">Reports Dashboard</h1>
        
        <div className="flex flex-wrap items-center gap-3">
          <select 
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="bg-[#1e1e1e] border border-gray-700 text-sm rounded-lg px-3 py-1.5 text-gray-200 focus:outline-none focus:border-cafe-primary"
          >
            <option>Today</option>
            <option>Last 7 Days</option>
            <option>This Month</option>
          </select>
          
          <select 
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="bg-[#1e1e1e] border border-gray-700 text-sm rounded-lg px-3 py-1.5 text-gray-200 focus:outline-none focus:border-cafe-primary"
          >
            <option value="All">All Users</option>
            <option value="Admin">Admin</option>
            <option value="Staff">Staff</option>
          </select>

          <select 
            value={filterSession}
            onChange={(e) => setFilterSession(e.target.value)}
            className="bg-[#1e1e1e] border border-gray-700 text-sm rounded-lg px-3 py-1.5 text-gray-200 focus:outline-none focus:border-cafe-primary"
          >
            <option value="All">All Sessions</option>
            <option value="S-12">S-12</option>
            <option value="S-11">S-11</option>
          </select>

          <select 
            value={filterProduct}
            onChange={(e) => setFilterProduct(e.target.value)}
            className="bg-[#1e1e1e] border border-gray-700 text-sm rounded-lg px-3 py-1.5 text-gray-200 focus:outline-none focus:border-cafe-primary"
          >
            <option value="All">All Products</option>
            <option value="Coffee">Coffee</option>
            <option value="Food">Food</option>
          </select>

          <button 
            onClick={clearFilters}
            className="p-1.5 hover:bg-gray-700 rounded-md text-gray-400 hover:text-white transition-colors"
            title="Clear Filters"
          >
            <X size={16} />
          </button>

          <div className="h-6 w-px bg-gray-700 mx-2 hidden sm:block"></div>

          <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white px-3 py-1.5 rounded-lg text-sm transition-colors shadow-sm">
            <FileText size={14} /> PDF
          </button>
          <button className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm transition-colors shadow-sm">
            <Download size={14} /> XLS
          </button>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1e1e1e] border border-gray-700 rounded-xl p-6 shadow-md">
          <div className="text-gray-400 text-sm font-medium mb-2">Total Orders</div>
          <div className="flex items-end justify-between">
            <div className="text-3xl font-bold text-white">{summary.orders}</div>
            <div className="flex items-center gap-1 text-green-400 text-sm font-medium bg-green-400/10 px-2 py-1 rounded-md">
              <ArrowUpRight size={14} /> 12.5%
            </div>
          </div>
        </div>
        <div className="bg-[#1e1e1e] border border-gray-700 rounded-xl p-6 shadow-md">
          <div className="text-gray-400 text-sm font-medium mb-2">Total Revenue</div>
          <div className="flex items-end justify-between">
            <div className="text-3xl font-bold text-white">${summary.revenue.toFixed(2)}</div>
            <div className="flex items-center gap-1 text-green-400 text-sm font-medium bg-green-400/10 px-2 py-1 rounded-md">
              <ArrowUpRight size={14} /> 8.2%
            </div>
          </div>
        </div>
        <div className="bg-[#1e1e1e] border border-gray-700 rounded-xl p-6 shadow-md">
          <div className="text-gray-400 text-sm font-medium mb-2">Average Order Value</div>
          <div className="flex items-end justify-between">
            <div className="text-3xl font-bold text-white">${summary.aov.toFixed(2)}</div>
            <div className="flex items-center gap-1 text-cafe-danger text-sm font-medium bg-red-400/10 px-2 py-1 rounded-md">
              <ArrowDownRight size={14} /> 2.1%
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart */}
        <div className="lg:col-span-2 bg-[#1e1e1e] border border-gray-700 rounded-xl p-6 shadow-md h-80 flex flex-col">
          <h2 className="text-white font-semibold mb-4">Sales Trend</h2>
          <div className="flex-1 w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c0392b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#c0392b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#2a2a2a', borderColor: '#4b5563', color: '#fff', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#c0392b" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Donut Chart */}
        <div className="bg-[#1e1e1e] border border-gray-700 rounded-xl p-6 shadow-md h-80 flex flex-col">
          <h2 className="text-white font-semibold mb-2">Top Categories</h2>
          <div className="flex-1 w-full h-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#2a2a2a', borderColor: '#4b5563', color: '#fff', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: any) => `$${Number(value || 0).toFixed(2)}`}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#9CA3AF' }} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
              <span className="text-gray-400 text-sm font-medium">Revenue</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Orders Table */}
      <div className="bg-[#1e1e1e] border border-gray-700 rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700">
          <h2 className="text-white font-semibold">Top Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#2a2a2a]">
              <tr>
                <th className="px-6 py-3 border-b border-gray-700 text-xs font-semibold text-gray-400 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 border-b border-gray-700 text-xs font-semibold text-gray-400 uppercase tracking-wider">Session</th>
                <th className="px-6 py-3 border-b border-gray-700 text-xs font-semibold text-gray-400 uppercase tracking-wider">POS</th>
                <th className="px-6 py-3 border-b border-gray-700 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 border-b border-gray-700 text-xs font-semibold text-gray-400 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 border-b border-gray-700 text-xs font-semibold text-gray-400 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 border-b border-gray-700 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {topOrders.map((ord, i) => (
                <tr key={i} className="hover:bg-gray-800/50 transition-colors border-b border-gray-700/50 last:border-0">
                  <td className="px-6 py-4 text-cafe-primary font-medium">{ord.id}</td>
                  <td className="px-6 py-4 text-gray-300">{ord.sessions}</td>
                  <td className="px-6 py-4 text-gray-300">{ord.pos}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{ord.date}</td>
                  <td className="px-6 py-4 text-gray-300">{ord.customer}</td>
                  <td className="px-6 py-4 text-gray-300">{ord.employee}</td>
                  <td className="px-6 py-4 text-white font-bold text-right">${ord.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side by Side Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Products */}
        <div className="bg-[#1e1e1e] border border-gray-700 rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-white font-semibold">Top Products</h2>
          </div>
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#2a2a2a]">
              <tr>
                <th className="px-6 py-3 border-b border-gray-700 text-xs font-semibold text-gray-400 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 border-b border-gray-700 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Qty</th>
                <th className="px-6 py-3 border-b border-gray-700 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p, i) => (
                <tr key={i} className="hover:bg-gray-800/50 transition-colors border-b border-gray-700/50 last:border-0">
                  <td className="px-6 py-3 text-gray-200">{p.name}</td>
                  <td className="px-6 py-3 text-gray-400 text-center">{p.qty}</td>
                  <td className="px-6 py-3 text-white font-medium text-right">${p.rev.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Top Categories */}
        <div className="bg-[#1e1e1e] border border-gray-700 rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-white font-semibold">Top Categories</h2>
          </div>
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#2a2a2a]">
              <tr>
                <th className="px-6 py-3 border-b border-gray-700 text-xs font-semibold text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 border-b border-gray-700 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topCategories.map((c, i) => (
                <tr key={i} className="hover:bg-gray-800/50 transition-colors border-b border-gray-700/50 last:border-0">
                  <td className="px-6 py-3 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                    <span className="text-gray-200">{c.name}</span>
                  </td>
                  <td className="px-6 py-3 text-white font-medium text-right">${c.rev.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
