/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { Category } from "@/types/category.types";
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
 * Server Action: Fetch all product categories
 * GET /categories
 */
export const getCategories = async (): Promise<ApiResponse<Category[]>> => {
  try {
    const res = await fetch(`${getApiBaseUrl()}/categories`, {
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
      message: error?.message || "ক্যাটাগরি লোড করতে সমস্যা হয়েছে",
      data: [],
    };
  }
};
