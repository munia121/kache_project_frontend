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
  getMyProfile,

  async updateProfile(payload: UpdateProfilePayload): Promise<ApiResponse<IUser>> {
    const response = await updateProfile(payload);
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
