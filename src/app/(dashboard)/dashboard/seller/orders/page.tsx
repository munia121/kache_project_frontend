/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Store,
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
  Phone,
  User,
  Search,
  FileText,
  RefreshCw,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Banknote,
} from "lucide-react";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/share/Footer";
import { useAuthStore } from "@/store/useAuthStore";
import { orderService } from "@/services/order.service";
import { IOrder, OrderStatus } from "@/types/order.types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  { label: "ডেলিভারি সম্পন্ন", value: "DELIVERED" },
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

export default function SellerOrdersPage() {
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
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [totalPages, setTotalPages] = React.useState<number>(1);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  // Status updating tracking (orderId => inProgress)
  const [updatingOrderId, setUpdatingOrderId] = React.useState<string | null>(null);

  // Dialog State for Status Confirmation (e.g. cancellation or delivery)
  const [statusConfirmData, setStatusConfirmData] = React.useState<{
    order: IOrder;
    targetStatus: OrderStatus;
  } | null>(null);

  // Robust Seller Authorization Guard: accessible to all roles except USER
  const isAuthorizedSeller = Boolean(user && user.role !== "USER");

  // Auth Guard: Redirect unauthenticated user only after hydration completes
  React.useEffect(() => {
    if (isAuthReady && (!isAuthenticated || !user)) {
      toast.info("সেলার ড্যাশবোর্ডে প্রবেশ করতে প্রথমে লগইন করুন");
      router.push("/login?callbackUrl=/dashboard/seller/orders");
    }
  }, [isAuthReady, isAuthenticated, user, router]);

  // Fetch Seller Orders from API
  const fetchSellerOrders = React.useCallback(
    async (tab: FilterTab, page: number) => {
      setIsLoading(true);
      try {
        const res = await orderService.getSellerOrders(tab, page, 10);
        if (res?.success && Array.isArray(res.data)) {
          setOrders(res.data);
          if (res.meta) {
            setTotalPages(res.meta.totalPage || res.meta.totalPages || 1);
          }
        }
      } catch (err: unknown) {
        console.error("Failed to load seller orders:", err);
        const errorObj = err as AxiosErrorEnvelope;
        toast.error(
          errorObj?.response?.data?.message || "সেলার অর্ডার লোড করতে সমস্যা হয়েছে"
        );
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  React.useEffect(() => {
    if (isAuthReady && isAuthenticated && isAuthorizedSeller) {
      fetchSellerOrders(activeTab, currentPage);
    }
  }, [isAuthReady, isAuthenticated, isAuthorizedSeller, activeTab, currentPage, fetchSellerOrders]);

  // Copy Order ID
  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success("অর্ডার আইডি কপি করা হয়েছে!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Execute Order Status Transition
  const executeStatusUpdate = async (orderId: string, targetStatus: OrderStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await orderService.updateOrderStatus(orderId, targetStatus);
      if (res?.success || res?.data) {
        toast.success(`অর্ডার স্ট্যাটাস সফলভাবে '${targetStatus}' এ পরিবর্তিত হয়েছে`);
        // Optimistic state update
        setOrders((prev) =>
          prev.map((ord) =>
            ord.id === orderId
              ? {
                  ...ord,
                  status: targetStatus,
                  paymentStatus:
                    targetStatus === "DELIVERED" ? "PAID" : ord.paymentStatus,
                }
              : ord
          )
        );
        setStatusConfirmData(null);
      } else {
        toast.error(res?.message || "স্ট্যাটাস পরিবর্তন করা সম্ভব হয়নি");
      }
    } catch (err: unknown) {
      console.error("Update status error:", err);
      const errorObj = err as AxiosErrorEnvelope;
      toast.error(
        errorObj?.response?.data?.message ||
          errorObj?.message ||
          "স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে"
      );
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Filtered orders by client-side search query
  const displayedOrders = React.useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const q = searchQuery.toLowerCase().trim();
    return orders.filter((order) => {
      const orderIdMatch = order.id.toLowerCase().includes(q);
      const nameMatch =
        order.user?.fullName?.toLowerCase().includes(q) ||
        order.customerName?.toLowerCase().includes(q);
      const phoneMatch =
        order.user?.phone?.includes(q) ||
        order.customerPhone?.includes(q);
      const addressMatch = order.shippingAddress?.toLowerCase().includes(q);
      return orderIdMatch || nameMatch || phoneMatch || addressMatch;
    });
  }, [orders, searchQuery]);

  // Summary Metrics: Pending, Processing, Delivered, Total Sales
  const metrics = React.useMemo(() => {
    const pendingCount = orders.filter((o) => o.status === "PENDING").length;
    const processingCount = orders.filter(
      (o) => o.status === "PROCESSING" || o.status === "SHIPPED"
    ).length;
    const deliveredCount = orders.filter((o) => o.status === "DELIVERED").length;
    const totalSalesVolume = orders
      .filter((o) => o.status === "DELIVERED")
      .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

    return {
      pendingCount,
      processingCount,
      deliveredCount,
      totalSalesVolume,
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

  // Unauthorized Screen: User is authenticated but NOT a seller
  if (!isAuthorizedSeller) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
        <Navbar />
        <main className="flex-1 max-w-xl w-full mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
          <div className="h-20 w-20 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-5">
            <Store className="h-10 w-10 stroke-[1.5]" />
          </div>
          <span className="text-xs font-bold text-amber-700 bg-amber-100/70 border border-amber-200 px-3 py-1 rounded-full mb-3">
            বিক্রেতা একাউন্ট প্রয়োজন
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
            অননুমোদিত অ্যাক্সেস (Unauthorized)
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6 max-w-md">
            সেলার অর্ডার ম্যানেজমেন্ট ড্যাশবোর্ড শুধুমাত্র অনুমোদিত বিক্রেতাদের জন্য সংরক্ষিত। আপনার পণ্যের অর্ডার ও ডেলিভারি পরিচালনা করতে বিক্রেতা হিসেবে নিবন্ধন করুন।
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/become-seller"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#FF6F0F] hover:bg-[#F95738] text-white font-bold text-sm shadow-md shadow-orange-500/25 transition-all cursor-pointer"
            >
              <span>বিক্রেতা হওয়ার আবেদন করুন</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-200 transition-colors"
            >
              হোমে ফিরে যান
            </Link>
          </div>
        </main>
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
          <Link href="/profile" className="hover:text-[#FF6F0F] transition-colors">
            প্রোফাইল
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">দোকানের অর্ডারসমূহ</span>
        </div>

        {/* Header Bar */}
        <div className="pb-6 border-b border-slate-200/80 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                দোকানের অর্ডার ড্যাশবোর্ড
              </h1>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>{user?.shopName || user?.fullName} (ভেরিফাইড বিক্রেতা)</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              আপনার দোকানের পণ্যসমূহের নতুন অর্ডার গ্রহণ করুন, ডেলিভারি স্ট্যাটাস আপডেট করুন এবং ক্যাশ অন ডেলিভারি নিশ্চিত করুন।
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <Link
              href="/my-listings"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 shadow-xs transition-colors cursor-pointer"
            >
              <Package className="h-4 w-4 text-slate-500" />
              <span>আমার পণ্যসমূহ</span>
            </Link>
            <Link
              href="/post-ad"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#FF6F0F] hover:bg-[#F95738] text-white font-bold text-xs shadow-sm hover:shadow-md shadow-orange-500/25 transition-all cursor-pointer"
            >
              <span>+ নতুন বিজ্ঞাপন</span>
            </Link>
          </div>
        </div>

        {/* Key Requirement 3: Order Summary Cards (Pending, Processing, Delivered, Total Sales) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {/* 1. Pending Orders */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                নতুন / অপেক্ষারত
              </span>
              <span className="text-xl sm:text-2xl font-black text-amber-600">
                {metrics.pendingCount}
              </span>
            </div>
          </div>

          {/* 2. Processing Orders */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                প্রক্রিয়াধীন ও পথে
              </span>
              <span className="text-xl sm:text-2xl font-black text-blue-600">
                {metrics.processingCount}
              </span>
            </div>
          </div>

          {/* 3. Delivered Orders */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                ডেলিভারি সম্পন্ন
              </span>
              <span className="text-xl sm:text-2xl font-black text-emerald-600">
                {metrics.deliveredCount}
              </span>
            </div>
          </div>

          {/* 4. Total Sales */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-orange-50 text-[#FF6F0F] flex items-center justify-center shrink-0">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                মোট বিক্রয় মূল্য
              </span>
              <span className="text-lg sm:text-xl font-black text-[#FF6F0F]">
                ৳{metrics.totalSalesVolume.toLocaleString("bn-BD")}
              </span>
            </div>
          </div>
        </div>

        {/* Status Filter Tabs & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {FILTER_TABS.map((tab) => {
              const isActive = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.value);
                    setCurrentPage(1);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#FF6F0F] text-white shadow-xs shadow-orange-500/25"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="গ্রাহকের নাম, ফোন বা অর্ডার নং..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-[#FF6F0F] focus:ring-2 focus:ring-orange-100 transition-colors"
            />
          </div>
        </div>

        {/* Orders Listing: Shadcn UI Table */}
        {isLoading ? (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center shadow-xs">
            <Loader2 className="h-8 w-8 text-[#FF6F0F] animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-600">
              অর্ডার তালিকা লোড হচ্ছে...
            </p>
          </div>
        ) : displayedOrders.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-14 text-center shadow-xs my-4">
            <div className="h-20 w-20 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF6F0F] mx-auto mb-4">
              <Store className="h-10 w-10 stroke-[1.5]" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-1.5">
              {activeTab === "ALL" && !searchQuery
                ? "এখনো কোনো অর্ডার পাওয়া যায়নি"
                : "কোনো অর্ডার পাওয়া যায়নি"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mb-6 leading-relaxed">
              {activeTab === "ALL" && !searchQuery
                ? "আপনার পণ্যের বিজ্ঞাপন সক্রিয় রাখুন। ক্রেতারা পণ্য অর্ডার করলে এখানে বিস্তারিত দেখতে পাবেন।"
                : "অনুগ্রহ করে অন্য ফিল্টার চেষ্টা করুন অথবা সার্চ কিওয়ার্ড পরিবর্তন করুন।"}
            </p>
            {activeTab !== "ALL" || searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setActiveTab("ALL");
                  setSearchQuery("");
                }}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>ফিল্টার রিসেট করুন</span>
              </button>
            ) : (
              <Link
                href="/post-ad"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#FF6F0F] hover:bg-[#F95738] text-white font-bold text-sm shadow-md shadow-orange-500/25 transition-all cursor-pointer"
              >
                <span>আরও পণ্য তালিকাভুক্ত করুন</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        ) : (
          /* Key Requirement 3: Table with Customer Shipping Details, Items, COD Payment Status, & One-Click Status Transitions */
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow>
                  <TableHead className="w-[180px]">অর্ডার ও তারিখ</TableHead>
                  <TableHead className="min-w-[200px]">গ্রাহক ও শিপিং তথ্য</TableHead>
                  <TableHead className="min-w-[220px]">অর্ডারকৃত পণ্যসমূহ</TableHead>
                  <TableHead className="w-[150px]">মূল্য ও COD পেমেন্ট</TableHead>
                  <TableHead className="w-[140px]">বর্তমান স্ট্যাটাস</TableHead>
                  <TableHead className="text-right min-w-[210px]">এক-ক্লিক স্ট্যাটাস অ্যাকশন</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedOrders.map((order) => {
                  const totalAmount = Number(order.totalAmount || 0);
                  const isPending = order.status === "PENDING";
                  const isProcessing = order.status === "PROCESSING";
                  const isShipped = order.status === "SHIPPED";
                  const isDelivered = order.status === "DELIVERED";
                  const isCancelled = order.status === "CANCELLED";

                  const customerName =
                    order.user?.fullName || order.customerName || "ক্রেতা";
                  const customerPhone =
                    order.user?.phone || order.customerPhone || "";
                  const isUpdating = updatingOrderId === order.id;

                  return (
                    <TableRow key={order.id} className="hover:bg-slate-50/50">
                      {/* Column 1: Order ID & Date */}
                      <TableCell className="align-top font-medium">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
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
                          <div className="flex items-center gap-1 text-[11px] text-slate-500">
                            <Calendar className="h-3 w-3 text-slate-400" />
                            <span>{formatBengaliDateTime(order.createdAt)}</span>
                          </div>
                          <Link
                            href={`/order-success/${order.id}`}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#FF6F0F] hover:underline pt-0.5"
                          >
                            <FileText className="h-3 w-3" />
                            <span>ইনভয়েস দেখুন</span>
                          </Link>
                        </div>
                      </TableCell>

                      {/* Column 2: Customer & Shipping Details */}
                      <TableCell className="align-top">
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                            <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span>{customerName}</span>
                          </div>

                          {customerPhone && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                              <a
                                href={`tel:${customerPhone}`}
                                className="font-semibold text-emerald-700 hover:underline"
                              >
                                {customerPhone}
                              </a>
                            </div>
                          )}

                          <div className="flex items-start gap-1.5 text-slate-500 text-[11px] pt-0.5">
                            <MapPin className="h-3.5 w-3.5 text-[#FF6F0F] shrink-0 mt-0.5" />
                            <span className="line-clamp-2" title={order.shippingAddress}>
                              {order.shippingAddress || "ঠিকানা নির্ধারিত"}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Column 3: Items */}
                      <TableCell className="align-top">
                        <div className="space-y-2">
                          {order.orderItems && order.orderItems.length > 0 ? (
                            order.orderItems.map((item) => {
                              const product = item.product;
                              const imageSrc =
                                product?.images && product.images.length > 0
                                  ? product.images[0]
                                  : product?.imageUrl || null;
                              const unitPrice = Number(item.unitPrice || product?.price || 0);

                              return (
                                <div key={item.id} className="flex items-center gap-2.5">
                                  <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                                    {imageSrc ? (
                                      <Image
                                        src={imageSrc}
                                        alt={product?.title || "Product"}
                                        fill
                                        sizes="40px"
                                        className="object-cover"
                                      />
                                    ) : (
                                      <div className="h-full w-full flex items-center justify-center text-slate-400">
                                        <Package className="h-4 w-4" />
                                      </div>
                                    )}
                                  </div>

                                  <div className="min-w-0 flex-1 text-xs">
                                    <p
                                      className="font-medium text-slate-800 line-clamp-1"
                                      title={product?.title}
                                    >
                                      {product?.title || "পণ্য"}
                                    </p>
                                    <p className="text-[11px] text-slate-500">
                                      {item.quantity} টি × ৳{unitPrice.toLocaleString("bn-BD")}
                                    </p>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <span className="text-xs text-slate-400">আইটেম নেই</span>
                          )}
                        </div>
                      </TableCell>

                      {/* Column 4: Price & COD Payment Status */}
                      <TableCell className="align-top">
                        <div className="space-y-1 text-xs">
                          <span className="text-sm font-black text-[#FF6F0F] block">
                            ৳{totalAmount.toLocaleString("bn-BD")}
                          </span>
                          <div className="flex items-center gap-1">
                            <Banknote className="h-3 w-3 text-slate-400" />
                            <span className="text-[11px] text-slate-600 font-semibold">
                              COD
                            </span>
                          </div>
                          {order.paymentStatus === "PAID" || isDelivered ? (
                            <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              পরিশোধিত (PAID)
                            </span>
                          ) : (
                            <span className="inline-block text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              বকেয়া (UNPAID)
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Column 5: Current Status Badge */}
                      <TableCell className="align-top">
                        {isPending && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                            <Clock className="h-3 w-3" />
                            <span>অপেক্ষারত</span>
                          </span>
                        )}
                        {isProcessing && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                            <Package className="h-3 w-3" />
                            <span>প্রক্রিয়াধীন</span>
                          </span>
                        )}
                        {isShipped && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                            <Truck className="h-3 w-3" />
                            <span>পথে রয়েছে</span>
                          </span>
                        )}
                        {isDelivered && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>সম্পন্ন</span>
                          </span>
                        )}
                        {isCancelled && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                            <XCircle className="h-3 w-3" />
                            <span>বাতিলকৃত</span>
                          </span>
                        )}
                      </TableCell>

                      {/* Column 6: One-Click Status Transition Buttons */}
                      <TableCell className="align-top text-right">
                        <div className="flex flex-col items-end gap-1.5">
                          {/* State 1: PENDING -> Can Accept (PROCESSING) or Cancel */}
                          {isPending && (
                            <>
                              <Button
                                size="sm"
                                disabled={isUpdating}
                                onClick={() => executeStatusUpdate(order.id, "PROCESSING")}
                                className="w-full sm:w-auto rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-xs"
                              >
                                {isUpdating ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <>
                                    <Package className="h-3.5 w-3.5 mr-1" />
                                    <span>গ্রহণ করুন (Process)</span>
                                  </>
                                )}
                              </Button>

                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={isUpdating}
                                onClick={() =>
                                  setStatusConfirmData({
                                    order,
                                    targetStatus: "CANCELLED",
                                  })
                                }
                                className="w-full sm:w-auto rounded-xl text-xs font-semibold cursor-pointer"
                              >
                                বাতিল করুন
                              </Button>
                            </>
                          )}

                          {/* State 2: PROCESSING -> Can Ship (SHIPPED) or Cancel */}
                          {isProcessing && (
                            <>
                              <Button
                                size="sm"
                                disabled={isUpdating}
                                onClick={() => executeStatusUpdate(order.id, "SHIPPED")}
                                className="w-full sm:w-auto rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-xs"
                              >
                                {isUpdating ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <>
                                    <Truck className="h-3.5 w-3.5 mr-1" />
                                    <span>পথে পাঠান (Ship)</span>
                                  </>
                                )}
                              </Button>

                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={isUpdating}
                                onClick={() =>
                                  setStatusConfirmData({
                                    order,
                                    targetStatus: "CANCELLED",
                                  })
                                }
                                className="w-full sm:w-auto rounded-xl text-xs font-semibold cursor-pointer"
                              >
                                বাতিল করুন
                              </Button>
                            </>
                          )}

                          {/* State 3: SHIPPED -> Can Mark as DELIVERED */}
                          {isShipped && (
                            <Button
                              size="sm"
                              disabled={isUpdating}
                              onClick={() =>
                                setStatusConfirmData({
                                  order,
                                  targetStatus: "DELIVERED",
                                })
                              }
                              className="w-full sm:w-auto rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs"
                            >
                              {isUpdating ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <>
                                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                  <span>ডেলিভারি সম্পন্ন (Deliver)</span>
                                </>
                              )}
                            </Button>
                          )}

                          {/* State 4: DELIVERED -> Done */}
                          {isDelivered && (
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>ক্যাশ গ্রহণ সম্পন্ন</span>
                            </span>
                          )}

                          {/* State 5: CANCELLED -> Done */}
                          {isCancelled && (
                            <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-xl flex items-center gap-1">
                              <XCircle className="h-3.5 w-3.5" />
                              <span>বাতিলকৃত</span>
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 p-4 border-t border-slate-100 bg-slate-50/50">
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

      {/* Status Confirmation Dialog (for Cancel or Delivery) */}
      <Dialog
        open={Boolean(statusConfirmData)}
        onOpenChange={(open) => {
          if (!open) setStatusConfirmData(null);
        }}
      >
        <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-white">
          <DialogHeader>
            <div
              className={`h-12 w-12 rounded-2xl flex items-center justify-center mx-auto mb-2 ${
                statusConfirmData?.targetStatus === "CANCELLED"
                  ? "bg-rose-100 text-rose-600"
                  : "bg-emerald-100 text-emerald-600"
              }`}
            >
              {statusConfirmData?.targetStatus === "CANCELLED" ? (
                <ShieldAlert className="h-6 w-6" />
              ) : (
                <CheckCircle2 className="h-6 w-6" />
              )}
            </div>
            <DialogTitle className="text-center text-lg font-bold text-slate-900">
              {statusConfirmData?.targetStatus === "CANCELLED"
                ? "অর্ডারটি বাতিল করতে চান?"
                : "ডেলিভারি সম্পন্ন ও ক্যাশ গ্রহণ নিশ্চিতকরণ"}
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-slate-500 leading-relaxed pt-1">
              {statusConfirmData?.targetStatus === "CANCELLED"
                ? "অর্ডারটি বাতিল করলে পণ্যের স্টক পুনরায় বিক্রির জন্য স্বয়ংক্রিয়ভাবে উপলব্ধ করা হবে।"
                : "পণ্য গ্রাহকের কাছে পৌঁছে দেওয়া হয়েছে এবং ক্যাশ অন ডেলিভারির সম্পূর্ণ টাকা বুঝে পাওয়া গেছে নিশ্চিত করুন।"}
            </DialogDescription>
          </DialogHeader>

          {statusConfirmData && (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1.5 my-2">
              <div className="flex justify-between">
                <span className="text-slate-500">অর্ডার আইডি:</span>
                <span className="font-mono font-bold text-slate-800">
                  #{statusConfirmData.order.id.slice(0, 8)}...
                  {statusConfirmData.order.id.slice(-4)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">মোট মূল্য:</span>
                <span className="font-bold text-[#FF6F0F]">
                  ৳{Number(statusConfirmData.order.totalAmount || 0).toLocaleString("bn-BD")}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-3">
            <Button
              type="button"
              variant="outline"
              disabled={Boolean(updatingOrderId)}
              onClick={() => setStatusConfirmData(null)}
              className="rounded-xl text-xs font-semibold cursor-pointer"
            >
              ফিরে যান
            </Button>
            <Button
              type="button"
              disabled={Boolean(updatingOrderId)}
              onClick={() => {
                if (statusConfirmData) {
                  executeStatusUpdate(
                    statusConfirmData.order.id,
                    statusConfirmData.targetStatus
                  );
                }
              }}
              className={`rounded-xl text-xs font-bold text-white cursor-pointer ${
                statusConfirmData?.targetStatus === "CANCELLED"
                  ? "bg-rose-600 hover:bg-rose-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {updatingOrderId ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  প্রসেসিং হচ্ছে...
                </>
              ) : statusConfirmData?.targetStatus === "CANCELLED" ? (
                "হ্যাঁ, অর্ডার বাতিল করুন"
              ) : (
                "হ্যাঁ, ডেলিভারি নিশ্চিত করুন"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
