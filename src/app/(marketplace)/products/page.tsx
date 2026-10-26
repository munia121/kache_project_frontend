"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CategoryPills } from "@/components/modules/products/CategoryPills";
import { ProductFilterSidebar } from "@/components/modules/products/ProductFilterSidebar";
import { SuggestedKeywords } from "@/components/modules/products/SuggestedKeywords";
import { ProductGrid } from "@/components/modules/products/ProductGrid";
import { useFilterStore } from "@/store/useFilterStore";
import { useFilterUrlSync } from "@/hooks/useFilterUrlSync";
import { productService } from "@/services/product.service";
import {
  MapPin,
  ChevronRight,
  Sparkles,
  PlusCircle,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function ProductsContent() {
  // Synchronize URL query parameters with Zustand store bidirectionally
  useFilterUrlSync();

  const {
    selectedCategory,
    selectedArea,
    setIsLocationModalOpen,
    setIsFilterDrawerOpen,
    getActiveFiltersCount,
  } = useFilterStore();
  const areaLabel = selectedArea.split(",")[0].trim();
  const activeCount = getActiveFiltersCount();

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => productService.getCategories(),
    staleTime: 1000 * 60 * 10,
  });

  const selectedCategoryObj = categoriesData?.data?.find(
    (c) => c.slug === selectedCategory || c.name === selectedCategory || c.id === selectedCategory
  );
  const categoryDisplayName = selectedCategoryObj?.name;
  const isCategoryActive = Boolean(
    selectedCategory &&
    selectedCategory !== "সকল" &&
    selectedCategory !== "all" &&
    categoryDisplayName
  );

  return (
    <div className="w-full min-h-screen pb-16 bg-slate-50/50">
      {/* Top Breadcrumb & Header Bar */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-2 font-medium">
            <Link href="/" className="hover:text-[#FF6F0F] transition-colors">
              হোম
            </Link>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <Link
              href="/products"
              className={`hover:text-[#FF6F0F] transition-colors ${
                !isCategoryActive ? "text-slate-900 font-bold" : ""
              }`}
            >
              পণ্য ব্রাউজ
            </Link>
            {isCategoryActive && (
              <>
                <ChevronRight className="h-3 w-3 text-slate-400" />
                <span className="text-slate-900 font-bold">{categoryDisplayName}</span>
              </>
            )}
          </nav>

          {/* Title & Actions Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-50 text-[11px] font-bold text-[#FF6F0F] border border-orange-200/80 mb-1">
                <Sparkles className="h-3 w-3" />
                <span>কাছে মার্কেটপ্লেস</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {isCategoryActive ? `${categoryDisplayName} বিজ্ঞাপন ও পণ্য` : "সকল বিজ্ঞাপন ও পণ্য"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {areaLabel} ও আশেপাশের এলাকার {isCategoryActive ? `${categoryDisplayName}-এর ` : ""}সকল সক্রিয় বিজ্ঞাপন ব্রাউজ করুন
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLocationModalOpen(true)}
                className="rounded-full text-xs font-semibold border-slate-200 hover:border-orange-300 text-slate-700 hover:bg-orange-50/50 cursor-pointer"
              >
                <MapPin className="h-3.5 w-3.5 text-[#FF6F0F]" />
                <span>{areaLabel}</span>
              </Button>

              {/* Mobile Filter Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFilterDrawerOpen(true)}
                className="lg:hidden rounded-full text-xs font-bold border-orange-200 text-slate-800 hover:bg-orange-50 cursor-pointer"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 text-[#FF6F0F]" />
                <span>ফিল্টার</span>
                {activeCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#FF6F0F] text-white">
                    {activeCount}
                  </span>
                )}
              </Button>

              <Link
                href="/post-ad"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FF6F0F] hover:bg-[#F95738] text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all cursor-pointer"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>বিজ্ঞাপন দিন</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-5">
        {/* Category Pills Navigation (in-place filtering inside products) */}
        <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs">
          <CategoryPills navigateToProducts={false} />
        </div>

        {/* Karrot-Style Marketplace Layout: Sticky Sidebar + Product Grid */}
        <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-8">
          {/* Desktop Left Sidebar Filter Panel */}
          <ProductFilterSidebar />

          {/* Right Main Column: Suggested Keywords + Product Grid */}
          <div className="flex-1 min-w-0 w-full space-y-3">
            {/* Top Suggested Keywords Bar */}
            <SuggestedKeywords />

            {/* Products Grid */}
            <ProductGrid showSidebarFilters={true} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <ProductsContent />
    </React.Suspense>
  );
}
