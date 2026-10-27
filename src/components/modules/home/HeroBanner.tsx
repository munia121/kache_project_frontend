"use client";

import * as React from "react";
import Link from "next/link";
import { useFilterStore } from "@/store/useFilterStore";
import { MapPin, Sparkles, PlusCircle } from "lucide-react";

export function HeroBanner() {
  const { selectedArea, setIsLocationModalOpen } = useFilterStore();
  const areaLabel = (selectedArea || "ঢাকা").split(",")[0].trim();

  return (
    <section className="bg-gradient-to-b from-orange-50/70 via-orange-50/30 to-transparent border-b border-orange-100/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-orange-500 via-[#FF6F0F] to-[#F95738] rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-orange-500/15 relative overflow-hidden">
          {/* Background decorative circles */}
          <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="absolute left-1/3 -top-10 w-36 h-36 rounded-full bg-white/10 blur-lg pointer-events-none" />

          <div className="relative z-10 space-y-3 text-center md:text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-white">
              <Sparkles className="h-3.5 w-3.5" />
              <span>আপনার পাড়ার আধুনিক লোকাল মার্কেটপ্লেস</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
              <span className="underline decoration-white/30 underline-offset-4">
                {areaLabel}
              </span>{" "}
              এলাকার প্রতিবেশীদের সাথে বিশ্বস্ত কেনাবেচা
            </h1>
            <p className="text-xs sm:text-sm text-orange-100 leading-relaxed font-normal">
              কোনো হিডেন ডেলিভারি চার্জ বা মধ্যস্বত্বভোগী নেই। সরাসরি দেখা করে পছন্দের জিনিস কিনুন বা ঘরে বসে বিক্রি করুন।
            </p>
          </div>

          {/* Quick Actions in Hero */}
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setIsLocationModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-semibold text-xs sm:text-sm border border-white/25 transition-all cursor-pointer"
            >
              <MapPin className="h-4 w-4" />
              <span>এলাকা বদলান</span>
            </button>

            <Link
              href="/post-ad"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#FF6F0F] hover:bg-orange-50 font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <PlusCircle className="h-4 w-4 stroke-[2.5]" />
              <span>বিজ্ঞাপন পোস্ট করুন</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroBanner;
