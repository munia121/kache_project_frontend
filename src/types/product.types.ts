import { Category } from "./category.types";
export type { Category } from "./category.types";

export type ProductCondition = "NEW" | "USED" | "REFURBISHED";
export type ProductStatus = "AVAILABLE" | "SOLD" | "ARCHIVED";

export interface IProductSeller {
  id: string;
  fullName: string;
  phone: string;
  email?: string | null;
  avatar?: string | null;
  shopName?: string | null;
  bio?: string | null;
  area?: string | null;
  address?: string | null;
  createdAt?: string;
}

export interface IProductCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  description?: string | null;
}

export interface IProductLocationDivision {
  id: string;
  name: string;
  bnName: string;
  slug?: string;
}

export interface IProductLocationDistrict {
  id: string;
  name: string;
  bnName: string;
  slug?: string;
  divisionId?: string;
  division?: IProductLocationDivision;
}

export interface IProductLocationArea {
  id: string;
  name: string;
  bnName: string;
  slug?: string;
  districtId?: string;
  district?: IProductLocationDistrict;
}

export interface Product {
  id: string;
  title: string;
  price: number;
  slug?: string;
  description?: string;
  currency?: string;
  isNegotiable?: boolean;
  condition?: ProductCondition | "নতুনের মতো" | "ব্যবহৃত" | "একেবারে নতুন" | string;
  status?: ProductStatus | string;
  images?: string[];
  location?: string;
  viewsCount?: number;
  sellerId?: string;
  categoryId?: string | null;
  areaId?: string | null;
  createdAt?: string;
  updatedAt?: string;

  // Joined relations or strings
  seller?: IProductSeller;
  category?: IProductCategory | string | null;
  area?: IProductLocationArea | string | null;

  // UI helper fields
  imageUrl?: string;
  categoryName?: string;
  timeAgo?: string;
  likesCount?: number;
  chatsCount?: number;
  sellerName?: string;
}

// Alias for unified usage
export type IProduct = Product;

export interface GetProductsParams {
  searchTerm?: string;
  search?: string;
  categoryId?: string;
  category?: string;
  areaId?: string;
  area?: string;
  division?: string;
  district?: string;
  condition?: ProductCondition | string;
  isNegotiable?: boolean | string;
  status?: ProductStatus | string;
  minPrice?: number | string;
  maxPrice?: number | string;
  sortBy?: "createdAt" | "price" | "viewsCount" | string;
  sortOrder?: "asc" | "desc" | string;
  page?: number;
  limit?: number;
}
