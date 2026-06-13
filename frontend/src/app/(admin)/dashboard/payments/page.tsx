"use client";

import { useState } from "react";
import { Banknote, CreditCard, QrCode } from "lucide-react";

export default function PaymentMethodsPage() {
  const [upiEnabled, setUpiEnabled] = useState(false);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-cafe-text">Payment Methods</h1>
      </div>

      <div className="space-y-4">
        {/* Cash */}
        <div className="bg-white rounded-xl border border-[#EFECE7] shadow-xs p-6 flex items-start gap-4 hover:border-[#ebdcd0] transition-colors">
          <div className="w-12 h-12 bg-[#557A61]/10 text-cafe-success rounded-xl flex items-center justify-center shrink-0">
            <Banknote size={22} />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-bold text-cafe-text text-base">Cash</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-[#E6E1DA] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cafe-success"></div>
              </label>
            </div>
            <p className="text-[#8E827B] text-sm">Accept physical cash payments. The terminal will calculate change due.</p>
          </div>
        </div>

        {/* Digital/Card */}
        <div className="bg-white rounded-xl border border-[#EFECE7] shadow-xs p-6 flex items-start gap-4 hover:border-[#ebdcd0] transition-colors">
          <div className="w-12 h-12 bg-[#5076a8]/10 text-[#5076a8] rounded-xl flex items-center justify-center shrink-0">
            <CreditCard size={22} />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-bold text-cafe-text text-base">Digital / Card</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-[#E6E1DA] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cafe-success"></div>
              </label>
            </div>
            <p className="text-[#8E827B] text-sm">Process credit and debit cards via external terminal.</p>
          </div>
        </div>

        {/* UPI QR */}
        <div className="bg-white rounded-xl border border-[#EFECE7] shadow-xs p-6 flex items-start gap-4 hover:border-[#ebdcd0] transition-colors">
          <div className="w-12 h-12 bg-[#C86A50]/10 text-cafe-primary rounded-xl flex items-center justify-center shrink-0">
            <QrCode size={22} />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-bold text-cafe-text text-base">UPI QR</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={upiEnabled} onChange={(e) => setUpiEnabled(e.target.checked)} />
                <div className="w-11 h-6 bg-[#E6E1DA] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cafe-success"></div>
              </label>
            </div>
            <p className="text-[#8E827B] text-sm">Dynamically generate UPI QR codes for customers to scan and pay.</p>
            
            {upiEnabled && (
              <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#EFECE7] animate-in fade-in slide-in-from-top-4 mt-4">
                <label className="block text-xs font-semibold text-[#8E827B] uppercase tracking-wider mb-2">Merchant UPI ID</label>
                <input 
                  type="text" 
                  className="w-full px-3.5 py-2.5 bg-white paper-input rounded-xl focus:outline-none" 
                  placeholder="e.g. cafe@ybl" 
                />
                <p className="text-xs text-[#8E827B] mt-2">QR code will be generated dynamically at checkout using this ID.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-[#EFECE7] flex justify-end">
        <button className="btn-terracotta px-6 py-2.5 rounded-xl font-medium cursor-pointer">
          Save Changes
        </button>
      </div>
    </div>
  );
}
