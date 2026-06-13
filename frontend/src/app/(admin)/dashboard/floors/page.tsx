"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, X, Users } from "lucide-react";

export default function FloorsPage() {
  const [activeTab, setActiveTab] = useState("ground");
  const [isFloorModalOpen, setIsFloorModalOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-cafe-text">Floor Plan</h1>
        <button 
          onClick={() => setIsFloorModalOpen(true)}
          className="btn-terracotta px-4 py-2.5 rounded-xl font-medium flex items-center gap-2"
        >
          <Plus size={20} />
          Add Floor
        </button>
      </div>

      {/* Floor Tabs */}
      <div className="border-b border-[#EFECE7] flex gap-6">
        <button 
          onClick={() => setActiveTab("ground")}
          className={`py-3 px-1 border-b-2 font-semibold text-sm transition-all cursor-pointer ${
            activeTab === 'ground' 
              ? 'border-cafe-primary text-cafe-primary' 
              : 'border-transparent text-[#8E827B] hover:text-cafe-text'
          }`}
        >
          Ground Floor
        </button>
        <button 
          onClick={() => setActiveTab("first")}
          className={`py-3 px-1 border-b-2 font-semibold text-sm transition-all cursor-pointer ${
            activeTab === 'first' 
              ? 'border-cafe-primary text-cafe-primary' 
              : 'border-transparent text-[#8E827B] hover:text-cafe-text'
          }`}
        >
          First Floor
        </button>
      </div>

      {/* Grid View */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pt-2">
        {/* Table Card */}
        {[1, 2, 3, 4, 5].map((num) => (
          <div key={num} className="paper-card rounded-xl p-5 relative group">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-extrabold text-cafe-text text-2xl">T{num}</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-9 h-5 bg-[#E6E1DA] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cafe-success"></div>
              </label>
            </div>
            <div className="flex items-center gap-1.5 text-[#8E827B]">
              <Users size={15} />
              <span className="text-xs font-semibold uppercase tracking-wider">4 Seats</span>
            </div>
            
            {/* Hover Actions */}
            <div className="absolute inset-0 bg-white/95 backdrop-blur-xs opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity rounded-xl">
               <button className="w-10 h-10 bg-white border border-[#EFECE7] shadow-xs rounded-full flex items-center justify-center text-[#8E827B] hover:text-cafe-primary hover:bg-[#FAF8F5] transition-colors cursor-pointer">
                  <Edit2 size={16} />
               </button>
               <button className="w-10 h-10 bg-white border border-[#EFECE7] shadow-xs rounded-full flex items-center justify-center text-[#8E827B] hover:text-cafe-danger hover:bg-[#FAF8F5] transition-colors cursor-pointer">
                  <Trash2 size={16} />
               </button>
            </div>
          </div>
        ))}

        {/* Add Table Button */}
        <button 
          onClick={() => setIsTableModalOpen(true)}
          className="rounded-xl border-2 border-dashed border-[#E6E1DA] flex flex-col items-center justify-center p-6 text-[#8E827B] hover:text-cafe-primary hover:border-cafe-primary hover:bg-[#FAF8F5] transition-all min-h-[120px] cursor-pointer"
        >
          <Plus size={28} className="mb-1.5 text-cafe-primary" />
          <span className="font-semibold text-xs uppercase tracking-wider">Add Table</span>
        </button>
      </div>

      {/* Modals */}
      {isTableModalOpen && (
        <div className="fixed inset-0 bg-[#2C2623]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="paper-panel rounded-2xl w-full max-w-md animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-[#EFECE7] flex justify-between items-center bg-white">
              <h2 className="text-lg font-bold text-cafe-text">Add Table</h2>
              <button 
                onClick={() => setIsTableModalOpen(false)} 
                className="p-1.5 text-[#8E827B] hover:text-cafe-text rounded-full hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 space-y-4 bg-white">
              <div>
                <label className="block text-xs font-semibold text-[#8E827B] uppercase tracking-wider mb-2">Table Number</label>
                <input 
                  type="text" 
                  className="w-full px-3.5 py-2.5 paper-input rounded-xl focus:outline-none" 
                  placeholder="e.g. 12 or Balcony-1" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8E827B] uppercase tracking-wider mb-2">Number of Seats</label>
                <input 
                  type="number" 
                  className="w-full px-3.5 py-2.5 paper-input rounded-xl focus:outline-none" 
                  placeholder="4" 
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-[#EFECE7] bg-[#FAF8F5] flex gap-3">
              <button 
                onClick={() => setIsTableModalOpen(false)} 
                className="flex-1 py-2.5 border border-[#E6E1DA] text-cafe-text rounded-xl font-medium bg-white hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button className="flex-1 py-2.5 btn-terracotta rounded-xl font-medium cursor-pointer">
                Save Table
              </button>
            </div>
          </div>
        </div>
      )}

      {isFloorModalOpen && (
        <div className="fixed inset-0 bg-[#2C2623]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="paper-panel rounded-2xl w-full max-w-sm animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-[#EFECE7] flex justify-between items-center bg-white">
              <h2 className="text-lg font-bold text-cafe-text">Add Floor</h2>
              <button 
                onClick={() => setIsFloorModalOpen(false)} 
                className="p-1.5 text-[#8E827B] hover:text-cafe-text rounded-full hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 bg-white">
              <label className="block text-xs font-semibold text-[#8E827B] uppercase tracking-wider mb-2">Floor Name</label>
              <input 
                type="text" 
                className="w-full px-3.5 py-2.5 paper-input rounded-xl focus:outline-none" 
                placeholder="e.g. Rooftop" 
              />
            </div>
            
            <div className="p-6 border-t border-[#EFECE7] bg-[#FAF8F5] flex gap-3">
              <button 
                onClick={() => setIsFloorModalOpen(false)} 
                className="flex-1 py-2.5 border border-[#E6E1DA] text-cafe-text rounded-xl font-medium bg-white hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button className="flex-1 py-2.5 btn-terracotta rounded-xl font-medium cursor-pointer">
                Save Floor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
