import { create } from "zustand";
import { CartItem } from "./usePOSStore";

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  customerName?: string;
  amount: number;
  status: "Draft" | "Paid" | "Cancelled";
  items: CartItem[];
  paymentMethod?: string;
  transactionRef?: string;
}

interface OrderState {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
}

// Mock initial data
const MOCK_ORDERS: Order[] = [
  {
    id: "o1",
    orderNumber: "ORD-1001",
    date: new Date(Date.now() - 86400000).toISOString(),
    customerName: "Alice Smith",
    amount: 12.50,
    status: "Paid",
    items: [],
    paymentMethod: "Card"
  },
  {
    id: "o2",
    orderNumber: "ORD-1002",
    date: new Date().toISOString(),
    customerName: "Bob Johnson",
    amount: 8.00,
    status: "Draft",
    items: [
      { product: { id: "p1", name: "Espresso", price: 3.00, category: "Hot Coffee" }, quantity: 1 },
      { product: { id: "p4", name: "Nitro Cold Brew", price: 5.00, category: "Cold Brew" }, quantity: 1 }
    ],
  }
];

export const useOrderStore = create<OrderState>((set) => ({
  orders: MOCK_ORDERS,
  addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
  updateOrder: (id, updates) => set((state) => ({
    orders: state.orders.map(o => o.id === id ? { ...o, ...updates } : o)
  })),
  deleteOrder: (id) => set((state) => ({
    orders: state.orders.filter(o => o.id !== id)
  }))
}));
