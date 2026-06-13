"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ShoppingCart, List, PlusSquare, LayoutGrid, User, Menu, LogOut, Package, Tags, CreditCard, Gift, Users, Monitor, BarChart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePOSStore } from "@/store/usePOSStore";
import PrivateRoute from "./PrivateRoute";
import TableSelectionModal from "./TableSelectionModal";

export default function POSLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { selectedTable, setTableModalOpen } = usePOSStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const floorName = selectedTable?.floorName || "Select";
  const tableNumber = selectedTable?.tableNumber || "Table";

  return (
    <PrivateRoute>
      <div className="flex flex-col min-h-screen bg-cafe-bg text-cafe-text relative">
        <TableSelectionModal />
        
        {/* Top Navbar */}
        <header className="h-16 bg-cafe-card border-b border-gray-700 flex items-center justify-between px-4 sticky top-0 z-40 shadow-md">
          {/* Logo */}
          <Link href="/pos" className="flex items-center gap-2 font-bold text-xl text-cafe-primary shrink-0 mr-4">
            <span className="hidden sm:inline">CafePOS</span>
            <span className="sm:hidden">CP</span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-md relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1e1e1e] border border-gray-600 rounded-full py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-cafe-primary transition-all text-cafe-text"
            />
          </div>

          {/* Nav Icons */}
          <div className="flex items-center gap-2 sm:gap-4 ml-auto">
            <Link href="/pos" className="p-2 hover:bg-gray-700 rounded-lg transition-colors flex flex-col items-center group">
              <ShoppingCart size={20} className="group-hover:text-cafe-primary transition-colors" />
              <span className="text-[10px] hidden lg:block mt-0.5 text-gray-300">POS</span>
            </Link>
            
            <Link href="/orders" className="p-2 hover:bg-gray-700 rounded-lg transition-colors flex flex-col items-center group">
              <List size={20} className="group-hover:text-cafe-primary transition-colors" />
              <span className="text-[10px] hidden lg:block mt-0.5 text-gray-300">Orders</span>
            </Link>

            <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors flex flex-col items-center group">
              <PlusSquare size={20} className="group-hover:text-cafe-primary transition-colors" />
              <span className="text-[10px] hidden lg:block mt-0.5 text-gray-300">New</span>
            </button>

            {/* Table View Indicator */}
            <button 
              onClick={() => setTableModalOpen(true)}
              className="hidden sm:flex items-center gap-2 bg-[#1e1e1e] px-3 py-1.5 rounded-lg border border-gray-600 hover:border-cafe-primary transition-colors"
            >
              <LayoutGrid size={16} className="text-cafe-primary" />
              <span className="text-xs font-medium text-gray-200">
                {selectedTable ? `${floorName} - T${tableNumber}` : "Select Table"}
              </span>
            </button>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-cafe-primary flex items-center justify-center font-bold text-sm select-none text-white">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>

            {/* Hamburger Menu */}
            <div className="relative">
              <button 
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-200"
              >
                <Menu size={24} />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-56 bg-cafe-card border border-gray-700 rounded-xl shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-2">
                    <Link href="/backend/products" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-700 transition-colors text-gray-200">
                      <Package size={16} className="text-gray-400" /> <span>Products</span>
                    </Link>
                    <Link href="/backend/categories" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-700 transition-colors text-gray-200">
                      <Tags size={16} className="text-gray-400" /> <span>Category</span>
                    </Link>
                    <Link href="/backend/payment-methods" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-700 transition-colors text-gray-200">
                      <CreditCard size={16} className="text-gray-400" /> <span>Payment Method</span>
                    </Link>
                    <Link href="/backend/promotions" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-700 transition-colors text-gray-200">
                      <Gift size={16} className="text-gray-400" /> <span>Coupon & Promo</span>
                    </Link>
                    <Link href="/backend/users" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-700 transition-colors text-gray-200">
                      <Users size={16} className="text-gray-400" /> <span>User/Employee</span>
                    </Link>
                    <Link href="/kds" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-700 transition-colors text-gray-200">
                      <Monitor size={16} className="text-gray-400" /> <span>KDS</span>
                    </Link>
                    <Link href="/reports" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-700 transition-colors text-gray-200">
                      <BarChart size={16} className="text-gray-400" /> <span>Reports</span>
                    </Link>
                    <div className="h-px bg-gray-700 my-1"></div>
                    <button onClick={() => { logout(); setMenuOpen(false); }} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-700 transition-colors w-full text-left text-cafe-danger font-medium">
                      <LogOut size={16} /> <span>Log-Out</span>
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
      </div>
    </PrivateRoute>
  );
}
