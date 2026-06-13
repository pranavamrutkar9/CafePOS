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
        <h1 className="text-2xl font-bold text-cafe-text">Coupons & Promotions</h1>
        <button 
          onClick={() => activeTab === 'coupons' ? setIsCouponModalOpen(true) : setIsPromoModalOpen(true)}
          className="btn-terracotta px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 cursor-pointer"
        >
          <Plus size={20} />
          {activeTab === 'coupons' ? 'Add Coupon' : 'Add Promotion'}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#EFECE7] flex gap-6">
        <button 
          onClick={() => setActiveTab("coupons")}
          className={`py-3 px-1 border-b-2 font-semibold text-sm transition-all cursor-pointer ${
            activeTab === 'coupons' 
              ? 'border-cafe-primary text-cafe-primary' 
              : 'border-transparent text-[#8E827B] hover:text-cafe-text'
          }`}
        >
          Coupon Codes
        </button>
        <button 
          onClick={() => setActiveTab("promotions")}
          className={`py-3 px-1 border-b-2 font-semibold text-sm transition-all cursor-pointer ${
            activeTab === 'promotions' 
              ? 'border-cafe-primary text-cafe-primary' 
              : 'border-transparent text-[#8E827B] hover:text-cafe-text'
          }`}
        >
          Automated Promotions
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-[#EFECE7] overflow-hidden shadow-xs">
        {activeTab === 'coupons' ? (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#EFECE7] text-[#8E827B] font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Coupon Code</th>
                <th className="px-6 py-4">Discount Type</th>
                <th className="px-6 py-4">Discount Value</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFECE7] text-cafe-text font-medium">
              <tr className="hover:bg-[#FAF8F5]/50 transition-colors">
                <td className="px-6 py-4 font-bold text-sm">SAVE10</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold badge-terracotta">
                    Percentage
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-semibold">10%</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold badge-sage">
                    Active
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-1.5">
                    <button className="p-1.5 text-[#8E827B] hover:text-cafe-primary hover:bg-[#FAF8F5] rounded-lg transition-colors cursor-pointer"><Edit2 size={15} /></button>
                    <button className="p-1.5 text-[#8E827B] hover:text-cafe-danger hover:bg-[#FAF8F5] rounded-lg transition-colors cursor-pointer"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#EFECE7] text-[#8E827B] font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Promotion Name</th>
                <th className="px-6 py-4">Apply To</th>
                <th className="px-6 py-4">Condition</th>
                <th className="px-6 py-4">Discount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFECE7] text-cafe-text font-medium">
              <tr className="hover:bg-[#FAF8F5]/50 transition-colors">
                <td className="px-6 py-4 text-sm font-semibold">Happy Hour</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold badge-terracotta">
                    Order
                  </span>
                </td>
                <td className="px-6 py-4 text-[#8E827B]">Min Amount: ₹500</td>
                <td className="px-6 py-4 text-sm font-semibold">₹50 (Fixed)</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold badge-sage">
                    Active
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-1.5">
                    <button className="p-1.5 text-[#8E827B] hover:text-cafe-primary hover:bg-[#FAF8F5] rounded-lg transition-colors cursor-pointer"><Edit2 size={15} /></button>
                    <button className="p-1.5 text-[#8E827B] hover:text-cafe-danger hover:bg-[#FAF8F5] rounded-lg transition-colors cursor-pointer"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>

      {/* Coupon Modal */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 bg-[#2C2623]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="paper-panel rounded-2xl w-full max-w-md animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-[#EFECE7] flex justify-between items-center bg-white">
              <h2 className="text-lg font-bold text-cafe-text">Add Coupon Code</h2>
              <button 
                onClick={() => setIsCouponModalOpen(false)} 
                className="p-1.5 text-[#8E827B] hover:text-cafe-text rounded-full hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 space-y-4 bg-white">
              <div>
                <label className="block text-xs font-semibold text-[#8E827B] uppercase tracking-wider mb-2">Coupon Code</label>
                <input 
                  type="text" 
                  className="w-full px-3.5 py-2.5 paper-input rounded-xl focus:outline-none uppercase" 
                  placeholder="e.g. SUMMER24" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8E827B] uppercase tracking-wider mb-2">Discount Type</label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-cafe-text font-semibold">
                    <input 
                      type="radio" 
                      name="ctype" 
                      className="accent-[#C86A50] w-4 h-4 cursor-pointer" 
                      defaultChecked 
                    />
                    <span>Percentage (%)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-cafe-text font-semibold">
                    <input 
                      type="radio" 
                      name="ctype" 
                      className="accent-[#C86A50] w-4 h-4 cursor-pointer" 
                    />
                    <span>Fixed Amount (₹)</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8E827B] uppercase tracking-wider mb-2">Discount Value</label>
                <input 
                  type="number" 
                  className="w-full px-3.5 py-2.5 paper-input rounded-xl focus:outline-none" 
                  placeholder="10" 
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-[#EFECE7] bg-[#FAF8F5] flex gap-3">
              <button 
                onClick={() => setIsCouponModalOpen(false)} 
                className="flex-1 py-2.5 border border-[#E6E1DA] text-cafe-text rounded-xl font-medium bg-white hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button className="flex-1 py-2.5 btn-terracotta rounded-xl font-medium cursor-pointer">
                Save Coupon
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Promotion Modal */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 bg-[#2C2623]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="paper-panel rounded-2xl w-full max-w-md animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-[#EFECE7] flex justify-between items-center bg-white">
              <h2 className="text-lg font-bold text-cafe-text">Add Automated Promotion</h2>
              <button 
                onClick={() => setIsPromoModalOpen(false)} 
                className="p-1.5 text-[#8E827B] hover:text-cafe-text rounded-full hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto organic-scrollbar bg-white">
              <div>
                <label className="block text-xs font-semibold text-[#8E827B] uppercase tracking-wider mb-2">Promotion Name</label>
                <input 
                  type="text" 
                  className="w-full px-3.5 py-2.5 paper-input rounded-xl focus:outline-none" 
                  placeholder="e.g. Buy 2 Get 10% Off" 
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-[#8E827B] uppercase tracking-wider mb-2">Apply To</label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-cafe-text font-semibold">
                    <input 
                      type="radio" 
                      name="apply" 
                      checked={promoApplyTo === 'order'} 
                      onChange={() => setPromoApplyTo('order')} 
                      className="accent-[#C86A50] w-4 h-4 cursor-pointer" 
                    />
                    <span>Whole Order</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-cafe-text font-semibold">
                    <input 
                      type="radio" 
                      name="apply" 
                      checked={promoApplyTo === 'product'} 
                      onChange={() => setPromoApplyTo('product')} 
                      className="accent-[#C86A50] w-4 h-4 cursor-pointer" 
                    />
                    <span>Specific Product</span>
                  </label>
                </div>
              </div>

              {promoApplyTo === 'order' ? (
                <div>
                  <label className="block text-xs font-semibold text-[#8E827B] uppercase tracking-wider mb-2">Condition: Minimum Order Amount (₹)</label>
                  <input 
                    type="number" 
                    className="w-full px-3.5 py-2.5 paper-input rounded-xl focus:outline-none" 
                    placeholder="500" 
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-[#8E827B] uppercase tracking-wider mb-2">Select Product</label>
                    <select className="w-full px-3.5 py-2.5 paper-input rounded-xl focus:outline-none bg-white">
                      <option>Cappuccino</option>
                      <option>Latte</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8E827B] uppercase tracking-wider mb-2">Condition: Minimum Quantity</label>
                    <input 
                      type="number" 
                      className="w-full px-3.5 py-2.5 paper-input rounded-xl focus:outline-none" 
                      placeholder="2" 
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#8E827B] uppercase tracking-wider mb-2">Discount Type</label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-cafe-text font-semibold">
                    <input 
                      type="radio" 
                      name="ptype" 
                      className="accent-[#C86A50] w-4 h-4 cursor-pointer" 
                      defaultChecked 
                    />
                    <span>Percentage (%)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-cafe-text font-semibold">
                    <input 
                      type="radio" 
                      name="ptype" 
                      className="accent-[#C86A50] w-4 h-4 cursor-pointer" 
                    />
                    <span>Fixed Amount (₹)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8E827B] uppercase tracking-wider mb-2">Discount Value</label>
                <input 
                  type="number" 
                  className="w-full px-3.5 py-2.5 paper-input rounded-xl focus:outline-none" 
                  placeholder="10" 
                />
                <p className="text-xs text-[#8E827B] mt-2 font-medium">Discount applies to the whole order if condition is met.</p>
              </div>
            </div>
            
            <div className="p-6 border-t border-[#EFECE7] bg-[#FAF8F5] flex gap-3">
              <button 
                onClick={() => setIsPromoModalOpen(false)} 
                className="flex-1 py-2.5 border border-[#E6E1DA] text-cafe-text rounded-xl font-medium bg-white hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button className="flex-1 py-2.5 btn-terracotta rounded-xl font-medium cursor-pointer">
                Save Promotion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
