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
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-cafe-card w-full max-w-sm rounded-2xl shadow-2xl border border-gray-700 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 pb-4 flex flex-col items-center justify-center text-center border-b border-gray-700">
          <CheckCircle2 size={48} className="text-green-500 mb-3" />
          <h2 className="text-2xl font-bold text-white">Payment Successful</h2>
          <p className="text-gray-400 mt-1">Order #{orderNumber}</p>
          <p className="text-3xl font-black text-white mt-3">${amount.toFixed(2)}</p>
        </div>

        {/* Actions */}
        <div className="p-6 flex flex-col gap-3">
          <button className="flex items-center justify-center gap-2 w-full py-3 bg-[#1e1e1e] hover:bg-gray-700 text-white rounded-xl font-medium border border-gray-600 transition-colors">
            <Printer size={18} /> Print Receipt
          </button>
          
          {!showEmailInput ? (
            <button 
              onClick={() => setShowEmailInput(true)}
              className="flex items-center justify-center gap-2 w-full py-3 bg-[#1e1e1e] hover:bg-gray-700 text-white rounded-xl font-medium border border-gray-600 transition-colors"
            >
              <Mail size={18} /> Send via Email
            </button>
          ) : (
            <div className="flex flex-col gap-2 p-3 bg-[#1e1e1e] border border-gray-600 rounded-xl animate-in slide-in-from-top-2">
              <label className="text-xs text-gray-400 font-medium">Customer Email</label>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className="flex-1 bg-[#2a2a2a] border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cafe-primary"
                />
                <button 
                  onClick={handleSendEmail}
                  className="bg-cafe-primary hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {sent ? "Sent!" : "Send"}
                </button>
              </div>
            </div>
          )}

          <button 
            onClick={onClose}
            className="mt-2 flex items-center justify-center gap-2 w-full py-3 bg-cafe-primary hover:bg-red-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-cafe-primary/20"
          >
            New Order
          </button>
        </div>
      </div>
    </div>
  );
}
