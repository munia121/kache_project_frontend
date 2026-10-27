import * as React from "react";
import { productService } from "@/services/product.service";
import { categoryService } from "@/services/category.service";
import { HomeClientView } from "@/components/modules/home/HomeClientView";
import { GetProductsParams } from "@/types/product.types";

interface HomePageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Server Component: HomeContent
 * Fetches product listings and categories from the server using Server Actions
 * and passes the initial data down to the interactive HomeClientView.
 */
async function HomeContent({ searchParams }: HomePageProps) {
  const resolvedParams = searchParams ? await searchParams : {};

  const queryParams: GetProductsParams = {
    searchTerm:
      typeof resolvedParams.search === "string"
        ? resolvedParams.search
        : typeof resolvedParams.q === "string"
        ? resolvedParams.q
        : undefined,
    area:
      typeof resolvedParams.area === "string" ? resolvedParams.area : undefined,
    areaId:
      typeof resolvedParams.areaId === "string" ? resolvedParams.areaId : undefined,
    limit: 30,
  };

  // Fetch initial data concurrently on the server
  const [productsRes, categoriesRes] = await Promise.all([
    productService.getProducts(queryParams),
    categoryService.getCategories(),
  ]);

  const initialProducts = productsRes?.data || [];
  const categories = categoriesRes?.data || [];

  return (
    <HomeClientView
      initialProducts={initialProducts}
      categories={categories}
    />
  );
}

export default function HomePage({ searchParams }: HomePageProps) {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-slate-50/50" />}>
      <HomeContent searchParams={searchParams} />
    </React.Suspense>
  );
}
