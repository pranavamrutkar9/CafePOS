"use client";

import { useState, useEffect } from "react";
import { Search, ChevronDown, CheckCircle2, CircleDashed, Flame } from "lucide-react";
import { LoadMeter } from "@/components/kds/LoadMeter";
import api from "@/api/axios";
import toast from "react-hot-toast";

export default function KitchenDisplayPage() {
  const [tickets, setTickets] = useState<any[]>([]);

  const fetchTickets = async () => {
    try {
      const res = await api.get("/kitchen/tickets");
      if (res.data && Array.isArray(res.data.data)) {
        setTickets(res.data.data);
      }
    } catch (e) {
      // Mock fallback
      setTickets([
        {
          id: "1042",
          status: "TO_COOK",
          time: "12:45",
          items: [
            { id: 1, name: "Cappuccino", qty: 2, completed: false },
            { id: 2, name: "Club Sandwich", qty: 1, completed: false }
          ]
        },
        {
          id: "1043",
          status: "PREPARING",
          time: "12:48",
          items: [
            { id: 3, name: "Latte", qty: 1, completed: true },
            { id: 4, name: "Chocolate Cake", qty: 1, completed: false }
          ]
        }
      ]);
    }
  };

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(() => {
      fetchTickets();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleItem = async (ticketId: string, itemId: number) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    const item = ticket.items.find((i: any) => i.id === itemId);
    if (!item) return;

    try {
      await api.patch(`/kitchen/tickets/${ticketId}/items/${itemId}`, { completed: !item.completed });
      fetchTickets(); // Re-fetch or optimistically update
    } catch (e) {
      // Optimistic update for mock
      setTickets(tickets.map(t => {
        if (t.id === ticketId) {
          return {
            ...t,
            items: t.items.map((i: any) => i.id === itemId ? { ...i, completed: !i.completed } : i)
          };
        }
        return t;
      }));
    }
  };

  const advanceTicket = async (ticketId: string) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    let nextStatus = ticket.status;
    if (ticket.status === "TO_COOK") nextStatus = "PREPARING";
    else if (ticket.status === "PREPARING") nextStatus = "COMPLETED";

    if (nextStatus !== ticket.status) {
      try {
        await api.patch(`/kitchen/tickets/${ticketId}`, { status: nextStatus });
        fetchTickets();
      } catch (e) {
        // Optimistic update for mock
        setTickets(tickets.map(t => t.id === ticketId ? { ...t, status: nextStatus } : t));
      }
    }
  };

  const toCook = tickets.filter(t => t.status === "TO_COOK");
  const preparing = tickets.filter(t => t.status === "PREPARING");
  const completed = tickets.filter(t => t.status === "COMPLETED");

  const KanbanColumn = ({ title, ticketsList, icon: Icon, color }: any) => (
    <div className="flex-1 flex flex-col min-w-0 bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
      <div className={`p-4 border-b border-gray-800 flex justify-between items-center bg-gray-950`}>
        <h2 className={`font-bold text-lg flex items-center gap-2 ${color}`}>
          <Icon size={20} />
          {title}
        </h2>
        <span className="bg-gray-800 text-gray-400 px-3 py-1 rounded-full text-sm font-bold">{ticketsList.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {ticketsList.map((ticket: any) => (
          <div key={ticket.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-lg">
            <div 
              className={`p-3 border-b border-gray-700 flex justify-between items-center cursor-pointer hover:bg-gray-700 transition-colors ${ticket.status === 'COMPLETED' ? 'bg-green-900/30' : ''}`}
              onClick={() => advanceTicket(ticket.id)}
            >
              <h3 className="text-xl font-black text-white">#{ticket.id}</h3>
              <span className="text-gray-400 font-medium">{ticket.time}</span>
            </div>
            <div className="p-2">
              {ticket.items.map((item: any) => (
                <div 
                  key={item.id} 
                  className="flex items-center gap-3 p-3 hover:bg-gray-700/50 rounded-lg cursor-pointer transition-colors group"
                  onClick={() => toggleItem(ticket.id, item.id)}
                >
                  <button className={`shrink-0 ${item.completed ? 'text-green-500' : 'text-gray-500 group-hover:text-gray-400'}`}>
                    {item.completed ? <CheckCircle2 size={24} /> : <CircleDashed size={24} />}
                  </button>
                  <div className="flex-1 flex justify-between items-center">
                    <span className={`font-medium text-lg ${item.completed ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                      {item.name}
                    </span>
                    <span className={`font-bold text-lg ${item.completed ? 'text-gray-500' : 'text-cafe-primary'}`}>
                      x{item.qty}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-black text-gray-200 font-sans">
      {/* Top Bar - Inverse colors for KDS to reduce glare */}
      <header className="h-16 bg-gray-950 border-b border-gray-800 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-cafe-primary rounded-lg text-white flex items-center justify-center font-bold text-xl">
            O
          </div>
          <div>
            <h1 className="font-bold text-xl text-white">Kitchen Display</h1>
            <p className="text-xs text-gray-500">Real-time Order Sync</p>
          </div>
          <LoadMeter />
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input 
              type="text" 
              placeholder="Search ticket..." 
              className="w-64 bg-gray-900 border border-gray-800 text-gray-200 rounded-full py-2 pl-10 pr-4 focus:ring-2 focus:ring-cafe-primary focus:outline-none"
            />
          </div>
          <div className="relative">
            <select className="appearance-none bg-gray-900 border border-gray-800 text-gray-200 py-2 pl-4 pr-10 rounded-full focus:outline-none focus:ring-2 focus:ring-cafe-primary">
              <option>All Categories</option>
              <option>Beverages</option>
              <option>Food</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          </div>
        </div>
      </header>

      {/* Kanban Board */}
      <main className="flex-1 p-6 flex gap-6 overflow-hidden">
        <KanbanColumn title="To Cook" ticketsList={toCook} icon={Flame} color="text-red-500" />
        <KanbanColumn title="Preparing" ticketsList={preparing} icon={CircleDashed} color="text-amber-500" />
        <KanbanColumn title="Completed" ticketsList={completed} icon={CheckCircle2} color="text-green-500" />
      </main>
    </div>
  );
}
