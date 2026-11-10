/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/store/useAuthStore";
import { userService } from "@/services/user.service";
import { ILocationArea, UserRole, UpdateProfilePayload, IUser, IMyProductListing } from "@/types/user.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import EditProfile from "@/components/profile/EditProfile";
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
  ArrowLeft,
  Package,
} from "lucide-react";

const emptySubscribe = () => () => {};

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, hasHydrated, setUser, openAuthModal } = useAuthStore();
  const isMounted = React.useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [isLoadingProfile, setIsLoadingProfile] = React.useState(true);

  // Area Selection Dialog State
  const [isAreaModalOpen, setIsAreaModalOpen] = React.useState(false);
  const [areasList, setAreasList] = React.useState<ILocationArea[]>([]);
  const [areaSearchTerm, setAreaSearchTerm] = React.useState("");
  const [isSavingArea, setIsSavingArea] = React.useState(false);
  const [isLoadingAreas, setIsLoadingAreas] = React.useState(false);

  // Edit Profile Dialog State
  const [isEditProfileOpen, setIsEditProfileOpen] = React.useState(false);
  const [editAreaId, setEditAreaId] = React.useState("");
  const [editRole, setEditRole] = React.useState<UserRole>("USER");
  

  // Role Switch Confirmation State
  const [isConfirmSwitchOpen, setIsConfirmSwitchOpen] = React.useState(false);
  const [isSwitchingRole, setIsSwitchingRole] = React.useState(false);

  // Recent Listings for Seller State
  const [recentListings, setRecentListings] = React.useState<IMyProductListing[]>([]);
  const [isLoadingRecentListings, setIsLoadingRecentListings] = React.useState(false);

  // Preload areas on mount
  React.useEffect(() => {
    if (areasList.length === 0) {
      userService
        .getAreas()
        .then((res) => {
          if (res.success && res.data) {
            setAreasList(res.data);
          }
        })
        .catch((err) => {
          console.warn("Could not prefetch areas:", err?.message);
        });
    }
  }, [areasList.length]);

 
  // Authentication Guard: ONLY redirect AFTER storage hydration is complete
  React.useEffect(() => {
    if (isMounted && hasHydrated) {
      if (!isAuthenticated) {
        toast.info("প্রোফাইল দেখতে প্রথমে লগইন করুন");
        router.push("/login?redirect=/profile");
      }
    }
  }, [isMounted, hasHydrated, isAuthenticated, router]);

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

      // Load user's recent listings (for any logged in user)
      if (isAuthenticated) {
        setIsLoadingRecentListings(true);
        userService
          .getMyListings({ limit: 4 })
          .then((res) => {
            if (res?.success && Array.isArray(res.data)) {
              setRecentListings(res.data);
            }
          })
          .catch((err) => {
            console.warn("Could not load recent listings for profile:", err);
          })
          .finally(() => {
            setIsLoadingRecentListings(false);
          });
      }
    }
  }, [isMounted, hasHydrated, isAuthenticated, setUser, user?.role]);

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
    // If edit profile modal is open, update form field instead of direct API call
    if (isEditProfileOpen) {
      setEditAreaId(area.id);
      setIsAreaModalOpen(false);
      toast.info(`"${area.bnName || area.name}" এলাকা নির্বাচন করা হয়েছে`);
      return;
    }

    try {
      setIsSavingArea(true);
      const res = await userService.updateProfile({ areaId: area.id });
      if (res.success && res.data) {
        setUser(res.data);
        toast.success(`আপনার এলাকা "${area.bnName || area.name}" নির্ধারণ করা হয়েছে!`);
        setIsAreaModalOpen(false);
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = errorObj.response?.data?.message || errorObj.message || "এলাকা আপডেট করতে ব্যর্থ হয়েছে।";
      toast.error(msg);
    } finally {
      setIsSavingArea(false);
    }
  };

  // Handle Open Edit Profile Modal
  const handleOpenEditModal = async () => {
    setIsEditProfileOpen(true);
    if (areasList.length === 0) {
      try {
        setIsLoadingAreas(true);
        const res = await userService.getAreas();
        if (res.success && res.data) {
          setAreasList(res.data);
        }
      } catch (err) {
        console.error("Failed to load areas:", err);
      } finally {
        setIsLoadingAreas(false);
      }
    }
  };

  // Handle One-Click Role Switch to USER
  const handleConfirmRoleSwitch = async () => {
    try {
      setIsSwitchingRole(true);
      const res = await userService.updateProfile({ role: "USER" });

      if (res?.success) {
        // 1. Immediately update Zustand store with new user object (role: 'USER')
        const updatedUser: IUser = {
          ...user!,
          ...(res.data || {}),
          role: "USER",
        };
        setUser(updatedUser);

        // 2. Synchronize edit profile modal fields if open
        setEditRole("USER");
        setIsConfirmSwitchOpen(false);
        setIsEditProfileOpen(false);

        // 3. Sonner toast upon success
        toast.success("অ্যাকাউন্ট সফলভাবে ক্রেতা (USER) মোডে পরিবর্তিত হয়েছে");

        // 4. Background refresh profile to ensure populated relations
        userService
          .getMyProfile()
          .then((fresh) => {
            if (fresh?.success && fresh.data) {
              setUser({ ...fresh.data, role: "USER" });
            }
          })
          .catch(() => {});
      } else {
        toast.error(res?.message || "রোল পরিবর্তন করতে ব্যর্থ হয়েছে");
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      const msg =
        errorObj.response?.data?.message ||
        errorObj.message ||
        "রোল পরিবর্তন করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।";
      toast.error(msg);
    } finally {
      setIsSwitchingRole(false);
    }
  };

  // Handle Save Comprehensive Profile
  
  // Filtered areas for selection
  const filteredAreas = areasList.filter(
    (a) =>
      a.name.toLowerCase().includes(areaSearchTerm.toLowerCase()) ||
      (a.bnName && a.bnName.includes(areaSearchTerm)) ||
      (a.district?.name && a.district.name.toLowerCase().includes(areaSearchTerm.toLowerCase())) ||
      (a.district?.bnName && a.district.bnName.includes(areaSearchTerm))
  );

  // Compute initials safely
  const initials = (() => {
    if (!user?.fullName || !user.fullName.trim()) return "U";
    const parts = user.fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length > 1) {
      const first = parts[0]?.[0] || "";
      const last = parts[parts.length - 1]?.[0] || "";
      return (first + last).toUpperCase() || "U";
    }
    return user.fullName.trim().slice(0, 2).toUpperCase() || "U";
  })();

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
  const formattedJoinDate = (() => {
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
  })();

  // Loading state while verifying auth session
  if (!isMounted || !hasHydrated || (isAuthenticated && !user && isLoadingProfile)) {
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
          onClick={() => router.push("/login?redirect=/profile")}
          className="bg-[#FF6F0F] hover:bg-[#F95738] text-white rounded-full px-6 text-xs font-bold"
        >
          লগইন করুন
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Link
        className="inline-flex items-center gap-2 text-xs md:text-sm font-medium text-slate-600 hover:text-[#FF6F0F] transition-colors py-2 px-3 rounded-xl hover:bg-slate-100 w-fit mb-4"
        href="/"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>হোমে ফিরে যান</span>
      </Link>

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

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenEditModal}
            className="rounded-full text-xs font-bold border-slate-300 text-slate-700 hover:text-[#FF6F0F] hover:border-orange-300 cursor-pointer"
          >
            <Edit3 className="h-3.5 w-3.5 mr-1 text-[#FF6F0F]" />
            তথ্য পরিবর্তন করুন
          </Button>

          {user?.role === "SELLER" && (
            <Button
              variant="outline"
              size="sm"
              disabled={isSwitchingRole}
              onClick={() => setIsConfirmSwitchOpen(true)}
              className="rounded-full text-xs font-bold border-amber-300 text-amber-800 hover:bg-amber-50 hover:text-amber-900 cursor-pointer"
            >
              <UserIcon className="h-3.5 w-3.5 mr-1 text-amber-700" />
              ক্রেতা মোডে ফিরুন
            </Button>
          )}

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
                <AvatarFallback className="bg-linear-to-br from-[#FF6F0F] to-[#F95738] text-white text-2xl font-black">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-emerald-500 ring-2 ring-white flex items-center justify-center text-white" title="সক্রিয় অ্যাকাউন্ট">
                <CheckCircle2 className="h-4 w-4 stroke-3" />
              </div>
            </div>

            {/* Full Name */}
            <h2 className="text-lg font-bold text-slate-900 leading-tight">
              {user?.fullName || "ব্যবহারকারী"}
            </h2>

            {/* Role Status Badge */}
            <div className="mt-2 flex flex-col items-center gap-1.5">
              <span
                data-testid="profile-role-badge"
                className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border transition-colors ${
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
                ) : user?.role === "ADMIN" || user?.role === "SUPER_ADMIN" ? (
                  <>
                    <ShieldCheck className="h-3.5 w-3.5 text-purple-600" />
                    <span>অ্যাডমিনিস্ট্রেটর</span>
                  </>
                ) : (
                  <>
                    <UserIcon className="h-3.5 w-3.5 text-[#FF6F0F]" />
                    <span>USER</span>
                  </>
                )}
              </span>

              {user?.role === "SELLER" && (
                <button
                  type="button"
                  disabled={isSwitchingRole}
                  onClick={() => setIsConfirmSwitchOpen(true)}
                  className="text-[11px] font-semibold text-slate-500 hover:text-[#FF6F0F] transition-colors underline cursor-pointer"
                >
                  ক্রেতা মোডে ফিরুন
                </button>
              )}
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
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="flex items-center gap-2">
                    <span>⚠️ এখনও কোনো এলাকা নির্বাচন করা হয়নি। সেলার হিসেবে অনবোর্ডিং এর জন্য একটি এলাকা সেট করুন।</span>
                  </span>
                  <Button
                    size="sm"
                    onClick={handleOpenAreaModal}
                    className="bg-[#FF6F0F] hover:bg-[#F95738] text-white text-xs font-bold rounded-xl cursor-pointer shrink-0 self-start sm:self-center"
                  >
                    এলাকা বাছুন
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* If role is SELLER: Display Shop Name & Seller Bio */}
          {user?.role === "SELLER" && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 transition-all duration-300 ease-in-out">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
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

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isSwitchingRole}
                  onClick={() => setIsConfirmSwitchOpen(true)}
                  className="rounded-full text-xs font-bold border-amber-300 text-amber-800 hover:bg-amber-50 hover:text-amber-900 cursor-pointer self-start sm:self-center shrink-0"
                >
                  {isSwitchingRole ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> পরিবর্তন হচ্ছে...
                    </span>
                  ) : (
                    "সাধারণ ক্রেতা মোডে ফিরুন"
                  )}
                </Button>
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
          )}

          {/* If role is USER: Display Seller Onboarding Call-to-Action Card */}
          {user?.role === "USER" && (
            <div className="bg-linear-to-br from-orange-50 via-white to-orange-50/40 rounded-3xl p-6 border border-orange-200/80 shadow-sm relative overflow-hidden transition-all duration-300 ease-in-out">
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

          {/* Recent Listings Preview - Accessible to ALL authenticated users */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-orange-100 text-[#FF6F0F]">
                  <Package className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900">
                    আমার বিজ্ঞাপনসমূহ (ক্লিক করে বিস্তারিত দেখুন)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    লিস্টিংয়ের বিস্তারিত দেখতে যেকোনো পণ্যে ক্লিক করুন
                  </p>
                </div>
              </div>
              <Link
                href="/my-listings"
                className="text-xs font-bold text-[#FF6F0F] hover:underline flex items-center gap-1"
              >
                <span>সবগুলো দেখুন</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {isLoadingRecentListings ? (
              <div className="p-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 text-[#FF6F0F] animate-spin" />
                <span>বিজ্ঞাপন লোড হচ্ছে...</span>
              </div>
            ) : recentListings.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <p className="text-xs text-slate-500 mb-2">এখনও কোনো বিজ্ঞাপন দেননি</p>
                <Link
                  href="/post-ad"
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-[#FF6F0F] hover:bg-[#F95738] text-white text-xs font-bold shadow-sm"
                >
                  বিজ্ঞাপন দিন
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recentListings.map((item) => (
                  <Link
                    key={item.id}
                    href={`/products/${item.slug || item.id}`}
                    className="group p-3 rounded-2xl bg-slate-50 hover:bg-orange-50/50 border border-slate-200 hover:border-orange-300 transition-all flex items-center gap-3 cursor-pointer"
                  >
                    <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                      {item.images && item.images.length > 0 ? (
                        <Image
                          src={item.images[0]}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                          unoptimized
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-slate-400">
                          <Package className="h-6 w-6" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 truncate group-hover:text-[#FF6F0F] transition-colors">
                        {item.title}
                      </p>
                      <p className="text-xs font-black text-[#FF6F0F] mt-0.5">
                        ৳ {Number(item.price || 0).toLocaleString("bn-BD")}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                            item.status === "ACTIVE" || item.status === "AVAILABLE"
                              ? "bg-emerald-100 text-emerald-800"
                              : item.status === "ARCHIVED"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {item.status === "ACTIVE" || item.status === "AVAILABLE"
                            ? "সক্রিয়"
                            : item.status === "ARCHIVED"
                            ? "লুকানো"
                            : "বিক্রিত"}
                        </span>
                        <span className="text-[10px] text-slate-400 group-hover:text-[#FF6F0F] font-semibold">
                          বিস্তারিত →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* AREA SELECTION MODAL */}
      {/* ========================================================= */}
      <Dialog open={isAreaModalOpen} onOpenChange={setIsAreaModalOpen}>
        <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-md max-h-[85vh] overflow-y-auto p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white shadow-2xl border-slate-200">
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
      {/* EDIT PROFILE DIALOG */}
      {/* ========================================================= */}
      <EditProfile
        isEditProfileOpen={isEditProfileOpen}
        setIsEditProfileOpen={setIsEditProfileOpen}
        editAreaId={editAreaId}
        setEditAreaId={setEditAreaId}
        editRole={editRole}
        setEditRole={setEditRole}
        user={user}
        setUser={setUser}
        handleOpenAreaModal={handleOpenAreaModal}
        areasList={areasList}
        isLoadingAreas={isLoadingAreas}
        isSwitchingRole={isSwitchingRole}
        setIsConfirmSwitchOpen={setIsConfirmSwitchOpen}
      />

      {/* ========================================================= */}
      {/* ROLE SWITCH CONFIRMATION DIALOG */}
      {/* ========================================================= */}
      <Dialog open={isConfirmSwitchOpen} onOpenChange={setIsConfirmSwitchOpen}>
        <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white shadow-2xl border-slate-200 z-60">
          <DialogHeader className="space-y-2 pb-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <UserIcon className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-900">
                  রোল পরিবর্তন নিশ্চিতকরণ
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  বিক্রেতা থেকে সাধারণ ক্রেতা অ্যাকাউন্টে পরিবর্তন
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="py-3 space-y-2">
            <p className="text-sm font-semibold text-slate-800">
              আপনি কি নিশ্চিতভাবে সাধারণ ক্রেতা অ্যাকাউন্টে ফিরতে চান?
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              সাধারণ ক্রেতা হিসেবে ফিরলে আপনার বিক্রেতা প্রোফাইল ও দোকানের তথ্য সাময়িকভাবে নিষ্ক্রিয় থাকবে। পরবর্তীতে আপনি চাইলে পুনরায় বিক্রেতা মোড চালু করতে পারবেন।
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              disabled={isSwitchingRole}
              onClick={() => setIsConfirmSwitchOpen(false)}
              className="rounded-xl text-xs font-semibold cursor-pointer"
            >
              বাতিল
            </Button>
            <Button
              type="button"
              disabled={isSwitchingRole}
              onClick={handleConfirmRoleSwitch}
              className="rounded-xl text-xs font-bold bg-[#FF6F0F] hover:bg-[#F95738] text-white shadow-sm cursor-pointer"
            >
              {isSwitchingRole ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> পরিবর্তন হচ্ছে...
                </span>
              ) : (
                "হ্যাঁ, নিশ্চিত করুন"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
