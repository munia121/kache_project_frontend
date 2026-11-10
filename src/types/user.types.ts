export type UserRole = "USER" | "SELLER" | "ADMIN" | "SUPER_ADMIN";
export type UserStatus = "ACTIVE" | "BANNED" | "SUSPENDED";
export type SellerStatus = "NONE" | "PENDING" | "APPROVED" | "REJECTED";

export interface ILocationDivision {
  id: string;
  name: string;
  bnName: string;
  slug?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ILocationDistrict {
  id: string;
  name: string;
  bnName: string;
  slug?: string;
  divisionId: string;
  division?: ILocationDivision;
  createdAt?: string;
  updatedAt?: string;
}

export interface ILocationArea {
  id: string;
  name: string;
  bnName: string;
  slug?: string;
  districtId: string;
  district?: ILocationDistrict;
  createdAt?: string;
  updatedAt?: string;
}

// User interface supporting both `User` and `IUser` conventions
export interface IUser {
  id: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  phone?: string;
  whatsappNumber?: string;
  role: UserRole;
  sellerStatus?: SellerStatus;
  shopName?: string;
  shopAddress?: string;
  sellerAppliedAt?: string;
  rejectionReason?: string;
  status?: UserStatus;
  avatar?: string | null;
  bio?: string | null;
  areaId?: string | null;
  area?: string | null;
  locationArea?: ILocationArea | null;
  address?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  isEmailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Alias for backwards compatibility
export type User = IUser;

export interface ApiResponse<T = unknown> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPage?: number;
    totalPages?: number;
  };
}

export interface AuthResponseData {
  user: User;
  accessToken?: string;
  refreshToken?: string;
  token?: string;
  devOtp?: string;
}

export interface RegisterPayload {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  area?: string;
  address?: string;
}

export interface LoginPayload {
  email?: string;
  phone?: string;
  password: string;
}

export interface VerifyOtpPayload {
  email: string;
  code: string;
}

export interface ResendOtpPayload {
  email: string;
}

export interface UpdateProfilePayload {
  fullName?: string;
  phone?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  avatar?: string | null;
  areaId?: string | null;
  address?: string | null;
  role?: UserRole;
  shopName?: string | null;
  shopAddress?: string | null;
  bio?: string | null;
}

export interface BecomeSellerPayload {
  termsAccepted: true;
  shopName?: string | null;
  shopAddress?: string | null;
  bio?: string | null;
  phoneNumber?: string;
  phone?: string;
  whatsappNumber?: string;
}

export interface ReviewSellerApplicationPayload {
  status: "APPROVED" | "REJECTED";
  rejectionReason?: string;
}

export interface SellerApplicationQuery {
  status?: SellerStatus | "ALL";
  search?: string;
  page?: number;
  limit?: number;
}

export interface ISellerApplication {
  id: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  phone?: string;
  whatsappNumber?: string;
  role: UserRole;
  sellerStatus: SellerStatus;
  shopName?: string;
  shopAddress?: string;
  bio?: string;
  sellerAppliedAt?: string;
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
  area?: string;
  address?: string;
  locationArea?: ILocationArea | null;
}

export interface IMyProductListing {
  id: string;
  title: string;
  slug?: string;
  description: string;
  price: number;
  status: "ACTIVE" | "AVAILABLE" | "PENDING" | "SOLD" | "ARCHIVED" | "REJECTED" | string;
  condition?: string;
  images: string[];
  areaId?: string | null;
  area?: ILocationArea | null;
  category?: {
    id: string;
    name: string;
    bnName?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}
