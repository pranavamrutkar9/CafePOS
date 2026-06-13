"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, Archive, Lock, CheckCircle, AlertTriangle } from "lucide-react";
import api from "@/api/axios";
import toast from "react-hot-toast";

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string; // "ADMIN" | "EMPLOYEE"
  disabled: boolean;
}

export default function UsersPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("EMPLOYEE"); // default
  const [password, setPassword] = useState("");
  
  // Password form states
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Fetch employees on load
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await api.get("/employees");
      setEmployees(res.data || []);
    } catch (err: any) {
      console.error("Error fetching employees:", err);
      toast.error("Failed to load employee list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/employees", {
        name,
        email,
        role,
        password
      });
      toast.success("Employee created successfully!");
      setIsModalOpen(false);
      resetForm();
      fetchEmployees();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create user.");
    }
  };

  const handleToggleDisabled = async (employee: Employee) => {
    try {
      await api.put(`/employees/${employee.id}`, {
        disabled: !employee.disabled
      });
      toast.success(employee.disabled ? "User activated" : "User archived");
      fetchEmployees();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update user status.");
    }
  };

  const handleRoleChange = async (employeeId: string, newRole: string) => {
    try {
      await api.put(`/employees/${employeeId}`, {
        role: newRole
      });
      toast.success("User role updated successfully");
      fetchEmployees();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update user role.");
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this user?")) return;
    try {
      await api.delete(`/employees/${id}`);
      toast.success("User deleted successfully!");
      fetchEmployees();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to delete user.");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await api.put(`/employees/${selectedEmployee.id}`, {
        newPassword
      });
      toast.success("Password reset completed!");
      setIsPasswordModalOpen(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to reset password.");
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setRole("EMPLOYEE");
    setPassword("");
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-cafe-text">Users & Employees</h1>
          <p className="text-xs text-[#8E827B] mt-0.5">Manage terminal roles, passwords, and statuses</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="btn-terracotta px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 cursor-pointer text-xs"
        >
          <Plus size={16} />
          Add User
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-[#EFECE7] overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 text-center text-[#8E827B] font-medium text-xs">
            Loading employees list...
          </div>
        ) : employees.length === 0 ? (
          <div className="py-20 text-center text-[#8E827B] font-medium text-xs">
            No employees found. Create one to begin.
          </div>
        ) : (
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
              {employees.map(employee => (
                <tr key={employee.id} className="hover:bg-[#FAF8F5]/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-sm">{employee.name}</td>
                  <td className="px-6 py-4 text-[#8E827B]">{employee.email}</td>
                  <td className="px-6 py-4">
                    <select
                      value={employee.role}
                      onChange={(e) => handleRoleChange(employee.id, e.target.value)}
                      className="px-2.5 py-1 bg-white border border-[#EFECE7] rounded-md font-semibold text-xs focus:outline-none"
                    >
                      <option value="ADMIN">User (Admin)</option>
                      <option value="EMPLOYEE">Employee</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                      employee.disabled ? "bg-[#FAF8F5] border border-[#EFECE7] text-[#8E827B] opacity-70" : "badge-sage"
                    }`}>
                      {employee.disabled ? "Archived" : "Active"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-1.5">
                      <button 
                        onClick={() => { setSelectedEmployee(employee); setIsPasswordModalOpen(true); }}
                        className="p-1.5 text-[#8E827B] hover:text-cafe-text hover:bg-[#FAF8F5] rounded-lg transition-colors cursor-pointer" 
                        title="Change Password"
                      >
                        <Lock size={15} />
                      </button>
                      <button 
                        onClick={() => handleToggleDisabled(employee)}
                        className={`p-1.5 text-[#8E827B] hover:bg-[#FAF8F5] rounded-lg transition-colors cursor-pointer ${
                          employee.disabled ? "hover:text-[#43634e]" : "hover:text-cafe-warning"
                        }`}
                        title={employee.disabled ? "Activate" : "Archive"}
                      >
                        <Archive size={15} />
                      </button>
                      <button 
                        onClick={() => handleDeleteEmployee(employee.id)}
                        className="p-1.5 text-[#8E827B] hover:text-cafe-danger hover:bg-[#FAF8F5] rounded-lg transition-colors cursor-pointer" 
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* User Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#2C2623]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="paper-panel rounded-2xl w-full max-w-md animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-[#EFECE7] flex justify-between items-center bg-white">
              <h2 className="text-lg font-bold text-cafe-text">Add User / Employee</h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-1.5 text-[#8E827B] hover:text-cafe-text rounded-full hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleCreateEmployee}>
              <div className="p-6 space-y-4 bg-white">
                <div>
                  <label className="block text-xs font-semibold text-[#8E827B] uppercase tracking-wider mb-2">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 paper-input rounded-xl focus:outline-none" 
                    placeholder="John Doe" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8E827B] uppercase tracking-wider mb-2">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 paper-input rounded-xl focus:outline-none" 
                    placeholder="john@example.com" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8E827B] uppercase tracking-wider mb-2">Role</label>
                  <select 
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 paper-input rounded-xl focus:outline-none bg-white"
                  >
                    <option value="ADMIN">User (Admin)</option>
                    <option value="EMPLOYEE">Employee</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8E827B] uppercase tracking-wider mb-2">Password</label>
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 paper-input rounded-xl focus:outline-none" 
                    placeholder="••••••••" 
                  />
                </div>
              </div>
              
              <div className="p-6 border-t border-[#EFECE7] bg-[#FAF8F5] flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 py-2.5 border border-[#E6E1DA] text-cafe-text rounded-xl font-medium bg-white hover:bg-[#FAF8F5] transition-colors cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 btn-terracotta rounded-xl font-medium cursor-pointer text-xs"
                >
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {isPasswordModalOpen && selectedEmployee && (
        <div className="fixed inset-0 bg-[#2C2623]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="paper-panel rounded-2xl w-full max-w-sm animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-[#EFECE7] flex justify-between items-center bg-white">
              <div>
                <h2 className="text-lg font-bold text-cafe-text">Change Password</h2>
                <p className="text-[10px] text-[#8E827B]">For {selectedEmployee.name}</p>
              </div>
              <button 
                onClick={() => setIsPasswordModalOpen(false)} 
                className="p-1.5 text-[#8E827B] hover:text-cafe-text rounded-full hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleChangePassword}>
              <div className="p-6 space-y-4 bg-white">
                <div>
                  <label className="block text-xs font-semibold text-[#8E827B] uppercase tracking-wider mb-2">New Password</label>
                  <input 
                    type="password" 
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 paper-input rounded-xl focus:outline-none" 
                    placeholder="••••••••" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8E827B] uppercase tracking-wider mb-2">Confirm Password</label>
                  <input 
                    type="password" 
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 paper-input rounded-xl focus:outline-none" 
                    placeholder="••••••••" 
                  />
                </div>
              </div>
              
              <div className="p-6 border-t border-[#EFECE7] bg-[#FAF8F5] flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)} 
                  className="flex-1 py-2.5 border border-[#E6E1DA] text-cafe-text rounded-xl font-medium bg-white hover:bg-[#FAF8F5] transition-colors cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 btn-terracotta rounded-xl font-medium cursor-pointer text-xs"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
