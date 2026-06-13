"use client";

import { useState } from "react";
import { Plus, Search, Edit2, Trash2, X, Phone, Mail } from "lucide-react";

export default function CustomersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
      <div className="p-6 border-b border-gray-200 bg-white shrink-0 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage customers for digital receipts and loyalty</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-cafe-primary hover:bg-cafe-primary-hover text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Add Customer
        </button>
      </div>

      <div className="p-6 bg-white border-b border-gray-200 shrink-0">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by name, email, or phone..." 
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cafe-primary"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Phone Number</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-900">John Doe</td>
                <td className="px-6 py-4 text-gray-500 flex items-center gap-2"><Mail size={16}/> john.doe@example.com</td>
                <td className="px-6 py-4 text-gray-500"><div className="flex items-center gap-2"><Phone size={16}/> +91 98765 43210</div></td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button className="px-3 py-1 bg-gray-100 hover:bg-cafe-primary hover:text-white text-gray-700 rounded-md text-sm font-medium transition-colors">
                      Select for Order
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-cafe-info bg-white shadow-sm rounded-md border border-gray-100"><Edit2 size={16}/></button>
                    <button className="p-1.5 text-gray-400 hover:text-cafe-danger bg-white shadow-sm rounded-md border border-gray-100"><Trash2 size={16}/></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Add Customer</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cafe-primary" placeholder="e.g. Alice Smith" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address (for receipts)</label>
                <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cafe-primary" placeholder="alice@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input type="tel" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cafe-primary" placeholder="+91" />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3 bg-gray-50 rounded-b-xl">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-white">Cancel</button>
              <button className="flex-1 py-2 bg-cafe-primary text-white rounded-lg font-medium hover:bg-cafe-primary-hover">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
