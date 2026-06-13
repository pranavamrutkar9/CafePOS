"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, X, Archive, Lock } from "lucide-react";

export default function UsersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Users & Employees</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-cafe-primary hover:bg-cafe-primary-hover text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Add User
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 font-bold text-gray-900">Admin User</td>
              <td className="px-6 py-4 text-gray-500">admin@cafe.com</td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                  Admin
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                  Active
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex justify-end gap-2">
                  <button onClick={() => setIsPasswordModalOpen(true)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors" title="Change Password"><Lock size={18} /></button>
                  <button className="p-2 text-gray-400 hover:text-cafe-warning hover:bg-amber-50 rounded-lg transition-colors" title="Archive"><Archive size={18} /></button>
                  <button className="p-2 text-gray-400 hover:text-cafe-danger hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 size={18} /></button>
                </div>
              </td>
            </tr>
            <tr className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 font-bold text-gray-900">John Cashier</td>
              <td className="px-6 py-4 text-gray-500">john@cafe.com</td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                  Cashier
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                  Archived
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex justify-end gap-2">
                  <button onClick={() => setIsPasswordModalOpen(true)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors" title="Change Password"><Lock size={18} /></button>
                  <button className="p-2 text-gray-400 hover:text-cafe-warning hover:bg-amber-50 rounded-lg transition-colors" title="Archive"><Archive size={18} /></button>
                  <button className="p-2 text-gray-400 hover:text-cafe-danger hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 size={18} /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Add User</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cafe-primary" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cafe-primary" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cafe-primary bg-white">
                  <option>Admin</option>
                  <option>Cashier</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Initial Password</label>
                <input type="password" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cafe-primary" placeholder="••••••••" />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3 bg-gray-50 rounded-b-xl">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-white">Cancel</button>
              <button className="flex-1 py-2 bg-cafe-primary text-white rounded-lg font-medium hover:bg-cafe-primary-hover">Save User</button>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
              <button onClick={() => setIsPasswordModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input type="password" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cafe-primary" placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input type="password" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cafe-primary" placeholder="••••••••" />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3 bg-gray-50 rounded-b-xl">
              <button onClick={() => setIsPasswordModalOpen(false)} className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-white">Cancel</button>
              <button className="flex-1 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800">Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
