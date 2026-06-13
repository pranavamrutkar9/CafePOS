"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Search, Edit2, Trash2, X, Phone, Mail, MoreVertical } from "lucide-react";
import api from "@/api/axios";
import toast from "react-hot-toast";

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // Card Actions Menu State
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/customers");
      setCustomers(res.data || []);
    } catch (err: any) {
      console.error("Error loading customers:", err);
      toast.error("Failed to load customers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleCreateOrUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedCustomer) {
        // Edit mode
        await api.put(`/customers/${selectedCustomer.id}`, {
          name,
          email,
          phone
        });
        toast.success("Customer updated successfully!");
      } else {
        // Create mode
        await api.post("/customers", {
          name,
          email,
          phone
        });
        toast.success("Customer created successfully!");
      }
      setIsModalOpen(false);
      resetForm();
      fetchCustomers();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to save customer.");
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;
    try {
      await api.delete(`/customers/${id}`);
      toast.success("Customer deleted successfully!");
      setIsModalOpen(false);
      resetForm();
      fetchCustomers();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to delete customer.");
    }
  };

  const handleEditClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setName(customer.name);
    setEmail(customer.email || "");
    setPhone(customer.phone || "");
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleNewClick = () => {
    setSelectedCustomer(null);
    resetForm();
    setIsModalOpen(true);
  };

  const handleSelectForOrder = (customer: Customer) => {
    // Save to local storage for current cart checkout order
    localStorage.setItem("selectedCustomer", JSON.stringify(customer));
    toast.success(`Selected customer: ${customer.name}`);
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setSelectedCustomer(null);
  };

  // Client-side search filtering
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const query = searchQuery.toLowerCase();
      const matchesName = c.name.toLowerCase().includes(query);
      const matchesEmail = c.email ? c.email.toLowerCase().includes(query) : false;
      const matchesPhone = c.phone ? c.phone.includes(query) : false;
      return matchesName || matchesEmail || matchesPhone;
    });
  }, [customers, searchQuery]);

  return (
    <div className="h-full flex flex-col bg-[#FAF8F5] overflow-hidden text-[#2C2623] font-sans">
      
      {/* Page Header */}
      <div className="p-6 border-b border-[#EFECE7] bg-white shrink-0 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-[#2C2623] tracking-tight">Customers Directory</h1>
          <p className="text-xs text-[#8E827B] mt-0.5">Manage details for billing profiles and digital receipts</p>
        </div>
        <button 
          onClick={handleNewClick}
          className="bg-[#C86A50] hover:bg-[#B3563D] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
        >
          <Plus size={16} />
          New Customer
        </button>
      </div>

      {/* Search Block */}
      <div className="p-6 bg-white border-b border-[#EFECE7] shrink-0">
        <div className="relative max-w-xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E827B]" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, email, or phone number..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[#FAF8F5] border border-[#E6E1DA] rounded-2xl text-xs focus:outline-none focus:border-[#C86A50] transition-all"
          />
        </div>
      </div>

      {/* Customers Cards List */}
      <div className="flex-1 overflow-y-auto p-6 bg-[#FAF8F5]">
        {loading ? (
          <div className="py-20 text-center text-[#8E827B] font-bold text-xs">
            Loading customers list...
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="py-20 text-center text-[#8E827B] font-bold text-xs">
            No customers found. Click "New Customer" to add one.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCustomers.map(customer => (
              <div 
                key={customer.id} 
                className="bg-white p-5 rounded-2xl border border-[#EFECE7] hover:border-[#C86A50]/50 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between group relative"
              >
                
                {/* 3-Dot Actions Trigger */}
                <div className="absolute top-4 right-4 z-20">
                  <button
                    onClick={() => setActiveMenuId(activeMenuId === customer.id ? null : customer.id)}
                    className="p-1 text-[#8E827B] hover:text-[#2C2623] rounded-lg hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                  >
                    <MoreVertical size={16} />
                  </button>

                  {/* Dropdown Menu */}
                  {activeMenuId === customer.id && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setActiveMenuId(null)}></div>
                      <div className="absolute right-0 mt-1 w-32 bg-white border border-[#EFECE7] rounded-xl shadow-lg z-40 py-1 text-xs font-bold text-[#2C2623] animate-in fade-in duration-100">
                        <button 
                          onClick={() => handleEditClick(customer)} 
                          className="flex items-center gap-2 px-3 py-2 w-full text-left hover:bg-[#FAF8F5] transition-colors"
                        >
                          <Edit2 size={13} className="text-[#8E827B]" /> Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteCustomer(customer.id)} 
                          className="flex items-center gap-2 px-3 py-2 w-full text-left hover:bg-red-50 text-red-600 transition-colors"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Card Details */}
                <div className="space-y-3 pr-6">
                  <h3 className="font-extrabold text-sm text-[#2C2623] leading-snug group-hover:text-[#C86A50] transition-colors">
                    {customer.name}
                  </h3>
                  
                  <div className="space-y-1.5 text-xs text-[#8E827B]">
                    <div className="flex items-center gap-2">
                      <Mail size={13} className="shrink-0" />
                      <span className="truncate">{customer.email || "No email"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={13} className="shrink-0" />
                      <span>{customer.phone || "No phone number"}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer actions */}
                <div className="mt-4 pt-4 border-t border-[#FAF8F5] flex justify-end">
                  <button 
                    onClick={() => handleSelectForOrder(customer)}
                    className="px-3.5 py-1.5 bg-[#FAF8F5] hover:bg-[#C86A50] hover:text-white border border-[#E6E1DA] hover:border-[#C86A50] text-[#8E827B] rounded-xl text-[10px] font-black transition-all cursor-pointer shadow-inner uppercase tracking-wider"
                  >
                    Select for Order
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Customer Create/Edit Modal Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#2C2623]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="paper-panel rounded-2xl w-full max-w-md animate-in zoom-in-95 duration-200 overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-[#EFECE7] flex justify-between items-center bg-white">
              <h2 className="text-lg font-bold text-cafe-text">
                {selectedCustomer ? "Edit Customer" : "New Customer"}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-1.5 text-[#8E827B] hover:text-[#2C2623] rounded-full hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleCreateOrUpdateCustomer}>
              <div className="p-6 space-y-4 bg-white">
                <div>
                  <label className="block text-xs font-semibold text-[#8E827B] uppercase tracking-wider mb-2 ml-1">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 paper-input rounded-xl focus:outline-none" 
                    placeholder="e.g. Alice Smith" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8E827B] uppercase tracking-wider mb-2 ml-1">Email Address</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 paper-input rounded-xl focus:outline-none" 
                    placeholder="alice@example.com" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8E827B] uppercase tracking-wider mb-2 ml-1">Phone Number</label>
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 paper-input rounded-xl focus:outline-none" 
                    placeholder="+91 99999 88888" 
                  />
                </div>
              </div>
              
              <div className="p-6 border-t border-[#EFECE7] bg-[#FAF8F5] flex gap-3">
                {selectedCustomer && (
                  <button 
                    type="button"
                    onClick={() => handleDeleteCustomer(selectedCustomer.id)}
                    className="py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl font-bold transition-all cursor-pointer text-xs"
                  >
                    Delete Customer
                  </button>
                )}
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 py-2.5 border border-[#E6E1DA] text-cafe-text rounded-xl font-bold bg-white hover:bg-[#FAF8F5] transition-colors cursor-pointer text-xs"
                >
                  Discard
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 btn-terracotta rounded-xl font-bold cursor-pointer text-xs"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
