import { apiClient } from "@/lib/api-client";
import { ApiResponse, ILocationDivision, ILocationDistrict, ILocationArea } from "@/types/user.types";
import { Category, IProduct, GetProductsParams } from "@/types/product.types";

export const productService = {
  /**
   * Create a new product listing (multipart/form-data)
   * POST /products
   */
  async createProduct(formData: FormData): Promise<ApiResponse<IProduct>> {
    const response = await apiClient.post<ApiResponse<IProduct>>("/products", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * Get all active products with optional filters and pagination
   * GET /products
   */
  async getProducts(params?: GetProductsParams): Promise<ApiResponse<IProduct[]>> {
    const queryParams: Record<string, unknown> = {};

    if (params) {
      // 1. Search query: backend accepts searchTerm or search
      const search = (params.searchTerm || params.search)?.trim();
      if (search) {
        queryParams.searchTerm = search;
      }

      // 2. Category query: backend accepts category or categoryId (slug or UUID)
      const category = (params.category || params.categoryId)?.trim();
      if (category && category !== "সকল" && category !== "all") {
        queryParams.category = category;
      }

      // 3. Area query: backend accepts 'area' (UUID or slug)
      const area = (params.area || params.areaId)?.trim();
      if (
        area &&
        !area.includes("সব এলাকা") &&
        !area.includes("সমগ্র") &&
        area !== "ঢাকা"
      ) {
        queryParams.area = area;
      }

      // 4. Boundary and auxiliary filters
      if (params.condition) queryParams.condition = params.condition;
      if (params.isNegotiable !== undefined) queryParams.isNegotiable = params.isNegotiable;
      if (params.status) queryParams.status = params.status;
      if (params.minPrice !== undefined) queryParams.minPrice = params.minPrice;
      if (params.maxPrice !== undefined) queryParams.maxPrice = params.maxPrice;
      if (params.sortBy) queryParams.sortBy = params.sortBy;
      if (params.sortOrder) queryParams.sortOrder = params.sortOrder;
      if (params.page) queryParams.page = params.page;
      if (params.limit) queryParams.limit = params.limit;
    }

    const response = await apiClient.get<ApiResponse<IProduct[]>>("/products", {
      params: queryParams,
    });
    return response.data;
  },

  /**
   * Get single product details by unique slug
   * GET /products/:slug
   */
  async getProductBySlug(slug: string): Promise<ApiResponse<IProduct>> {
    const response = await apiClient.get<ApiResponse<IProduct>>(`/products/${encodeURIComponent(slug)}`);
    return response.data;
  },

  /**
   * Get all product categories
   * GET /categories
   */
  async getCategories(): Promise<ApiResponse<Category[]>> {
    const response = await apiClient.get<ApiResponse<Category[]>>("/categories");
    return response.data;
  },

  /**
   * Get all location divisions
   * GET /locations/divisions
   */
  async getDivisions(): Promise<ApiResponse<ILocationDivision[]>> {
    const response = await apiClient.get<ApiResponse<ILocationDivision[]>>("/locations/divisions");
    return response.data;
  },

  /**
   * Get districts optionally filtered by divisionId
   * GET /locations/districts
   */
  async getDistricts(divisionId?: string): Promise<ApiResponse<ILocationDistrict[]>> {
    const response = await apiClient.get<ApiResponse<ILocationDistrict[]>>("/locations/districts", {
      params: divisionId ? { divisionId } : undefined,
    });
    return response.data;
  },

  /**
   * Get areas optionally filtered by districtId
   * GET /locations/areas
   */
  async getAreas(districtId?: string): Promise<ApiResponse<ILocationArea[]>> {
    const response = await apiClient.get<ApiResponse<ILocationArea[]>>("/locations/areas", {
      params: districtId ? { districtId } : undefined,
    });
    return response.data;
  },
};

export default productService;
