import { create } from "zustand";

export interface CartItem {
  id: string; // matches product id
  productId: string;
  name: string;
  price: number;
  qty: number;
  lineTotal: number;
  lineDiscount: number;
  discountLabel: string | null;
  sentToKitchenAlready: boolean;
}

interface CartState {
  orderId: string | null;
  order: any | null;
  cart: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  setOrder: (order: any) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  orderId: null,
  order: null,
  cart: [],
  subtotal: 0,
  tax: 0,
  discount: 0,
  total: 0,
  setOrder: (order) => {
    if (!order) {
      set({
        orderId: null,
        order: null,
        cart: [],
        subtotal: 0,
        tax: 0,
        discount: 0,
        total: 0
      });
      return;
    }
    
    // Map items from backend Order structure to CartItem structure
    const cartItems = (order.items || []).map((item: any) => ({
      id: item.productId,
      productId: item.productId,
      name: item.product?.name || item.name || "Unknown Product",
      price: item.unitPrice || item.price || 0,
      qty: item.qty || item.quantity || 1,
      lineTotal: item.lineTotal || (item.qty || 1) * (item.unitPrice || 0),
      lineDiscount: item.lineDiscount || 0,
      discountLabel: item.discountLabel || null,
      sentToKitchenAlready: !!item.sentToKitchenAt
    }));

    set({
      orderId: order.id,
      order: order,
      cart: cartItems,
      subtotal: order.subtotal || 0,
      tax: order.tax || 0,
      discount: order.discount || 0,
      total: order.total || 0
    });
  },
  clear: () => set({
    orderId: null,
    order: null,
    cart: [],
    subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0
  }),
}));
