"use client";

import { useState } from "react";
import { useKDSStore, KDSTicket } from "@/store/useKDSStore";
import { Search, Filter, Clock, CheckCircle2, ChevronRight } from "lucide-react";

export default function KDSPage() {
  const { tickets, advanceTicketStatus, toggleItemPrepared } = useKDSStore();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTickets = tickets.filter(t => t.orderNumber.includes(searchQuery));

  const columns = [
    { id: "To Cook", title: "To Cook", color: "border-cafe-danger", bg: "bg-cafe-danger/10" },
    { id: "Preparing", title: "Preparing", color: "border-cafe-warning", bg: "bg-cafe-warning/10" },
    { id: "Completed", title: "Completed", color: "border-green-500", bg: "bg-green-500/10" },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Top Bar */}
      <div className="bg-cafe-card border border-gray-700 rounded-xl p-4 mb-4 flex items-center justify-between shadow-sm">
        <h1 className="text-2xl font-bold text-cafe-primary flex items-center gap-2">
          Kitchen Display System
        </h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search order #..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 bg-[#1e1e1e] border border-gray-600 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-cafe-primary text-cafe-text"
            />
          </div>
          <button className="flex items-center gap-2 bg-[#1e1e1e] border border-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors text-sm font-medium">
            <Filter size={16} /> Filters
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-hidden">
        {columns.map(col => {
          const colTickets = filteredTickets.filter(t => t.status === col.id);
          return (
            <div key={col.id} className="flex flex-col bg-[#1e1e1e] border border-gray-700 rounded-xl overflow-hidden h-full">
              {/* Column Header */}
              <div className={`p-4 border-b-4 ${col.color} ${col.bg} flex justify-between items-center`}>
                <h2 className="font-bold text-lg">{col.title}</h2>
                <span className="bg-black/40 px-2 py-1 rounded-md text-sm font-medium">{colTickets.length}</span>
              </div>

              {/* Tickets List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {colTickets.length === 0 ? (
                  <div className="text-center text-gray-500 mt-10">No tickets</div>
                ) : (
                  colTickets.map(ticket => {
                    const totalItems = ticket.items.length;
                    const preparedItems = ticket.items.filter(i => i.isPrepared).length;
                    const isAllPrepared = totalItems > 0 && totalItems === preparedItems;
                    
                    const timeAgo = Math.floor((new Date().getTime() - new Date(ticket.createdAt).getTime()) / 60000);

                    return (
                      <div 
                        key={ticket.id} 
                        className={`bg-cafe-card border rounded-xl overflow-hidden shadow-md transition-all ${
                          isAllPrepared ? "border-green-500 shadow-green-500/10" : "border-gray-600 hover:border-cafe-primary/50"
                        }`}
                      >
                        {/* Ticket Header */}
                        <div 
                          className={`p-3 flex justify-between items-center cursor-pointer transition-colors ${
                            isAllPrepared ? "bg-green-500/10" : "bg-[#2a2a2a] hover:bg-gray-700"
                          }`}
                          onClick={() => advanceTicketStatus(ticket.id)}
                        >
                          <div>
                            <span className="font-bold text-lg text-white">#{ticket.orderNumber}</span>
                            <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                              <Clock size={12} /> 
                              {timeAgo === 0 ? "Just now" : `${timeAgo} min ago`}
                            </div>
                          </div>
                          
                          {col.id !== "Completed" && (
                            <div className="flex flex-col items-end">
                              <span className="text-xs text-gray-400 mb-1">{preparedItems}/{totalItems} items</span>
                              <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded ${
                                isAllPrepared ? "bg-green-500 text-white" : "bg-cafe-primary text-white"
                              }`}>
                                {isAllPrepared ? "Ready to Move" : "Advance"} <ChevronRight size={14} />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Ticket Items */}
                        <div className="p-2">
                          {ticket.items.map(item => (
                            <div 
                              key={item.id}
                              onClick={() => toggleItemPrepared(ticket.id, item.id)}
                              className={`flex justify-between items-center p-2 rounded-lg cursor-pointer transition-colors mb-1 ${
                                item.isPrepared 
                                  ? "bg-green-500/5 text-gray-500" 
                                  : "bg-[#1e1e1e] hover:bg-[#2a2a2a] text-gray-200"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className={`font-bold w-6 text-center ${item.isPrepared ? "text-gray-600" : "text-cafe-primary"}`}>
                                  {item.quantity}x
                                </span>
                                <span className={`font-medium ${item.isPrepared ? "line-through" : ""}`}>
                                  {item.name}
                                </span>
                              </div>
                              {item.isPrepared && <CheckCircle2 size={16} className="text-green-500" />}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
