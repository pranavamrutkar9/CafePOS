"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ShoppingCart, List, PlusSquare, LayoutGrid, User, Menu, LogOut, Package, Tags, CreditCard, Gift, Users, Monitor, BarChart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePOSStore } from "@/store/usePOSStore";
import PrivateRoute from "./PrivateRoute";
import TableSelectionModal from "./TableSelectionModal";
import SessionSummaryModal from "./SessionSummaryModal";

export default function POSLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { selectedTable, setTableModalOpen } = usePOSStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSessionModal, setShowSessionModal] = useState(false);

  const floorName = selectedTable?.floorName || "Select";
  const tableNumber = selectedTable?.tableNumber || "Table";

  return (
    <PrivateRoute>
      <div className="flex flex-col min-h-screen bg-cafe-bg text-cafe-text relative">
        <TableSelectionModal />
        
        {/* Top Navbar */}
        <header className="h-16 bg-white/95 backdrop-blur-md border-b border-[#efece7] flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm">
          {/* Logo */}
          <Link href="/pos" className="flex items-center gap-2.5 font-extrabold text-2xl text-[#2c2623] shrink-0 mr-4 tracking-tight">
            <span className="w-8 h-8 bg-gradient-to-tr from-[#c86a50] to-[#b3563d] rounded-lg text-white flex items-center justify-center font-black text-sm shadow-sm shadow-[#c86a50]/20">C</span>
            <span className="hidden sm:inline">Cafe<span className="text-[#c86a50]">POS</span></span>
            <span className="sm:hidden text-[#c86a50]">P</span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-md relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8e827b]" size={16} />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#faf8f5] border border-[#e6e1da] rounded-full py-1.5 pl-10 pr-4 text-xs focus:outline-none focus:border-[#c86a50] focus:ring-1 focus:ring-[#c86a50]/20 transition-all text-[#2c2623] placeholder-[#a09690]"
            />
          </div>

          {/* Nav Icons */}
          <div className="flex items-center gap-3 sm:gap-4 ml-auto">
            <Link href="/pos" className="p-2.5 text-[#8e827b] hover:text-[#2c2623] hover:bg-[#faf8f5] rounded-xl transition-all flex flex-col items-center group relative cursor-pointer">
              <ShoppingCart size={18} className="group-hover:text-[#c86a50] transition-colors" />
              <span className="text-[10px] hidden lg:block mt-1 font-semibold">POS</span>
            </Link>
            
            <Link href="/orders" className="p-2.5 text-[#8e827b] hover:text-[#2c2623] hover:bg-[#faf8f5] rounded-xl transition-all flex flex-col items-center group relative cursor-pointer">
              <List size={18} className="group-hover:text-[#c86a50] transition-colors" />
              <span className="text-[10px] hidden lg:block mt-1 font-semibold">Orders</span>
            </Link>

            <button className="p-2.5 text-[#8e827b] hover:text-[#2c2623] hover:bg-[#faf8f5] rounded-xl transition-all flex flex-col items-center group relative cursor-pointer">
              <PlusSquare size={18} className="group-hover:text-[#c86a50] transition-colors" />
              <span className="text-[10px] hidden lg:block mt-1 font-semibold">New</span>
            </button>

            {/* Table View Indicator */}
            <button 
              onClick={() => setTableModalOpen(true)}
              className="hidden sm:flex items-center gap-2 bg-[#faf8f5] hover:bg-[#efece7] px-3.5 py-1.5 rounded-xl border border-[#efece7] hover:border-[#c86a50]/50 transition-all cursor-pointer shadow-sm"
            >
              <LayoutGrid size={14} className="text-[#c86a50] animate-pulse" />
              <span className="text-xs font-semibold text-[#2c2623]">
                {selectedTable ? `${floorName} - T${tableNumber}` : "Select Table"}
              </span>
            </button>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#c86a50] to-[#b3563d] flex items-center justify-center font-bold text-sm select-none text-white shadow-sm shadow-[#c86a50]/20">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>

            {/* Hamburger Menu */}
            <div className="relative">
              <button 
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2.5 text-[#8e827b] hover:text-[#2c2623] hover:bg-[#faf8f5] rounded-xl transition-all cursor-pointer"
              >
                <Menu size={20} />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)}></div>
                  <div className="absolute right-0 mt-3 w-56 bg-white border border-[#efece7] rounded-2xl shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <Link href="/backend/products" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#2c2623] hover:bg-[#faf8f5] transition-all">
                      <Package size={15} className="text-[#8e827b]" /> <span>Products</span>
                    </Link>
                    <Link href="/backend/categories" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#2c2623] hover:bg-[#faf8f5] transition-all">
                      <Tags size={15} className="text-[#8e827b]" /> <span>Category</span>
                    </Link>
                    <Link href="/backend/payment-methods" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#2c2623] hover:bg-[#faf8f5] transition-all">
                      <CreditCard size={15} className="text-[#8e827b]" /> <span>Payment Method</span>
                    </Link>
                    <Link href="/backend/promotions" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#2c2623] hover:bg-[#faf8f5] transition-all">
                      <Gift size={15} className="text-[#8e827b]" /> <span>Coupon & Promo</span>
                    </Link>
                    <Link href="/backend/users" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#2c2623] hover:bg-[#faf8f5] transition-all">
                      <Users size={15} className="text-[#8e827b]" /> <span>User/Employee</span>
                    </Link>
                    <Link href="/kds" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#2c2623] hover:bg-[#faf8f5] transition-all">
                      <Monitor size={15} className="text-[#8e827b]" /> <span>KDS</span>
                    </Link>
                    <Link href="/reports" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#2c2623] hover:bg-[#faf8f5] transition-all">
                      <BarChart size={15} className="text-[#8e827b]" /> <span>Reports</span>
                    </Link>
                    <div className="h-px bg-[#efece7] my-1.5"></div>
                    <button onClick={() => { setShowSessionModal(true); setMenuOpen(false); }} className="flex items-center gap-3 px-4 py-2.5 text-sm w-full text-left text-[#c86a50] font-bold hover:bg-[#c86a50]/5 transition-all cursor-pointer">
                      <LogOut size={15} /> <span>Log-Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto relative p-4">
          {children}
        </main>
        
        {/* Session Modal */}
        {showSessionModal && <SessionSummaryModal onClose={() => setShowSessionModal(false)} />}
      </div>
    </PrivateRoute>
  );
}
