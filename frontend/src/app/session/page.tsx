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
    <div className="min-h-screen bg-cafe-bg flex flex-col">
      {/* Top Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cafe-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">
            O
          </div>
          <span className="font-bold text-xl text-gray-900">Odoo Cafe</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-semibold text-gray-900 leading-tight">Admin User</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <UserCircle className="w-10 h-10 text-gray-400" />
          </div>
          <div className="w-px h-8 bg-gray-200"></div>
          <Link 
            href="/dashboard"
            className="text-gray-500 hover:text-cafe-primary transition-colors"
            title="Go to Backend Dashboard"
          >
            <Menu className="w-7 h-7" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-cafe-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Ready to start?</h2>
          
          <div className="bg-gray-50 rounded-xl p-6 mb-8 mt-6 text-left">
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-1">Last Open Session</p>
              <p className="font-medium text-gray-900">Oct 24, 2026, 08:30 AM</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Last Closing Sale Amount</p>
              <p className="font-bold text-xl text-gray-900">₹12,450.00</p>
            </div>
          </div>

          <button 
            onClick={handleOpenSession}
            className="w-full bg-cafe-primary hover:bg-cafe-primary-hover text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-orange-500/30 transition-transform active:scale-[0.98]"
          >
            Open Session
          </button>
        </div>
      </main>
    </div>
  );
}
