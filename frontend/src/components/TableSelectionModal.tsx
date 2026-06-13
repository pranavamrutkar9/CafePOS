"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Users } from "lucide-react";
import { usePOSStore } from "@/store/usePOSStore";

// Mock data for floors and tables
const FLOORS = [
  {
    id: "f1",
    name: "Main Floor",
    tables: [
      { id: "t1", number: "1", seats: 2, isActiveOrder: false },
      { id: "t2", number: "2", seats: 2, isActiveOrder: true },
      { id: "t3", number: "3", seats: 4, isActiveOrder: false },
      { id: "t4", number: "4", seats: 4, isActiveOrder: false },
      { id: "t5", number: "5", seats: 6, isActiveOrder: true },
      { id: "t6", number: "6", seats: 6, isActiveOrder: false },
    ],
  },
  {
    id: "f2",
    name: "Patio",
    tables: [
      { id: "t7", number: "11", seats: 4, isActiveOrder: false },
      { id: "t8", number: "12", seats: 4, isActiveOrder: false },
      { id: "t9", number: "13", seats: 2, isActiveOrder: true },
      { id: "t10", number: "14", seats: 8, isActiveOrder: false },
    ],
  },
];

export default function TableSelectionModal() {
  const router = useRouter();
  const { isTableModalOpen, setTableModalOpen, setSelectedTable } = usePOSStore();
  const [activeFloorId, setActiveFloorId] = useState(FLOORS[0].id);

  if (!isTableModalOpen) return null;

  const activeFloor = FLOORS.find((f) => f.id === activeFloorId) || FLOORS[0];

  const handleTableSelect = (table: any, floorName: string) => {
    setSelectedTable({
      floorName,
      tableNumber: table.number,
      seats: table.seats,
    });
    setTableModalOpen(false);
    router.push("/pos");
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
      <div className="bg-cafe-card w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-full overflow-hidden border border-gray-700 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-cafe-text">Select Table</h2>
          <button 
            onClick={() => setTableModalOpen(false)}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Floor Tabs */}
        <div className="flex overflow-x-auto border-b border-gray-700 px-6 py-2 gap-2 hide-scrollbar">
          {FLOORS.map((floor) => (
            <button
              key={floor.id}
              onClick={() => setActiveFloorId(floor.id)}
              className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeFloorId === floor.id
                  ? "bg-cafe-primary text-white"
                  : "bg-[#1e1e1e] text-gray-400 hover:bg-gray-700 hover:text-gray-200"
              }`}
            >
              {floor.name}
            </button>
          ))}
        </div>

        {/* Tables Grid */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {activeFloor.tables.map((table) => (
              <button
                key={table.id}
                onClick={() => handleTableSelect(table, activeFloor.name)}
                className={`relative aspect-square rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-95 border ${
                  table.isActiveOrder
                    ? "bg-cafe-danger/20 border-cafe-danger text-cafe-danger"
                    : "bg-[#1e1e1e] border-gray-700 text-cafe-text hover:border-gray-500"
                }`}
              >
                <span className="text-3xl font-bold">T{table.number}</span>
                <div className="flex items-center gap-1 text-sm opacity-80">
                  <Users size={16} />
                  <span>{table.seats}</span>
                </div>
                {table.isActiveOrder && (
                  <span className="absolute top-2 right-2 w-3 h-3 rounded-full bg-cafe-danger shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse"></span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
