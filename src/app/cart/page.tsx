"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Store,
  ChevronLeft,
  ShieldCheck,
  PackageOpen,
  Phone,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuthStore } from "@/store/useAuthStore";
import { CartItemRow } from "@/components/modules/cart/CartItemRow";
import { CartSummary } from "@/components/modules/cart/CartSummary";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/share/Footer";
import { ICartItem } from "@/types/cart.types";

interface SellerGroup {
  sellerId: string;
  sellerName: string;
  sellerPhone?: string;
  shopName?: string;
  items: ICartItem[];
}

export default function CartPage() {
  const router = useRouter();
  const { items, cartCount, subtotal, updateQuantity, removeFromCart, clearCart } =
    useCart();
  const { isAuthenticated } = useAuthStore();

  // Group items by seller (sellerId / sellerName)
  const sellerGroups = React.useMemo(() => {
    const groups: Record<string, SellerGroup> = {};

    items.forEach((item) => {
      const sId =
        item.product?.sellerId ||
        item.product?.seller?.id ||
        item.product?.sellerName ||
        "seller-unknown";

      const sName =
        item.product?.seller?.shopName ||
        item.product?.seller?.fullName ||
        item.product?.sellerName ||
        "ব্যক্তিগত বিক্রেতা";

      if (!groups[sId]) {
        groups[sId] = {
          sellerId: sId,
          sellerName: sName,
          sellerPhone: item.product?.seller?.phone,
          shopName: item.product?.seller?.shopName || undefined,
          items: [],
        };
      }
      groups[sId].items.push(item);
    });

    return Object.values(groups);
  }, [items]);

  // Checkout Guard:
  // NON-NEGOTIABLE CONSTRAINT: NO MODAL for unauthenticated checkout
  const handleCheckout = () => {
    if (!isAuthenticated) {
      router.push("/login?callbackUrl=/cart");
      return;
    }
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-6">
          <Link
            href="/"
            className="hover:text-[#FF6F0F] transition-colors flex items-center gap-1"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>হোম</span>
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">শপিং কার্ট</span>
        </div>

        {/* Page Title & Clear Cart Action */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-200/80 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              শপিং কার্ট
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {cartCount > 0
                ? `মোট ${cartCount} টি পণ্য নির্বাচিত আছে`
                : "কার্টে কোনো পণ্য যোগ করা হয়নি"}
            </p>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="text-xs font-semibold text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200/60 transition-colors cursor-pointer"
            >
              কার্ট খালি করুন
            </button>
          )}
        </div>

        {/* Empty State */}
        {items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-16 text-center max-w-xl mx-auto shadow-xs my-8">
            <div className="h-24 w-24 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF6F0F] mx-auto mb-5 shadow-inner">
              <PackageOpen className="h-12 w-12 stroke-[1.5]" />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
              আপনার কার্ট বর্তমানে খালি আছে
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto mb-6">
              আপনার আশেপাশের প্রতিবেশীদের দেওয়া বিজ্ঞাপনের চমৎকার পণ্যগুলো খুঁজুন এবং পছন্দের পণ্য সহজে কার্টে যুক্ত করুন।
            </p>

            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#FF6F0F] hover:bg-[#F95738] text-white font-bold text-sm shadow-md shadow-orange-500/25 transition-all cursor-pointer"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>পণ্য ব্রাউজ করুন</span>
            </Link>
          </div>
        ) : (
          /* Two-Column Responsive Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            {/* Left Column: Items grouped by seller (8 Cols) */}
            <div className="lg:col-span-8 space-y-6">
              {sellerGroups.map((group) => {
                const groupSubtotal = group.items.reduce(
                  (acc, i) =>
                    acc +
                    (i.itemSubtotal ||
                      (i.unitPrice || i.product?.price || 0) * (i.quantity || 1)),
                  0
                );

                return (
                  <div
                    key={group.sellerId}
                    className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden"
                  >
                    {/* Seller Header */}
                    <div className="px-5 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-xl bg-orange-100 text-[#FF6F0F] flex items-center justify-center shrink-0">
                          <Store className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900">
                              {group.sellerName}
                            </span>
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              বিক্রেতা
                            </span>
                          </div>
                          {group.sellerPhone && (
                            <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                              <Phone className="h-3 w-3" />
                              <span>{group.sellerPhone}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <span className="text-xs font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-200">
                        {group.items.length} টি পণ্য
                      </span>
                    </div>

                    {/* Items List */}
                    <div className="p-4 sm:p-5 space-y-3">
                      {group.items.map((item) => (
                        <CartItemRow
                          key={item.id || item.productId}
                          item={item}
                          onUpdateQuantity={updateQuantity}
                          onRemove={removeFromCart}
                        />
                      ))}
                    </div>

                    {/* Seller Group Footer Subtotal */}
                    <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-semibold text-slate-600">
                        এই বিক্রেতার মোট মূল্য:
                      </span>
                      <span className="font-extrabold text-slate-900">
                        ৳{groupSubtotal.toLocaleString("bn-BD")}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Safety notice info card */}
              <div className="p-4 sm:p-5 rounded-3xl bg-blue-50/70 border border-blue-200/80 flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-blue-900 leading-relaxed space-y-1">
                  <p className="font-bold">কাছে নিরাপদ ডেলিভারি প্রতিশ্রুতি</p>
                  <p className="text-blue-800/90 text-xs">
                    প্রতিটি বিক্রেতার সাথে পণ্যের অবস্থা এবং ডেলিভারি চার্জ নিশ্চিত করে অর্ডার সম্পন্ন করুন। সরাসরি পণ্য বুঝে পেয়ে মূল্য পরিশোধ করাই নিরাপদ।
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary Card (4 Cols) */}
            <div className="lg:col-span-4 sticky top-24">
              <CartSummary
                subtotal={subtotal}
                itemCount={cartCount}
                onCheckout={handleCheckout}
                callbackUrl="/cart"
              />
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
