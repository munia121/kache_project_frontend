/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Package,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  MapPin,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Copy,
  Check,
  Store,
  ShieldAlert,
  FileText,
} from "lucide-react";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/share/Footer";
import { useAuthStore } from "@/store/useAuthStore";
import { orderService } from "@/services/order.service";
import { IOrder, OrderStatus } from "@/types/order.types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type FilterTab = "ALL" | OrderStatus;

const FILTER_TABS: { label: string; value: FilterTab }[] = [
  { label: "সব অর্ডার", value: "ALL" },
  { label: "অপেক্ষারত", value: "PENDING" },
  { label: "প্রক্রিয়াধীন", value: "PROCESSING" },
  { label: "ডেলিভারির পথে", value: "SHIPPED" },
  { label: "সম্পন্ন", value: "DELIVERED" },
  { label: "বাতিলকৃত", value: "CANCELLED" },
];

function formatBengaliDateTime(dateString?: string): string {
  if (!dateString) return "সাম্প্রতিক";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "সাম্প্রতিক";
    return d.toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "সাম্প্রতিক";
  }
}

interface AxiosErrorEnvelope {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export default function MyOrdersPage() {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = React.useState<boolean>(false);
  const { user, isAuthenticated, hasHydrated, _hasHydrated } = useAuthStore();

  React.useEffect(() => {
    if (useAuthStore.persist?.hasHydrated?.()) {
      setIsHydrated(true);
    } else if (useAuthStore.persist?.onFinishHydration) {
      const unsub = useAuthStore.persist.onFinishHydration(() => {
        setIsHydrated(true);
      });
      return () => {
        unsub?.();
      };
    } else {
      setIsHydrated(true);
    }
  }, []);

  const isAuthReady = isHydrated && (hasHydrated || _hasHydrated);

