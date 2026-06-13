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
        <h1 className="text-2xl font-bold text-gray-900">Floor Plan</h1>
        <button 
          onClick={() => setIsFloorModalOpen(true)}
          className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Add Floor
        </button>
      </div>

      {/* Floor Tabs */}
      <div className="border-b border-gray-200 flex gap-6">
        <button 
          onClick={() => setActiveTab("ground")}
          className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'ground' ? 'border-cafe-primary text-cafe-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Ground Floor
        </button>
        <button 
          onClick={() => setActiveTab("first")}
          className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'first' ? 'border-cafe-primary text-cafe-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          First Floor
        </button>
      </div>

      {/* Grid View */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pt-4">
        {/* Table Card */}
        {[1, 2, 3, 4, 5].map((num) => (
          <div key={num} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 relative group hover:border-cafe-primary transition-colors">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-gray-900 text-2xl">T{num}</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>
            <div className="flex items-center gap-1.5 text-gray-500">
              <Users size={16} />
              <span className="text-sm font-medium">4 Seats</span>
            </div>
            
            {/* Hover Actions */}
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity rounded-xl">
               <button className="w-10 h-10 bg-white border border-gray-200 shadow-sm rounded-full flex items-center justify-center text-gray-600 hover:text-cafe-info hover:bg-blue-50 transition-colors">
                  <Edit2 size={18} />
               </button>
               <button className="w-10 h-10 bg-white border border-gray-200 shadow-sm rounded-full flex items-center justify-center text-gray-600 hover:text-cafe-danger hover:bg-red-50 transition-colors">
                  <Trash2 size={18} />
               </button>
            </div>
          </div>
        ))}

        {/* Add Table Button */}
        <button 
          onClick={() => setIsTableModalOpen(true)}
          className="rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-6 text-gray-500 hover:text-cafe-primary hover:border-cafe-primary hover:bg-orange-50 transition-all min-h-[120px]"
        >
          <Plus size={32} className="mb-2" />
          <span className="font-medium text-sm">Add Table</span>
        </button>
      </div>

      {/* Modals */}
      {isTableModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Add Table</h2>
              <button onClick={() => setIsTableModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Table Number</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cafe-primary" placeholder="e.g. 12 or Balcony-1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Seats</label>
                <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cafe-primary" placeholder="4" />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3 bg-gray-50 rounded-b-xl">
              <button onClick={() => setIsTableModalOpen(false)} className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-white">Cancel</button>
              <button className="flex-1 py-2 bg-cafe-primary text-white rounded-lg font-medium hover:bg-cafe-primary-hover">Save</button>
            </div>
          </div>
        </div>
      )}

      {isFloorModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Add Floor</h2>
              <button onClick={() => setIsFloorModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Floor Name</label>
              <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cafe-primary" placeholder="e.g. Rooftop" />
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3 bg-gray-50 rounded-b-xl">
              <button onClick={() => setIsFloorModalOpen(false)} className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-white">Cancel</button>
              <button className="flex-1 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
