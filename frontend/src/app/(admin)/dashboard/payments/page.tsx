"use client";

import { useState, useEffect } from "react";
import { Trash2, Plus, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import api from "@/api/axios";
import toast from "react-hot-toast";

interface PaymentMethod {
  id: string;
  type: string; // "CASH" | "CARD" | "UPI"
  enabled: boolean;
  upiId: string | null;
  isNew?: boolean; // temporary flag for ui
}

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch payment methods from DB on mount
  const fetchMethods = async () => {
    try {
      setLoading(true);
      const res = await api.get("/payment-methods");
      // Map API payload to PaymentMethod interface
      const data = res.data || [];
      setMethods(data);
    } catch (err: any) {
      console.error("Error loading payment methods:", err);
      // Fallback fallback configurations
      setMethods([
        { id: "m-1", type: "CASH", enabled: true, upiId: null },
        { id: "m-2", type: "CARD", enabled: true, upiId: null },
        { id: "m-3", type: "UPI", enabled: false, upiId: "cafe@upi" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  const handleAddField = () => {
    const newMethod: PaymentMethod = {
      id: `temp-${Date.now()}`,
      type: "CASH",
      enabled: true,
      upiId: "",
      isNew: true
    };
    setMethods(prev => [...prev, newMethod]);
  };

  const handleFieldChange = (id: string, field: keyof PaymentMethod, value: any) => {
    setMethods(prev => 
      prev.map(m => {
        if (m.id === id) {
          const updated = { ...m, [field]: value };
          // If changing type away from UPI, clear the upiId
          if (field === "type" && value !== "UPI") {
            updated.upiId = null;
          } else if (field === "type" && value === "UPI" && !m.upiId) {
            updated.upiId = "";
          }
          return updated;
        }
        return m;
      })
    );
  };

  const handleDeleteRow = async (id: string, isNew?: boolean) => {
    if (isNew) {
      setMethods(prev => prev.filter(m => m.id !== id));
      return;
    }

    if (!confirm("Are you sure you want to delete this payment method?")) return;
    try {
      await api.delete(`/payment-methods/${id}`);
      toast.success("Payment method deleted successfully!");
      fetchMethods();
    } catch (err) {
      toast.error("Failed to delete payment method.");
    }
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      // Save all changed or new rows
      for (const m of methods) {
        if (m.isNew) {
          await api.post("/payment-methods", {
            type: m.type,
            enabled: m.enabled,
            upiId: m.upiId
          });
        } else {
          await api.put(`/payment-methods/${m.id}`, {
            type: m.type,
            enabled: m.enabled,
            upiId: m.upiId
          });
        }
      }
      toast.success("Payment configurations saved!");
      fetchMethods();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to save configurations.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-cafe-text">Payment Methods</h1>
          <p className="text-xs text-[#8E827B]">Configure payment handlers accepted at checkouts</p>
        </div>
        <button 
          onClick={handleAddField}
          className="btn-primary"
        >
          <Plus size={15} /> Add Method
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-[#8E827B] text-xs font-medium bg-white rounded-2xl border border-[#EFECE7]">
          Loading payment methods...
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#EFECE7] overflow-hidden shadow-xs p-6 space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#EFECE7] text-[#8E827B] font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Payment Type</th>
                  <th className="px-6 py-4">UPI Identifier</th>
                  <th className="px-6 py-4">Activate</th>
                  <th className="px-6 py-4 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFECE7] text-cafe-text font-medium">
                {methods.map(method => (
                  <tr key={method.id} className="hover:bg-[#FAF8F5]/50 transition-colors">
                    <td className="px-6 py-4">
                      <select
                        value={method.type}
                        onChange={(e) => handleFieldChange(method.id, "type", e.target.value)}
                        className="px-3 py-2 bg-white border border-[#EFECE7] rounded-xl focus:outline-none focus:border-[#C86A50]"
                      >
                        <option value="CASH">Cash</option>
                        <option value="CARD">Card</option>
                        <option value="UPI">UPI</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      {method.type === "UPI" ? (
                        <input
                          type="text"
                          required
                          value={method.upiId || ""}
                          onChange={(e) => handleFieldChange(method.id, "upiId", e.target.value)}
                          className="px-3.5 py-2 bg-[#FAF8F5] border border-[#E6E1DA] focus:border-[#C86A50] rounded-xl text-xs focus:outline-none w-52 font-bold"
                          placeholder="e.g. cafe@ybl"
                        />
                      ) : (
                        <span className="text-[#8E827B] italic">Not Applicable</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={method.enabled} 
                          onChange={(e) => handleFieldChange(method.id, "enabled", e.target.checked)} 
                        />
                        <div className="w-9 h-5 bg-[#E6E1DA] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cafe-success"></div>
                      </label>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDeleteRow(method.id, method.isNew)}
                        className="p-1.5 text-[#8E827B] hover:text-cafe-danger hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* UPI Live QR Code Preview Sidebar Section */}
          {methods.some(m => m.type === "UPI" && m.enabled) && (
            <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#EFECE7] flex flex-col md:flex-row items-center gap-6 animate-in fade-in duration-300">
              <div className="w-24 h-24 bg-white border border-[#E6E1DA] rounded-xl p-2.5 flex items-center justify-center shadow-inner">
                {methods.find(m => m.type === "UPI")?.upiId ? (
                  <QRCodeSVG 
                    value={methods.find(m => m.type === "UPI")?.upiId || ""} 
                    size={76} 
                  />
                ) : (
                  <div className="text-[10px] text-[#8E827B] font-bold text-center">Enter UPI ID to preview</div>
                )}
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-[#2C2623] flex items-center gap-1.5 mb-1">
                  <QrCode size={14} className="text-[#C86A50]" />
                  UPI QR Preview
                </h4>
                <p className="text-[11px] text-[#8E827B] max-w-md leading-relaxed font-semibold">
                  This QR code will be generated live at checkout using the Merchant Identifier: 
                  <span className="text-[#C86A50] font-black block mt-0.5 select-all">
                    {methods.find(m => m.type === "UPI")?.upiId || "(no identifier entered)"}
                  </span>
                </p>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-[#EFECE7] flex justify-end">
            <button 
              onClick={handleSaveChanges}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
