"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, X } from "lucide-react";

export default function PromotionsPage() {
  const [activeTab, setActiveTab] = useState("coupons");
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [promoApplyTo, setPromoApplyTo] = useState("order");

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Coupons & Promotions</h1>
        <button 
          onClick={() => activeTab === 'coupons' ? setIsCouponModalOpen(true) : setIsPromoModalOpen(true)}
          className="bg-cafe-primary hover:bg-cafe-primary-hover text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          {activeTab === 'coupons' ? 'Add Coupon' : 'Add Promotion'}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 flex gap-6">
        <button 
          onClick={() => setActiveTab("coupons")}
          className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'coupons' ? 'border-cafe-primary text-cafe-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Coupon Codes
        </button>
        <button 
          onClick={() => setActiveTab("promotions")}
          className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'promotions' ? 'border-cafe-primary text-cafe-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Automated Promotions
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {activeTab === 'coupons' ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                <th className="px-6 py-4 font-medium">Coupon Code</th>
                <th className="px-6 py-4 font-medium">Discount Type</th>
                <th className="px-6 py-4 font-medium">Discount Value</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-900">SAVE10</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-cafe-info border border-blue-200">
                    Percentage
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-900">10%</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                    Active
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 text-gray-400 hover:text-cafe-info hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={18} /></button>
                    <button className="p-2 text-gray-400 hover:text-cafe-danger hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                <th className="px-6 py-4 font-medium">Promotion Name</th>
                <th className="px-6 py-4 font-medium">Apply To</th>
                <th className="px-6 py-4 font-medium">Condition</th>
                <th className="px-6 py-4 font-medium">Discount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">Happy Hour</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                    Order
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">Min Amount: ₹500</td>
                <td className="px-6 py-4 text-gray-900">₹50 (Fixed)</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                    Active
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 text-gray-400 hover:text-cafe-info hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={18} /></button>
                    <button className="p-2 text-gray-400 hover:text-cafe-danger hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>

      {/* Coupon Modal */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Add Coupon Code</h2>
              <button onClick={() => setIsCouponModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cafe-primary uppercase" placeholder="e.g. SUMMER24" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="ctype" className="text-cafe-primary focus:ring-cafe-primary" defaultChecked />
                    <span className="text-sm">Percentage (%)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="ctype" className="text-cafe-primary focus:ring-cafe-primary" />
                    <span className="text-sm">Fixed Amount (₹)</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Value</label>
                <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cafe-primary" placeholder="10" />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3 bg-gray-50 rounded-b-xl">
              <button onClick={() => setIsCouponModalOpen(false)} className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-white">Cancel</button>
              <button className="flex-1 py-2 bg-cafe-primary text-white rounded-lg font-medium hover:bg-cafe-primary-hover">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Promotion Modal */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Add Automated Promotion</h2>
              <button onClick={() => setIsPromoModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Promotion Name</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cafe-primary" placeholder="e.g. Buy 2 Get 10% Off" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Apply To</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="apply" checked={promoApplyTo === 'order'} onChange={() => setPromoApplyTo('order')} className="text-cafe-primary focus:ring-cafe-primary" />
                    <span className="text-sm">Whole Order</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="apply" checked={promoApplyTo === 'product'} onChange={() => setPromoApplyTo('product')} className="text-cafe-primary focus:ring-cafe-primary" />
                    <span className="text-sm">Specific Product</span>
                  </label>
                </div>
              </div>

              {promoApplyTo === 'order' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Condition: Minimum Order Amount (₹)</label>
                  <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cafe-primary" placeholder="500" />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Product</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cafe-primary bg-white">
                      <option>Cappuccino</option>
                      <option>Latte</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Condition: Minimum Quantity</label>
                    <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cafe-primary" placeholder="2" />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="ptype" className="text-cafe-primary focus:ring-cafe-primary" defaultChecked />
                    <span className="text-sm">Percentage (%)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="ptype" className="text-cafe-primary focus:ring-cafe-primary" />
                    <span className="text-sm">Fixed Amount (₹)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Value</label>
                <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cafe-primary" placeholder="10" />
                <p className="text-xs text-gray-500 mt-2">Discount applies to the whole order if condition is met.</p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3 bg-gray-50 rounded-b-xl">
              <button onClick={() => setIsPromoModalOpen(false)} className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-white">Cancel</button>
              <button className="flex-1 py-2 bg-cafe-primary text-white rounded-lg font-medium hover:bg-cafe-primary-hover">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
