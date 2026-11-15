import { IProduct } from "./product.types";
import { ApiResponse } from "./user.types";

export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatus = "UNPAID" | "PAID" | "REFUNDED";

export type PaymentMethod = "COD" | string;

export interface IOrderItem {
  id: string;
  orderId?: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  product?: IProduct;
  createdAt?: string;
  updatedAt?: string;
}

export interface IOrder {
  id: string;
  userId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  shippingAddress: string;
  customerName?: string;
  customerPhone?: string;
  deliveryNote?: string;
  orderItems: IOrderItem[];
  user?: {
    id: string;
    fullName: string;
    phone?: string;
    email?: string;
    address?: string;
    area?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutItemPayload {
  productId: string;
  quantity: number;
}

export interface CheckoutPayload {
  shippingAddress: string;
  customerPhone: string;
  customerName: string;
  paymentMethod?: "COD" | string;
  deliveryNote?: string;
  cityArea?: string;
  items?: CheckoutItemPayload[];
}

export type { ApiResponse };
