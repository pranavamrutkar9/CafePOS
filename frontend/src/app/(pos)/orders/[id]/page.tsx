"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/api/axios";
import toast from "react-hot-toast";
import { ArrowLeft, Edit, Trash2, Printer, Clock, User, Coffee, Receipt, Tag } from "lucide-react";

interface OrderItem {
  id: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
  lineDiscount: number;
  discountLabel: string | null;
  product: { name: string };
}

interface Order {
  id: string;
  table?: { number: string } | null;
  customer?: { name: string; email?: string; phone?: string } | null;
  employee?: { name: string } | null;
  status: string;
  subtotal: number;
  tax: number;
  discount: number;
  discountLabel: string | null;
  total: number;
  paymentMethod: string | null;
  createdAt: string;
  items: OrderItem[];
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data);
    } catch (err) {
      console.error("Failed to fetch order:", err);
      toast.error("Failed to load order details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchOrderDetails();
  }, [id]);

  const handleCancelOrder = async () => {
    if (!confirm("Are you sure you want to cancel (delete) this draft order?")) return;

    try {
      toast.loading("Cancelling order...", { id: "cancel-order" });
      await api.put(`/orders/${id}`, {
        status: "CANCELLED"
      });
      toast.success("Order cancelled successfully!", { id: "cancel-order" });
      router.push("/orders");
    } catch (err) {
      toast.error("Failed to cancel order.", { id: "cancel-order" });
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#C86A50]/20 border-t-[#C86A50] animate-spin" />
        <p className="text-sm text-[#8E827B]">Brewing order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center text-[#8E827B]">
        <Receipt size={64} className="mb-4 opacity-50" />
        <h2 className="text-xl font-bold">Order not found</h2>
        <Link href="/orders" className="text-[#C86A50] hover:underline mt-4 font-bold">
          ← Back to Orders
        </Link>
      </div>
    );
  }

  const orderNumber = order.id.split("-")[0].toUpperCase();
  const formatStatus = (s: string) => {
    switch (s) {
      case "DRAFT": return "Draft";
      case "ACTIVE": return "In Progress";
      case "PAID": return "Paid";
      case "CANCELLED": return "Cancelled";
      default: return s;
    }
  };

  return (
    <>
      {/* Styles for printing only receipt block */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          body {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>

      {/* 1. REGULAR BROWSER DISPLAY PANEL (HIDDEN IN PRINT) */}
      <div className="min-h-screen bg-[#FAF8F5] text-[#2C2623] font-sans flex flex-col no-print">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-[#EFECE7] flex items-center justify-between px-8 z-10 shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <Link href="/pos" className="w-10 h-10 bg-gradient-to-tr from-[#C86A50] to-[#b3563d] rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-md cursor-pointer">
              O
            </Link>
            <span className="font-extrabold text-lg tracking-tight">Odoo Cafe</span>
          </div>

          <Link
            href="/orders"
            className="flex items-center gap-1.5 px-4 py-2 border border-[#EFECE7] hover:bg-[#FAF8F5] text-xs font-bold rounded-xl text-[#8E827B] hover:text-[#2C2623] transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to Registry
          </Link>
        </header>

        {/* Details Wrapper */}
        <main className="flex-1 max-w-4xl w-full mx-auto p-8 space-y-6">
          
          {/* Header Card */}
          <div className="bg-white rounded-2xl border border-[#EFECE7] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-3xl font-extrabold text-[#2C2623] tracking-tight">Order #{orderNumber}</h1>
                <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                  order.status === 'PAID' ? 'bg-green-50 text-green-700 border border-green-200' :
                  order.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border border-red-200' :
                  order.status === 'ACTIVE' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  'bg-gray-100 text-gray-700 border border-gray-200'
                }`}>
                  {formatStatus(order.status)}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#8E827B] font-bold">
                <span className="flex items-center gap-1"><Clock size={13} /> {new Date(order.createdAt).toLocaleString()}</span>
                <span className="flex items-center gap-1"><User size={13} /> Waiter: {order.employee?.name || "System"}</span>
                <span className="flex items-center gap-1">
                  {order.table ? <span className="text-[#C86A50]">Table {order.table.number}</span> : "Walk-in guest"}
                </span>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex gap-2.5">
              {(order.status === "DRAFT" || order.status === "ACTIVE") && (
                <button
                  onClick={() => router.push(`/pos?orderId=${order.id}`)}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-[#C86A50] hover:bg-[#b3563d] text-white font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  <Edit size={14} /> Resume Order
                </button>
              )}
              {order.status === "DRAFT" && (
                <button
                  onClick={handleCancelOrder}
                  className="flex items-center gap-1.5 px-4 py-2.5 border border-red-100 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  <Trash2 size={14} /> Cancel Order
                </button>
              )}
              {order.status === "PAID" && (
                <button
                  onClick={handlePrintReceipt}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-[#557A61] hover:bg-[#43614d] text-white font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  <Printer size={14} /> Print Receipt
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Products Table Card */}
            <div className="bg-white rounded-2xl border border-[#EFECE7] shadow-xs lg:col-span-2 overflow-hidden">
              <div className="p-5 border-b border-[#EFECE7] bg-[#FAF8F5]/50">
                <h3 className="font-extrabold text-sm text-[#2C2623]">Items Summary</h3>
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] text-[#8E827B] uppercase tracking-wider font-semibold border-b border-[#EFECE7]">
                  <tr>
                    <th className="px-5 py-3.5">Product</th>
                    <th className="px-5 py-3.5 text-center">Qty</th>
                    <th className="px-5 py-3.5 text-right">Price</th>
                    <th className="px-5 py-3.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFECE7] text-[#2C2623]">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-5 py-4 font-semibold">
                        <p>{item.product.name}</p>
                        {item.discountLabel && (
                          <div className="text-[10px] text-[#C86A50] font-black uppercase flex items-center gap-0.5 mt-1 bg-red-50/60 border border-red-100 px-2 py-0.5 rounded w-max">
                            <Tag size={9} />
                            {item.discountLabel}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center font-bold text-[#8E827B]">{item.qty}</td>
                      <td className="px-5 py-4 text-right">₹{item.unitPrice.toFixed(2)}</td>
                      <td className="px-5 py-4 text-right font-bold">₹{item.lineTotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-white rounded-2xl border border-[#EFECE7] p-6 shadow-xs space-y-5">
              <h3 className="font-extrabold text-sm text-[#2C2623] border-b border-[#EFECE7] pb-3">Recap Totals</h3>
              
              <div className="space-y-3 text-xs text-[#8E827B] font-bold">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-[#2C2623]">₹{order.subtotal.toFixed(2)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-[#C86A50]">
                    <span>Discount ({order.discountLabel || 'Promo'})</span>
                    <span>-₹{order.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax (GST 5%)</span>
                  <span className="text-[#2C2623]">₹{order.tax.toFixed(2)}</span>
                </div>
                <div className="h-px bg-[#EFECE7] my-3"></div>
                <div className="flex justify-between text-base font-black text-[#2C2623]">
                  <span>Total</span>
                  <span className="text-[#C86A50]">₹{order.total.toFixed(2)}</span>
                </div>
              </div>

              {order.status === "PAID" && (
                <div className="bg-[#FAF8F5] border border-[#EFECE7] p-4 rounded-xl text-[11px] font-bold text-[#8E827B] space-y-2">
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span className="text-[#2C2623] font-black uppercase">{order.paymentMethod || "CASH"}</span>
                  </div>
                  {order.customer && (
                    <div className="flex justify-between">
                      <span>Customer Email:</span>
                      <span className="text-[#2c2623] underline">{order.customer.email || "Guest"}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* 2. DEDICATED PRINT ONLY VIEW (TICKET SIZE ON PAPER) */}
      <div className="print-only hidden w-full p-6" style={{ fontFamily: "monospace" }}>
        <div style={{ maxWidth: "300px", margin: "0 auto", textAlign: "left", fontSize: "12px", lineHeight: "1.4", color: "black" }}>
          <h2 style={{ textAlign: "center", margin: "0 0 5px 0", fontSize: "16px", fontWeight: "bold" }}>Odoo Cafe</h2>
          <p style={{ textAlign: "center", margin: "0 0 10px 0", fontSize: "11px", borderBottom: "1px dashed black", paddingBottom: "10px" }}>
            Receipt #{orderNumber}
          </p>
          
          <div style={{ marginBottom: "10px", fontSize: "11px" }}>
            <div>Date: {new Date(order.createdAt).toLocaleString()}</div>
            <div>Table: {order.table ? `Table ${order.table.number}` : "Walk-in"}</div>
            <div>Cashier: {order.employee?.name || "Staff"}</div>
            {order.customer && <div>Customer: {order.customer.name}</div>}
          </div>

          <div style={{ borderBottom: "1px dashed black", marginBottom: "10px" }}></div>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", marginBottom: "10px" }}>
            <thead>
              <tr style={{ borderBottom: "1px dashed black", textAlign: "left" }}>
                <th style={{ paddingBottom: "5px" }}>Item</th>
                <th style={{ paddingBottom: "5px", textAlign: "center" }}>Qty</th>
                <th style={{ paddingBottom: "5px", textAlign: "right" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td style={{ padding: "4px 0" }}>
                    {item.product.name}
                    {item.discountLabel && (
                      <div style={{ fontSize: "9px", fontStyle: "italic" }}>
                        ({item.discountLabel})
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "4px 0", textAlign: "center" }}>{item.qty}</td>
                  <td style={{ padding: "4px 0", textAlign: "right" }}>₹{item.lineTotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ borderBottom: "1px dashed black", marginBottom: "10px" }}></div>

          <div style={{ textAlign: "right", fontSize: "11px" }}>
            <div>Subtotal: ₹{order.subtotal.toFixed(2)}</div>
            {order.discount > 0 && (
              <div>Discount ({order.discountLabel || 'Promo'}): -₹{order.discount.toFixed(2)}</div>
            )}
            <div>Tax (5%): ₹{order.tax.toFixed(2)}</div>
            <div style={{ fontSize: "13px", fontWeight: "bold", marginTop: "5px" }}>
              Total: ₹{order.total.toFixed(2)}
            </div>
            {order.paymentMethod && (
              <div style={{ fontSize: "11px", marginTop: "5px" }}>
                Paid via: <span style={{ fontWeight: "bold" }}>{order.paymentMethod}</span>
              </div>
            )}
          </div>

          <div style={{ borderBottom: "1px dashed black", marginTop: "15px", marginBottom: "15px" }}></div>

          <p style={{ textAlign: "center", fontSize: "11px", margin: "0" }}>
            Thank you for dining with us! ☕
          </p>
        </div>
      </div>
    </>
  );
}
