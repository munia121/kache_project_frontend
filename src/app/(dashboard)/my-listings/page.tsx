"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/store/useAuthStore";
import { userService } from "@/services/user.service";
import { IMyProductListing } from "@/types/user.types";
import { toast } from "sonner";
import {
  Package,
  Store,
  Plus,
  Loader2,
  Sparkles,
  CheckCircle2,
  MapPin,
  Calendar,
} from "lucide-react";

export default function MyListingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, hasHydrated, openAuthModal } = useAuthStore();
  const [isMounted, setIsMounted] = React.useState(false);

  const [listings, setListings] = React.useState<IMyProductListing[]>([]);
  const [isLoadingListings, setIsLoadingListings] = React.useState(false);
  const [activeFilter, setActiveFilter] = React.useState<string>("ALL");

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auth Guard: ONLY trigger AFTER hydration is complete
  React.useEffect(() => {
    if (isMounted && hasHydrated) {
      if (!isAuthenticated) {
        toast.info("বিজ্ঞাপন দেখতে প্রথমে লগইন করুন");
        openAuthModal("login");
        router.push("/");
      }
    }
  }, [isMounted, hasHydrated, isAuthenticated, openAuthModal, router]);

  // Fetch Listings if user is SELLER
  React.useEffect(() => {
    if (isMounted && hasHydrated && isAuthenticated && user?.role === "SELLER") {
      setIsLoadingListings(true);
      const params = activeFilter !== "ALL" ? { status: activeFilter } : undefined;
      userService
        .getMyListings(params)
        .then((res) => {
          if (res.success && res.data) {
            setListings(res.data);
          }
        })
        .catch((err) => {
          console.error("Failed to load listings:", err);
        })
        .finally(() => {
          setIsLoadingListings(false);
        });
    }
  }, [isMounted, hasHydrated, isAuthenticated, user?.role, activeFilter]);

  if (!isMounted || !hasHydrated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 text-[#FF6F0F] animate-spin" />
        <p className="mt-3 text-sm text-slate-500 font-medium">লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // =========================================================================
  // CASE 1: USER ROLE (Not yet a seller)
  // Show empty state encouraging them to complete seller onboarding
  // =========================================================================
  if (user.role === "USER") {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm text-center relative overflow-hidden">
          {/* Subtle Orange Glow Top */}
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#FF6F0F] to-[#F95738]" />

          {/* Icon Badge */}
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-orange-100 text-[#FF6F0F] mb-6 shadow-sm shadow-orange-500/20">
            <Store className="h-10 w-10 stroke-[1.8]" />
          </div>

          {/* Heading Requirement: "পণ্য বিক্রি করতে আগে সেলার অনবোর্ডিং সম্পন্ন করুন" */}
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight max-w-lg mx-auto leading-snug">
            পণ্য বিক্রি করতে আগে সেলার অনবোর্ডিং সম্পন্ন করুন
          </h2>

          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-3 leading-relaxed">
            কাছে লোকাল মার্কেটপ্লেসে আপনার পাড়ার প্রতিবেশীদের কাছে পণ্য বিক্রি করতে বিনামূল্যে সেলার হিসেবে যুক্ত হোন।
          </p>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-8 text-left max-w-xl mx-auto">
            <div className="p-3.5 rounded-2xl bg-orange-50/60 border border-orange-200/70">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <CheckCircle2 className="h-4 w-4 text-[#FF6F0F]" />
                <span>বিনামূল্যে লিস্টিং</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                কোনো চার্জ ছাড়াই সরাসরি পণ্যের বিজ্ঞাপন দিন
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-orange-50/60 border border-orange-200/70">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <CheckCircle2 className="h-4 w-4 text-[#FF6F0F]" />
                <span>লোকাল গ্রাহক</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                আপনার এলাকার বিশ্বস্ত ক্রেতাদের সাথে সরাসরি চ্যাট
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-orange-50/60 border border-orange-200/70">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <CheckCircle2 className="h-4 w-4 text-[#FF6F0F]" />
                <span>ভেরিফাইড ব্যাজ</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                কমিউনিটিতে আপনার গ্রহণযোগ্যতা ও বিশ্বাসযোগ্যতা
              </p>
            </div>
          </div>

          {/* Call-to-Action Button */}
          <Link
            href="/become-seller"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#FF6F0F] hover:bg-[#F95738] active:scale-95 text-white font-bold text-sm shadow-md shadow-orange-500/25 transition-all cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            <span>সেলার অনবোর্ডিং শুরু করুন</span>
          </Link>
        </div>
      </div>
    );
  }

  // =========================================================================
  // CASE 2: SELLER ROLE
  // Clean layout to display active ads
  // =========================================================================
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 gap-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              আমার বিজ্ঞাপনসমূহ
            </h1>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              ভেরিফাইড সেলার
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            আপনার পোস্ট করা বিজ্ঞাপনের অবস্থা ও বিক্রয় পরিচালনা করুন
          </p>
        </div>

        {/* Post Ad Button */}
        <Link
          href="/post-ad"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-[#FF6F0F] hover:bg-[#F95738] active:scale-95 text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow-md shadow-orange-500/25 transition-all cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>নতুন বিজ্ঞাপন দিন</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {[
          { key: "ALL", label: "সব বিজ্ঞাপন" },
          { key: "ACTIVE", label: "সক্রিয় (Active)" },
          { key: "PENDING", label: "অপেক্ষমান (Pending)" },
          { key: "SOLD", label: "বিক্রিত (Sold)" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveFilter(tab.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === tab.key
                ? "bg-[#FF6F0F] text-white shadow-sm shadow-orange-500/20"
                : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Listings Container */}
      <div className="mt-6">
        {isLoadingListings ? (
          <div className="p-16 text-center text-slate-500 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 text-[#FF6F0F] animate-spin" />
            <p className="mt-3 text-xs font-medium">বিজ্ঞাপনসমূহ লোড হচ্ছে...</p>
          </div>
        ) : listings.length === 0 ? (
          /* Empty listings state for Seller */
          <div className="bg-white rounded-3xl p-10 sm:p-14 border border-slate-200 text-center shadow-xs">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-orange-50 text-[#FF6F0F] mb-4">
              <Package className="h-8 w-8 stroke-[1.8]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              কোনো বিজ্ঞাপন পাওয়া যায়নি
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
              আপনার ঘরে থাকা যেকোনো অপ্রয়োজনীয় পণ্য বা নতুন পণ্যের ছবি তুলে এখনই কাছে মার্কেটপ্লেসে পোস্ট করুন।
            </p>
            <Link
              href="/post-ad"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FF6F0F] hover:bg-[#F95738] text-white text-xs font-bold shadow-sm"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>প্রথম বিজ্ঞাপন দিন</span>
            </Link>
          </div>
        ) : (
          /* Listings Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col"
              >
                {/* Image */}
                <div className="relative aspect-4/3 w-full bg-slate-100">
                  {item.images && item.images.length > 0 ? (
                    <Image
                      src={item.images[0]}
                      alt={item.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-slate-300">
                      <Package className="h-10 w-10" />
                    </div>
                  )}

                  {/* Status Badge */}
                  <span
                    className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs ${
                      item.status === "ACTIVE"
                        ? "bg-emerald-500 text-white"
                        : item.status === "SOLD"
                        ? "bg-slate-700 text-white"
                        : "bg-amber-500 text-white"
                    }`}
                  >
                    {item.status === "ACTIVE"
                      ? "সক্রিয়"
                      : item.status === "SOLD"
                      ? "বিক্রিত"
                      : "যাচাই চলছে"}
                  </span>
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-base font-bold text-slate-900 line-clamp-1">
                      {item.title}
                    </p>
                    <p className="text-base font-black text-[#FF6F0F] mt-1">
                      ৳ {Number(item.price || 0).toLocaleString("bn-BD")}
                    </p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      {item.area?.bnName || item.area?.name || "এলাকা"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      {(() => {
                        try {
                          const d = new Date(item.createdAt);
                          return isNaN(d.getTime()) ? "সাম্প্রতিক" : d.toLocaleDateString("bn-BD");
                        } catch {
                          return "সাম্প্রতিক";
                        }
                      })()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
