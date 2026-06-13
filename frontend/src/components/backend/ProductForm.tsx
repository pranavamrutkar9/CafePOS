"use client";

import { useState } from "react";
import { X, Plus, Check } from "lucide-react";
import { useInventoryStore, InventoryProduct, Category } from "@/store/useInventoryStore";

interface ProductFormProps {
  initialData?: InventoryProduct | null;
  onClose: () => void;
}

const TAX_OPTIONS = ["5%", "18%", "28%"];
const UNIT_OPTIONS = ["Piece", "Cup", "Plate", "Kg", "Litre"];
const STATUS_OPTIONS = ["Active", "Draft", "Archived"];

const COLORS = ["#c0392b", "#2980b9", "#27ae60", "#f39c12", "#8e44ad", "#16a085", "#2c3e50"];

export default function ProductForm({ initialData, onClose }: ProductFormProps) {
  const { categories, addCategory, addProduct, updateProduct } = useInventoryStore();

  const [formData, setFormData] = useState<Partial<InventoryProduct>>(
    initialData || {
      name: "",
      categories: [],
      price: 0,
      tax: "5%",
      unit: "Piece",
      description: "",
      status: "Active"
    }
  );

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState(COLORS[0]);

  const handleSave = () => {
    if (!formData.name) return alert("Name is required");

    if (initialData) {
      updateProduct(initialData.id, formData);
    } else {
      addProduct({
        ...formData,
        id: Math.random().toString(36).substring(7),
      } as InventoryProduct);
    }
    onClose();
  };

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) return;
    
    const newCat: Category = {
      id: Math.random().toString(36).substring(7),
      name: newCategoryName.trim(),
      color: newCategoryColor
    };
    
    addCategory(newCat);
    setFormData(prev => ({ ...prev, categories: [...(prev.categories || []), newCat.name] }));
    setIsCreatingCategory(false);
    setNewCategoryName("");
    setIsCategoryOpen(false);
  };

  const toggleCategory = (catName: string) => {
    setFormData(prev => {
      const cats = prev.categories || [];
      if (cats.includes(catName)) {
        return { ...prev, categories: cats.filter(c => c !== catName) };
      } else {
        return { ...prev, categories: [...cats, catName] };
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 animate-in fade-in">
      <div className="w-full max-w-md bg-[#1e1e1e] h-full shadow-xl flex flex-col border-l border-gray-700 animate-in slide-in-from-right">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">{initialData ? "Edit Product" : "New Product"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Product Name</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#2a2a2a] border border-gray-600 rounded-lg py-2 px-3 text-white focus:ring-1 focus:ring-cafe-primary outline-none"
              placeholder="e.g. Avocado Toast"
            />
          </div>

          {/* Price & Tax */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Price ($)</label>
              <input 
                type="number" 
                value={formData.price || ""}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="w-full bg-[#2a2a2a] border border-gray-600 rounded-lg py-2 px-3 text-white focus:ring-1 focus:ring-cafe-primary outline-none"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Tax</label>
              <select 
                value={formData.tax}
                onChange={(e) => setFormData({ ...formData, tax: e.target.value as any })}
                className="w-full bg-[#2a2a2a] border border-gray-600 rounded-lg py-2 px-3 text-white focus:ring-1 focus:ring-cafe-primary outline-none"
              >
                {TAX_OPTIONS.map(tax => <option key={tax} value={tax}>{tax}</option>)}
              </select>
            </div>
          </div>

          {/* Category Dropdown & Tags */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-1">Categories</label>
            <div 
              className="w-full bg-[#2a2a2a] border border-gray-600 rounded-lg py-2 px-3 text-white min-h-[42px] cursor-pointer flex flex-wrap gap-2 items-center"
              onClick={() => !isCreatingCategory && setIsCategoryOpen(!isCategoryOpen)}
            >
              {formData.categories?.length ? (
                formData.categories.map(c => (
                  <span key={c} className="bg-gray-700 text-xs px-2 py-1 rounded-md flex items-center gap-1">
                    {c}
                    <X size={12} className="hover:text-cafe-danger" onClick={(e) => { e.stopPropagation(); toggleCategory(c); }}/>
                  </span>
                ))
              ) : (
                <span className="text-gray-500 text-sm">Select categories...</span>
              )}
            </div>

            {isCategoryOpen && (
              <div className="absolute top-full left-0 w-full mt-1 bg-[#2a2a2a] border border-gray-600 rounded-lg shadow-xl z-10 overflow-hidden">
                {!isCreatingCategory ? (
                  <>
                    <div className="max-h-48 overflow-y-auto p-2">
                      {categories.map(cat => (
                        <div 
                          key={cat.id} 
                          className="flex items-center gap-3 px-3 py-2 hover:bg-gray-700 rounded-md cursor-pointer"
                          onClick={() => toggleCategory(cat.name)}
                        >
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                          <span className="flex-1 text-sm text-gray-200">{cat.name}</span>
                          {formData.categories?.includes(cat.name) && <Check size={16} className="text-cafe-primary" />}
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-gray-600 p-2">
                      <button 
                        onClick={() => setIsCreatingCategory(true)}
                        className="w-full flex items-center justify-center gap-2 py-2 bg-cafe-primary/20 text-cafe-primary hover:bg-cafe-primary hover:text-white rounded-md text-sm transition-colors font-medium"
                      >
                        <Plus size={16} /> Create & Edit Category
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-4 bg-[#1e1e1e]">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-white">New Category</span>
                      <button onClick={() => setIsCreatingCategory(false)} className="text-gray-400 hover:text-white"><X size={16}/></button>
                    </div>
                    <input 
                      type="text" 
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Category Name"
                      className="w-full bg-[#2a2a2a] border border-gray-600 rounded-md py-1.5 px-3 text-sm text-white mb-3 outline-none"
                    />
                    <div className="flex gap-2 mb-4 flex-wrap">
                      {COLORS.map(c => (
                        <button 
                          key={c}
                          onClick={() => setNewCategoryColor(c)}
                          className={`w-6 h-6 rounded-full border-2 ${newCategoryColor === c ? 'border-white' : 'border-transparent'}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <button 
                      onClick={handleCreateCategory}
                      className="w-full bg-cafe-primary hover:bg-red-700 text-white py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Save Category
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Unit & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Unit</label>
              <select 
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full bg-[#2a2a2a] border border-gray-600 rounded-lg py-2 px-3 text-white focus:ring-1 focus:ring-cafe-primary outline-none"
              >
                {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full bg-[#2a2a2a] border border-gray-600 rounded-lg py-2 px-3 text-white focus:ring-1 focus:ring-cafe-primary outline-none"
              >
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea 
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full bg-[#2a2a2a] border border-gray-600 rounded-lg py-2 px-3 text-white focus:ring-1 focus:ring-cafe-primary outline-none resize-none"
              placeholder="Product details..."
            />
          </div>

        </div>

        <div className="p-6 border-t border-gray-700 flex gap-3 bg-[#1a1a1a]">
          <button 
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors font-medium"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-lg bg-cafe-primary text-white hover:bg-red-700 transition-colors font-medium shadow-md"
          >
            Save Product
          </button>
        </div>
      </div>
    </div>
  );
}
