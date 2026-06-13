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
    <div className="h-full flex flex-col max-w-7xl mx-auto w-full p-4 md:p-8 animate-in fade-in text-[#2c2623]">
      <OrderDetailModal 
        isOpen={!!selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
        order={selectedOrder} 
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#2c2623] tracking-tight">Orders</h1>
          <p className="text-[#8e827b] mt-1 font-medium">View and manage order history</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8e827b]" size={18} />
          <input 
            type="text" 
            placeholder="Search by Order # or Customer..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#e6e1da] rounded-xl text-[#2c2623] placeholder-[#a09690] focus:outline-none focus:border-[#c86a50] focus:ring-1 focus:ring-[#c86a50]/20 transition-all shadow-sm text-sm"
          />
        </div>
        <div className="relative w-full sm:w-auto">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8e827b]" size={18} />
          <input 
            type="date" 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full sm:w-48 pl-10 pr-4 py-2.5 bg-white border border-[#e6e1da] rounded-xl text-[#2c2623] focus:outline-none focus:border-[#c86a50] transition-colors shadow-sm text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-[#efece7] shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#faf8f5] border-b border-[#efece7] text-[#8e827b] text-xs font-bold uppercase tracking-wider">
                <th className="p-4 font-extrabold">Date</th>
                <th className="p-4 font-extrabold">Order Number</th>
                <th className="p-4 font-extrabold">Customer</th>
                <th className="p-4 font-extrabold text-right">Amount</th>
                <th className="p-4 font-extrabold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2efea]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#8e827b] font-medium text-sm">
                    No orders found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-[#faf8f5] transition-colors group">
                    <td className="p-4 text-xs text-[#2c2623] font-medium">
                      {new Date(order.date).toLocaleDateString()} <span className="text-[#8e827b]">{new Date(order.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="text-[#c86a50] font-bold hover:underline focus:outline-none cursor-pointer text-sm"
                      >
                        {order.orderNumber}
                      </button>
                    </td>
                    <td className="p-4 text-sm text-[#2c2623] font-medium">
                      {order.customerName || <span className="text-[#8e827b] italic font-normal">Walk-in</span>}
                    </td>
                    <td className="p-4 text-right font-extrabold text-[#2c2623] text-sm">
                      ${order.amount.toFixed(2)}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-2xs font-extrabold uppercase tracking-wide ${
                        order.status === "Paid" ? "bg-[#557a61]/8 text-[#43634e] border border-[#557a61]/15" :
                        order.status === "Cancelled" ? "bg-[#d3524b]/8 text-[#a44f38] border border-[#d3524b]/15" :
                        "bg-[#8e827b]/8 text-[#2c2623] border border-[#8e827b]/15"
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
