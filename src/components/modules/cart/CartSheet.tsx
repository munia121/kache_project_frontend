"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { X, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuthStore } from "@/store/useAuthStore";
import { CartItemRow } from "./CartItemRow";

export function CartSheet() {
  const router = useRouter();
  const {
    isCartOpen,
    setIsCartOpen,
    items,
    subtotal,
    cartCount,
    updateQuantity,
    removeFromCart,
  } = useCart();
  const { isAuthenticated } = useAuthStore();

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCartOpen) {
        setIsCartOpen(false);
      }
    };

    if (isCartOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isCartOpen, setIsCartOpen]);

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    setIsCartOpen(false);
    // NON-NEGOTIABLE CONSTRAINT: NO MODAL for unauthenticated checkout
    if (!isAuthenticated) {
      router.push("/login?callbackUrl=/cart");
      return;
    }
    router.push("/checkout");
  };

  const handleNavigateToCartPage = () => {
    setIsCartOpen(false);
    router.push("/cart");
  };

  const subtotalFormatted = `৳${subtotal.toLocaleString("bn-BD")}`;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={() => setIsCartOpen(false)}
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-3 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
          {/* Drawer Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-orange-100 text-[#FF6F0F] flex items-center justify-center shrink-0">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 leading-tight">
                  আপনার শপিং কার্ট
                </h2>
                <p className="text-xs text-slate-500">
                  {cartCount > 0 ? `${cartCount} টি পণ্য নির্বাচিত` : "কার্ট খালি"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close cart drawer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="h-20 w-20 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-400">
                  <ShoppingBag className="h-10 w-10 stroke-[1.5]" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-800">
                    আপনার কার্ট বর্তমানে খালি
                  </h3>
                  <p className="text-xs text-slate-500 max-w-60">
                    আপনার আশেপাশের চমৎকার স্থানীয় পণ্যগুলো ব্রাউজ করুন এবং কার্টে যোগ করুন।
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    router.push("/products");
                  }}
                  className="px-5 py-2.5 rounded-full bg-[#FF6F0F] hover:bg-[#F95738] text-white font-bold text-xs shadow-sm shadow-orange-500/20 transition-all cursor-pointer"
                >
                  পণ্য ব্রাউজ করুন
                </button>
              </div>
            ) : (
              items.map((item) => (
                <CartItemRow
                  key={item.id || item.productId}
                  item={item}
                  compact
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeFromCart}
                />
              ))
            )}
          </div>

          {/* Drawer Footer */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70 space-y-3 shrink-0">
              {/* Subtotal Row */}
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-600">সাবটোটাল</span>
                <span className="text-lg font-black text-[#FF6F0F]">
                  {subtotalFormatted}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 text-center">
                ডেলিভারি চার্জ ও ট্যাক্স পরবর্তী ধাপে সমন্বয় করা হবে
              </p>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleCheckout}
                  className="w-full h-11 rounded-xl bg-[#FF6F0F] hover:bg-[#F95738] text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-98"
                >
                  <span>অর্ডার সম্পন্ন করুন</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={handleNavigateToCartPage}
                  className="w-full h-10 rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50/50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <span>সম্পূর্ণ কার্ট পেজ দেখুন</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CartSheet;
