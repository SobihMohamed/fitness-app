"use client";

import { getHttpClient } from "@/lib/http";
import { getFullImageUrl } from "@/lib/images";
import { API_CONFIG } from "@/config/api";
import type {
  Product,
  Category,
  ProductFormData,
  ProductApiResponse,
  CategoryApiResponse,
  ProductSearchRequest,
  ProductSearchResponse,
  CategoryFormData
} from "@/types";

const http = getHttpClient();

// Products API functions
export const productsApi = {
  // Helper: download an image URL and convert to File
  async urlToFile(imagePath: string): Promise<File | null> {
    try {
      const url = getFullImageUrl(imagePath);
      // Use proxy route to avoid CORS and auth issues
      const proxyUrl = `/proxy-image?url=${encodeURIComponent(url)}`;
      const res = await fetch(proxyUrl, { cache: "no-store" });
      if (!res.ok) return null;
      const blob = await res.blob();
      const ext = (imagePath.split(".").pop() || "jpg").toLowerCase();
      const filename = `existing_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      return new File([blob], filename, { type: blob.type || `image/${ext}` });
    } catch {
      return null;
    }
  },
  // Fetch all products
  async fetchProducts(): Promise<Product[]> {
    const response = await http.get<ProductApiResponse>(
      API_CONFIG.ADMIN_FUNCTIONS.products.getAll,
      { headers: productsApi.getAuthHeaders() }
    );

    const data = response.data;
    const productsData = Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.products)
        ? data.products
        : Array.isArray(data) ? data : [];

    return productsApi.formatProductsData(productsData);
  },

  // Search products
  async searchProducts(keyword: string): Promise<Product[]> {
    const response = await http.post<ProductSearchResponse>(
      API_CONFIG.USER_FUNCTIONS.products.search,
      { keyword }
    );

    const data = response.data;
    const productsData = Array.isArray((data as any)?.data)
      ? (data as any).data
      : Array.isArray(data) ? (data as any) : [];

    return productsApi.formatProductsData(productsData);
  },

  // Get product by ID with sub images
  async getProductById(productId: string): Promise<Product> {
    const response = await http.get(
      API_CONFIG.ADMIN_FUNCTIONS.products.getById(productId),
      { headers: productsApi.getAuthHeaders() }
    );

    const productData = response.data?.Product || response.data;
    const subImages: string[] = productData?.sub_images || [];
    
    return {
      ...productsApi.formatProductsData([productData])[0],
      sub_images: subImages
    };
  },

  // Add new product
  async addProduct(formData: ProductFormData, mainImage?: File, subImages?: File[]): Promise<void> {
    const endpoint = API_CONFIG.ADMIN_FUNCTIONS.products.add;
    
    const body = new FormData();
    body.append('name', formData.name);
    body.append('price', formData.price);
    body.append('description', formData.description);
    body.append('category_id', formData.category_id);
    body.append('is_in_stock', formData.is_in_stock);

    if (mainImage) {
      body.append('main_image_url', mainImage);
    }

    if (subImages && subImages.length > 0) {
      subImages.forEach((image) => {
        body.append('sub_images[]', image);
      });
    }

    await http.post(endpoint, body, {
      headers: {
        ...this.getAuthHeaders(false),
      },
    });
  },

  // Update existing product
  async updateProduct(
    productId: string, 
    formData: ProductFormData, 
    mainImage?: File, 
    subImages?: File[],
    keepSubImages?: string[],
    removeSubImages?: string[]
  ): Promise<void> {
    const endpoint = API_CONFIG.ADMIN_FUNCTIONS.products.update(productId);
    
    const body = new FormData();
    body.append('name', formData.name);
    body.append('price', formData.price);
    body.append('description', formData.description);
    body.append('category_id', formData.category_id);
    body.append('is_in_stock', formData.is_in_stock);

    if (mainImage) {
      body.append('main_image_url', mainImage);
    }

    if (subImages && subImages.length > 0) {
      subImages.forEach((image) => {
        body.append('sub_images[]', image);
      });
    }

    // Handle existing sub images
    if (keepSubImages && keepSubImages.length > 0) {
      keepSubImages.forEach((path) => {
        body.append('keep_sub_images[]', path);
        body.append('existing_sub_images[]', path);
      });
    }

    if (removeSubImages && removeSubImages.length > 0) {
      removeSubImages.forEach((path) => {
        body.append('remove_sub_images[]', path);
      });
    }

    await http.post(endpoint, body, {
      headers: {
        ...this.getAuthHeaders(false),
      },
    });
  },

  // Delete product
  async deleteProduct(productId: string): Promise<void> {
    const endpoint = API_CONFIG.ADMIN_FUNCTIONS.products.delete(productId);
    
    // Prefer POST with method override to avoid visible 400s from raw DELETE
    try {
      // 1) Try URL query override (some PHP routers rely on query param)
      const urlOverride = `${endpoint}?_method=DELETE`;
      await http.post(urlOverride, undefined as any, {
        headers: {
          ...productsApi.getAuthHeaders(false),
        }
      });
      return;
    } catch (errUrl: any) {
      try {
        const form = new FormData();
        form.append('_method', 'DELETE');
        await http.post(endpoint, form, {
          headers: {
            ...productsApi.getAuthHeaders(false),
          }
        });
        return;
      } catch (errForm: any) {
        try {
          // Fallback to JSON override
          await http.post(endpoint, JSON.stringify({ _method: 'DELETE' }), {
            headers: productsApi.getAuthHeaders()
          });
          return;
        } catch (errJson: any) {
          // Last resort: try raw DELETE
          try {
            await http.delete(endpoint, {
              headers: productsApi.getAuthHeaders()
            });
          } catch (errDel: any) {
            // Some backends accept plain POST
            await http.post(endpoint, undefined as any, {
              headers: productsApi.getAuthHeaders()
            });
          }
        }
      }
    }
  },

  // Remove specific sub image from product: re-upload remaining ones
  async removeSubImage(productId: string, imagePath: string, keepImages: string[]): Promise<void> {
    const endpoint = API_CONFIG.ADMIN_FUNCTIONS.products.update(productId);

    // Prepare body with the remaining images converted to Files
    const body = new FormData();
    const files = await Promise.all((keepImages || []).map((p) => productsApi.urlToFile(p)));
    files.filter((f): f is File => !!f).forEach((file) => body.append("sub_images[]", file));

    await http.post(endpoint, body, {
      headers: {
        ...productsApi.getAuthHeaders(false),
      },
    });
  },

  // Replace a specific sub image with a newly uploaded file (keep others by re-uploading them)
  async replaceSubImage(
    productId: string,
    oldImagePath: string,
    newFile: File,
    existingImages: string[],
  ): Promise<void> {
    const endpoint = API_CONFIG.ADMIN_FUNCTIONS.products.update(productId);

    const body = new FormData();
    // Re-upload all images except the one being replaced
    const keep = (existingImages || []).filter((p) => p !== oldImagePath);
    const files = await Promise.all(keep.map((p) => productsApi.urlToFile(p)));
    files.filter((f): f is File => !!f).forEach((file) => body.append('sub_images[]', file));
    // Append the new replacement file
    body.append('sub_images[]', newFile);

    await http.post(endpoint, body, {
      headers: {
        ...productsApi.getAuthHeaders(false),
      },
    });
  },

  // Add sub images to existing product
  async addSubImages(productId: string, files: File[], existingImages: string[]): Promise<void> {
    const endpoint = API_CONFIG.ADMIN_FUNCTIONS.products.update(productId);
    
    const body = new FormData();
    
    // First, re-upload all existing images by downloading them
    const existingFiles = await Promise.all((existingImages || []).map((p) => productsApi.urlToFile(p)));
    existingFiles.filter((f): f is File => !!f).forEach((file) => body.append('sub_images[]', file));

    // Then append new images
    files.forEach((file) => {
      body.append('sub_images[]', file);
    });

    await http.post(endpoint, body, {
      headers: {
        ...productsApi.getAuthHeaders(false),
      },
    });
  },

  // Format raw product data from API
  formatProductsData(productsData: any[]): Product[] {
    return productsData
      .filter((product): product is Record<string, any> => !!product)
      .map((product): Product => ({
        product_id: String(product.product_id || product.id || ''),
        name: String(product.name || 'Untitled Product'),
        main_image_url: product.main_image_url ? String(product.main_image_url) : '',
        price: String(product.price || product.product_price || '0'),
        description: String(product.description || ''),
        is_in_stock: String(product.is_in_stock || product.stock || '0'),
        category_id: String(product.category_id || ''),
        sub_images: Array.isArray(product.sub_images) ? product.sub_images : undefined,
      }));
  },

  // Get auth headers (will be overridden in component context)
  getAuthHeaders(includeContentType: boolean = true): Record<string, string> {
    return {};
  }
};

// Categories API functions
 export const categoriesApi = {
  // Fetch all categories
  async fetchCategories(): Promise<Category[]> {
    const response = await http.get<CategoryApiResponse>(
      API_CONFIG.ADMIN_FUNCTIONS.categories.getAll,
      { headers: categoriesApi.getAuthHeaders() }
    );

    const data = response.data;
    const categoriesData = Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.categories)
        ? data.categories
        : Array.isArray(data) ? data : [];

    return categoriesApi.formatCategoriesData(categoriesData);
  },

  // Add new category
  async addCategory(formData: CategoryFormData): Promise<void> {
    await http.put(
      API_CONFIG.ADMIN_FUNCTIONS.categories.add,
      JSON.stringify(formData),
      { headers: categoriesApi.getAuthHeaders() }
    );
  },

  // Update existing category
  async updateCategory(categoryId: string, formData: CategoryFormData): Promise<void> {
    await http.post(
      `${API_CONFIG.ADMIN_FUNCTIONS.categories.update}/${categoryId}`,
      JSON.stringify(formData),
      { headers: categoriesApi.getAuthHeaders() }
    );
  },

  // Delete category
  async deleteCategory(categoryId: string): Promise<void> {
    await http.delete(
      `${API_CONFIG.ADMIN_FUNCTIONS.categories.delete}/${categoryId}`,
      { headers: categoriesApi.getAuthHeaders() }
    );
  },

  // Format raw category data from API
  formatCategoriesData(categoriesData: any[]): Category[] {
    return categoriesData
      .filter((category): category is Record<string, any> => !!category)
      .map((category): Category => ({
        category_id: String(category.category_id || category.id || ''),
        name: String(category.name || 'Untitled Category'),
      }));
  },

  // Get auth headers (will be overridden in component context)
  getAuthHeaders(includeContentType: boolean = true): Record<string, string> {
    return {};
  }
};
