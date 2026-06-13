import { create } from "zustand";

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface InventoryProduct {
  id: string;
  name: string;
  categories: string[]; // Array of Category names/IDs
  price: number;
  tax: "5%" | "18%" | "28%";
  unit: string;
  description: string;
  status: "Active" | "Draft" | "Archived";
}

interface InventoryState {
  categories: Category[];
  products: InventoryProduct[];
  addCategory: (cat: Category) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addProduct: (prod: InventoryProduct) => void;
  updateProduct: (id: string, updates: Partial<InventoryProduct>) => void;
  deleteProducts: (ids: string[]) => void;
  archiveProducts: (ids: string[]) => void;
}

const MOCK_CATEGORIES: Category[] = [
  { id: "c1", name: "Hot Coffee", color: "#8B4513" },
  { id: "c2", name: "Cold Brew", color: "#1E90FF" },
  { id: "c3", name: "Pastries", color: "#F4A460" },
  { id: "c4", name: "Sandwiches", color: "#32CD32" },
];

const MOCK_PRODUCTS: InventoryProduct[] = [
  { id: "p1", name: "Espresso", categories: ["Hot Coffee"], price: 3.00, tax: "5%", unit: "Cup", description: "Strong and bold espresso shot.", status: "Active" },
  { id: "p2", name: "Latte", categories: ["Hot Coffee"], price: 4.50, tax: "5%", unit: "Cup", description: "Espresso with steamed milk.", status: "Active" },
  { id: "p3", name: "Turkey Club", categories: ["Sandwiches"], price: 8.50, tax: "5%", unit: "Piece", description: "Turkey, bacon, lettuce, and tomato.", status: "Active" },
];

export const useInventoryStore = create<InventoryState>((set) => ({
  categories: MOCK_CATEGORIES,
  products: MOCK_PRODUCTS,
  
  addCategory: (cat) => set((state) => ({ categories: [...state.categories, cat] })),
  
  updateCategory: (id, updates) => set((state) => ({
    categories: state.categories.map(c => c.id === id ? { ...c, ...updates } : c)
  })),

  deleteCategory: (id) => set((state) => ({
    categories: state.categories.filter(c => c.id !== id)
  })),
  
  addProduct: (prod) => set((state) => ({ products: [prod, ...state.products] })),
  
  updateProduct: (id, updates) => set((state) => ({
    products: state.products.map(p => p.id === id ? { ...p, ...updates } : p)
  })),
  
  deleteProducts: (ids) => set((state) => ({
    products: state.products.filter(p => !ids.includes(p.id))
  })),
  
  archiveProducts: (ids) => set((state) => ({
    products: state.products.map(p => ids.includes(p.id) ? { ...p, status: "Archived" } : p)
  }))
}));
