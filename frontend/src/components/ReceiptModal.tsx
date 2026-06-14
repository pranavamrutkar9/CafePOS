import { useState } from "react";
import { CheckCircle2, Printer, Mail, X } from "lucide-react";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  amount: number;
}

export default function ReceiptModal({ isOpen, onClose, orderNumber, amount }: ReceiptModalProps) {
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const handleSendEmail = () => {
    if (email) {
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setShowEmailInput(false);
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl border border-[#efece7] shadow-2xl flex flex-col overflow-hidden relative before:absolute before:inset-2 before:border before:border-[#fbfaf8] before:rounded-[1.4rem] before:pointer-events-none">
        
        {/* Header */}
        <div className="p-6 pb-4 flex flex-col items-center justify-center text-center border-b border-[#efece7]">
          <CheckCircle2 size={48} className="text-[#557a61] mb-3 animate-bounce" />
          <h2 className="text-2xl font-extrabold text-[#2c2623]">Payment Successful</h2>
          <p className="text-[#8e827b] text-sm font-semibold mt-1">Order #{orderNumber}</p>
          <p className="text-3xl font-black text-[#c86a50] mt-3">${amount.toFixed(2)}</p>
        </div>

        {/* Actions */}
        <div className="p-6 flex flex-col gap-3">
          <button className="flex items-center justify-center gap-2 w-full py-3 bg-[#faf8f5] hover:bg-[#efece7] border border-[#e6e1da] text-[#2c2623] rounded-xl font-bold text-sm transition-colors cursor-pointer">
            <Printer size={18} /> Print Receipt
          </button>
          
          {!showEmailInput ? (
            <button 
              onClick={() => setShowEmailInput(true)}
              className="flex items-center justify-center gap-2 w-full py-3 bg-[#faf8f5] hover:bg-[#efece7] border border-[#e6e1da] text-[#2c2623] rounded-xl font-bold text-sm transition-colors cursor-pointer"
            >
              <Mail size={18} /> Send via Email
            </button>
          ) : (
            <div className="flex flex-col gap-2 p-3 bg-[#faf8f5] border border-[#efece7] rounded-xl animate-in slide-in-from-top-2">
              <label className="text-xs text-[#8e827b] font-bold uppercase tracking-wider">Customer Email</label>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className="flex-1 bg-white border border-[#e6e1da] rounded-lg px-3 py-2 text-sm text-[#2c2623] placeholder-[#a09690] focus:outline-none focus:border-[#c86a50]"
                />
                <button 
                  onClick={handleSendEmail}
                  className="bg-[#557a61] hover:bg-[#43634e] text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  {sent ? "Sent!" : "Send"}
                </button>
              </div>
            </div>
          )}

          <button 
            onClick={onClose}
            className="btn-primary w-full justify-center"
          >
            New Order
          </button>
        </div>
      </div>
    </div>
  );
}
