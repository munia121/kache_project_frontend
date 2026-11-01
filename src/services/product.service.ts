import {
  getProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  updateProductStatus,
  deleteProduct,
  toggleFavorite,
  getMyFavorites,
} from "./product";
import { useAuthStore } from "@/store/useAuthStore";
import { MyFavoritesParams } from "@/types/product.types";

export const productService = {
  createProduct,
  getProducts,
  getProductBySlug,
  getProductById,
  updateProduct,
  updateProductStatus,
  deleteProduct,
  toggleFavorite: (productId: string, explicitToken?: string) => {
    const token =
      explicitToken ||
      useAuthStore.getState().token ||
      (typeof window !== "undefined"
        ? localStorage.getItem("accessToken") ||
          localStorage.getItem("kache_access_token") ||
          undefined
        : undefined);
    return toggleFavorite(productId, token);
  },
  getMyFavorites: (params?: MyFavoritesParams, explicitToken?: string) => {
    const token =
      explicitToken ||
      useAuthStore.getState().token ||
      (typeof window !== "undefined"
        ? localStorage.getItem("accessToken") ||
          localStorage.getItem("kache_access_token") ||
          undefined
        : undefined);
    return getMyFavorites(params, token);
  },
};

export default productService;
