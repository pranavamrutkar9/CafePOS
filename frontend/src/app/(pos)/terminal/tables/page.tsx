"use client";

import { useState } from "react";
import { User, Layers } from "lucide-react";

export default function TablesPage() {
  const [activeTab, setActiveTab] = useState("ground");

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
      <div className="p-6 border-b border-gray-200 bg-white shrink-0 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Table View</h1>
          <p className="text-sm text-gray-500 mt-1">Manage active orders by table</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="w-3 h-3 rounded-full border-2 border-gray-300"></span>
            Available
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="w-3 h-3 rounded-full bg-orange-100 border-2 border-cafe-primary relative">
              <span className="absolute top-[-4px] right-[-4px] w-2 h-2 bg-red-500 rounded-full"></span>
            </span>
            Active Order
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200 px-6 shrink-0 flex gap-8">
        <button 
          onClick={() => setActiveTab("ground")}
          className={`py-4 border-b-2 font-bold text-lg transition-colors ${activeTab === 'ground' ? 'border-cafe-primary text-cafe-primary' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
        >
          Ground Floor
        </button>
        <button 
          onClick={() => setActiveTab("first")}
          className={`py-4 border-b-2 font-bold text-lg transition-colors ${activeTab === 'first' ? 'border-cafe-primary text-cafe-primary' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
        >
          First Floor
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => {
            const isActive = num === 4 || num === 7;
            return (
              <button 
                key={num} 
                className={`relative p-6 rounded-2xl border-2 transition-all shadow-sm flex flex-col items-center justify-center aspect-square ${
                  isActive 
                    ? 'border-cafe-primary bg-orange-50 hover:bg-orange-100' 
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {isActive && <div className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-sm"></div>}
                <h3 className={`font-bold text-3xl mb-2 ${isActive ? 'text-cafe-primary' : 'text-gray-900'}`}>{num}</h3>
                <span className="text-sm font-medium text-gray-500 flex items-center gap-1"><User size={14}/> 4</span>
                {isActive && (
                  <div className="absolute bottom-3 text-xs font-bold text-cafe-primary bg-white px-2 py-1 rounded-md border border-orange-200 shadow-sm">
                    ₹892.50
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
