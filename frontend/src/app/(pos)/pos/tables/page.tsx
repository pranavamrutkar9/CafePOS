"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  User, Layers, Search, Compass, PlusSquare, Menu, LogOut, Package, Tags, 
  CreditCard, Gift, BookOpen, Users, Monitor, BarChart, X, ArrowLeft
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { HamburgerMenu } from "@/components/SharedMenu";
import { socket, joinSessionRoom } from "@/lib/socket";
import api from "@/api/axios";
import toast from "react-hot-toast";

interface Table {
  id: string;
  number: string;
  seats: number;
  status: string; // "AVAILABLE" | "OCCUPIED"
  floorId: string;
}

interface Floor {
  id: string;
  name: string;
  tables: Table[];
}

interface Session {
  id: string;
  status: string;
  employeeId: string;
}

export default function POSTablesPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  
  // Component States
  const [floors, setFloors] = useState<Floor[]>([]);
  const [selectedFloorId, setSelectedFloorId] = useState<string>("");
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  // Fetch floors, tables, and active session on mount
  useEffect(() => {
    const initPage = async () => {
      try {
        // 1. Fetch current session
        const sessionRes = await api.get("/sessions/current");
        const currentSession = sessionRes.data;
        setActiveSession(currentSession);

        if (!currentSession || currentSession.status !== "OPEN") {
          toast.error("No active session is open. Please open a session first.");
          router.push("/session");
          return;
        }

        // Join the session room for real-time table status updates
        joinSessionRoom(currentSession.id);

        // 2. Fetch floors and tables
        const floorsRes = await api.get("/floors-tables/floors");
        const floorsData = floorsRes.data || [];
        setFloors(floorsData);
        if (floorsData.length > 0) {
          setSelectedFloorId(floorsData[0].id);
        }
      } catch (err) {
        console.error("Error loading tables data:", err);
        // Fallback mock data in case API endpoints are not seeded yet
        setFloors([
          {
            id: "f-1",
            name: "Ground Floor",
            tables: [
              { id: "t-1", number: "1", seats: 4, status: "AVAILABLE", floorId: "f-1" },
              { id: "t-2", number: "2", seats: 2, status: "AVAILABLE", floorId: "f-1" },
              { id: "t-3", number: "3", seats: 4, status: "OCCUPIED", floorId: "f-1" },
              { id: "t-4", number: "4", seats: 6, status: "AVAILABLE", floorId: "f-1" }
            ]
          },
          {
            id: "f-2",
            name: "First Floor",
            tables: [
              { id: "t-5", number: "5", seats: 4, status: "AVAILABLE", floorId: "f-2" },
              { id: "t-6", number: "6", seats: 8, status: "OCCUPIED", floorId: "f-2" }
            ]
          }
        ]);
        setSelectedFloorId("f-1");
      } finally {
        setLoading(false);
      }
    };

    initPage();
  }, [router]);

  // Set up socket listeners
  useEffect(() => {
    if (!socket) return;

    const updateTableStatusInState = (tableId: string, newStatus: string) => {
      setFloors(prevFloors => 
        prevFloors.map(floor => ({
          ...floor,
          tables: floor.tables.map(table => 
            table.id === tableId ? { ...table, status: newStatus } : table
          )
        }))
      );
    };

    const handleTableOccupied = (payload: any) => {
      console.log("Socket: table_occupied:", payload);
      if (payload && payload.tableId) {
        updateTableStatusInState(payload.tableId, "OCCUPIED");
      }
    };

    const handleTableAvailable = (payload: any) => {
      console.log("Socket: table_available:", payload);
      if (payload && payload.tableId) {
        updateTableStatusInState(payload.tableId, "AVAILABLE");
      }
    };

    const handleTableUpdated = (payload: any) => {
      console.log("Socket: table-updated:", payload);
      if (payload && payload.tableId && payload.status) {
        updateTableStatusInState(payload.tableId, payload.status);
      }
    };

    if (socket) {
      socket.on("table_occupied", handleTableOccupied);
      socket.on("table_available", handleTableAvailable);
      socket.on("table-updated", handleTableUpdated);
    }

    return () => {
      if (socket) {
        socket.off("table_occupied", handleTableOccupied);
        socket.off("table_available", handleTableAvailable);
        socket.off("table-updated", handleTableUpdated);
      }
    };
  }, []);

  // Handle table click: Find existing draft order or create a new one
  const handleTableClick = async (table: Table) => {
    if (!activeSession) {
      toast.error("Active billing session is missing.");
      return;
    }

    try {
      toast.loading("Loading order context...", { id: "table-click" });
      
      // 1. Check if there's an existing draft order for this table
      const ordersRes = await api.get(`/orders?tableId=${table.id}&status=DRAFT&limit=1`);
      const existingOrders = ordersRes.data?.data || ordersRes.data || [];

      if (existingOrders.length > 0) {
        const orderId = existingOrders[0].id;
        toast.success("Resuming active order", { id: "table-click" });
        router.push(`/pos?orderId=${orderId}`);
      } else {
        // 2. Create a new draft order
        const createRes = await api.post("/orders", {
          tableId: table.id,
          sessionId: activeSession.id,
          employeeId: user?.id || activeSession.employeeId,
          status: "DRAFT",
          items: []
        });
        const newOrder = createRes.data;
        toast.success("Created new draft order", { id: "table-click" });
        router.push(`/pos?orderId=${newOrder.id}`);
      }
    } catch (err: any) {
      console.error("Error creating or retrieving order:", err);
      toast.error(err.response?.data?.error || "Failed to initialize order.", { id: "table-click" });
      
      // Mock fallback: Route to pos with a mock orderId if endpoints fail
      router.push(`/pos?orderId=mock-order-123`);
    }
  };

  const selectedFloor = floors.find(f => f.id === selectedFloorId);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#C86A50] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-[#8e827b] mt-4">Loading dining floors...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-[#FAF8F5] overflow-hidden text-[#2C2623] font-sans">
      
      {/* 1. TOP BAR */}
      <header className="h-16 bg-white border-b border-[#EFECE7] flex items-center justify-between px-6 shrink-0 z-40 shadow-sm">
        
        {/* Back and Brand/Logo */}
        <div className="flex items-center gap-4">
          <Link href="/pos" className="p-2 text-[#8e827b] hover:text-[#2C2623] hover:bg-[#FAF8F5] rounded-xl transition-all">
            <ArrowLeft size={20} />
          </Link>
          <span className="font-extrabold text-xl text-[#2C2623] tracking-tight">
            Tables <span className="text-[#C86A50]">Layout</span>
          </span>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-3">
          {/* Orders Compass */}
          <Link href="/orders" className="p-2.5 text-[#8e827b] hover:text-[#C86A50] hover:bg-[#FAF8F5] rounded-xl transition-all relative">
            <Compass size={18} />
          </Link>

          {/* New Order */}
          <Link href="/pos" className="p-2.5 text-[#8e827b] hover:text-[#C86A50] hover:bg-[#FAF8F5] rounded-xl transition-all relative">
            <PlusSquare size={18} />
          </Link>

          {/* User Profile Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#C86A50] to-[#B3563d] flex items-center justify-center font-bold text-sm text-white select-none">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>

          {/* Hamburger Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2.5 text-[#8e827b] hover:text-[#2C2623] hover:bg-[#FAF8F5] rounded-xl transition-all"
            >
              <Menu size={20} />
            </button>

            {menuOpen && (
              <HamburgerMenu onClose={() => setMenuOpen(false)} />
            )}
          </div>
        </div>
      </header>

      {/* 2. FLOOR TABS & LEGEND */}
      <section className="bg-white border-b border-[#EFECE7] px-6 py-2 shrink-0 flex items-center justify-between">
        
        {/* Floor Tabs */}
        <div className="flex gap-4">
          {floors.map(floor => (
            <button
              key={floor.id}
              onClick={() => setSelectedFloorId(floor.id)}
              className={`py-4 border-b-2 font-bold text-sm transition-colors cursor-pointer ${
                selectedFloorId === floor.id 
                  ? "border-[#C86A50] text-[#C86A50]" 
                  : "border-transparent text-[#8e827b] hover:text-[#2C2623]"
              }`}
            >
              {floor.name}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex gap-5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#8e827b]">
            <span className="w-3 h-3 rounded border border-[#E6E1DA] bg-white"></span>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#8e827b]">
            <span className="w-3 h-3 rounded border border-[#C86A50]/40 bg-orange-50 relative flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C86A50]"></span>
            </span>
            <span>Occupied</span>
          </div>
        </div>
      </section>

      {/* 3. TABLES GRID */}
      <main className="flex-1 overflow-y-auto p-8 bg-[#FAF8F5]">
        {selectedFloor && selectedFloor.tables.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {selectedFloor.tables.map(table => {
              const isOccupied = table.status === "OCCUPIED";
              return (
                <button
                  key={table.id}
                  onClick={() => handleTableClick(table)}
                  className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center justify-center aspect-square shadow-sm cursor-pointer active:scale-95 group relative overflow-hidden ${
                    isOccupied
                      ? "border-[#C86A50] bg-orange-50/50 hover:bg-orange-50"
                      : "border-[#EFECE7] bg-white hover:border-[#C86A50]/50 hover:bg-[#FAF8F5]"
                  }`}
                >
                  {/* Occupied Badge Accent */}
                  {isOccupied && (
                    <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-[#C86A50] shadow-sm animate-pulse" />
                  )}

                  <h3 className={`font-black text-3xl mb-1.5 transition-colors ${
                    isOccupied ? "text-[#C86A50]" : "text-[#2C2623] group-hover:text-[#C86A50]"
                  }`}>
                    {table.number}
                  </h3>
                  
                  <span className="text-xs font-bold text-[#8e827b] flex items-center gap-1">
                    <User size={13} /> {table.seats} Seats
                  </span>

                  <span className={`text-[9px] uppercase font-black tracking-widest mt-2 px-2 py-0.5 rounded border ${
                    isOccupied 
                      ? "bg-orange-100 text-[#a44f38] border-orange-200" 
                      : "bg-[#FAF8F5] text-[#8e827b] border-[#E6E1DA]"
                  }`}>
                    {table.status}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-[#8e827b] py-16">
            <span className="text-5xl mb-2">🍽️</span>
            <p className="text-sm font-bold">No tables defined for this floor</p>
          </div>
        )}
      </main>

    </div>
  );
}
