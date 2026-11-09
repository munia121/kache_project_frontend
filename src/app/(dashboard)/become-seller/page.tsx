/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { userService } from "@/services/user.service";
import { ILocationArea, SellerStatus } from "@/types/user.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/share/Navbar";
import { toast } from "sonner";
import {
  Store,
  Sparkles,
  MapPin,
  Phone,
  ShieldCheck,
  Loader2,
  Clock,
  XCircle,
  RefreshCw,
  ShoppingBag,
  MessageCircle,
  Building,
  CheckCircle2,
  FileText,
  AlertCircle,
  ArrowRight,
  UserX,
  AlertOctagon,
  Archive,
} from "lucide-react";

export default function BecomeSellerPage() {
  const router = useRouter();
  const { user, isAuthenticated, hasHydrated, setUser } = useAuthStore();
  const [isMounted, setIsMounted] = React.useState(false);

  // Form states
  const [shopName, setShopName] = React.useState("");
  const [shopAddress, setShopAddress] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [whatsappNumber, setWhatsappNumber] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [termsAccepted, setTermsAccepted] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Allow users with REJECTED status to re-apply
  const [isReapplying, setIsReapplying] = React.useState(false);
  const [isRefreshingStatus, setIsRefreshingStatus] = React.useState(false);

  // Quick area selection if area not set
  const [areas, setAreas] = React.useState<ILocationArea[]>([]);
  const [selectedAreaId, setSelectedAreaId] = React.useState<string>("");
  const [isUpdatingArea, setIsUpdatingArea] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Initialize form fields when user data is available
  React.useEffect(() => {
    if (user) {
      setShopName(user.shopName || "");
      setShopAddress(user.shopAddress || user.address || "");
      setPhoneNumber(user.phoneNumber || user.phone || "");
      setWhatsappNumber(user.whatsappNumber || "");
      setBio(user.bio || "");
      if (user.areaId) {
        setSelectedAreaId(user.areaId);
      }
    }
  }, [user]);

  // Auth Guard: ONLY trigger AFTER hydration is complete
  React.useEffect(() => {
    if (isMounted && hasHydrated) {
      if (!isAuthenticated) {
        toast.info("সেলার অনবোর্ডিং করতে প্রথমে লগইন করুন");
        router.push("/login?redirect=/become-seller");
      }
    }
  }, [isMounted, hasHydrated, isAuthenticated, router]);

  // Load areas for quick selection if needed
  React.useEffect(() => {
    if (isMounted && hasHydrated && isAuthenticated) {
      userService.getAreas().then((res) => {
        if (res.success && res.data) {
          setAreas(res.data);
          if (!user?.areaId && res.data.length > 0) {
            setSelectedAreaId(res.data[0].id);
          }
        }
      });
    }
  }, [isMounted, hasHydrated, isAuthenticated, user?.areaId]);

  const handleSetAreaQuickly = async () => {
    if (!selectedAreaId) return;
    try {
      setIsUpdatingArea(true);
      const res = await userService.updateProfile({ areaId: selectedAreaId });
      if (res.success && res.data) {
        setUser(res.data);
        toast.success("এলাকা সফলভাবে নির্ধারণ করা হয়েছে!");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "এলাকা সেট করা যায়নি।");
    } finally {
      setIsUpdatingArea(false);
    }
  };

  // Status refresh from backend
  const handleRefreshStatus = async () => {
    try {
      setIsRefreshingStatus(true);
      const res = await userService.getMyProfile();
      if (res.success && res.data) {
        setUser(res.data);
        toast.success("স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে", {
          description: `বর্তমান স্ট্যাটাস: ${
            res.data.sellerStatus === "APPROVED"
              ? "অনুমোদিত"
              : res.data.sellerStatus === "PENDING"
              ? "পর্যালোচনাধীন"
              : res.data.sellerStatus === "REJECTED"
              ? "বাতিলকৃত"
              : "আবেদন করা হয়নি"
          }`,
        });
      }
    } catch {
      toast.error("স্ট্যাটাস রিফ্রেশ করতে সমস্যা হয়েছে");
    } finally {
      setIsRefreshingStatus(false);
    }
  };

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!termsAccepted) {
      toast.error("সেলার হতে হলে আপনাকে শর্তাবলী মেনে নিতে হবে।");
      return;
    }

    const currentPhone = phoneNumber.trim() || user?.phone || user?.phoneNumber;
    if (!currentPhone) {
      toast.error("আবেদন করতে অনুগ্রহ করে একটি ফোন নম্বর প্রদান করুন।");
      return;
    }

    try {
      setIsLoading(true);

      // Also ensure profile has the latest phone/whatsapp/shopAddress if provided
      const profileUpdates: Record<string, any> = {};
      if (shopAddress.trim() && shopAddress.trim() !== (user?.address || user?.shopAddress)) {
        profileUpdates.address = shopAddress.trim();
        profileUpdates.shopAddress = shopAddress.trim();
      }
      if (whatsappNumber.trim()) {
        profileUpdates.whatsappNumber = whatsappNumber.trim();
      }
      if (selectedAreaId && selectedAreaId !== user?.areaId) {
        profileUpdates.areaId = selectedAreaId;
      }

      if (Object.keys(profileUpdates).length > 0) {
        try {
          await userService.updateProfile(profileUpdates);
        } catch {
          // Non-blocking: continue with seller application
        }
      }

      const res = await userService.becomeSeller({
        termsAccepted: true,
        shopName: shopName.trim() || null,
        shopAddress: shopAddress.trim() || null,
        bio: bio.trim() || null,
        phoneNumber: currentPhone,
        whatsappNumber: whatsappNumber.trim() || undefined,
      });

      if (res.success && res.data) {
        setUser(res.data);
        setIsReapplying(false);
        toast.success("আপনার সেলার আবেদন সফলভাবে জমা দেওয়া হয়েছে!", {
          description: "অ্যাডমিন টিম আবেদনটি যাচাই করে অনুমোদন প্রদান করবে।",
        });
      } else {
        toast.error(res?.message || "সেলার আবেদন সম্পন্ন করা যায়নি।");
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "সেলার আবেদন জমা দিতে সমস্যা হয়েছে।";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted || !hasHydrated) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 text-[#FF6F0F] animate-spin" />
          <p className="mt-3 text-sm text-slate-500 font-medium">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const effectiveStatus: SellerStatus =
    user.role === "SELLER"
      ? "APPROVED"
      : user.sellerStatus || "NONE";

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <Navbar />

      <main className="flex-1 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* ============================================================== */}
          {/* STATE 1: ALREADY APPROVED / ACTIVE SELLER                     */}
          {/* ============================================================== */}
          {effectiveStatus === "APPROVED" && (
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm text-center animate-in fade-in duration-300">
              <div className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-emerald-50 text-emerald-600 mb-5 ring-8 ring-emerald-50/50">
                <ShieldCheck className="h-10 w-10" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-bold mb-3">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>অনুমোদিত বিক্রেতা</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                আপনি একজন অনুমোদিত বিক্রেতা!
              </h1>
              <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
                আপনার সেলার অ্যাকাউন্ট সক্রিয় রয়েছে। আপনি যেকোনো সময় পণ্যের বিজ্ঞাপন পোস্ট করতে পারেন এবং সরাসরি ক্রেতাদের সাথে চ্যাট করতে পারেন।
              </p>

              {/* Shop Summary Card */}
              {(user.shopName || user.locationArea?.bnName || user.area) && (
                <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left max-w-md mx-auto space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="font-medium text-slate-500">দোকানের নাম:</span>
                    <span className="font-bold text-slate-900">{user.shopName || "ব্যক্তিগত বিক্রেতা"}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="font-medium text-slate-500">এলাকা:</span>
                    <span className="font-semibold text-slate-900">
                      {user.locationArea?.bnName || user.area || "সেট নেই"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="font-medium text-slate-500">যোগাযোগ:</span>
                    <span className="font-semibold text-slate-900">
                      {user.phone || user.phoneNumber || "তথ্য নেই"}
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/post-ad"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#FF6F0F] hover:bg-[#F95738] text-white font-bold text-sm shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  নতুন বিজ্ঞাপন দিন
                </Link>
                <Link
                  href="/my-listings"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="h-4 w-4" />
                  আমার বিজ্ঞাপন দেখুন
                </Link>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STATE 2: PENDING APPROVAL                                     */}
          {/* ============================================================== */}
          {effectiveStatus === "PENDING" && (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden animate-in fade-in duration-300">
              {/* Header Banner */}
              <div className="px-6 sm:px-10 py-8 bg-gradient-to-r from-amber-500 via-orange-500 to-[#FF6F0F] text-white">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white mb-3">
                  <Clock className="h-3.5 w-3.5 animate-pulse" />
                  <span>আবেদন পর্যালোচনায় রয়েছে</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                  আপনার বিক্রেতা আবেদনটি পর্যালোচনায় রয়েছে
                </h1>
                <p className="text-xs sm:text-sm text-orange-100 mt-2 max-w-xl leading-relaxed">
                  কাছে (Kache) অ্যাডমিন টিম আপনার বিক্রেতা আবেদনটি খতিয়ে দেখছে। সাধারণ ক্ষেত্রে ২৪ থেকে ৪৮ ঘণ্টার মধ্যে আবেদনটি পর্যালোচনা করা হয়।
                </p>
              </div>

              <div className="p-6 sm:p-10 space-y-6">
                {/* Status Notice Card */}
                <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-amber-900">
                      পর্যালোচনা চলছে (Status: PENDING)
                    </h3>
                    <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                      আবেদন অনুমোদিত হওয়ার সাথে সাথে আপনার অ্যাকাউন্টে বিক্রেতা অধিকার যুক্ত হবে এবং আপনি যেকোনো পণ্য সরাসরি বিক্রয়ের জন্য পোস্ট করতে পারবেন।
                    </p>
                  </div>
                </div>

                {/* Submitted Application Details */}
                <div className="border border-slate-200/80 rounded-2xl overflow-hidden">
                  <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <FileText className="h-4 w-4 text-[#FF6F0F]" />
                      জমা দেওয়া আবেদনের বিবরণ
                    </h3>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      অপেক্ষমান
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 text-xs">
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <span className="text-slate-500 font-medium">আবেদনকারীর নাম:</span>
                      <span className="sm:col-span-2 font-bold text-slate-900">{user.fullName}</span>
                    </div>

                    <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <span className="text-slate-500 font-medium">দোকান বা ব্র্যান্ড:</span>
                      <span className="sm:col-span-2 font-bold text-slate-900">
                        {user.shopName || "ব্যক্তিগত বিক্রেতা হিসেবে আবেদন"}
                      </span>
                    </div>

                    <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <span className="text-slate-500 font-medium">ফোন নম্বর:</span>
                      <span className="sm:col-span-2 font-semibold text-slate-900">
                        {user.phoneNumber || user.phone || "তথ্য নেই"}
                      </span>
                    </div>

                    {user.whatsappNumber && (
                      <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <span className="text-slate-500 font-medium">হোয়াটসঅ্যাপ:</span>
                        <span className="sm:col-span-2 font-semibold text-slate-900">
                          {user.whatsappNumber}
                        </span>
                      </div>
                    )}

                    <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <span className="text-slate-500 font-medium">ঠিকানা / এলাকা:</span>
                      <span className="sm:col-span-2 font-semibold text-slate-900">
                        {user.shopAddress || user.address || user.locationArea?.bnName || user.area || "তথ্য নেই"}
                      </span>
                    </div>

                    {user.bio && (
                      <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <span className="text-slate-500 font-medium">দোকানের পরিচিতি:</span>
                        <span className="sm:col-span-2 text-slate-700 leading-relaxed">
                          {user.bio}
                        </span>
                      </div>
                    )}

                    <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <span className="text-slate-500 font-medium">আবেদনের তারিখ:</span>
                      <span className="sm:col-span-2 text-slate-600">
                        {user.sellerAppliedAt
                          ? new Date(user.sellerAppliedAt).toLocaleString("bn-BD")
                          : user.updatedAt
                          ? new Date(user.updatedAt).toLocaleString("bn-BD")
                          : "সম্প্রতি"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <Button
                    type="button"
                    onClick={handleRefreshStatus}
                    disabled={isRefreshingStatus}
                    className="w-full sm:w-auto h-11 px-6 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className={`h-4 w-4 ${isRefreshingStatus ? "animate-spin" : ""}`} />
                    <span>{isRefreshingStatus ? "যাচাই করা হচ্ছে..." : "স্ট্যাটাস রিফ্রেশ করুন"}</span>
                  </Button>

                  <Link
                    href="/products"
                    className="w-full sm:w-auto h-11 px-6 rounded-xl bg-[#FF6F0F] hover:bg-[#F95738] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-orange-500/20"
                  >
                    <span>মার্কেটপ্লেস ব্রাউজ করুন</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STATE 3: REJECTED / REVOKED STATE                             */}
          {/* ============================================================== */}
          {effectiveStatus === "REJECTED" && !isReapplying && (() => {
            const isRevokedNotice =
              Boolean(
                user.rejectionReason &&
                  (user.rejectionReason.includes("স্থগিত") ||
                    user.rejectionReason.includes("প্রত্যাহার") ||
                    user.rejectionReason.includes("পলিসি") ||
                    user.rejectionReason.includes("অভিযোগ") ||
                    user.rejectionReason.includes("revok"))
              ) || Boolean(user.shopName && (user.phone || user.phoneNumber));

            return (
              <div className="bg-white rounded-3xl border border-rose-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
                {/* Header Banner */}
                <div className="px-6 sm:px-10 py-8 bg-gradient-to-r from-rose-700 via-rose-600 to-red-600 text-white">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white mb-3">
                    {isRevokedNotice ? (
                      <UserX className="h-3.5 w-3.5" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5" />
                    )}
                    <span>
                      {isRevokedNotice
                        ? "সেলার অধিকার প্রত্যাহারকৃত (Revoked)"
                        : "আবেদন বাতিলকৃত"}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                    {isRevokedNotice
                      ? "আপনার বিক্রেতা অ্যাকাউন্ট ও সুবিধা স্থগিত করা হয়েছে"
                      : "আপনার সেলার আবেদনটি গৃহীত হয়নি"}
                  </h1>
                  <p className="text-xs sm:text-sm text-rose-100 mt-2 max-w-xl leading-relaxed">
                    {isRevokedNotice
                      ? "কাছে (Kache) অ্যাডমিন টিম নীতিমালার প্রেক্ষিতে আপনার সেলার অ্যাকাউন্ট সাময়িকভাবে স্থগিত করেছে এবং সক্রিয় বিজ্ঞাপনসমূহ হাইড করা হয়েছে।"
                      : "দুঃখিত, প্ল্যাটফর্মের নীতিমালা বা তথ্যের অসামঞ্জস্যতার কারণে অ্যাডমিন টিম আবেদনটি অনুমোদন করতে পারেনি।"}
                  </p>
                </div>

                <div className="p-6 sm:p-10 space-y-6">
                  {/* Rejection / Revocation Reason Box */}
                  <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200">
                    <h3 className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-rose-600" />
                      {isRevokedNotice
                        ? "স্থগিত বা প্রত্যাহারের কারণ (Revocation Reason)"
                        : "বাতিল করার কারণ"}
                    </h3>
                    <p className="text-sm text-rose-900 mt-2 font-medium leading-relaxed bg-white/90 p-4 rounded-xl border border-rose-200/90 shadow-2xs">
                      {user.rejectionReason ||
                        (isRevokedNotice
                          ? "অ্যাডমিন কর্তৃক সেলার অ্যাকাউন্ট স্থগিত বা বাতিল করা হয়েছে।"
                          : "প্রদত্ত তথ্য অথবা ফোন নম্বর যাচাই করা সম্ভব হয়নি।")}
                    </p>
                  </div>

                  {/* Impact Notice for Revoked Seller */}
                  {isRevokedNotice && (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3.5 text-xs text-amber-900">
                      <Archive className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-bold text-amber-950">
                          আপনার পণ্যসমূহ বর্তমানে হাইড (আর্কাইভ) রয়েছে
                        </p>
                        <p className="text-amber-800 leading-relaxed">
                          নিরাপত্তা ও ক্রেতা সুরক্ষার স্বার্থে এই সেলার অ্যাকাউন্টের সকল সক্রিয় প্রোডাক্ট লিস্টিং সাময়িকভাবে মার্কেটপ্লেস থেকে হাইড রাখা হয়েছে। আপনার প্রোফাইল ও তথ্যাদি সংশোধন করে পুনরায় সেলার হওয়ার জন্য আবেদন করতে পারেন।
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                    <p className="font-bold text-slate-800">পরবর্তী করণীয়:</p>
                    <p>
                      আপনি আপনার ফোন নম্বর, দোকানের নাম, অথবা প্রয়োজনীয় তথ্য সংশোধন করে নিচের বাটনে ক্লিক করে পুনরায় সেলার আবেদন জমা দিতে পারেন।
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <Button
                      type="button"
                      onClick={() => setIsReapplying(true)}
                      className="w-full sm:w-auto h-12 px-7 rounded-2xl bg-[#FF6F0F] hover:bg-[#F95738] text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/25 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Sparkles className="h-4 w-4" />
                      তথ্য সংশোধন করে পুনরায় আবেদন করুন
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      disabled={isRefreshingStatus}
                      onClick={handleRefreshStatus}
                      className="w-full sm:w-auto h-12 px-6 rounded-2xl border-slate-300 text-slate-800 font-bold text-xs sm:text-sm cursor-pointer flex items-center justify-center gap-2"
                    >
                      <RefreshCw className={`h-4 w-4 ${isRefreshingStatus ? "animate-spin" : ""}`} />
                      <span>{isRefreshingStatus ? "যাচাই হচ্ছে..." : "স্ট্যাটাস রিফ্রেশ"}</span>
                    </Button>

                    <Link
                      href="/"
                      className="w-full sm:w-auto h-12 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-center"
                    >
                      হোমে ফিরে যান
                    </Link>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ============================================================== */}
          {/* STATE 4: APPLICATION FORM (NONE or RE-APPLYING)               */}
          {/* ============================================================== */}
          {(effectiveStatus === "NONE" || isReapplying) && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
              {/* Banner Header */}
              <div className="px-6 sm:px-10 py-8 bg-gradient-to-r from-[#FF6F0F] to-[#F95738] text-white">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white mb-3">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>
                    {isReapplying ? "পুনরায় সেলার আবেদন" : "সেলার রেজিস্ট্রেশন"}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                  কাছে বিক্রেতা অনবোর্ডিং
                </h1>
                <p className="text-xs sm:text-sm text-orange-100 mt-1 max-w-xl leading-relaxed">
                  আপনার এলাকার ক্রেতাদের কাছে দ্রুত ও নিরাপদে পণ্য বিক্রি করতে আপনার বিক্রেতা প্রোফাইল তৈরি করুন। আবেদন অনুমোদনের পর আপনি সরাসরি বিজ্ঞাপন পোস্ট করতে পারবেন।
                </p>
              </div>

              <form onSubmit={handleOnboardSubmit} className="p-6 sm:p-10 space-y-6">
                {/* Reapply Notice */}
                {isReapplying && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-amber-800 font-medium">
                      <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                      <span>আপনি পূর্বে বাতিলকৃত আবেদনের তথ্য সংশোধন করছেন।</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsReapplying(false)}
                      className="text-xs text-amber-900 underline font-bold hover:text-amber-700 cursor-pointer"
                    >
                      বাতিল করুন
                    </button>
                  </div>
                )}

                {/* Section 1: Personal & Contact Verification */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[#FF6F0F]" />
                    ১. ব্যক্তিগত ও যোগাযোগের তথ্য
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        পূর্ণ নাম (Full Name)
                      </label>
                      <Input
                        type="text"
                        value={user.fullName}
                        disabled
                        className="h-10 rounded-xl bg-slate-100 border-slate-200 text-xs text-slate-600 cursor-not-allowed"
                      />
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <span>ফোন নম্বর</span>
                        <span className="text-rose-500">*</span>
                      </label>
                      <Input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="01XXXXXXXXX"
                        className="h-10 rounded-xl bg-white border-slate-300 text-xs focus:border-[#FF6F0F]"
                      />
                    </div>

                    {/* WhatsApp Number */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                        <span>হোয়াটসঅ্যাপ নম্বর (ঐচ্ছিক)</span>
                      </label>
                      <Input
                        type="tel"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        placeholder="01XXXXXXXXX"
                        className="h-10 rounded-xl bg-white border-slate-300 text-xs focus:border-[#FF6F0F]"
                      />
                      <p className="text-[10px] text-slate-400">
                        ক্রেতারা সরাসরি হোয়াটসঅ্যাপে যোগাযোগ করার জন্য ব্যবহার করা হবে।
                      </p>
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        ইমেইল এড্রেস
                      </label>
                      <Input
                        type="email"
                        value={user.email || ""}
                        disabled
                        placeholder="ইমেইল যুক্ত নেই"
                        className="h-10 rounded-xl bg-slate-100 border-slate-200 text-xs text-slate-600 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Shop & Business Details */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Building className="h-4 w-4 text-[#FF6F0F]" />
                    ২. দোকান ও ব্যবসার বিবরণ
                  </h3>

                  {/* Shop Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      দোকান বা ব্র্যান্ডের নাম (ঐচ্ছিক)
                    </label>
                    <Input
                      type="text"
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      placeholder="উদা: সায়মার ক্লোজেট, টেক পয়েন্ট, অথবা রহিম ইলেকট্রনিক্স"
                      className="h-11 rounded-xl bg-white border-slate-300 text-xs sm:text-sm focus:border-[#FF6F0F]"
                    />
                    <p className="text-[11px] text-slate-400">
                      ব্যক্তিগত অব্যবহৃত জিনিস বিক্রির ক্ষেত্রে এটি খালি রাখতে পারেন।
                    </p>
                  </div>

                  {/* Shop Address */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      দোকান বা পণ্য প্রেরণের ঠিকানা
                    </label>
                    <Input
                      type="text"
                      value={shopAddress}
                      onChange={(e) => setShopAddress(e.target.value)}
                      placeholder="উদা: দোকান # ৫, রোড # ২, মিরপুর ১০, ঢাকা"
                      className="h-11 rounded-xl bg-white border-slate-300 text-xs sm:text-sm focus:border-[#FF6F0F]"
                    />
                  </div>

                  {/* Area Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>ডিফল্ট এলাকা / জোন</span>
                      {user.areaId && (
                        <span className="text-[10px] text-emerald-600 font-bold">
                          ✓ সংরক্ষিত এলাকা: {user.locationArea?.bnName || user.area}
                        </span>
                      )}
                    </label>

                    {areas.length > 0 ? (
                      <div className="flex flex-col sm:flex-row items-center gap-2">
                        <select
                          value={selectedAreaId}
                          onChange={(e) => setSelectedAreaId(e.target.value)}
                          className="w-full sm:flex-1 h-10 px-3 rounded-xl bg-white border border-slate-300 text-xs font-medium text-slate-800"
                        >
                          <option value="">এলাকা নির্বাচন করুন...</option>
                          {areas.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.bnName || a.name} {a.district ? `(${a.district.bnName || a.district.name})` : ""}
                            </option>
                          ))}
                        </select>
                        {!user.areaId && (
                          <Button
                            type="button"
                            size="sm"
                            disabled={isUpdatingArea || !selectedAreaId}
                            onClick={handleSetAreaQuickly}
                            className="w-full sm:w-auto h-10 px-4 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl"
                          >
                            {isUpdatingArea ? "সেভ হচ্ছে..." : "এলাকা সেভ করুন"}
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-600">
                        <MapPin className="h-4 w-4 text-[#FF6F0F]" />
                        <span>
                          {user.locationArea?.bnName || user.area || "এলাকা প্রোফাইল থেকে সেট করুন"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Bio */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      বিক্রেতা পরিচিতি বা বিবরণ (ঐচ্ছিক)
                    </label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="আপনার বিক্রিত পণ্য বা শপের পরিষেবা সম্পর্কে সংক্ষেপে কিছু লিখুন..."
                      className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm focus:border-[#FF6F0F] focus:outline-none focus:ring-1 focus:ring-[#FF6F0F]"
                    />
                  </div>
                </div>

                {/* Section 3: Terms and Conditions */}
                <div className="p-4 sm:p-5 rounded-2xl bg-orange-50/70 border border-orange-200">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-[#FF6F0F] focus:ring-[#FF6F0F] cursor-pointer"
                    />
                    <span className="text-xs text-slate-700 leading-relaxed font-medium">
                      আমি শপথ করছি যে আমি কাছে (Kache) প্ল্যাটফর্মে কোনো অবৈধ, নকল, বা বিভ্রান্তিকর পণ্য তালিকাভুক্ত করব না। আমি বিক্রেতা নির্দেশিকা মেনে চলব এবং ক্রেতাদের সাথে সৎ ও দায়িত্বশীল আচরণ করব।
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isLoading || !termsAccepted}
                    className="w-full h-12 rounded-2xl bg-[#FF6F0F] hover:bg-[#F95738] active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-orange-500/25 transition-all cursor-pointer"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        আবেদন জমা হচ্ছে...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Store className="h-4 w-4" />
                        {isReapplying
                          ? "সংশোধিত আবেদন জমা দিন"
                          : "বিক্রেতা হিসেবে আবেদন জমা দিন"}
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
