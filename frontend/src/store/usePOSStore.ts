import { create } from "zustand";

export interface SelectedTable {
  floorName: string;
  tableNumber: string;
  seats: number;
}

interface POSState {
  selectedTable: SelectedTable | null;
  isTableModalOpen: boolean;
  setSelectedTable: (table: SelectedTable | null) => void;
  setTableModalOpen: (isOpen: boolean) => void;
}

export const usePOSStore = create<POSState>((set) => ({
  selectedTable: null,
  isTableModalOpen: false,
  setSelectedTable: (table) => set({ selectedTable: table }),
  setTableModalOpen: (isOpen) => set({ isTableModalOpen: isOpen }),
}));
