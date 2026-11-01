import {
  getMyProfile,
  updateProfile,
  becomeSeller,
  getMyListings,
  getAreas,
} from "./user";
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
  getMyProfile: (explicitToken?: string) => {
    const token =
      explicitToken ||
      (typeof window !== "undefined"
        ? localStorage.getItem("accessToken") ||
          localStorage.getItem("kache_access_token") ||
          undefined
        : undefined);
    return getMyProfile(token);
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<ApiResponse<IUser>> {
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
  },

  becomeSeller,
  getMyListings,
  getAreas,
};

export default userService;
