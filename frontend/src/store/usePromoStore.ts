import { create } from "zustand";

export interface Promotion {
  id: string;
  name: string;
  type: "Coupon" | "Promotion";
  isActive: boolean;
  activeCount: number; // Mock metric for how many times it was used
  
  // Shared
  discountValue: number;
  discountType: "%" | "₹";
  description?: string;

  // Coupon specific
  code?: string;

  // Promotion specific
  applyLevel?: "Product" | "Order";
  minQty?: number;
  minAmount?: number;
}

interface PromoState {
  promotions: Promotion[];
  addPromotion: (promo: Promotion) => void;
  updatePromotion: (id: string, updates: Partial<Promotion>) => void;
  deletePromotion: (id: string) => void;
}

const MOCK_PROMOS: Promotion[] = [
  { 
    id: "promo1", 
    name: "Summer Sale 10% Off", 
    type: "Coupon", 
    isActive: true, 
    activeCount: 45,
    code: "SUMMER10",
    discountValue: 10,
    discountType: "%",
    description: "Applies a 10% discount to the total order."
  },
  { 
    id: "promo2", 
    name: "Buy 3 Get Fixed Discount", 
    type: "Promotion", 
    isActive: true, 
    activeCount: 120,
    applyLevel: "Product",
    minQty: 3,
    discountValue: 50,
    discountType: "₹",
    description: "Reduces total by ₹50 when buying at least 3 items."
  }
];

export const usePromoStore = create<PromoState>((set) => ({
  promotions: MOCK_PROMOS,
  
  addPromotion: (promo) => set((state) => ({ 
    promotions: [...state.promotions, promo] 
  })),
  
  updatePromotion: (id, updates) => set((state) => ({
    promotions: state.promotions.map(p => p.id === id ? { ...p, ...updates } : p)
  })),
  
  deletePromotion: (id) => set((state) => ({
    promotions: state.promotions.filter(p => p.id !== id)
  })),
}));
