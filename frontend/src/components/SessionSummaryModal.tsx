import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface SessionSummaryModalProps {
  onClose: () => void;
}

export default function SessionSummaryModal({ onClose }: SessionSummaryModalProps) {
  const { logout } = useAuth();
  const router = useRouter();

  const handleConfirmLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-cafe-card w-[400px] max-w-[90vw] rounded-2xl shadow-2xl border border-gray-700 overflow-hidden scale-in-center">
        <div className="p-6 border-b border-gray-700 bg-gray-800/50">
          <h2 className="text-xl font-bold text-white text-center">Session Summary</h2>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
            <span className="text-gray-400">Total Orders</span>
            <span className="font-bold text-lg text-white">42</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
            <span className="text-gray-400">Total Revenue</span>
            <span className="font-bold text-lg text-cafe-primary">₹14,500</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-400">Closing Amount</span>
            <span className="font-bold text-lg text-cafe-secondary">₹14,500</span>
          </div>
          
          <p className="text-sm text-gray-500 text-center mt-4 pt-2">
            Are you sure you want to close this session and log out?
          </p>
        </div>

        <div className="p-4 bg-gray-900/50 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-600 text-gray-300 font-semibold hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirmLogout}
            className="flex-1 py-3 rounded-xl bg-cafe-danger text-white font-bold hover:bg-red-600 shadow-lg shadow-red-900/20 transition-all"
          >
            Confirm & Logout
          </button>
        </div>
      </div>
    </div>
  );
}
