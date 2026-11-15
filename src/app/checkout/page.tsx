/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Truck,
  Banknote,
  MapPin,
  Phone,
  User,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Package,
  Loader2,
  ArrowRight,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuthStore } from "@/store/useAuthStore";
import { orderService } from "@/services/order.service";
import { CheckoutPayload, IOrder } from "@/types/order.types";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/share/Footer";
import { toast } from "sonner";

// Common areas for quick selection or suggestions
const POPULAR_AREAS = [
  "ধানমন্ডি, ঢাকা",
  "মিরপুর, ঢাকা",
  "গুলশান, ঢাকা",
  "উত্তরা, ঢাকা",
  "বনানী, ঢাকা",
  "মোহাম্মদপুর, ঢাকা",
  "বসুন্ধরা আবাসিক এলাকা, ঢাকা",
  "বাড্ডা / রামপুরা, ঢাকা",
  "মতিঝিল / পল্টন, ঢাকা",
  "চট্টগ্রাম সদর, চট্টগ্রাম",
  "সিলেট সদর, সিলেট",
  "রাজশাহী সদর, রাজশাহী",
  "খুলনা সদর, খুলনা",
  "বরিশাল সদর, বরিশাল",
  "রংপুর সদর, রংপুর",
  "ময়মনসিংহ সদর, ময়মনসিংহ",
];

const STANDARD_DELIVERY_FEE = 60;

