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
    <div className="h-full flex flex-col relative">
      <ReceiptModal 
        isOpen={receiptData.isOpen} 
        onClose={closeReceipt} 
        orderNumber={receiptData.orderNumber}
        amount={receiptData.amount}
      />
      <CustomerSelectionModal isOpen={customerModalOpen} onClose={() => setCustomerModalOpen(false)} />
      <DiscountModal isOpen={discountModalOpen} onClose={() => setDiscountModalOpen(false)} />

      {toastMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 size={20} />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 h-full overflow-hidden">
        
        {/* LEFT COLUMN: Products (col-span-5) */}
        <div className="lg:col-span-5 flex flex-col bg-cafe-card rounded-xl border border-gray-700 overflow-hidden shadow-sm h-full">
          <div className="flex overflow-x-auto hide-scrollbar p-3 border-b border-gray-700 gap-2 bg-[#1e1e1e]">
            {MOCK_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat 
                    ? "bg-cafe-primary text-white shadow-sm" 
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-[#2a2a2a] border border-gray-700 hover:border-cafe-primary/50 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2 transition-all hover:shadow-lg hover:-translate-y-0.5 group active:scale-95"
              >
                <span className="font-semibold text-gray-200 group-hover:text-white line-clamp-2">{product.name}</span>
                <span className="text-cafe-primary font-bold">${product.price.toFixed(2)}</span>
                {product.promotion && (
                  <span className="text-[10px] bg-cafe-danger/20 text-cafe-danger px-2 py-0.5 rounded-full absolute top-2 right-2">
                    -{product.promotion}%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* CENTER COLUMN: Cart (col-span-4) */}
        <div className="lg:col-span-4 flex flex-col bg-cafe-card rounded-xl border border-gray-700 overflow-hidden shadow-sm h-full">
          <div className="p-4 border-b border-gray-700 bg-[#1e1e1e] flex justify-between items-center">
            <h2 className="font-bold text-lg text-gray-200">Current Order</h2>
            {selectedTable && (
              <span className="text-xs bg-cafe-primary/20 text-cafe-primary px-3 py-1 rounded-full font-medium">
                {selectedTable.floorName} - T{selectedTable.tableNumber}
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                <ShoppingCart size={48} className="mb-4" />
                <p>Cart is empty</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {cart.map(item => {
                  const lineTotal = item.product.price * item.quantity;
                  const itemDiscount = item.product.promotion ? (lineTotal * (item.product.promotion / 100)) : 0;
                  
                  return (
                    <div key={item.product.id} className="bg-[#1e1e1e] border border-gray-700 rounded-lg p-3 flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-200 line-clamp-1">{item.product.name}</p>
                          <p className="text-xs text-gray-400">${item.product.price.toFixed(2)} / ea</p>
                        </div>
                        <p className="font-bold text-cafe-primary">${(lineTotal - itemDiscount).toFixed(2)}</p>
                      </div>
                      
                      {item.product.promotion && (
                        <div className="flex items-center gap-1 text-xs text-cafe-warning">
                          <Tag size={12} />
                          <span>{item.product.promotion}% Off (-${itemDiscount.toFixed(2)})</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center mt-1">
                        <button onClick={() => removeFromCart(item.product.id)} className="text-gray-500 hover:text-cafe-danger p-1">
                          <Trash2 size={16} />
                        </button>
                        <div className="flex items-center gap-3 bg-[#2a2a2a] rounded-lg p-1 border border-gray-600">
                          <button onClick={() => updateQuantity(item.product.id, -1)} className="w-8 h-8 flex items-center justify-center text-gray-300 hover:bg-gray-600 rounded-md">
                            <Minus size={16} />
                          </button>
                          <span className="w-4 text-center font-bold text-sm">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, 1)} className="w-8 h-8 flex items-center justify-center text-gray-300 hover:bg-gray-600 rounded-md">
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-[#1e1e1e] border-t border-gray-700 p-4 pb-2 flex flex-col gap-2">
            <div className="flex justify-between text-sm text-gray-400">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {totalDiscounts > 0 && (
              <div className="flex justify-between text-sm text-cafe-warning">
                <div className="flex items-center gap-1">
                  <span>Discount</span>
                  {appliedDiscount && (
                    <span className="text-xs bg-cafe-warning/20 px-1.5 py-0.5 rounded-md">
                      ({appliedDiscount.code})
                    </span>
                  )}
                </div>
                <span>-${totalDiscounts.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-gray-400">
              <span>Tax (5%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-white pt-2 border-t border-gray-700 mt-1">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            
            {selectedCustomer && (
              <div className="flex justify-between items-center bg-[#2a2a2a] p-2 rounded-lg mt-1 border border-cafe-primary/20">
                <span className="text-sm text-gray-300">Customer: <span className="text-white font-semibold">{selectedCustomer.name}</span></span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 mt-2">
              <button 
                onClick={() => setCustomerModalOpen(true)}
                className={`flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors ${selectedCustomer ? 'bg-cafe-primary text-white hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
              >
                <User size={18} /> {selectedCustomer ? "Change Cust" : "Customer"}
              </button>
              <button 
                onClick={() => setDiscountModalOpen(true)}
                className={`flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors ${appliedDiscount ? 'bg-cafe-warning text-black hover:bg-yellow-500' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
              >
                <Tag size={18} /> {appliedDiscount ? "Discounted" : "Discount"}
              </button>
              <button className="flex items-center justify-center gap-2 bg-[#2d3748] hover:bg-[#4a5568] text-white py-3 rounded-lg font-medium transition-colors border border-gray-600">
                Receipt
              </button>
              <button 
                onClick={handleSendToKitchen}
                disabled={cart.length === 0}
                className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                <Send size={18} /> Send KDS
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Payment (col-span-3) */}
        <div className="lg:col-span-3 flex flex-col bg-cafe-card rounded-xl border border-gray-700 overflow-hidden shadow-sm h-full">
          <div className="bg-[#1e1e1e] p-6 text-center border-b border-gray-700 flex flex-col justify-center gap-2">
            <p className="text-gray-400 text-sm uppercase tracking-wider font-semibold">Amount to Pay</p>
            <h1 className="text-5xl font-black text-white tracking-tight">${total.toFixed(2)}</h1>
          </div>

          <div className="grid grid-cols-3 gap-2 p-4">
            <button onClick={() => setPaymentMethod("Cash")} className={`py-3 rounded-lg font-semibold text-sm transition-all border flex flex-col items-center gap-1 ${selectedPaymentMethod === "Cash" ? "bg-cafe-primary text-white border-cafe-primary shadow-md" : "bg-[#1e1e1e] text-gray-300 border-gray-600 hover:border-gray-400"}`}>
              <Banknote size={20} /> Cash
            </button>
            <button onClick={() => setPaymentMethod("UPI")} className={`py-3 rounded-lg font-semibold text-sm transition-all border flex flex-col items-center gap-1 ${selectedPaymentMethod === "UPI" ? "bg-cafe-primary text-white border-cafe-primary shadow-md" : "bg-[#1e1e1e] text-gray-300 border-gray-600 hover:border-gray-400"}`}>
              <QrCode size={20} /> UPI
            </button>
            <button onClick={() => setPaymentMethod("Card")} className={`py-3 rounded-lg font-semibold text-sm transition-all border flex flex-col items-center gap-1 ${selectedPaymentMethod === "Card" ? "bg-cafe-primary text-white border-cafe-primary shadow-md" : "bg-[#1e1e1e] text-gray-300 border-gray-600 hover:border-gray-400"}`}>
              <CardIcon size={20} /> Card
            </button>
          </div>

          <div className="flex-1 px-4 pb-4 overflow-hidden flex flex-col">
            {selectedPaymentMethod === "Cash" && (
              <>
                <div className="w-full bg-[#1e1e1e] border border-gray-700 rounded-xl p-3 mb-2 flex flex-col items-end justify-center">
                  <span className="text-xs text-gray-400 uppercase font-semibold">Received</span>
                  <span className={`text-2xl font-mono ${amountEntered ? "text-white" : "text-gray-600"}`}>
                    {amountEntered ? `$${amountEntered}` : "$0.00"}
                  </span>
                </div>
                <div className="w-full bg-[#1e1e1e] border border-gray-700 rounded-xl p-3 mb-4 flex flex-col items-end justify-center">
                  <span className="text-xs text-gray-400 uppercase font-semibold">Change Due</span>
                  <span className={`text-2xl font-mono ${changeDue > 0 ? "text-green-500" : "text-gray-600"}`}>
                    ${changeDue.toFixed(2)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 flex-1 mb-2">
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "00", "."].map(num => (
                    <button key={num} onClick={() => handleNumpadClick(num)} className="bg-[#2a2a2a] hover:bg-gray-700 rounded-xl text-xl font-semibold text-white border border-gray-700 shadow-sm transition-colors active:scale-95 flex items-center justify-center min-h-[48px]">
                      {num}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 h-14 mb-4">
                  <button onClick={() => handleNumpadClick("C")} className="bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold transition-colors active:scale-95">Clear</button>
                  <button onClick={() => handleNumpadClick("Del")} className="bg-cafe-danger hover:bg-red-700 text-white rounded-xl font-bold transition-colors active:scale-95">Del</button>
                </div>
                <button onClick={handlePaymentConfirm} disabled={!isCashValid || cart.length === 0} className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xl py-4 rounded-xl shadow-lg transition-all active:scale-95">
                  Confirm (Cash)
                </button>
              </>
            )}

            {selectedPaymentMethod === "UPI" && (
              <div className="flex flex-col items-center justify-center h-full gap-6">
                <div className="bg-white p-4 rounded-xl shadow-inner">
                  <QRCodeCanvas value={`upi://pay?pa=cafepos@bank&pn=CafePOS&am=${total.toFixed(2)}`} size={180} />
                </div>
                <div className="text-center">
                  <p className="text-gray-400 mb-1 text-sm">Scan to pay</p>
                  <p className="text-2xl font-bold text-cafe-primary">${total.toFixed(2)}</p>
                </div>
                <div className="flex w-full gap-2 mt-auto">
                  <button onClick={() => setPaymentMethod("Cash")} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-4 rounded-xl font-bold transition-colors">Cancel</button>
                  <button onClick={handlePaymentConfirm} disabled={cart.length === 0} className="flex-1 bg-green-600 hover:bg-green-500 text-white py-4 rounded-xl font-bold transition-colors shadow-lg disabled:opacity-50">Confirm</button>
                </div>
              </div>
            )}

            {selectedPaymentMethod === "Card" && (
              <div className="flex flex-col h-full">
                <div className="flex-1 flex flex-col justify-center items-center gap-4">
                  <CardIcon size={64} className="text-gray-600" />
                  <p className="text-gray-400 text-center text-sm">Swipe or tap card on terminal, then enter the reference below.</p>
                  <input 
                    type="text" 
                    placeholder="Transaction Reference" 
                    value={txRef}
                    onChange={(e) => setTxRef(e.target.value)}
                    className="w-full bg-[#1e1e1e] border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cafe-primary text-center"
                  />
                </div>
                <button onClick={handlePaymentConfirm} disabled={!txRef || cart.length === 0} className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:opacity-50 text-white font-bold text-xl py-4 rounded-xl shadow-lg transition-all mt-auto">
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

