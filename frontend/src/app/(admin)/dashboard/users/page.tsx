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
        <h1 className="text-2xl font-bold text-cafe-text">Users & Employees</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-terracotta px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 cursor-pointer"
        >
          <Plus size={20} />
          Add User
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-[#EFECE7] overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#FAF8F5] border-b border-[#EFECE7] text-[#8E827B] font-semibold uppercase tracking-wider">
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EFECE7] text-cafe-text font-medium">
            <tr className="hover:bg-[#FAF8F5]/50 transition-colors">
              <td className="px-6 py-4 font-bold text-sm">Admin User</td>
              <td className="px-6 py-4 text-[#8E827B]">admin@cafe.com</td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold badge-terracotta">
                  Admin
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold badge-sage">
                  Active
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex justify-end gap-1.5">
                  <button onClick={() => setIsPasswordModalOpen(true)} className="p-1.5 text-[#8E827B] hover:text-cafe-text hover:bg-[#FAF8F5] rounded-lg transition-colors cursor-pointer" title="Change Password"><Lock size={15} /></button>
                  <button className="p-1.5 text-[#8E827B] hover:text-cafe-warning hover:bg-[#FAF8F5] rounded-lg transition-colors cursor-pointer" title="Archive"><Archive size={15} /></button>
                  <button className="p-1.5 text-[#8E827B] hover:text-cafe-danger hover:bg-[#FAF8F5] rounded-lg transition-colors cursor-pointer" title="Delete"><Trash2 size={15} /></button>
                </div>
              </td>
            </tr>
            <tr className="hover:bg-[#FAF8F5]/50 transition-colors">
              <td className="px-6 py-4 font-bold text-sm">John Cashier</td>
              <td className="px-6 py-4 text-[#8E827B]">john@cafe.com</td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#FAF8F5] border border-[#EFECE7] text-[#8E827B]">
                  Cashier
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#FAF8F5] border border-[#EFECE7] text-[#8E827B] opacity-70">
                  Archived
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex justify-end gap-1.5">
                  <button onClick={() => setIsPasswordModalOpen(true)} className="p-1.5 text-[#8E827B] hover:text-cafe-text hover:bg-[#FAF8F5] rounded-lg transition-colors cursor-pointer" title="Change Password"><Lock size={15} /></button>
                  <button className="p-1.5 text-[#8E827B] hover:text-cafe-warning hover:bg-[#FAF8F5] rounded-lg transition-colors cursor-pointer" title="Archive"><Archive size={15} /></button>
                  <button className="p-1.5 text-[#8E827B] hover:text-cafe-danger hover:bg-[#FAF8F5] rounded-lg transition-colors cursor-pointer" title="Delete"><Trash2 size={15} /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#2C2623]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="paper-panel rounded-2xl w-full max-w-md animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-[#EFECE7] flex justify-between items-center bg-white">
              <h2 className="text-lg font-bold text-cafe-text">Add User</h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-1.5 text-[#8E827B] hover:text-cafe-text rounded-full hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 space-y-4 bg-white">
              <div>
                <label className="block text-xs font-semibold text-[#8E827B] uppercase tracking-wider mb-2">Full Name</label>
                <input 
                  type="text" 
                  className="w-full px-3.5 py-2.5 paper-input rounded-xl focus:outline-none" 
                  placeholder="John Doe" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8E827B] uppercase tracking-wider mb-2">Email Address</label>
                <input 
                  type="email" 
                  className="w-full px-3.5 py-2.5 paper-input rounded-xl focus:outline-none" 
                  placeholder="john@example.com" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8E827B] uppercase tracking-wider mb-2">Role</label>
                <select className="w-full px-3.5 py-2.5 paper-input rounded-xl focus:outline-none bg-white">
                  <option>Admin</option>
                  <option>Cashier</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8E827B] uppercase tracking-wider mb-2">Initial Password</label>
                <input 
                  type="password" 
                  className="w-full px-3.5 py-2.5 paper-input rounded-xl focus:outline-none" 
                  placeholder="••••••••" 
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-[#EFECE7] bg-[#FAF8F5] flex gap-3">
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="flex-1 py-2.5 border border-[#E6E1DA] text-cafe-text rounded-xl font-medium bg-white hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button className="flex-1 py-2.5 btn-terracotta rounded-xl font-medium cursor-pointer">
                Save User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-[#2C2623]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="paper-panel rounded-2xl w-full max-w-sm animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-[#EFECE7] flex justify-between items-center bg-white">
              <h2 className="text-lg font-bold text-cafe-text">Change Password</h2>
              <button 
                onClick={() => setIsPasswordModalOpen(false)} 
                className="p-1.5 text-[#8E827B] hover:text-cafe-text rounded-full hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 space-y-4 bg-white">
              <div>
                <label className="block text-xs font-semibold text-[#8E827B] uppercase tracking-wider mb-2">New Password</label>
                <input 
                  type="password" 
                  className="w-full px-3.5 py-2.5 paper-input rounded-xl focus:outline-none" 
                  placeholder="••••••••" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8E827B] uppercase tracking-wider mb-2">Confirm Password</label>
                <input 
                  type="password" 
                  className="w-full px-3.5 py-2.5 paper-input rounded-xl focus:outline-none" 
                  placeholder="••••••••" 
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-[#EFECE7] bg-[#FAF8F5] flex gap-3">
              <button 
                onClick={() => setIsPasswordModalOpen(false)} 
                className="flex-1 py-2.5 border border-[#E6E1DA] text-cafe-text rounded-xl font-medium bg-white hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button className="flex-1 py-2.5 btn-terracotta rounded-xl font-medium cursor-pointer">
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
