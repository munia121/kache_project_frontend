import { IProduct } from "./product.types";
import { ApiResponse } from "./user.types";

export interface ICartItem {
  id: string; // CartItem ID (DB) or Product ID (guest)
  cartId?: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  itemSubtotal: number;
  isAvailable?: boolean;
  inStock?: boolean;
  availableStock?: number;
  product: IProduct;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface ICartSummary {
  totalItems: number; // Distinct products count
  totalQuantity: number; // Total item units count
  subtotal: number; // Subtotal calculated dynamically
  totalAmount: number; // Total payable amount
}

export interface ICartResponse {
  id: string;
  userId: string;
  items: ICartItem[];
  summary: ICartSummary;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface SyncCartItemPayload {
  productId: string;
  quantity: number;
}

export type { ApiResponse };
