"use client";

import React, { useState } from "react";
import Script from "next/script";
import api from "@/api/axios";
import toast from "react-hot-toast";

interface RazorpayCheckoutProps {
  amount: number; // in INR
  onSuccess?: () => void;
  onFailure?: () => void;
  buttonText?: string;
  className?: string;
}

export default function RazorpayCheckout({
  amount,
  onSuccess,
  onFailure,
  buttonText = "Pay Now",
  className = "",
}: RazorpayCheckoutProps) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (typeof window === "undefined" || !(window as any).Razorpay) {
      toast.error("Razorpay SDK is not loaded yet. Please try again.");
      return;
    }

    setLoading(true);

    try {
      // 1. Create order on the backend
      const { data: order } = await api.post("/payments/create-order", {
        amount,
      });

      if (!order || !order.id) {
        throw new Error("Failed to create order");
      }

      // 2. Initialize Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "CafePOS",
        description: "Order Payment",
        order_id: order.id,
        handler: async function (response: any) {
          try {
            // 3. Verify payment on the backend
            const verifyRes = await api.post("/payments/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              toast.success("Payment successful!");
              if (onSuccess) onSuccess();
            } else {
              toast.error("Payment verification failed!");
              if (onFailure) onFailure();
            }
          } catch (error) {
            console.error("Payment Verification Error:", error);
            toast.error("Payment verification failed due to server error.");
            if (onFailure) onFailure();
          }
        },
        theme: {
          color: "#C86A50",
        },
      };

      // 4. Open Razorpay Checkout
      const rzp = new (window as any).Razorpay(options);

      rzp.on("payment.failed", function (response: any) {
        console.error("Payment Failed:", response.error);
        toast.error(`Payment failed: ${response.error.description}`);
        if (onFailure) onFailure();
      });

      rzp.open();
    } catch (error: any) {
      console.error("Checkout Initialization Error:", error);
      toast.error(
        error.response?.data?.error || "Failed to initialize checkout."
      );
      if (onFailure) onFailure();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
        onError={() => {
          console.error("Razorpay SDK failed to load");
          toast.error("Failed to load payment gateway");
        }}
      />
      <button
        onClick={handlePayment}
        disabled={loading || amount <= 0}
        className={className || "px-4 py-2 bg-[#C86A50] text-white rounded-lg font-bold hover:bg-[#b3563d] disabled:opacity-50 transition-colors"}
      >
        {loading ? "Processing..." : buttonText}
      </button>
    </>
  );
}
