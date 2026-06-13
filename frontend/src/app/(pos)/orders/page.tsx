"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/api/axios";
import { Search, ChevronLeft, ChevronRight, Clock, User, Coffee, Table } from "lucide-react";

interface Order {
  id: string;
  table?: { number: string } | null;
  customer?: { name: string } | null;
  employee?: { name: string } | null;
  status: string;
  total: number;
  createdAt: string;
}

export default function OrdersListPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 10;

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/orders", {
        params: {
          search: searchQuery.trim() || undefined,
          page,
          limit
        }
      });
      const data = res.data;
      if (data && Array.isArray(data.data)) {
        setOrders(data.data);
        setTotalCount(data.total || 0);
        setTotalPages(Math.ceil((data.total || 0) / limit) || 1);
      } else {
        setOrders(Array.isArray(data) ? data : []);
        setTotalCount(Array.isArray(data) ? data.length : 0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase bg-gray-100 text-gray-600 border border-gray-200 rounded-full">Draft</span>;
      case "ACTIVE":
        return <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase bg-amber-50 text-amber-700 border border-amber-200 rounded-full">In Progress</span>;
      case "PAID":
        return <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase bg-green-50 text-green-700 border border-green-200 rounded-full">Paid</span>;
      case "CANCELLED":
        return <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase bg-red-50 text-red-700 border border-red-200 rounded-full">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase bg-gray-50 text-gray-500 border border-gray-100 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2C2623] font-sans flex flex-col">
      {/* Topbar */}
      <header className="h-16 bg-white border-b border-[#EFECE7] flex items-center justify-between px-8 z-10 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/pos" className="w-10 h-10 bg-gradient-to-tr from-[#C86A50] to-[#b3563d] rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-md cursor-pointer">
            O
          </Link>
          <div>
            <span className="font-extrabold text-lg tracking-tight">Odoo Cafe</span>
            <span className="text-[10px] font-bold text-[#C86A50] border border-[#C86A50]/20 px-2 py-0.5 rounded-full uppercase ml-2.5 bg-[#C86A50]/5">Orders Hub</span>
          </div>
        </div>

        <Link
          href="/pos/tables"
          className="flex items-center gap-1.5 px-4 py-2 border border-[#EFECE7] hover:bg-[#FAF8F5] text-xs font-bold rounded-xl text-[#8E827B] hover:text-[#2C2623] transition-colors cursor-pointer"
        >
          ← Back to Tables
        </Link>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#2C2623] tracking-tight">Orders Registry</h1>
            <p className="text-xs text-[#8E827B] font-medium">Search, filter, edit, or view detailed checkout receipts</p>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex gap-2.5 max-w-sm w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E827B]" size={15} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ID, customer name..."
                className="w-full bg-white border border-[#E6E1DA] rounded-xl py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-[#C86A50] text-[#2C2623] placeholder-[#A09690] shadow-xs"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-[#C86A50] hover:bg-[#b3563d] text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>

        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#C86A50]/20 border-t-[#C86A50] animate-spin" />
            <p className="text-sm text-[#8E827B]">Brewing order records list...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#EFECE7] overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-[#8E827B] uppercase tracking-wider font-semibold border-b border-[#EFECE7]">
                <tr>
                  <th className="px-6 py-4.5">Date</th>
                  <th className="px-6 py-4.5">Order ID</th>
                  <th className="px-6 py-4.5">Customer</th>
                  <th className="px-6 py-4.5">Table</th>
                  <th className="px-6 py-4.5 text-right">Amount</th>
                  <th className="px-6 py-4.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFECE7] text-[#2C2623]">
                {orders.map((order) => (
                  <tr 
                    key={order.id} 
                    className={`hover:bg-[#FAF8F5]/50 transition-colors ${
                      order.status === "CANCELLED" ? "opacity-60 bg-red-50/20 line-through decoration-red-300" : ""
                    }`}
                  >
                    <td className="px-6 py-4 font-semibold text-[#8E827B] whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock size={13} />
                        {new Date(order.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link 
                        href={`/orders/${order.id}`}
                        className="font-bold text-[#C86A50] hover:text-[#b3563d] hover:underline hover:decoration-2 font-mono transition-colors"
                      >
                        #{order.id.split("-")[0].toUpperCase()}
                      </Link>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      <div className="flex items-center gap-1.5">
                        <User size={13} className="text-[#8E827B]" />
                        {order.customer ? order.customer.name : "Guest"}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-[#8E827B]">
                      {order.table ? (
                        <div className="flex items-center gap-1.5">
                          <Table size={13} />
                          <span>Table {order.table.number}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <Coffee size={13} />
                          <span>Walk-in</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-black text-sm text-[#2C2623]">
                      ₹{order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(order.status)}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-[#8E827B]">
                      <span className="text-4xl mb-2 block">📋</span>
                      <p className="font-extrabold text-sm">No orders matching search criteria</p>
                      <p className="text-[10px] mt-1">Try resetting search or placing a new order.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="bg-[#FAF8F5] px-6 py-4 border-t border-[#EFECE7] flex items-center justify-between text-xs text-[#8E827B]">
                <span>
                  Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> (Total: {totalCount} orders)
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 border border-[#EFECE7] rounded-xl hover:bg-white hover:text-[#2C2623] disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 border border-[#EFECE7] rounded-xl hover:bg-white hover:text-[#2C2623] disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
