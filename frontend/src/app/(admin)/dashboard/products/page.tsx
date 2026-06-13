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
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-cafe-primary hover:bg-cafe-primary-hover text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search products..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cafe-primary focus:border-transparent"
          />
        </div>
        <div className="relative w-48">
          <select className="w-full appearance-none bg-white border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cafe-primary cursor-pointer">
            <option>All Categories</option>
            <option>Beverages</option>
            <option>Food</option>
            <option>Desserts</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
              <th className="px-6 py-4 font-medium">Image</th>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium">Price</th>
              <th className="px-6 py-4 font-medium">Unit</th>
              <th className="px-6 py-4 font-medium">Tax</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product: any) => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-500">
                    <ImageIcon size={20} />
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${product.category?.color || 'bg-gray-500'}`}></span>
                    {product.category?.name || 'Uncategorized'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-900">₹{product.price.toFixed(2)}</td>
                <td className="px-6 py-4 text-gray-500">per {product.unit}</td>
                <td className="px-6 py-4 text-gray-500">{product.tax}%</td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 text-gray-400 hover:text-cafe-info hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit2 size={18} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-cafe-danger hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <span>Showing 1 to 10 of 42 entries</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50">Prev</button>
            <button className="px-3 py-1 bg-cafe-primary text-white rounded">1</button>
            <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50">2</button>
            <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50">3</button>
            <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50">Next</button>
          </div>
        </div>
      </div>

      {/* Screen 6: Product Modal / Side Drawer */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end">
          <div className="w-[480px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
              <h2 className="text-xl font-bold text-gray-900">Add New Product</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cafe-primary" placeholder="e.g. Latte" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <div className="relative">
                  <select className="w-full appearance-none px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cafe-primary bg-white">
                    <option value="">Select Category</option>
                    <option value="bev">Beverages</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                </div>
                <button 
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="text-sm text-cafe-primary font-medium mt-2 hover:underline"
                >
                  + Create New Category
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cafe-primary" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax (%)</label>
                  <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cafe-primary" placeholder="5" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit of Measure</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cafe-primary bg-white">
                  <option>per piece</option>
                  <option>per kg</option>
                  <option>per litre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cafe-primary resize-none" placeholder="Short product description..."></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 cursor-pointer transition-colors">
                  <ImageIcon size={32} className="mb-2 text-gray-400" />
                  <span className="text-sm font-medium text-cafe-primary">Click to upload</span>
                  <span className="text-xs mt-1">SVG, PNG, JPG (max 2MB)</span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-white transition-colors">
                Cancel
              </button>
              <button className="flex-1 px-4 py-2 bg-cafe-primary text-white rounded-lg font-medium hover:bg-cafe-primary-hover transition-colors">
                Save Product
              </button>
            </div>

            {/* Inline Mini-Modal for Category */}
            {isCategoryModalOpen && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex items-center justify-center p-6">
                <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Create Category</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                      <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cafe-primary" placeholder="e.g. Desserts" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Color Label</label>
                      <div className="grid grid-cols-6 gap-2">
                        {['bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-fuchsia-500', 'bg-pink-500'].map(color => (
                          <button key={color} className={`w-8 h-8 rounded-full ${color} cursor-pointer hover:scale-110 transition-transform ring-2 ring-transparent focus:ring-gray-400`}></button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button onClick={() => setIsCategoryModalOpen(false)} className="flex-1 py-2 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50">Cancel</button>
                      <button className="flex-1 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800">Save</button>
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
