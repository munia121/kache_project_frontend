/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { userService } from "@/services/user.service";
import { IUser, SellerStatus } from "@/types/user.types";
import { Navbar } from "@/components/share/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Store,
  MapPin,
  Phone,
  MessageCircle,
  Mail,
  Copy,
  Check,
  Calendar,
  AlertTriangle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Users,
  UserX,
} from "lucide-react";

const REJECTION_PRESETS = [
  "অসম্পূর্ণ বা অকার্যকর ফোন নম্বর",
  "অনুপযুক্ত বা কপিরাইট লঙ্ঘিত শপের নাম",
  "সঠিক ভৌগোলিক ঠিকানা বা এলাকা অনুপস্থিত",
  "অবৈধ বা সীমাবদ্ধ পণ্য বিক্রির অভিযোগ",
  "প্ল্যাটফর্ম নীতিমালার সাথে সাংঘর্ষিক তথ্য",
];

const REVOCATION_PRESETS = [
  "প্ল্যাটফর্ম পলিসি বা কমিউনিটি নীতি লঙ্ঘন",
  "নকল, নিম্নমানের বা নিষিদ্ধ পণ্য তালিকাভুক্তি",
  "ক্রেতাদের সাথে প্রতারণামূলক বা অসৌজন্যমূলক আচরণ",
  "বারবার ভুল বা ভুয়া তথ্য প্রদান",
  "অর্ডার ডেলিভারি বা চ্যাটে দীর্ঘদিনের নিষ্ক্রিয়তা",
];

