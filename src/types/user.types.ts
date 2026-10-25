export type UserRole = "USER" | "SELLER" | "ADMIN" | "SUPER_ADMIN";
export type UserStatus = "ACTIVE" | "BANNED" | "SUSPENDED";

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
export interface User {
  id: string;
  fullName: string;
  phone: string;
  email?: string | null;
  role: UserRole;
  status?: UserStatus;
  avatar?: string | null;
  shopName?: string | null;
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
export type IUser = User;

export interface ApiResponse<T = unknown> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
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
  avatar?: string | null;
  areaId?: string | null;
  address?: string | null;
  role?: UserRole;
  shopName?: string | null;
  bio?: string | null;
}

export interface BecomeSellerPayload {
  termsAccepted: true;
  shopName?: string | null;
  bio?: string | null;
}

export interface IMyProductListing {
  id: string;
  title: string;
  description: string;
  price: number;
  status: "ACTIVE" | "PENDING" | "SOLD" | "REJECTED";
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
