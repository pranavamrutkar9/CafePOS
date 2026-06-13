"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { 
  Package, 
  Tags, 
  CreditCard, 
  Gift, 
  Users, 
  Monitor, 
  BarChart, 
  Calendar,
  LayoutGrid,
  LogOut,
  User
} from "lucide-react";

export const MENU_ITEMS = [
  { name: "Products", href: "/dashboard/products", icon: Package },
  { name: "Category", href: "/dashboard/categories", icon: Tags },
  { name: "Floor Plan", href: "/dashboard/floors", icon: LayoutGrid },
  { name: "Payment method", href: "/dashboard/payments", icon: CreditCard },
  { name: "Coupon & Promotion", href: "/dashboard/promotions", icon: Gift },
  { name: "Booking", href: "/dashboard/booking", icon: Calendar },
  { name: "Customers", href: "/dashboard/customers", icon: User },
  { name: "User/Employee", href: "/dashboard/users", icon: Users },
  { name: "KDS", href: "/kds", icon: Monitor },
  { name: "Reports", href: "/dashboard/reports", icon: BarChart },
];

interface HamburgerMenuProps {
  onClose: () => void;
}

export function HamburgerMenu({ onClose }: HamburgerMenuProps) {
  const { logout } = useAuth();

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose}></div>
      <div className="absolute right-0 mt-3 w-56 bg-white border border-[#EFECE7] rounded-2xl shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
        <div className="px-4 py-2 text-xs font-bold text-[#8e827b] border-b border-[#EFECE7] mb-1">Navigation</div>
        {MENU_ITEMS.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#2C2623] hover:bg-[#FAF8F5] transition-all"
          >
            <item.icon size={15} className="text-[#8e827b]" />
            <span>{item.name}</span>
          </Link>
        ))}
        <div className="h-px bg-[#EFECE7] my-1.5"></div>
        <button
          onClick={() => {
            logout();
            onClose();
          }}
          className="flex items-center gap-3 px-4 py-2.5 text-sm w-full text-left text-[#C86A50] font-bold hover:bg-[#C86A50]/5 transition-all cursor-pointer"
        >
          <LogOut size={15} /> <span>Log-Out</span>
        </button>
      </div>
    </>
  );
}
