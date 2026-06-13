"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, X, Image as ImageIcon, ChevronDown } from "lucide-react";
import { apiClient } from "@/lib/apiClient";

export default function ProductsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    apiClient.get('/products')
      .then(data => setProducts(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="space-y-6 text-[#2c2623]">
      {/* Top Bar */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-[#2c2623]">Products</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#c86a50] hover:bg-[#b3563d] text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm text-xs cursor-pointer"
        >
          <Plus size={16} />
          Add Product
        </button>
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8e827b]" size={16} />
          <input 
            type="text" 
            placeholder="Search products..." 
            className="w-full pl-10 pr-4 py-2 border border-[#efece7] bg-white rounded-xl text-xs text-[#2c2623] placeholder-[#a09690] outline-none focus:border-[#c86a50] focus:ring-1 focus:ring-[#c86a50]/20 transition-all shadow-sm"
          />
        </div>
        <div className="relative w-48">
          <select className="w-full appearance-none bg-white border border-[#efece7] text-[#2c2623] py-2 pl-4 pr-10 rounded-xl focus:outline-none focus:border-[#c86a50] cursor-pointer text-xs shadow-sm">
            <option>All Categories</option>
            <option>Beverages</option>
            <option>Food</option>
            <option>Desserts</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8e827b] pointer-events-none" size={14} />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-[2rem] border border-[#efece7] shadow-sm overflow-hidden relative before:absolute before:inset-2 before:border before:border-[#fbfaf8] before:rounded-[1.8rem] before:pointer-events-none">
        <div className="relative z-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#faf8f5] border-b border-[#efece7] text-[#8e827b] text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4 font-extrabold">Image</th>
                <th className="px-6 py-4 font-extrabold">Name</th>
                <th className="px-6 py-4 font-extrabold">Category</th>
                <th className="px-6 py-4 font-extrabold">Price</th>
                <th className="px-6 py-4 font-extrabold">Unit</th>
                <th className="px-6 py-4 font-extrabold">Tax</th>
                <th className="px-6 py-4 font-extrabold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2efea]">
              {products.map((product: any) => (
                <tr key={product.id} className="hover:bg-[#faf8f5] transition-colors">
                  <td className="px-6 py-4">
                    <div className="w-10 h-10 bg-[#c86a50]/5 rounded-xl flex items-center justify-center text-[#c86a50] border border-[#efece7]">
                      <ImageIcon size={18} />
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-sm text-[#2c2623]">
                    {product.name}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-2xs font-extrabold uppercase tracking-wide bg-[#faf8f5] text-[#2c2623] border border-[#efece7]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#c86a50]"></span>
                      {product.category?.name || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#2c2623] font-bold text-sm">₹{product.price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-xs text-[#8e827b] font-medium">per {product.unit}</td>
                  <td className="px-6 py-4 text-xs text-[#8e827b] font-medium">{product.tax}%</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-1.5">
                      <button className="p-2 text-[#8e827b] hover:text-[#c86a50] hover:bg-[#c86a50]/5 rounded-lg transition-colors cursor-pointer">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2 text-[#8e827b] hover:text-[#d3524b] hover:bg-[#d3524b]/5 rounded-lg transition-colors cursor-pointer">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-[#8e827b] font-semibold text-sm">No products found.</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-[#efece7] bg-[#faf8f5]/40 flex items-center justify-between text-xs text-[#8e827b] font-medium">
            <span>Showing 1 to {products.length} of {products.length} entries</span>
            <div className="flex gap-1.5">
              <button className="px-3 py-1.5 border border-[#efece7] rounded-lg bg-white hover:bg-[#faf8f5] text-[#2c2623] cursor-pointer">Prev</button>
              <button className="px-3 py-1.5 bg-[#c86a50] text-white rounded-lg font-bold cursor-pointer shadow-sm">1</button>
              <button className="px-3 py-1.5 border border-[#efece7] rounded-lg bg-white hover:bg-[#faf8f5] text-[#2c2623] cursor-pointer">Next</button>
            </div>
          </div>
        </div>
      </div>

      {/* Screen 6: Product Modal / Side Drawer */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end">
          <div className="w-[480px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 border-l border-[#efece7]">
            <div className="px-6 py-4 border-b border-[#efece7] flex justify-between items-center bg-white">
              <h2 className="text-lg font-extrabold text-[#2c2623]">Add New Product</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-[#8e827b] hover:text-[#2c2623] rounded-full hover:bg-[#faf8f5] cursor-pointer">
                <X size={18} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-5 organic-scrollbar bg-white">
              <div>
                <label className="block text-xs font-bold text-[#8e827b] uppercase tracking-wider mb-1">Product Name</label>
                <input type="text" className="w-full px-3 py-2 border border-[#e6e1da] focus:border-[#c86a50] rounded-xl text-sm outline-none" placeholder="e.g. Latte" />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8e827b] uppercase tracking-wider mb-1">Category</label>
                <div className="relative">
                  <select className="w-full appearance-none px-3 py-2 border border-[#e6e1da] focus:border-[#c86a50] rounded-xl text-sm bg-white outline-none">
                    <option value="">Select Category</option>
                    <option value="bev">Beverages</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8e827b]" size={14} />
                </div>
                <button 
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="text-xs text-[#c86a50] font-bold mt-2 hover:underline cursor-pointer"
                >
                  + Create New Category
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#8e827b] uppercase tracking-wider mb-1">Price (₹)</label>
                  <input type="number" className="w-full px-3 py-2 border border-[#e6e1da] focus:border-[#c86a50] rounded-xl text-sm outline-none" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#8e827b] uppercase tracking-wider mb-1">Tax (%)</label>
                  <input type="number" className="w-full px-3 py-2 border border-[#e6e1da] focus:border-[#c86a50] rounded-xl text-sm outline-none" placeholder="5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8e827b] uppercase tracking-wider mb-1">Unit of Measure</label>
                <select className="w-full px-3 py-2 border border-[#e6e1da] focus:border-[#c86a50] rounded-xl text-sm bg-white outline-none">
                  <option>per piece</option>
                  <option>per kg</option>
                  <option>per litre</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8e827b] uppercase tracking-wider mb-1">Description</label>
                <textarea rows={3} className="w-full px-3 py-2 border border-[#e6e1da] focus:border-[#c86a50] rounded-xl text-sm outline-none resize-none" placeholder="Short product description..."></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8e827b] uppercase tracking-wider mb-1">Product Image</label>
                <div className="border-2 border-dashed border-[#e6e1da] rounded-xl p-8 flex flex-col items-center justify-center text-[#8e827b] hover:bg-[#faf8f5] cursor-pointer transition-colors">
                  <ImageIcon size={28} className="mb-2 text-[#8e827b]" />
                  <span className="text-xs font-bold text-[#c86a50]">Click to upload</span>
                  <span className="text-[10px] mt-1 text-[#8e827b] opacity-80">SVG, PNG, JPG (max 2MB)</span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-[#efece7] bg-[#faf8f5] flex gap-3">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-[#e6e1da] text-[#2c2623] hover:bg-white rounded-xl font-bold text-sm transition-colors cursor-pointer">
                Cancel
              </button>
              <button className="flex-1 px-4 py-2 bg-[#c86a50] hover:bg-[#b3563d] text-white rounded-xl font-bold text-sm transition-colors shadow-sm cursor-pointer">
                Save Product
              </button>
            </div>

            {/* Inline Mini-Modal for Category */}
            {isCategoryModalOpen && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl shadow-2xl border border-[#efece7] w-full p-6 relative before:absolute before:inset-1 before:border before:border-[#fbfaf8] before:rounded-[1.4rem] before:pointer-events-none">
                  <div className="relative z-10 space-y-4">
                    <h3 className="font-extrabold text-base text-[#2c2623] mb-4">Create Category</h3>
                    <div>
                      <label className="block text-xs font-bold text-[#8e827b] uppercase tracking-wider mb-1">Category Name</label>
                      <input type="text" className="w-full px-3 py-2 border border-[#e6e1da] focus:border-[#c86a50] rounded-xl text-sm outline-none" placeholder="e.g. Desserts" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#8e827b] uppercase tracking-wider mb-2">Color Label</label>
                      <div className="grid grid-cols-6 gap-2">
                        {['bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-fuchsia-500', 'bg-pink-500'].map(color => (
                          <button key={color} className={`w-8 h-8 rounded-full ${color} cursor-pointer hover:scale-110 transition-transform ring-2 ring-offset-2 ring-transparent focus:ring-gray-400`}></button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button onClick={() => setIsCategoryModalOpen(false)} className="flex-1 py-2 border border-[#e6e1da] text-xs font-bold rounded-xl hover:bg-[#faf8f5] cursor-pointer">Cancel</button>
                      <button className="flex-1 py-2 bg-[#c86a50] hover:bg-[#b3563d] text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm">Save</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
