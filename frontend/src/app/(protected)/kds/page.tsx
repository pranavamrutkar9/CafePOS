"use client";

import { useState } from "react";
import { useKDSStore, KDSTicket } from "@/store/useKDSStore";
import { Search, Filter, Clock, CheckCircle2, ChevronRight } from "lucide-react";

export default function KDSPage() {
  const { tickets, advanceTicketStatus, toggleItemPrepared } = useKDSStore();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTickets = tickets.filter(t => t.orderNumber.includes(searchQuery));

  const columns = [
    { id: "To Cook", title: "To Cook", color: "border-[#d3524b]", bg: "bg-[#d3524b]/5 text-[#d3524b]" },
    { id: "Preparing", title: "Preparing", color: "border-[#d99c4c]", bg: "bg-[#d99c4c]/5 text-[#ad742b]" },
    { id: "Completed", title: "Completed", color: "border-[#557a61]", bg: "bg-[#557a61]/5 text-[#43634e]" },
  ];

  return (
    <div className="h-full flex flex-col text-[#2c2623] bg-[#faf8f5]">
      {/* Top Bar */}
      <div className="bg-white border border-[#efece7] rounded-2xl p-4 mb-4 flex items-center justify-between shadow-sm">
        <h1 className="text-xl font-black text-[#2c2623] flex items-center gap-2">
          Kitchen Display System
        </h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8e827b]" size={16} />
            <input 
              type="text" 
              placeholder="Search order #..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 bg-[#faf8f5] border border-[#e6e1da] rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-[#c86a50] text-[#2c2623] placeholder-[#a09690]"
            />
          </div>
          <button className="flex items-center gap-2 bg-[#faf8f5] border border-[#e6e1da] hover:bg-[#efece7] px-4 py-2 rounded-xl transition-colors text-xs font-bold cursor-pointer">
            <Filter size={14} /> Filters
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-hidden">
        {columns.map(col => {
          const colTickets = filteredTickets.filter(t => t.status === col.id);
          return (
            <div key={col.id} className="flex flex-col bg-white border border-[#efece7] rounded-2xl overflow-hidden h-full shadow-sm">
              {/* Column Header */}
              <div className={`p-4 border-b-2 ${col.color} ${col.bg} flex justify-between items-center`}>
                <h2 className="font-extrabold text-sm uppercase tracking-wider">{col.title}</h2>
                <span className="bg-white px-2 py-0.5 rounded-full text-xs font-bold border border-[#efece7] shadow-sm">{colTickets.length}</span>
              </div>

              {/* Tickets List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white organic-scrollbar">
                {colTickets.length === 0 ? (
                  <div className="text-center text-[#8e827b] text-sm mt-10 font-medium">No tickets</div>
                ) : (
                  colTickets.map(ticket => {
                    const totalItems = ticket.items.length;
                    const preparedItems = ticket.items.filter(i => i.isPrepared).length;
                    const isAllPrepared = totalItems > 0 && totalItems === preparedItems;
                    
                    const timeAgo = Math.floor((new Date().getTime() - new Date(ticket.createdAt).getTime()) / 60000);

                    return (
                      <div 
                        key={ticket.id} 
                        className={`bg-[#faf8f5] border rounded-2xl overflow-hidden shadow-sm transition-all ${
                          isAllPrepared ? "border-[#557a61]" : "border-[#efece7] hover:border-[#c86a50]/40"
                        }`}
                      >
                        {/* Ticket Header */}
                        <div 
                          className={`p-3 flex justify-between items-center cursor-pointer transition-colors ${
                            isAllPrepared ? "bg-[#557a61]/5" : "bg-white border-b border-[#efece7] hover:bg-[#faf8f5]"
                          }`}
                          onClick={() => advanceTicketStatus(ticket.id)}
                        >
                          <div>
                            <span className="font-extrabold text-base text-[#2c2623]">#{ticket.orderNumber}</span>
                            <div className="flex items-center gap-1 text-[11px] text-[#8e827b] mt-0.5 font-medium">
                              <Clock size={12} /> 
                              {timeAgo === 0 ? "Just now" : `${timeAgo} min ago`}
                            </div>
                          </div>
                          
                          {col.id !== "Completed" && (
                            <div className="flex flex-col items-end">
                              <span className="text-[10px] text-[#8e827b] font-bold mb-0.5">{preparedItems}/{totalItems} items</span>
                              <div className={`flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                isAllPrepared ? "bg-[#557a61] text-white border-[#557a61]" : "bg-white text-[#c86a50] border-[#c86a50]/30 hover:bg-[#c86a50]/5"
                              }`}>
                                {isAllPrepared ? "Ready" : "Advance"} <ChevronRight size={12} />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Ticket Items */}
                        <div className="p-2 space-y-1 bg-[#faf8f5]">
                          {ticket.items.map(item => (
                            <div 
                              key={item.id}
                              onClick={() => toggleItemPrepared(ticket.id, item.id)}
                              className={`flex justify-between items-center p-2 rounded-xl cursor-pointer transition-colors ${
                                item.isPrepared 
                                  ? "bg-[#efece7] text-[#8e827b] opacity-80" 
                                  : "bg-white border border-[#efece7] hover:border-[#c86a50]/30 text-[#2c2623]"
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span className={`font-extrabold text-xs w-5 text-center ${item.isPrepared ? "text-[#8e827b]" : "text-[#c86a50]"}`}>
                                  {item.quantity}x
                                </span>
                                <span className={`font-semibold text-xs ${item.isPrepared ? "line-through" : ""}`}>
                                  {item.name}
                                </span>
                              </div>
                              {item.isPrepared && <CheckCircle2 size={15} className="text-[#557a61]" />}
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
