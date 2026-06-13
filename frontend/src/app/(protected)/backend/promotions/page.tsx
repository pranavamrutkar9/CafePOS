"use client";

import { useState } from "react";
import { Plus, Trash2, Edit, X, Check } from "lucide-react";
import { usePromoStore, Promotion } from "@/store/usePromoStore";

export default function PromotionsPage() {
  const { promotions, addPromotion, updatePromotion, deletePromotion } = usePromoStore();
  
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Promotion>>({});

  const openNewForm = () => {
    setEditingPromo(null);
    setFormData({
      name: "",
      type: "Coupon",
      isActive: true,
      activeCount: 0,
      discountValue: 0,
      discountType: "%",
      code: "",
      applyLevel: "Order",
      minQty: 1,
      minAmount: 0,
      description: ""
    });
    setIsFormOpen(true);
  };

  const openEditForm = (promo: Promotion) => {
    setEditingPromo(promo);
    setFormData({ ...promo });
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (!formData.name) return alert("Name is required");

    if (editingPromo) {
      updatePromotion(editingPromo.id, formData);
    } else {
      addPromotion({
        ...formData,
        id: Math.random().toString(36).substring(7),
      } as Promotion);
    }
    setIsFormOpen(false);
  };

  const toggleActive = (promo: Promotion) => {
    updatePromotion(promo.id, { isActive: !promo.isActive });
  };

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Coupons & Promotions</h1>
        <button 
          onClick={openNewForm}
          className="flex items-center gap-2 bg-cafe-primary hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-md"
        >
          <Plus size={18} />
          <span>New Promotion</span>
        </button>
      </div>

      <div className="bg-[#1e1e1e] border border-gray-700 rounded-xl overflow-hidden flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#2a2a2a] sticky top-0 z-10">
              <tr>
                <th className="p-4 border-b border-gray-700 text-sm font-semibold text-gray-300 pl-6">Name</th>
                <th className="p-4 border-b border-gray-700 text-sm font-semibold text-gray-300">Type</th>
                <th className="p-4 border-b border-gray-700 text-sm font-semibold text-gray-300 text-center">Uses</th>
                <th className="p-4 border-b border-gray-700 text-sm font-semibold text-gray-300 text-center">Active</th>
                <th className="p-4 border-b border-gray-700 text-sm font-semibold text-gray-300 w-24 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {promotions.map((promo) => (
                <tr 
                  key={promo.id} 
                  className="hover:bg-gray-800/50 transition-colors border-b border-gray-700/50 last:border-0"
                >
                  <td className="p-4 pl-6">
                    <div className="font-medium text-white">{promo.name}</div>
                    <div className="text-xs text-gray-500 mt-1 line-clamp-1">{promo.description}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${promo.type === 'Coupon' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                      {promo.type}
                    </span>
                  </td>
                  <td className="p-4 text-center text-gray-400 font-mono">
                    {promo.activeCount}
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => toggleActive(promo)}
                      className={`w-12 h-6 rounded-full relative transition-colors mx-auto ${promo.isActive ? 'bg-cafe-primary' : 'bg-gray-600'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${promo.isActive ? 'left-7' : 'left-1'}`} />
                    </button>
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => openEditForm(promo)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors inline-flex mr-1"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm(`Delete promotion "${promo.name}"?`)) {
                          deletePromotion(promo.id);
                        }
                      }}
                      className="p-2 text-gray-500 hover:text-cafe-danger hover:bg-gray-700 rounded-lg transition-colors inline-flex"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              
              {promotions.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No promotions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 animate-in fade-in" onClick={() => setIsFormOpen(false)}>
          <div 
            className="w-full max-w-md bg-[#1e1e1e] h-full shadow-xl flex flex-col border-l border-gray-700 animate-in slide-in-from-right"
            onClick={e => e.stopPropagation()} 
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">{editingPromo ? "Edit Promotion" : "New Promotion"}</h2>
              <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                <input 
                  type="text" 
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#2a2a2a] border border-gray-600 rounded-lg py-2 px-3 text-white focus:ring-1 focus:ring-cafe-primary outline-none"
                  placeholder="e.g. Summer Sale"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
                <div className="flex gap-2 p-1 bg-[#2a2a2a] rounded-lg border border-gray-600">
                  <button
                    onClick={() => setFormData({ ...formData, type: "Coupon" })}
                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${formData.type === "Coupon" ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                  >
                    Coupon
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, type: "Promotion" })}
                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${formData.type === "Promotion" ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                  >
                    Automated Promo
                  </button>
                </div>
              </div>

              {formData.type === "Coupon" ? (
                <div className="animate-in fade-in">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Coupon Code</label>
                  <input 
                    type="text" 
                    value={formData.code || ""}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full bg-[#2a2a2a] border border-gray-600 rounded-lg py-2 px-3 text-white focus:ring-1 focus:ring-cafe-primary outline-none font-mono uppercase"
                    placeholder="e.g. SUMMER10"
                  />
                </div>
              ) : (
                <div className="animate-in fade-in space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Apply To</label>
                    <select 
                      value={formData.applyLevel || "Order"}
                      onChange={(e) => setFormData({ ...formData, applyLevel: e.target.value as any })}
                      className="w-full bg-[#2a2a2a] border border-gray-600 rounded-lg py-2 px-3 text-white focus:ring-1 focus:ring-cafe-primary outline-none"
                    >
                      <option value="Product">Specific Products (Min Qty)</option>
                      <option value="Order">Entire Order (Min Amount)</option>
                    </select>
                  </div>
                  
                  {formData.applyLevel === "Product" ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Min Quantity Required</label>
                      <input 
                        type="number" 
                        value={formData.minQty || 1}
                        onChange={(e) => setFormData({ ...formData, minQty: parseInt(e.target.value) || 1 })}
                        className="w-full bg-[#2a2a2a] border border-gray-600 rounded-lg py-2 px-3 text-white focus:ring-1 focus:ring-cafe-primary outline-none"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Min Order Amount ($)</label>
                      <input 
                        type="number" 
                        value={formData.minAmount || 0}
                        onChange={(e) => setFormData({ ...formData, minAmount: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-[#2a2a2a] border border-gray-600 rounded-lg py-2 px-3 text-white focus:ring-1 focus:ring-cafe-primary outline-none"
                      />
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Discount</label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    value={formData.discountValue || 0}
                    onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                    className="flex-1 bg-[#2a2a2a] border border-gray-600 rounded-lg py-2 px-3 text-white focus:ring-1 focus:ring-cafe-primary outline-none"
                  />
                  <select 
                    value={formData.discountType || "%"}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                    className="w-20 bg-[#2a2a2a] border border-gray-600 rounded-lg py-2 px-3 text-white focus:ring-1 focus:ring-cafe-primary outline-none text-center"
                  >
                    <option value="%">%</option>
                    <option value="₹">₹</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea 
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full bg-[#2a2a2a] border border-gray-600 rounded-lg py-2 px-3 text-white focus:ring-1 focus:ring-cafe-primary outline-none resize-none"
                  placeholder="Describe the promotion..."
                />
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
                onClick={handleSave}
                className="flex-1 py-2.5 rounded-lg bg-cafe-primary text-white hover:bg-red-700 transition-colors font-medium shadow-md flex items-center justify-center gap-2"
              >
                <Check size={18} /> Save Promotion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
