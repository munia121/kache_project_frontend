"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CheckCircle2,
  Copy,
  Check,
  ShoppingBag,
  Home,
  User,
  MapPin,
  Banknote,
  Calendar,
  Package,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/share/Footer";
import { orderService } from "@/services/order.service";
import { IOrder } from "@/types/order.types";
import { toast } from "sonner";

interface OrderSuccessPageProps {
  params: Promise<{ id: string }>;
}

function formatBengaliDateTime(dateString?: string): string {
  if (!dateString) return "এইমাত্র";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "এইমাত্র";
    return d.toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "এইমাত্র";
  }
}

function OrderSuccessContent({ params }: OrderSuccessPageProps) {
  const unwrappedParams = React.use(params);
  const routerParams = useParams();
  const orderId = (unwrappedParams?.id || routerParams?.id || "") as string;

  const [order, setOrder] = React.useState<IOrder | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(Boolean(orderId));
  const [copied, setCopied] = React.useState<boolean>(false);

  // Fetch Order Details
  React.useEffect(() => {
    let isMounted = true;

    if (!orderId) {
      return;
    }

    const fetchOrder = async () => {
      setIsLoading(true);
      try {
        const res = await orderService.getOrderById(orderId);
        if (isMounted && res?.data) {
          const rawData = res.data as (IOrder & { data?: IOrder });
          const orderData = rawData?.data || rawData;
          setOrder(orderData);
        }
      } catch (err) {
        console.warn("Could not fetch order metadata directly:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchOrder();

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  // Copy Order ID to clipboard
  const handleCopyOrderId = () => {
    if (!orderId) return;
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    toast.success("অর্ডার আইডি কপি করা হয়েছে!");
    setTimeout(() => setCopied(false), 2000);
  };

  const totalAmountNumber = Number(order?.totalAmount || 0);
  const formattedTotal = totalAmountNumber > 0
    ? `৳${totalAmountNumber.toLocaleString("bn-BD")}`
    : "৳০";

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Step 3 Requirement 1: Animated Green Success Badge */}
        <div className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center mb-4">
            <div className="absolute inset-0 rounded-full bg-emerald-200/50 animate-ping opacity-40" />
            <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-emerald-50 border-2 border-emerald-300 flex items-center justify-center text-emerald-600 shadow-lg shadow-emerald-500/15">
              <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12 stroke-[2.5]" />
            </div>
          </div>

          {/* Step 3 Requirement 2: Title */}
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            ধন্যবাদ! আপনার অর্ডারটি গ্রহণ করা হয়েছে
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
            আপনার অর্ডারটি সফলভাবে লিপিবদ্ধ করা হয়েছে। বিক্রেতা শীঘ্রই আপনার সাথে যোগাযোগ করবেন এবং পণ্য ডেলিভারি সম্পন্ন করবেন।
          </p>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 text-center shadow-xs">
            <Loader2 className="h-8 w-8 animate-spin text-[#FF6F0F] mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-600">
              অর্ডারের বিস্তারিত তথ্য লোড হচ্ছে...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Step 3 Requirement 3: Order Metadata Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    অর্ডার রেফারেন্স
                  </span>
                  <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-xl">
                    <span className="text-xs sm:text-sm font-mono font-bold text-slate-800">
                      #{orderId ? `${orderId.slice(0, 8)}...${orderId.slice(-4)}` : "N/A"}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyOrderId}
                      title="অর্ডার আইডি কপি করুন"
                      className="p-1 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                    অপেক্ষারত (Pending)
                  </span>
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 text-xs sm:text-sm">
                {/* Payment Method */}
                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                    <Banknote className="h-3.5 w-3.5 text-emerald-600" />
                    <span>পেমেন্ট পদ্ধতি</span>
                  </div>
                  <p className="font-bold text-slate-900">
                    ক্যাশ অন ডেলিভারি (বকেয়া/Unpaid)
                  </p>
                  <p className="text-[11px] text-emerald-600 font-medium">
                    পণ্য পাওয়ার পর মূল্য পরিশোধ
                  </p>
                </div>

                {/* Total Payable */}
                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                    <Sparkles className="h-3.5 w-3.5 text-[#FF6F0F]" />
                    <span>সর্বমোট প্রদেয় টাকা</span>
                  </div>
                  <p className="text-lg sm:text-xl font-black text-[#FF6F0F]">
                    {formattedTotal}
                  </p>
                  <p className="text-[11px] text-slate-400">ডেলিভারি ফি অন্তর্ভুক্ত</p>
                </div>

                {/* Date & Time */}
                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1 sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                    <Calendar className="h-3.5 w-3.5 text-blue-600" />
                    <span>অর্ডারের সময়</span>
                  </div>
                  <p className="font-bold text-slate-900">
                    {formatBengaliDateTime(order?.createdAt)}
                  </p>
                  <p className="text-[11px] text-slate-400">নিরাপদ প্রক্রিয়াকরণ</p>
                </div>
              </div>

              {/* Shipping Address Row */}
              <div className="mt-4 p-4 rounded-2xl bg-orange-50/40 border border-orange-100 flex items-start gap-3">
                <MapPin className="h-5 w-5 text-[#FF6F0F] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-700">
                    ডেলিভারির ঠিকানা:
                  </span>
                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                    {order?.shippingAddress ||
                      "আপনার প্রদত্ত ঠিকানায় ডেলিভারি করা হবে"}
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 Requirement 4: Order Items Summary Table / List */}
            {order?.orderItems && order.orderItems.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    অর্ডারকৃত পণ্যসমূহ ({order.orderItems.length} টি)
                  </h3>
                  <span className="text-xs font-semibold text-slate-500">
                    ইনভয়েস বিবরণী
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {order.orderItems.map((item) => {
                    const product = item.product;
                    const imageSrc =
                      product?.images && product.images.length > 0
                        ? product.images[0]
                        : product?.imageUrl || null;
                    const unitPrice = Number(item.unitPrice || 0);
                    const lineTotal = unitPrice * item.quantity;

                    return (
                      <div
                        key={item.id}
                        className="py-3 sm:py-4 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3 min-w-0">
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
                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                              {product?.title || "পণ্য"}
                            </h4>
                            <p className="text-xs text-slate-500 mt-0.5">
                              পরিমাণ: <span className="font-semibold text-slate-800">{item.quantity}</span> × ৳
                              {unitPrice.toLocaleString("bn-BD")}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                            ৳{lineTotal.toLocaleString("bn-BD")}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Delivery Safety Guarantee */}
            <div className="p-4 sm:p-5 rounded-3xl bg-blue-50/70 border border-blue-200/80 flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-blue-900 leading-relaxed space-y-1">
                <p className="font-bold">কাছে নিরাপদ ডেলিভারি প্রতিশ্রুতি</p>
                <p className="text-blue-800/90 text-xs">
                  পণ্যটি হাতে পাওয়ার পর ভালোভাবে পর্যবেক্ষণ করে মূল্য পরিশোধ করুন। কোনো সমস্যা হলে আমাদের কাস্টমার সাপোর্টে যোগাযোগ করতে পারেন।
                </p>
              </div>
            </div>

            {/* Step 3 Requirement 5: Quick Navigation Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#FF6F0F] hover:bg-[#F95738] text-white font-bold text-sm shadow-md shadow-orange-500/25 transition-all cursor-pointer"
              >
                <Home className="h-4 w-4" />
                <span>হোমে ফিরে যান</span>
              </Link>

              <Link
                href="/profile"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm border border-slate-200 shadow-xs transition-all cursor-pointer"
              >
                <User className="h-4 w-4" />
                <span>আমার প্রোফাইল ও অর্ডার</span>
              </Link>

              <Link
                href="/products"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm transition-all cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>আরও কেনাকাটা করুন</span>
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function OrderSuccessPage(props: OrderSuccessPageProps) {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
          <Navbar />
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 text-[#FF6F0F] animate-spin" />
            <p className="mt-3 text-xs text-slate-500 font-medium">
              অর্ডার বিবরণী লোড হচ্ছে...
            </p>
          </div>
          <Footer />
        </div>
      }
    >
      <OrderSuccessContent {...props} />
    </React.Suspense>
  );
}
