"use server";

import {
  ApiResponse,
  ILocationDivision,
  ILocationDistrict,
  ILocationArea,
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
 * Server Action: Fetch all divisions
 * GET /locations/divisions
 */
export const getDivisions = async (): Promise<ApiResponse<ILocationDivision[]>> => {
  try {
    const res = await fetch(`${getApiBaseUrl()}/locations/divisions`, {
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
      message: error?.message || "বিভাগ লোড করতে সমস্যা হয়েছে",
      data: [],
    };
  }
};

/**
 * Server Action: Fetch districts optionally by divisionId
 * GET /locations/districts
 */
export const getDistricts = async (
  divisionId?: string
): Promise<ApiResponse<ILocationDistrict[]>> => {
  try {
    const url = new URL(`${getApiBaseUrl()}/locations/districts`);
    if (divisionId) url.searchParams.append("divisionId", divisionId);

    const res = await fetch(url.toString(), {
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
      message: error?.message || "জেলা লোড করতে সমস্যা হয়েছে",
      data: [],
    };
  }
};

/**
 * Server Action: Fetch areas optionally by districtId
 * GET /locations/areas
 */
export const getAreas = async (
  districtId?: string
): Promise<ApiResponse<ILocationArea[]>> => {
  try {
    const url = new URL(`${getApiBaseUrl()}/locations/areas`);
    if (districtId) url.searchParams.append("districtId", districtId);

    const res = await fetch(url.toString(), {
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
