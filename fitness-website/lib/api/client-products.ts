"use client";

import axios from "axios";
import { API_CONFIG } from "@/config/api";
import type {
  ClientProduct,
  ClientCategory,
  ProductSearchParams
} from "@/types";

// Client-side Products API functions
export const clientProductsApi = {
  // Normalize product data from API response
  normalizeProductData(item: any): ClientProduct {
    return {
      product_id: Number.parseInt(item.product_id || item.id, 10),
      name: item.name || "Unnamed Product",
      category_id: Number.parseInt(item.category_id || item.cat_id, 10) || 0,
      price: Number.parseFloat(item.price) || 0,
      description: item.description || "No description available",
      image_url: item.image_url || item.image || item.main_image_url || null,
      stock_quantity: Number.parseInt(item.stock_quantity || item.is_in_stock || item.quantity, 10) || 0,
      is_active: item.is_active !== undefined ? item.is_active : true,
      created_at: item.created_at || "",
      updated_at: item.updated_at || "",
      sub_images: Array.isArray(item.sub_images) ? item.sub_images : [],
    };
  },

  // Normalize category data from API response
  normalizeCategoryData(item: any): ClientCategory {
    return {
      category_id: Number.parseInt(item.category_id || item.id, 10),
      name: item.name || "Unknown Category",
    };
  },

  // Fetch all products
  async fetchProducts(params: ProductSearchParams = {}): Promise<ClientProduct[]> {
    try {
      let response;
      const { USER_FUNCTIONS } = API_CONFIG;

      if (params.searchKeyword && params.searchKeyword.trim()) {
        response = await axios.post(USER_FUNCTIONS.products.search, {
          keyword: params.searchKeyword,
        });
      } else if (params.categoryId) {
        response = await axios.get(
          USER_FUNCTIONS.categories.getProductsByCategory(params.categoryId.toString())
        );
      } else {
        response = await axios.get(USER_FUNCTIONS.products.getAll);
      }

      const result = response.data;
      let rawData = [];
      
      if (Array.isArray(result)) {
        rawData = result;
      } else if (result && typeof result === "object") {
        rawData = result.data || result.products || [];
      }

      return rawData.map(this.normalizeProductData);
    } catch (error: any) {
      console.error("Error fetching products:", error);
      throw new Error(
        error.response?.data?.message ||
        (params.searchKeyword
          ? "Search failed"
          : params.categoryId
            ? "Failed to load products by category"
            : "Failed to load products")
      );
    }
  },

  // Fetch single product by ID
  async fetchProductById(productId: string): Promise<ClientProduct> {
    try {
      const { USER_FUNCTIONS } = API_CONFIG;
      const response = await axios.get(USER_FUNCTIONS.products.getById(productId));
      const result = response.data;

      let productData = null;
      if (result && typeof result === "object") {
        productData = result.data || result.product || result.Product || result;
      }

      if (!productData) {
        throw new Error("Product not found");
      }

      // Enhanced stock quantity parsing for single product
      const toBooleanLike = (v: any) => {
        if (typeof v === "boolean") return v;
        if (typeof v === "string") {
          const s = v.trim().toLowerCase();
          if (["true", "1", "yes", "y"].includes(s)) return true;
          if (["false", "0", "no", "n"].includes(s)) return false;
        }
        return undefined;
      };

      const toNumeric = (v: any) => {
        if (typeof v === "number") return Number.isFinite(v) ? Math.trunc(v) : NaN;
        if (typeof v === "string") {
          const m = v.trim().match(/^\d+$/);
          if (m) return Number.parseInt(v, 10);
          return NaN;
        }
        return NaN;
      };

      let parsedStock = 0;
      if (productData.stock_quantity !== undefined && productData.stock_quantity !== null) {
        const n = toNumeric(productData.stock_quantity);
        if (Number.isFinite(n)) parsedStock = n;
      } else {
        const b = toBooleanLike(productData.is_in_stock);
        if (typeof b === "boolean") {
          parsedStock = b ? Number.NaN : 0; // NaN for unknown quantity but available
        } else if (productData.quantity !== undefined && productData.quantity !== null) {
          const q = toNumeric(productData.quantity);
          if (Number.isFinite(q)) parsedStock = q;
        }
      }

      return {
        product_id: Number.parseInt(productData.product_id || productData.id, 10),
        name: productData.name || "Unnamed Product",
        category_id: Number.parseInt(productData.category_id || productData.cat_id, 10) || 0,
        price: Number.parseFloat(productData.price) || 0,
        description: productData.description || "No description available",
        image_url: productData.image_url || productData.image || productData.main_image_url || null,
        sub_images: Array.isArray(productData.sub_images) ? productData.sub_images : [],
        stock_quantity: parsedStock,
        is_active: productData.is_active !== undefined ? productData.is_active : true,
        created_at: productData.created_at || "",
        updated_at: productData.updated_at || "",
      };
    } catch (error: any) {
      console.error("Error fetching product:", error);
      throw new Error(error.response?.data?.message || "Failed to load product");
    }
  },

  // Fetch related products by category
  async fetchRelatedProducts(categoryId: number, excludeProductId?: number): Promise<ClientProduct[]> {
    try {
      const { USER_FUNCTIONS } = API_CONFIG;
      const response = await axios.get(
        USER_FUNCTIONS.categories.getProductsByCategory(categoryId.toString())
      );
      const result = response.data;

      let rawData = [];
      if (Array.isArray(result)) {
        rawData = result;
      } else if (result && typeof result === "object") {
        rawData = result.data || result.products || [];
      }

      return rawData
        .map(this.normalizeProductData)
        .filter((p: ClientProduct) => 
          p.product_id !== excludeProductId && p.is_active
        )
        .slice(0, 4);
    } catch (error) {
      console.error("Error fetching related products:", error);
      return [];
    }
  },

  // Fetch all categories
  async fetchCategories(): Promise<ClientCategory[]> {
    try {
      const { USER_FUNCTIONS } = API_CONFIG;
      const response = await axios.get(USER_FUNCTIONS.categories.getAll);
      const result = response.data;

      const rawData = result.data || result.categories || result || [];
      return rawData.map(this.normalizeCategoryData);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      throw new Error("Failed to load categories");
    }
  },

  // Search products
  async searchProducts(keyword: string): Promise<ClientProduct[]> {
    return this.fetchProducts({ searchKeyword: keyword });
  },

  // Get products by category
  async getProductsByCategory(categoryId: number): Promise<ClientProduct[]> {
    return this.fetchProducts({ categoryId });
  }
};
