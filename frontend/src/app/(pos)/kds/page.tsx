"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Search, User, Compass, PlusSquare, Menu, LogOut, Package, Tags, 
  CreditCard, Gift, BookOpen, Users, Monitor, BarChart, ChevronLeft, 
  ChevronRight, CheckSquare, Square, RefreshCw, Flame, CheckCircle2, Clock
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { HamburgerMenu } from "@/components/SharedMenu";
import { socket, joinKdsRoom } from "@/lib/socket";
import api from "@/api/axios";
import toast from "react-hot-toast";

// Hardcoded Filters Categories and Products
const FILTER_PRODUCTS = ["Burger", "Pizza", "Coffee", "Water"];
const FILTER_CATEGORIES = ["Desert", "Quick Bites", "Drink"];

// Product to Category mapping for filtering logic
const PRODUCT_CATEGORY_MAP: Record<string, string> = {
  "Burger": "Quick Bites",
  "Pizza": "Quick Bites",
  "Coffee": "Drink",
  "Water": "Drink",
  "Dessert": "Desert",
  "Chocolate Cake": "Desert",
  "Red Velvet Pastry": "Desert",
  "Joy Signature Burger": "Quick Bites",
  "Club Sandwich Deluxe": "Quick Bites",
  "Cappuccino": "Drink",
  "Latte Macchiato": "Drink",
  "Iced Peach Tea": "Drink"
};

// Interface definitions
interface KitchenTicketItem {
  id: string;
  name: string;
  qty: number;
  completed: boolean;
}

interface KitchenTicket {
  id: string;
  orderNumber: string;
  status: "TO_COOK" | "PREPARING" | "COMPLETED";
  items: KitchenTicketItem[];
  createdAt: string;
}

