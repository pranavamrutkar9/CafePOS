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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl rounded-[2rem] shadow-2xl flex flex-col max-h-full overflow-hidden border border-[#efece7] animate-in fade-in zoom-in-95 duration-200 relative before:absolute before:inset-2 before:border before:border-[#fbfaf8] before:rounded-[1.8rem] before:pointer-events-none">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#efece7] relative z-10">
          <h2 className="text-2xl font-extrabold text-[#2c2623]">Select Table</h2>
          <button 
            onClick={() => setTableModalOpen(false)}
            className="p-2 hover:bg-[#faf8f5] rounded-full transition-colors text-[#8e827b] hover:text-[#2c2623] cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        {/* Floor Tabs */}
        <div className="flex overflow-x-auto border-b border-[#efece7] bg-[#faf8f5] px-6 py-3.5 gap-2 hide-scrollbar relative z-10">
          {FLOORS.map((floor) => (
            <button
              key={floor.id}
              onClick={() => setActiveFloorId(floor.id)}
              className={`px-6 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeFloorId === floor.id
                  ? "bg-[#c86a50] text-white shadow-sm"
                  : "bg-white text-[#8e827b] border border-[#e6e1da] hover:bg-[#faf8f5] hover:text-[#2c2623]"
              }`}
            >
              {floor.name}
            </button>
          ))}
        </div>

        {/* Tables Grid */}
        <div className="p-6 overflow-y-auto flex-1 bg-white relative z-10 organic-scrollbar">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {activeFloor.tables.map((table) => (
              <button
                key={table.id}
                onClick={() => handleTableSelect(table, activeFloor.name)}
                className={`relative aspect-square rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 transition-transform hover:scale-[1.02] active:scale-95 border cursor-pointer ${
                  table.isActiveOrder
                    ? "bg-[#d3524b]/8 border-[#d3524b]/30 text-[#d3524b]"
                    : "bg-[#faf8f5] border-[#efece7] text-[#2c2623] hover:border-[#8e827b] hover:bg-white"
                }`}
              >
                <span className="text-2xl font-black">T{table.number}</span>
                <div className="flex items-center gap-1 text-xs opacity-75">
                  <Users size={14} />
                  <span>{table.seats} Seats</span>
                </div>
                {table.isActiveOrder && (
                  <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-[#d3524b] shadow-[0_0_8px_rgba(211,82,75,0.6)] animate-pulse"></span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
