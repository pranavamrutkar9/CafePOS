import { useState } from "react";
import { Customer, usePOSStore } from "@/store/usePOSStore";
import { Search, Plus, X, MoreVertical, Edit, Trash2 } from "lucide-react";

interface CustomerSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock initial customers
const MOCK_CUSTOMERS: Customer[] = [
  { id: "c1", name: "Alice Smith", email: "alice@example.com", phone: "555-0100" },
  { id: "c2", name: "Bob Johnson", email: "bob@example.com", phone: "555-0101" },
  { id: "c3", name: "Charlie Davis", email: "charlie@example.com", phone: "555-0102" },
];

export default function CustomerSelectionModal({ isOpen, onClose }: CustomerSelectionModalProps) {
  const { setSelectedCustomer, selectedCustomer } = usePOSStore();
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [search, setSearch] = useState("");
  
  // Edit / Create state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });

  if (!isOpen) return null;

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const handleSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    onClose();
  };

  const handleStartEdit = (customer: Customer) => {
    setEditingId(customer.id);
    setIsCreating(false);
    setFormData({ name: customer.name, email: customer.email, phone: customer.phone });
  };

  const handleStartCreate = () => {
    setIsCreating(true);
    setEditingId(null);
    setFormData({ name: "", email: "", phone: "" });
  };

  const handleSave = () => {
    if (isCreating) {
      const newCustomer: Customer = {
        id: Math.random().toString(36).substring(7),
        ...formData
      };
      setCustomers([newCustomer, ...customers]);
    } else if (editingId) {
      setCustomers(customers.map(c => c.id === editingId ? { ...c, ...formData } : c));
      // Update selected customer if we edited them
      if (selectedCustomer?.id === editingId) {
        setSelectedCustomer({ ...selectedCustomer, ...formData });
      }
    }
    setEditingId(null);
    setIsCreating(false);
  };

  const handleDelete = (id: string) => {
    setCustomers(customers.filter(c => c.id !== id));
    if (selectedCustomer?.id === id) {
      setSelectedCustomer(null);
    }
    setEditingId(null);
    setIsCreating(false);
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsCreating(false);
  };

  return (
    <div className="fixed inset-0 z-[80] flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-cafe-card h-full border-l border-gray-700 shadow-2xl flex flex-col animate-in slide-in-from-right">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-[#1e1e1e]">
          <h2 className="text-xl font-bold text-white">Select Customer</h2>
          <div className="flex gap-2">
            <button 
              onClick={handleStartCreate}
              className="p-2 bg-cafe-primary hover:bg-red-700 text-white rounded-lg transition-colors"
              title="New Customer"
            >
              <Plus size={20} />
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Search */}
        {!isCreating && !editingId && (
          <div className="p-4 border-b border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="Search customers..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#1e1e1e] border border-gray-600 rounded-xl text-white focus:outline-none focus:border-cafe-primary transition-colors"
              />
            </div>
            {selectedCustomer && (
              <div className="mt-4 flex items-center justify-between bg-cafe-primary/10 border border-cafe-primary/20 p-3 rounded-xl">
                <span className="text-sm text-gray-300">Active: <span className="font-bold text-white">{selectedCustomer.name}</span></span>
                <button onClick={() => setSelectedCustomer(null)} className="text-xs text-cafe-danger hover:underline">Remove</button>
              </div>
            )}
          </div>
        )}

        {/* List / Form */}
        <div className="flex-1 overflow-y-auto p-4">
          {(isCreating || editingId) ? (
            <div className="bg-[#1e1e1e] border border-gray-700 rounded-xl p-5 flex flex-col gap-4 animate-in slide-in-from-top-2">
              <h3 className="font-bold text-white mb-2">{isCreating ? "New Customer" : "Edit Customer"}</h3>
              <div>
                <label className="text-xs text-gray-400 font-medium mb-1 block">Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-[#2a2a2a] border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cafe-primary"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-medium mb-1 block">Email</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-[#2a2a2a] border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cafe-primary"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-medium mb-1 block">Phone</label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-[#2a2a2a] border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cafe-primary"
                />
              </div>
              
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700">
                {editingId ? (
                  <button onClick={() => handleDelete(editingId)} className="text-cafe-danger p-2 hover:bg-cafe-danger/10 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                ) : <div />}
                
                <div className="flex gap-2">
                  <button onClick={handleCancel} className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">Discard</button>
                  <button onClick={handleSave} disabled={!formData.name} className="px-4 py-2 bg-cafe-primary hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">Save</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredCustomers.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No customers found.</p>
              ) : (
                filteredCustomers.map(customer => (
                  <div key={customer.id} className="flex items-center justify-between bg-[#1e1e1e] hover:bg-gray-800 border border-gray-700 p-4 rounded-xl transition-colors group">
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => handleSelect(customer)}
                    >
                      <p className="font-semibold text-white">{customer.name}</p>
                      <p className="text-xs text-gray-400">{customer.email} • {customer.phone}</p>
                    </div>
                    
                    <button 
                      onClick={() => handleStartEdit(customer)}
                      className="p-2 text-gray-500 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
