import { create } from "zustand";

export interface SelectedTable {
  floorName: string;
  tableNumber: string;
  seats: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  promotion?: number; // Item-level discount percentage
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface Discount {
  code: string;
  type: "percentage" | "fixed";
  value: number; // e.g., 30 for 30%, or 5 for $5
}

interface POSState {
  selectedTable: SelectedTable | null;
  isTableModalOpen: boolean;
  setSelectedTable: (table: SelectedTable | null) => void;
  setTableModalOpen: (isOpen: boolean) => void;

  cart: CartItem[];
  addToCart: (product: Product) => void;
  updateQuantity: (productId: string, delta: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;

  selectedPaymentMethod: string;
  setPaymentMethod: (method: string) => void;
  amountEntered: string;
  setAmountEntered: (amount: string) => void;

  selectedCustomer: Customer | null;
  setSelectedCustomer: (customer: Customer | null) => void;

  appliedDiscount: Discount | null;
  setAppliedDiscount: (discount: Discount | null) => void;
}

export const usePOSStore = create<POSState>((set) => ({
  selectedTable: null,
  isTableModalOpen: false,
  setSelectedTable: (table) => set({ selectedTable: table }),
  setTableModalOpen: (isOpen) => set({ isTableModalOpen: isOpen }),

  cart: [],
  addToCart: (product) => set((state) => {
    const existing = state.cart.find((item) => item.product.id === product.id);
    if (existing) {
      return {
        cart: state.cart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        ),
      };
    }
    return { cart: [...state.cart, { product, quantity: 1 }] };
  }),
  updateQuantity: (productId, delta) => set((state) => {
    return {
      cart: state.cart.map((item) => {
        if (item.product.id === productId) {
          const newQuantity = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter((item) => item.quantity > 0),
    };
  }),
  removeFromCart: (productId) => set((state) => ({
    cart: state.cart.filter((item) => item.product.id !== productId),
  })),
  clearCart: () => set({ cart: [], amountEntered: "", selectedCustomer: null, appliedDiscount: null }),

  selectedPaymentMethod: "Cash",
  setPaymentMethod: (method) => set({ selectedPaymentMethod: method }),
  amountEntered: "",
  setAmountEntered: (amount) => set({ amountEntered: amount }),

  selectedCustomer: null,
  setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),

  appliedDiscount: null,
  setAppliedDiscount: (discount) => set({ appliedDiscount: discount }),
}));

