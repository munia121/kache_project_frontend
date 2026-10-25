"use client";

import * as React from "react";
import Link from "next/link";
import { useFilterStore } from "@/store/useFilterStore";
import {
  Search,
  MapPin,
  ChevronDown,
  Plus,
  User,
  X,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const {
    searchQuery,
    setSearchQuery,
    selectedArea,
    setIsLocationModalOpen,
  } = useFilterStore();

  // Extract primary neighborhood name (e.g. "ধানমন্ডি" from "ধানমন্ডি, ঢাকা")
  const areaLabel = selectedArea.split(",")[0].trim();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          {/* Brand Logo & Neighborhood Selector */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <Link
              href="/"
              className="flex items-center gap-2 group transition-transform active:scale-95"
            >
              {/* Karrot-inspired Brand Icon */}
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#FF6F0F] to-[#F95738] flex items-center justify-center text-white shadow-sm shadow-orange-500/25 group-hover:scale-105 transition-transform duration-200">
                <ShoppingBag className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-[#FF6F0F] transition-colors leading-none">
                  কাছে
                </span>
                <span className="text-[10px] font-semibold text-[#FF6F0F] tracking-wide uppercase">
                  KACHE • লোকাল
                </span>
              </div>
            </Link>

            {/* Active Location Badge (Desktop & Tablet) */}
            <button
              type="button"
              onClick={() => setIsLocationModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50/70 hover:bg-orange-100/80 text-slate-800 border border-orange-200/60 transition-all text-xs font-medium cursor-pointer"
            >
              <MapPin className="h-3.5 w-3.5 text-[#FF6F0F] shrink-0" />
              <span className="max-w-[120px] truncate">{areaLabel}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-2">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`${areaLabel} ও আশেপাশে যেকোনো পণ্য খুঁজুন...`}
                className="w-full pl-10 pr-9 py-2 text-sm bg-slate-100 hover:bg-slate-200/70 focus:bg-white border border-transparent focus:border-orange-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-slate-800 placeholder-slate-400 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right Navigation Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Location Badge button */}
            <button
              type="button"
              onClick={() => setIsLocationModalOpen(true)}
              className="sm:hidden inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-orange-50 text-slate-800 border border-orange-200 text-xs font-medium"
            >
              <MapPin className="h-3 w-3 text-[#FF6F0F]" />
              <span className="max-w-[70px] truncate">{areaLabel}</span>
              <ChevronDown className="h-2.5 w-2.5 text-slate-400" />
            </button>

            {/* Login Button */}
            <Button
              variant="ghost"
              size="sm"
              className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-[#FF6F0F] hover:bg-orange-50/50 rounded-full px-3 h-9"
            >
              <User className="h-4 w-4 mr-1 sm:mr-1.5" />
              <span>লগইন</span>
            </Button>

            {/* Prominent Orange "বিজ্ঞাপন দিন" Button */}
            <button
              type="button"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full bg-[#FF6F0F] hover:bg-[#F95738] active:scale-95 text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow-md shadow-orange-500/30 transition-all duration-200 cursor-pointer"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>বিজ্ঞাপন দিন</span>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Row */}
        <div className="md:hidden pb-3 pt-1">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`${areaLabel} ও আশেপাশে পণ্য খুঁজুন...`}
              className="w-full pl-10 pr-9 py-2 text-xs bg-slate-100 focus:bg-white border border-transparent focus:border-orange-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-slate-800 placeholder-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-200 text-slate-400"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
