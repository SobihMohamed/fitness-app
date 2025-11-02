"use client";

import { dataCache } from "@/lib/cache";
import { clientProductsApi } from "./client-products";
import type { ClientProduct, ClientCategory } from "@/types";

/**
 * Cached API Client
 * Provides instant data access with aggressive caching
 */

// Cache configuration for different data types
const CACHE_CONFIG = {
  // Products change rarely, cache for 10 minutes
  products: {
    staleTime: 10 * 60 * 1000,
    cacheTime: 60 * 60 * 1000,
  },
  // Categories change very rarely, cache for 30 minutes
  categories: {
    staleTime: 30 * 60 * 1000,
    cacheTime: 2 * 60 * 60 * 1000,
  },
  // Product details might change, cache for 5 minutes
  productDetail: {
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
  },
};

export const cachedProductsApi = {
  /**
   * Fetch all products with aggressive caching
   */
  async fetchProducts(): Promise<ClientProduct[]> {
    return dataCache.get(
      'products:all',
      () => clientProductsApi.fetchProducts(),
      CACHE_CONFIG.products
    );
  },

  /**
   * Fetch all categories with aggressive caching
   */
  async fetchCategories(): Promise<ClientCategory[]> {
    return dataCache.get(
      'categories:all',
      () => clientProductsApi.fetchCategories(),
      CACHE_CONFIG.categories
    );
  },

  /**
   * Fetch single product with caching
   */
  async fetchProductById(productId: string): Promise<ClientProduct> {
    return dataCache.get(
      `product:${productId}`,
      () => clientProductsApi.fetchProductById(productId),
      CACHE_CONFIG.productDetail
    );
  },

  /**
   * Fetch related products with caching
   */
  async fetchRelatedProducts(
    categoryId: number,
    excludeProductId?: number
  ): Promise<ClientProduct[]> {
    return dataCache.get(
      `related:${categoryId}:${excludeProductId || 'none'}`,
      () => clientProductsApi.fetchRelatedProducts(categoryId, excludeProductId),
      CACHE_CONFIG.products
    );
  },

  /**
   * Search products (shorter cache time for search results)
   */
  async searchProducts(keyword: string): Promise<ClientProduct[]> {
    return dataCache.get(
      `search:${keyword.toLowerCase()}`,
      () => clientProductsApi.searchProducts(keyword),
      {
        staleTime: 2 * 60 * 1000, // 2 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
      }
    );
  },

  /**
   * Get products by category with caching
   */
  async getProductsByCategory(categoryId: number): Promise<ClientProduct[]> {
    return dataCache.get(
      `category:${categoryId}:products`,
      () => clientProductsApi.getProductsByCategory(categoryId),
      CACHE_CONFIG.products
    );
  },

  /**
   * Prefetch products for instant loading
   */
  async prefetchProducts(): Promise<void> {
    await dataCache.prefetch('products:all', () => clientProductsApi.fetchProducts());
  },

  /**
   * Prefetch categories for instant loading
   */
  async prefetchCategories(): Promise<void> {
    await dataCache.prefetch('categories:all', () => clientProductsApi.fetchCategories());
  },

  /**
   * Prefetch product detail for instant loading
   */
  async prefetchProductDetail(productId: string): Promise<void> {
    await dataCache.prefetch(
      `product:${productId}`,
      () => clientProductsApi.fetchProductById(productId)
    );
  },

  /**
   * Invalidate product cache when data changes
   */
  invalidateProducts(): void {
    dataCache.invalidatePattern(/^products:/);
    dataCache.invalidatePattern(/^product:/);
    dataCache.invalidatePattern(/^category:\d+:products/);
  },

  /**
   * Invalidate specific product
   */
  invalidateProduct(productId: string): void {
    dataCache.invalidate(`product:${productId}`);
  },
};

// Prefetch common data on client mount for instant loading
if (typeof window !== 'undefined') {
  // Defer prefetch to avoid blocking initial render (optimized from 100ms to 500ms)
  setTimeout(() => {
    cachedProductsApi.prefetchProducts().catch(() => {});
    cachedProductsApi.prefetchCategories().catch(() => {});
  }, 500);
}
