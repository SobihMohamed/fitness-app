"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { productsApi, categoriesApi } from "@/lib/api/products";
import { useAdminApi } from "./use-admin-api";
import type { Product, Category, ProductFormData, ProductDeleteTarget } from "@/types";

interface ProductManagementState {
  products: Product[];
  categories: Category[];
  loading: {
    initial: boolean;
    products: boolean;
    categories: boolean;
    submitting: boolean;
    subUploading: boolean;
  };
  searchTerm: string;
  selectedCategory: string;
  currentPage: number;
  pagination: {
    itemsPerPage: number;
  };
}

interface ProductManagementActions {
  fetchProducts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  refreshData: () => Promise<void>;
  setSearchTerm: (term: string) => void;
  setSelectedCategory: (categoryId: string) => void;
  setCurrentPage: (page: number) => void;
  addProduct: (formData: ProductFormData, mainImage?: File, subImages?: File[]) => Promise<void>;
  updateProduct: (productId: string, formData: ProductFormData, mainImage?: File, subImages?: File[]) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  updateCategory: (categoryId: string, name: string) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  getProductDetails: (productId: string) => Promise<Product>;
  removeSubImage: (productId: string, imagePath: string, keepImages: string[]) => Promise<void>;
  addSubImages: (productId: string, files: File[], existingImages: string[]) => Promise<void>;
  replaceSubImage: (productId: string, oldImagePath: string, file: File, existingImages: string[]) => Promise<void>;
}

interface ProductManagementReturn extends ProductManagementState, ProductManagementActions {
  filteredProducts: Product[];
  paginatedProducts: Product[];
  totalPages: number;
  debouncedSearchTerm: string;
  remoteSearchProducts: Product[] | null;
  stats: {
    totalProducts: number;
    inStockProducts: number;
    totalCategories: number;
  };
}

