import apiClient from "@/lib/axios";
import { ApiResponse } from "@/types/user.types";
import { IOrder, CheckoutPayload } from "@/types/order.types";

/**
 * Normalizes URL path to avoid duplicate '/api' prefix when apiClient baseURL already has '/api'.
 */
const resolveEndpoint = (path: string): string => {
  const base = apiClient.defaults.baseURL || "";
  if (base.replace(/\/+$/, "").endsWith("/api") && path.startsWith("/api/")) {
    return path.replace(/^\/api/, "");
  }
  return path;
};

export const orderService = {
  /**
   * Place Cash on Delivery (COD) order
   * POST /api/orders/checkout
   */
  async placeCodOrder(payload: CheckoutPayload): Promise<ApiResponse<IOrder>> {
    const response = await apiClient.post<ApiResponse<IOrder>>(
      resolveEndpoint("/api/orders/checkout"),
      payload
    );
    return response.data;
  },

  /**
   * Get single order details by ID
   * GET /api/orders/${orderId}
   */
  async getOrderById(orderId: string): Promise<ApiResponse<IOrder>> {
    const response = await apiClient.get<ApiResponse<IOrder>>(
      resolveEndpoint(`/api/orders/${orderId}`)
    );
    return response.data;
  },

  /**
   * Fetch authenticated user's order history
   * GET /api/orders/my-orders?page=${page}&limit=${limit}
   */
  async getMyOrders(page = 1, limit = 10): Promise<ApiResponse<IOrder[]>> {
    const response = await apiClient.get<ApiResponse<IOrder[]>>(
      resolveEndpoint(`/api/orders/my-orders?page=${page}&limit=${limit}`)
    );
    return response.data;
  },

  /**
   * Cancel an active order and restore product stock
   * PATCH /api/orders/${orderId}/cancel
   */
  async cancelOrder(orderId: string): Promise<ApiResponse<IOrder>> {
    const response = await apiClient.patch<ApiResponse<IOrder>>(
      resolveEndpoint(`/api/orders/${orderId}/cancel`)
    );
    return response.data;
  },

  /**
   * Fetch seller's incoming orders with optional status filter and pagination
   * GET /api/orders/seller?page=${page}&limit=${limit}&status=${status}
   */
  async getSellerOrders(
    status?: string,
    page = 1,
    limit = 10
  ): Promise<ApiResponse<IOrder[]>> {
    const query = status && status !== "ALL" ? `&status=${status}` : "";
    const response = await apiClient.get<ApiResponse<IOrder[]>>(
      resolveEndpoint(`/api/orders/seller?page=${page}&limit=${limit}${query}`)
    );
    return response.data;
  },

  /**
   * Update order status / payment status (Seller or Admin)
   * PATCH /api/orders/${orderId}/status
   */
  async updateOrderStatus(
    orderId: string,
    status: string
  ): Promise<ApiResponse<IOrder>> {
    const response = await apiClient.patch<ApiResponse<IOrder>>(
      resolveEndpoint(`/api/orders/${orderId}/status`),
      { status }
    );
    return response.data;
  },
};

export const placeCodOrder = orderService.placeCodOrder;
export const getOrderById = orderService.getOrderById;
export const getMyOrders = orderService.getMyOrders;
export const cancelOrder = orderService.cancelOrder;
export const getSellerOrders = orderService.getSellerOrders;
export const updateOrderStatus = orderService.updateOrderStatus;

export default orderService;
