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
    <div className="min-h-screen flex bg-cafe-bg">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-sm flex flex-col z-10 relative">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <div className="w-8 h-8 bg-cafe-primary rounded text-white flex items-center justify-center font-bold mr-3">
            O
          </div>
          <span className="font-bold text-lg text-gray-900">Cafe Admin</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive 
                        ? "bg-orange-50 text-cafe-primary font-medium" 
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <item.icon size={20} className={isActive ? "text-cafe-primary" : "text-gray-400"} />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <Link
            href="/session"
            className="flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            Exit Dashboard
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white shadow-sm border-b border-gray-100 flex items-center justify-between px-8 z-0 relative">
          <div className="max-w-md w-full relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full bg-gray-50 border-none rounded-full py-2 pl-10 pr-4 focus:ring-2 focus:ring-cafe-primary outline-none transition-shadow"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-gray-500 hover:text-gray-700 transition-colors">
              <Bell size={24} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cafe-danger rounded-full border border-white"></span>
            </button>
            <div className="w-px h-6 bg-gray-200"></div>
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-gray-900 leading-tight">Admin User</p>
                <p className="text-xs text-gray-500">Super Admin</p>
              </div>
              <UserCircle size={36} className="text-gray-400" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
