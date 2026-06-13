"use client";

import { useEffect } from "react";
import { usePOSStore } from "@/store/usePOSStore";

export default function POSPage() {
  const { selectedTable, setTableModalOpen } = usePOSStore();

  useEffect(() => {
    // Automatically pop open the modal if no table is selected
    if (!selectedTable) {
      setTableModalOpen(true);
    }
  }, [selectedTable, setTableModalOpen]);

  return (
    <div className="p-4 h-full flex flex-col">
      <h1 className="text-2xl font-bold mb-4">POS Terminal</h1>
      {selectedTable ? (
        <div className="flex-1 border border-gray-700 rounded-xl bg-cafe-card p-6 flex flex-col items-center justify-center">
          <p className="text-xl text-cafe-primary font-medium mb-2">Order View</p>
          <p className="text-gray-400">Currently serving: {selectedTable.floorName} - Table {selectedTable.tableNumber}</p>
        </div>
      ) : (
        <div className="flex-1 border border-gray-700 border-dashed rounded-xl p-6 flex items-center justify-center">
          <p className="text-gray-500">Please select a table to begin taking orders.</p>
        </div>
      )}
    </div>
  );
}
