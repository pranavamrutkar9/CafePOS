"use client";

import React, { useState, useEffect } from "react";
import api from "@/api/axios";
import toast from "react-hot-toast";
import { Plus, Search, Mail, Phone, MoreVertical, X } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Edit / Dropdown
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Shared Form Fields
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchCustomers = async (query = "") => {
    try {
      const res = await api.get(`/customers?search=${query}`);
      setCustomers(res.data || []);
    } catch (err) {
      console.error("Failed to load customers:", err);
      toast.error("Failed to load customer list.");
    } finally {
      setLoading(false);
    }
  };

  // Debounced search trigger
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchCustomers(searchQuery);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setErrorMsg("Name is required");
      return;
    }
    setSubmitting(true);
    setErrorMsg("");
    try {
      const res = await api.post("/customers", {
        name: formName.trim(),
        email: formEmail.trim() || null,
        phone: formPhone.trim() || null
      });

      setCustomers(prev => [res.data, ...prev]);
      setIsCreateOpen(false);
      toast.success("Customer created successfully!");
    } catch (err: any) {
      if (err.response?.data?.error === "Email already in use") {
        setErrorMsg("Email already in use");
      } else {
        setErrorMsg(err.response?.data?.error || "Failed to create customer");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    if (!formName.trim()) {
      setErrorMsg("Name is required");
      return;
    }
    setSubmitting(true);
    setErrorMsg("");
    try {
      const res = await api.patch(`/customers/${editingCustomer.id}`, {
        name: formName.trim(),
        email: formEmail.trim() || null,
        phone: formPhone.trim() || null
      });

      setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? res.data : c));
      setEditingCustomer(null);
      toast.success("Customer updated successfully!");
    } catch (err: any) {
      if (err.response?.data?.error === "Email already in use") {
        setErrorMsg("Email already in use");
      } else {
        setErrorMsg(err.response?.data?.error || "Failed to update customer");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this customer?")) return;

    const originalCustomers = [...customers];
    
    // Optimistic UI: remove local state first
    setCustomers(prev => prev.filter(c => c.id !== id));
    setEditingCustomer(null);

    try {
      await api.delete(`/customers/${id}`);
      toast.success("Customer deleted successfully!");
    } catch (err) {
      // Rollback on failure
      setCustomers(originalCustomers);
      toast.error("Could not delete customer");
    }
  };

  return (
    <div className="space-y-6 overflow-visible">
      {/* Top Header & Actions Row */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-[#EFECE7] shadow-xs">
        {/* Create Trigger block */}
        <div className="relative">
          <button
            onClick={() => {
              setIsCreateOpen(!isCreateOpen);
              setEditingCustomer(null);
              setFormName("");
              setFormEmail("");
              setFormPhone("");
              setErrorMsg("");
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#C86A50] hover:bg-[#b3563d] text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Plus size={16} />
            New
          </button>

          {isCreateOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setIsCreateOpen(false)}></div>
              <div className="absolute left-0 mt-2 bg-white border border-[#EFECE7] rounded-2xl shadow-xl p-5 w-80 z-40 animate-in zoom-in-95 duration-150">
                <div className="flex justify-between items-center mb-3 border-b border-[#EFECE7] pb-2">
                  <h4 className="text-xs font-black uppercase text-[#8E827B] tracking-wider">New Customer</h4>
                  <button type="button" onClick={() => setIsCreateOpen(false)} className="text-[#8E827B] hover:text-[#2C2623]">
                    <X size={16} />
                  </button>
                </div>
                
                <form onSubmit={handleCreateCustomer} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-[#8E827B] uppercase tracking-wider mb-1">Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Alex"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#E6E1DA] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C86A50] text-[#2C2623] font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#8E827B] uppercase tracking-wider mb-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E827B]" size={13} />
                      <input
                        type="email"
                        placeholder="alex@example.com"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        className="w-full bg-[#FAF8F5] border border-[#E6E1DA] rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#C86A50] text-[#2C2623] font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#8E827B] uppercase tracking-wider mb-1">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E827B]" size={13} />
                      <input
                        type="text"
                        placeholder="+123456789"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        className="w-full bg-[#FAF8F5] border border-[#E6E1DA] rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#C86A50] text-[#2C2623] font-medium"
                      />
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 p-2 rounded-lg text-center">
                      {errorMsg}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2 border-t border-[#EFECE7]">
                    <button
                      type="button"
                      onClick={() => setIsCreateOpen(false)}
                      className="flex-1 py-2 border border-[#E6E1DA] text-cafe-text rounded-xl font-medium bg-white hover:bg-[#FAF8F5] transition-colors cursor-pointer text-[11px]"
                    >
                      Discard
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-2 rounded-xl font-bold cursor-pointer text-white bg-[#C86A50] hover:bg-[#b3563d] disabled:opacity-50 text-[11px]"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>

        {/* Search Input */}
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E827B]" size={14} />
          <input
            type="text"
            placeholder="Search Alex..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FAF8F5] border border-[#E6E1DA] rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-[#C86A50] text-[#2C2623] font-semibold"
          />
        </div>
      </div>

      {/* Main Customers Cards list */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#C86A50]/20 border-t-[#C86A50] animate-spin" />
          <p className="text-sm text-[#8E827B]">Loading customers list...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-visible">
          {customers.map((customer) => (
            <div
              key={customer.id}
              className="relative bg-white border border-[#EFECE7] rounded-2xl p-5 shadow-xs flex justify-between items-start overflow-visible hover:shadow-md transition-all"
            >
              <div className="space-y-2.5">
                <h3 className="font-extrabold text-sm text-[#2C2623]">{customer.name}</h3>
                <div className="flex items-center gap-2 text-xs text-[#8E827B] font-semibold">
                  <Mail size={13} className="shrink-0 text-[#C86A50]" />
                  <span>{customer.email || <span className="italic text-gray-300">No email address</span>}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#8E827B] font-semibold">
                  <Phone size={13} className="shrink-0 text-[#C86A50]" />
                  <span>{customer.phone || <span className="italic text-gray-300">No phone number</span>}</span>
                </div>
              </div>

              {/* 3-Dot drop trigger */}
              <div className="relative">
                <button
                  onClick={() => setOpenDropdownId(openDropdownId === customer.id ? null : customer.id)}
                  className="p-1.5 text-[#8E827B] hover:text-[#2C2623] rounded-lg hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                >
                  <MoreVertical size={16} />
                </button>

                {openDropdownId === customer.id && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpenDropdownId(null)}></div>
                    <div className="absolute right-0 mt-1 w-24 bg-white border border-[#EFECE7] rounded-xl shadow-lg z-20 py-1 animate-in fade-in slide-in-from-top-1 duration-100">
                      <button
                        onClick={() => {
                          setEditingCustomer(customer);
                          setFormName(customer.name);
                          setFormEmail(customer.email || "");
                          setFormPhone(customer.phone || "");
                          setErrorMsg("");
                          setOpenDropdownId(null);
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-bold text-[#2C2623] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Inline anchored edit panel */}
              {editingCustomer?.id === customer.id && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setEditingCustomer(null)}></div>
                  <div className="absolute right-4 top-14 bg-white border border-[#EFECE7] rounded-2xl shadow-xl p-5 w-80 z-40 animate-in zoom-in-95 duration-150 text-left">
                    <div className="flex justify-between items-center mb-3 border-b border-[#EFECE7] pb-2">
                      <h4 className="text-xs font-black uppercase text-[#8E827B] tracking-wider">Edit Customer</h4>
                      <button type="button" onClick={() => setEditingCustomer(null)} className="text-[#8E827B] hover:text-[#2C2623]">
                        <X size={16} />
                      </button>
                    </div>

                    <form onSubmit={handleUpdateCustomer} className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-[#8E827B] uppercase tracking-wider mb-1">Name</label>
                        <input
                          type="text"
                          required
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          className="w-full bg-[#FAF8F5] border border-[#E6E1DA] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C86A50] text-[#2C2623] font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-[#8E827B] uppercase tracking-wider mb-1">Email</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E827B]" size={13} />
                          <input
                            type="email"
                            value={formEmail}
                            onChange={(e) => setFormEmail(e.target.value)}
                            className="w-full bg-[#FAF8F5] border border-[#E6E1DA] rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#C86A50] text-[#2C2623] font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-[#8E827B] uppercase tracking-wider mb-1">Phone</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E827B]" size={13} />
                          <input
                            type="text"
                            value={formPhone}
                            onChange={(e) => setFormPhone(e.target.value)}
                            className="w-full bg-[#FAF8F5] border border-[#E6E1DA] rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#C86A50] text-[#2C2623] font-medium"
                          />
                        </div>
                      </div>

                      {errorMsg && (
                        <div className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 p-2 rounded-lg text-center animate-shake">
                          {errorMsg}
                        </div>
                      )}

                      <div className="flex gap-2 pt-2 border-t border-[#EFECE7]">
                        <button
                          type="button"
                          onClick={() => setEditingCustomer(null)}
                          className="flex-1 py-2 border border-[#E6E1DA] text-cafe-text rounded-xl font-medium bg-white hover:bg-[#FAF8F5] transition-colors cursor-pointer text-[11px]"
                        >
                          Discard
                        </button>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="flex-1 py-2 rounded-xl font-bold cursor-pointer text-white bg-[#C86A50] hover:bg-[#b3563d] disabled:opacity-50 text-[11px]"
                        >
                          Save
                        </button>
                      </div>

                      <div className="pt-2 border-t border-[#EFECE7]">
                        <button
                          type="button"
                          onClick={() => handleDeleteCustomer(customer.id)}
                          className="w-full py-2 rounded-xl font-bold cursor-pointer text-white bg-red-600 hover:bg-red-700 transition-colors text-[11px]"
                        >
                          DELETE
                        </button>
                      </div>
                    </form>
                  </div>
                </>
              )}
            </div>
          ))}

          {customers.length === 0 && (
            <div className="col-span-full text-center py-12 text-[#8E827B] font-bold bg-white rounded-2xl border border-[#EFECE7]">
              No customers found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
