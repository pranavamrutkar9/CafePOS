import { create } from "zustand";

export interface PaymentMethod {
  id: string;
  name: string;
  type: "Cash" | "Card" | "UPI";
  upiId?: string;
  isActive: boolean;
}

interface PaymentState {
  paymentMethods: PaymentMethod[];
  addPaymentMethod: (pm: PaymentMethod) => void;
  updatePaymentMethod: (id: string, updates: Partial<PaymentMethod>) => void;
  deletePaymentMethod: (id: string) => void;
  reorderPaymentMethods: (newOrder: PaymentMethod[]) => void;
}

const MOCK_PAYMENTS: PaymentMethod[] = [
  { id: "pm1", name: "Cash on Delivery", type: "Cash", isActive: true },
  { id: "pm2", name: "Credit/Debit Card", type: "Card", isActive: true },
  { id: "pm3", name: "Google Pay", type: "UPI", upiId: "cafe@upi", isActive: true },
];

export const usePaymentStore = create<PaymentState>((set) => ({
  paymentMethods: MOCK_PAYMENTS,
  
  addPaymentMethod: (pm) => set((state) => ({ 
    paymentMethods: [...state.paymentMethods, pm] 
  })),
  
  updatePaymentMethod: (id, updates) => set((state) => ({
    paymentMethods: state.paymentMethods.map(p => p.id === id ? { ...p, ...updates } : p)
  })),
  
  deletePaymentMethod: (id) => set((state) => ({
    paymentMethods: state.paymentMethods.filter(p => p.id !== id)
  })),

  reorderPaymentMethods: (newOrder) => set(() => ({
    paymentMethods: newOrder
  }))
}));
