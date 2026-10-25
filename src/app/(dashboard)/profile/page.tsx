"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { userService } from "@/services/user.service";
import { ILocationArea } from "@/types/user.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  User as UserIcon,
  Phone,
  Mail,
  MapPin,
  Store,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Edit3,
  Loader2,
  Search,
  Sparkles,
  ArrowRight,
  Package,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, hasHydrated, setUser, openAuthModal } = useAuthStore();
  const [isMounted, setIsMounted] = React.useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = React.useState(true);

  // Area Selection Dialog State
  const [isAreaModalOpen, setIsAreaModalOpen] = React.useState(false);
  const [areasList, setAreasList] = React.useState<ILocationArea[]>([]);
  const [areaSearchTerm, setAreaSearchTerm] = React.useState("");
  const [isSavingArea, setIsSavingArea] = React.useState(false);
  const [isLoadingAreas, setIsLoadingAreas] = React.useState(false);

  // Edit Name/Address Dialog State
  const [isEditProfileOpen, setIsEditProfileOpen] = React.useState(false);
  const [editName, setEditName] = React.useState("");
  const [editAddress, setEditAddress] = React.useState("");
  const [isSavingProfile, setIsSavingProfile] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Authentication Guard: ONLY redirect AFTER storage hydration is complete
  React.useEffect(() => {
    if (isMounted && hasHydrated) {
      if (!isAuthenticated) {
        toast.info("প্রোফাইল দেখতে প্রথমে লগইন করুন");
        openAuthModal("login");
        router.push("/");
      }
    }
  }, [isMounted, hasHydrated, isAuthenticated, openAuthModal, router]);

  // Fetch fresh profile data from backend on mount (only when authenticated)
  React.useEffect(() => {
    if (isMounted && hasHydrated && isAuthenticated) {
      userService
        .getMyProfile()
        .then((res) => {
          if (res.success && res.data) {
            setUser(res.data);
          }
        })
        .catch((err) => {
          console.warn("Could not sync fresh profile with backend:", err?.message);
        })
        .finally(() => {
          setIsLoadingProfile(false);
        });
    } else if (isMounted && hasHydrated && !isAuthenticated) {
      setIsLoadingProfile(false);
    }
  }, [isMounted, hasHydrated, isAuthenticated, setUser]);

  // Load areas when area selection dialog opens
  const handleOpenAreaModal = async () => {
    setIsAreaModalOpen(true);
    if (areasList.length === 0) {
      try {
        setIsLoadingAreas(true);
        const res = await userService.getAreas();
        if (res.success && res.data) {
          setAreasList(res.data);
        }
      } catch (err) {
        console.error("Failed to load areas:", err);
        toast.error("এলাকা তালিকা লোড করা যায়নি।");
      } finally {
        setIsLoadingAreas(false);
      }
    }
  };

  // Select and update Area
  const handleSelectArea = async (area: ILocationArea) => {
    try {
      setIsSavingArea(true);
      const res = await userService.updateProfile({ areaId: area.id });
      if (res.success && res.data) {
        setUser(res.data);
        toast.success(`আপনার এলাকা "${area.bnName || area.name}" নির্ধারণ করা হয়েছে!`);
        setIsAreaModalOpen(false);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "এলাকা আপডেট করতে ব্যর্থ হয়েছে।";
      toast.error(msg);
    } finally {
      setIsSavingArea(false);
    }
  };

  // Handle Edit Name & Address
  const handleOpenEditModal = () => {
    setEditName(user?.fullName || "");
    setEditAddress(user?.address || "");
    setIsEditProfileOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      toast.error("নাম খালি রাখা যাবে না");
      return;
    }

    try {
      setIsSavingProfile(true);
      const res = await userService.updateProfile({
        fullName: editName.trim(),
        address: editAddress.trim() || null,
      });

      if (res.success && res.data) {
        setUser(res.data);
        toast.success("প্রোফাইল তথ্য সফলভাবে আপডেট হয়েছে!");
        setIsEditProfileOpen(false);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "প্রোফাইল আপডেট করা যায়নি।";
      toast.error(msg);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Filtered areas for selection
  const filteredAreas = areasList.filter(
    (a) =>
      a.name.toLowerCase().includes(areaSearchTerm.toLowerCase()) ||
      (a.bnName && a.bnName.includes(areaSearchTerm)) ||
      (a.district?.name && a.district.name.toLowerCase().includes(areaSearchTerm.toLowerCase())) ||
      (a.district?.bnName && a.district.bnName.includes(areaSearchTerm))
  );

  // Compute initials safely
  const initials = React.useMemo(() => {
    if (!user?.fullName || !user.fullName.trim()) return "U";
    const parts = user.fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length > 1) {
      const first = parts[0]?.[0] || "";
      const last = parts[parts.length - 1]?.[0] || "";
      return (first + last).toUpperCase() || "U";
    }
    return user.fullName.trim().slice(0, 2).toUpperCase() || "U";
  }, [user?.fullName]);

  // Current display area label
  const currentAreaLabel =
    user?.locationArea?.bnName ||
    user?.locationArea?.name ||
    user?.area ||
    null;

  const currentDistrictLabel =
    user?.locationArea?.district?.bnName ||
    user?.locationArea?.district?.name ||
    null;

  // Safe Date Formatter
  const formattedJoinDate = React.useMemo(() => {
    if (!user?.createdAt) return "সাম্প্রতিক";
    try {
      const d = new Date(user.createdAt);
      if (isNaN(d.getTime())) return "সাম্প্রতিক";
      return d.toLocaleDateString("bn-BD", {
        year: "numeric",
        month: "long",
      });
    } catch {
      return "সাম্প্রতিক";
    }
  }, [user?.createdAt]);

  // Loading state while verifying auth session
  if (!isMounted || !hasHydrated || (!user && isLoadingProfile)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 text-[#FF6F0F] animate-spin" />
        <p className="mt-3 text-sm text-slate-500 font-medium">
          প্রোফাইল লোড হচ্ছে...
        </p>
      </div>
    );
  }

  // If after hydration user is not logged in
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
        <p className="text-sm text-slate-600 mb-3">অনুগ্রহ করে আপনার অ্যাকাউন্টে লগইন করুন</p>
        <Button
          onClick={() => openAuthModal("login")}
          className="bg-[#FF6F0F] hover:bg-[#F95738] text-white rounded-full px-6 text-xs font-bold"
        >
          লগইন করুন
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Title & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 gap-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            আমার প্রোফাইল
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            আপনার ব্যক্তিগত তথ্য, এলাকা এবং অ্যাকাউন্ট বিবরণ পরিচালনা করুন
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenEditModal}
            className="rounded-full text-xs font-bold border-slate-300 text-slate-700 hover:text-[#FF6F0F] hover:border-orange-300 cursor-pointer"
          >
            <Edit3 className="h-3.5 w-3.5 mr-1 text-[#FF6F0F]" />
            তথ্য পরিবর্তন করুন
          </Button>

          <Link
            href="/my-listings"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 hover:bg-orange-100 text-[#FF6F0F] border border-orange-200 text-xs font-bold transition-all shadow-2xs"
          >
            <Package className="h-3.5 w-3.5" />
            <span>আমার বিজ্ঞাপন</span>
          </Link>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ========================================================= */}
        {/* 1. USER INFO CARD (Left Column) */}
        {/* ========================================================= */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col items-center text-center">
            {/* Avatar / Initials */}
            <div className="relative mb-4">
              <Avatar size="lg" className="h-24 w-24 ring-4 ring-orange-500/20 shadow-md">
                {user?.avatar && (
                  <AvatarImage src={user.avatar} alt={user?.fullName || "User"} />
                )}
                <AvatarFallback className="bg-gradient-to-br from-[#FF6F0F] to-[#F95738] text-white text-2xl font-black">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-emerald-500 ring-2 ring-white flex items-center justify-center text-white" title="সক্রিয় অ্যাকাউন্ট">
                <CheckCircle2 className="h-4 w-4 stroke-[3]" />
              </div>
            </div>

            {/* Full Name */}
            <h2 className="text-lg font-bold text-slate-900 leading-tight">
              {user?.fullName || "ব্যবহারকারী"}
            </h2>

            {/* Role Status Badge */}
            <div className="mt-2">
              <span
                className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border ${
                  user?.role === "SELLER"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                    : user?.role === "ADMIN" || user?.role === "SUPER_ADMIN"
                    ? "bg-purple-50 text-purple-700 border-purple-300"
                    : "bg-orange-50 text-[#FF6F0F] border-orange-300"
                }`}
              >
                {user?.role === "SELLER" ? (
                  <>
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    <span>ভেরিফাইড বিক্রেতা</span>
                  </>
                ) : user?.role === "ADMIN" ? (
                  <>
                    <ShieldCheck className="h-3.5 w-3.5 text-purple-600" />
                    <span>অ্যাডমিনিস্ট্রেটর</span>
                  </>
                ) : (
                  <>
                    <UserIcon className="h-3.5 w-3.5 text-[#FF6F0F]" />
                    <span>কমিউনিটি মেম্বার</span>
                  </>
                )}
              </span>
            </div>

            {/* Quick Details List */}
            <div className="w-full mt-6 space-y-3 text-left border-t border-slate-100 pt-5">
              {/* Phone */}
              <div className="flex items-center gap-2.5 text-xs text-slate-600">
                <Phone className="h-4 w-4 text-[#FF6F0F] shrink-0" />
                <span className="font-semibold text-slate-900">{user?.phone || "ফোন নম্বর নেই"}</span>
                {user?.phone && (
                  <span className="ml-auto text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    যাচাইকৃত
                  </span>
                )}
              </div>

              {/* Email */}
              <div className="flex items-center gap-2.5 text-xs text-slate-600">
                <Mail className="h-4 w-4 text-[#FF6F0F] shrink-0" />
                <span className="truncate">{user?.email || "ইমেইল যুক্ত করা নেই"}</span>
                {user?.isEmailVerified && (
                  <span className="ml-auto text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 shrink-0">
                    যাচাইকৃত
                  </span>
                )}
              </div>

              {/* Member Since */}
              <div className="flex items-center gap-2.5 text-xs text-slate-500">
                <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                <span>
                  যোগ দিয়েছেন: {formattedJoinDate}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. LOCATION & SELLER DETAILS (Right Column) */}
        {/* ========================================================= */}
        <div className="md:col-span-2 space-y-6">
          {/* Location Info Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-2xl bg-orange-100 text-[#FF6F0F] flex items-center justify-center">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    ডিফল্ট অবস্থান ও এলাকা
                  </h3>
                  <p className="text-xs text-slate-500">
                    আপনার কাছের পণ্য দেখতে ও সেলার ভেরিফিকেশনের জন্য এলাকা আবশ্যক
                  </p>
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={handleOpenAreaModal}
                className="rounded-full text-xs font-bold border-orange-200 text-[#FF6F0F] hover:bg-orange-50 cursor-pointer"
              >
                {currentAreaLabel ? "এলাকা পরিবর্তন" : "এলাকা নির্ধারণ করুন"}
              </Button>
            </div>

            <div className="mt-4">
              {currentAreaLabel ? (
                <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-[#FF6F0F] text-white flex items-center justify-center shrink-0">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {currentAreaLabel}
                        {currentDistrictLabel && (
                          <span className="text-xs font-medium text-slate-500 ml-1">
                            ({currentDistrictLabel})
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {user?.address || "নির্দিষ্ট ঠিকানা যোগ করা নেই"}
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0 self-start sm:self-center">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    এলাকা সংরক্ষিত
                  </span>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span>⚠️ এখনও কোনো এলাকা নির্বাচন করা হয়নি। সেলার হিসেবে অনবোর্ডিং এর জন্য একটি এলাকা সেট করুন।</span>
                  </span>
                  <Button
                    size="sm"
                    onClick={handleOpenAreaModal}
                    className="bg-[#FF6F0F] hover:bg-[#F95738] text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    এলাকা বাছুন
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* If role is SELLER: Display Shop Name & Seller Bio */}
          {user?.role === "SELLER" ? (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="h-10 w-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Store className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    ভেরিফাইড সেলার তথ্য
                  </h3>
                  <p className="text-xs text-slate-500">
                    আপনার দোকানের নাম ও বায়ো ক্রেতাদের কাছে দৃশ্যমান থাকবে
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    দোকানের নাম (Shop Name)
                  </span>
                  <p className="text-sm font-bold text-slate-800 mt-1">
                    {user?.shopName || "ব্যক্তিগত বিক্রেতা প্রোফাইল"}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    লিস্টিং অ্যাক্টিভিটি
                  </span>
                  <Link
                    href="/my-listings"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6F0F] hover:underline mt-1"
                  >
                    আমার সব বিজ্ঞাপন দেখুন <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {user?.bio && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    সেলার পরিচিতি (Bio)
                  </span>
                  <p className="text-xs sm:text-sm text-slate-700 mt-1 leading-relaxed whitespace-pre-line">
                    {user.bio}
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* If role is USER: Display Seller Onboarding Call-to-Action Card */
            <div className="bg-gradient-to-br from-orange-50 via-white to-orange-50/40 rounded-3xl p-6 border border-orange-200/80 shadow-sm relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-md">
                  <div className="inline-flex items-center gap-1 text-xs font-bold text-[#FF6F0F] bg-white px-2.5 py-0.5 rounded-full border border-orange-200 shadow-2xs">
                    <Sparkles className="h-3.5 w-3.5 text-[#FF6F0F]" />
                    <span>উপার্জন শুরু করুন</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    কাছে মার্কেটপ্লেসে বিক্রেতা হন!
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    আপনার ব্যবহৃত বা নতুন পণ্য সহজে আপনার পাড়ার প্রতিবেশীদের কাছে বিক্রি করতে বিনামূল্যে সেলার অনবোর্ডিং সম্পন্ন করুন।
                  </p>
                </div>

                <Link
                  href="/become-seller"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#FF6F0F] hover:bg-[#F95738] text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/25 transition-all cursor-pointer self-start sm:self-center shrink-0"
                >
                  <Store className="h-4 w-4" />
                  <span>সেলার অনবোর্ডিং করুন</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* AREA SELECTION MODAL */}
      {/* ========================================================= */}
      <Dialog open={isAreaModalOpen} onOpenChange={setIsAreaModalOpen}>
        <DialogContent className="sm:max-w-md p-5 rounded-3xl bg-white shadow-2xl border-slate-200">
          <DialogHeader className="space-y-1.5 pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-orange-100 text-[#FF6F0F]">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-900">
                  আপনার এলাকা বেছে নিন
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  সেলার হিসেবে পণ্য বিক্রির জন্য আপনার ডিফল্ট এলাকা সেট করুন
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Search Input */}
          <div className="relative my-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={areaSearchTerm}
              onChange={(e) => setAreaSearchTerm(e.target.value)}
              placeholder="এলাকা বা জেলার নাম খুঁজুন (উদা: ধানমন্ডি, মিরপুর)..."
              className="pl-10 h-10 rounded-xl bg-slate-50 border-slate-200 text-sm focus:bg-white focus:border-[#FF6F0F]"
            />
          </div>

          {/* Areas List */}
          <div className="max-h-72 overflow-y-auto space-y-1 pr-1">
            {isLoadingAreas ? (
              <div className="p-8 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 text-[#FF6F0F] animate-spin" />
                <span>এলাকা লোড হচ্ছে...</span>
              </div>
            ) : filteredAreas.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                কোনো এলাকা পাওয়া যায়নি
              </div>
            ) : (
              filteredAreas.map((area) => {
                const isSelected = user?.areaId === area.id;
                return (
                  <button
                    key={area.id}
                    type="button"
                    disabled={isSavingArea}
                    onClick={() => handleSelectArea(area)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-orange-50 border border-orange-300 text-[#FF6F0F] font-bold"
                        : "hover:bg-slate-50 text-slate-800 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <MapPin
                        className={`h-4 w-4 ${
                          isSelected ? "text-[#FF6F0F]" : "text-slate-400"
                        }`}
                      />
                      <div>
                        <div className="text-sm font-semibold">
                          {area.bnName || area.name}
                        </div>
                        {area.district && (
                          <div className="text-[11px] text-slate-400">
                            {area.district.bnName || area.district.name}
                          </div>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <div className="h-5 w-5 rounded-full bg-[#FF6F0F] text-white flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* EDIT PROFILE MODAL */}
      {/* ========================================================= */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="sm:max-w-md p-6 rounded-3xl bg-white shadow-2xl border-slate-200">
          <DialogHeader className="space-y-1.5 pb-2">
            <DialogTitle className="text-lg font-bold text-slate-900">
              ব্যক্তিগত তথ্য সম্পাদনা
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              আপনার নাম ও বিস্তারিত ঠিকানা আপডেট করুন
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                পুরো নাম
              </label>
              <Input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="আপনার পুরো নাম"
                className="h-10 rounded-xl bg-slate-50 border-slate-200 text-sm focus:bg-white focus:border-[#FF6F0F]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                ঠিকানা (ঐচ্ছিক)
              </label>
              <Input
                type="text"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                placeholder="বাড়ি নং, রোড নং, এলাকা..."
                className="h-10 rounded-xl bg-slate-50 border-slate-200 text-sm focus:bg-white focus:border-[#FF6F0F]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditProfileOpen(false)}
                className="rounded-xl text-xs font-semibold"
              >
                বাতিল
              </Button>
              <Button
                type="submit"
                disabled={isSavingProfile}
                className="rounded-xl text-xs font-bold bg-[#FF6F0F] hover:bg-[#F95738] text-white"
              >
                {isSavingProfile ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> সংরক্ষণ হচ্ছে...
                  </span>
                ) : (
                  "সংরক্ষণ করুন"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
