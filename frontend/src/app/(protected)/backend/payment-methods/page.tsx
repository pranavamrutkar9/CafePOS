"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical, Check, X } from "lucide-react";
import { usePaymentStore, PaymentMethod } from "@/store/usePaymentStore";
import { QRCodeCanvas } from "qrcode.react";

export default function PaymentMethodsPage() {
  const { paymentMethods, addPaymentMethod, updatePaymentMethod, deletePaymentMethod } = usePaymentStore();
  
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<PaymentMethod>>({});

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const openNewForm = () => {
    setEditingMethod(null);
    setFormData({
      name: "",
      type: "Cash",
      isActive: true,
      upiId: ""
    });
    setIsFormOpen(true);
  };

  const openEditForm = (method: PaymentMethod) => {
    setEditingMethod(method);
    setFormData({ ...method });
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (!formData.name) return alert("Name is required");

    if (editingMethod) {
      updatePaymentMethod(editingMethod.id, formData);
    } else {
      addPaymentMethod({
        ...formData,
        id: Math.random().toString(36).substring(7),
      } as PaymentMethod);
    }
    setIsFormOpen(false);
  };

  const toggleActive = (e: React.MouseEvent, method: PaymentMethod) => {
    e.stopPropagation(); // prevent row click
    updatePaymentMethod(method.id, { isActive: !method.isActive });
  };

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Payment Methods</h1>
        <button 
          onClick={openNewForm}
          className="flex items-center gap-2 bg-cafe-primary hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-md"
        >
          <Plus size={18} />
          <span>New Method</span>
        </button>
      </div>

      <div className="bg-[#1e1e1e] border border-gray-700 rounded-xl overflow-hidden flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#2a2a2a] sticky top-0 z-10">
              <tr>
                <th className="p-4 border-b border-gray-700 w-12 text-center text-gray-400"></th>
                <th className="p-4 border-b border-gray-700 text-sm font-semibold text-gray-300">Name</th>
                <th className="p-4 border-b border-gray-700 text-sm font-semibold text-gray-300">Type</th>
                <th className="p-4 border-b border-gray-700 text-sm font-semibold text-gray-300">UPI ID</th>
                <th className="p-4 border-b border-gray-700 text-sm font-semibold text-gray-300 text-center">Active</th>
                <th className="p-4 border-b border-gray-700 text-sm font-semibold text-gray-300 w-24 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paymentMethods.map((method, index) => (
                <tr 
                  key={method.id} 
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  onClick={() => openEditForm(method)}
                  className={`hover:bg-gray-800/50 transition-colors border-b border-gray-700/50 last:border-0 cursor-pointer ${draggedIndex === index ? 'opacity-50' : ''}`}
                >
                  <td className="p-4 text-center cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300" onClick={e => e.stopPropagation()}>
                    <GripVertical size={20} className="mx-auto" />
                  </td>
                  <td className="p-4 font-medium text-white">{method.name}</td>
                  <td className="p-4 text-gray-300">
                    <span className="bg-gray-700 px-2 py-1 rounded-md text-xs">{method.type}</span>
                  </td>
                  <td className="p-4 text-gray-400 font-mono text-sm">{method.type === 'UPI' ? method.upiId : '-'}</td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={(e) => toggleActive(e, method)}
                      className={`w-12 h-6 rounded-full relative transition-colors ${method.isActive ? 'bg-cafe-primary' : 'bg-gray-600'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${method.isActive ? 'left-7' : 'left-1'}`} />
                    </button>
                  </td>
                  <td className="p-4 text-center" onClick={e => e.stopPropagation()}>
                    <button 
                      onClick={() => {
                        if (confirm(`Delete payment method "${method.name}"?`)) {
                          deletePaymentMethod(method.id);
                        }
                      }}
                      className="p-2 text-gray-500 hover:text-cafe-danger hover:bg-gray-700 rounded-lg transition-colors inline-flex"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              
              {paymentMethods.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No payment methods found. Click "New Method" to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 animate-in fade-in" onClick={() => setIsFormOpen(false)}>
          <div 
            className="w-full max-w-md bg-[#1e1e1e] h-full shadow-xl flex flex-col border-l border-gray-700 animate-in slide-in-from-right"
            onClick={e => e.stopPropagation()} // prevent closing when clicking inside
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">{editingMethod ? "Edit Payment Method" : "New Payment Method"}</h2>
              <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Method Name</label>
                <input 
                  type="text" 
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#2a2a2a] border border-gray-600 rounded-lg py-2 px-3 text-white focus:ring-1 focus:ring-cafe-primary outline-none"
                  placeholder="e.g. PhonePe"
                />
              </div>

              {/* Type & Active */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full bg-[#2a2a2a] border border-gray-600 rounded-lg py-2 px-3 text-white focus:ring-1 focus:ring-cafe-primary outline-none"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                  <div className="flex items-center h-10">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className={`w-12 h-6 rounded-full relative transition-colors ${formData.isActive ? 'bg-cafe-primary' : 'bg-gray-600'}`}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.isActive ? 'left-7' : 'left-1'}`} />
                      </div>
                      <span className="text-white text-sm">{formData.isActive ? "Active" : "Inactive"}</span>
                    </label>
                    {/* Hidden input to toggle state clicking label */}
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={formData.isActive} 
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})} 
                    />
                  </div>
                </div>
              </div>

              {/* UPI ID & QR Code */}
              {formData.type === "UPI" && (
                <div className="bg-[#2a2a2a] border border-gray-600 rounded-lg p-4 mt-4 animate-in fade-in zoom-in-95">
                  <label className="block text-sm font-medium text-gray-300 mb-1">UPI ID</label>
                  <input 
                    type="text" 
                    value={formData.upiId || ""}
                    onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                    className="w-full bg-[#1e1e1e] border border-gray-600 rounded-lg py-2 px-3 text-white focus:ring-1 focus:ring-cafe-primary outline-none mb-4 font-mono"
                    placeholder="e.g. yourname@upi"
                  />
                  
                  <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg">
                    {formData.upiId ? (
                      <>
                        <QRCodeCanvas 
                          value={`upi://pay?pa=${formData.upiId}&pn=CafePOS`} 
                          size={150} 
                          level="H" 
                        />
                        <span className="text-gray-500 text-xs mt-2 font-mono">{formData.upiId}</span>
                      </>
                    ) : (
                      <div className="w-[150px] h-[150px] bg-gray-200 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
                        <span className="text-gray-400 text-sm text-center px-4">Enter UPI ID to generate QR</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

            <div className="p-6 border-t border-gray-700 flex gap-3 bg-[#1a1a1a]">
              <button 
                onClick={() => setIsFormOpen(false)}
                className="flex-1 py-2.5 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="flex-1 py-2.5 rounded-lg bg-cafe-primary text-white hover:bg-red-700 transition-colors font-medium shadow-md flex items-center justify-center gap-2"
              >
                <Check size={18} /> Save Method
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
