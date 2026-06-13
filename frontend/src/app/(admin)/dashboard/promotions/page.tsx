"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, AlertCircle } from "lucide-react";
import api from "@/api/axios";
import toast from "react-hot-toast";

interface Coupon {
  id: string;
  code: string;
  type: string;
  value: number;
  active: boolean;
}

interface Product {
  id: string;
  name: string;
}

interface Promotion {
  id: string;
  scope: string;
  type: string;
  value: number;
  minQty: number | null;
  minAmount: number | null;
  active: boolean;
  productId: string | null;
  product?: Product | null;
}

export default function PromotionsPage() {
  const [activeTab, setActiveTab] = useState("coupons");
  
  // Data States
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals Open
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);

  // Form Fields - Coupon
  const [couponCode, setCouponCode] = useState("");
  const [couponType, setCouponType] = useState("PERCENT");
  const [couponValue, setCouponValue] = useState("");

  // Form Fields - Promotion
  const [promoScope, setPromoScope] = useState("ORDER");
  const [promoType, setPromoType] = useState("PERCENT");
  const [promoValue, setPromoValue] = useState("");
  const [promoMinQty, setPromoMinQty] = useState("");
  const [promoMinAmount, setPromoMinAmount] = useState("");
  const [promoProductId, setPromoProductId] = useState("");

  // Fetch Coupons, Promotions, and Products
  const fetchData = async () => {
    try {
      setLoading(true);
      const [couponsRes, promosRes, prodsRes] = await Promise.all([
        api.get("/coupons-promotions/coupons"),
        api.get("/coupons-promotions/promotions"),
        api.get("/products")
      ]);
      setCoupons(couponsRes.data || []);
      setPromotions(promosRes.data || []);
      setProducts(prodsRes.data || []);
    } catch (error: any) {
      console.error("Failed to load promotions/coupons data:", error);
      toast.error("Error loading coupons and promotions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Save Coupon
  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim() || !couponValue) {
      toast.error("Please enter a valid code and value.");
      return;
    }

    try {
      await api.post("/coupons-promotions/coupons", {
        code: couponCode.trim().toUpperCase(),
        type: couponType,
        value: parseFloat(couponValue),
        active: true
      });
      toast.success("Coupon saved successfully!");
      setIsCouponModalOpen(false);
      
      // Reset fields
      setCouponCode("");
      setCouponValue("");
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to create coupon.");
    }
  };

  // Save Promotion
  const handleSavePromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoValue) {
      toast.error("Please enter a discount value.");
      return;
    }

    if (promoScope === "PRODUCT" && !promoProductId) {
      toast.error("Please select a product for this promotion.");
      return;
    }

    try {
      await api.post("/coupons-promotions/promotions", {
        scope: promoScope,
        type: promoType,
        value: parseFloat(promoValue),
        minQty: promoScope === "PRODUCT" ? parseInt(promoMinQty) || 1 : null,
        minAmount: promoScope === "ORDER" ? parseFloat(promoMinAmount) || 0 : null,
        productId: promoScope === "PRODUCT" ? promoProductId : null,
        active: true
      });
      toast.success("Promotion saved successfully!");
      setIsPromoModalOpen(false);

      // Reset fields
      setPromoValue("");
      setPromoMinQty("");
      setPromoMinAmount("");
      setPromoProductId("");
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to create promotion.");
    }
  };

  // Toggle Coupon Active Status
  const handleToggleCoupon = async (coupon: Coupon) => {
    try {
      await api.patch(`/coupons-promotions/coupons/${coupon.id}`, {
        active: !coupon.active
      });
      toast.success(`Coupon ${!coupon.active ? 'activated' : 'deactivated'}`);
      fetchData();
    } catch (error: any) {
      toast.error("Failed to update coupon status.");
    }
  };

  // Toggle Promotion Active Status
  const handleTogglePromotion = async (promo: Promotion) => {
    try {
      await api.patch(`/coupons-promotions/promotions/${promo.id}`, {
        active: !promo.active
      });
      toast.success(`Promotion ${!promo.active ? 'activated' : 'deactivated'}`);
      fetchData();
    } catch (error: any) {
      toast.error("Failed to update promotion status.");
    }
  };

  // Delete Coupon
  const handleDeleteCoupon = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await api.delete(`/coupons-promotions/coupons/${id}`);
      toast.success("Coupon deleted.");
      fetchData();
    } catch (error: any) {
      toast.error("Failed to delete coupon.");
    }
  };

  // Delete Promotion
  const handleDeletePromotion = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promotion?")) return;
    try {
      await api.delete(`/coupons-promotions/promotions/${id}`);
      toast.success("Promotion deleted.");
      fetchData();
    } catch (error: any) {
      toast.error("Failed to delete promotion.");
    }
  };

  // Helper to derive display name for automated promotions
  const getPromoDisplayName = (promo: Promotion) => {
    const typeLabel = promo.type === "PERCENT" ? `${promo.value}%` : `₹${promo.value}`;
    if (promo.scope === "PRODUCT") {
      const prodName = promo.product?.name || "Product";
      const minQtyLabel = promo.minQty ? `(Min Qty: ${promo.minQty})` : "";
      return `${typeLabel} off on ${prodName} ${minQtyLabel}`;
    } else {
      const minAmountLabel = promo.minAmount ? `over ₹${promo.minAmount}` : "on all orders";
      return `${typeLabel} off orders ${minAmountLabel}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-cafe-text">Coupons & Promotions</h1>
        <button 
          onClick={() => activeTab === 'coupons' ? setIsCouponModalOpen(true) : setIsPromoModalOpen(true)}
          className="btn-terracotta px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 cursor-pointer shadow-sm active:scale-98"
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
              ? 'border-cafe-primary text-cafe-primary font-bold' 
              : 'border-transparent text-[#8E827B] hover:text-cafe-text'
          }`}
        >
          Coupon Codes
        </button>
        <button 
          onClick={() => setActiveTab("promotions")}
          className={`py-3 px-1 border-b-2 font-semibold text-sm transition-all cursor-pointer ${
            activeTab === 'promotions' 
              ? 'border-cafe-primary text-cafe-primary font-bold' 
              : 'border-transparent text-[#8E827B] hover:text-cafe-text'
          }`}
        >
          Automated Promotions
        </button>
      </div>

      {/* Loading or Data Table */}
      {loading ? (
        <div className="py-20 text-center text-[#8e827b] text-sm font-semibold">
          <div className="w-8 h-8 border-4 border-[#C86A50] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          Loading data...
        </div>
      ) : (
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
                {coupons.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-[#8e827b] font-semibold">
                      No coupon codes configured.
                    </td>
                  </tr>
                ) : (
                  coupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-[#FAF8F5]/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-sm text-[#2C2623]">{coupon.code}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                          coupon.type === 'PERCENT' ? 'badge-terracotta' : 'badge-sage'
                        }`}>
                          {coupon.type === 'PERCENT' ? 'Percentage' : 'Fixed Amount'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold">
                        {coupon.type === 'PERCENT' ? `${coupon.value}%` : `₹${coupon.value}`}
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handleToggleCoupon(coupon)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold cursor-pointer transition-all border ${
                            coupon.active 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-gray-150 text-gray-500 border-gray-200'
                          }`}
                        >
                          {coupon.active ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-1.5">
                          <button 
                            onClick={() => handleDeleteCoupon(coupon.id)}
                            className="p-1.5 text-[#8E827B] hover:text-cafe-danger hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#EFECE7] text-[#8E827B] font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Promotion Summary</th>
                  <th className="px-6 py-4">Scope</th>
                  <th className="px-6 py-4">Target Product</th>
                  <th className="px-6 py-4">Conditions</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFECE7] text-cafe-text font-medium">
                {promotions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-[#8e827b] font-semibold">
                      No automated promotions configured.
                    </td>
                  </tr>
                ) : (
                  promotions.map((promo) => (
                    <tr key={promo.id} className="hover:bg-[#FAF8F5]/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-[#2C2623]">
                        {getPromoDisplayName(promo)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                          promo.scope === 'PRODUCT' ? 'badge-terracotta' : 'badge-sage'
                        }`}>
                          {promo.scope}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {promo.scope === "PRODUCT" ? (
                          <span className="font-semibold text-cafe-text">{promo.product?.name || "Product"}</span>
                        ) : (
                          <span className="text-[#8E827B]">All Items</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-[#8E827B] font-semibold">
                        {promo.scope === 'PRODUCT' 
                          ? `Min Qty: ${promo.minQty || 1}`
                          : `Min Amount: ₹${promo.minAmount || 0}`
                        }
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handleTogglePromotion(promo)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold cursor-pointer transition-all border ${
                            promo.active 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-gray-150 text-gray-500 border-gray-200'
                          }`}
                        >
                          {promo.active ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-1.5">
                          <button 
                            onClick={() => handleDeletePromotion(promo.id)}
                            className="p-1.5 text-[#8E827B] hover:text-cafe-danger hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Coupon Modal */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 bg-[#2C2623]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="paper-panel rounded-2xl w-full max-w-md animate-in zoom-in-95 duration-200 overflow-hidden shadow-xl border border-[#EFECE7]">
            <div className="px-6 py-4 border-b border-[#EFECE7] flex justify-between items-center bg-white">
              <h2 className="text-lg font-bold text-cafe-text">Add Coupon Code</h2>
              <button 
                onClick={() => setIsCouponModalOpen(false)} 
                className="p-1.5 text-[#8E827B] hover:text-cafe-text rounded-full hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSaveCoupon}>
              <div className="p-6 space-y-4 bg-white">
                <div>
                  <label className="block text-xs font-bold text-[#8E827B] uppercase tracking-wider mb-2">Coupon Code</label>
                  <input 
                    type="text" 
                    required
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 paper-input rounded-xl focus:outline-none uppercase font-extrabold text-sm" 
                    placeholder="e.g. SUMMER30" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#8E827B] uppercase tracking-wider mb-2">Discount Type</label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-cafe-text font-semibold">
                      <input 
                        type="radio" 
                        name="ctype" 
                        value="PERCENT"
                        checked={couponType === "PERCENT"}
                        onChange={() => setCouponType("PERCENT")}
                        className="accent-[#C86A50] w-4 h-4 cursor-pointer" 
                      />
                      <span>Percentage (%)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-cafe-text font-semibold">
                      <input 
                        type="radio" 
                        name="ctype" 
                        value="FIXED"
                        checked={couponType === "FIXED"}
                        onChange={() => setCouponType("FIXED")}
                        className="accent-[#C86A50] w-4 h-4 cursor-pointer" 
                      />
                      <span>Fixed Amount (₹)</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#8E827B] uppercase tracking-wider mb-2">Discount Value</label>
                  <input 
                    type="number" 
                    required
                    step="0.01"
                    min="0"
                    value={couponValue}
                    onChange={(e) => setCouponValue(e.target.value)}
                    className="w-full px-3.5 py-2.5 paper-input rounded-xl focus:outline-none font-bold" 
                    placeholder="e.g. 10" 
                  />
                </div>
              </div>
              
              <div className="p-6 border-t border-[#EFECE7] bg-[#FAF8F5] flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)} 
                  className="flex-1 py-2.5 border border-[#E6E1DA] text-cafe-text rounded-xl font-medium bg-white hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 btn-terracotta rounded-xl font-medium cursor-pointer active:scale-98">
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Promotion Modal */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 bg-[#2C2623]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="paper-panel rounded-2xl w-full max-w-md animate-in zoom-in-95 duration-200 overflow-hidden shadow-xl border border-[#EFECE7]">
            <div className="px-6 py-4 border-b border-[#EFECE7] flex justify-between items-center bg-white">
              <h2 className="text-lg font-bold text-cafe-text">Add Automated Promotion</h2>
              <button 
                onClick={() => setIsPromoModalOpen(false)} 
                className="p-1.5 text-[#8E827B] hover:text-cafe-text rounded-full hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSavePromotion}>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto organic-scrollbar bg-white text-xs">
                <div>
                  <label className="block text-xs font-bold text-[#8E827B] uppercase tracking-wider mb-2">Apply To</label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-cafe-text font-semibold">
                      <input 
                        type="radio" 
                        name="apply" 
                        checked={promoScope === 'ORDER'} 
                        onChange={() => setPromoScope('ORDER')} 
                        className="accent-[#C86A50] w-4 h-4 cursor-pointer" 
                      />
                      <span>Whole Order</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-cafe-text font-semibold">
                      <input 
                        type="radio" 
                        name="apply" 
                        checked={promoScope === 'PRODUCT'} 
                        onChange={() => setPromoScope('PRODUCT')} 
                        className="accent-[#C86A50] w-4 h-4 cursor-pointer" 
                      />
                      <span>Specific Product</span>
                    </label>
                  </div>
                </div>

                {promoScope === 'ORDER' ? (
                  <div>
                    <label className="block text-xs font-bold text-[#8E827B] uppercase tracking-wider mb-2">Condition: Minimum Order Amount (₹)</label>
                    <input 
                      type="number" 
                      required
                      step="0.01"
                      min="0"
                      value={promoMinAmount}
                      onChange={(e) => setPromoMinAmount(e.target.value)}
                      className="w-full px-3.5 py-2.5 paper-input rounded-xl focus:outline-none font-bold" 
                      placeholder="e.g. 500" 
                    />
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-[#8E827B] uppercase tracking-wider mb-2">Select Product</label>
                      <select 
                        required
                        value={promoProductId}
                        onChange={(e) => setPromoProductId(e.target.value)}
                        className="w-full px-3.5 py-2.5 paper-input rounded-xl focus:outline-none bg-white font-semibold"
                      >
                        <option value="">-- Choose Product --</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#8E827B] uppercase tracking-wider mb-2">Condition: Minimum Quantity</label>
                      <input 
                        type="number" 
                        required
                        min="1"
                        value={promoMinQty}
                        onChange={(e) => setPromoMinQty(e.target.value)}
                        className="w-full px-3.5 py-2.5 paper-input rounded-xl focus:outline-none font-bold" 
                        placeholder="e.g. 2" 
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#8E827B] uppercase tracking-wider mb-2">Discount Type</label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-cafe-text font-semibold">
                      <input 
                        type="radio" 
                        name="ptype" 
                        value="PERCENT"
                        checked={promoType === "PERCENT"}
                        onChange={() => setPromoType("PERCENT")}
                        className="accent-[#C86A50] w-4 h-4 cursor-pointer" 
                      />
                      <span>Percentage (%)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-cafe-text font-semibold">
                      <input 
                        type="radio" 
                        name="ptype" 
                        value="FIXED"
                        checked={promoType === "FIXED"}
                        onChange={() => setPromoType("FIXED")}
                        className="accent-[#C86A50] w-4 h-4 cursor-pointer" 
                      />
                      <span>Fixed Amount (₹)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#8E827B] uppercase tracking-wider mb-2">Discount Value</label>
                  <input 
                    type="number" 
                    required
                    step="0.01"
                    min="0"
                    value={promoValue}
                    onChange={(e) => setPromoValue(e.target.value)}
                    className="w-full px-3.5 py-2.5 paper-input rounded-xl focus:outline-none font-bold" 
                    placeholder="e.g. 15" 
                  />
                  <p className="text-[10px] text-[#8E827B] mt-2 font-bold flex items-center gap-1">
                    <AlertCircle size={12} className="text-[#C86A50]" />
                    Discount applies automatically at terminal checkout once criteria are met.
                  </p>
                </div>
              </div>
              
              <div className="p-6 border-t border-[#EFECE7] bg-[#FAF8F5] flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsPromoModalOpen(false)} 
                  className="flex-1 py-2.5 border border-[#E6E1DA] text-cafe-text rounded-xl font-medium bg-white hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 btn-terracotta rounded-xl font-medium cursor-pointer active:scale-98">
                  Save Promotion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
