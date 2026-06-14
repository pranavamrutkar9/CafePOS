"use client";

import { useState, useEffect, Suspense, lazy } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Coffee, Search, User, Compass, PlusSquare, Menu, LogOut, Package, Tags, 
  CreditCard, Gift, BookOpen, Users, Monitor, BarChart, Percent, Mail, X, Plus, Minus, Trash2
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import api from "@/api/axios";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import { HamburgerMenu } from "@/components/SharedMenu";

// Lazy-load QR code library — only needed for UPI payment modal
const QRCodeSVG = dynamic(() => import("qrcode.react").then(m => ({ default: m.QRCodeSVG })), { ssr: false });

export default function POSPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#C86A50] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-[#8e827b] mt-4">Loading POS terminal...</p>
      </div>
    }>
      <POSPageContent />
    </Suspense>
  );
}

interface Product {
  id: string;
  name: string;
  price: number;
  categoryId: string;
}

interface Category {
  id: string;
  name: string;
  color: string | null;
}

const getProductImage = (name: string) => {
  const images: Record<string, string> = {
    "Cappuccino": "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=300&h=300&fit=crop",
    "Latte Macchiato": "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=300&h=300&fit=crop",
    "Iced Peach Tea": "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=300&h=300&fit=crop",
    "Espresso Single": "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=300&h=300&fit=crop",
    "Fresh Mint Mojito": "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=300&h=300&fit=crop",
    "Club Sandwich Deluxe": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Club_sandwich_at_Caf%C3%A9_Picnic.jpg/330px-Club_sandwich_at_Caf%C3%A9_Picnic.jpg",
    "Joy Signature Burger": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/RedDot_Burger.jpg/330px-RedDot_Burger.jpg",
    "French Fries Salted": "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=300&h=300&fit=crop",
    "Chocolate Lava Cake": "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=300&h=300&fit=crop",
    "Red Velvet Pastry": "https://images.unsplash.com/photo-1614145121029-83a9f7b68bf4?w=300&h=300&fit=crop",
    "Blueberry Cheesecake": "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=300&h=300&fit=crop",
    "Vanilla Ice Cream Scoop": "https://images.unsplash.com/photo-1557142046-c704a3adf364?w=300&h=300&fit=crop",
    "Penne Arrabbiata Pasta": "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=300&h=300&fit=crop",
    "Wild Mushroom Risotto": "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=300&h=300&fit=crop",
    "Margherita Pizza 9inch": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Pizza-3007395.jpg/330px-Pizza-3007395.jpg",
    "Farmhouse Pizza 9inch": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=300&fit=crop",
    "Burger & Mojito Combo": "https://images.unsplash.com/photo-1610440042657-612c34d95e9f?w=300&h=300&fit=crop",
    "Coffee & Cheesecake Combo": "https://images.unsplash.com/photo-1495474472204-51ea154817bd?w=300&h=300&fit=crop",
    
    // Custom Demo Entities
    "Paneer Tikka Roll": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Kolkata_Rolls.jpg/330px-Kolkata_Rolls.jpg",
    "Cheese Garlic Bread": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Garlicbread.jpg/330px-Garlicbread.jpg",
    "Crispy Onion Rings": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/OnionRings.JPG/330px-OnionRings.JPG",
    "Chicken Nuggets": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Chicken_Nuggets.jpg/330px-Chicken_Nuggets.jpg",
    "Nachos with Cheese": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Nachos-cheese.jpg/330px-Nachos-cheese.jpg",
    "Veg Spring Rolls": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Spring_Rolls_%283357696061%29.jpg/330px-Spring_Rolls_%283357696061%29.jpg"
  };
  
  if (images[name]) return images[name];
  
  // Safe, generic food fallback instead of random weird images
  return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=300&fit=crop";
};

function POSPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const { user, logout } = useAuth();
  
  // Zustand Cart Store
  const { 
    cart, 
    orderId: activeOrderId, 
    order: activeOrder,
    subtotal, 
    tax, 
    discount, 
    total, 
    setOrder, 
    clear 
  } = useCartStore();

  // Component States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<"CASH" | "UPI" | "CARD" | null>("CASH");
  const [numPadInput, setNumPadInput] = useState("");
  const [activeNumPadMode, setActiveNumPadMode] = useState<"Prices" | "Disc." | "Qty" | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  // Modal States
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [customersList, setCustomersList] = useState<any[]>([]);
  const [searchCustomerQuery, setSearchCustomerQuery] = useState("");
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerEmail, setNewCustomerEmail] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newCustomerLoading, setNewCustomerLoading] = useState(false);

  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [activeCoupons, setActiveCoupons] = useState<any[]>([]);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [cashReceivedInput, setCashReceivedInput] = useState("");
  const [cardTxnRefInput, setCardTxnRefInput] = useState("");
  const [upiPaymentMethod, setUpiPaymentMethod] = useState<any>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [receiptEmail, setReceiptEmail] = useState("");
  const [emailSending, setEmailSending] = useState(false);

  // Load customers when modal opens or query changes (debounced 300ms)
  useEffect(() => {
    if (customerModalOpen) {
      const delayDebounce = setTimeout(async () => {
        try {
          const res = await api.get(`/customers?search=${searchCustomerQuery}`);
          setCustomersList(res.data || []);
        } catch (err) {
          console.error("Failed to load customers:", err);
        }
      }, 300);
      return () => clearTimeout(delayDebounce);
    }
  }, [searchCustomerQuery, customerModalOpen]);

  // Open Discount Modal & load active coupons
  const handleOpenDiscountModal = async () => {
    setDiscountModalOpen(true);
    setCouponCodeInput("");
    try {
      const res = await api.get("/coupons-promotions/coupons");
      const active = (res.data || []).filter((c: any) => c.active);
      setActiveCoupons(active);
    } catch (err) {
      console.error("Failed to fetch coupons:", err);
    }
  };

  // Apply Coupon Code
  const handleApplyCoupon = async (codeToApply: string) => {
    if (!orderId) return;
    try {
      const match = activeCoupons.find(c => c.code.toUpperCase() === codeToApply.trim().toUpperCase());
      if (!match) {
        toast.error("Invalid or inactive coupon code.");
        return;
      }
      toast.loading("Applying discount...", { id: "coupon-apply" });
      const res = await api.put(`/orders/${orderId}`, {
        couponId: match.id
      });
      setOrder(res.data);
      setDiscountModalOpen(false);
      toast.success("Coupon applied successfully!", { id: "coupon-apply" });
    } catch (err: any) {
      toast.error("Failed to apply coupon.", { id: "coupon-apply" });
    }
  };

  // Select Customer
  const handleSelectCustomer = async (customerId: string) => {
    if (!orderId) return;
    try {
      toast.loading("Assigning customer...", { id: "customer-assign" });
      const res = await api.put(`/orders/${orderId}`, {
        customerId
      });
      setOrder(res.data);
      setCustomerModalOpen(false);
      toast.success("Customer assigned to order!", { id: "customer-assign" });
    } catch (err) {
      toast.error("Failed to assign customer.", { id: "customer-assign" });
    }
  };

  // Create Customer & select
  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim()) {
      toast.error("Customer name is required.");
      return;
    }
    setNewCustomerLoading(true);
    try {
      const res = await api.post("/customers", {
        name: newCustomerName.trim(),
        email: newCustomerEmail.trim() || null,
        phone: newCustomerPhone.trim() || null
      });
      const created = res.data;
      toast.success("Customer created!");
      await handleSelectCustomer(created.id);
      setNewCustomerName("");
      setNewCustomerEmail("");
      setNewCustomerPhone("");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create customer.");
    } finally {
      setNewCustomerLoading(false);
    }
  };

  // Open Checkout modal and query UPI details if applicable
  const handleOpenPaymentModal = async () => {
    if (!orderId || !selectedPayment) return;
    setPaymentModalOpen(true);
    setCashReceivedInput("");
    setCardTxnRefInput("");
    setUpiPaymentMethod(null);

    if (selectedPayment === "UPI") {
      try {
        const res = await api.get("/payment-methods");
        const enabledUpi = (res.data || []).find((p: any) => p.type === "UPI" && p.enabled);
        if (enabledUpi) {
          setUpiPaymentMethod(enabledUpi);
        } else {
          toast.error("No active UPI payment method configured.");
        }
      } catch (err) {
        console.error("Failed to fetch UPI payment method:", err);
      }
    }
  };

  // Finalize payment
  const handleConfirmCheckout = async () => {
    if (!orderId || !selectedPayment) return;

    if (selectedPayment === "CASH") {
      const received = parseFloat(cashReceivedInput) || 0;
      if (received < total) {
        toast.error("Insufficient amount received.");
        return;
      }
    }

    if (selectedPayment === "CARD" && !cardTxnRefInput.trim()) {
      toast.error("Transaction Reference is required for Card payment.");
      return;
    }

    setCheckoutLoading(true);
    try {
      toast.loading("Processing checkout...", { id: "checkout" });
      await api.put(`/orders/${orderId}`, {
        status: "PAID",
        paymentMethod: selectedPayment
      });
      toast.success("Payment completed! Table is now available.", { id: "checkout" });
      clear();
      setPaymentModalOpen(false);
      router.push("/pos/tables");
    } catch (err) {
      toast.error("Checkout process failed.", { id: "checkout" });
    } finally {
      setCheckoutLoading(false);
    }
  };

  // 1. Fetch products, categories, session, and active order on mount/query param changes
  useEffect(() => {
    const loadPOSData = async () => {
      try {
        setPageLoading(true);

        // Fetch session + catalog in parallel (not sequentially)
        const [sessionRes, catsRes, prodsRes] = await Promise.all([
          api.get("/sessions/current"),
          api.get("/categories"),
          api.get("/products"),
        ]);

        const session = sessionRes.data;
        if (!session || session.status !== "OPEN") {
          toast.error("No open sales session found. Please initialize session first.");
          router.push("/session");
          return;
        }

        setCategories(catsRes.data || []);
        setProducts(prodsRes.data || []);

        // Load active order if orderId query param is present
        if (orderId) {
          const orderRes = await api.get(`/orders/${orderId}`);
          setOrder(orderRes.data);
        } else {
          clear(); // Clear local cart store if no active order context
        }
      } catch (err: any) {
        console.error("Error loading POS data:", err);
        toast.error("Failed to load catalog or order details.");
        
        // Mock fallback if API endpoints are not fully ready
        setCategories([
          { id: "all", name: "All Items", color: "#6B7280" },
          { id: "1", name: "Beverages", color: "#F59E0B" },
          { id: "2", name: "Main Course", color: "#EF4444" },
          { id: "3", name: "Desserts", color: "#EC4899" }
        ]);
        setProducts([
          { id: "p1", name: "Cappuccino", price: 250, categoryId: "1" },
          { id: "p2", name: "Latte Macchiato", price: 280, categoryId: "1" },
          { id: "p3", name: "Iced Peach Tea", price: 180, categoryId: "1" },
          { id: "p4", name: "Joy Signature Burger", price: 450, categoryId: "2" },
          { id: "p5", name: "Club Sandwich Deluxe", price: 350, categoryId: "2" },
          { id: "p6", name: "Chocolate Lava Cake", price: 200, categoryId: "3" }
        ]);
      } finally {
        setPageLoading(false);
      }
    };

    loadPOSData();
  }, [orderId, router, setOrder, clear]);

  // Filtered Products
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === "all" || product.categoryId === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // API wrappers for cart modifications
  const handleAddItem = async (product: Product) => {
    if (!orderId) {
      toast.error("Please select a table to begin taking orders.");
      router.push("/pos/tables");
      return;
    }

    try {
      const existing = cart.find(i => i.productId === product.id);
      const newQty = existing ? existing.qty + 1 : 1;
      
      const res = await api.patch(`/orders/${orderId}/items`, {
        productId: product.id,
        qty: newQty
      });
      setOrder(res.data);
    } catch (err: any) {
      toast.error("Failed to add item to cart.");
    }
  };

  const handleUpdateQty = async (productId: string, qty: number) => {
    if (!orderId) return;

    try {
      const res = await api.patch(`/orders/${orderId}/items`, {
        productId,
        qty: Math.max(0, qty)
      });
      setOrder(res.data);
    } catch (err: any) {
      toast.error("Failed to update item quantity.");
    }
  };

  const handleClearCart = async () => {
    if (!orderId) return;
    if (!confirm("Are you sure you want to empty the cart?")) return;

    try {
      const res = await api.put(`/orders/${orderId}`, {
        items: [] // Empty items list clears cart in DB
      });
      setOrder(res.data);
      toast.success("Cart cleared.");
    } catch (err: any) {
      toast.error("Failed to clear cart.");
    }
  };

  const handleSendToKitchen = async () => {
    if (!orderId) return;
    if (cart.length === 0) {
      toast.error("Cart is empty.");
      return;
    }

    try {
      toast.loading("Sending order to kitchen...", { id: "kds-send" });
      await api.post(`/orders/${orderId}/send-to-kitchen`);
      toast.success("Order sent to KDS room!", { id: "kds-send" });
      
      // Refresh order lines to stamp sentToKitchenAt flags
      const res = await api.get(`/orders/${orderId}`);
      setOrder(res.data);
    } catch (err: any) {
      toast.error("Failed to send order to kitchen.", { id: "kds-send" });
    }
  };

  const handleConfirmPayment = async () => {
    if (!orderId || !selectedPayment) return;

    try {
      toast.loading("Processing checkout...", { id: "checkout" });
      await api.put(`/orders/${orderId}`, {
        status: "PAID",
        paymentMethod: selectedPayment
      });
      toast.success("Payment completed! Table is now available.", { id: "checkout" });
      clear();
      router.push("/pos/tables");
    } catch (err: any) {
      toast.error("Checkout process failed.", { id: "checkout" });
    }
  };

  const handleOpenEmailModal = () => {
    // Prefill with customer's email if available
    setReceiptEmail(activeOrder?.customer?.email || "");
    setEmailModalOpen(true);
  };

  const handleSendEmailReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !receiptEmail.trim()) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setEmailSending(true);
    try {
      toast.loading("Sending receipt via email...", { id: "send-receipt" });
      await api.post(`/orders/${orderId}/send-receipt`, {
        email: receiptEmail.trim()
      });
      toast.success("Receipt emailed successfully!", { id: "send-receipt" });
      setEmailModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to send email receipt.", { id: "send-receipt" });
    } finally {
      setEmailSending(false);
    }
  };

  // NumPad key handler
  const handleNumPadPress = (key: string) => {
    if (["Prices", "Disc.", "Qty"].includes(key)) {
      setActiveNumPadMode(key as any);
      return;
    }

    if (key === "clear") {
      setNumPadInput("");
      return;
    }

    if (key === "+/-") {
      setNumPadInput(prev => prev.startsWith("-") ? prev.slice(1) : `-${prev}`);
      return;
    }

    // Append digit
    setNumPadInput(prev => prev + key);
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#C86A50] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-[#8e827b] mt-4">Initializing catalog...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-[#FAF8F5] overflow-hidden text-[#2C2623]">
      
      {/* 1. TOP BAR */}
      <header className="h-16 bg-white border-b border-[#EFECE7] flex items-center justify-between px-6 shrink-0 z-40 shadow-sm">
        
        {/* Brand/Logo */}
        <Link href="/pos" className="flex items-center gap-2.5 font-black text-2xl tracking-tight">
          <span className="w-8 h-8 bg-gradient-to-tr from-[#C86A50] to-[#B3563d] rounded-lg text-white flex items-center justify-center text-sm shadow-sm">C</span>
          <span>Cafe<span className="text-[#C86A50]">POS</span></span>
        </Link>

        {/* Search Field */}
        <div className="flex-1 max-w-md mx-8 relative hidden md:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8e827b]" size={16} />
          <input 
            type="text" 
            placeholder="Search catalog..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FAF8F5] border border-[#E6E1DA] rounded-full py-2 pl-11 pr-4 text-xs focus:outline-none focus:border-[#C86A50] transition-all"
          />
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-3">
          {/* Cashier Icon */}
          <button className="p-2.5 text-[#8e827b] hover:text-[#C86A50] hover:bg-[#FAF8F5] rounded-xl transition-all relative">
            <User size={18} />
          </button>

          {/* Orders Compass */}
          <button onClick={() => router.push("/orders")} className="p-2.5 text-[#8e827b] hover:text-[#C86A50] hover:bg-[#FAF8F5] rounded-xl transition-all relative">
            <Compass size={18} />
          </button>

          {/* New Order */}
          <button onClick={() => { clear(); router.push("/pos/tables"); }} className="p-2.5 text-[#8e827b] hover:text-[#C86A50] hover:bg-[#FAF8F5] rounded-xl transition-all relative">
            <PlusSquare size={18} />
          </button>

          {/* Table Count Badge */}
          <Link href="/pos/tables" className="flex items-center gap-1.5 bg-[#FAF8F5] border border-[#EFECE7] hover:border-[#C86A50]/50 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm">
            <span>Tables Grid</span>
          </Link>

          {/* User Profile */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#C86A50] to-[#B3563d] flex items-center justify-center font-bold text-sm text-white select-none">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>

          {/* Hamburger Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2.5 text-[#8e827b] hover:text-[#2C2623] hover:bg-[#FAF8F5] rounded-xl transition-all"
            >
              <Menu size={20} />
            </button>

            {menuOpen && (
              <HamburgerMenu onClose={() => setMenuOpen(false)} />
            )}
          </div>
        </div>
      </header>

      {/* 2. WORKSPACE WRAPPER */}
      <div className="flex-1 flex overflow-hidden">

        {/* COLUMN 1: PRODUCTS COLUMN (40% width) */}
        <section className="w-[40%] flex flex-col bg-white border-r border-[#EFECE7] h-full shrink-0">
          
          {/* Categories Pill Container */}
          <div className="flex overflow-x-auto p-4 gap-2 border-b border-[#EFECE7] shrink-0 scrollbar-none">
            <button 
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-full border text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === "all" 
                  ? "bg-[#C86A50] text-white border-[#C86A50]" 
                  : "bg-[#FAF8F5] text-[#8e827b] border-[#E6E1DA] hover:border-[#C86A50]/50"
              }`}
            >
              All Items
            </button>
            {categories.map(category => (
              <button 
                key={category.id} 
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full border text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === category.id 
                    ? "bg-[#C86A50] text-white border-[#C86A50]" 
                    : "bg-[#FAF8F5] text-[#8e827b] border-[#E6E1DA] hover:border-[#C86A50]/50"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto p-4 bg-[#FAF8F5]">
            {filteredProducts.length === 0 ? (
              <div className="py-20 text-center text-[#8e827b] text-xs font-bold">
                No products found in this category.
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map(product => {
                  const cat = categories.find(c => c.id === product.categoryId);
                  return (
                    <button 
                      key={product.id} 
                      onClick={() => handleAddItem(product)}
                      className="bg-white p-3 rounded-2xl border border-[#EFECE7] hover:border-[#C86A50] shadow-sm hover:shadow-md transition-all text-left flex flex-col group relative overflow-hidden h-[180px] w-full"
                    >
                      <div className="relative w-full h-[60%] rounded-xl overflow-hidden mb-3 shrink-0">
                        <img 
                          src={getProductImage(product.name)} 
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span 
                          className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full shadow-sm border border-white" 
                          style={{ backgroundColor: cat?.color || "#6B7280" }}
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-end w-full">
                        <h3 className="font-bold text-xs text-[#2C2623] mb-1 leading-snug group-hover:text-[#C86A50] transition-colors line-clamp-2">{product.name}</h3>
                        <p className="font-extrabold text-xs text-[#8e827b]">₹{product.price}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* COLUMN 2: CART COLUMN (35% width) */}
        <section className="w-[35%] flex flex-col bg-white border-r border-[#EFECE7] h-full shrink-0">
          
          {/* Cart Header */}
          <div className="p-4 border-b border-[#EFECE7] flex justify-between items-center shrink-0">
            <div>
              <h2 className="font-black text-lg">Active Cart</h2>
              {orderId ? (
                <span className="text-[10px] uppercase font-black tracking-widest text-[#C86A50]">Editing Order #{orderId.substring(0, 8)}</span>
              ) : (
                <span className="text-[10px] uppercase font-black tracking-widest text-red-500">No active table order selected</span>
              )}
            </div>
            {orderId && (
              <button 
                onClick={handleClearCart} 
                className="text-[#8e827b] hover:text-[#EF4444] p-1.5 rounded-lg hover:bg-red-50 transition-all cursor-pointer"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>

          {/* Cart Line Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {!orderId ? (
              <div className="h-full flex flex-col items-center justify-center text-[#8e827b] py-16 text-center px-4">
                <span className="text-4xl mb-2">🍽️</span>
                <p className="text-sm font-extrabold">No table selected</p>
                <p className="text-xs text-[#8e827b] mt-1">Please select an active table from the Tables Grid to load or start an order.</p>
                <Link href="/pos/tables" className="mt-4 px-4 py-2 bg-[#C86A50] text-white rounded-xl text-xs font-bold shadow-sm hover:bg-[#b3563d]">
                  Go to Tables Grid
                </Link>
              </div>
            ) : cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-[#8e827b] py-16">
                <span className="text-4xl mb-2">🛒</span>
                <p className="text-sm font-semibold">Cart is currently empty</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.productId} className="flex items-center justify-between gap-4 border-b border-[#FAF8F5] pb-3 last:border-0">
                  <div className="flex-1">
                    <h4 className="font-bold text-sm text-[#2C2623] leading-snug">{item.name}</h4>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5">
                      <span className="text-xs text-[#8e827b]">₹{item.price} each</span>
                      {item.sentToKitchenAlready ? (
                        <span className="inline-flex items-center gap-0.5 text-[9px] bg-emerald-50 text-emerald-700 px-1 py-0.25 rounded font-black border border-emerald-100 uppercase tracking-wider">
                          🍳 Sent
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 text-[9px] bg-amber-50 text-amber-600 px-1 py-0.25 rounded font-black border border-amber-100 uppercase tracking-wider">
                          ⏳ Draft
                        </span>
                      )}
                    </div>
                    {item.discountLabel && (
                      <div className="mt-1">
                        <span className="inline-block text-[9px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-bold border border-red-100 uppercase tracking-wide">
                          🎉 {item.discountLabel}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Stepper Controls */}
                  <div className="flex items-center border border-[#E6E1DA] rounded-xl overflow-hidden bg-[#FAF8F5] shadow-inner">
                    <button 
                      onClick={() => handleUpdateQty(item.productId, item.qty - 1)}
                      className="p-1.5 hover:bg-[#EFECE7] text-[#8e827b] hover:text-[#2C2623] transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center text-xs font-bold">{item.qty}</span>
                    <button 
                      onClick={() => handleUpdateQty(item.productId, item.qty + 1)}
                      className="p-1.5 hover:bg-[#EFECE7] text-[#8e827b] hover:text-[#2C2623] transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
 
                  <div className="w-18 text-right shrink-0">
                    {item.lineDiscount > 0 && (
                      <div className="text-[10px] text-[#8e827b] line-through">₹{item.price * item.qty}</div>
                    )}
                    <div className="font-black text-sm text-[#2C2623]">
                      ₹{item.lineTotal || (item.price * item.qty)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Kitchen & Action Buttons */}
          <div className="p-4 bg-[#FAF8F5] border-t border-[#EFECE7] space-y-3 shrink-0">
            
            {/* Send to Kitchen */}
            <button 
              onClick={handleSendToKitchen}
              disabled={!orderId || cart.length === 0}
              className="w-full bg-[#C86A50] hover:bg-[#b3563d] disabled:opacity-50 text-white font-extrabold py-3.5 rounded-2xl shadow-sm hover:shadow active:scale-[0.99] transition-all text-sm cursor-pointer"
            >
              Send to Kitchen
            </button>

            {/* Action Row */}
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => setCustomerModalOpen(true)}
                disabled={!orderId}
                className="flex flex-col items-center justify-center py-2.5 bg-white disabled:opacity-50 border border-[#E6E1DA] hover:border-[#C86A50] rounded-xl text-xs font-bold text-[#8e827b] hover:text-[#C86A50] transition-all shadow-sm cursor-pointer"
              >
                <User size={16} className="mb-1" />
                <span>Customer</span>
              </button>
              <button 
                onClick={handleOpenDiscountModal}
                disabled={!orderId}
                className="flex flex-col items-center justify-center py-2.5 bg-white disabled:opacity-50 border border-[#E6E1DA] hover:border-[#C86A50] rounded-xl text-xs font-bold text-[#8e827b] hover:text-[#C86A50] transition-all shadow-sm cursor-pointer"
              >
                <Percent size={16} className="mb-1" />
                <span>Discount</span>
              </button>
              <button 
                onClick={handleOpenEmailModal}
                disabled={!orderId}
                className="flex flex-col items-center justify-center py-2.5 bg-white disabled:opacity-50 border border-[#E6E1DA] hover:border-[#C86A50] rounded-xl text-xs font-bold text-[#8e827b] hover:text-[#C86A50] transition-all shadow-sm cursor-pointer"
              >
                <Mail size={16} className="mb-1" />
                <span>Send</span>
              </button>
            </div>
          </div>

          {/* Order Summary Block (Calculated from API state directly) */}
          <div className="p-4 border-t border-[#EFECE7] bg-white shrink-0">
            <div className="space-y-2 text-xs font-semibold text-[#8e827b]">
              <div className="flex justify-between">
                <span>Sub total</span>
                <span className="text-[#2C2623]">₹{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-red-600 font-bold">
                  <span>Discounts Applied</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Tax (GST 5%)</span>
                <span className="text-[#2C2623]">₹{tax.toFixed(2)}</span>
              </div>
              
              {/* Grand Total */}
              <div className="flex justify-between font-black text-lg text-[#2C2623] pt-2 border-t border-[#EFECE7] mt-2">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </section>

        {/* COLUMN 3: PAYMENT & NUMPAD (25% width) */}
        <section className="flex-1 flex flex-col bg-[#FAF8F5] h-full shrink-0">
          
          {/* Header */}
          <div className="p-4 border-b border-[#EFECE7] bg-white shrink-0">
            <h2 className="font-black text-lg">Checkout</h2>
          </div>

          {/* Payment Selection Row */}
          <div className="p-4 grid grid-cols-3 gap-2 shrink-0">
            {(["CASH", "UPI", "CARD"] as const).map(method => {
              const isSelected = selectedPayment === method;
              return (
                <button
                  key={method}
                  onClick={() => setSelectedPayment(isSelected ? null : method)}
                  className={`py-3 rounded-2xl font-bold text-xs border transition-all flex items-center justify-center gap-1.5 cursor-pointer relative overflow-hidden ${
                    isSelected 
                      ? "bg-[#251A15] border-[#251A15] text-white shadow" 
                      : "bg-white border-[#E6E1DA] text-[#8e827b] hover:border-[#2C2623]/30"
                  }`}
                >
                  <span>{method}</span>
                  {isSelected && <X size={10} className="text-white/60 hover:text-white" />}
                </button>
              );
            })}
          </div>

          {/* Amount Summary */}
          <div className="px-4 py-2 text-center shrink-0">
            <span className="text-xs font-bold text-[#8e827b] uppercase tracking-wider block mb-1">Amount</span>
            <div className="text-3xl font-black text-[#2C2623]">
              ₹{numPadInput || total.toFixed(2)}
            </div>
            <span className="text-[10px] font-bold text-[#C86A50] mt-1 inline-block uppercase tracking-wider bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
              {selectedPayment ? `${selectedPayment} Payment` : "Select Method"}
            </span>
          </div>

          {/* Confirm Payment Button */}
          <div className="px-4 pb-2">
            <button
              onClick={handleOpenPaymentModal}
              disabled={!selectedPayment || !orderId || cart.length === 0}
              className="w-full bg-[#C86A50] hover:bg-[#b3563d] disabled:opacity-50 text-white font-extrabold py-3.5 rounded-2xl shadow-sm hover:shadow-md transition-all text-xs cursor-pointer uppercase tracking-wider active:scale-98"
            >
              Confirm Payment
            </button>
          </div>

          {/* NumPad Component */}
          <div className="flex-1 p-4 flex flex-col justify-end">
            <NumPad onKeyPress={handleNumPadPress} activeMode={activeNumPadMode} />
          </div>
        </section>

      </div>

      {/* Customer Selection Modal */}
      {customerModalOpen && (
        <div className="fixed inset-0 bg-[#2C2623]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="paper-panel rounded-2xl w-full max-w-2xl animate-in zoom-in-95 duration-200 overflow-hidden shadow-xl border border-[#EFECE7] flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#EFECE7] flex justify-between items-center bg-white shrink-0">
              <h2 className="text-lg font-bold text-cafe-text">Select Customer</h2>
              <button 
                onClick={() => setCustomerModalOpen(false)} 
                className="p-1.5 text-[#8E827B] hover:text-cafe-text rounded-full hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Split: Left = Select/Search Customer, Right = Add New Customer */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-white">
              
              {/* Left Column: List and Search */}
              <div className="w-full md:w-1/2 p-6 border-r border-[#EFECE7] flex flex-col overflow-hidden">
                <label className="block text-xs font-bold text-[#8E827B] uppercase tracking-wider mb-2">Search Customers</label>
                <div className="relative mb-4 shrink-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8e827b]" size={14} />
                  <input 
                    type="text" 
                    placeholder="Search by name, email, or phone..." 
                    value={searchCustomerQuery}
                    onChange={(e) => setSearchCustomerQuery(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E6E1DA] rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-[#C86A50] transition-all"
                  />
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {customersList.length === 0 ? (
                    <div className="text-center py-8 text-[#8e827b] text-xs font-bold">
                      No matching customers found.
                    </div>
                  ) : (
                    customersList.map((c: any) => (
                      <button
                        key={c.id}
                        onClick={() => handleSelectCustomer(c.id)}
                        className="w-full p-3 text-left border border-[#EFECE7] hover:border-[#C86A50] hover:bg-[#FAF8F5]/30 rounded-xl transition-all flex flex-col justify-between gap-1 group cursor-pointer"
                      >
                        <div className="font-extrabold text-xs text-[#2C2623] group-hover:text-[#C86A50]">{c.name}</div>
                        {c.email && <div className="text-[10px] text-[#8e827b]">{c.email}</div>}
                        {c.phone && <div className="text-[10px] text-[#8e827b]">{c.phone}</div>}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Right Column: Create New Customer */}
              <div className="w-full md:w-1/2 p-6 bg-[#FAF8F5]/30 flex flex-col justify-between">
                <form onSubmit={handleCreateCustomer} className="space-y-4">
                  <h3 className="text-xs font-bold text-[#8E827B] uppercase tracking-wider mb-2 border-b border-[#EFECE7] pb-2">Add New Customer</h3>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-[#8E827B] uppercase tracking-wider mb-1">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={newCustomerName}
                      onChange={(e) => setNewCustomerName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E6E1DA] rounded-xl text-xs focus:outline-none" 
                      placeholder="Chef Joy" 
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#8E827B] uppercase tracking-wider mb-1">Email Address</label>
                    <input 
                      type="email" 
                      value={newCustomerEmail}
                      onChange={(e) => setNewCustomerEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E6E1DA] rounded-xl text-xs focus:outline-none" 
                      placeholder="joy@example.com" 
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#8E827B] uppercase tracking-wider mb-1">Phone Number</label>
                    <input 
                      type="text" 
                      value={newCustomerPhone}
                      onChange={(e) => setNewCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E6E1DA] rounded-xl text-xs focus:outline-none" 
                      placeholder="e.g. +91 9999999999" 
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={newCustomerLoading}
                    className="btn-primary w-full justify-center"
                  >
                    {newCustomerLoading ? "Saving..." : "Create & Select"}
                  </button>
                </form>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Discount/Coupon Modal */}
      {discountModalOpen && (
        <div className="fixed inset-0 bg-[#2C2623]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="paper-panel rounded-2xl w-full max-w-md animate-in zoom-in-95 duration-200 overflow-hidden shadow-xl border border-[#EFECE7]">
            <div className="px-6 py-4 border-b border-[#EFECE7] flex justify-between items-center bg-white">
              <h2 className="text-lg font-bold text-cafe-text">Apply Coupon Code</h2>
              <button 
                onClick={() => setDiscountModalOpen(false)} 
                className="p-1.5 text-[#8E827B] hover:text-cafe-text rounded-full hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 space-y-5 bg-white">
              {/* Text Input */}
              <div>
                <label className="block text-xs font-bold text-[#8E827B] uppercase tracking-wider mb-2">Enter Coupon Code</label>
                <input 
                  type="text" 
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value)}
                  className="w-full px-4 py-3 border border-[#E6E1DA] rounded-xl focus:outline-none focus:border-[#C86A50] uppercase text-center font-black tracking-widest text-lg bg-[#FAF8F5]" 
                  placeholder="ENTER CODE" 
                />
              </div>

              {/* Radio Quick Selection */}
              {activeCoupons.length > 0 && (
                <div className="space-y-2.5">
                  <label className="block text-xs font-bold text-[#8E827B] uppercase tracking-wider">Available Active Coupons</label>
                  <div className="grid grid-cols-1 gap-2.5 max-h-40 overflow-y-auto pr-1">
                    {activeCoupons.map((coupon: any) => (
                      <button
                        key={coupon.id}
                        onClick={() => setCouponCodeInput(coupon.code)}
                        className={`w-full p-3 text-left border rounded-xl transition-all flex justify-between items-center cursor-pointer ${
                          couponCodeInput.toUpperCase() === coupon.code.toUpperCase()
                            ? "bg-orange-50 border-[#C86A50] text-[#C86A50]"
                            : "bg-white border-[#EFECE7] text-[#2C2623] hover:border-[#C86A50]/50"
                        }`}
                      >
                        <span className="font-extrabold text-xs">{coupon.code}</span>
                        <span className="text-[10px] font-bold">
                          {coupon.type === "PERCENT" ? `${coupon.value}% Discount` : `₹${coupon.value} Discount`}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-[#EFECE7] bg-[#FAF8F5] flex gap-3">
              <button 
                onClick={() => setDiscountModalOpen(false)} 
                className="flex-1 py-2.5 border border-[#E6E1DA] text-cafe-text rounded-xl font-medium bg-white hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleApplyCoupon(couponCodeInput)}
                className="btn-primary flex-1 justify-center"
              >
                Apply Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Payment Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 bg-[#2C2623]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="paper-panel rounded-2xl w-full max-w-md animate-in zoom-in-95 duration-200 overflow-hidden shadow-xl border border-[#EFECE7] bg-white">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#EFECE7] flex justify-between items-center bg-white">
              <h2 className="text-lg font-bold text-cafe-text flex items-center gap-2">
                <span>Payment details</span>
                <span className="text-xs uppercase bg-orange-50 border border-orange-100 text-[#C86A50] px-2 py-0.5 rounded font-black">
                  {selectedPayment}
                </span>
              </h2>
              <button 
                onClick={() => setPaymentModalOpen(false)} 
                className="p-1.5 text-[#8E827B] hover:text-cafe-text rounded-full hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Total display */}
              <div className="text-center bg-[#FAF8F5] p-5 rounded-2xl border border-[#EFECE7]">
                <span className="text-[10px] font-bold text-[#8e827b] uppercase tracking-wider block mb-1">Grand Total Due</span>
                <div className="text-3xl font-black text-[#2C2623]">₹{total.toFixed(2)}</div>
              </div>

              {/* Render conditional inputs */}
              {selectedPayment === "CASH" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#8E827B] uppercase tracking-wider mb-2">Received Cash Amount (₹)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      required
                      value={cashReceivedInput}
                      onChange={(e) => setCashReceivedInput(e.target.value)}
                      className="w-full px-4 py-3 border border-[#E6E1DA] rounded-xl text-center font-extrabold text-xl focus:outline-none focus:border-[#C86A50]" 
                      placeholder="0.00"
                    />
                  </div>

                  {parseFloat(cashReceivedInput) > 0 && (
                    <div className={`p-4 rounded-xl border text-center transition-all ${
                      parseFloat(cashReceivedInput) >= total 
                        ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                        : "bg-red-50 border-red-100 text-red-700"
                    }`}>
                      {parseFloat(cashReceivedInput) >= total ? (
                        <>
                          <div className="text-[10px] font-bold uppercase tracking-wider mb-0.5">Change Due</div>
                          <div className="text-2xl font-black">
                            ₹{(parseFloat(cashReceivedInput) - total).toFixed(2)}
                          </div>
                        </>
                      ) : (
                        <div className="text-xs font-bold">
                          ⚠️ Insufficient amount (needs ₹{(total - parseFloat(cashReceivedInput)).toFixed(2)} more)
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {selectedPayment === "CARD" && (
                <div>
                  <label className="block text-xs font-bold text-[#8E827B] uppercase tracking-wider mb-2">Transaction Reference ID</label>
                  <input 
                    type="text" 
                    required
                    value={cardTxnRefInput}
                    onChange={(e) => setCardTxnRefInput(e.target.value)}
                    className="w-full px-4 py-3 border border-[#E6E1DA] rounded-xl text-center font-bold text-sm focus:outline-none focus:border-[#C86A50]" 
                    placeholder="e.g. TXN10294827" 
                  />
                  <p className="text-[10px] text-[#8e827b] font-bold mt-2">Enter card processor receipt ID to authorize checkout.</p>
                </div>
              )}

              {selectedPayment === "UPI" && (
                <div className="flex flex-col items-center text-center space-y-4">
                  {upiPaymentMethod ? (
                    <>
                      <div className="p-3 bg-white border border-[#EFECE7] rounded-2xl shadow-sm">
                        <QRCodeSVG 
                          value={`upi://pay?pa=${upiPaymentMethod.upiId}&am=${total.toFixed(2)}`}
                          size={180}
                        />
                      </div>
                      <div>
                        <div className="font-extrabold text-[#2C2623] text-sm">{upiPaymentMethod.upiId}</div>
                        <div className="text-[10px] text-[#8e827b] font-bold mt-1">Scan this dynamic code using any UPI app</div>
                      </div>
                    </>
                  ) : (
                    <div className="py-8 text-[#8e827b] text-xs font-bold">
                      No active UPI gateway configured in Settings.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-[#EFECE7] bg-[#FAF8F5] flex gap-3">
              <button 
                onClick={() => setPaymentModalOpen(false)} 
                className="flex-1 py-2.5 border border-[#E6E1DA] text-cafe-text rounded-xl font-medium bg-white hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmCheckout}
                disabled={
                  checkoutLoading ||
                  (selectedPayment === "CASH" && (parseFloat(cashReceivedInput) || 0) < total) ||
                  (selectedPayment === "CARD" && !cardTxnRefInput.trim()) ||
                  (selectedPayment === "UPI" && !upiPaymentMethod)
                }
                className="btn-primary flex-1 justify-center"
              >
                {checkoutLoading ? "Processing..." : "Confirm Payment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Receipt Modal */}
      {emailModalOpen && (
        <div className="fixed inset-0 bg-[#2C2623]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="paper-panel rounded-2xl w-full max-w-md animate-in zoom-in-95 duration-200 overflow-hidden shadow-xl border border-[#EFECE7] flex flex-col bg-white">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#EFECE7] flex justify-between items-center bg-white shrink-0">
              <h2 className="text-lg font-bold text-cafe-text">Send Receipt via Email</h2>
              <button 
                onClick={() => setEmailModalOpen(false)} 
                className="p-1.5 text-[#8E827B] hover:text-cafe-text rounded-full hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSendEmailReceipt} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#8E827B] uppercase tracking-wider mb-2">Recipient Email Address</label>
                <input 
                  type="email" 
                  required
                  placeholder="name@example.com" 
                  value={receiptEmail}
                  onChange={(e) => setReceiptEmail(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E6E1DA] rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[#C86A50] transition-all text-[#2C2623]"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setEmailModalOpen(false)} 
                  className="flex-1 py-2.5 border border-[#E6E1DA] text-cafe-text rounded-xl font-medium bg-white hover:bg-[#FAF8F5] transition-colors cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={emailSending || !receiptEmail.trim()}
                  className="flex-1 py-2.5 rounded-xl font-bold cursor-pointer active:scale-98 disabled:opacity-50 flex items-center justify-center gap-1.5 text-xs text-white bg-[#C86A50] hover:bg-[#b3563d]"
                >
                  {emailSending ? "Sending..." : "Send Receipt"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable NumPad Component
interface NumPadProps {
  onKeyPress: (key: string) => void;
  activeMode: "Prices" | "Disc." | "Qty" | null;
}

function NumPad({ onKeyPress, activeMode }: NumPadProps) {
  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "+/-", "0", "clear"];
  const sideButtons = ["Prices", "Disc.", "Qty"];

  return (
    <div className="flex gap-2.5 w-full max-w-sm mx-auto">
      
      {/* 4x3 Digits Grid */}
      <div className="grid grid-cols-3 gap-2 flex-1">
        {digits.map(key => (
          <button
            key={key}
            onClick={() => onKeyPress(key)}
            className="aspect-[4/3] bg-white border border-[#E6E1DA] hover:border-[#C86A50] text-[#2C2623] hover:text-[#C86A50] font-black text-lg rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
          >
            {key === "clear" ? "C" : key}
          </button>
        ))}
      </div>

      {/* Side Control Buttons */}
      <div className="flex flex-col gap-2 w-20 shrink-0">
        {sideButtons.map(btn => {
          const isActive = activeMode === btn;
          return (
            <button
              key={btn}
              onClick={() => onKeyPress(btn)}
              className={`flex-1 text-xs font-bold border rounded-xl transition-all cursor-pointer flex items-center justify-center shadow-sm active:scale-95 ${
                isActive 
                  ? "bg-[#C86A50] border-[#C86A50] text-white" 
                  : "bg-white border-[#E6E1DA] text-[#8e827b] hover:border-[#C86A50]"
              }`}
            >
              {btn}
            </button>
          );
        })}
      </div>

    </div>
  );
}
