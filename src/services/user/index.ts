/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import { cookies } from "next/headers";
import {
  ApiResponse,
  BecomeSellerPayload,
  ILocationArea,
  IMyProductListing,
  IUser,
  ReviewSellerApplicationPayload,
  SellerApplicationQuery,
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
 * Server Action: Become seller / Submit Seller Application
 * POST or PATCH /users/become-seller
 */
export const becomeSeller = async (
  payload: BecomeSellerPayload,
  explicitToken?: string
): Promise<ApiResponse<IUser>> => {
  try {
    const cookieStore = await cookies();
    const token = explicitToken || cookieStore.get("accessToken")?.value;

    // Try POST first per specification, fallback to PATCH if 404/405
    let res = await fetch(`${getApiBaseUrl()}/users/become-seller`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(payload),
    });

    if (res.status === 404 || res.status === 405) {
      res = await fetch(`${getApiBaseUrl()}/users/become-seller`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });
    }

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
 * Server Action: Get seller applications (Admin only)
 * GET /users/seller-applications
 */
export const getSellerApplications = async (
  query?: SellerApplicationQuery,
  explicitToken?: string
): Promise<ApiResponse<IUser[]>> => {
  try {
    const cookieStore = await cookies();
    const token = explicitToken || cookieStore.get("accessToken")?.value;

    const url = new URL(`${getApiBaseUrl()}/users/seller-applications`);
    if (query) {
      if (query.status) url.searchParams.append("status", query.status);
      if (query.page) url.searchParams.append("page", String(query.page));
      if (query.limit) url.searchParams.append("limit", String(query.limit));
      if (query.search) url.searchParams.append("search", query.search);
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
      message: error?.message || "সেলার আবেদন তালিকা লোড করতে সমস্যা হয়েছে",
      data: [],
    };
  }
};

/**
 * Server Action: Get single seller application details (Admin only)
 * GET /users/seller-applications/:id
 */
export const getSellerApplicationById = async (
  id: string,
  explicitToken?: string
): Promise<ApiResponse<IUser>> => {
  try {
    const cookieStore = await cookies();
    const token = explicitToken || cookieStore.get("accessToken")?.value;

    const res = await fetch(`${getApiBaseUrl()}/users/seller-applications/${id}`, {
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
      message: error?.message || "আবেদনের বিবরণ লোড করতে সমস্যা হয়েছে",
      data: null as any,
    };
  }
};

/**
 * Server Action: Review seller application (Approve / Reject) (Admin only)
 * PATCH /users/seller-applications/:id with { "status": "APPROVED" | "REJECTED" }
 */
export const reviewSellerApplication = async (
  id: string,
  payload: ReviewSellerApplicationPayload,
  explicitToken?: string
): Promise<ApiResponse<IUser>> => {
  try {
    const cookieStore = await cookies();
    const token = explicitToken || cookieStore.get("accessToken")?.value;

    const res = await fetch(`${getApiBaseUrl()}/users/seller-applications/${id}`, {
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
      message: error?.message || "আবেদন পর্যালোচনা সম্পন্ন করা যায়নি",
      data: null as any,
    };
  }
};

/**
 * Server Action: Approve seller application alias (Admin only)
 * PATCH /users/seller-applications/:id/approve
 */
export const approveSellerApplication = async (
  id: string,
  explicitToken?: string
): Promise<ApiResponse<IUser>> => {
  try {
    const cookieStore = await cookies();
    const token = explicitToken || cookieStore.get("accessToken")?.value;

    const res = await fetch(`${getApiBaseUrl()}/users/seller-applications/${id}/approve`, {
      method: "PATCH",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    if (res.status === 404 || res.status === 405) {
      return reviewSellerApplication(id, { status: "APPROVED" }, token);
    }

    return await res.json();
  } catch (error: any) {
    return reviewSellerApplication(id, { status: "APPROVED" }, explicitToken);
  }
};

/**
 * Server Action: Reject seller application alias (Admin only)
 * PATCH /users/seller-applications/:id/reject
 */
export const rejectSellerApplication = async (
  id: string,
  payload?: { rejectionReason?: string },
  explicitToken?: string
): Promise<ApiResponse<IUser>> => {
  try {
    const cookieStore = await cookies();
    const token = explicitToken || cookieStore.get("accessToken")?.value;

    const res = await fetch(`${getApiBaseUrl()}/users/seller-applications/${id}/reject`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: payload ? JSON.stringify(payload) : undefined,
    });

    if (res.status === 404 || res.status === 405) {
      return reviewSellerApplication(
        id,
        { status: "REJECTED", rejectionReason: payload?.rejectionReason },
        token
      );
    }

    return await res.json();
  } catch (error: any) {
    return reviewSellerApplication(
      id,
      { status: "REJECTED", rejectionReason: payload?.rejectionReason },
      explicitToken
    );
  }
};

/**
 * Server Action: Revoke seller privilege (Admin only)
 * PATCH /users/seller-applications/:id/revoke with { reason: string }
 */
export const revokeSeller = async (
  userId: string,
  reason: string,
  explicitToken?: string
): Promise<ApiResponse<any>> => {
  try {
    const cookieStore = await cookies();
    const token = explicitToken || cookieStore.get("accessToken")?.value;

    let res = await fetch(`${getApiBaseUrl()}/users/seller-applications/${userId}/revoke`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({ reason }),
    });

    if (res.status === 404) {
      res = await fetch(`${getApiBaseUrl()}/api/users/seller-applications/${userId}/revoke`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ reason }),
      });
    }

    return await res.json();
  } catch (error: any) {
    return {
      statusCode: 500,
      success: false,
      message: error?.message || "সেলার সুবিধা বাতিল করতে ব্যর্থ হয়েছে",
      data: null,
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
