"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Menu, 
  Search, 
  UserCircle, 
  ShoppingBag, 
  ListOrdered, 
  Users, 
  LayoutGrid
} from "lucide-react";

export default function TerminalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { name: "POS Order", href: "/terminal", icon: ShoppingBag },
    { name: "Orders", href: "/terminal/orders", icon: ListOrdered },
    { name: "Customers", href: "/terminal/customers", icon: Users },
    { name: "Table View", href: "/terminal/tables", icon: LayoutGrid },
  ];

  return (
    <div className="h-screen flex flex-col bg-cafe-bg overflow-hidden">
      {/* Top Navigation Shell */}
      <header className="h-16 bg-white shadow-sm flex items-center px-4 shrink-0 z-20 relative">
        {/* Logo */}
        <div className="flex items-center gap-2 pr-6 border-r border-gray-100 h-full">
          <div className="w-8 h-8 bg-cafe-primary rounded text-white flex items-center justify-center font-bold text-lg">
            O
          </div>
          <span className="font-bold text-gray-900 hidden md:block">POS</span>
        </div>

        {/* Nav Tabs */}
        <div className="flex h-full px-2 gap-1 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2 px-4 h-full border-b-2 transition-colors whitespace-nowrap ${
                  isActive 
                    ? "border-cafe-primary text-cafe-primary font-semibold" 
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <item.icon size={18} className={isActive ? "text-cafe-primary" : "text-gray-400"} />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Center Search */}
        <div className="flex-1 px-6 min-w-0 max-w-xl mx-auto hidden lg:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full bg-gray-100 border-none rounded-full py-2 pl-10 pr-4 focus:ring-2 focus:ring-cafe-primary outline-none transition-shadow"
            />
          </div>
        </div>

        {/* Right Nav */}
        <div className="flex items-center gap-4 ml-auto pl-4 border-l border-gray-100 h-full">
          <div className="hidden sm:flex items-center gap-2 bg-orange-50 text-cafe-primary px-3 py-1.5 rounded-full font-semibold border border-orange-100">
            <div className="w-2 h-2 rounded-full bg-cafe-primary animate-pulse"></div>
            Table 4
          </div>
          
          <div className="flex items-center gap-2 pl-2">
            <UserCircle size={32} className="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
            <Link 
              href="/dashboard"
              className="p-2 text-gray-500 hover:text-cafe-primary hover:bg-gray-50 rounded-lg transition-colors"
              title="Backend Dashboard"
            >
              <Menu size={24} />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Terminal Viewport */}
      <main className="flex-1 overflow-hidden relative">
        {children}
      </main>
    </div>
  );
}
