"use client";

import React, { useState, useEffect } from "react";
import api from "@/api/axios";
import toast from "react-hot-toast";
import { Calendar, Plus, X, User, LayoutGrid, Clock, ClipboardList } from "lucide-react";

interface Booking {
  id: string;
  customerId: string | null;
  customer?: { id: string; name: string; email: string; phone: string } | null;
  tableId: string | null;
  table?: { id: string; number: string; seats: number } | null;
  datetime: string;
  status: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedTableId, setSelectedTableId] = useState("");
  const [datetime, setDatetime] = useState("");
  const [status, setStatus] = useState("PENDING");
  const [submitting, setSubmitting] = useState(false);

  const fetchBookings = async () => {
    try {
      const res = await api.get("/bookings");
      setBookings(res.data || []);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      toast.error("Failed to load bookings.");
    }
  };

  const fetchFiltersData = async () => {
    try {
      // Fetch customers
      const custRes = await api.get("/customers");
      setCustomers(custRes.data?.data || custRes.data || []);

      // Fetch floors & tables, then flatten tables
      const floorsRes = await api.get("/floors-tables/floors");
      const floors = floorsRes.data || [];
      const flatTables = floors.flatMap((f: any) => f.tables || []);
      setTables(flatTables);
    } catch (err) {
      console.error("Failed to fetch select dropdown values:", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchBookings(), fetchFiltersData()]);
      setLoading(false);
    };
    init();
  }, []);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!datetime) {
      toast.error("Booking date and time is required.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/bookings", {
        customerId: selectedCustomerId || null,
        tableId: selectedTableId || null,
        datetime,
        status
      });
      toast.success("Booking created successfully!");
      setModalOpen(false);
      // Reset form
      setSelectedCustomerId("");
      setSelectedTableId("");
      setDatetime("");
      setStatus("PENDING");
      fetchBookings();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create booking.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#2C2623]">Reservations & Bookings</h1>
          <p className="text-xs text-[#8E827B]">Manage restaurant table reservations and customer bookings</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#C86A50] hover:bg-[#b3563d] text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          <Plus size={16} />
          New Reservation
        </button>
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#C86A50]/20 border-t-[#C86A50] animate-spin" />
          <p className="text-sm text-[#8E827B]">Loading bookings list...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#EFECE7] overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-[#8E827B] uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Table Assigned</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFECE7] text-[#2C2623]">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-[#FAF8F5]/50 transition-colors">
                  <td className="px-6 py-4 font-semibold flex items-center gap-2">
                    <Calendar size={14} className="text-[#C86A50]" />
                    {new Date(booking.datetime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {booking.customer ? (
                      <div>
                        <p className="font-bold">{booking.customer.name}</p>
                        <p className="text-[10px] text-[#8E827B]">{booking.customer.phone || booking.customer.email || 'No contact details'}</p>
                      </div>
                    ) : (
                      <span className="text-[#8E827B] italic">Guest Walk-in</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-bold text-[#C86A50]">
                    {booking.table ? `Table ${booking.table.number} (${booking.table.seats} seats)` : 'Unassigned'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      booking.status === 'CONFIRMED' ? 'bg-green-50 text-green-700 border border-green-100' :
                      booking.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border border-red-100' :
                      'bg-amber-50 text-amber-700 border border-amber-100'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[#8E827B]">
                    <ClipboardList size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="font-medium text-sm">No reservations found</p>
                    <p className="text-[10px]">Create a new reservation to get started.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Creation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-[#EFECE7] shadow-xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 text-[#8E827B] hover:text-[#2C2623] hover:bg-[#FAF8F5] rounded-lg transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-[#2C2623] mb-1">Create Reservation</h3>
            <p className="text-xs text-[#8E827B] mb-6">Schedule a new table booking for a customer</p>

            <form onSubmit={handleCreateBooking} className="space-y-4">
              {/* Customer Selection */}
              <div>
                <label className="block text-xs font-bold text-[#8E827B] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <User size={13} /> Customer
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E6E1DA] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C86A50] focus:ring-1 focus:ring-[#C86A50]/20 text-[#2C2623]"
                >
                  <option value="">Guest Walk-in</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.phone || c.email})</option>
                  ))}
                </select>
              </div>

              {/* Table Selection */}
              <div>
                <label className="block text-xs font-bold text-[#8E827B] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <LayoutGrid size={13} /> Assign Table
                </label>
                <select
                  value={selectedTableId}
                  onChange={(e) => setSelectedTableId(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E6E1DA] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C86A50] focus:ring-1 focus:ring-[#C86A50]/20 text-[#2C2623]"
                >
                  <option value="">Select Table...</option>
                  {tables.map((t) => (
                    <option key={t.id} value={t.id}>Table {t.number} ({t.seats} seats)</option>
                  ))}
                </select>
              </div>

              {/* Datetime Picker */}
              <div>
                <label className="block text-xs font-bold text-[#8E827B] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Clock size={13} /> Reservation Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={datetime}
                  onChange={(e) => setDatetime(e.target.value)}
                  required
                  className="w-full bg-[#FAF8F5] border border-[#E6E1DA] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C86A50] focus:ring-1 focus:ring-[#C86A50]/20 text-[#2C2623]"
                />
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-xs font-bold text-[#8E827B] uppercase tracking-wider mb-1.5">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E6E1DA] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C86A50] focus:ring-1 focus:ring-[#C86A50]/20 text-[#2C2623]"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#EFECE7]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 border border-[#EFECE7] hover:bg-[#FAF8F5] text-[#8E827B] hover:text-[#2C2623] py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#C86A50] hover:bg-[#b3563d] disabled:bg-[#C86A50]/60 text-white py-2.5 rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer"
                >
                  {submitting ? "Booking..." : "Book Table"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
