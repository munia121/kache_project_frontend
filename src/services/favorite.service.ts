import { productService } from "./product.service";
import {
  toggleFavorite as serverToggleFavorite,
  getMyFavorites as serverGetMyFavorites,
} from "./product";
import {
  ApiResponse,
  IProduct,
  ToggleFavoriteResponse,
  MyFavoritesParams,
} from "@/types/product.types";

export const favoriteService = {
  toggleFavorite: (
    productId: string,
    explicitToken?: string
  ): Promise<ApiResponse<ToggleFavoriteResponse>> => {
    return productService.toggleFavorite(productId, explicitToken);
  },

  getMyFavorites: (
    params?: MyFavoritesParams,
    explicitToken?: string
  ): Promise<ApiResponse<IProduct[]>> => {
    return productService.getMyFavorites(params, explicitToken);
  },
};

export { serverToggleFavorite as toggleFavorite, serverGetMyFavorites as getMyFavorites };
export default favoriteService;
