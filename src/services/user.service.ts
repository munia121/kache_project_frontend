import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/store/useAuthStore";
import {
  ApiResponse,
  BecomeSellerPayload,
  ILocationArea,
  IMyProductListing,
  IUser,
  UpdateProfilePayload,
} from "@/types/user.types";

export const userService = {
  /**
   * Get current authenticated user's profile with populated location hierarchy
   */
  async getMyProfile(): Promise<ApiResponse<IUser>> {
    const response = await apiClient.get<ApiResponse<IUser>>("/users/profile/me");
    return response.data;
  },

  /**
   * Update authenticated user's profile information (fullName, phone, areaId, address, role, shopName, bio)
   */
  async updateProfile(payload: UpdateProfilePayload): Promise<ApiResponse<IUser>> {
    const response = await apiClient.patch<ApiResponse<IUser>>("/users/profile", payload);
    if (response.data?.success && response.data?.data) {
      useAuthStore.getState().setUser(response.data.data);
    }
    return response.data;
  },

  /**
   * Onboard regular user as a seller
   */
  async becomeSeller(payload: BecomeSellerPayload): Promise<ApiResponse<IUser>> {
    const response = await apiClient.patch<ApiResponse<IUser>>("/users/become-seller", payload);
    return response.data;
  },

  /**
   * Retrieve listings created by the authenticated user
   */
  async getMyListings(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<IMyProductListing[]>> {
    const response = await apiClient.get<ApiResponse<IMyProductListing[]>>(
      "/users/profile/my-listings",
      { params }
    );
    return response.data;
  },

  /**
   * Get all areas for location selection
   */
  async getAreas(): Promise<ApiResponse<ILocationArea[]>> {
    const response = await apiClient.get<ApiResponse<ILocationArea[]>>("/locations/areas");
    return response.data;
  },
};

export default userService;