  const [orders, setOrders] = React.useState<IOrder[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [activeTab, setActiveTab] = React.useState<FilterTab>("ALL");
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [totalPages, setTotalPages] = React.useState<number>(1);
  const [totalOrders, setTotalOrders] = React.useState<number>(0);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  // Cancellation Dialog State
  const [orderToCancel, setOrderToCancel] = React.useState<IOrder | null>(null);
  const [isCancelling, setIsCancelling] = React.useState<boolean>(false);

  // Auth Guard: Redirect unauthenticated user only after hydration completes
  React.useEffect(() => {
    if (isAuthReady && (!isAuthenticated || !user)) {
      toast.info("আপনার অর্ডারসমূহ দেখতে প্রথমে লগইন করুন");
      router.push("/login?callbackUrl=/my-orders");
    }
  }, [isAuthReady, isAuthenticated, user, router]);

  // Fetch orders from API
  const fetchOrders = React.useCallback(async (page: number) => {
    setIsLoading(true);
    try {
      const res = await orderService.getMyOrders(page, 10);
      if (res?.success && Array.isArray(res.data)) {
        setOrders(res.data);
        if (res.meta) {
          setTotalPages(res.meta.totalPage || res.meta.totalPages || 1);
          setTotalOrders(res.meta.total || res.data.length);
        } else {
          setTotalOrders(res.data.length);
        }
      }
    } catch (err: unknown) {
      console.error("Failed to load customer orders:", err);
      const errorObj = err as AxiosErrorEnvelope;
      toast.error(errorObj?.response?.data?.message || "অর্ডার তালিকা লোড করতে সমস্যা হয়েছে");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (isAuthReady && isAuthenticated && user) {
      fetchOrders(currentPage);
    }
  }, [isAuthReady, isAuthenticated, user, currentPage, fetchOrders]);

  // Copy Order ID
  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success("অর্ডার আইডি কপি করা হয়েছে!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Confirm and execute cancellation
  const handleConfirmCancel = async () => {
    if (!orderToCancel) return;

    setIsCancelling(true);
    try {
      const res = await orderService.cancelOrder(orderToCancel.id);
      if (res?.success || res?.data) {
        toast.success("অর্ডারটি সফলভাবে বাতিল করা হয়েছে এবং পণ্য স্টক রিস্টোর হয়েছে");
        // Optimistically update status in state
        setOrders((prev) =>
          prev.map((ord) =>
            ord.id === orderToCancel.id
              ? { ...ord, status: "CANCELLED" as OrderStatus }
              : ord
          )
        );
        setOrderToCancel(null);
      } else {
        toast.error(res?.message || "অর্ডার বাতিল করা সম্ভব হয়নি");
      }
    } catch (err: unknown) {
      console.error("Order cancel error:", err);
      const errorObj = err as AxiosErrorEnvelope;
      toast.error(
        errorObj?.response?.data?.message ||
          errorObj?.message ||
          "অর্ডার বাতিল করা যায়নি। দয়া করে আবার চেষ্টা করুন।"
      );
    } finally {
      setIsCancelling(false);
    }
  };

  // Filter orders according to active tab
  const filteredOrders = React.useMemo(() => {
    if (activeTab === "ALL") return orders;
    return orders.filter((order) => order.status === activeTab);
  }, [orders, activeTab]);

  // Tab count helper
  const counts = React.useMemo(() => {
    return {
      ALL: orders.length,
      PENDING: orders.filter((o) => o.status === "PENDING").length,
      PROCESSING: orders.filter((o) => o.status === "PROCESSING").length,
      SHIPPED: orders.filter((o) => o.status === "SHIPPED").length,
      DELIVERED: orders.filter((o) => o.status === "DELIVERED").length,
      CANCELLED: orders.filter((o) => o.status === "CANCELLED").length,
    };
  }, [orders]);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <Loader2 className="h-8 w-8 text-[#FF6F0F] animate-spin mb-3" />
          <p className="text-sm font-semibold text-slate-600">লোড হচ্ছে...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-6">
          <Link
            href="/"
            className="hover:text-[#FF6F0F] transition-colors flex items-center gap-1"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>হোম</span>
          </Link>
          <span>/</span>
          <Link href="/profile" className="hover:text-[#FF6F0F] transition-colors">
            প্রোফাইল
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">আমার অর্ডারসমূহ</span>
        </div>

        {/* Page Header */}
        <div className="pb-6 border-b border-slate-200/80 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                আমার অর্ডারসমূহ
              </h1>
              <span className="text-xs font-bold text-[#FF6F0F] bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-full">
                মোট {totalOrders} টি
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              আপনার সাম্প্রতিক সব ক্যাশ অন ডেলিভারি (COD) অর্ডারের তালিকা ও ডেলিভারি স্ট্যাটাস
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <ShoppingBag className="h-4 w-4 text-[#FF6F0F]" />
            <span>নতুন কেনাকাটা করুন</span>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-6 scrollbar-none">
          {FILTER_TABS.map((tab) => {
            const isActive = activeTab === tab.value;
            const count = counts[tab.value as keyof typeof counts] || 0;

            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#FF6F0F] text-white shadow-xs shadow-orange-500/25"
                    : "bg-white text-slate-600 hover:bg-slate-100/80 border border-slate-200/80"
                }`}
              >
                <span>{tab.label}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Orders Listing Container */}
        {isLoading ? (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center shadow-xs">
            <Loader2 className="h-8 w-8 text-[#FF6F0F] animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-600">
              অর্ডার তালিকা লোড হচ্ছে...
            </p>
          </div>
        ) : filteredOrders.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-14 text-center shadow-xs my-4">
            <div className="h-20 w-20 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF6F0F] mx-auto mb-4">
              <Package className="h-10 w-10 stroke-[1.5]" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-1.5">
              {activeTab === "ALL"
                ? "আপনার কোনো অর্ডার নেই"
                : "এই ফিল্টারে কোনো অর্ডার পাওয়া যায়নি"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mb-6 leading-relaxed">
              {activeTab === "ALL"
                ? "কাছে মার্কেটপ্লেস থেকে পছন্দের পণ্য কিনুন এবং ঘরে বসেই ডেলিভারি বুঝে নিন।"
                : "অন্য ফিল্টার ট্যাব নির্বাচন করুন অথবা সব অর্ডার দেখুন।"}
            </p>
            {activeTab === "ALL" ? (
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#FF6F0F] hover:bg-[#F95738] text-white font-bold text-sm shadow-md shadow-orange-500/25 transition-all cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>পণ্য ব্রাউজ করুন</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab("ALL")}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                সব অর্ডার দেখুন
              </button>
            )}
          </div>
        ) : (
          /* Order Cards List */
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const totalAmount = Number(order.totalAmount || 0);
              const isPending = order.status === "PENDING";
              const isDelivered = order.status === "DELIVERED";
              const isCancelled = order.status === "CANCELLED";
              const isShipped = order.status === "SHIPPED";
              const isProcessing = order.status === "PROCESSING";

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden transition-all hover:border-slate-300"
                >
                  {/* Order Card Header */}
                  <div className="px-5 py-4 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-500">অর্ডার:</span>
                        <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                          #{order.id.slice(0, 8)}...{order.id.slice(-4)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyId(order.id)}
                          title="অর্ডার আইডি কপি করুন"
                          className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                        >
                          {copiedId === order.id ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>

                      <div className="flex items-center gap-1 text-slate-500">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{formatBengaliDateTime(order.createdAt)}</span>
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="flex items-center gap-2">
                      {isPending && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                          <Clock className="h-3.5 w-3.5" />
                          <span>অপেক্ষারত</span>
                        </span>
                      )}
                      {isProcessing && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                          <Package className="h-3.5 w-3.5" />
                          <span>প্রক্রিয়াধীন</span>
                        </span>
                      )}
                      {isShipped && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                          <Truck className="h-3.5 w-3.5" />
                          <span>ডেলিভারির পথে</span>
                        </span>
                      )}
                      {isDelivered && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>ডেলিভারি সম্পন্ন</span>
                        </span>
                      )}
                      {isCancelled && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                          <XCircle className="h-3.5 w-3.5" />
                          <span>বাতিলকৃত</span>
                        </span>
                      )}

                      <span className="text-[11px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                        ক্যাশ অন ডেলিভারি
                      </span>
                    </div>
                  </div>

                  {/* Order Items Section */}
                  <div className="p-4 sm:p-5 divide-y divide-slate-100">
                    {order.orderItems && order.orderItems.length > 0 ? (
                      order.orderItems.map((item) => {
                        const product = item.product;
                        const imageSrc =
                          product?.images && product.images.length > 0
                            ? product.images[0]
                            : product?.imageUrl || null;
                        const unitPrice = Number(item.unitPrice || product?.price || 0);
                        const lineTotal = unitPrice * item.quantity;
                        const productUrl = `/products/${product?.slug || item.productId}`;

                        return (
                          <div
                            key={item.id}
                            className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <Link
                                href={productUrl}
                                className="relative h-14 w-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100 group"
                              >
                                {imageSrc ? (
                                  <Image
                                    src={imageSrc}
                                    alt={product?.title || "Product"}
                                    fill
                                    sizes="56px"
                                    className="object-cover group-hover:scale-105 transition-transform"
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center text-slate-400">
                                    <Package className="h-5 w-5" />
                                  </div>
                                )}
                              </Link>

                              <div className="min-w-0">
                                <Link
                                  href={productUrl}
                                  className="text-xs sm:text-sm font-bold text-slate-800 hover:text-[#FF6F0F] transition-colors truncate block"
                                  title={product?.title}
                                >
                                  {product?.title || "পণ্য"}
                                </Link>

                                {product?.seller?.shopName && (
                                  <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                                    <Store className="h-3 w-3" />
                                    <span>{product.seller.shopName}</span>
                                  </div>
                                )}

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
                      })
                    ) : (
                      <p className="text-xs text-slate-400 py-2">
                        অর্ডারের আইটেম বিবরণী সংরক্ষিত নেই
                      </p>
                    )}
                  </div>

                  {/* Order Footer & Action Bar */}
                  <div className="px-5 py-3.5 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    {/* Shipping Address snippet */}
                    <div className="flex items-start gap-1.5 text-slate-500 max-w-md">
                      <MapPin className="h-3.5 w-3.5 text-[#FF6F0F] shrink-0 mt-0.5" />
                      <span className="line-clamp-1" title={order.shippingAddress}>
                        {order.shippingAddress || "ডেলিভারি ঠিকানা নির্ধারিত"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                      {/* Total Amount */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 font-medium">সর্বমোট:</span>
                        <span className="text-base sm:text-lg font-black text-[#FF6F0F]">
                          ৳{totalAmount.toLocaleString("bn-BD")}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        {/* Cancellation button for PENDING orders */}
                        {isPending && (
                          <button
                            type="button"
                            onClick={() => setOrderToCancel(order)}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                          >
                            অর্ডার বাতিল
                          </button>
                        )}

                        {/* View Invoice / Success Page Details */}
                        <Link
                          href={`/order-success/${order.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 shadow-xs transition-colors cursor-pointer"
                        >
                          <FileText className="h-3.5 w-3.5 text-slate-400" />
                          <span>ইনভয়েস</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1 || isLoading}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="rounded-xl cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  পূর্ববর্তী
                </Button>

                <span className="text-xs font-semibold text-slate-600 px-3">
                  পৃষ্ঠা {currentPage.toLocaleString("bn-BD")} / {totalPages.toLocaleString("bn-BD")}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages || isLoading}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-xl cursor-pointer"
                >
                  পরবর্তী
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Cancel Order Confirmation Dialog */}
      <Dialog
        open={Boolean(orderToCancel)}
        onOpenChange={(open) => {
          if (!open) setOrderToCancel(null);
        }}
      >
        <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-white">
          <DialogHeader>
            <div className="h-12 w-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-2">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center text-lg font-bold text-slate-900">
              অর্ডারটি বাতিল করতে চান?
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-slate-500 leading-relaxed pt-1">
              আপনি কি নিশ্চিতভাবে এই অর্ডারটি বাতিল করতে চান? অর্ডার বাতিল করলে পণ্যগুলোর স্টক তাৎক্ষণিকভাবে পুনরায় উপলব্ধ করা হবে।
            </DialogDescription>
          </DialogHeader>

          {orderToCancel && (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1.5 my-2">
              <div className="flex justify-between">
                <span className="text-slate-500">অর্ডার আইডি:</span>
                <span className="font-mono font-bold text-slate-800">
                  #{orderToCancel.id.slice(0, 8)}...{orderToCancel.id.slice(-4)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">মোট মূল্য:</span>
                <span className="font-bold text-[#FF6F0F]">
                  ৳{Number(orderToCancel.totalAmount || 0).toLocaleString("bn-BD")}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-3">
            <Button
              type="button"
              variant="outline"
              disabled={isCancelling}
              onClick={() => setOrderToCancel(null)}
              className="rounded-xl text-xs font-semibold cursor-pointer"
            >
              ফিরে যান
            </Button>
            <Button
              type="button"
              disabled={isCancelling}
              onClick={handleConfirmCancel}
              className="rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  বাতিল হচ্ছে...
                </>
              ) : (
                "হ্যাঁ, অর্ডার বাতিল করুন"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
