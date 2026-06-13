"use client";

import { useState } from "react";
import { Order, useOrderStore } from "@/store/useOrderStore";
import OrderDetailModal from "@/components/OrderDetailModal";
import { Search, Filter, Calendar } from "lucide-react";

export default function OrdersPage() {
  const { orders } = useOrderStore();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter(order => {
    const matchSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerName && order.customerName.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchDate = dateFilter ? order.date.startsWith(dateFilter) : true;
    
    return matchSearch && matchDate;
  });

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto w-full p-4 md:p-8 animate-in fade-in">
      <OrderDetailModal 
        isOpen={!!selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
        order={selectedOrder} 
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Orders</h1>
          <p className="text-gray-400 mt-1">View and manage order history</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Search by Order # or Customer..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-cafe-card border border-gray-700 rounded-xl text-white focus:outline-none focus:border-cafe-primary transition-colors shadow-sm"
          />
        </div>
        <div className="relative w-full sm:w-auto">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="date" 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full sm:w-48 pl-10 pr-4 py-2.5 bg-cafe-card border border-gray-700 rounded-xl text-gray-300 focus:outline-none focus:border-cafe-primary transition-colors shadow-sm [color-scheme:dark]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-cafe-card rounded-2xl border border-gray-700 shadow-xl overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1e1e1e] border-b border-gray-700 text-gray-400 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Order Number</th>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold text-right">Amount</th>
                <th className="p-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No orders found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-800/50 transition-colors group">
                    <td className="p-4 text-sm text-gray-300">
                      {new Date(order.date).toLocaleDateString()} <span className="text-gray-500">{new Date(order.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="text-cafe-primary font-medium hover:underline focus:outline-none"
                      >
                        {order.orderNumber}
                      </button>
                    </td>
                    <td className="p-4 text-gray-300">
                      {order.customerName || <span className="text-gray-600 italic">Walk-in</span>}
                    </td>
                    <td className="p-4 text-right font-medium text-white">
                      ${order.amount.toFixed(2)}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        order.status === "Paid" ? "bg-green-500/20 text-green-500 border border-green-500/20" :
                        order.status === "Cancelled" ? "bg-red-500/20 text-red-500 border border-red-500/20" :
                        "bg-gray-500/20 text-gray-400 border border-gray-500/20"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
