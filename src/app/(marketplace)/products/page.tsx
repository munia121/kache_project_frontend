import * as React from "react";
import { productService } from "@/services/product.service";
import { categoryService } from "@/services/category.service";
import { locationService } from "@/services/location.service";
import { ProductsClientView } from "@/components/modules/products/ProductsClientView";
import { GetProductsParams } from "@/types/product.types";

interface ProductsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Server Component: ProductsContent
 * Fetches initial marketplace data on the server via Server Actions
 * and passes the results as props to interactive client components.
 */
async function ProductsContent({ searchParams }: ProductsPageProps) {
  const resolvedParams = await searchParams;

  const queryParams: GetProductsParams = {
    searchTerm:
      typeof resolvedParams.search === "string"
        ? resolvedParams.search
        : typeof resolvedParams.q === "string"
        ? resolvedParams.q
        : undefined,
    category:
      typeof resolvedParams.category === "string" ? resolvedParams.category : undefined,
    categoryId:
      typeof resolvedParams.categoryId === "string" ? resolvedParams.categoryId : undefined,
    area:
      typeof resolvedParams.area === "string" ? resolvedParams.area : undefined,
    areaId:
      typeof resolvedParams.areaId === "string" ? resolvedParams.areaId : undefined,
    minPrice:
      resolvedParams.minPrice !== undefined && resolvedParams.minPrice !== ""
        ? Number(resolvedParams.minPrice)
        : undefined,
    maxPrice:
      resolvedParams.maxPrice !== undefined && resolvedParams.maxPrice !== ""
        ? Number(resolvedParams.maxPrice)
        : undefined,
    condition:
      typeof resolvedParams.condition === "string"
        ? (resolvedParams.condition as any)
        : undefined,
    isNegotiable: resolvedParams.isNegotiable === "true",
    sortBy:
      typeof resolvedParams.sort === "string"
        ? (resolvedParams.sort as any)
        : typeof resolvedParams.sortBy === "string"
        ? (resolvedParams.sortBy as any)
        : undefined,
    limit: 30,
  };

  // Execute server-side data fetching functions in parallel
  const [productsRes, categoriesRes, areasRes] = await Promise.all([
    productService.getProducts(queryParams),
    categoryService.getCategories(),
    locationService.getAreas(),
  ]);

  const initialProducts = productsRes?.data || [];
  const categories = categoriesRes?.data || [];
  const areas = areasRes?.data || [];

  return (
    <ProductsClientView
      initialProducts={initialProducts}
      categories={categories}
      areas={areas}
    />
  );
}

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-slate-50/50" />}>
      <ProductsContent searchParams={searchParams} />
    </React.Suspense>
  );
}
