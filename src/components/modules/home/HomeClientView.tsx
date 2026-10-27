"use client";

import * as React from "react";
import { HeroBanner } from "@/components/modules/home/HeroBanner";
import { CategorySection } from "@/components/modules/category/CategorySection";
import { ProductGrid } from "@/components/modules/products/ProductGrid";
import { useFilterStore } from "@/store/useFilterStore";
import { Category } from "@/types/category.types";
import { IProduct } from "@/types/product.types";

interface HomeClientViewProps {
  initialProducts?: IProduct[];
  categories?: Category[];
}

export function HomeClientView({
  initialProducts = [],
  categories = [],
}: HomeClientViewProps) {
  const { setSelectedCategory } = useFilterStore();

  // Reset category on Home page mount so Home page displays all products
  React.useEffect(() => {
    setSelectedCategory("সকল");
  }, [setSelectedCategory]);

  return (
    <div className="w-full min-h-screen">
      {/* 1. Community Hero Banner */}
      <HeroBanner />

      {/* 2. Main Content: Category pills + Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
        <CategorySection
          initialCategories={categories}
          navigateToProducts={true}
        />

        <ProductGrid
          showSidebarFilters={false}
          initialProducts={initialProducts}
          initialCategories={categories}
        />
      </div>
    </div>
  );
}

export default HomeClientView;
