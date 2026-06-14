"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, Users, Loader2 } from "lucide-react";
import api from "@/api/axios";
import toast from "react-hot-toast";

interface Table {
  id: string;
  number: string;
  seats: number;
  status: string;
  floorId: string;
}

interface Floor {
  id: string;
  name: string;
  tables: Table[];
}

export default function FloorsPage() {
  const [floors, setFloors] = useState<Floor[]>([]);
  const [activeFloorId, setActiveFloorId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const [isFloorModalOpen, setIsFloorModalOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);

  // Form states
  const [newFloorName, setNewFloorName] = useState("");
  const [newTableNumber, setNewTableNumber] = useState("");
  const [newTableSeats, setNewTableSeats] = useState("4");
  const [submitting, setSubmitting] = useState(false);

  const fetchFloors = async () => {
    try {
      setLoading(true);
      const res = await api.get("/floors-tables/floors");
      const floorsData = res.data || [];
      setFloors(floorsData);
      
      // Select the first floor if nothing is selected or if current selection is invalid
      if (floorsData.length > 0 && !floorsData.find((f: Floor) => f.id === activeFloorId)) {
        setActiveFloorId(floorsData[0].id);
      }
    } catch (err) {
      console.error("Failed to load floors:", err);
      toast.error("Failed to load floor plan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFloors();
  }, []);

  const handleCreateFloor = async () => {
    if (!newFloorName.trim()) {
      toast.error("Floor name is required");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/floors-tables/floors", { name: newFloorName.trim() });
      toast.success("Floor created successfully!");
      setNewFloorName("");
      setIsFloorModalOpen(false);
      fetchFloors();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create floor");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateTable = async () => {
    if (!newTableNumber.trim()) {
      toast.error("Table number is required");
      return;
    }
    if (!activeFloorId) {
      toast.error("Please select a floor first");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/floors-tables/tables", {
        floorId: activeFloorId,
        number: newTableNumber.trim(),
        seats: parseInt(newTableSeats, 10) || 4,
        status: "AVAILABLE"
      });
      toast.success("Table created successfully!");
      setNewTableNumber("");
      setNewTableSeats("4");
      setIsTableModalOpen(false);
      fetchFloors();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create table");
    } finally {
      setSubmitting(false);
    }
  };

  const activeFloor = floors.find(f => f.id === activeFloorId);

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-cafe-text">Floor Plan</h1>
        <button 
          onClick={() => setIsFloorModalOpen(true)}
          className="btn-primary"
        >
          <Plus size={20} />
          Add Floor
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-cafe-primary" />
        </div>
      ) : (
        <>
          {/* Floor Tabs */}
          <div className="border-b border-[#EFECE7] flex gap-6 overflow-x-auto scrollbar-none">
            {floors.map(floor => (
              <button 
                key={floor.id}
                onClick={() => setActiveFloorId(floor.id)}
                className={`py-3 px-1 border-b-2 font-semibold text-sm transition-all whitespace-nowrap cursor-pointer ${
                  activeFloorId === floor.id 
                    ? 'border-cafe-primary text-cafe-primary' 
                    : 'border-transparent text-[#8E827B] hover:text-cafe-text'
                }`}
              >
                {floor.name}
              </button>
            ))}
            {floors.length === 0 && (
              <p className="py-3 text-sm text-[#8E827B] italic">No floors created yet.</p>
            )}
          </div>

          {/* Grid View */}
          {activeFloor && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pt-2">
              {/* Table Card */}
              {activeFloor.tables.map((table) => (
                <div key={table.id} className="paper-card rounded-xl p-5 relative group">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-extrabold text-cafe-text text-2xl">T{table.number}</h3>
                    <div className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${
                      table.status === 'OCCUPIED' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {table.status}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#8E827B]">
                    <Users size={15} />
                    <span className="text-xs font-semibold uppercase tracking-wider">{table.seats} Seats</span>
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
          )}
        </>
      )}

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
                  value={newTableNumber}
                  onChange={e => setNewTableNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 paper-input rounded-xl focus:outline-none focus:border-cafe-primary focus:ring-1 focus:ring-cafe-primary" 
                  placeholder="e.g. 12 or Balcony-1" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8E827B] uppercase tracking-wider mb-2">Number of Seats</label>
                <input 
                  type="number" 
                  value={newTableSeats}
                  onChange={e => setNewTableSeats(e.target.value)}
                  className="w-full px-3.5 py-2.5 paper-input rounded-xl focus:outline-none focus:border-cafe-primary focus:ring-1 focus:ring-cafe-primary" 
                  placeholder="4" 
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-[#EFECE7] bg-[#FAF8F5] flex gap-3">
              <button 
                onClick={() => setIsTableModalOpen(false)} 
                disabled={submitting}
                className="flex-1 py-2.5 border border-[#E6E1DA] text-cafe-text rounded-xl font-medium bg-white hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateTable}
                disabled={submitting}
                className="btn-primary flex-1 justify-center"
              >
                {submitting ? "Saving..." : "Save Table"}
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
                value={newFloorName}
                onChange={e => setNewFloorName(e.target.value)}
                className="w-full px-3.5 py-2.5 paper-input rounded-xl focus:outline-none focus:border-cafe-primary focus:ring-1 focus:ring-cafe-primary" 
                placeholder="e.g. Rooftop" 
              />
            </div>
            
            <div className="p-6 border-t border-[#EFECE7] bg-[#FAF8F5] flex gap-3">
              <button 
                onClick={() => setIsFloorModalOpen(false)} 
                disabled={submitting}
                className="flex-1 py-2.5 border border-[#E6E1DA] text-cafe-text rounded-xl font-medium bg-white hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateFloor}
                disabled={submitting}
                className="btn-primary flex-1 justify-center"
              >
                {submitting ? "Saving..." : "Save Floor"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
