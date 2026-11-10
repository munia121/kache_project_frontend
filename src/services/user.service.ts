/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  getMyProfile,
  updateProfile,
  becomeSeller as serverBecomeSeller,
  getMyListings,
  getAreas,
  getSellerApplications as serverGetSellerApplications,
  getSellerApplicationById as serverGetSellerApplicationById,
  reviewSellerApplication as serverReviewSellerApplication,
  approveSellerApplication as serverApproveSellerApplication,
  rejectSellerApplication as serverRejectSellerApplication,
} from "./user";
import { useAuthStore } from "@/store/useAuthStore";
import { apiClient } from "@/lib/api-client";
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

export const userService = {
  getMyProfile: async (explicitToken?: string): Promise<ApiResponse<IUser>> => {
    try {
      const response = await apiClient.get<ApiResponse<IUser>>("/users/profile/me");
      if (response.data?.success && response.data?.data) {
        useAuthStore.getState().setUser(response.data.data);
      }
      return response.data;
    } catch {
      const token =
        explicitToken ||
        (typeof window !== "undefined"
          ? localStorage.getItem("accessToken") ||
            localStorage.getItem("kache_access_token") ||
            undefined
          : undefined);
      return getMyProfile(token);
    }
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<ApiResponse<IUser>> {
    try {
      const response = await apiClient.patch<ApiResponse<IUser>>("/users/profile", payload);
      if (response.data?.success && response.data?.data) {
        const currentUser = useAuthStore.getState().user;
        const updatedUser: IUser = {
          ...(currentUser || {}),
          ...response.data.data,
          ...(payload.role ? { role: payload.role } : {}),
        } as IUser;
        useAuthStore.getState().setUser(updatedUser);
      }
      return response.data;
    } catch {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken") ||
            localStorage.getItem("kache_access_token") ||
            undefined
          : undefined;
      const response = await updateProfile(payload, token);
      if (response?.success && response?.data) {
        const currentUser = useAuthStore.getState().user;
        const updatedUser: IUser = {
          ...(currentUser || {}),
          ...response.data,
          ...(payload.role ? { role: payload.role } : {}),
        } as IUser;
        useAuthStore.getState().setUser(updatedUser);
      }
      return response;
    }
  },

  /**
   * Submit seller application
   * Aligned with: POST /api/users/become-seller (or fallback to PATCH /api/users/become-seller)
   */
  async becomeSeller(payload: BecomeSellerPayload): Promise<ApiResponse<IUser>> {
    try {
      // First attempt POST as defined in specifications
      try {
        const response = await apiClient.post<ApiResponse<IUser>>("/users/become-seller", payload);
        if (response.data?.success && response.data?.data) {
          useAuthStore.getState().setUser(response.data.data);
        }
        return response.data;
      } catch (err: any) {
        if (err.response?.status === 404 || err.response?.status === 405) {
          // Fallback to existing PATCH endpoint
          const patchResponse = await apiClient.patch<ApiResponse<IUser>>("/users/become-seller", payload);
          if (patchResponse.data?.success && patchResponse.data?.data) {
            useAuthStore.getState().setUser(patchResponse.data.data);
          }
          return patchResponse.data;
        }
        throw err;
      }
    } catch {
      // Fallback to server action
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken") ||
            localStorage.getItem("kache_access_token") ||
            undefined
          : undefined;
      const response = await serverBecomeSeller(payload, token);
      if (response?.success && response?.data) {
        useAuthStore.getState().setUser(response.data);
      }
      return response;
    }
  },

  /**
   * Admin Fetch seller applications
   * GET /api/users/seller-applications?status=PENDING
   */
  async getSellerApplications(
    query?: SellerApplicationQuery
  ): Promise<ApiResponse<IUser[]>> {
    try {
      const response = await apiClient.get<ApiResponse<IUser[]>>("/users/seller-applications", {
        params: query,
      });
      return response.data;
    } catch {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken") ||
            localStorage.getItem("kache_access_token") ||
            undefined
          : undefined;
      return serverGetSellerApplications(query, token);
    }
  },

  /**
   * Admin Fetch single seller application
   * GET /api/users/seller-applications/:id
   */
  async getSellerApplicationById(id: string): Promise<ApiResponse<IUser>> {
    try {
      const response = await apiClient.get<ApiResponse<IUser>>(`/users/seller-applications/${id}`);
      return response.data;
    } catch {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken") ||
            localStorage.getItem("kache_access_token") ||
            undefined
          : undefined;
      return serverGetSellerApplicationById(id, token);
    }
  },

  /**
   * Admin Review seller application
   * PATCH /api/users/seller-applications/:id with { "status": "APPROVED" | "REJECTED" }
   */
  async reviewSellerApplication(
    id: string,
    payload: ReviewSellerApplicationPayload
  ): Promise<ApiResponse<IUser>> {
    try {
      const response = await apiClient.patch<ApiResponse<IUser>>(
        `/users/seller-applications/${id}`,
        payload
      );
      return response.data;
    } catch {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken") ||
            localStorage.getItem("kache_access_token") ||
            undefined
          : undefined;
      return serverReviewSellerApplication(id, payload, token);
    }
  },

  /**
   * Admin Approve seller application alias
   * PATCH /api/users/seller-applications/:id/approve (or status APPROVED)
   */
  async approveSellerApplication(id: string): Promise<ApiResponse<IUser>> {
    try {
      try {
        const response = await apiClient.patch<ApiResponse<IUser>>(
          `/users/seller-applications/${id}/approve`
        );
        return response.data;
      } catch (err: any) {
        if (err.response?.status === 404 || err.response?.status === 405) {
          const response = await apiClient.patch<ApiResponse<IUser>>(
            `/users/seller-applications/${id}`,
            { status: "APPROVED" }
          );
          return response.data;
        }
        throw err;
      }
    } catch {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken") ||
            localStorage.getItem("kache_access_token") ||
            undefined
          : undefined;
      return serverApproveSellerApplication(id, token);
    }
  },

  /**
   * Admin Reject seller application alias
   * PATCH /api/users/seller-applications/:id/reject (or status REJECTED)
   */
  async rejectSellerApplication(
    id: string,
    rejectionReason?: string
  ): Promise<ApiResponse<IUser>> {
    try {
      try {
        const response = await apiClient.patch<ApiResponse<IUser>>(
          `/users/seller-applications/${id}/reject`,
          { rejectionReason }
        );
        return response.data;
      } catch (err: any) {
        if (err.response?.status === 404 || err.response?.status === 405) {
          const response = await apiClient.patch<ApiResponse<IUser>>(
            `/users/seller-applications/${id}`,
            { status: "REJECTED", rejectionReason }
          );
          return response.data;
        }
        throw err;
      }
    } catch {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken") ||
            localStorage.getItem("kache_access_token") ||
            undefined
          : undefined;
      return serverRejectSellerApplication(id, { rejectionReason }, token);
    }
  },

  /**
   * Admin Revoke seller privilege
   * PATCH /api/users/seller-applications/:id/revoke with { reason: string }
   */
  revokeSeller: async (userId: string, reason: string) => {
    try {
      const response = await apiClient.patch(`/users/seller-applications/${userId}/revoke`, {
        reason,
      });
      return response.data;
    } catch (err: any) {
      if (err.response?.status === 404) {
        const fallbackRes = await apiClient.patch(
          `/api/users/seller-applications/${userId}/revoke`,
          { reason }
        );
        return fallbackRes.data;
      }
      throw err;
    }
  },

  /**
   * Alias for revokeSeller
   */
  revokeSellerApplication: async (userId: string, reason: string) => {
    return userService.revokeSeller(userId, reason);
  },

  getMyListings,
  getAreas,
};

export default userService;