export default function KDSPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  // Component States
  const [tickets, setTickets] = useState<KitchenTicket[]>([
    {
      id: "ticket-1",
      orderNumber: "1024",
      status: "TO_COOK",
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
      items: [
        { id: "i-1-1", name: "Joy Signature Burger", qty: 2, completed: false },
        { id: "i-1-2", name: "Water", qty: 1, completed: false },
      ]
    },
    {
      id: "ticket-2",
      orderNumber: "1025",
      status: "PREPARING",
      createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(), // 8 mins ago
      items: [
        { id: "i-2-1", name: "Pizza", qty: 1, completed: true },
        { id: "i-2-2", name: "Coffee", qty: 2, completed: false },
      ]
    },
    {
      id: "ticket-3",
      orderNumber: "1026",
      status: "COMPLETED",
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
      items: [
        { id: "i-3-1", name: "Red Velvet Pastry", qty: 1, completed: true },
        { id: "i-3-2", name: "Cappuccino", qty: 1, completed: true },
      ]
    }
  ]);

  const [activeTab, setActiveTab] = useState<"ALL" | "TO_COOK" | "PREPARING" | "COMPLETED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 3; // N = 3 cards per page for horizontal layout pagination

  // Load existing kitchen tickets from backend on mount
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await api.get("/kds/tickets");
        const normalized = (res.data || []).map((t: any) => ({
          id: t.id,
          orderNumber: t.order?.id?.substring(0, 4) || t.orderNumber || "0000",
          status: t.status,
          createdAt: t.createdAt,
          items: (t.items || []).map((item: any) => ({
            id: item.id,
            name: item.orderItem?.product?.name || "Unknown Product",
            qty: item.orderItem?.qty || 1,
            completed: item.completed
          }))
        }));
        setTickets(normalized);
      } catch (err) {
        console.error("Failed to fetch KDS tickets:", err);
      }
    };
    fetchTickets();
  }, []);

  // Connect to socket room and register listeners
  useEffect(() => {
    // Join KDS room
    joinKdsRoom();
    console.log("Joined KDS Room via Socket Client");

    if (!socket) return;

    const handleTicketSocket = (payload: any) => {
      if (!payload || !payload.id) return;
      console.log("KDS Socket ticket received:", payload);
      
      const normalizedTicket: KitchenTicket = {
        id: payload.id,
        orderNumber: payload.order?.id?.substring(0, 4) || payload.orderNumber || "0000",
        status: payload.status,
        createdAt: payload.createdAt,
        items: (payload.items || []).map((item: any) => ({
          id: item.id,
          name: item.orderItem?.product?.name || item.name || "Unknown Product",
          qty: item.orderItem?.qty || item.quantity || 1,
          completed: item.completed || false
        }))
      };

      setTickets(prev => {
        const index = prev.findIndex(t => t.id === payload.id);
        if (index > -1) {
          const next = [...prev];
          next[index] = normalizedTicket;
          return next;
        } else {
          return [normalizedTicket, ...prev];
        }
      });
    };

    socket.on("new-ticket", handleTicketSocket);
    socket.on("ticket-updated", handleTicketSocket);
    socket.on("kitchen_ticket_created", handleTicketSocket);

    return () => {
      if (socket) {
        socket.off("new-ticket", handleTicketSocket);
        socket.off("ticket-updated", handleTicketSocket);
        socket.off("kitchen_ticket_created", handleTicketSocket);
      }
    };
  }, []);

  // Filter handlers
  const handleToggleProductFilter = (product: string) => {
    setSelectedProducts(prev => 
      prev.includes(product) ? prev.filter(p => p !== product) : [...prev, product]
    );
    setCurrentPage(1); // Reset page on filter change
  };

  const handleToggleCategoryFilter = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSelectedProducts([]);
    setSelectedCategories([]);
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Strikethrough completed lines within a ticket card
  const handleToggleItemCompleted = async (ticketId: string, itemId: string) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    const item = ticket.items.find(i => i.id === itemId);
    if (!item) return;

    try {
      await api.patch(`/kds/tickets/${ticketId}/items/${itemId}`, {
        completed: !item.completed
      });
      setTickets(prev => prev.map(t => {
        if (t.id === ticketId) {
          return {
            ...t,
            items: t.items.map(i => i.id === itemId ? { ...i, completed: !i.completed } : i)
          };
        }
        return t;
      }));
    } catch (err) {
      toast.error("Failed to update item status.");
    }
  };

  // Advance ticket status: TO_COOK -> PREPARING -> COMPLETED
  const handleAdvanceTicketStatus = async (ticketId: string) => {
    try {
      const res = await api.patch(`/kds/tickets/${ticketId}/advance`);
      const updated = res.data;
      
      setTickets(prev => prev.map(t => {
        if (t.id === ticketId) {
          return { ...t, status: updated.status };
        }
        return t;
      }));
      toast.success(`Ticket advanced to ${updated.status}`);
    } catch (err) {
      toast.error("Failed to advance ticket status.");
    }
  };

  // Dynamic ticket counts for status tabs
  const tabCounts = useMemo(() => {
    const counts = { ALL: 0, TO_COOK: 0, PREPARING: 0, COMPLETED: 0 };
    tickets.forEach(t => {
      counts.ALL++;
      if (t.status === "TO_COOK") counts.TO_COOK++;
      else if (t.status === "PREPARING") counts.PREPARING++;
      else if (t.status === "COMPLETED") counts.COMPLETED++;
    });
    return counts;
  }, [tickets]);

  // Filtering Logic
  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      // 1. Status Filter
      if (activeTab !== "ALL" && ticket.status !== activeTab) {
        return false;
      }

      // 2. Search Query Filter (order number or product name)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesOrder = ticket.orderNumber.toLowerCase().includes(query);
        const matchesProduct = ticket.items.some(item => item.name.toLowerCase().includes(query));
        if (!matchesOrder && !matchesProduct) return false;
      }

      // 3. Product Multi-select Filter (ticket must contain at least one of selected products if any selected)
      if (selectedProducts.length > 0) {
        const hasMatchingProduct = ticket.items.some(item => 
          selectedProducts.some(p => item.name.toLowerCase().includes(p.toLowerCase()))
        );
        if (!hasMatchingProduct) return false;
      }

      // 4. Category Multi-select Filter (ticket must contain at least one product matching the selected categories)
      if (selectedCategories.length > 0) {
        const hasMatchingCategory = ticket.items.some(item => {
          // Find if item name corresponds to category in mapping
          const mappedCat = Object.keys(PRODUCT_CATEGORY_MAP).find(k => 
            item.name.toLowerCase().includes(k.toLowerCase())
          );
          const category = mappedCat ? PRODUCT_CATEGORY_MAP[mappedCat] : null;
          return category && selectedCategories.includes(category);
        });
        if (!hasMatchingCategory) return false;
      }

      return true;
    });
  }, [tickets, activeTab, searchQuery, selectedProducts, selectedCategories]);

  // Pagination Logic
  const totalFilteredCount = filteredTickets.length;
  const totalPages = Math.ceil(totalFilteredCount / pageSize) || 1;
  const paginatedTickets = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredTickets.slice(startIndex, startIndex + pageSize);
  }, [filteredTickets, currentPage]);

  const startIndex = totalFilteredCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endIndex = Math.min(currentPage * pageSize, totalFilteredCount);

  // Time formatter helper
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return "00:00";
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#FAF8F5] overflow-hidden text-[#2C2623] font-sans">
      
      {/* 1. TOP BAR */}
      <header className="h-16 bg-white border-b border-[#EFECE7] flex items-center justify-between px-6 shrink-0 z-40 shadow-sm">
        
        {/* Brand/Logo & Page Name */}
        <div className="flex items-center gap-4">
          <Link href="/pos" className="flex items-center gap-2.5 font-black text-2xl tracking-tight">
            <span className="w-8 h-8 bg-gradient-to-tr from-[#C86A50] to-[#B3563d] rounded-lg text-white flex items-center justify-center text-sm shadow-sm">C</span>
            <span>Cafe<span className="text-[#C86A50]">POS</span></span>
          </Link>
          <span className="h-5 w-px bg-[#EFECE7]"></span>
          <span className="bg-[#FAF8F5] border border-[#E6E1DA] text-[#C86A50] font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-inner">
            KDS
          </span>
        </div>

        {/* Action Controls (Matched to POS Layout Icons) */}
        <div className="flex items-center gap-3">
          {/* Cashier Icon */}
          <Link href="/pos" className="p-2.5 text-[#8e827b] hover:text-[#C86A50] hover:bg-[#FAF8F5] rounded-xl transition-all relative">
            <User size={18} />
          </Link>

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

          {/* Hamburger Dropdown Menu (Strictly ordered menu) */}
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

      {/* 2. SUB HEADER (TABS, SEARCH & PAGINATION) */}
      <section className="bg-white border-b border-[#EFECE7] px-6 py-3 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Tabs Row */}
        <div className="flex overflow-x-auto gap-2 scrollbar-none py-1">
          {([
            { id: "ALL", label: "All" },
            { id: "TO_COOK", label: "To Cook" },
            { id: "PREPARING", label: "Preparing" },
            { id: "COMPLETED", label: "Completed" }
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-full border text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-[#C86A50] text-white border-[#C86A50] shadow-sm"
                  : "bg-[#FAF8F5] text-[#8e827b] border-[#E6E1DA] hover:border-[#C86A50]/50"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === tab.id ? "bg-white/20 text-white" : "bg-[#EFECE7] text-[#2C2623]"
              }`}>
                {tabCounts[tab.id]}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Pagination Control */}
        <div className="flex items-center justify-between md:justify-end gap-4">
          {/* Search bar */}
          <div className="relative w-60">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8e827b]" size={15} />
            <input 
              type="text" 
              placeholder="Search ticket or product..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full bg-[#FAF8F5] border border-[#E6E1DA] rounded-full py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-[#C86A50] transition-all"
            />
          </div>

          {/* Pagination control "1-3 < >" */}
          <div className="flex items-center gap-2.5 bg-[#FAF8F5] border border-[#EFECE7] px-3.5 py-1.5 rounded-2xl">
            <span className="text-xs font-bold text-[#8e827b] min-w-[55px] text-center">
              {startIndex}-{endIndex} of {totalFilteredCount}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-1 hover:bg-[#EFECE7] disabled:opacity-40 disabled:hover:bg-transparent rounded-lg transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={endIndex >= totalFilteredCount}
                className="p-1 hover:bg-[#EFECE7] disabled:opacity-40 disabled:hover:bg-transparent rounded-lg transition-colors cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MAIN WORKSPACE WRAPPER */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar Filters (fixed width: w-64) */}
        <aside className="w-64 bg-white border-r border-[#EFECE7] flex flex-col shrink-0">
          
          {/* Sidebar header with "Clear Filter" */}
          <div className="p-4 border-b border-[#EFECE7] flex justify-between items-center bg-[#FAF8F5]/50">
            <span className="font-extrabold text-sm text-[#2C2623] tracking-tight uppercase">Filters</span>
            {(selectedProducts.length > 0 || selectedCategories.length > 0 || searchQuery.trim()) && (
              <button 
                onClick={handleClearFilters}
                className="text-xs font-black text-[#C86A50] hover:text-[#b3563d] cursor-pointer hover:underline"
              >
                Clear Filter
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            
            {/* Products Multiselect */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-[#8e827b] uppercase tracking-wider">Product</h3>
              <div className="space-y-2.5">
                {FILTER_PRODUCTS.map(product => {
                  const isChecked = selectedProducts.includes(product);
                  return (
                    <button
                      key={product}
                      onClick={() => handleToggleProductFilter(product)}
                      className="flex items-center gap-3 w-full text-left text-xs font-bold text-[#2C2623] hover:text-[#C86A50] transition-colors group cursor-pointer"
                    >
                      <span className={`shrink-0 transition-colors ${isChecked ? 'text-[#C86A50]' : 'text-[#8e827b]'}`}>
                        {isChecked ? <CheckSquare size={16} /> : <Square size={16} />}
                      </span>
                      <span className="flex-1">{product}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Categories Multiselect */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-[#8e827b] uppercase tracking-wider">Category</h3>
              <div className="space-y-2.5">
                {FILTER_CATEGORIES.map(category => {
                  const isChecked = selectedCategories.includes(category);
                  return (
                    <button
                      key={category}
                      onClick={() => handleToggleCategoryFilter(category)}
                      className="flex items-center gap-3 w-full text-left text-xs font-bold text-[#2C2623] hover:text-[#C86A50] transition-colors group cursor-pointer"
                    >
                      <span className={`shrink-0 transition-colors ${isChecked ? 'text-[#C86A50]' : 'text-[#8e827b]'}`}>
                        {isChecked ? <CheckSquare size={16} /> : <Square size={16} />}
                      </span>
                      <span className="flex-1">{category}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            
          </div>
        </aside>

        {/* Main Area: Horizontal scrolling ticket cards */}
        <main className="flex-1 p-6 overflow-hidden flex flex-col justify-between">
          
          {/* Scrolling Area */}
          <div className="flex-1 overflow-x-auto overflow-y-hidden flex items-stretch gap-6 pb-4">
            
            {paginatedTickets.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-[#8e827b] py-16">
                <span className="text-5xl mb-3">🍳</span>
                <p className="text-sm font-extrabold">No active kitchen tickets found</p>
                <p className="text-xs text-[#8e827b] mt-1">Try clearing filters or search query.</p>
              </div>
            ) : (
              paginatedTickets.map(ticket => {
                
                // Color mapping for ticket status border/badges
                const statusStyles = {
                  TO_COOK: { border: "border-l-4 border-l-red-500", text: "text-red-600 bg-red-50 border-red-100", label: "To Cook" },
                  PREPARING: { border: "border-l-4 border-l-amber-500", text: "text-amber-600 bg-amber-50 border-amber-100", label: "Preparing" },
                  COMPLETED: { border: "border-l-4 border-l-green-500", text: "text-green-600 bg-green-50 border-green-100", label: "Completed" }
                }[ticket.status];

                // Calculate time elapsed
                const elapsedMinutes = Math.floor(
                  (Date.now() - new Date(ticket.createdAt).getTime()) / (1000 * 60)
                );

                return (
                  <div 
                    key={ticket.id} 
                    className={`w-80 bg-white rounded-2xl border border-[#EFECE7] ${statusStyles.border} shadow-sm flex flex-col justify-between overflow-hidden shrink-0 hover:shadow-md transition-all duration-200 animate-in fade-in duration-300`}
                  >
                    {/* Header */}
                    <div className="p-4 border-b border-[#EFECE7] bg-[#FAF8F5]/50 flex justify-between items-center">
                      <div>
                        <h3 className="font-black text-[#2C2623] text-lg">
                          #{ticket.orderNumber}
                        </h3>
                        <div className="flex items-center gap-1 text-[10px] text-[#8e827b] font-bold mt-0.5">
                          <Clock size={11} />
                          <span suppressHydrationWarning>{formatTime(ticket.createdAt)} ({elapsedMinutes}m ago)</span>
                        </div>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${statusStyles.text}`}>
                        {statusStyles.label}
                      </span>
                    </div>

                    {/* Items Checklist List */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-2.5">
                      {ticket.items.map(item => (
                        <div 
                          key={item.id}
                          onClick={() => handleToggleItemCompleted(ticket.id, item.id)}
                          className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-[#FAF8F5] transition-colors cursor-pointer group"
                        >
                          <span className={`mt-0.5 shrink-0 transition-colors ${item.completed ? 'text-green-500' : 'text-[#8e827b] group-hover:text-[#C86A50]'}`}>
                            {item.completed ? <CheckCircle2 size={16} /> : <CircleIcon size={16} />}
                          </span>
                          <div className="flex-1 flex justify-between items-baseline gap-2">
                            <span className={`text-xs font-bold leading-tight ${item.completed ? 'text-[#8e827b] line-through decoration-2' : 'text-[#2C2623]'}`}>
                              {item.name}
                            </span>
                            <span className={`text-xs font-black shrink-0 ${item.completed ? 'text-[#8e827b]' : 'text-[#C86A50]'}`}>
                              x{item.qty}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Bottom Action Footer (Advance Ticket State) */}
                    <div className="p-4 bg-[#FAF8F5] border-t border-[#EFECE7]">
                      {ticket.status === "COMPLETED" ? (
                        <div className="w-full text-center text-xs font-bold text-green-600 flex items-center justify-center gap-1.5 py-2">
                          <CheckCircle2 size={14} /> Completed
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAdvanceTicketStatus(ticket.id)}
                          className="w-full bg-[#C86A50] hover:bg-[#b3563d] text-white font-extrabold py-2.5 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                        >
                          {ticket.status === "TO_COOK" ? "Start Preparing" : "Finish Ticket"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}

          </div>

          {/* Real-time Indicator Footer */}
          <div className="h-6 mt-2 flex justify-between items-center text-[10px] font-bold text-[#8e827b]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span>KDS Socket Sync Active</span>
            </div>
            <span>Double click or click items to complete them. Advance status with card buttons.</span>
          </div>

        </main>

      </div>
    </div>
  );
}

// Simple circle helper for checklist
function CircleIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-60">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}
