"use client";

import * as React from "react";
import { TrendingUp } from "lucide-react";
import { CategoryPills } from "./CategoryPills";
import { Category } from "@/types/category.types";

export interface CategorySectionProps {
  initialCategories?: Category[];
  navigateToProducts?: boolean;
}

export function CategorySection({
  initialCategories = [],
  navigateToProducts = true,
}: CategorySectionProps) {
  return (
    <section className="border-b border-slate-200/60 pb-3">
      <div className="flex items-center justify-between mb-1.5 px-1">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          ক্যাটাগরি ব্রাউজ করুন
        </span>
        <span className="text-xs text-slate-500 hidden sm:inline-flex items-center gap-1">
          <TrendingUp className="h-3 w-3 text-[#FF6F0F]" />
          হট কালেকশন
        </span>
      </div>
      <CategoryPills
        navigateToProducts={navigateToProducts}
        initialCategories={initialCategories}
      />
    </section>
  );
}

export default CategorySection;
