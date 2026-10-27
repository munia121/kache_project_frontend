"use server";

import { cookies } from "next/headers";
import {
  ApiResponse,
  BecomeSellerPayload,
  ILocationArea,
  IMyProductListing,
  IUser,
  UpdateProfilePayload,
} from "@/types/user.types";

const getApiBaseUrl = () => {
  const base =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost:5000/api";
  const clean = base.replace(/\/+$/, "");
  return clean.endsWith("/auth") ? clean.replace(/\/auth$/, "") : clean;
};

/**
 * Server Action: Get current user profile
 * GET /users/profile/me
 */
export const getMyProfile = async (explicitToken?: string): Promise<ApiResponse<IUser>> => {
  try {
    const cookieStore = await cookies();
    const token = explicitToken || cookieStore.get("accessToken")?.value;

    const res = await fetch(`${getApiBaseUrl()}/users/profile/me`, {
      method: "GET",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      cache: "no-store",
    });
    return await res.json();
  } catch (error: any) {
    return {
      statusCode: 500,
      success: false,
      message: error?.message || "প্রোফাইল লোড করতে সমস্যা হয়েছে",
      data: null as any,
    };
  }
};

/**
 * Server Action: Update profile information
 * PATCH /users/profile
 */
export const updateProfile = async (
  payload: UpdateProfilePayload,
  explicitToken?: string
): Promise<ApiResponse<IUser>> => {
  try {
    const cookieStore = await cookies();
    const token = explicitToken || cookieStore.get("accessToken")?.value;

    const res = await fetch(`${getApiBaseUrl()}/users/profile`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (error: any) {
    return {
      statusCode: 500,
      success: false,
      message: error?.message || "প্রোফাইল আপডেট করতে সমস্যা হয়েছে",
      data: null as any,
    };
  }
};

/**
 * Server Action: Become seller
 * PATCH /users/become-seller
 */
export const becomeSeller = async (
  payload: BecomeSellerPayload,
  explicitToken?: string
): Promise<ApiResponse<IUser>> => {
  try {
    const cookieStore = await cookies();
    const token = explicitToken || cookieStore.get("accessToken")?.value;

    const res = await fetch(`${getApiBaseUrl()}/users/become-seller`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (error: any) {
    return {
      statusCode: 500,
      success: false,
      message: error?.message || "বিক্রেতা হিসেবে অ্যাকাউন্ট তৈরি করতে ব্যর্থ হয়েছে",
      data: null as any,
    };
  }
};

/**
 * Server Action: Get listings created by authenticated user
 * GET /users/profile/my-listings
 */
export const getMyListings = async (
  params?: {
    status?: string;
    page?: number;
    limit?: number;
  },
  explicitToken?: string
): Promise<ApiResponse<IMyProductListing[]>> => {
  try {
    const cookieStore = await cookies();
    const token = explicitToken || cookieStore.get("accessToken")?.value;

    const url = new URL(`${getApiBaseUrl()}/users/profile/my-listings`);
    if (params) {
      if (params.status) url.searchParams.append("status", params.status);
      if (params.page) url.searchParams.append("page", String(params.page));
      if (params.limit) url.searchParams.append("limit", String(params.limit));
    }

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      cache: "no-store",
    });
    return await res.json();
  } catch (error: any) {
    return {
      statusCode: 500,
      success: false,
      message: error?.message || "বিজ্ঞাপন লোড করতে সমস্যা হয়েছে",
      data: [],
    };
  }
};

/**
 * Server Action: Get areas
 * GET /locations/areas
 */
export const getAreas = async (): Promise<ApiResponse<ILocationArea[]>> => {
  try {
    const res = await fetch(`${getApiBaseUrl()}/locations/areas`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    return await res.json();
  } catch (error: any) {
    return {
      statusCode: 500,
      success: false,
      message: error?.message || "এলাকা লোড করতে সমস্যা হয়েছে",
      data: [],
    };
  }
};
