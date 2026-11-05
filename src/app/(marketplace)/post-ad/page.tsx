/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { PostAdForm } from "@/components/modules/products/PostAdForm";
import { toast } from "sonner";
import {
  Sparkles,
  Store,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Navbar } from "@/components/share/Navbar";

export default function PostAdPage() {
  const router = useRouter();
  const { user, isAuthenticated, hasHydrated, openAuthModal } = useAuthStore();

  // Authentication check
  React.useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      toast.info("বিজ্ঞাপন দিতে প্রথমে লগইন বা রেজিস্টার করুন");
      router.push("/login?redirect=/post-ad");
    }
  }, [hasHydrated, isAuthenticated, router]);

  // Loading state while auth hydrates
  if (!hasHydrated || !isAuthenticated || !user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 text-[#FF6F0F] animate-spin" />
        <p className="mt-3 text-xs sm:text-sm text-slate-500 font-medium">
          যাচাই করা হচ্ছে...
        </p>
      </div>
    );
  }

  // If user role is regular USER, show friendly Karrot-style onboarding prompt
  if (user.role === "USER") {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="bg-white rounded-3xl border border-orange-200/80 shadow-md overflow-hidden text-center p-6 sm:p-12 relative">
          <div className="mx-auto w-16 h-16 rounded-3xl bg-orange-100 text-[#FF6F0F] flex items-center justify-center mb-5 shadow-xs">
            <Store className="h-8 w-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-xs font-bold text-[#FF6F0F] border border-orange-200 mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>সেলার অ্যাক্টিভেশন আবশ্যক</span>
          </div>

          <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug max-w-xl mx-auto">
            পণ্য বিক্রি করতে আপনার বিক্রেতা (Seller) অ্যাকাউন্ট সক্রিয় করুন
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 mt-3 max-w-lg mx-auto leading-relaxed">
            কাছে মার্কেটপ্লেসে প্রতিবেশীদের কাছে বিজ্ঞাপন দিতে বিক্রেতা প্রোফাইল সক্রিয় করা প্রয়োজন। এটি সম্পূর্ণ বিনামূল্যে, সহজ বিক্রেতা অনবোর্ডিং সম্পন্ন করুন।
          </p>

          {/* Benefits checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-8 text-left max-w-2xl mx-auto">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 mb-1" />
              <h4 className="text-xs font-bold text-slate-900">বিনামূল্যে বিজ্ঞাপন</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">কোনো লিস্টিং বা হিডেন চার্জ নেই</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <ShieldCheck className="h-5 w-5 text-[#FF6F0F] mb-1" />
              <h4 className="text-xs font-bold text-slate-900">বিশ্বস্ত ক্রেতা</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">আপনার পাড়ার প্রকৃত প্রতিবেশীরাই ক্রেতা</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <Sparkles className="h-5 w-5 text-purple-600 mb-1" />
              <h4 className="text-xs font-bold text-slate-900">দ্রুত বিক্রি</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">সরাসরি চ্যাট ও কলের সুবিধা</p>
            </div>
          </div>

          {/* Upgrade Action Button */}
          <div className="flex items-center justify-center pt-2">
            <Link
              href="/become-seller"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 h-12 rounded-full bg-[#FF6F0F] hover:bg-[#F95738] text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/25 transition-all cursor-pointer"
            >
              <Store className="h-4 w-4" />
              <span>বিক্রেতা হিসেবে নিবন্ধন করুন</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If role is SELLER or ADMIN: Render the Full Ad Creation Form
  return (
    
    <div> 
      <Navbar></Navbar>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      <div className="mb-6 space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-[#FF6F0F] text-xs font-bold">
          <Sparkles className="h-3.5 w-3.5" />
          <span>নতুন বিজ্ঞাপন তৈরি করুন</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          বিজ্ঞাপন দিন
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          আপনার পাড়ার ক্রেতাদের কাছে দ্রুত বিক্রি করতে সঠিক তথ্য ও ছবি প্রদান করুন
        </p>
      </div>
      
      <PostAdForm />
    </div>
    </div>
  );
}
