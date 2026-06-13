"use client";

import { useState } from "react";
import { Search, ChevronRight, X, Printer, Edit } from "lucide-react";

export default function OrdersListPage() {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const orders = [
    { id: "1042", table: "4", time: "12:45 PM", status: "paid", amount: 892.50, customer: "John Doe" },
    { id: "1043", table: "7", time: "1:15 PM", status: "draft", amount: 450.00, customer: "-" },
    { id: "1044", table: "2", time: "1:30 PM", status: "cancelled", amount: 200.00, customer: "Alice" },
  ];

  return (
    <div className="h-full flex overflow-hidden">
      {/* Left List View */}
      <div className={`w-full ${selectedOrder ? 'hidden md:flex md:w-1/2 lg:w-1/3' : 'flex'} flex-col bg-white border-r border-gray-100 h-full`}>
        <div className="p-6 border-b border-gray-100 shrink-0">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Orders</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search order # or customer..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cafe-primary"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <ul className="divide-y divide-gray-100">
            {orders.map(order => (
              <li key={order.id}>
                <button 
                  onClick={() => setSelectedOrder(order)}
                  className={`w-full text-left p-6 hover:bg-gray-50 transition-colors flex justify-between items-center ${selectedOrder?.id === order.id ? 'bg-orange-50 border-l-4 border-cafe-primary' : 'border-l-4 border-transparent'}`}
                >
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-gray-900">#{order.id}</span>
                      <span className="text-sm font-medium text-gray-500">Table {order.table}</span>
                    </div>
                    <p className="text-sm text-gray-500">{order.customer !== '-' ? order.customer : 'Guest'} • {order.time}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-gray-900">₹{order.amount.toFixed(2)}</p>
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider mt-1 ${
                        order.status === 'paid' ? 'bg-green-100 text-green-700' :
                        order.status === 'draft' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <ChevronRight className="text-gray-300" size={20} />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right Detail View (Screen 20) */}
      <div className={`${!selectedOrder ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-gray-50 h-full`}>
        {!selectedOrder ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <Search size={64} className="mb-4 opacity-50" />
            <p className="text-lg">Select an order to view details</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col bg-white m-6 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Detail Header */}
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-start bg-gray-50 shrink-0">
              <div>
                <button onClick={() => setSelectedOrder(null)} className="md:hidden text-cafe-primary font-medium mb-4 flex items-center gap-1">
                  ← Back to Orders
                </button>
                <div className="flex items-center gap-4 mb-2">
                  <h2 className="text-3xl font-bold text-gray-900">Order #{selectedOrder.id}</h2>
                  <span className={`px-3 py-1 rounded-md text-sm font-bold uppercase tracking-wider ${
                    selectedOrder.status === 'paid' ? 'bg-green-100 text-green-700' :
                    selectedOrder.status === 'draft' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <p className="text-gray-500 font-medium">Table {selectedOrder.table} • {selectedOrder.time} • Employee: Admin User</p>
              </div>
              
              {/* Conditional Actions */}
              <div className="flex gap-2">
                {selectedOrder.status === 'draft' && (
                  <>
                    <button className="px-4 py-2 bg-cafe-primary hover:bg-cafe-primary-hover text-white rounded-lg font-medium flex items-center gap-2 transition-colors">
                      <Edit size={18} />
                      Edit Order
                    </button>
                    <button className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium transition-colors">
                      Delete
                    </button>
                  </>
                )}
                {selectedOrder.status === 'paid' && (
                  <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium flex items-center gap-2 transition-colors">
                    <Printer size={18} />
                    Print Receipt
                  </button>
                )}
              </div>
            </div>

            {selectedOrder.status === 'paid' && (
              <div className="bg-blue-50 text-cafe-info p-3 text-sm font-medium text-center border-b border-blue-100 flex justify-center items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cafe-info"></span>
                View Only - Order is already paid
              </div>
            )}

            {/* Receipt Table */}
            <div className="flex-1 overflow-y-auto p-8">
              <table className="w-full text-left">
                <thead className="border-b-2 border-gray-100 text-gray-500">
                  <tr>
                    <th className="py-3 font-medium">Item</th>
                    <th className="py-3 font-medium text-center">Qty</th>
                    <th className="py-3 font-medium text-right">Unit Price</th>
                    <th className="py-3 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-4 font-semibold text-gray-900">Cappuccino</td>
                    <td className="py-4 text-center">2</td>
                    <td className="py-4 text-right">₹250.00</td>
                    <td className="py-4 text-right font-bold text-gray-900">₹500.00</td>
                  </tr>
                  <tr>
                    <td className="py-4 font-semibold text-gray-900">Club Sandwich</td>
                    <td className="py-4 text-center">1</td>
                    <td className="py-4 text-right">₹350.00</td>
                    <td className="py-4 text-right font-bold text-gray-900">₹350.00</td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-8 border-t-2 border-gray-100 pt-6 flex justify-end">
                <div className="w-64 space-y-2 text-right">
                  <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>₹850.00</span></div>
                  <div className="flex justify-between text-gray-500"><span>Tax (5%)</span><span>₹42.50</span></div>
                  <div className="flex justify-between text-gray-900 font-bold text-2xl pt-4 border-t border-gray-100">
                    <span>Total</span><span>₹892.50</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
