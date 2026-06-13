import { useState } from "react";
import { Discount, usePOSStore } from "@/store/usePOSStore";
import { X, Tag, Percent } from "lucide-react";
import { apiClient } from "@/lib/apiClient";

interface DiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AUTOMATED_PROMOS: Discount[] = [
  { code: "PROMO30", type: "percentage", value: 30 },
  { code: "PROMO25", type: "percentage", value: 25 },
  { code: "FLAT5", type: "fixed", value: 5 },
];

export default function DiscountModal({ isOpen, onClose }: DiscountModalProps) {
  const { appliedDiscount, setAppliedDiscount } = usePOSStore();
  const [codeInput, setCodeInput] = useState("");
  const [error, setError] = useState("");
  const [selectedPromo, setSelectedPromo] = useState<Discount | null>(appliedDiscount);

  if (!isOpen) return null;

  const handleValidateCode = async () => {
    setError("");
    if (!codeInput) return;

    try {
      // Mock validation API call
      // await apiClient.post("/api/coupons/validate", { code: codeInput });
      
      // We will simulate success if code is "CAFE10"
      if (codeInput.toUpperCase() === "CAFE10") {
        const d: Discount = { code: "CAFE10", type: "percentage", value: 10 };
        setSelectedPromo(d);
        setCodeInput("");
      } else {
        setError("Invalid or expired coupon code.");
      }
    } catch (err) {
      setError("Failed to validate coupon.");
    }
  };

  const handleApply = () => {
    setAppliedDiscount(selectedPromo);
    onClose();
  };

  const handleRemove = () => {
    setAppliedDiscount(null);
    setSelectedPromo(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-cafe-card w-full max-w-md rounded-2xl shadow-2xl border border-gray-700 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-[#1e1e1e]">
          <div className="flex items-center gap-2 text-white">
            <Tag size={20} className="text-cafe-primary" />
            <h2 className="text-xl font-bold">Apply Discount</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-6">
          
          {/* Manual Input */}
          <div>
            <label className="text-sm text-gray-400 font-medium mb-2 block">Enter Coupon Code</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={codeInput}
                onChange={(e) => { setCodeInput(e.target.value); setError(""); }}
                placeholder="e.g. CAFE10"
                className="flex-1 bg-[#1e1e1e] border border-gray-600 rounded-xl px-4 py-3 text-white uppercase focus:outline-none focus:border-cafe-primary"
              />
              <button 
                onClick={handleValidateCode}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                Apply
              </button>
            </div>
            {error && <p className="text-cafe-danger text-sm mt-2">{error}</p>}
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-700"></div>
            <span className="flex-shrink-0 mx-4 text-gray-500 text-sm">OR</span>
            <div className="flex-grow border-t border-gray-700"></div>
          </div>

          {/* Automated Promos */}
          <div>
            <h3 className="text-sm text-gray-400 font-medium mb-3">Available Promotions</h3>
            <div className="flex flex-col gap-2">
              {AUTOMATED_PROMOS.map(promo => (
                <label 
                  key={promo.code} 
                  className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedPromo?.code === promo.code 
                      ? "bg-cafe-primary/10 border-cafe-primary" 
                      : "bg-[#1e1e1e] border-gray-700 hover:border-gray-500"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedPromo?.code === promo.code ? "border-cafe-primary" : "border-gray-500"
                    }`}>
                      {selectedPromo?.code === promo.code && <div className="w-2.5 h-2.5 bg-cafe-primary rounded-full" />}
                    </div>
                    <div>
                      <span className="text-white font-medium block">
                        {promo.type === "percentage" ? `${promo.value}% Discount` : `$${promo.value} Flat Off`}
                      </span>
                      <span className="text-xs text-gray-400">Code: {promo.code}</span>
                    </div>
                  </div>
                  <Percent size={18} className="text-cafe-primary" />
                </label>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 bg-[#1e1e1e] flex gap-3">
          <button 
            onClick={handleRemove}
            className="flex-1 py-3 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors font-medium"
          >
            Remove
          </button>
          <button 
            onClick={handleApply}
            className="flex-[2] py-3 rounded-xl bg-cafe-primary text-white hover:bg-red-700 transition-colors font-bold shadow-lg"
          >
            Confirm
          </button>
        </div>

      </div>
    </div>
  );
}
