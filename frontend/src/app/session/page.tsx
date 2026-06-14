"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/api/axios";
import toast from "react-hot-toast";
import { Menu, UserCircle, LogOut, Lock, Unlock, Landmark, CreditCard, DollarSign, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Session {
  id: string;
  openingCash: number;
  closingCash: number | null;
  status: "OPEN" | "CLOSED";
  openedAt: string;
  closedAt: string | null;
  employeeId: string;
}

export default function SessionLandingPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [lastSession, setLastSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals / Input States
  const [openModalOpen, setOpenModalOpen] = useState(false);
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  
  const [openingCashInput, setOpeningCashInput] = useState("500");
  const [closingCashInput, setClosingCashInput] = useState("");
  
  // Close stats
  const [closingStats, setClosingStats] = useState({ count: 0, revenue: 0 });
  const [actionsLoading, setActionsLoading] = useState(false);

  const fetchSessionData = async () => {
    try {
      const currentRes = await api.get("/sessions/current");
      setCurrentSession(currentRes.data);

      const lastRes = await api.get("/sessions/last");
      setLastSession(lastRes.data);
    } catch (err) {
      console.error("Failed to load session info:", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchSessionData();
      setLoading(false);
    };
    init();
  }, []);

  const handleOpenSession = async (e: React.FormEvent) => {
    e.preventDefault();
    const cash = parseFloat(openingCashInput);
    if (isNaN(cash) || cash < 0) {
      toast.error("Invalid opening cash amount.");
      return;
    }

    setActionsLoading(true);
    try {
      const res = await api.post("/sessions/open", {
        openingCash: cash,
        employeeId: user?.id
      });
      toast.success("Billing session opened successfully!");
      setCurrentSession(res.data);
      setOpenModalOpen(false);
      router.push("/pos/tables");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to open session.");
    } finally {
      setActionsLoading(false);
    }
  };

  const handleOpenCloseModal = async () => {
    if (!currentSession) return;
    setActionsLoading(true);
    try {
      // Query paid orders for the active session to show close stats
      const res = await api.get("/orders", {
        params: {
          sessionId: currentSession.id,
          status: "PAID",
          limit: 10000 // Fetch all paid orders for the session — no artificial cap
        }
      });
      const data = res.data;
      const ordersList = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
      const sum = ordersList.reduce((acc: number, o: any) => acc + o.total, 0);

      setClosingStats({
        count: ordersList.length,
        revenue: sum
      });
      setClosingCashInput((currentSession.openingCash + sum).toString());
      setCloseModalOpen(true);
    } catch (err) {
      console.error("Failed to load session stats:", err);
      toast.error("Failed to compile closing session summary.");
    } finally {
      setActionsLoading(false);
    }
  };

  const handleCloseSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSession) return;

    const cash = parseFloat(closingCashInput);
    if (isNaN(cash) || cash < 0) {
      toast.error("Invalid closing cash amount.");
      return;
    }

    setActionsLoading(true);
    try {
      await api.post(`/sessions/${currentSession.id}/close`, {
        closingCash: cash
      });
      toast.success("Billing session closed successfully!");
      setCloseModalOpen(false);
      setCurrentSession(null);
      fetchSessionData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to close session.");
    } finally {
      setActionsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#C86A50]/20 border-t-[#C86A50] animate-spin" />
        <p className="text-sm text-[#8E827B]">Initializing billing session gate...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#2c2623] flex flex-col relative overflow-hidden">
      {/* Background glow graphics */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#c86a50]/5 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#d99c4c]/5 blur-[130px] pointer-events-none" />

      {/* Top Header */}
      <header className="bg-white/80 backdrop-blur-md px-6 py-4 flex justify-between items-center border-b border-[#efece7] relative z-10 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-[#c86a50] to-[#b3563d] rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-md">
            O
          </div>
          <span className="font-extrabold text-xl text-[#2c2623] tracking-tight">Odoo Cafe</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-bold text-[#2c2623] leading-tight text-sm">{user?.name || "Cashier Staff"}</p>
              <p className="text-xs text-[#8e827b] font-medium capitalize">{user?.role?.toLowerCase() || "Employee"}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#C86A50] to-[#b3563d] flex items-center justify-center font-bold text-sm text-white select-none shadow-inner">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
          </div>
          <div className="w-px h-8 bg-[#efece7]"></div>
          <button 
            onClick={() => { logout(); router.push("/login"); }}
            className="text-[#d3524b] hover:text-red-700 transition-colors p-2 hover:bg-red-50/50 rounded-lg flex items-center gap-1 text-xs font-bold cursor-pointer"
            title="Log Out"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="bg-white rounded-[2rem] border border-[#efece7] shadow-xl shadow-[#e0dbd3]/20 p-10 max-w-md w-full text-center relative overflow-hidden animate-in zoom-in-95 duration-500 before:absolute before:inset-2 before:border before:border-[#fbfaf8] before:rounded-[1.8rem] before:pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#c86a50] to-[#d99c4c]" />
          
          <div className="w-20 h-20 bg-[#c86a50]/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#efece7]">
            {currentSession ? (
              <Unlock className="w-9 h-9 text-[#557A61] animate-pulse" />
            ) : (
              <Lock className="w-9 h-9 text-[#C86A50]" />
            )}
          </div>
          
          <h2 className="text-3xl font-extrabold text-[#2c2623] mb-2 tracking-tight">
            {currentSession ? "Session is Active" : "Billing is Closed"}
          </h2>
          <p className="text-[#8e827b] text-sm mb-6 font-medium">
            {currentSession 
              ? "Your sales terminal is open. Go to tables plan to register orders." 
              : "Open a new billing session to begin taking orders."
            }
          </p>
          
          <div className="bg-[#faf8f5] rounded-2xl p-6 mb-8 mt-6 text-left border border-[#efece7] space-y-4">
            {currentSession ? (
              <>
                <div>
                  <p className="text-xs text-[#8e827b] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Clock size={13} /> Session Opened At
                  </p>
                  <p className="font-semibold text-[#2c2623]">
                    {new Date(currentSession.openedAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#8e827b] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Landmark size={13} /> Starting Float Cash
                  </p>
                  <p className="font-extrabold text-xl text-[#557A61]">₹{currentSession.openingCash.toFixed(2)}</p>
                </div>
              </>
            ) : lastSession ? (
              <>
                <div>
                  <p className="text-xs text-[#8e827b] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Clock size={13} /> Last Session Closed At
                  </p>
                  <p className="font-semibold text-[#2c2623]">
                    {new Date(lastSession.closedAt || "").toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#8e827b] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Landmark size={13} /> Reconciled Cash Drawer
                  </p>
                  <p className="font-extrabold text-xl text-[#C86A50]">₹{(lastSession.closingCash || 0).toFixed(2)}</p>
                </div>
              </>
            ) : (
              <div className="text-center py-4 text-xs font-bold text-[#8e827b] italic">
                No past session records found.
              </div>
            )}
          </div>

          <div className="flex gap-4">
            {currentSession ? (
              <>
                <Link
                  href="/pos/tables"
                  className="flex-1 bg-[#557A61] hover:bg-[#43614d] text-white font-bold py-3.5 rounded-2xl cursor-pointer text-center text-sm shadow-md transition-colors"
                >
                  POS Tables Plan
                </Link>
                <button 
                  onClick={handleOpenCloseModal}
                  disabled={actionsLoading}
                  className="flex-1 bg-red-50 hover:bg-red-100 border border-red-100 text-[#d3524b] font-bold py-3.5 rounded-2xl cursor-pointer text-sm transition-colors"
                >
                  Close Session
                </button>
              </>
            ) : (
              <button 
                onClick={() => setOpenModalOpen(true)}
                className="w-full bg-[#c86a50] hover:bg-[#b3563d] text-white font-bold text-lg py-4 rounded-2xl cursor-pointer shadow-md transition-colors"
              >
                Open New Session
              </button>
            )}
          </div>
        </div>
      </main>

      {/* 3. OPEN SESSION MODAL */}
      {openModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-[#efece7] shadow-xl w-full max-w-sm p-6 relative">
            <h3 className="text-lg font-bold text-[#2C2623] mb-1">Open Billing Session</h3>
            <p className="text-xs text-[#8E827B] mb-5">Set starting float cash register balance</p>

            <form onSubmit={handleOpenSession} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#8E827B] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <DollarSign size={13} /> Opening Cash Float (₹)
                </label>
                <input
                  type="number"
                  step="any"
                  value={openingCashInput}
                  onChange={(e) => setOpeningCashInput(e.target.value)}
                  required
                  placeholder="Enter starting cash..."
                  className="w-full bg-[#FAF8F5] border border-[#E6E1DA] rounded-xl px-3 py-2 text-sm font-bold text-[#2C2623] focus:outline-none focus:border-[#C86A50] focus:ring-1 focus:ring-[#C86A50]/20"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#EFECE7]">
                <button
                  type="button"
                  onClick={() => setOpenModalOpen(false)}
                  className="flex-1 border border-[#EFECE7] hover:bg-[#FAF8F5] text-[#8E827B] hover:text-[#2C2623] py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={actionsLoading}
                  className="flex-1 bg-[#C86A50] hover:bg-[#b3563d] disabled:bg-[#C86A50]/60 text-white py-2.5 rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer"
                >
                  {actionsLoading ? "Opening..." : "Confirm Open"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. CLOSE SESSION MODAL */}
      {closeModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-[#efece7] shadow-xl w-full max-w-sm p-6 relative">
            <h3 className="text-lg font-bold text-[#2C2623] mb-1">Close Billing Session</h3>
            <p className="text-xs text-[#8E827B] mb-5">Confirm aggregate sales and reconcile cash drawer</p>

            <form onSubmit={handleCloseSession} className="space-y-4">
              {/* Aggregates block */}
              <div className="bg-[#FAF8F5] border border-[#EFECE7] rounded-xl p-4 space-y-2 text-xs font-bold text-[#8E827B]">
                <div className="flex justify-between">
                  <span>Paid Orders Count:</span>
                  <span className="text-[#2C2623] font-extrabold">{closingStats.count}</span>
                </div>
                <div className="flex justify-between">
                  <span>Gross Session Revenue:</span>
                  <span className="text-[#557A61] font-black">₹{closingStats.revenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Starting Cash Float:</span>
                  <span className="text-[#2C2623]">₹{currentSession?.openingCash.toFixed(2)}</span>
                </div>
                <div className="h-px bg-[#EFECE7] my-2"></div>
                <div className="flex justify-between text-[#2C2623]">
                  <span>Expected Cash Drawer:</span>
                  <span className="font-extrabold">₹{((currentSession?.openingCash || 0) + closingStats.revenue).toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8E827B] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <DollarSign size={13} /> Final Reconciled Cash (₹)
                </label>
                <input
                  type="number"
                  step="any"
                  value={closingCashInput}
                  onChange={(e) => setClosingCashInput(e.target.value)}
                  required
                  placeholder="Enter final cash..."
                  className="w-full bg-[#FAF8F5] border border-[#E6E1DA] rounded-xl px-3 py-2 text-sm font-bold text-[#2C2623] focus:outline-none focus:border-[#C86A50] focus:ring-1 focus:ring-[#C86A50]/20"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#EFECE7]">
                <button
                  type="button"
                  onClick={() => setCloseModalOpen(false)}
                  className="flex-1 border border-[#EFECE7] hover:bg-[#FAF8F5] text-[#8E827B] hover:text-[#2C2623] py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionsLoading}
                  className="flex-1 bg-[#d3524b] hover:bg-red-700 disabled:bg-[#d3524b]/60 text-white py-2.5 rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer"
                >
                  {actionsLoading ? "Closing..." : "Reconcile & Close"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
