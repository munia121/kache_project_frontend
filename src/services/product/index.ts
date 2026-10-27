/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cookies } from "next/headers";
import { IProduct, GetProductsParams } from "@/types/product.types";
import { ApiResponse } from "@/types/user.types";

const getApiBaseUrl = () => {
  const base =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost:5000/api";
  const clean = base.replace(/\/+$/, "");
  return clean.endsWith("/auth") ? clean.replace(/\/auth$/, "") : clean;
};

/**
 * Server Action: Fetch products with filtering, search and pagination
 * GET /products
 */
export const getProducts = async (
  params?: GetProductsParams
): Promise<ApiResponse<IProduct[]>> => {
  try {
    const url = new URL(`${getApiBaseUrl()}/products`);

    if (params) {
      // 1. Search
      const search = (params.searchTerm || params.search)?.trim();
      if (search) url.searchParams.append("searchTerm", search);

      // 2. Category
      const category = (params.category || params.categoryId)?.trim();
      if (category && category !== "সকল" && category !== "all") {
        url.searchParams.append("category", category);
        if (params.categoryId) url.searchParams.append("categoryId", params.categoryId);
      }

      // 3. Area
      const area = (params.area || params.areaId)?.trim();
      if (
        area &&
        !area.includes("সব এলাকা") &&
        !area.includes("সমগ্র") &&
        area !== "ঢাকা"
      ) {
        url.searchParams.append("area", area);
        if (params.areaId) url.searchParams.append("areaId", params.areaId);
      }

      // 4. Condition
      if (params.condition && params.condition !== "ALL") {
        url.searchParams.append("condition", params.condition);
      }

      // 5. Negotiable
      if (params.isNegotiable) {
        url.searchParams.append("isNegotiable", "true");
      }

      // 6. Price range
      if (params.minPrice !== undefined && params.minPrice !== "" && Number(params.minPrice) >= 0) {
        url.searchParams.append("minPrice", String(params.minPrice));
      }
      if (params.maxPrice !== undefined && params.maxPrice !== "" && Number(params.maxPrice) >= 0) {
        url.searchParams.append("maxPrice", String(params.maxPrice));
      }

      // 7. Sort
      if (params.sortBy) {
        if (params.sortBy === "newest") {
          url.searchParams.append("sortBy", "createdAt");
          url.searchParams.append("sortOrder", "desc");
        } else if (params.sortBy === "price_asc") {
          url.searchParams.append("sortBy", "price");
          url.searchParams.append("sortOrder", "asc");
        } else if (params.sortBy === "price_desc") {
          url.searchParams.append("sortBy", "price");
          url.searchParams.append("sortOrder", "desc");
        } else {
          url.searchParams.append("sortBy", params.sortBy);
        }
      }

      // 8. Pagination
      if (params.page) url.searchParams.append("page", String(params.page));
      if (params.limit) url.searchParams.append("limit", String(params.limit));
    }

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const result = await res.json();
    return result;
  } catch (error: any) {
    return {
      statusCode: 500,
      success: false,
      message: error?.message || "পণ্য লোড করতে সমস্যা হয়েছে",
      data: [],
    };
  }
};

/**
 * Server Action: Fetch single product details by unique slug
 * GET /products/:slug
 */
export const getProductBySlug = async (slug: string): Promise<ApiResponse<IProduct>> => {
  try {
    const res = await fetch(`${getApiBaseUrl()}/products/${encodeURIComponent(slug)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    const result = await res.json();
    return result;
  } catch (error: any) {
    return {
      statusCode: 500,
      success: false,
      message: error?.message || "পণ্যের বিস্তারিত লোড করতে সমস্যা হয়েছে",
      data: null as any,
    };
  }
};

/**
 * Server Action: Create a new product listing
 * POST /products
 */
export const createProduct = async (
  formData: FormData,
  explicitToken?: string
): Promise<ApiResponse<IProduct>> => {
  try {
    const cookieStore = await cookies();
    const token = explicitToken || cookieStore.get("accessToken")?.value;

    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${getApiBaseUrl()}/products`, {
      method: "POST",
      headers,
      body: formData,
    });
    const result = await res.json();
    return result;
  } catch (error: any) {
    return {
      statusCode: 500,
      success: false,
      message: error?.message || "বিজ্ঞাপন পোস্ট করতে ব্যর্থ হয়েছে",
      data: null as any,
    };
  }
};
