"use client";

import { useEffect, useState } from "react";
import { usePOSStore, Product } from "@/store/usePOSStore";
import { useKDSStore } from "@/store/useKDSStore";
import { useOrderStore } from "@/store/useOrderStore";
import { apiClient } from "@/lib/apiClient";
import { Minus, Plus, Trash2, Tag, User, Send, CheckCircle2, QrCode, CreditCard as CardIcon, Banknote, ShoppingCart, Percent } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import ReceiptModal from "@/components/ReceiptModal";
import CustomerSelectionModal from "@/components/pos/CustomerSelectionModal";
import DiscountModal from "@/components/pos/DiscountModal";

const MOCK_CATEGORIES = ["All", "Hot Coffee", "Cold Brew", "Pastries", "Sandwiches"];

const MOCK_PRODUCTS: Product[] = [
  { id: "p1", name: "Espresso", price: 3.00, category: "Hot Coffee" },
  { id: "p2", name: "Latte", price: 4.50, category: "Hot Coffee" },
  { id: "p3", name: "Cappuccino", price: 4.00, category: "Hot Coffee", promotion: 10 },
  { id: "p4", name: "Nitro Cold Brew", price: 5.00, category: "Cold Brew" },
  { id: "p5", name: "Iced Caramel Macchiato", price: 5.50, category: "Cold Brew" },
  { id: "p6", name: "Butter Croissant", price: 3.50, category: "Pastries" },
  { id: "p7", name: "Blueberry Muffin", price: 3.00, category: "Pastries" },
  { id: "p8", name: "Turkey Club", price: 8.50, category: "Sandwiches", promotion: 15 },
  { id: "p9", name: "Veggie Panini", price: 7.50, category: "Sandwiches" },
];

