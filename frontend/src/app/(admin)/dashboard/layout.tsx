"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Package, 
  Tags, 
  CreditCard, 
  Ticket, 
  Calendar, 
  Users, 
  MonitorPlay, 
  BarChart3, 
  LogOut,
  Search,
  Bell,
  UserCircle,
  LayoutGrid
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { name: "Products", href: "/dashboard/products", icon: Package },
    { name: "Categories", href: "/dashboard/categories", icon: Tags },
    { name: "Floor Plan", href: "/dashboard/floors", icon: LayoutGrid },
    { name: "Payment Methods", href: "/dashboard/payments", icon: CreditCard },
    { name: "Coupons & Promos", href: "/dashboard/promotions", icon: Ticket },
    { name: "Booking", href: "/dashboard/booking", icon: Calendar },
    { name: "Users & Employees", href: "/dashboard/users", icon: Users },
    { name: "KDS", href: "/kitchen", icon: MonitorPlay },
    { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen flex bg-[#faf8f5] text-[#2c2623]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#efece7] flex flex-col z-10 relative">
        <div className="h-16 flex items-center px-6 border-b border-[#efece7]">
          <div className="w-8 h-8 bg-gradient-to-tr from-[#c86a50] to-[#b3563d] rounded-lg text-white flex items-center justify-center font-bold mr-3 shadow-sm">
            O
          </div>
          <span className="font-extrabold text-lg text-[#2c2623] tracking-tight">Cafe Admin</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 organic-scrollbar">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive 
                        ? "bg-[#c86a50]/8 text-[#c86a50]" 
                        : "text-[#8e827b] hover:bg-[#faf8f5] hover:text-[#2c2623]"
                    }`}
                  >
                    <item.icon size={18} className={isActive ? "text-[#c86a50]" : "text-[#8e827b]"} />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-[#efece7]">
          <Link
            href="/session"
            className="flex items-center gap-3 px-3.5 py-2.5 text-[#d3524b] hover:bg-[#d3524b]/5 rounded-xl transition-colors font-bold text-xs"
          >
            <LogOut size={18} />
            Exit Dashboard
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-[#efece7] flex items-center justify-between px-8 z-0 relative">
          <div className="max-w-md w-full relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8e827b]" size={16} />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full bg-[#faf8f5] border border-[#e6e1da] rounded-full py-1.5 pl-10 pr-4 text-xs focus:outline-none focus:border-[#c86a50] focus:ring-1 focus:ring-[#c86a50]/20 text-[#2c2623] placeholder-[#a09690]"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-[#8e827b] hover:text-[#2c2623] transition-colors cursor-pointer">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#d3524b] rounded-full border border-white"></span>
            </button>
            <div className="w-px h-6 bg-[#efece7]"></div>
            <div className="flex items-center gap-2.5 cursor-pointer">
              <div className="text-right hidden md:block">
                <p className="text-xs font-bold text-[#2c2623] leading-tight">Admin User</p>
                <p className="text-[10px] text-[#8e827b] font-medium">Super Admin</p>
              </div>
              <UserCircle size={32} className="text-[#8e827b]" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#faf8f5] organic-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
