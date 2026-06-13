"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, UserCircle } from "lucide-react";

export default function SessionLandingPage() {
  const router = useRouter();

  const handleOpenSession = () => {
    // In a real app, this would make an API call to open the session
    router.push("/terminal");
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#2c2623] flex flex-col relative overflow-hidden">
      {/* Background glow graphics */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#c86a50]/5 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#d99c4c]/5 blur-[130px] pointer-events-none" />

      {/* Top Header */}
      <header className="bg-white/80 backdrop-blur-md px-6 py-4 flex justify-between items-center border-b border-[#efece7] relative z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-[#c86a50] to-[#b3563d] rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-md">
            O
          </div>
          <span className="font-extrabold text-xl text-[#2c2623] tracking-tight">Odoo Cafe</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-bold text-[#2c2623] leading-tight text-sm">Admin User</p>
              <p className="text-xs text-[#8e827b] font-medium">Administrator</p>
            </div>
            <UserCircle className="w-10 h-10 text-[#8e827b]" />
          </div>
          <div className="w-px h-8 bg-[#efece7]"></div>
          <Link 
            href="/dashboard"
            className="text-[#8e827b] hover:text-[#2c2623] transition-colors"
            title="Go to Backend Dashboard"
          >
            <Menu className="w-7 h-7" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="bg-white rounded-[2rem] border border-[#efece7] shadow-xl shadow-[#e0dbd3]/20 p-10 max-w-lg w-full text-center relative overflow-hidden animate-in zoom-in-95 duration-500 before:absolute before:inset-2 before:border before:border-[#fbfaf8] before:rounded-[1.8rem] before:pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#c86a50] to-[#d99c4c]" />
          <div className="w-20 h-20 bg-[#c86a50]/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#efece7]">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-[#c86a50] animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h2 className="text-3xl font-extrabold text-[#2c2623] mb-2 tracking-tight">Ready to start?</h2>
          <p className="text-[#8e827b] text-sm mb-6 font-medium">Open a new billing session to begin taking orders.</p>
          
          <div className="bg-[#faf8f5] rounded-2xl p-6 mb-8 mt-6 text-left border border-[#efece7]">
            <div className="mb-4">
              <p className="text-xs text-[#8e827b] font-bold uppercase tracking-wider mb-1">Last Open Session</p>
              <p className="font-semibold text-[#2c2623]">Oct 24, 2026, 08:30 AM</p>
            </div>
            <div>
              <p className="text-xs text-[#8e827b] font-bold uppercase tracking-wider mb-1">Last Closing Sale Amount</p>
              <p className="font-extrabold text-2xl text-[#c86a50]">₹12,450.00</p>
            </div>
          </div>

          <button 
            onClick={handleOpenSession}
            className="w-full btn-terracotta text-white font-bold text-lg py-4 rounded-2xl cursor-pointer shadow-md"
          >
            Open Session
          </button>
        </div>
      </main>
    </div>
  );
}
