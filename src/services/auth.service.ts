import { register, login, verifyOtp, resendOtp, logout, getMe } from "./auth";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/store/useAuthStore";
import { ApiResponse, IUser, UpdateProfilePayload } from "@/types/user.types";

export const authService = {
  register,
  login,
  verifyOtp,
  resendOtp,
  logout,
  getProfile: getMe,

  async updateProfile(payload: UpdateProfilePayload): Promise<ApiResponse<IUser>> {
    const response = await apiClient.patch<ApiResponse<IUser>>("/users/profile", payload);
    if (response.data?.success && response.data?.data) {
      useAuthStore.getState().setUser(response.data.data);
    }
    return response.data;
  },
};

export default authService;
