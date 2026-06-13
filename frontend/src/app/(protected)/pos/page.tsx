"use client";

import { useEffect, useState } from "react";
import { usePOSStore, Product, CartItem } from "@/store/usePOSStore";
import { useKDSStore, KDSTicket } from "@/store/useKDSStore";
import apiClient from "@/lib/apiClient";
import { Minus, Plus, Trash2, Tag, User, Send, CheckCircle2 } from "lucide-react";

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
    setAmountEntered
  } = usePOSStore();
  
  const { addTicket } = useKDSStore();

  const [activeCategory, setActiveCategory] = useState("All");
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    if (!selectedTable) {
      setTableModalOpen(true);
    }
  }, [selectedTable, setTableModalOpen]);

  const filteredProducts = activeCategory === "All" 
    ? MOCK_PRODUCTS 
    : MOCK_PRODUCTS.filter(p => p.category === activeCategory);

  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const discountTotal = cart.reduce((sum, item) => {
    if (item.product.promotion) {
      return sum + ((item.product.price * (item.product.promotion / 100)) * item.quantity);
    }
    return sum;
  }, 0);
  const tax = (subtotal - discountTotal) * 0.05; // 5% GST
  const total = (subtotal - discountTotal) + tax;

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
    
    const ticketPayload = {
      orderItems: cart.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        notes: ""
      })),
      tableNumber: selectedTable?.tableNumber || "Takeout"
    };

    try {
      // Try hitting the backend (it might fail if not fully implemented yet)
      await apiClient.post("/api/kitchen/tickets", ticketPayload);
    } catch (error) {
      console.warn("Backend API failed, falling back to local KDS store.");
    }

    // Add to local KDS store
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

  return (
    <div className="h-full flex flex-col relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 size={20} />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 h-full overflow-hidden">
        
        {/* LEFT COLUMN: Products (col-span-5) */}
        <div className="lg:col-span-5 flex flex-col bg-cafe-card rounded-xl border border-gray-700 overflow-hidden shadow-sm h-full">
          {/* Categories */}
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

          {/* Product Grid */}
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

          {/* Cart Items */}
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

          {/* Totals & Actions */}
          <div className="bg-[#1e1e1e] border-t border-gray-700 p-4 pb-2 flex flex-col gap-2">
            <div className="flex justify-between text-sm text-gray-400">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {discountTotal > 0 && (
              <div className="flex justify-between text-sm text-cafe-warning">
                <span>Discount</span>
                <span>-${discountTotal.toFixed(2)}</span>
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

            <div className="grid grid-cols-2 gap-2 mt-4">
              <button className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors">
                <User size={18} /> Customer
              </button>
              <button className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors">
                <Tag size={18} /> Discount
              </button>
              <button className="flex items-center justify-center gap-2 bg-[#2d3748] hover:bg-[#4a5568] text-white py-3 rounded-lg font-medium transition-colors border border-gray-600">
                Receipt
              </button>
              <button 
                onClick={handleSendToKitchen}
                disabled={cart.length === 0}
                className="flex items-center justify-center gap-2 bg-cafe-primary hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-cafe-primary/20"
              >
                <Send size={18} /> Send KDS
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Payment (col-span-3) */}
        <div className="lg:col-span-3 flex flex-col bg-cafe-card rounded-xl border border-gray-700 overflow-hidden shadow-sm h-full">
          {/* Payable Display */}
          <div className="bg-[#1e1e1e] p-6 text-center border-b border-gray-700 flex flex-col justify-center gap-2">
            <p className="text-gray-400 text-sm uppercase tracking-wider font-semibold">Amount to Pay</p>
            <h1 className="text-5xl font-black text-white tracking-tight">${total.toFixed(2)}</h1>
          </div>

          {/* Payment Methods */}
          <div className="grid grid-cols-3 gap-2 p-4">
            {["Cash", "UPI", "Card"].map(method => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method)}
                className={`py-3 rounded-lg font-semibold text-sm transition-all border ${
                  selectedPaymentMethod === method
                    ? "bg-cafe-primary text-white border-cafe-primary shadow-md"
                    : "bg-[#1e1e1e] text-gray-300 border-gray-600 hover:border-gray-400"
                }`}
              >
                {method}
              </button>
            ))}
          </div>

          {/* Entered Amount */}
          <div className="px-4 pb-4">
            <div className="w-full bg-[#1e1e1e] border-2 border-gray-700 rounded-xl h-16 flex items-center justify-end px-4 overflow-hidden">
              <span className={`text-3xl font-mono ${amountEntered ? "text-white" : "text-gray-600"}`}>
                {amountEntered ? `$${amountEntered}` : "$0.00"}
              </span>
            </div>
          </div>

          {/* Numpad */}
          <div className="flex-1 px-4 pb-4 overflow-hidden flex flex-col">
            <div className="grid grid-cols-3 gap-2 flex-1 mb-2">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "00", "."].map(num => (
                <button
                  key={num}
                  onClick={() => handleNumpadClick(num)}
                  className="bg-[#2a2a2a] hover:bg-gray-700 rounded-xl text-xl font-semibold text-white border border-gray-700 shadow-sm transition-colors active:scale-95 flex items-center justify-center min-h-[48px]"
                >
                  {num}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 h-14">
              <button 
                onClick={() => handleNumpadClick("C")}
                className="bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold transition-colors active:scale-95"
              >
                Clear
              </button>
              <button 
                onClick={() => handleNumpadClick("Del")}
                className="bg-cafe-danger hover:bg-red-700 text-white rounded-xl font-bold transition-colors active:scale-95 shadow-lg shadow-cafe-danger/20"
              >
                Del
              </button>
            </div>
            
            <button className="w-full bg-green-600 hover:bg-green-500 text-white font-bold text-xl py-4 rounded-xl mt-4 shadow-lg shadow-green-600/20 active:scale-95 transition-all">
              Pay Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
