/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cookies } from "next/headers";
import {
  IProduct,
  GetProductsParams,
  ToggleFavoriteResponse,
  MyFavoritesParams,
} from "@/types/product.types";
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

/**
 * Server Action: Update an existing product listing
 * PATCH /products/:id
 */
export const updateProduct = async (
  id: string,
  formDataOrPayload: FormData | Record<string, any>,
  explicitToken?: string
): Promise<ApiResponse<IProduct>> => {
  try {
    const cookieStore = await cookies();
    const token = explicitToken || cookieStore.get("accessToken")?.value;

    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const isFormData = typeof FormData !== "undefined" && formDataOrPayload instanceof FormData;
    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    const res = await fetch(`${getApiBaseUrl()}/products/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers,
      body: isFormData ? (formDataOrPayload as FormData) : JSON.stringify(formDataOrPayload),
    });
    const result = await res.json();
    return result;
  } catch (error: any) {
    return {
      statusCode: 500,
      success: false,
      message: error?.message || "বিজ্ঞাপন আপডেট করতে সমস্যা হয়েছে",
      data: null as any,
    };
  }
};

/**
 * Server Action: Update product status (e.g. AVAILABLE, SOLD, ARCHIVED)
 * PATCH /products/:id/status
 */
export const updateProductStatus = async (
  id: string,
  status: "AVAILABLE" | "SOLD" | "ARCHIVED" | string,
  explicitToken?: string
): Promise<ApiResponse<IProduct>> => {
  try {
    const cookieStore = await cookies();
    const token = explicitToken || cookieStore.get("accessToken")?.value;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${getApiBaseUrl()}/products/${encodeURIComponent(id)}/status`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ status }),
    });
    const result = await res.json();
    return result;
  } catch (error: any) {
    return {
      statusCode: 500,
      success: false,
      message: error?.message || "বিজ্ঞাপনের স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে",
      data: null as any,
    };
  }
};

/**
 * Server Action: Remove or archive a product listing
 * DELETE /products/:id
 */
export const deleteProduct = async (
  id: string,
  permanent: boolean = false,
  explicitToken?: string
): Promise<ApiResponse<IProduct>> => {
  try {
    const cookieStore = await cookies();
    const token = explicitToken || cookieStore.get("accessToken")?.value;

    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const url = new URL(`${getApiBaseUrl()}/products/${encodeURIComponent(id)}`);
    if (permanent) {
      url.searchParams.append("permanent", "true");
    }

    const res = await fetch(url.toString(), {
      method: "DELETE",
      headers,
    });
    const result = await res.json();
    return result;
  } catch (error: any) {
    return {
      statusCode: 500,
      success: false,
      message: error?.message || "বিজ্ঞাপন মুছতে বা লুকাতে সমস্যা হয়েছে",
      data: null as any,
    };
  }
};

/**
 * Server Action: Fetch single product details by UUID
 * GET /products/id/:id
 */
export const getProductById = async (id: string): Promise<ApiResponse<IProduct>> => {
  try {
    const res = await fetch(`${getApiBaseUrl()}/products/id/${encodeURIComponent(id)}`, {
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
      message: error?.message || "পণ্যের তথ্য লোড করতে সমস্যা হয়েছে",
      data: null as any,
    };
  }
};

/**
 * Server Action: Toggle favorite / wishlist status for a product
 * POST /products/:id/favorite
 */
export const toggleFavorite = async (
  productId: string,
  explicitToken?: string
): Promise<ApiResponse<ToggleFavoriteResponse>> => {
  try {
    const cookieStore = await cookies();
    const token = explicitToken || cookieStore.get("accessToken")?.value;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(
      `${getApiBaseUrl()}/products/${encodeURIComponent(productId)}/favorite`,
      {
        method: "POST",
        headers,
        cache: "no-store",
      }
    );
    const result = await res.json();
    return result;
  } catch (error: any) {
    return {
      statusCode: 500,
      success: false,
      message: error?.message || "পছন্দের তালিকা আপডেট করতে সমস্যা হয়েছে",
      data: null as any,
    };
  }
};

/**
 * Server Action: Get favorite products of authenticated user with pagination
 * GET /products/user/my-favorites
 */
export const getMyFavorites = async (
  params?: MyFavoritesParams,
  explicitToken?: string
): Promise<ApiResponse<IProduct[]>> => {
  try {
    const cookieStore = await cookies();
    const token = explicitToken || cookieStore.get("accessToken")?.value;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const url = new URL(`${getApiBaseUrl()}/products/user/my-favorites`);
    if (params) {
      if (params.page) url.searchParams.append("page", String(params.page));
      if (params.limit) url.searchParams.append("limit", String(params.limit));
    }

    const res = await fetch(url.toString(), {
      method: "GET",
      headers,
      cache: "no-store",
    });
    const result = await res.json();
    return result;
  } catch (error: any) {
    return {
      statusCode: 500,
      success: false,
      message: error?.message || "পছন্দের পণ্যসমূহ লোড করতে সমস্যা হয়েছে",
      data: [],
    };
  }
};