export function useProductManagement(): ProductManagementReturn {
  const { getAuthHeaders, showErrorToast, showSuccessToast } = useAdminApi();
  
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [remoteSearchProducts, setRemoteSearchProducts] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState({
    initial: true,
    products: false,
    categories: false,
    submitting: false,
    subUploading: false,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  
  const pagination = { itemsPerPage: 8 };

  // Override API auth headers
  useEffect(() => {
    const authHeaders = (includeContentType = true) => {
      const headers = getAuthHeaders(includeContentType);
      return headers;
    };

    productsApi.getAuthHeaders = authHeaders;
    categoriesApi.getAuthHeaders = authHeaders;
  }, [getAuthHeaders]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Remote search when debounced term changes
  useEffect(() => {
    const term = debouncedSearchTerm.trim();
    if (!term) {
      setRemoteSearchProducts(null);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const results = await productsApi.searchProducts(term);
        if (!cancelled) {
          setRemoteSearchProducts(results);
          setCurrentPage(1);
        }
      } catch (err: any) {
        if (!cancelled) {
          // Fail silently for search to keep UX smooth
          setRemoteSearchProducts([]);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [debouncedSearchTerm]);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, products: true }));
      const productsData = await productsApi.fetchProducts();
      setProducts(productsData);
    } catch (error: any) {
      if (error?.status === 404) {
        setProducts([]);
        return;
      }
      showErrorToast(error?.message || "Failed to load products");
    } finally {
      setLoading(prev => ({ ...prev, products: false }));
    }
  }, []);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, categories: true }));
      const categoriesData = await categoriesApi.fetchCategories();
      setCategories(categoriesData);
    } catch (error: any) {
      if (error?.status === 404) {
        setCategories([]);
        return;
      }
      showErrorToast(error?.message || "Failed to load categories");
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  }, []);

  // Refresh all data
  const refreshData = useCallback(async () => {
    await Promise.all([fetchProducts(), fetchCategories()]);
  }, [fetchProducts, fetchCategories]);

  // Load initial data
  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem("adminAuth");
        if (!token) {
          showErrorToast("Please login as admin to access this page");
          window.location.href = "/admin/login";
          return;
        }
        await Promise.all([fetchProducts(), fetchCategories()]);
      } catch (error) {
        // Error already handled in individual functions
      } finally {
        setLoading(prev => ({ ...prev, initial: false }));
      }
    };
    init();
  }, [fetchProducts, fetchCategories]);

  // Product CRUD operations
  const addProduct = useCallback(async (formData: ProductFormData, mainImage?: File, subImages?: File[]) => {
    try {
      setLoading(prev => ({ ...prev, submitting: true }));
      await productsApi.addProduct(formData, mainImage, subImages);
      showSuccessToast("Product added successfully!");
      await fetchProducts();
    } catch (error: any) {
      showErrorToast(error?.message || "Failed to add product");
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }));
    }
  }, [fetchProducts]);

  const updateProduct = useCallback(async (productId: string, formData: ProductFormData, mainImage?: File, subImages?: File[]) => {
    try {
      setLoading(prev => ({ ...prev, submitting: true }));
      await productsApi.updateProduct(productId, formData, mainImage, subImages);
      showSuccessToast("Product updated successfully!");
      await fetchProducts();
    } catch (error: any) {
      showErrorToast(error?.message || "Failed to update product");
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }));
    }
  }, [fetchProducts]);

  const deleteProduct = useCallback(async (productId: string) => {
    // Optimistic removal
    setProducts(prev => prev.filter(p => p.product_id !== productId));
    try {
      setLoading(prev => ({ ...prev, submitting: true }));
      await productsApi.deleteProduct(productId);
      showSuccessToast("Product deleted successfully!");
    } catch (error: any) {
      const status = error?.response?.status;
      // If backend returns 400/404 (already deleted or bad request), keep optimistic state
      if (status === 400 || status === 404) {
        showSuccessToast("Product deletion finalized");
        return;
      }
      // For other errors rollback by refreshing list
      await fetchProducts();
      showErrorToast(error?.message || "Failed to delete product");
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }));
    }
  }, [fetchProducts]);

  // Category CRUD operations
  const addCategory = useCallback(async (name: string) => {
    try {
      setLoading(prev => ({ ...prev, submitting: true }));
      await categoriesApi.addCategory({ name });
      showSuccessToast("Category added successfully!");
      await fetchCategories();
    } catch (error: any) {
      showErrorToast(error?.message || "Failed to add category");
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }));
    }
  }, [fetchCategories]);

  const updateCategory = useCallback(async (categoryId: string, name: string) => {
    try {
      setLoading(prev => ({ ...prev, submitting: true }));
      await categoriesApi.updateCategory(categoryId, { name });
      showSuccessToast("Category updated successfully!");
      await fetchCategories();
    } catch (error: any) {
      showErrorToast(error?.message || "Failed to update category");
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }));
    }
  }, [fetchCategories]);

  const deleteCategory = useCallback(async (categoryId: string) => {
    try {
      setLoading(prev => ({ ...prev, submitting: true }));
      await categoriesApi.deleteCategory(categoryId);
      showSuccessToast("Category deleted successfully!");
      
      // Optimistic update
      setCategories(prev => prev.filter(c => c.category_id !== categoryId));
    } catch (error: any) {
      showErrorToast(error?.message || "Failed to delete category");
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }));
    }
  }, []);

  // Product details operations
  const getProductDetails = useCallback(async (productId: string): Promise<Product> => {
    try {
      const productDetails = await productsApi.getProductById(productId);
      
      // Update the product in the list with sub images
      setProducts(prev => prev.map(p => 
        p.product_id === productId ? productDetails : p
      ));
      
      return productDetails;
    } catch (error: any) {
      showErrorToast(error?.message || "Failed to load product details");
      throw error;
    }
  }, []);

  const removeSubImage = useCallback(async (productId: string, imagePath: string, keepImages: string[]) => {
    try {
      setLoading(prev => ({ ...prev, subUploading: true }));
      await productsApi.removeSubImage(productId, imagePath, keepImages);
      showSuccessToast("Image removed from gallery");
      
      // Optimistic local update: keep remaining images
      setProducts(prev => prev.map(p => 
        p.product_id === productId 
          ? { ...p, sub_images: keepImages }
          : p
      ));
      
      // Optional: refresh details to sync exact order/paths from server
      await getProductDetails(productId);
    } catch (error: any) {
      showErrorToast(error?.message || "Failed to remove image");
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, subUploading: false }));
    }
  }, [getProductDetails]);

  const replaceSubImage = useCallback(async (productId: string, oldImagePath: string, file: File, existingImages: string[]) => {
    try {
      setLoading(prev => ({ ...prev, subUploading: true }));
      
      // Replace selected image and keep the rest by re-uploading remaining files
      await productsApi.replaceSubImage(productId, oldImagePath, file, existingImages);
      showSuccessToast("Image replaced successfully");
      
      // Refresh to get the actual state from server
      await getProductDetails(productId);
    } catch (error: any) {
      showErrorToast(error?.message || "Failed to replace image");
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, subUploading: false }));
    }
  }, [getProductDetails]);

  const addSubImages = useCallback(async (productId: string, files: File[], existingImages: string[]) => {
    try {
      setLoading(prev => ({ ...prev, subUploading: true }));
      
      // Since backend deletes all sub images when we send empty sub_images[],
      // we'll just update the local state and call the API to clear all
      await productsApi.addSubImages(productId, files, existingImages);
      showSuccessToast("Images added to gallery");
      
      // Refresh product details to get updated sub_images list
      await getProductDetails(productId);
    } catch (error: any) {
      showErrorToast(error?.message || "Failed to upload images");
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, subUploading: false }));
    }
  }, [getProductDetails]);

  // Filtered products (memoized)
  const filteredProducts = useMemo(() => {
    const term = debouncedSearchTerm.trim();
    const source = term ? (remoteSearchProducts ?? []) : products;
    
    return source.filter(product => 
      selectedCategory === "all" || String(product.category_id) === String(selectedCategory)
    );
  }, [products, remoteSearchProducts, debouncedSearchTerm, selectedCategory]);

  // Paginated products (memoized)
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pagination.itemsPerPage;
    const end = currentPage * pagination.itemsPerPage;
    return filteredProducts.slice(start, end);
  }, [filteredProducts, currentPage, pagination.itemsPerPage]);

  // Total pages
  const totalPages = Math.ceil(filteredProducts.length / pagination.itemsPerPage);

  // Stats (memoized)
  const stats = useMemo(() => ({
    totalProducts: products.length,
    inStockProducts: products.filter(p => p.is_in_stock === "1").length,
    totalCategories: categories.length,
  }), [products, categories]);

  return {
    // State
    products,
    categories,
    loading,
    searchTerm,
    selectedCategory,
    currentPage,
    pagination,
    
    // Computed
    filteredProducts,
    paginatedProducts,
    totalPages,
    debouncedSearchTerm,
    remoteSearchProducts,
    stats,
    
    // Actions
    fetchProducts,
    fetchCategories,
    refreshData,
    setSearchTerm,
    setSelectedCategory,
    setCurrentPage,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    getProductDetails,
    removeSubImage,
    addSubImages,
    replaceSubImage,
  };
}