export default function AdminSellerApplicationsPage() {
  const router = useRouter();
  const { user, isAuthenticated, hasHydrated } = useAuthStore();
  const [isMounted, setIsMounted] = React.useState(false);

  // Filter & Search states
  const [selectedStatus, setSelectedStatus] = React.useState<SellerStatus | "ALL">("PENDING");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(10);

  // Data states
  const [applications, setApplications] = React.useState<IUser[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [totalCount, setTotalCount] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(1);

  // Status counts for top summary cards
  const [counts, setCounts] = React.useState({
    PENDING: 0,
    APPROVED: 0,
    REJECTED: 0,
    TOTAL: 0,
  });

  // Action states
  const [actionLoadingId, setActionLoadingId] = React.useState<string | null>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  // Detail Modal State
  const [selectedAppForDetail, setSelectedAppForDetail] = React.useState<IUser | null>(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);

  // Rejection Dialog State
  const [selectedAppForReject, setSelectedAppForReject] = React.useState<IUser | null>(null);
  const [rejectionReason, setRejectionReason] = React.useState("");
  const [isRejectOpen, setIsRejectOpen] = React.useState(false);
  const [isSubmittingReject, setIsSubmittingReject] = React.useState(false);

  // Revocation Dialog State
  const [selectedAppForRevoke, setSelectedAppForRevoke] = React.useState<IUser | null>(null);
  const [revokeReason, setRevokeReason] = React.useState("");
  const [isRevokeOpen, setIsRevokeOpen] = React.useState(false);
  const [isSubmittingRevoke, setIsSubmittingRevoke] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Search debounce
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch applications list
  const fetchApplications = React.useCallback(async () => {
    if (!isAuthenticated || (user?.role !== "ADMIN" && user?.role !== "SUPER_ADMIN")) {
      return;
    }

    try {
      setIsLoading(true);
      const res = await userService.getSellerApplications({
        status: selectedStatus,
        search: debouncedSearch || undefined,
        page,
        limit,
      });

      if (res?.success && Array.isArray(res.data)) {
        setApplications(res.data);
        if (res.meta) {
          setTotalCount(res.meta.total || res.data.length);
          setTotalPages(res.meta.totalPages || res.meta.totalPage || Math.ceil((res.meta.total || res.data.length) / limit) || 1);
        } else {
          setTotalCount(res.data.length);
          setTotalPages(1);
        }
      } else {
        setApplications([]);
        setTotalCount(0);
        setTotalPages(1);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "আবেদন তালিকা লোড করা যায়নি");
      setApplications([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.role, selectedStatus, debouncedSearch, page, limit]);

  // Fetch summary counts
  const fetchSummaryCounts = React.useCallback(async () => {
    if (!isAuthenticated || (user?.role !== "ADMIN" && user?.role !== "SUPER_ADMIN")) {
      return;
    }

    try {
      // Query pending, approved, rejected, and total
      const [pendingRes, approvedRes, rejectedRes, allRes] = await Promise.allSettled([
        userService.getSellerApplications({ status: "PENDING", limit: 1 }),
        userService.getSellerApplications({ status: "APPROVED", limit: 1 }),
        userService.getSellerApplications({ status: "REJECTED", limit: 1 }),
        userService.getSellerApplications({ status: "ALL", limit: 1 }),
      ]);

      const getCount = (result: PromiseSettledResult<any>) =>
        result.status === "fulfilled" && result.value?.meta?.total !== undefined
          ? result.value.meta.total
          : 0;

      setCounts({
        PENDING: getCount(pendingRes),
        APPROVED: getCount(approvedRes),
        REJECTED: getCount(rejectedRes),
        TOTAL: getCount(allRes),
      });
    } catch {
      // Non-critical, ignore count failures
    }
  }, [isAuthenticated, user?.role]);

  // Initial and reactive data loading
  React.useEffect(() => {
    if (isMounted && hasHydrated) {
      fetchApplications();
    }
  }, [isMounted, hasHydrated, fetchApplications]);

  React.useEffect(() => {
    if (isMounted && hasHydrated) {
      fetchSummaryCounts();
    }
  }, [isMounted, hasHydrated, fetchSummaryCounts]);

  // Handler: Approve Application
  const handleApprove = async (app: IUser) => {
    try {
      setActionLoadingId(app.id);
      const res = await userService.approveSellerApplication(app.id);

      if (res.success) {
        toast.success(`আবেদন সফলভাবে অনুমোদিত হয়েছে!`, {
          description: `${app.fullName} এখন কাছে (Kache) প্ল্যাটফর্মের ভেরিফাইড সেলার।`,
        });

        // Update local list
        setApplications((prev) =>
          prev.map((item) =>
            item.id === app.id
              ? { ...item, sellerStatus: "APPROVED", role: "SELLER" }
              : item
          )
        );

        // Close detail modal if open
        if (selectedAppForDetail?.id === app.id) {
          setIsDetailOpen(false);
        }

        // Re-fetch counts and data
        fetchSummaryCounts();
        if (selectedStatus === "PENDING") {
          fetchApplications();
        }
      } else {
        toast.error(res?.message || "অনুমোদন ব্যর্থ হয়েছে");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "অনুমোদন ব্যর্থ হয়েছে");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handler: Open Reject Dialog
  const handleOpenRejectDialog = (app: IUser) => {
    setSelectedAppForReject(app);
    setRejectionReason("");
    setIsRejectOpen(true);
  };

  // Handler: Confirm Rejection
  const handleConfirmReject = async () => {
    if (!selectedAppForReject) return;

    try {
      setIsSubmittingReject(true);
      const reason = rejectionReason.trim() || undefined;

      const res = await userService.rejectSellerApplication(
        selectedAppForReject.id,
        reason
      );

      if (res.success) {
        toast.success("সেলার আবেদনটি সফলভাবে বাতিল করা হয়েছে", {
          description: reason ? `কারণ: ${reason}` : undefined,
        });

        // Update local list
        setApplications((prev) =>
          prev.map((item) =>
            item.id === selectedAppForReject.id
              ? { ...item, sellerStatus: "REJECTED", rejectionReason: reason }
              : item
          )
        );

        setIsRejectOpen(false);
        setSelectedAppForReject(null);

        // Close detail modal if open
        if (selectedAppForDetail?.id === selectedAppForReject.id) {
          setIsDetailOpen(false);
        }

        fetchSummaryCounts();
        if (selectedStatus === "PENDING") {
          fetchApplications();
        }
      } else {
        toast.error(res?.message || "আবেদন বাতিল করা যায়নি");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "আবেদন বাতিল করা যায়নি");
    } finally {
      setIsSubmittingReject(false);
    }
  };

  // Handler: Open Revoke Dialog
  const handleOpenRevokeDialog = (app: IUser) => {
    setSelectedAppForRevoke(app);
    setRevokeReason("");
    setIsRevokeOpen(true);
  };

  // Handler: Confirm Revocation
  const handleConfirmRevoke = async () => {
    if (!selectedAppForRevoke) return;

    try {
      setIsSubmittingRevoke(true);
      const defaultReason = "অ্যাডমিন কর্তৃক সেলার অ্যাকাউন্ট স্থগিত বা বাতিল করা হয়েছে।";
      const finalReason = revokeReason.trim() || defaultReason;

      const res = await userService.revokeSeller(
        selectedAppForRevoke.id,
        finalReason
      );

      if (res?.success || res) {
        toast.success("সেলার সুবিধা সফলভাবে প্রত্যাহার করা হয়েছে", {
          description: `${selectedAppForRevoke.fullName} এর বিক্রেতা অধিকার স্থগিত এবং পণ্যসমূহ হাইড করা হয়েছে।`,
        });

        // Update local list
        setApplications((prev) =>
          prev.map((item) =>
            item.id === selectedAppForRevoke.id
              ? { ...item, sellerStatus: "REJECTED", role: "USER", rejectionReason: finalReason }
              : item
          )
        );

        setIsRevokeOpen(false);
        setSelectedAppForRevoke(null);

        // Close detail modal if open
        if (selectedAppForDetail?.id === selectedAppForRevoke.id) {
          setIsDetailOpen(false);
        }

        fetchSummaryCounts();
        if (selectedStatus === "APPROVED") {
          fetchApplications();
        }
      } else {
        toast.error("সেলার অধিকার প্রত্যাহার করা সম্ভব হয়নি");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "সেলার অধিকার প্রত্যাহার করা সম্ভব হয়নি");
    } finally {
      setIsSubmittingRevoke(false);
    }
  };

  // Handler: Copy User ID
  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success("আইডি কপি করা হয়েছে");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Handler: Open Detail Modal
  const handleViewDetail = (app: IUser) => {
    setSelectedAppForDetail(app);
    setIsDetailOpen(true);
  };

  if (!isMounted || !hasHydrated) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 text-[#FF6F0F] animate-spin" />
          <p className="mt-3 text-sm text-slate-500 font-medium">অ্যাডমিন ড্যাশবোর্ড লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  // Access Control: Must be ADMIN or SUPER_ADMIN
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-3xl bg-purple-50 text-purple-700 mb-4 ring-8 ring-purple-50/50">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              অ্যাডমিন অ্যাক্সেস সংরক্ষিত
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
              এই পাতাটি শুধুমাত্র কাছে (Kache) প্ল্যাটফর্মের অনুমোদিত অ্যাডমিন ও সুপার অ্যাডমিনদের জন্য সংরক্ষিত।
            </p>

            <div className="mt-6 p-4 rounded-2xl bg-purple-50/60 border border-purple-200 text-xs text-purple-900 text-left space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-purple-700" />
                <span>দ্রুত টেস্ট লগইন করুন:</span>
              </p>
              <p className="text-purple-700">
                স্ক্রিনের নিচের বাম কোণে থাকা <strong>Fast Login</strong> উইজেট থেকে <strong>Platform Admin</strong> বা <strong>Super Admin</strong> এ ক্লিক করুন।
              </p>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/"
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md"
              >
                হোমে ফিরে যান
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
              >
                লগইন পাতায় যান
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status?: SellerStatus) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3" />
            অনুমোদিত
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="h-3 w-3" />
            বাতিলকৃত
          </span>
        );
      case "PENDING":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="h-3 w-3 animate-pulse" />
            অপেক্ষমান
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* ================================================================ */}
        {/* TOP HEADER & ADMIN BANNER                                        */}
        {/* ================================================================ */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold mb-2">
              <ShieldCheck className="h-3.5 w-3.5 text-purple-600" />
              <span>কাছে অ্যাডমিন প্যানেল • Seller Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              সেলার আবেদন ও অনুমোদন ড্যাশবোর্ড
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              নতুন বিক্রেতাদের প্রোফাইল ও শপ তথ্য পর্যালোচনা করুন। প্রয়োজনীয় তথ্য যাচাই সাপেক্ষে অনুমোদন প্রদান অথবা কারণ উল্লেখপূর্বক বাতিল করুন।
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                fetchApplications();
                fetchSummaryCounts();
              }}
              disabled={isLoading}
              className="h-10 px-4 rounded-xl border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>রিফ্রেশ</span>
            </Button>

            <Link
              href="/become-seller"
              className="h-10 px-4 rounded-xl bg-orange-50 text-[#FF6F0F] hover:bg-orange-100 border border-orange-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Store className="h-3.5 w-3.5" />
              <span>আবেদন ফরম প্রিভিউ</span>
            </Link>
          </div>
        </div>

        {/* ================================================================ */}
        {/* STATS METRIC CARDS                                              */}
        {/* ================================================================ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pending Applications */}
          <div
            onClick={() => {
              setSelectedStatus("PENDING");
              setPage(1);
            }}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              selectedStatus === "PENDING"
                ? "bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/30 shadow-sm"
                : "bg-white border-slate-200/90 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">অপেক্ষমান আবেদন</span>
              <div className="h-8 w-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-amber-700">
                {counts.PENDING}
              </span>
              <span className="text-[11px] font-semibold text-amber-800">রিভিউ প্রয়োজন</span>
            </div>
          </div>

          {/* Approved Sellers */}
          <div
            onClick={() => {
              setSelectedStatus("APPROVED");
              setPage(1);
            }}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              selectedStatus === "APPROVED"
                ? "bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-400/30 shadow-sm"
                : "bg-white border-slate-200/90 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">অনুমোদিত বিক্রেতা</span>
              <div className="h-8 w-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-emerald-700">
                {counts.APPROVED}
              </span>
              <span className="text-[11px] font-semibold text-emerald-800">সক্রিয় সেলার</span>
            </div>
          </div>

          {/* Rejected Applications */}
          <div
            onClick={() => {
              setSelectedStatus("REJECTED");
              setPage(1);
            }}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              selectedStatus === "REJECTED"
                ? "bg-rose-50/80 border-rose-300 ring-2 ring-rose-400/30 shadow-sm"
                : "bg-white border-slate-200/90 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">বাতিলকৃত আবেদন</span>
              <div className="h-8 w-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <XCircle className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-rose-700">
                {counts.REJECTED}
              </span>
              <span className="text-[11px] font-semibold text-rose-800">বাতিল হয়েছে</span>
            </div>
          </div>

          {/* All Applications */}
          <div
            onClick={() => {
              setSelectedStatus("ALL");
              setPage(1);
            }}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              selectedStatus === "ALL"
                ? "bg-purple-50/80 border-purple-300 ring-2 ring-purple-400/30 shadow-sm"
                : "bg-white border-slate-200/90 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">মোট সেলার আবেদন</span>
              <div className="h-8 w-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-purple-700">
                {counts.TOTAL}
              </span>
              <span className="text-[11px] font-semibold text-purple-800">সর্বমোট জমা</span>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* CONTROLS BAR: FILTER TABS & SEARCH                               */}
        {/* ================================================================ */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full md:w-auto overflow-x-auto">
            <button
              type="button"
              onClick={() => {
                setSelectedStatus("PENDING");
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedStatus === "PENDING"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              অপেক্ষমান (PENDING)
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedStatus("APPROVED");
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedStatus === "APPROVED"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              অনুমোদিত (APPROVED)
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedStatus("REJECTED");
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedStatus === "REJECTED"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              বাতিলকৃত (REJECTED)
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedStatus("ALL");
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedStatus === "ALL"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              সকল আবেদন (ALL)
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="নাম, ফোন, বা শপ খুঁজুন..."
              className="h-10 pl-9 pr-4 rounded-xl bg-slate-50 border-slate-200 text-xs focus:bg-white focus:border-[#FF6F0F]"
            />
          </div>
        </div>

        {/* ================================================================ */}
        {/* APPLICATIONS TABLE                                               */}
        {/* ================================================================ */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 text-[#FF6F0F] animate-spin" />
              <p className="mt-3 text-xs sm:text-sm text-slate-500 font-medium">
                আবেদনের তথ্য লোড হচ্ছে...
              </p>
            </div>
          ) : applications.length === 0 ? (
            <div className="py-20 px-4 text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-3xl bg-slate-100 text-slate-400 mb-3">
                <Users className="h-7 w-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                কোনো আবেদন পাওয়া যায়নি
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {debouncedSearch
                  ? `"${debouncedSearch}" এর সাথে মিলে এমন কোনো সেলার আবেদন মেলেনি। ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।`
                  : selectedStatus === "PENDING"
                  ? "বর্তমানে পর্যালোচনার জন্য কোনো নতুন সেলার আবেদন অপেক্ষমান নেই।"
                  : "এই স্ট্যাটাসে বর্তমানে কোনো আবেদন নথিভুক্ত নেই।"}
              </p>
              {debouncedSearch && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mt-4 text-xs font-bold text-[#FF6F0F] hover:underline cursor-pointer"
                >
                  সার্চ ক্লিয়ার করুন
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80">
                    <TableHead className="w-64">আবেদনকারী (Applicant)</TableHead>
                    <TableHead className="w-52">যোগাযোগ (Contact)</TableHead>
                    <TableHead className="w-60">দোকান ও অবস্থান (Shop & Location)</TableHead>
                    <TableHead className="w-36">আবেদনের তারিখ</TableHead>
                    <TableHead className="w-32">স্ট্যাটাস</TableHead>
                    <TableHead className="text-right w-48">অ্যাকশন (Actions)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => {
                    const appPhone = app.phoneNumber || app.phone;
                    const isRowActionLoading = actionLoadingId === app.id;
                    const initials = (app.fullName || "U")
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase();

                    return (
                      <TableRow key={app.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* 1. Applicant */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border border-slate-200 shrink-0">
                              {app.avatar && <AvatarImage src={app.avatar} alt={app.fullName} />}
                              <AvatarFallback className="bg-gradient-to-br from-[#FF6F0F] to-[#F95738] text-white font-bold text-xs">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                                {app.fullName}
                              </p>
                              {app.email && (
                                <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                                  <Mail className="h-3 w-3 shrink-0 text-slate-400" />
                                  <span className="truncate">{app.email}</span>
                                </p>
                              )}
                              <button
                                type="button"
                                onClick={(e) => handleCopyId(app.id, e)}
                                className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-700 mt-0.5 font-mono cursor-pointer"
                                title="ইউজার আইডি কপি করুন"
                              >
                                {copiedId === app.id ? (
                                  <>
                                    <Check className="h-2.5 w-2.5 text-emerald-600" />
                                    <span className="text-emerald-600 font-semibold">কপি হয়েছে</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-2.5 w-2.5" />
                                    <span>ID: {app.id.slice(0, 8)}...</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </TableCell>

                        {/* 2. Contact */}
                        <TableCell>
                          <div className="space-y-1 text-xs">
                            {appPhone ? (
                              <a
                                href={`tel:${appPhone}`}
                                className="font-semibold text-slate-800 hover:text-[#FF6F0F] flex items-center gap-1.5 transition-colors"
                              >
                                <Phone className="h-3.5 w-3.5 text-[#FF6F0F]" />
                                <span>{appPhone}</span>
                              </a>
                            ) : (
                              <span className="text-slate-400 italic">ফোন নেই</span>
                            )}

                            {app.whatsappNumber && (
                              <a
                                href={`https://wa.me/${app.whatsappNumber.replace(/[^0-9]/g, "")}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] font-medium text-emerald-700 hover:underline flex items-center gap-1.5"
                              >
                                <MessageCircle className="h-3 w-3 text-emerald-600" />
                                <span>WA: {app.whatsappNumber}</span>
                              </a>
                            )}
                          </div>
                        </TableCell>

                        {/* 3. Shop & Location */}
                        <TableCell>
                          <div className="space-y-0.5 text-xs">
                            <p className="font-bold text-slate-900 flex items-center gap-1.5">
                              <Store className="h-3.5 w-3.5 text-[#FF6F0F] shrink-0" />
                              <span className="truncate">
                                {app.shopName || "ব্যক্তিগত বিক্রেতা"}
                              </span>
                            </p>
                            <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                              <span className="truncate">
                                {app.shopAddress ||
                                  app.address ||
                                  app.locationArea?.bnName ||
                                  app.area ||
                                  "এলাকা নির্ধারিত নেই"}
                              </span>
                            </p>
                          </div>
                        </TableCell>

                        {/* 4. Applied At */}
                        <TableCell>
                          <div className="text-xs text-slate-600 space-y-0.5">
                            <p className="font-medium">
                              {app.sellerAppliedAt
                                ? new Date(app.sellerAppliedAt).toLocaleDateString("bn-BD")
                                : app.updatedAt
                                ? new Date(app.updatedAt).toLocaleDateString("bn-BD")
                                : "—"}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {app.sellerAppliedAt
                                ? new Date(app.sellerAppliedAt).toLocaleTimeString("bn-BD", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : ""}
                            </p>
                          </div>
                        </TableCell>

                        {/* 5. Status Badge */}
                        <TableCell>
                          {getStatusBadge(app.sellerStatus)}
                          {app.sellerStatus === "REJECTED" && app.rejectionReason && (
                            <p className="text-[10px] text-rose-600 mt-1 truncate max-w-28" title={app.rejectionReason}>
                              {app.rejectionReason}
                            </p>
                          )}
                        </TableCell>

                        {/* 6. Actions */}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View Details */}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleViewDetail(app)}
                              className="h-8 w-8 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                              title="বিস্তারিত দেখুন"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            {/* If PENDING or REJECTED: allow Approve */}
                            {app.sellerStatus !== "APPROVED" && (
                              <Button
                                type="button"
                                size="sm"
                                disabled={isRowActionLoading}
                                onClick={() => handleApprove(app)}
                                className="h-8 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer transition-all"
                                title="অনুমোদন করুন"
                              >
                                {isRowActionLoading ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                )}
                                <span className="hidden sm:inline">অনুমোদন</span>
                              </Button>
                            )}

                            {/* If PENDING: allow Reject with reason */}
                            {app.sellerStatus === "PENDING" && (
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                disabled={isRowActionLoading}
                                onClick={() => handleOpenRejectDialog(app)}
                                className="h-8 px-2.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold text-xs flex items-center gap-1 cursor-pointer transition-all"
                                title="বাতিল করুন"
                              >
                                <XCircle className="h-3.5 w-3.5 text-rose-600" />
                                <span className="hidden sm:inline">বাতিল</span>
                              </Button>
                            )}

                            {/* If APPROVED: allow Revoke with reason */}
                            {(app.sellerStatus === "APPROVED" || app.role === "SELLER") && (
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                disabled={isRowActionLoading}
                                onClick={() => handleOpenRevokeDialog(app)}
                                className="h-8 px-2.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold text-xs flex items-center gap-1 cursor-pointer transition-all"
                                title="সেলার অধিকার প্রত্যাহার (Revoke)"
                              >
                                <UserX className="h-3.5 w-3.5 text-rose-600" />
                                <span className="hidden sm:inline">প্রত্যাহার</span>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <span>
                মোট <strong>{totalCount}</strong> টি আবেদনের মধ্যে পৃষ্ঠা <strong>{page}</strong> / {totalPages}
              </span>

              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-8 px-2.5 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                  পূর্ববর্তী
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="h-8 px-2.5 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  পরবর্তী
                  <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ================================================================ */}
      {/* MODAL 1: APPLICATION IN-DEPTH DETAILS                           */}
      {/* ================================================================ */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-xl rounded-3xl p-6 sm:p-8 bg-white border border-slate-200 shadow-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                <Store className="h-3.5 w-3.5 text-[#FF6F0F]" />
                <span>সেলার প্রোফাইল বিবরণ</span>
              </div>
              {selectedAppForDetail && getStatusBadge(selectedAppForDetail.sellerStatus)}
            </div>
            <DialogTitle className="text-xl font-black text-slate-900 mt-2">
              {selectedAppForDetail?.shopName || selectedAppForDetail?.fullName}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              আবেদনকারী ইউজার ও ব্যবসায়িক তথ্যাবলির সম্পূর্ণ রূপরেখা
            </DialogDescription>
          </DialogHeader>

          {selectedAppForDetail && (
            <div className="space-y-4 my-2 text-xs">
              {/* Applicant Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                <Avatar className="h-12 w-12 border border-slate-200">
                  {selectedAppForDetail.avatar && (
                    <AvatarImage src={selectedAppForDetail.avatar} alt={selectedAppForDetail.fullName} />
                  )}
                  <AvatarFallback className="bg-gradient-to-br from-[#FF6F0F] to-[#F95738] text-white font-bold text-sm">
                    {(selectedAppForDetail.fullName || "U").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {selectedAppForDetail.fullName}
                  </h4>
                  <p className="text-slate-500 font-mono text-[11px]">
                    ID: {selectedAppForDetail.id}
                  </p>
                  <p className="text-slate-500 mt-0.5">
                    রোল: <span className="font-semibold text-slate-800">{selectedAppForDetail.role}</span>
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-4 rounded-2xl bg-white border border-slate-200">
                <div className="space-y-1">
                  <span className="text-slate-400 font-medium text-[11px]">ফোন নম্বর</span>
                  <p className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-[#FF6F0F]" />
                    <span>{selectedAppForDetail.phoneNumber || selectedAppForDetail.phone || "তথ্য নেই"}</span>
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 font-medium text-[11px]">হোয়াটসঅ্যাপ</span>
                  <p className="font-bold text-slate-900 flex items-center gap-1.5">
                    <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{selectedAppForDetail.whatsappNumber || "যুক্ত নেই"}</span>
                  </p>
                </div>

                <div className="space-y-1 sm:col-span-2 pt-2 border-t border-slate-100">
                  <span className="text-slate-400 font-medium text-[11px]">ইমেইল এড্রেস</span>
                  <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span>{selectedAppForDetail.email || "ইমেইল প্রদান করা হয়নি"}</span>
                  </p>
                </div>
              </div>

              {/* Shop & Location Information */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                <div>
                  <span className="text-slate-400 font-medium text-[11px]">দোকানের নাম</span>
                  <p className="font-bold text-slate-900 text-sm">
                    {selectedAppForDetail.shopName || "ব্যক্তিগত বিক্রেতা (শপ নাম নেই)"}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 font-medium text-[11px]">দোকান বা পণ্য প্রেরণের ঠিকানা</span>
                  <p className="font-semibold text-slate-800 flex items-start gap-1.5 mt-0.5">
                    <MapPin className="h-3.5 w-3.5 text-[#FF6F0F] shrink-0 mt-0.5" />
                    <span>
                      {selectedAppForDetail.shopAddress ||
                        selectedAppForDetail.address ||
                        selectedAppForDetail.locationArea?.bnName ||
                        selectedAppForDetail.area ||
                        "ঠিকানা উল্লেখ করা হয়নি"}
                    </span>
                  </p>
                </div>

                {selectedAppForDetail.bio && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-slate-400 font-medium text-[11px]">দোকানের বিবরণ (Bio)</span>
                    <p className="text-slate-700 leading-relaxed mt-0.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      {selectedAppForDetail.bio}
                    </p>
                  </div>
                )}
              </div>

              {/* If Rejected: Show Rejection Reason */}
              {selectedAppForDetail.sellerStatus === "REJECTED" && selectedAppForDetail.rejectionReason && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200">
                  <span className="text-rose-900 font-bold flex items-center gap-1.5 text-xs">
                    <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                    বাতিলের কারণ:
                  </span>
                  <p className="text-xs text-rose-800 mt-1">
                    {selectedAppForDetail.rejectionReason}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="mt-4 flex flex-col sm:flex-row items-center gap-2">
            {selectedAppForDetail?.sellerStatus !== "APPROVED" && (
              <Button
                type="button"
                onClick={() => selectedAppForDetail && handleApprove(selectedAppForDetail)}
                disabled={actionLoadingId === selectedAppForDetail?.id}
                className="w-full sm:w-auto h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                {actionLoadingId === selectedAppForDetail?.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                )}
                <span>আবেদন অনুমোদন করুন</span>
              </Button>
            )}

            {selectedAppForDetail?.sellerStatus === "PENDING" && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => selectedAppForDetail && handleOpenRejectDialog(selectedAppForDetail)}
                className="w-full sm:w-auto h-10 px-5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <XCircle className="h-3.5 w-3.5" />
                <span>বাতিল করুন</span>
              </Button>
            )}

            {(selectedAppForDetail?.sellerStatus === "APPROVED" || selectedAppForDetail?.role === "SELLER") && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => selectedAppForDetail && handleOpenRevokeDialog(selectedAppForDetail)}
                className="w-full sm:w-auto h-10 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-rose-500/20 cursor-pointer"
              >
                <UserX className="h-3.5 w-3.5" />
                <span>সেলার সুবিধা প্রত্যাহার (Revoke)</span>
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDetailOpen(false)}
              className="w-full sm:w-auto h-10 px-5 rounded-xl text-xs font-bold border-slate-300 cursor-pointer"
            >
              বন্ধ করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================================================================ */}
      {/* MODAL 2: REJECTION REASON DIALOG                                 */}
      {/* ================================================================ */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6 sm:p-7 bg-white border border-rose-200 shadow-2xl">
          <DialogHeader>
            <div className="h-10 w-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-2">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <DialogTitle className="text-lg font-black text-slate-900">
              আবেদন বাতিলের কারণ উল্লেখ করুন
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {selectedAppForReject?.fullName} এর সেলার আবেদন বাতিল করা হচ্ছে। আবেদনকারী ইউজার পরবর্তীতে এই কারণ দেখতে পাবেন।
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2 text-xs">
            {/* Quick Preset Badges */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-600">
                সাধারণ কারণ নির্বাচন করুন:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {REJECTION_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setRejectionReason(preset)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                      rejectionReason === preset
                        ? "bg-rose-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Reason Textarea */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700">
                নির্দিষ্ট কারণ লিখুন (Custom Reason):
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="উদা: আপনার ফোন নম্বরটিতে কল করে সংযোগ পাওয়া যায়নি..."
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none"
              />
            </div>
          </div>

          <DialogFooter className="mt-4 flex flex-col sm:flex-row items-center gap-2">
            <Button
              type="button"
              disabled={isSubmittingReject}
              onClick={handleConfirmReject}
              className="w-full sm:w-auto h-10 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-rose-500/20 cursor-pointer"
            >
              {isSubmittingReject ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <XCircle className="h-3.5 w-3.5" />
              )}
              <span>বাতিল নিশ্চিত করুন</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRejectOpen(false)}
              className="w-full sm:w-auto h-10 px-5 rounded-xl text-xs font-bold border-slate-300 cursor-pointer"
            >
              ফিরে যান
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================================================================ */}
      {/* MODAL 3: SELLER REVOCATION DIALOG                                */}
      {/* ================================================================ */}
      <Dialog open={isRevokeOpen} onOpenChange={setIsRevokeOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6 sm:p-7 bg-white border border-rose-300 shadow-2xl">
          <DialogHeader>
            <div className="h-10 w-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-2">
              <UserX className="h-5 w-5" />
            </div>
            <DialogTitle className="text-lg font-black text-slate-900">
              সেলার অধিকার প্রত্যাহার (Revoke Seller)
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {selectedAppForRevoke?.fullName} এর সেলার অ্যাকাউন্ট স্থগিত ও অধিকার প্রত্যাহার করা হচ্ছে।
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2 text-xs">
            {/* Warning Alert */}
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-rose-900">
                <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>সতর্কতা: পণ্যসমূহ হাইড করা হবে</span>
              </p>
              <p className="text-[11px] leading-relaxed">
                সেলার সুবিধা প্রত্যাহার করলে ব্যবহারকারীর রোল সাধারণ ক্রেতা (USER) হিসেবে পরিবর্তিত হবে এবং এই সেলারের সকল সক্রিয় প্রোডাক্ট লিস্টিং মার্কেটপ্লেস থেকে সঙ্গে সঙ্গে হাইড (আর্কাইভ) হয়ে যাবে।
              </p>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-600">
                স্থগিতের সাধারণ কারণ নির্বাচন করুন:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {REVOCATION_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setRevokeReason(preset)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                      revokeReason === preset
                        ? "bg-rose-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Specific Reason Textarea */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700">
                নির্দিষ্ট কারণ উল্লেখ করুন (Reason):
              </label>
              <textarea
                rows={3}
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                placeholder="উদা: পলিসি লঙ্ঘন অথবা ক্রেতাদের বারবার অসৌজন্যমূলক আচরণের অভিযোগ..."
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none"
              />
            </div>
          </div>

          <DialogFooter className="mt-4 flex flex-col sm:flex-row items-center gap-2">
            <Button
              type="button"
              disabled={isSubmittingRevoke}
              onClick={handleConfirmRevoke}
              className="w-full sm:w-auto h-10 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-rose-500/20 cursor-pointer"
            >
              {isSubmittingRevoke ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <UserX className="h-3.5 w-3.5" />
              )}
              <span>সেলার অধিকার প্রত্যাহার নিশ্চিত করুন</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRevokeOpen(false)}
              className="w-full sm:w-auto h-10 px-5 rounded-xl text-xs font-bold border-slate-300 cursor-pointer"
            >
              ফিরে যান
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
