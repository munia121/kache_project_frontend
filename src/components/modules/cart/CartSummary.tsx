"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { ArrowRight, ShieldCheck, Truck, Loader2 } from "lucide-react";

interface CartSummaryProps {
  subtotal: number;
  itemCount: number;
  onCheckout?: () => void;
  callbackUrl?: string;
  isCartSheet?: boolean;
}

export function CartSummary({
  subtotal,
  itemCount,
  onCheckout,
  callbackUrl = "/cart",
  isCartSheet = false,
}: CartSummaryProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const subtotalFormatted = `৳${subtotal.toLocaleString("bn-BD")}`;

  const handleCheckoutClick = () => {
    if (onCheckout) {
      onCheckout();
      return;
    }

    setIsSubmitting(true);
    // NON-NEGOTIABLE CONSTRAINT: NO MODAL for unauthenticated checkout
    if (!isAuthenticated) {
      const redirectUrl = `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;
      router.push(redirectUrl);
      return;
    }

    router.push("/checkout");
  };

  return (
    <div
      className={`rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between ${
        isCartSheet ? "p-4 space-y-3" : "p-6 sm:p-7 space-y-5"
      }`}
    >
      <div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
          অর্ডার বিবরণী (Order Summary)
        </h3>

        {/* Breakdown Items */}
        <div className="space-y-2.5 pt-4 text-xs sm:text-sm text-slate-600">
          <div className="flex items-center justify-between">
            <span>মোট পণ্য (Total Items)</span>
            <span className="font-semibold text-slate-800">{itemCount} টি</span>
          </div>

          <div className="flex items-center justify-between">
            <span>সাবটোটাল (Subtotal)</span>
            <span className="font-bold text-slate-900">{subtotalFormatted}</span>
          </div>

          <div className="flex items-start justify-between gap-2 pt-1 border-t border-slate-100">
            <span className="flex items-center gap-1.5 text-slate-600">
              <Truck className="h-4 w-4 text-[#FF6F0F] shrink-0" />
              <span>ডেলিভারি চার্জ</span>
            </span>
            <span className="text-[11px] sm:text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-right">
              আলোচনা সাপেক্ষে
            </span>
          </div>
        </div>

        {/* Hyperlocal Shipping Notice */}
        <div className="mt-3.5 p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-[11px] sm:text-xs text-amber-900/90 space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <ShieldCheck className="h-3.5 w-3.5 text-amber-600 shrink-0" />
            <span>লোকাল ডেলিভারি নোটিশ</span>
          </div>
          <p className="leading-relaxed">
            লোকাল ডেলিভারি বা পিকআপের বিস্তারিত চার্জ বিক্রেতার সাথে সরাসরি যোগাযোগের মাধ্যমে চূড়ান্ত হবে।
          </p>
        </div>

        {/* Total Row */}
        <div className="flex items-baseline justify-between pt-4 mt-3 border-t border-slate-200/80">
          <div>
            <span className="text-xs sm:text-sm font-bold text-slate-900 block">
              সর্বমোট (Total Amount)
            </span>
            <span className="text-[10px] text-slate-400">ভ্যাট ও ট্যাক্স অন্তর্ভুক্ত</span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-[#FF6F0F] tracking-tight">
            {subtotalFormatted}
          </span>
        </div>
      </div>

      {/* Checkout CTA */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleCheckoutClick}
          disabled={itemCount === 0 || isSubmitting}
          className="w-full h-12 rounded-2xl bg-[#FF6F0F] hover:bg-[#F95738] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md shadow-orange-500/25 cursor-pointer flex items-center justify-center gap-2 transition-all active:scale-98"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>প্রসেসিং হচ্ছে...</span>
            </>
          ) : (
            <>
              <span>অর্ডার সম্পন্ন করুন</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default CartSummary;
