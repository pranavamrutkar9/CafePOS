"use client";

import { useState } from "react";
import { Plus, Trash2, Archive, KeyRound, X, Check } from "lucide-react";
import { useUserStore, User } from "@/store/useUserStore";

export default function UsersPage() {
  const { users, addUser, updateUser, deleteUsers, archiveUsers, changePassword } = useUserStore();
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [newPassword, setNewPassword] = useState("");

  const [passwordModalOpen, setPasswordModalOpen] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState("");

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(users.map(u => u.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkAction = (action: 'delete' | 'archive' | 'password') => {
    if (action === 'delete') {
      if (confirm(`Delete ${selectedIds.length} users?`)) {
        deleteUsers(selectedIds);
        setSelectedIds([]);
      }
    } else if (action === 'archive') {
      if (confirm(`Archive ${selectedIds.length} users?`)) {
        archiveUsers(selectedIds);
        setSelectedIds([]);
      }
    } else if (action === 'password') {
      // Only allowed if exactly 1 user is selected
      if (selectedIds.length === 1) {
        setPasswordModalOpen(selectedIds[0]);
        setPasswordInput("");
      }
    }
  };

  const handleChangePasswordSubmit = () => {
    if (passwordModalOpen && passwordInput.trim().length >= 6) {
      changePassword(passwordModalOpen, passwordInput);
      setPasswordModalOpen(null);
      setSelectedIds([]);
      alert("Password updated successfully.");
    } else {
      alert("Password must be at least 6 characters.");
    }
  };

  const handleSaveUser = () => {
    if (!formData.name || !formData.email) return alert("Name and Email required");
    
    addUser({
      ...formData,
      id: Math.random().toString(36).substring(7),
      status: "Active",
      passwordHash: newPassword // mock
    } as User);
    
    setIsFormOpen(false);
  };

  const openNewForm = () => {
    setFormData({
      name: "",
      email: "",
      role: "User",
      status: "Active"
    });
    setNewPassword("");
    setIsFormOpen(true);
  };

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Users & Employees</h1>
        <button 
          onClick={openNewForm}
          className="flex items-center gap-2 bg-cafe-primary hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-md"
        >
          <Plus size={18} />
          <span>New User</span>
        </button>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="bg-[#2a2a2a] p-3 rounded-lg mb-4 flex items-center justify-between border border-cafe-primary/30 animate-in fade-in">
          <span className="text-sm text-white font-medium">{selectedIds.length} users selected</span>
          <div className="flex items-center gap-2">
            {selectedIds.length === 1 && (
              <button 
                onClick={() => handleBulkAction('password')}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-md text-sm transition-colors"
              >
                <KeyRound size={16} /> Change Password
              </button>
            )}
            <button 
              onClick={() => handleBulkAction('archive')}
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-md text-sm transition-colors"
            >
              <Archive size={16} /> Archive
            </button>
            <button 
              onClick={() => handleBulkAction('delete')}
              className="flex items-center gap-2 bg-cafe-danger hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-sm transition-colors"
            >
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-[#1e1e1e] border border-gray-700 rounded-xl overflow-hidden flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#2a2a2a] sticky top-0 z-10">
              <tr>
                <th className="p-4 border-b border-gray-700 w-12 text-center">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={selectedIds.length === users.length && users.length > 0}
                    className="w-4 h-4 rounded border-gray-600 text-cafe-primary focus:ring-cafe-primary bg-[#1e1e1e]"
                  />
                </th>
                <th className="p-4 border-b border-gray-700 text-sm font-semibold text-gray-300 w-16 text-center">Avatar</th>
                <th className="p-4 border-b border-gray-700 text-sm font-semibold text-gray-300">Name & Email</th>
                <th className="p-4 border-b border-gray-700 text-sm font-semibold text-gray-300">Type</th>
                <th className="p-4 border-b border-gray-700 text-sm font-semibold text-gray-300">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-800/50 transition-colors border-b border-gray-700/50 last:border-0">
                  <td className="p-4 text-center">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(user.id)}
                      onChange={() => handleSelectOne(user.id)}
                      className="w-4 h-4 rounded border-gray-600 text-cafe-primary focus:ring-cafe-primary bg-[#1e1e1e]"
                    />
                  </td>
                  <td className="p-4 text-center">
                    <div className="w-8 h-8 rounded-full bg-cafe-primary text-white flex items-center justify-center font-bold text-sm mx-auto">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-white">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </td>
                  <td className="p-4">
                    <select 
                      value={user.role}
                      onChange={(e) => updateUser(user.id, { role: e.target.value as any })}
                      className="bg-[#2a2a2a] border border-gray-600 rounded-lg py-1 px-2 text-sm text-white focus:ring-1 focus:ring-cafe-primary outline-none"
                    >
                      <option value="User">User</option>
                      <option value="Employee">Employee</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                      user.status === 'Active' ? 'bg-green-500/20 text-green-400' :
                      user.status === 'Archived' ? 'bg-gray-500/20 text-gray-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                </tr>
              ))}
              
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Password Modal */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-in fade-in">
          <div className="bg-[#1e1e1e] p-6 rounded-xl border border-gray-700 shadow-2xl w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">
                Change password for {users.find(u => u.id === passwordModalOpen)?.name}
              </h3>
              <button onClick={() => setPasswordModalOpen(null)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <input 
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="New password (min 6 chars)"
              className="w-full bg-[#2a2a2a] border border-gray-600 rounded-lg py-2 px-3 text-white mb-4 outline-none focus:border-cafe-primary"
            />
            <button 
              onClick={handleChangePasswordSubmit}
              className="w-full bg-cafe-primary hover:bg-red-700 text-white py-2 rounded-lg font-medium transition-colors"
            >
              Update Password
            </button>
          </div>
        </div>
      )}

      {/* Slide-over Create Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 animate-in fade-in" onClick={() => setIsFormOpen(false)}>
          <div 
            className="w-full max-w-md bg-[#1e1e1e] h-full shadow-xl flex flex-col border-l border-gray-700 animate-in slide-in-from-right"
            onClick={e => e.stopPropagation()} 
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">New User</h2>
              <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#2a2a2a] border border-gray-600 rounded-lg py-2 px-3 text-white focus:ring-1 focus:ring-cafe-primary outline-none"
                  placeholder="e.g. Alex Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#2a2a2a] border border-gray-600 rounded-lg py-2 px-3 text-white focus:ring-1 focus:ring-cafe-primary outline-none"
                  placeholder="e.g. alex@cafe.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#2a2a2a] border border-gray-600 rounded-lg py-2 px-3 text-white focus:ring-1 focus:ring-cafe-primary outline-none"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
                <div className="flex gap-2 p-1 bg-[#2a2a2a] rounded-lg border border-gray-600">
                  <button
                    onClick={() => setFormData({ ...formData, role: "User" })}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${formData.role === "User" ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                  >
                    Standard User
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, role: "Employee" })}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${formData.role === "Employee" ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                  >
                    Employee (Admin)
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-700 flex gap-3 bg-[#1a1a1a]">
              <button 
                onClick={() => setIsFormOpen(false)}
                className="flex-1 py-2.5 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveUser}
                className="flex-1 py-2.5 rounded-lg bg-cafe-primary text-white hover:bg-red-700 transition-colors font-medium shadow-md flex items-center justify-center gap-2"
              >
                <Check size={18} /> Create User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