export default function POSPage() {
  const { 
    selectedTable, 
    setTableModalOpen, 
    cart, 
    addToCart, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    selectedPaymentMethod,
    setPaymentMethod,
    amountEntered,
    setAmountEntered,
    selectedCustomer,
    appliedDiscount
  } = usePOSStore();
  
  const { addTicket } = useKDSStore();
  const { addOrder } = useOrderStore();

  const [activeCategory, setActiveCategory] = useState("All");
  const [toastMessage, setToastMessage] = useState("");
  const [txRef, setTxRef] = useState("");
  
  const [receiptData, setReceiptData] = useState<{isOpen: boolean, orderNumber: string, amount: number}>({ isOpen: false, orderNumber: "", amount: 0 });
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [discountModalOpen, setDiscountModalOpen] = useState(false);

  useEffect(() => {
    if (!selectedTable) {
      setTableModalOpen(true);
    }
  }, [selectedTable, setTableModalOpen]);

  const filteredProducts = activeCategory === "All" 
    ? MOCK_PRODUCTS 
    : MOCK_PRODUCTS.filter(p => p.category === activeCategory);

  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  
  const itemDiscountTotal = cart.reduce((sum, item) => {
    if (item.product.promotion) {
      return sum + ((item.product.price * (item.product.promotion / 100)) * item.quantity);
    }
    return sum;
  }, 0);

  let globalDiscountAmount = 0;
  if (appliedDiscount) {
    if (appliedDiscount.type === "percentage") {
      globalDiscountAmount = (subtotal - itemDiscountTotal) * (appliedDiscount.value / 100);
    } else {
      globalDiscountAmount = appliedDiscount.value;
    }
  }

  const totalDiscounts = itemDiscountTotal + globalDiscountAmount;
  const taxableAmount = Math.max(0, subtotal - totalDiscounts);
  const tax = taxableAmount * 0.05; // 5% GST
  const total = taxableAmount + tax;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleNumpadClick = (val: string) => {
    if (val === "C") setAmountEntered("");
    else if (val === "Del") setAmountEntered(amountEntered.slice(0, -1));
    else setAmountEntered(amountEntered + val);
  };

  const handleSendToKitchen = async () => {
    if (cart.length === 0) return;
    
    const ticketId = Math.random().toString(36).substring(7);
    const orderNumber = Math.floor(1000 + Math.random() * 9000).toString();
    
    addTicket({
      id: ticketId,
      orderNumber,
      status: "To Cook",
      createdAt: new Date().toISOString(),
      items: cart.map(item => ({
        id: Math.random().toString(36).substring(7),
        name: item.product.name,
        quantity: item.quantity,
        isPrepared: false
      }))
    });

    clearCart();
    showToast("Sent to Kitchen Successfully!");
  };

  const handlePaymentConfirm = () => {
    if (cart.length === 0) return;

    const orderNumber = "ORD-" + Math.floor(1000 + Math.random() * 9000);
    
    addOrder({
      id: Math.random().toString(36).substring(7),
      orderNumber,
      date: new Date().toISOString(),
      customerName: selectedCustomer?.name,
      amount: total,
      status: "Paid",
      items: [...cart],
      paymentMethod: selectedPaymentMethod,
      transactionRef: txRef || undefined
    });

    setReceiptData({ isOpen: true, orderNumber, amount: total });
  };

  const closeReceipt = () => {
    setReceiptData({ isOpen: false, orderNumber: "", amount: 0 });
    clearCart();
    setTxRef("");
  };

  const amountReceived = parseFloat(amountEntered || "0");
  const changeDue = amountReceived > total ? amountReceived - total : 0;
  const isCashValid = amountReceived >= total;

  return (
    <div className="h-full flex flex-col relative text-[#2c2623]">
      <ReceiptModal 
        isOpen={receiptData.isOpen} 
        onClose={closeReceipt} 
        orderNumber={receiptData.orderNumber}
        amount={receiptData.amount}
      />
      <CustomerSelectionModal isOpen={customerModalOpen} onClose={() => setCustomerModalOpen(false)} />
      <DiscountModal isOpen={discountModalOpen} onClose={() => setDiscountModalOpen(false)} />

      {toastMessage && (
        <div className="absolute top-4 left-1/2 -translate-y-1/2 z-50 bg-[#557a61] text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-4 border border-[#557a61]/20">
          <CheckCircle2 size={20} />
          <span className="font-semibold text-sm">{toastMessage}</span>
        </div>
      )}

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 h-full overflow-hidden">
        
        {/* LEFT COLUMN: Products (col-span-5) */}
        <div className="lg:col-span-5 flex flex-col bg-white rounded-2xl border border-[#efece7] overflow-hidden shadow-sm h-full">
          <div className="flex overflow-x-auto no-scrollbar p-3 border-b border-[#efece7] gap-2 bg-[#faf8f5]">
            {MOCK_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat 
                    ? "bg-[#c86a50] text-white shadow-sm" 
                    : "bg-white text-[#8e827b] border border-[#e6e1da] hover:bg-[#faf8f5] hover:text-[#2c2623]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 gap-3 bg-white organic-scrollbar">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white border border-[#efece7] hover:border-[#c86a50]/40 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 transition-all hover:shadow-md hover:-translate-y-0.5 group active:scale-95 shadow-sm relative overflow-hidden cursor-pointer min-h-[110px]"
              >
                <span className="font-bold text-[#2c2623] group-hover:text-[#c86a50] line-clamp-2 text-sm transition-colors">{product.name}</span>
                <span className="text-[#c86a50] font-extrabold text-sm">${product.price.toFixed(2)}</span>
                {product.promotion && (
                  <span className="text-[9px] font-bold bg-[#d3524b]/8 text-[#d3524b] border border-[#d3524b]/15 px-2 py-0.5 rounded-full absolute top-2 right-2">
                    -{product.promotion}%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* CENTER COLUMN: Cart (col-span-4) */}
        <div className="lg:col-span-4 flex flex-col bg-white rounded-2xl border border-[#efece7] overflow-hidden shadow-sm h-full">
          <div className="p-4 border-b border-[#efece7] bg-[#faf8f5] flex justify-between items-center">
            <h2 className="font-extrabold text-lg text-[#2c2623]">Current Order</h2>
            {selectedTable && (
              <span className="text-xs bg-[#c86a50]/8 text-[#c86a50] border border-[#c86a50]/15 px-3 py-1 rounded-full font-bold">
                {selectedTable.floorName} - T{selectedTable.tableNumber}
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 bg-white organic-scrollbar">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-[#8e827b] opacity-60">
                <ShoppingCart size={40} className="mb-3 text-[#e6e1da]" />
                <p className="text-sm font-semibold">Cart is empty</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {cart.map(item => {
                  const lineTotal = item.product.price * item.quantity;
                  const itemDiscount = item.product.promotion ? (lineTotal * (item.product.promotion / 100)) : 0;
                  
                  return (
                    <div key={item.product.id} className="bg-[#faf8f5] border border-[#efece7] rounded-xl p-3 flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-bold text-sm text-[#2c2623] line-clamp-1">{item.product.name}</p>
                          <p className="text-xs text-[#8e827b] font-medium">${item.product.price.toFixed(2)} / ea</p>
                        </div>
                        <p className="font-extrabold text-[#c86a50] text-sm">${(lineTotal - itemDiscount).toFixed(2)}</p>
                      </div>
                      
                      {item.product.promotion && (
                        <div className="flex items-center gap-1 text-[11px] text-[#ad742b] font-semibold">
                          <Tag size={12} />
                          <span>{item.product.promotion}% Off (-${itemDiscount.toFixed(2)})</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center mt-1">
                        <button onClick={() => removeFromCart(item.product.id)} className="text-[#8e827b] hover:text-[#d3524b] hover:bg-[#d3524b]/5 p-1.5 rounded-lg transition-colors cursor-pointer">
                          <Trash2 size={15} />
                        </button>
                        <div className="flex items-center gap-2 bg-white rounded-lg p-0.5 border border-[#e6e1da]">
                          <button onClick={() => updateQuantity(item.product.id, -1)} className="w-8 h-8 flex items-center justify-center text-[#2c2623] hover:bg-[#faf8f5] rounded-md cursor-pointer transition-colors">
                            <Minus size={14} />
                          </button>
                          <span className="w-4 text-center font-extrabold text-xs text-[#2c2623]">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, 1)} className="w-8 h-8 flex items-center justify-center text-[#2c2623] hover:bg-[#faf8f5] rounded-md cursor-pointer transition-colors">
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-[#faf8f5] border-t border-[#efece7] p-4 pb-2 flex flex-col gap-2">
            <div className="flex justify-between text-xs font-semibold text-[#8e827b]">
              <span>Subtotal</span>
              <span className="text-[#2c2623]">${subtotal.toFixed(2)}</span>
            </div>
            {totalDiscounts > 0 && (
              <div className="flex justify-between text-xs font-semibold text-[#ad742b]">
                <div className="flex items-center gap-1">
                  <span>Discount</span>
                  {appliedDiscount && (
                    <span className="text-[10px] bg-[#d99c4c]/10 border border-[#d99c4c]/15 px-1.5 py-0.5 rounded-md font-bold">
                      ({appliedDiscount.code})
                    </span>
                  )}
                </div>
                <span>-${totalDiscounts.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs font-semibold text-[#8e827b]">
              <span>Tax (5%)</span>
              <span className="text-[#2c2623]">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-black text-[#2c2623] pt-2 border-t border-[#efece7] mt-1">
              <span>Total</span>
              <span className="text-[#c86a50]">${total.toFixed(2)}</span>
            </div>
            
            {selectedCustomer && (
              <div className="flex justify-between items-center bg-[#c86a50]/5 p-2 rounded-lg mt-1 border border-[#c86a50]/15">
                <span className="text-xs font-bold text-[#8e827b]">Customer: <span className="text-[#2c2623]">{selectedCustomer.name}</span></span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 mt-2">
              <button 
                onClick={() => setCustomerModalOpen(true)}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all border cursor-pointer ${
                  selectedCustomer 
                    ? 'bg-[#c86a50]/8 border-[#c86a50] text-[#c86a50]' 
                    : 'bg-white hover:bg-[#faf8f5] text-[#2c2623] border-[#e6e1da]'
                }`}
              >
                <User size={15} /> {selectedCustomer ? "Change Cust" : "Customer"}
              </button>
              <button 
                onClick={() => setDiscountModalOpen(true)}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all border cursor-pointer ${
                  appliedDiscount 
                    ? 'bg-[#d99c4c]/8 border-[#d99c4c] text-[#ad742b]' 
                    : 'bg-white hover:bg-[#faf8f5] text-[#2c2623] border-[#e6e1da]'
                }`}
              >
                <Tag size={15} /> {appliedDiscount ? "Discounted" : "Discount"}
              </button>
              <button className="flex items-center justify-center gap-2 bg-white hover:bg-[#faf8f5] text-[#2c2623] py-2.5 rounded-xl font-bold text-xs border border-[#e6e1da] transition-all cursor-pointer">
                Receipt
              </button>
              <button 
                onClick={handleSendToKitchen}
                disabled={cart.length === 0}
                className="flex items-center justify-center gap-2 bg-[#c86a50] hover:bg-[#b3563d] text-white py-2.5 rounded-xl font-bold text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm cursor-pointer"
              >
                <Send size={15} /> Send KDS
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Payment (col-span-3) */}
        <div className="lg:col-span-3 flex flex-col bg-white rounded-2xl border border-[#efece7] overflow-hidden shadow-sm h-full">
          <div className="bg-[#faf8f5] p-5 text-center border-b border-[#efece7] flex flex-col justify-center gap-1.5">
            <p className="text-[#8e827b] text-xs uppercase tracking-wider font-extrabold">Amount to Pay</p>
            <h1 className="text-4xl font-black text-[#c86a50] tracking-tight">${total.toFixed(2)}</h1>
          </div>

          <div className="grid grid-cols-3 gap-2 p-3 bg-white border-b border-[#efece7]">
            <button 
              onClick={() => setPaymentMethod("Cash")} 
              className={`py-3 rounded-xl font-extrabold text-xs transition-all border flex flex-col items-center gap-1 cursor-pointer ${
                selectedPaymentMethod === "Cash" 
                  ? "bg-[#c86a50] text-white border-[#c86a50] shadow-sm" 
                  : "bg-[#faf8f5] text-[#2c2623] border-[#e6e1da] hover:border-[#8e827b]"
              }`}
            >
              <Banknote size={18} /> Cash
            </button>
            <button 
              onClick={() => setPaymentMethod("UPI")} 
              className={`py-3 rounded-xl font-extrabold text-xs transition-all border flex flex-col items-center gap-1 cursor-pointer ${
                selectedPaymentMethod === "UPI" 
                  ? "bg-[#c86a50] text-white border-[#c86a50] shadow-sm" 
                  : "bg-[#faf8f5] text-[#2c2623] border-[#e6e1da] hover:border-[#8e827b]"
              }`}
            >
              <QrCode size={18} /> UPI
            </button>
            <button 
              onClick={() => setPaymentMethod("Card")} 
              className={`py-3 rounded-xl font-extrabold text-xs transition-all border flex flex-col items-center gap-1 cursor-pointer ${
                selectedPaymentMethod === "Card" 
                  ? "bg-[#c86a50] text-white border-[#c86a50] shadow-sm" 
                  : "bg-[#faf8f5] text-[#2c2623] border-[#e6e1da] hover:border-[#8e827b]"
              }`}
            >
              <CardIcon size={18} /> Card
            </button>
          </div>

          <div className="flex-1 px-4 py-4 overflow-hidden flex flex-col bg-white">
            {selectedPaymentMethod === "Cash" && (
              <>
                <div className="w-full bg-[#faf8f5] border border-[#efece7] rounded-xl p-3 mb-2 flex flex-col items-end justify-center">
                  <span className="text-[10px] text-[#8e827b] uppercase font-bold">Received</span>
                  <span className={`text-xl font-mono font-bold ${amountEntered ? "text-[#2c2623]" : "text-[#a09690]"}`}>
                    {amountEntered ? `$${amountEntered}` : "$0.00"}
                  </span>
                </div>
                <div className="w-full bg-[#faf8f5] border border-[#efece7] rounded-xl p-3 mb-3 flex flex-col items-end justify-center">
                  <span className="text-[10px] text-[#8e827b] uppercase font-bold">Change Due</span>
                  <span className={`text-xl font-mono font-bold ${changeDue > 0 ? "text-[#557a61]" : "text-[#a09690]"}`}>
                    ${changeDue.toFixed(2)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 flex-1 mb-2">
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "00", "."].map(num => (
                    <button key={num} onClick={() => handleNumpadClick(num)} className="bg-white hover:bg-[#faf8f5] rounded-xl text-base font-bold text-[#2c2623] border border-[#efece7] shadow-sm transition-colors active:scale-95 flex items-center justify-center min-h-[36px] cursor-pointer">
                      {num}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 h-11 mb-3 shrink-0">
                  <button onClick={() => handleNumpadClick("C")} className="bg-[#faf8f5] hover:bg-[#efece7] border border-[#e6e1da] text-[#2c2623] rounded-xl font-bold text-xs transition-colors active:scale-95 cursor-pointer">Clear</button>
                  <button onClick={() => handleNumpadClick("Del")} className="bg-[#d3524b]/8 border border-[#d3524b]/15 hover:bg-[#d3524b]/15 text-[#d3524b] rounded-xl font-bold text-xs transition-colors active:scale-95 cursor-pointer">Del</button>
                </div>
                <button 
                  onClick={handlePaymentConfirm} 
                  disabled={!isCashValid || cart.length === 0} 
                  className="w-full bg-[#557a61] hover:bg-[#43634e] disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold text-sm py-3 rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer"
                >
                  Confirm (Cash)
                </button>
              </>
            )}

            {selectedPaymentMethod === "UPI" && (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="bg-white p-3 rounded-xl border border-[#efece7] shadow-sm">
                  <QRCodeCanvas value={`upi://pay?pa=cafepos@bank&pn=CafePOS&am=${total.toFixed(2)}`} size={150} />
                </div>
                <div className="text-center">
                  <p className="text-xs text-[#8e827b] mb-0.5 font-bold uppercase tracking-wider">Scan to pay</p>
                  <p className="text-xl font-extrabold text-[#c86a50]">${total.toFixed(2)}</p>
                </div>
                <div className="flex w-full gap-2 mt-auto shrink-0">
                  <button onClick={() => setPaymentMethod("Cash")} className="flex-1 bg-[#faf8f5] hover:bg-[#efece7] border border-[#e6e1da] text-[#2c2623] py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer">Cancel</button>
                  <button onClick={handlePaymentConfirm} disabled={cart.length === 0} className="flex-1 bg-[#557a61] hover:bg-[#43634e] text-white py-2.5 rounded-xl font-bold text-xs transition-colors shadow-sm disabled:opacity-50 cursor-pointer">Confirm</button>
                </div>
              </div>
            )}

            {selectedPaymentMethod === "Card" && (
              <div className="flex flex-col h-full">
                <div className="flex-1 flex flex-col justify-center items-center gap-3">
                  <CardIcon size={44} className="text-[#8e827b]" />
                  <p className="text-xs text-[#8e827b] text-center font-medium px-4">Swipe or tap card on terminal, then enter the reference below.</p>
                  <input 
                    type="text" 
                    placeholder="Transaction Reference" 
                    value={txRef}
                    onChange={(e) => setTxRef(e.target.value)}
                    className="w-full bg-[#faf8f5] border border-[#e6e1da] rounded-xl px-4 py-2.5 text-[#2c2623] focus:outline-none focus:border-[#c86a50] text-center text-xs transition-colors"
                  />
                </div>
                <button 
                  onClick={handlePaymentConfirm} 
                  disabled={!txRef || cart.length === 0} 
                  className="w-full bg-[#557a61] hover:bg-[#43634e] disabled:bg-gray-100 disabled:text-gray-400 text-white font-bold text-sm py-3 rounded-xl shadow-md transition-all mt-auto cursor-pointer"
                >
                  Confirm (Card)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

