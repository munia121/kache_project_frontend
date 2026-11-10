import apiClient from "@/lib/axios";
import { ApiResponse } from "@/types/user.types";
import { ICartResponse, SyncCartItemPayload } from "@/types/cart.types";

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

export const cartService = {
  /**
   * Fetch authenticated user's cart
   * GET /api/cart
   */
  async getCart(): Promise<ApiResponse<ICartResponse>> {
    const response = await apiClient.get<ApiResponse<ICartResponse>>(
      resolveEndpoint("/api/cart")
    );
    return response.data;
  },

  /**
   * Add a product to the user's cart
   * POST /api/cart/add
   */
  async addToCart(
    productId: string,
    quantity: number = 1
  ): Promise<ApiResponse<ICartResponse>> {
    const response = await apiClient.post<ApiResponse<ICartResponse>>(
      resolveEndpoint("/api/cart/add"),
      {
        productId,
        quantity,
      }
    );
    return response.data;
  },

  /**
   * Update quantity of a cart item
   * PATCH /api/cart/items/${cartItemId}
   */
  async updateQuantity(
    cartItemId: string,
    quantity: number
  ): Promise<ApiResponse<ICartResponse>> {
    const response = await apiClient.patch<ApiResponse<ICartResponse>>(
      resolveEndpoint(`/api/cart/items/${cartItemId}`),
      {
        quantity,
      }
    );
    return response.data;
  },

  /**
   * Remove an item from the cart
   * DELETE /api/cart/items/${cartItemId}
   */
  async removeItem(cartItemId: string): Promise<ApiResponse<ICartResponse>> {
    const response = await apiClient.delete<ApiResponse<ICartResponse>>(
      resolveEndpoint(`/api/cart/items/${cartItemId}`)
    );
    return response.data;
  },

  /**
   * Clear all items in the user's cart
   * DELETE /api/cart/clear
   */
  async clearCart(): Promise<ApiResponse<ICartResponse>> {
    const response = await apiClient.delete<ApiResponse<ICartResponse>>(
      resolveEndpoint("/api/cart/clear")
    );
    return response.data;
  },

  /**
   * Sync guest localStorage items with backend upon login
   * POST /api/cart/sync
   */
  async syncCart(
    items: Array<SyncCartItemPayload>
  ): Promise<ApiResponse<ICartResponse>> {
    const response = await apiClient.post<ApiResponse<ICartResponse>>(
      resolveEndpoint("/api/cart/sync"),
      {
        items,
      }
    );
    return response.data;
  },
};

export default cartService;
