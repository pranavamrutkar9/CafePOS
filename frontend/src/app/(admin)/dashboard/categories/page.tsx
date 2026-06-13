"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, X, Info } from "lucide-react";

export default function CategoriesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const categories = [
    { name: "Beverages", color: "bg-[#D99C4C]", count: 24 }, // warm amber
    { name: "Food", color: "bg-[#C86A50]", count: 42 },      // warm terracotta
    { name: "Desserts", color: "bg-[#D3524B]", count: 15 },  // warm red
    { name: "Add-ons", color: "bg-[#557A61]", count: 8 },    // sage green
  ];

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-cafe-text">Categories</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-terracotta px-4 py-2.5 rounded-xl font-medium flex items-center gap-2"
        >
          <Plus size={20} />
          Add Category
        </button>
      </div>

      <div className="bg-[#FAF8F5] border border-[#EFECE7] text-[#8E827B] p-4 rounded-xl flex items-center gap-3 text-sm font-medium">
        <Info size={18} className="text-[#C86A50] shrink-0" />
        <span>Color updates here reflect across POS product cards, category tabs, and order views in real time.</span>
      </div>

      {/* Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <div 
            key={cat.name} 
            className="paper-card rounded-xl p-5 flex items-start gap-4 group relative overflow-hidden"
          >
            {/* Color Stripe */}
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${cat.color}`}></div>
            
            <div className={`w-12 h-12 rounded-lg ${cat.color} bg-opacity-10 flex items-center justify-center shrink-0`}>
               <div className={`w-4 h-4 rounded-full ${cat.color}`}></div>
            </div>
            
            <div className="flex-1">
              <h3 className="font-bold text-cafe-text text-lg mb-0.5">{cat.name}</h3>
              <p className="text-[#8E827B] text-sm">{cat.count} Products</p>
            </div>

            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5 absolute top-4 right-4">
              <button className="p-1.5 text-[#8E827B] hover:text-cafe-primary hover:bg-[#FAF8F5] bg-white shadow-xs rounded-lg border border-[#EFECE7] transition-colors cursor-pointer">
                <Edit2 size={15} />
              </button>
              <button className="p-1.5 text-[#8E827B] hover:text-cafe-danger hover:bg-[#FAF8F5] bg-white shadow-xs rounded-lg border border-[#EFECE7] transition-colors cursor-pointer">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#2C2623]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="paper-panel rounded-2xl w-full max-w-md animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-[#EFECE7] flex justify-between items-center bg-white">
              <h2 className="text-lg font-bold text-cafe-text">Add Category</h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-1.5 text-[#8E827B] hover:text-cafe-text rounded-full hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 space-y-5 bg-white">
              <div>
                <label className="block text-xs font-semibold text-[#8E827B] uppercase tracking-wider mb-2">Category Name</label>
                <input 
                  type="text" 
                  className="w-full px-3.5 py-2.5 paper-input rounded-xl focus:outline-none" 
                  placeholder="e.g. Extras" 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8E827B] uppercase tracking-wider mb-3">Color Swatch</label>
                <div className="grid grid-cols-6 gap-3">
                  {[
                    'bg-[#C86A50]', // terracotta
                    'bg-[#D99C4C]', // amber
                    'bg-[#557A61]', // sage green
                    'bg-[#D3524B]', // warm red
                    'bg-[#5076a8]', // warm blue
                    'bg-[#7D6B58]', // warm taupe/wood
                    'bg-[#E08E79]', // light terracotta
                    'bg-[#E2B13C]', // warm yellow
                    'bg-[#6F8F72]', // light sage
                    'bg-[#E56A54]', // coral
                    'bg-[#6C5B7B]', // muted purple
                    'bg-[#4B807A]'  // pine/teal
                  ].map(color => (
                    <button 
                      key={color} 
                      className={`w-full aspect-square rounded-full ${color} cursor-pointer hover:scale-110 transition-transform ring-2 ring-offset-2 ring-transparent focus:ring-[#C86A50]`}
                    ></button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-[#EFECE7] bg-[#FAF8F5] flex gap-3">
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="flex-1 px-4 py-2.5 border border-[#E6E1DA] text-cafe-text rounded-xl font-medium bg-white hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button className="flex-1 px-4 py-2.5 btn-terracotta rounded-xl font-medium cursor-pointer">
                Save Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
