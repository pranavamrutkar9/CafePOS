"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, X } from "lucide-react";

export default function CategoriesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const categories = [
    { name: "Beverages", color: "bg-amber-500", count: 24 },
    { name: "Food", color: "bg-red-500", count: 42 },
    { name: "Desserts", color: "bg-pink-500", count: 15 },
    { name: "Add-ons", color: "bg-emerald-500", count: 8 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-cafe-primary hover:bg-cafe-primary-hover text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Add Category
        </button>
      </div>

      <div className="bg-blue-50 text-cafe-info p-4 rounded-lg flex items-center gap-3 text-sm">
        <span className="font-bold">Note:</span> Color updates here reflect across POS product cards, category tabs, and order view in real time.
      </div>

      {/* Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <div key={cat.name} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-start gap-4 group hover:shadow-md transition-shadow relative overflow-hidden">
            {/* Color Stripe */}
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${cat.color}`}></div>
            
            <div className={`w-12 h-12 rounded-lg ${cat.color} bg-opacity-20 flex items-center justify-center shrink-0`}>
               <div className={`w-4 h-4 rounded-full ${cat.color}`}></div>
            </div>
            
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg mb-1">{cat.name}</h3>
              <p className="text-gray-500 text-sm">{cat.count} Products</p>
            </div>

            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 absolute top-4 right-4">
              <button className="p-1.5 text-gray-400 hover:text-cafe-info bg-white shadow-sm rounded-md border border-gray-100">
                <Edit2 size={16} />
              </button>
              <button className="p-1.5 text-gray-400 hover:text-cafe-danger bg-white shadow-sm rounded-md border border-gray-100">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Add Category</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cafe-primary" placeholder="e.g. Extras" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Color Swatch</label>
                <div className="grid grid-cols-6 gap-3">
                  {['bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-fuchsia-500', 'bg-pink-500'].map(color => (
                    <button key={color} className={`w-full aspect-square rounded-full ${color} cursor-pointer hover:scale-110 transition-transform ring-2 ring-offset-2 ring-transparent focus:ring-gray-400`}></button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3 rounded-b-xl">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-white transition-colors">
                Cancel
              </button>
              <button className="flex-1 px-4 py-2 bg-cafe-primary text-white rounded-lg font-medium hover:bg-cafe-primary-hover transition-colors">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
