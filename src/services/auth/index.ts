/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cookies } from "next/headers";

const getAuthBaseUrl = () => {
  const base =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost:5000/api";
  const clean = base.replace(/\/+$/, "");
  return clean.endsWith("/auth") ? clean : `${clean}/auth`;
};

/**
 * Register a new user
 * POST /auth/register
 */
export const register = async (user: any) => {
  try {
    const res = await fetch(`${getAuthBaseUrl()}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });
    const result = await res.json();
    return result;
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "রেজিস্ট্রেশন সম্পূর্ণ করা যায়নি।",
    };
  }
};

/**
 * Log in an existing user and set accessToken and refreshToken cookies
 * POST /auth/login
 */
export const login = async (credentials: any) => {
  try {
    const res = await fetch(`${getAuthBaseUrl()}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });
    const result = await res.json();

    if (result.success && result.data) {
      const { accessToken, refreshToken, token } = result.data;
      const validAccessToken = accessToken || token;
      const cookieStore = await cookies();

      if (validAccessToken) {
        cookieStore.set("accessToken", validAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 7, // 7 days
        });
      }

      if (refreshToken) {
        cookieStore.set("refreshToken", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 30, // 30 days
        });
      }
    }

    return result;
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "লগইন ব্যর্থ হয়েছে। মোবাইল/ইমেইল এবং পাসওয়ার্ড যাচাই করুন।",
    };
  }
};

/**
 * Verify OTP and set accessToken & refreshToken cookies
 * POST /auth/verify-otp
 */
export const verifyOtp = async (payload: { email: string; code: string }) => {
  try {
    const res = await fetch(`${getAuthBaseUrl()}/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const result = await res.json();

    if (result.success && result.data) {
      const { accessToken, refreshToken, token } = result.data;
      const validAccessToken = accessToken || token;
      const cookieStore = await cookies();

      if (validAccessToken) {
        cookieStore.set("accessToken", validAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
        });
      }

      if (refreshToken) {
        cookieStore.set("refreshToken", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 30,
        });
      }
    }

    return result;
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "ওটিপি ভেরিফিকেশন ব্যর্থ হয়েছে।",
    };
  }
};

/**
 * Resend verification OTP
 * POST /auth/resend-otp
 */
export const resendOtp = async (payload: { email: string }) => {
  try {
    const res = await fetch(`${getAuthBaseUrl()}/resend-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "ওটিপি পুনরায় পাঠানো যায়নি।",
    };
  }
};

/**
 * Logout user and clear tokens from cookies
 */
export const logout = async () => {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("accessToken");
    cookieStore.delete("refreshToken");
    return { success: true, message: "সফলভাবে লগআউট হয়েছে" };
  } catch {
    return { success: true };
  }
};

/**
 * Get current authenticated user profile using cookie token
 * GET /auth/me
 */
export const getMe = async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    if (!token) return { success: false, data: null };

    const res = await fetch(`${getAuthBaseUrl()}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
    return await res.json();
  } catch {
    return { success: false, data: null };
  }
};
