"use client";

import { useState } from "react";
import { Banknote, CreditCard, QrCode } from "lucide-react";

export default function PaymentMethodsPage() {
  const [upiEnabled, setUpiEnabled] = useState(false);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Payment Methods</h1>
      </div>

      <div className="space-y-4">
        {/* Cash */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-start gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shrink-0">
            <Banknote size={24} />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-bold text-gray-900 text-lg">Cash</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>
            <p className="text-gray-500 text-sm">Accept physical cash payments. Terminal will calculate change due.</p>
          </div>
        </div>

        {/* Digital/Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <CreditCard size={24} />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-bold text-gray-900 text-lg">Digital / Card</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>
            <p className="text-gray-500 text-sm">Process credit and debit cards via external terminal.</p>
          </div>
        </div>

        {/* UPI QR */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-start gap-4 transition-all">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
            <QrCode size={24} />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-bold text-gray-900 text-lg">UPI QR</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={upiEnabled} onChange={(e) => setUpiEnabled(e.target.checked)} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>
            <p className="text-gray-500 text-sm mb-4">Dynamically generate UPI QR codes for customers to scan and pay.</p>
            
            {upiEnabled && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 animate-in fade-in slide-in-from-top-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Merchant UPI ID</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cafe-primary bg-white" placeholder="e.g. cafe@ybl" />
                <p className="text-xs text-gray-500 mt-2">QR code will be generated dynamically at checkout using this ID.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200 flex justify-end">
        <button className="bg-cafe-primary hover:bg-cafe-primary-hover text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  );
}
