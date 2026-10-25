import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/store/useAuthStore";
import {
  ApiResponse,
  AuthResponseData,
  IUser,
  LoginPayload,
  RegisterPayload,
  ResendOtpPayload,
  UpdateProfilePayload,
  VerifyOtpPayload,
} from "@/types/user.types";

export const authService = {
  /**
   * Register a new user
   */
  async register(
    payload: RegisterPayload
  ): Promise<ApiResponse<{ user: IUser; devOtp?: string }>> {
    const response = await apiClient.post<ApiResponse<{ user: IUser; devOtp?: string }>>(
      "/auth/register",
      payload
    );
    return response.data;
  },

  /**
   * Verify email OTP
   */
  async verifyOtp(payload: VerifyOtpPayload): Promise<ApiResponse<AuthResponseData>> {
    const response = await apiClient.post<ApiResponse<AuthResponseData>>(
      "/auth/verify-otp",
      payload
    );
    return response.data;
  },

  /**
   * Resend verification OTP
   */
  async resendOtp(payload: ResendOtpPayload): Promise<ApiResponse<{ devOtp?: string } | null>> {
    const response = await apiClient.post<ApiResponse<{ devOtp?: string } | null>>(
      "/auth/resend-otp",
      payload
    );
    return response.data;
  },

  /**
   * Login user with email/phone & password
   */
  async login(payload: LoginPayload): Promise<ApiResponse<AuthResponseData>> {
    const response = await apiClient.post<ApiResponse<AuthResponseData>>(
      "/auth/login",
      payload
    );
    return response.data;
  },

  /**
   * Get current authenticated user's profile
   */
  async getProfile(): Promise<ApiResponse<IUser>> {
    const response = await apiClient.get<ApiResponse<IUser>>("/auth/me");
    return response.data;
  },

  /**
   * Update authenticated user's profile
   */
  async updateProfile(payload: UpdateProfilePayload): Promise<ApiResponse<IUser>> {
    const response = await apiClient.patch<ApiResponse<IUser>>("/users/profile", payload);
    if (response.data?.success && response.data?.data) {
      useAuthStore.getState().setUser(response.data.data);
    }
    return response.data;
  },
};

export default authService;
