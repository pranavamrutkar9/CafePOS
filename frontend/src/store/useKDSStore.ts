import { create } from "zustand";

export interface KDSTicketItem {
  id: string;
  name: string;
  quantity: number;
  isPrepared: boolean;
}

export interface KDSTicket {
  id: string;
  orderNumber: string;
  items: KDSTicketItem[];
  status: "To Cook" | "Preparing" | "Completed";
  createdAt: string;
}

interface KDSState {
  tickets: KDSTicket[];
  addTicket: (ticket: KDSTicket) => void;
  advanceTicketStatus: (ticketId: string) => void;
  toggleItemPrepared: (ticketId: string, itemId: string) => void;
}

export const useKDSStore = create<KDSState>((set) => ({
  tickets: [],
  addTicket: (ticket) => set((state) => ({ tickets: [...state.tickets, ticket] })),
  advanceTicketStatus: (ticketId) => set((state) => ({
    tickets: state.tickets.map((ticket) => {
      if (ticket.id === ticketId) {
        if (ticket.status === "To Cook") return { ...ticket, status: "Preparing" };
        if (ticket.status === "Preparing") return { ...ticket, status: "Completed" };
      }
      return ticket;
    }),
  })),
  toggleItemPrepared: (ticketId, itemId) => set((state) => ({
    tickets: state.tickets.map((ticket) => {
      if (ticket.id === ticketId) {
        return {
          ...ticket,
          items: ticket.items.map((item) =>
            item.id === itemId ? { ...item, isPrepared: !item.isPrepared } : item
          ),
        };
      }
      return ticket;
    }),
  })),
}));
