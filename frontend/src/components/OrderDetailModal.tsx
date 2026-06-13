import { useRouter } from "next/navigation";
import { Order, useOrderStore } from "@/store/useOrderStore";
import { usePOSStore } from "@/store/usePOSStore";
import { X, Trash2, Edit } from "lucide-react";

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export default function OrderDetailModal({ isOpen, onClose, order }: OrderDetailModalProps) {
  const router = useRouter();
  const { deleteOrder } = useOrderStore();
  const { cart, addToCart, clearCart } = usePOSStore();

  if (!isOpen || !order) return null;

  const handleEdit = () => {
    // Clear current cart and load this order's items
    clearCart();
    order.items.forEach(item => {
      // we mock add by looping based on quantity for simplicity or just load directly
      for (let i = 0; i < item.quantity; i++) {
        addToCart(item.product);
      }
    });
    // Delete the draft order since it's now in the active cart
    deleteOrder(order.id);
    onClose();
    router.push("/pos");
  };

  const handleDelete = () => {
    deleteOrder(order.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-cafe-card w-full max-w-lg rounded-2xl shadow-2xl border border-gray-700 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-white">Order Details</h2>
            <p className="text-sm text-gray-400">{order.orderNumber}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Info */}
        <div className="p-6 border-b border-gray-700 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500 block mb-1">Date</span>
            <span className="text-white font-medium">{new Date(order.date).toLocaleString()}</span>
          </div>
          <div>
            <span className="text-gray-500 block mb-1">Customer</span>
            <span className="text-white font-medium">{order.customerName || "Walk-in"}</span>
          </div>
          <div>
            <span className="text-gray-500 block mb-1">Status</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              order.status === "Paid" ? "bg-green-500/20 text-green-500" :
              order.status === "Cancelled" ? "bg-red-500/20 text-red-500" :
              "bg-gray-500/20 text-gray-300"
            }`}>
              {order.status}
            </span>
          </div>
          <div>
            <span className="text-gray-500 block mb-1">Amount</span>
            <span className="text-white font-medium">${order.amount.toFixed(2)}</span>
          </div>
          {order.paymentMethod && (
            <div>
              <span className="text-gray-500 block mb-1">Payment Method</span>
              <span className="text-white font-medium">{order.paymentMethod}</span>
            </div>
          )}
        </div>

        {/* Items */}
        <div className="p-6 overflow-y-auto flex-1">
          <h3 className="font-semibold text-gray-300 mb-3">Line Items</h3>
          <div className="flex flex-col gap-3">
            {order.items.length === 0 ? (
              <p className="text-gray-500 text-sm">No items in this order.</p>
            ) : (
              order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center bg-[#1e1e1e] p-3 rounded-lg border border-gray-700">
                  <div className="flex gap-3 items-center">
                    <span className="font-bold text-cafe-primary w-6">{item.quantity}x</span>
                    <span className="text-gray-200">{item.product.name}</span>
                  </div>
                  <span className="font-medium text-white">${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Actions (Only for Drafts) */}
        {order.status === "Draft" && (
          <div className="p-6 border-t border-gray-700 bg-[#1e1e1e] flex gap-3">
            <button 
              onClick={handleDelete}
              className="flex-1 flex justify-center items-center gap-2 py-3 rounded-xl border border-cafe-danger text-cafe-danger hover:bg-cafe-danger/10 transition-colors font-medium"
            >
              <Trash2 size={18} /> Delete
            </button>
            <button 
              onClick={handleEdit}
              className="flex-1 flex justify-center items-center gap-2 py-3 rounded-xl bg-cafe-primary text-white hover:bg-red-700 transition-colors font-medium shadow-md"
            >
              <Edit size={18} /> Edit Order
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