interface AxiosErrorEnvelope {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart, isLoading: isCartLoading } = useCart();
  const { user, isAuthenticated, hasHydrated } = useAuthStore();

  // Form Fields State (initialized with current user if already hydrated)
  const [customerName, setCustomerName] = React.useState<string>(() => user?.fullName || "");
  const [customerPhone, setCustomerPhone] = React.useState<string>(() => user?.phoneNumber || user?.phone || "");
  const [cityArea, setCityArea] = React.useState<string>(() => user?.locationArea?.name || user?.area || "");
  const [shippingAddress, setShippingAddress] = React.useState<string>(() => user?.address || "");
  const [deliveryNote, setDeliveryNote] = React.useState<string>("");

  // Validation & Submission State
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  // Pre-fill fields once user state hydrates
  React.useEffect(() => {
    if (user) {
      if (!customerName && user.fullName) {
        setCustomerName(user.fullName);
      }
      if (!customerPhone && (user.phoneNumber || user.phone)) {
        setCustomerPhone(user.phoneNumber || user.phone || "");
      }
      if (!shippingAddress && user.address) {
        setShippingAddress(user.address);
      }
      if (!cityArea && (user.locationArea?.name || user.area)) {
        setCityArea(user.locationArea?.name || user.area || "");
      }
    }
  }, [user, customerName, customerPhone, shippingAddress, cityArea]);

  // Auth Redirect Guard
  React.useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      toast.error("চেকআউট করতে প্রথমে লগইন করুন");
      router.push("/login?callbackUrl=/checkout");
    }
  }, [hasHydrated, isAuthenticated, router]);

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Customer Name Validation
    if (!customerName.trim()) {
      newErrors.customerName = "পূর্ণ নাম আবশ্যক";
    } else if (customerName.trim().length < 2) {
      newErrors.customerName = "পূর্ণ নাম ন্যূনতম ২ অক্ষরের হতে হবে";
    }

    // Phone Number Validation: 11-digit BD number
    const cleanedPhone = customerPhone.trim().replace(/[\s-]/g, "");
    const bdPhoneRegex = /^01[3-9]\d{8}$/;
    if (!cleanedPhone) {
      newErrors.customerPhone = "সচল মোবাইল নম্বর আবশ্যক";
    } else if (!bdPhoneRegex.test(cleanedPhone)) {
      newErrors.customerPhone =
        "১১ ডিজিটের সঠিক বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 01XXXXXXXXX)";
    }

    // City & Area Validation
    if (!cityArea.trim()) {
      newErrors.cityArea = "জেলা বা এলাকা উল্লেখ করুন";
    }

    // Shipping Address Validation: Minimum 5 characters
    if (!shippingAddress.trim()) {
      newErrors.shippingAddress = "সুনির্দিষ্ট ডেলিভারি ঠিকানা আবশ্যক";
    } else if (shippingAddress.trim().length < 5) {
      newErrors.shippingAddress =
        "ডেলিভারি ঠিকানা ন্যূনতম ৫ অক্ষরের হতে হবে (বাড়ি, রোড, এলাকা উল্লেখ করুন)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Form Submission
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("অনুগ্রহ করে ফর্মের প্রয়োজনীয় তথ্যগুলো সঠিকভাবে পূরণ করুন");
      return;
    }

    if (items.length === 0) {
      toast.error("আপনার কার্ট বর্তমানে খালি আছে");
      return;
    }

    setIsSubmitting(true);

    try {
      const cleanedPhone = customerPhone.trim().replace(/[\s-]/g, "");

      // Compile detailed shipping address for delivery logistics
      const detailedShippingAddress = [
        shippingAddress.trim(),
        cityArea.trim(),
        deliveryNote.trim() ? `[নোট: ${deliveryNote.trim()}]` : "",
      ]
        .filter(Boolean)
        .join(", ");

      const payload: CheckoutPayload = {
        shippingAddress: detailedShippingAddress,
        customerPhone: cleanedPhone,
        customerName: customerName.trim(),
        paymentMethod: "COD",
        deliveryNote: deliveryNote.trim() || undefined,
        cityArea: cityArea.trim() || undefined,
        items: items.map((item) => ({
          productId: item.productId || item.product?.id || item.id,
          quantity: item.quantity || 1,
        })),
      };

      const res = await orderService.placeCodOrder(payload);

      // Extract generated order id safely across response envelopes
      const orderPayload = res?.data as (IOrder & { data?: IOrder }) | undefined;
      const orderId =
        orderPayload?.id ||
        orderPayload?.data?.id ||
        (res as unknown as { id?: string })?.id;

      if (!orderId) {
        throw new Error(res?.message || "অর্ডার আইডি পাওয়া যায়নি");
      }

      // Step 2 requirement: Clear cart state upon successful placement
      await clearCart();

      // Show confirmation toast
      toast.success("আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে!");

      // Redirect to aesthetic Order Confirmation screen
      router.push(`/order-success/${orderId}`);
    } catch (err: unknown) {
      console.error("Order checkout error:", err);
      const errorObj = err as AxiosErrorEnvelope;
      const errMsg =
        errorObj?.response?.data?.message ||
        errorObj?.message ||
        "অর্ডার সম্পন্ন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।";
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delivery Calculations
  const deliveryFee = STANDARD_DELIVERY_FEE;
  const grandTotal = subtotal + deliveryFee;

  const subtotalFormatted = `৳${subtotal.toLocaleString("bn-BD")}`;
  const deliveryFeeFormatted = `৳${deliveryFee.toLocaleString("bn-BD")}`;
  const grandTotalFormatted = `৳${grandTotal.toLocaleString("bn-BD")}`;

  // Loading state while checking auth
  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-[#FF6F0F] mb-3" />
          <p className="text-sm font-semibold text-slate-600">
            লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...
          </p>
        </div>
        <Footer />
      </div>
    );
  }

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
          <Link
            href="/cart"
            className="hover:text-[#FF6F0F] transition-colors"
          >
            শপিং কার্ট
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">চেকআউট</span>
        </div>

        {/* Page Header */}
        <div className="pb-6 border-b border-slate-200/80 mb-8">
          <div className="flex items-center gap-2 text-xs font-bold text-[#FF6F0F] uppercase tracking-wider mb-1">
            <Sparkles className="h-4 w-4" />
            <span>নিরাপদ চেকআউট</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            অর্ডার সম্পন্ন করুন
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            আপনার সঠিক ডেলিভারি ঠিকানা এবং যোগাযোগের তথ্য প্রদান করুন। পণ্য হাতে পাওয়ার পর মূল্য পরিশোধ করুন।
          </p>
        </div>

        {/* Empty Cart Warning */}
        {items.length === 0 && !isCartLoading ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-14 text-center max-w-xl mx-auto shadow-xs my-8">
            <div className="h-20 w-20 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF6F0F] mx-auto mb-4">
              <ShoppingBag className="h-10 w-10 stroke-[1.5]" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              আপনার কার্ট বর্তমানে খালি আছে
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mb-6">
              চেকআউট করতে প্রথমে পছন্দের পণ্য কার্টে যুক্ত করুন।
            </p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#FF6F0F] hover:bg-[#F95738] text-white font-bold text-sm shadow-md shadow-orange-500/25 transition-all"
            >
              <span>পণ্য ব্রাউজ করুন</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          /* 2-Column Responsive Layout */
          <form onSubmit={handlePlaceOrder} noValidate>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
              {/* Left Column: Shipping & Payment Selection (7 Cols) */}
              <div className="lg:col-span-7 space-y-6">
                {/* 1. Shipping Information Form Card */}
                <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs">
                  <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-5">
                    <div className="h-9 w-9 rounded-xl bg-orange-100 text-[#FF6F0F] flex items-center justify-center shrink-0">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-slate-900">
                        শিপিং তথ্য (Shipping Information)
                      </h2>
                      <p className="text-xs text-slate-400">
                        যে ঠিকানায় আপনার পণ্য পৌঁছে দেওয়া হবে
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Customer Full Name */}
                    <div>
                      <label
                        htmlFor="customerName"
                        className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5"
                      >
                        পূর্ণ নাম (Customer Name) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <User className="h-4 w-4" />
                        </div>
                        <input
                          id="customerName"
                          type="text"
                          value={customerName}
                          onChange={(e) => {
                            setCustomerName(e.target.value);
                            if (errors.customerName) {
                              setErrors((prev) => ({ ...prev, customerName: "" }));
                            }
                          }}
                          placeholder="আপনার পুরো নাম লিখুন"
                          className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm border bg-slate-50/50 transition-colors focus:bg-white focus:outline-none ${
                            errors.customerName
                              ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                              : "border-slate-200 focus:border-[#FF6F0F] focus:ring-2 focus:ring-orange-100"
                          }`}
                        />
                      </div>
                      {errors.customerName && (
                        <p className="text-xs text-rose-500 mt-1 font-medium">
                          {errors.customerName}
                        </p>
                      )}
                    </div>

                    {/* Active Phone Number */}
                    <div>
                      <label
                        htmlFor="customerPhone"
                        className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5"
                      >
                        সচল মোবাইল নম্বর (Phone Number) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Phone className="h-4 w-4" />
                        </div>
                        <input
                          id="customerPhone"
                          type="tel"
                          maxLength={11}
                          value={customerPhone}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            setCustomerPhone(val);
                            if (errors.customerPhone) {
                              setErrors((prev) => ({ ...prev, customerPhone: "" }));
                            }
                          }}
                          placeholder="01XXXXXXXXX"
                          className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm border bg-slate-50/50 transition-colors focus:bg-white focus:outline-none ${
                            errors.customerPhone
                              ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                              : "border-slate-200 focus:border-[#FF6F0F] focus:ring-2 focus:ring-orange-100"
                          }`}
                        />
                      </div>
                      {errors.customerPhone ? (
                        <p className="text-xs text-rose-500 mt-1 font-medium">
                          {errors.customerPhone}
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-400 mt-1">
                          ডেলিভারি ম্যান এই নম্বরে যোগাযোগ করবেন (যেমন: 01712345678)
                        </p>
                      )}
                    </div>

                    {/* City & Hyperlocal Area */}
                    <div>
                      <label
                        htmlFor="cityArea"
                        className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5"
                      >
                        জেলা ও এলাকা (City / Hyperlocal Area) <span className="text-rose-500">*</span>
                      </label>
                      <div className="space-y-2">
                        <div className="relative">
                          <input
                            id="cityArea"
                            type="text"
                            list="area-suggestions"
                            value={cityArea}
                            onChange={(e) => {
                              setCityArea(e.target.value);
                              if (errors.cityArea) {
                                setErrors((prev) => ({ ...prev, cityArea: "" }));
                              }
                            }}
                            placeholder="যেমন: মিরপুর ১০, ঢাকা বা ধানমন্ডি"
                            className={`w-full px-3.5 py-2.5 rounded-xl text-sm border bg-slate-50/50 transition-colors focus:bg-white focus:outline-none ${
                              errors.cityArea
                                ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                                : "border-slate-200 focus:border-[#FF6F0F] focus:ring-2 focus:ring-orange-100"
                            }`}
                          />
                          <datalist id="area-suggestions">
                            {POPULAR_AREAS.map((area) => (
                              <option key={area} value={area} />
                            ))}
                          </datalist>
                        </div>

                        {/* Quick Selection Pills */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {["মিরপুর, ঢাকা", "ধানমন্ডি, ঢাকা", "গুলশান, ঢাকা", "উত্তরা, ঢাকা"].map(
                            (quickArea) => (
                              <button
                                key={quickArea}
                                type="button"
                                onClick={() => {
                                  setCityArea(quickArea);
                                  if (errors.cityArea) {
                                    setErrors((prev) => ({ ...prev, cityArea: "" }));
                                  }
                                }}
                                className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-orange-50 hover:text-[#FF6F0F] text-slate-600 transition-colors cursor-pointer border border-slate-200/60"
                              >
                                {quickArea}
                              </button>
                            )
                          )}
                        </div>
                      </div>
                      {errors.cityArea && (
                        <p className="text-xs text-rose-500 mt-1 font-medium">
                          {errors.cityArea}
                        </p>
                      )}
                    </div>

                    {/* Detailed Delivery Address (Textarea) */}
                    <div>
                      <label
                        htmlFor="shippingAddress"
                        className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5"
                      >
                        সুনির্দিষ্ট ডেলিভারি ঠিকানা (Detailed Delivery Address){" "}
                        <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        id="shippingAddress"
                        rows={3}
                        value={shippingAddress}
                        onChange={(e) => {
                          setShippingAddress(e.target.value);
                          if (errors.shippingAddress) {
                            setErrors((prev) => ({ ...prev, shippingAddress: "" }));
                          }
                        }}
                        placeholder="বাসা/ফ্ল্যাট নম্বর, রোড নম্বর, বিল্ডিং নাম বা আশেপাশের পরিচিত স্থান..."
                        className={`w-full px-3.5 py-2.5 rounded-xl text-sm border bg-slate-50/50 transition-colors focus:bg-white focus:outline-none resize-none ${
                          errors.shippingAddress
                            ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                            : "border-slate-200 focus:border-[#FF6F0F] focus:ring-2 focus:ring-orange-100"
                        }`}
                      />
                      {errors.shippingAddress ? (
                        <p className="text-xs text-rose-500 mt-1 font-medium">
                          {errors.shippingAddress}
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          ন্যূনতম ৫ অক্ষর হতে হবে
                        </p>
                      )}
                    </div>

                    {/* Delivery Note (Optional) */}
                    <div>
                      <label
                        htmlFor="deliveryNote"
                        className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5"
                      >
                        ডেলিভারি নোট (Optional Note)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <FileText className="h-4 w-4" />
                        </div>
                        <input
                          id="deliveryNote"
                          type="text"
                          value={deliveryNote}
                          onChange={(e) => setDeliveryNote(e.target.value)}
                          placeholder="যেমন: গেটের গার্ডের কাছে রেখে যাবেন, কল করে আসবেন ইত্যাদি"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-slate-50/50 transition-colors focus:bg-white focus:outline-none focus:border-[#FF6F0F] focus:ring-2 focus:ring-orange-100"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Payment Method Card (Single Active Card) */}
                <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs">
                  <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-5">
                    <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <Banknote className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-slate-900">
                        পেমেন্ট পদ্ধতি (Payment Option)
                      </h2>
                      <p className="text-xs text-slate-400">
                        আপনার জন্য সম্পূর্ণ ক্যাশ অন ডেলিভারি সুবিধা
                      </p>
                    </div>
                  </div>

                  {/* High Visibility COD Card */}
                  <div className="relative rounded-2xl border-2 border-[#FF6F0F] bg-orange-50/40 p-4 sm:p-5 transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3.5">
                        <div className="h-10 w-10 rounded-xl bg-[#FF6F0F] text-white flex items-center justify-center shrink-0 shadow-xs shadow-orange-500/20">
                          <Truck className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm sm:text-base font-extrabold text-slate-900">
                              ক্যাশ অন ডেলিভারি (Cash on Delivery)
                            </span>
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300">
                              প্রস্তাবিত ও ডিফল্ট
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            পণ্য হাতে পাওয়ার পর সম্পূর্ণ মূল্য নগদ পরিশোধ করুন। কোনো অগ্রিম পেমেন্টের প্রয়োজন নেই।
                          </p>
                        </div>
                      </div>

                      {/* Active Radio Badge Indicator */}
                      <div className="h-6 w-6 rounded-full bg-[#FF6F0F] text-white flex items-center justify-center shrink-0 shadow-xs">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                    </div>

                    <div className="mt-3.5 pt-3 border-t border-orange-200/60 flex items-center gap-2 text-xs text-orange-900/90 font-medium">
                      <ShieldCheck className="h-4 w-4 text-[#FF6F0F] shrink-0" />
                      <span>১০০% নিরাপদ ও নিশ্চিন্ত কেনাকাটার গ্যারান্টি</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Order Summary (5 Cols) */}
              <div className="lg:col-span-5 sticky top-24 space-y-4">
                <div className="rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-7 shadow-xs">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      অর্ডার সারসংক্ষেপ (Order Summary)
                    </h3>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                      {items.length} টি পণ্য
                    </span>
                  </div>

                  {/* Items Preview List */}
                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto my-3 pr-1">
                    {items.map((item) => {
                      const product = item.product;
                      const imageSrc =
                        product?.images && product.images.length > 0
                          ? product.images[0]
                          : product?.imageUrl || null;
                      const price = item.unitPrice || product?.price || 0;
                      const itemTotal = price * (item.quantity || 1);

                      return (
                        <div
                          key={item.id || item.productId}
                          className="py-3 flex items-center gap-3"
                        >
                          {/* Image */}
                          <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                            {imageSrc ? (
                              <Image
                                src={imageSrc}
                                alt={product?.title || "Product"}
                                fill
                                sizes="56px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-slate-400">
                                <Package className="h-5 w-5" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h4
                              className="text-xs sm:text-sm font-semibold text-slate-800 line-clamp-1"
                              title={product?.title}
                            >
                              {product?.title || "নির্বাচিত পণ্য"}
                            </h4>
                            <div className="flex items-center justify-between mt-1 text-xs text-slate-500">
                              <span>
                                ৳{price.toLocaleString("bn-BD")} × {item.quantity}
                              </span>
                              <span className="font-bold text-slate-900">
                                ৳{itemTotal.toLocaleString("bn-BD")}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Price Calculation Breakdown */}
                  <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs sm:text-sm text-slate-600">
                    <div className="flex items-center justify-between">
                      <span>সাবটোটাল (Subtotal)</span>
                      <span className="font-semibold text-slate-900">
                        {subtotalFormatted}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Truck className="h-4 w-4 text-[#FF6F0F]" />
                        <span>ডেলিভারি ফি (Delivery Fee)</span>
                      </span>
                      <span className="font-semibold text-slate-900">
                        {deliveryFeeFormatted}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between pt-3 border-t border-slate-200/80">
                      <div>
                        <span className="text-sm font-bold text-slate-900 block">
                          সর্বমোট (Grand Total)
                        </span>
                        <span className="text-[10px] text-slate-400">
                          ভ্যাট ও ডেলিভারি চার্জ অন্তর্ভুক্ত
                        </span>
                      </div>
                      <span className="text-xl sm:text-2xl font-black text-[#FF6F0F] tracking-tight">
                        {grandTotalFormatted}
                      </span>
                    </div>
                  </div>

                  {/* Confirm Order Action Button */}
                  <div className="pt-5">
                    <button
                      type="submit"
                      disabled={isSubmitting || items.length === 0}
                      className="w-full h-12 rounded-2xl bg-[#FF6F0F] hover:bg-[#F95738] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm sm:text-base shadow-md shadow-orange-500/25 cursor-pointer flex items-center justify-center gap-2 transition-all"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>অর্ডার সম্পন্ন হচ্ছে...</span>
                        </>
                      ) : (
                        <>
                          <span>অর্ডার নিশ্চিত করুন (Confirm Order)</span>
                          <ArrowRight className="h-5 w-5" />
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-center text-[11px] text-slate-400 mt-3 leading-relaxed">
                    অর্ডার নিশ্চিত করার মাধ্যমে আপনি আমাদের শর্তাবলীর সাথে সম্মতি প্রকাশ করছেন।
                  </p>
                </div>

                {/* Trust badge */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3 text-xs text-slate-600">
                  <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                  <span>
                    পণ্য চেক করে গ্রহণ করুন। কোনো প্রকার গরমিল থাকলে ডেলিভারি ম্যানের সামনেই রিটার্ন করুন।
                  </span>
                </div>
              </div>
            </div>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}
