"use client";

import { useState, useEffect } from "react";
import { User, Tag, Send, CheckCircle2, ChevronRight, X, QrCode, CreditCard, Banknote } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { LoadMeter } from "@/components/kds/LoadMeter";
import { saveOrderOffline } from "@/lib/offlineQueue";
import { VoiceOrderButton } from "@/components/pos/VoiceOrderButton";

export default function TerminalOrderPage() {
  const [showFloorPopup, setShowFloorPopup] = useState(true);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"none" | "cash" | "upi" | "card" | "success">("none");
  const [activePromos, setActivePromos] = useState<any[]>([]);
  const [upsellProducts, setUpsellProducts] = useState<any[]>([]);
  const [cart, setCart] = useState([
    { id: 1, name: "Cappuccino", price: 250, qty: 2 },
    { id: 3, name: "Club Sandwich", price: 350, qty: 1 },
  ]);

  useEffect(() => {
    apiClient.get('/coupons-promotions/promotions/active')
      .then(data => setActivePromos(data || []))
      .catch(console.error);
  }, []);

  // Simple mock: Whenever cart changes, fetch upsell for the last item
  useEffect(() => {
    if (cart.length > 0) {
      const lastItemId = cart[cart.length - 1].id;
      // Using mock ID because actual database IDs are UUIDs, but API supports them
      apiClient.get(`/products/${lastItemId}/upsell`)
        .then(data => setUpsellProducts(data || []))
        .catch(() => setUpsellProducts([])); // Fail silently if not found
    } else {
      setUpsellProducts([]);
    }
  }, [cart.length]);

  // Mock data
  const categories = [
    { id: 1, name: "All", color: "bg-gray-800" },
    { id: 2, name: "Beverages", color: "bg-amber-500" },
    { id: 3, name: "Food", color: "bg-red-500" },
    { id: 4, name: "Desserts", color: "bg-pink-500" },
  ];

  const products = [
    { id: 1, name: "Cappuccino", price: 250, cat: "bg-amber-500" },
    { id: 2, name: "Latte", price: 280, cat: "bg-amber-500" },
    { id: 3, name: "Club Sandwich", price: 350, cat: "bg-red-500" },
    { id: 4, name: "Chocolate Cake", price: 200, cat: "bg-pink-500" },
    { id: 5, name: "Iced Tea", price: 180, cat: "bg-amber-500" },
    { id: 6, name: "Burger", price: 450, cat: "bg-red-500" },
  ];



  const handleParsedVoiceItems = (items: any[]) => {
    // items is array of { productId, name, price, qty }
    const newCart = [...cart];
    items.forEach(item => {
      // In this mock, the ID is numeric but backend sends UUIDs. We will use a random ID or match by name
      const existing = newCart.find(c => c.name.toLowerCase() === item.name.toLowerCase());
      if (existing) {
        existing.qty += item.qty;
      } else {
        newCart.push({
          id: Math.floor(Math.random() * 1000) + 10, // Mock id
          name: item.name,
          price: item.price,
          qty: item.qty
        });
      }
    });
    setCart(newCart);
  };

  const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const tax = total * 0.05;
  const subtotal = total - tax;

  const handleSendOrder = async () => {
    const orderPayload = {
      tableId: 'table-4-mock-id',
      employeeId: 'employee-mock-id',
      subtotal: 850,
      tax: 42.50,
      discount: 0,
      total: 892.50,
      items: cart.map(item => ({
        productId: `product-${item.id}`,
        qty: item.qty,
        unitPrice: item.price,
        lineTotal: item.price * item.qty,
        lineDiscount: 0,
      })),
    };

    if (!navigator.onLine) {
      await saveOrderOffline(orderPayload);
      alert('You are offline. Order saved locally and will sync when reconnected.');
      setPaymentStep('success'); // just bypass for demo
      return;
    }

    try {
      await apiClient.post('/orders', orderPayload);
      setPaymentStep('success');
    } catch (error) {
      console.error(error);
      alert('Failed to submit order');
    }
  };

  return (
    <div className="h-full flex overflow-hidden">
      {/* Column 1: Products (40%) */}
      <div className="w-[40%] flex flex-col bg-white border-r border-gray-100 h-full">
        {/* Category Tabs & Voice */}
        <div className="flex overflow-x-auto p-4 gap-2 no-scrollbar border-b border-gray-100 shrink-0 items-center justify-between">
          <div className="flex gap-2">
            {categories.map((cat) => (
              <button key={cat.id} className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 whitespace-nowrap shadow-sm">
                <span className={`w-3 h-3 rounded-full ${cat.color}`}></span>
                <span className="font-medium text-gray-700">{cat.name}</span>
              </button>
            ))}
          </div>
          <VoiceOrderButton onParsedItems={handleParsedVoiceItems} />
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {activePromos.length > 0 && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 mb-4 text-sm text-amber-700 shadow-sm font-medium flex items-center">
              <span className="mr-2 text-xl">🎉</span> 
              {activePromos.map(p => p.name).join(', ')} active now! (Discounts applied at checkout)
            </div>
          )}
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
            {products.map((p) => (
              <button key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-cafe-primary transition-all text-left flex flex-col group relative">
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${p.cat}`}></div>
                <div className="h-24 bg-gray-100 w-full flex items-center justify-center text-gray-400">
                  Image
                </div>
                <div className="p-3 pl-4">
                  <h3 className="font-semibold text-gray-900 leading-tight mb-1 group-hover:text-cafe-primary transition-colors">{p.name}</h3>
                  <p className="font-bold text-gray-700">₹{p.price}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Column 2: Cart (35%) */}
      <div className="w-[35%] flex flex-col bg-white border-r border-gray-100 h-full">
        <div className="p-4 border-b border-gray-100 shrink-0 flex justify-between items-center">
          <div>
            <h2 className="font-bold text-xl text-gray-900 flex items-center gap-3">
              Order #0042 <LoadMeter />
            </h2>
            <p className="text-sm text-cafe-primary font-semibold">Table 4</p>
          </div>
          <button className="text-gray-400 hover:text-red-500 transition-colors p-2"><Trash2 size={20} /></button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{item.name}</h4>
                  <p className="text-sm text-gray-500">₹{item.price}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                    <button className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100">-</button>
                    <span className="w-8 text-center font-semibold">{item.qty}</span>
                    <button className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100">+</button>
                  </div>
                  <div className="w-16 text-right font-bold text-gray-900">
                    ₹{item.price * item.qty}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Upsell Suggestions */}
          {upsellProducts.length > 0 && (
            <div className="mt-auto pt-4 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Frequently bought together</p>
              <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
                {upsellProducts.map(p => (
                  <button key={p.id} className="shrink-0 w-32 p-3 bg-white border border-gray-200 rounded-xl hover:border-cafe-primary hover:shadow-md transition-all text-left group">
                    <h5 className="font-semibold text-sm text-gray-900 truncate group-hover:text-cafe-primary">{p.name}</h5>
                    <p className="text-xs font-bold text-gray-600 mt-1">₹{p.price}</p>
                    <div className="mt-2 text-xs font-medium text-cafe-primary bg-orange-50 px-2 py-1 rounded-md text-center group-hover:bg-cafe-primary group-hover:text-white transition-colors">
                      + Add
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-4 grid grid-cols-3 gap-2 border-t border-gray-100 bg-gray-50 shrink-0">
          <button className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-cafe-primary transition-colors text-gray-600 shadow-sm">
            <User size={20} className="mb-1" />
            <span className="text-xs font-medium">Customer</span>
          </button>
          <button onClick={() => setShowDiscountModal(true)} className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-cafe-primary transition-colors text-gray-600 shadow-sm">
            <Tag size={20} className="mb-1" />
            <span className="text-xs font-medium">Discount</span>
          </button>
          <button className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-cafe-primary transition-colors text-gray-600 shadow-sm">
            <Send size={20} className="mb-1" />
            <span className="text-xs font-medium">Send</span>
          </button>
        </div>

        {/* Summary & KDS */}
        <div className="p-4 bg-white shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="space-y-2 mb-4 text-sm">
            <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>₹850.00</span></div>
            <div className="flex justify-between text-gray-500"><span>Tax (5%)</span><span>₹42.50</span></div>
            <div className="flex justify-between text-gray-900 font-bold text-xl pt-2 border-t border-gray-100">
              <span>Total</span><span>₹892.50</span>
            </div>
          </div>
          <button 
            onClick={handleSendOrder}
            className="w-full bg-cafe-primary hover:bg-cafe-primary-hover text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/30 transition-transform active:scale-[0.98] text-lg"
          >
            Send to Kitchen
          </button>
        </div>
      </div>

      {/* Column 3: Payment (25%) */}
      <div className="w-[25%] bg-gray-50 h-full flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-white shrink-0">
          <h2 className="font-bold text-xl text-gray-900">Payment</h2>
        </div>
        
        {paymentStep === "none" && (
          <div className="flex-1 p-4 space-y-3 overflow-y-auto">
            <button onClick={() => setPaymentStep("cash")} className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-cafe-primary hover:shadow-md transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors">
                  <Banknote size={24} />
                </div>
                <span className="font-semibold text-gray-900 text-lg">Cash</span>
              </div>
              <ChevronRight className="text-gray-400 group-hover:text-cafe-primary" />
            </button>

            <button onClick={() => setPaymentStep("upi")} className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-cafe-primary hover:shadow-md transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                  <QrCode size={24} />
                </div>
                <span className="font-semibold text-gray-900 text-lg">UPI QR</span>
              </div>
              <ChevronRight className="text-gray-400 group-hover:text-cafe-primary" />
            </button>

            <button onClick={() => setPaymentStep("card")} className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-cafe-primary hover:shadow-md transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <CreditCard size={24} />
                </div>
                <span className="font-semibold text-gray-900 text-lg">Card</span>
              </div>
              <ChevronRight className="text-gray-400 group-hover:text-cafe-primary" />
            </button>
          </div>
        )}

        {paymentStep === "cash" && (
          <div className="flex-1 p-6 bg-white animate-in slide-in-from-right-8 duration-200 flex flex-col">
            <h3 className="font-bold text-gray-900 text-xl mb-6 flex items-center gap-2"><Banknote className="text-green-600"/> Cash Payment</h3>
            <div className="text-center mb-8">
              <p className="text-gray-500 mb-1">Total Amount</p>
              <h1 className="text-4xl font-bold text-gray-900">₹892.50</h1>
            </div>
            <div className="space-y-4 flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount Received</label>
                <input type="number" className="w-full px-4 py-3 text-xl font-bold border border-gray-300 rounded-xl focus:ring-2 focus:ring-cafe-primary text-center" placeholder="0.00" />
              </div>
              <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
                <p className="text-gray-500 text-sm mb-1">Change Due</p>
                <p className="text-2xl font-bold text-green-600">₹0.00</p>
              </div>
            </div>
            <div className="space-y-3 mt-4 shrink-0">
              <button onClick={() => setPaymentStep("success")} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg transition-colors text-lg">
                Confirm Payment
              </button>
              <button onClick={() => setPaymentStep("none")} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 rounded-xl transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}

        {paymentStep === "upi" && (
          <div className="flex-1 p-6 bg-white animate-in slide-in-from-right-8 duration-200 flex flex-col text-center">
            <h3 className="font-bold text-gray-900 text-xl mb-4 flex items-center justify-center gap-2"><QrCode className="text-purple-600"/> UPI Payment</h3>
            <h1 className="text-4xl font-bold text-gray-900 mb-8">₹892.50</h1>
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-48 h-48 bg-gray-100 rounded-xl mb-4 flex items-center justify-center border-2 border-dashed border-gray-300">
                <QrCode size={48} className="text-gray-400" />
              </div>
              <p className="font-medium text-gray-900">cafe@ybl</p>
              <p className="text-sm text-cafe-info mt-4 animate-pulse flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-cafe-info rounded-full"></span>
                Waiting for customer to scan...
              </p>
            </div>
            <div className="space-y-3 mt-8 shrink-0">
              <button onClick={() => setPaymentStep("success")} className="w-full bg-cafe-primary hover:bg-cafe-primary-hover text-white font-bold py-4 rounded-xl shadow-lg transition-colors text-lg">
                Payment Confirmed
              </button>
              <button onClick={() => setPaymentStep("none")} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 rounded-xl transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Screen 14: Floor Pop-up (Modal) */}
      {showFloorPopup && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-300">
            <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center shrink-0">
              <h2 className="text-2xl font-bold text-gray-900">Select a Table</h2>
              <button onClick={() => setShowFloorPopup(false)} className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="border-b border-gray-100 px-8 flex gap-8 shrink-0">
              <button className="py-4 border-b-2 border-cafe-primary text-cafe-primary font-bold text-lg">Ground Floor</button>
              <button className="py-4 border-b-2 border-transparent text-gray-500 hover:text-gray-900 font-medium text-lg transition-colors">First Floor</button>
            </div>

            <div className="p-8 overflow-y-auto bg-gray-50 rounded-b-2xl">
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                  const isActive = num === 4 || num === 7;
                  return (
                    <button 
                      key={num} 
                      onClick={() => setShowFloorPopup(false)}
                      className={`relative p-6 rounded-2xl border-2 transition-all shadow-sm flex flex-col items-center justify-center aspect-square ${
                        isActive 
                          ? 'border-cafe-primary bg-orange-50 hover:bg-orange-100' 
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {isActive && <div className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-sm"></div>}
                      <h3 className={`font-bold text-3xl mb-2 ${isActive ? 'text-cafe-primary' : 'text-gray-900'}`}>{num}</h3>
                      <span className="text-sm font-medium text-gray-500 flex items-center gap-1"><User size={14}/> 4</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Screen 16: Discount Modal */}
      {showDiscountModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Apply Coupon</h2>
              <button onClick={() => setShowDiscountModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
            </div>
            <div className="p-6">
              <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cafe-primary uppercase text-center font-bold tracking-widest text-lg" placeholder="ENTER CODE" />
              <p className="text-xs text-gray-500 text-center mt-3">Automated promotions apply automatically.</p>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3 rounded-b-xl">
              <button className="w-full py-3 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800">Apply Code</button>
            </div>
          </div>
        </div>
      )}

      {/* Screen 18: Payment Success */}
      {paymentStep === "success" && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-4 animate-in zoom-in-95 duration-300">
          <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 size={64} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-xl text-gray-500 mb-8">Order #0042 • Total: ₹892.50</p>
          
          <div className="w-full max-w-md space-y-4">
            <button className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded-xl shadow-md transition-colors text-lg">
              Print Receipt
            </button>
            <div className="flex gap-2">
              <input type="email" placeholder="Customer Email" className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 outline-none" />
              <button className="px-6 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold rounded-xl transition-colors">
                Email
              </button>
            </div>
            <button 
              onClick={() => { setPaymentStep("none"); setShowFloorPopup(true); }}
              className="w-full bg-cafe-primary hover:bg-cafe-primary-hover text-white font-bold py-4 rounded-xl shadow-lg mt-8 transition-colors text-lg"
            >
              New Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Temporary Trash Icon Component (since it wasn't imported at top to save space)
function Trash2(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>;
}
