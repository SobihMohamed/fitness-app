"use client";

import React, { useEffect, useState, Fragment, useCallback, useMemo } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminLayout } from "@/components/admin/admin-layout";
import { useAdminApi } from "@/hooks/admin/use-admin-api";
import { getHttpClient } from "@/lib/http";
import { Plus, Search, Edit3, Trash2, Save, X, Package, Tag, Upload, UploadCloud, ImageIcon, 
  Images, Info, Sparkles, CheckCircle, AlertCircle, Loader2, ChevronDown, ChevronLeft, 
  ChevronRight, DollarSign, PlusCircle, FolderTree, Filter, FileText, BarChart2, 
  Settings, ShoppingBag, Eye, RefreshCcw } from "lucide-react";
import { API_CONFIG } from "@/config/api";
 

const { BASE_URL: API_BASE } = API_CONFIG;

type Category = {
  category_id: string;
  name: string;
};

type Product = {
  product_id: string;
  name: string;
  main_image_url: string;
  price: string;
  description: string;
  is_in_stock: string;
  category_id: string;
  sub_images?: string[];
};

type SubImageState = {
  replacements: Record<number, File | null>;
};

const CATEGORY_SUGGESTIONS = [
  "Protein Supplements",
  "Pre-Workout",
  "Post-Workout",
  "Vitamins",
  "Amino Acids",
  "Weight Loss",
  "Mass Gainers",
  "BCAA",
  "Creatine",
  "Omega-3",
  "Multivitamins",
  "Protein Bars",
];


export default function ProductsManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [detailsProduct, setDetailsProduct] = useState<Product | null>(null);
  const [detailsSubImagesOrder, setDetailsSubImagesOrder] = useState<string[]>([]);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [subImageEdits, setSubImageEdits] = useState<
    Record<string, SubImageState>
  >({});

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "category" | "product";
    id: string;
    name: string;
  } | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    price: "",
    is_in_stock: "",
    description: "",
    main_image_url: "",
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedMainImage, setSelectedMainImage] = useState<File | null>(null);

  // Category management
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [showCategoryGenerator, setShowCategoryGenerator] = useState(false);

  // Loading states
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [currentCategoryPage, setCurrentCategoryPage] = useState(1);
  const itemsPerPage = 8;
  const categoriesPerPage = 6;

  const { getAuthHeaders, parseResponse, showSuccessToast, showErrorToast, showInfoToast } =
    useAdminApi();
  const http = getHttpClient();

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([
          (async () => {
            try {
              const { data } = await http.get(
                `${API_CONFIG.ADMIN_FUNCTIONS.categories.getAll}`
              );
              setCategories(data.data || []);
            } catch (err) {
              showErrorToast("Network error while loading categories");
            }
          })(),
          fetchProducts(),
        ]);
      } finally {
        setInitialLoading(false);
      }
    };
    initializeData();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data: result } = await http.get(
        `${API_CONFIG.ADMIN_FUNCTIONS.products.getAll}`
      );
      const data = result.data || [];
      const formattedData: Product[] = data.map((product: any) => ({
        product_id: product.product_id,
        name: product.name,
        main_image_url: product.main_image_url || "",
        price: product.price,
        description: product.description,
        is_in_stock: product.is_in_stock || "0",
        category_id: product.category_id,
      }));
      setProducts(formattedData);
    } catch (err: any) {
      if (err?.status === 404) {
        setProducts([]);
        return;
      }
      showErrorToast(err?.message || "Network error while loading products");
    }
  };

  // Ensure product details (sub-images) are loaded before opening details dialog
  const ensureProductDetails = useCallback(
    async (product: Product): Promise<Product> => {
      // Only skip fetching if we already have a non-empty sub_images array
      if (product.sub_images && product.sub_images.length > 0) return product;
      try {
        const { data: subJson } = await http.get(
          `${API_CONFIG.ADMIN_FUNCTIONS.products.getById(product.product_id)}`
        );
        const subImages: string[] = subJson?.Product?.sub_images || [];
        const updated = { ...product, sub_images: subImages } as Product;
        // update in products list too
        setProducts((prev) =>
          prev.map((p) => (p.product_id === product.product_id ? updated : p))
        );
        return updated;
      } catch {
        return product;
      }
    },
    [getAuthHeaders]
  );

  const openDetails = useCallback(
    async (product: Product) => {
      const withDetails = await ensureProductDetails(product);
      setDetailsProduct(withDetails);
      setDetailsSubImagesOrder(withDetails.sub_images || []);
    },
    [ensureProductDetails]
  );

  // Debounce search input to minimize filtering work on each keystroke
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchTerm(searchTerm), 250);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Prevent background (page) scroll when a dialog/lightbox is open
  useEffect(() => {
    const modalOpen = !!detailsProduct || isAddDialogOpen || showDeleteConfirm || !!previewImageUrl;
    const original = document.body.style.overflow;
    if (modalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = original || '';
    }
    return () => {
      document.body.style.overflow = original || '';
    };
  }, [detailsProduct, isAddDialogOpen, showDeleteConfirm, previewImageUrl]);

  const filteredProducts = useMemo(() => {
    const st = debouncedSearchTerm.toLowerCase();
    return products.filter(
      (p: Product) =>
        p.name?.toLowerCase().includes(st) &&
        (selectedCategory === "all" || p.category_id?.toString() === selectedCategory)
    );
  }, [products, debouncedSearchTerm, selectedCategory]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredProducts, currentPage, itemsPerPage]);

  const totalCategoryPages = Math.ceil(categories.length / categoriesPerPage);
  const paginatedCategories = useMemo(() => {
    return categories.slice(
      (currentCategoryPage - 1) * categoriesPerPage,
      currentCategoryPage * categoriesPerPage
    );
  }, [categories, currentCategoryPage, categoriesPerPage]);

  const getSubImageState = useCallback(
    (productId: string): SubImageState => {
      return subImageEdits[productId] || { replacements: {} };
    },
    [subImageEdits]
  );

  const replaceSubImageFor = useCallback(
    (productId: string, index: number, file: File | null) => {
      setSubImageEdits((prev) => {
        const current = getSubImageState(productId);
        const nextRepl = { ...current.replacements };
        if (file) {
          nextRepl[index] = file;
        } else {
          delete nextRepl[index];
        }
        return {
          ...prev,
          [productId]: { replacements: nextRepl },
        };
      });
    },
    [getSubImageState]
  );

  // Add new images at the end of the gallery in details dialog
  const addNewSubImages = useCallback((productId: string, files: File[]) => {
    if (!files || files.length === 0) return;
    setSubImageEdits((prev) => {
      const current = getSubImageState(productId);
      const nextRepl = { ...current.replacements };
      const startIndex = (detailsSubImagesOrder?.length || 0);
      files.forEach((file, i) => {
        nextRepl[startIndex + i] = file;
      });
      return { ...prev, [productId]: { replacements: nextRepl } };
    });
    setDetailsSubImagesOrder((prev) => {
      const base = prev?.slice() || [];
      const addedPlaceholders = files.map((_, i) => `__new__${Date.now()}_${i}`);
      return [...base, ...addedPlaceholders];
    });
  }, [detailsSubImagesOrder, getSubImageState]);

  // Convert an image URL (to backend) to a File by fetching via our proxy API to avoid CORS
  const urlToFile = useCallback(async (url: string, filenameHint: string): Promise<File> => {
    const proxied = `/proxy-image?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxied);
    if (!res.ok) {
      throw new Error(`Failed to fetch existing image: ${res.status}`);
    }
    const blob = await res.blob();
    const inferredType = blob.type || 'image/jpeg';
    // create a deterministic filename to keep order stable
    const safeName = filenameHint.replace(/[^a-zA-Z0-9_.-]/g, '_');
    return new File([blob], safeName, { type: inferredType });
  }, []);

  // Removed row expansion in favor of centered details dialog

  const saveInlineChanges = async (product: Product) => {
    const state = getSubImageState(product.product_id);

    if (Object.keys(state.replacements).length === 0) {
      showInfoToast("No changes to save");
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      // Ensure we have the latest sub_images list
      let fullProduct: Product = product;
      if (!fullProduct.sub_images || fullProduct.sub_images.length === 0) {
        try {
          const res = await fetch(
            `${API_CONFIG.ADMIN_FUNCTIONS.products.getById(product.product_id)}`,
            { headers: getAuthHeaders() }
          );
          if (res.ok) {
            const subJson = await res.json();
            const subImages: string[] = subJson?.Product?.sub_images || [];
            fullProduct = { ...product, sub_images: subImages };
          }
        } catch {}
      }
      formData.append("name", fullProduct.name || "");
      formData.append("price", fullProduct.price || "");
      formData.append("description", fullProduct.description || "");
      formData.append("category_id", fullProduct.category_id || "");
      formData.append("is_in_stock", fullProduct.is_in_stock || "0");

      // Build the final list of sub-images as Files in the current order: keep unchanged ones by fetching them,
      // and include newly selected replacements.
      // We rely on detailsProduct having sub_images loaded before opening this dialog.
      const existing = (detailsSubImagesOrder && detailsSubImagesOrder.length > 0
        ? detailsSubImagesOrder
        : (fullProduct.sub_images || [])
      ).slice();

      // Preserve ordering: for each original index, take replacement if present,
      // otherwise fetch the existing one as a File. If any fetch fails, abort.
      const filesToUpload: File[] = await (async () => {
        const tasks: Promise<File>[] = [];
        for (let i = 0; i < existing.length; i++) {
          const maybeReplacement = state.replacements[i] || null;
          if (maybeReplacement) {
            tasks.push(Promise.resolve(maybeReplacement));
          } else {
            const path = existing[i] || "";
            const url = `${API_BASE}${path}`;
            const extFromPath = (() => {
              const m = path.match(/\.([a-zA-Z0-9]+)(?:\?|#|$)/);
              return m ? m[1].toLowerCase() : "jpg";
            })();
            const filename = `existing_${fullProduct.product_id}_${i}.${extFromPath}`;
            tasks.push(urlToFile(url, filename));
          }
        }
        try {
          return await Promise.all(tasks);
        } catch (err) {
          showErrorToast("Failed to include existing images. Please try again.");
          throw err;
        }
      })();

      // If there are replacements beyond the original length (rare), include them too
      Object.entries(state.replacements).forEach(([idxStr, file]) => {
        const idx = Number(idxStr);
        if (idx >= existing.length && file) {
          filesToUpload.push(file);
        }
      });

      // Defensive checks to avoid wiping gallery unintentionally
      if (existing.length > 0 && filesToUpload.length < existing.length) {
        showErrorToast("Could not include all existing images. Please try again.");
        setIsSubmitting(false);
        return;
      }
      if (filesToUpload.length === 0) {
        showErrorToast("No images to upload. Please try again.");
        setIsSubmitting(false);
        return;
      }

      showInfoToast(`Uploading ${filesToUpload.length} gallery image(s)...`);
      filesToUpload.forEach((f) => formData.append("sub_images[]", f));

      const response = await fetch(
        `${API_CONFIG.ADMIN_FUNCTIONS.products.update(fullProduct.product_id)}`,
        {
          method: "POST",
          headers: { Authorization: getAuthHeaders().Authorization },
          body: formData,
        }
      );

      let result;
      const responseText = await response.text();
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Invalid response from server: ${responseText}`);
      }

      if (!response.ok) {
        throw new Error(result.message || `Failed to update product images`);
      }

      await fetchProducts();
      setSubImageEdits((prev) => ({
        ...prev,
        [product.product_id]: { replacements: {} },
      }));
      setDetailsProduct(null);
      showSuccessToast(result.message || "Product images updated successfully");
    } catch (error) {
      console.error("Error updating product images:", error);
      showErrorToast("Failed to update product images");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Category management functions
  const addCategory = async () => {
    if (!newCategoryName.trim()) {
      showErrorToast("Category name is required");
      return;
    }

    const existingCategory = categories.find(
      (cat) =>
        cat.name.toLowerCase().trim() === newCategoryName.toLowerCase().trim()
    );
    if (existingCategory) {
      showErrorToast("A category with this name already exists");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(
        `${API_CONFIG.ADMIN_FUNCTIONS.categories.add}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({ name: newCategoryName }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        showSuccessToast(`Category "${newCategoryName}" added successfully!`);
        setNewCategoryName("");
        const refreshRes = await fetch(
          `${API_CONFIG.ADMIN_FUNCTIONS.categories.getAll}`,
          {
            headers: getAuthHeaders(),
          }
        );
        const refreshData = await refreshRes.json();
        if (refreshRes.ok) {
          setCategories(refreshData.data || []);
        }
      } else {
        showErrorToast(data.message || "Failed to add category");
      }
    } catch (err) {
      showErrorToast("Network error while adding category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateCategory = async () => {
    if (!editingCategoryName.trim()) {
      showErrorToast("Category name is required");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(
        `${API_CONFIG.ADMIN_FUNCTIONS.categories.update}/${editingCategoryId}`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ name: editingCategoryName.trim() }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        showSuccessToast("Category updated successfully!");
        setEditingCategoryId(null);
        setEditingCategoryName("");
        const refreshRes = await fetch(
          `${API_CONFIG.ADMIN_FUNCTIONS.categories.getAll}`,
          {
            headers: getAuthHeaders(),
          }
        );
        const refreshData = await refreshRes.json();
        if (refreshRes.ok) {
          setCategories(refreshData.data || []);
        }
      } else {
        showErrorToast(data.message || "Failed to update category");
      }
    } catch (err) {
      showErrorToast("Network error while updating category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteCategory = (id: string) => {
    const categoryName =
      categories.find((cat) => cat.category_id === id)?.name || "this category";
    const productsInCategory = products.filter((p) => p.category_id === id);
    if (productsInCategory.length > 0) {
      showErrorToast(
        `Cannot delete category "${categoryName}". It contains ${productsInCategory.length} product(s).`
      );
      return;
    }
    setDeleteTarget({ type: "category", id, name: categoryName });
    setShowDeleteConfirm(true);
  };

  const deleteCategory = async () => {
    if (!deleteTarget || deleteTarget.type !== "category") return;
    try {
      setIsSubmitting(true);
      const res = await fetch(
        `${API_CONFIG.ADMIN_FUNCTIONS.categories.delete}/${deleteTarget.id}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );
      const data = await res.json();
      if (res.ok) {
        showSuccessToast(
          `Category "${deleteTarget.name}" deleted successfully!`
        );
        setCategories(
          categories.filter((cat) => cat.category_id !== deleteTarget.id)
        );
      } else {
        showErrorToast(data.message || "Failed to delete category");
      }
    } catch (err) {
      showErrorToast("Network error while deleting category");
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    }
  };

  const generateCategories = () => {
    const existingNames = categories.map((cat) => cat.name.toLowerCase());
    const newCategories = CATEGORY_SUGGESTIONS.filter(
      (suggestion) => !existingNames.includes(suggestion.toLowerCase())
    ).slice(0, 5);

    if (newCategories.length === 0) {
      showInfoToast("All suggested categories already exist!");
      return;
    }

    showInfoToast(`Generated ${newCategories.length} category suggestions!`);
    setShowCategoryGenerator(true);
  };

  const addGeneratedCategory = async (categoryName: string) => {
    try {
      setIsSubmitting(true);
      const res = await fetch(
        `${API_CONFIG.ADMIN_FUNCTIONS.categories.add}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({ name: categoryName }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        showSuccessToast(`Category "${categoryName}" added successfully!`);
        const refreshRes = await fetch(
          `${API_CONFIG.ADMIN_FUNCTIONS.categories.getAll}`,
          {
            headers: getAuthHeaders(),
          }
        );
        const refreshData = await refreshRes.json();
        if (refreshRes.ok) {
          setCategories(refreshData.data || []);
        }
      } else {
        showErrorToast(data.message || "Failed to add category");
      }
    } catch (err) {
      showErrorToast("Network error while adding category");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Product management functions
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      showErrorToast("Product name and price are required");
      return;
    }
    if (!formData.category_id) {
      showErrorToast("Please select a category");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("price", formData.price);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("category_id", formData.category_id);
    formDataToSend.append("is_in_stock", formData.is_in_stock);

    if (selectedMainImage) {
      formDataToSend.append("main_image_url", selectedMainImage);
    }

    // If editing and the user selected new gallery images, we must include
    // the unchanged existing images as Files too, so backend replace-all keeps them.
    if (editingProduct) {
      if (selectedImages.length > 0) {
        // Ensure we have the latest sub_images for the product
        let subImages: string[] = editingProduct.sub_images || [];
        if (!subImages || subImages.length === 0) {
          try {
            const res = await fetch(
              `${API_CONFIG.ADMIN_FUNCTIONS.products.getById(editingProduct.product_id)}`,
              { headers: getAuthHeaders() }
            );
            if (res.ok) {
              const subJson = await res.json();
              subImages = subJson?.Product?.sub_images || [];
            }
          } catch {}
        }

        // Fetch unchanged existing images as Files in parallel
        const existingFiles: File[] = await (async () => {
          const tasks: Promise<File>[] = subImages.map((path, idx) => {
            const url = `${API_BASE}${path || ""}`;
            const ext = (() => {
              const m = (path || "").match(/\.([a-zA-Z0-9]+)(?:\?|#|$)/);
              return m ? m[1].toLowerCase() : "jpg";
            })();
            const filename = `existing_${editingProduct.product_id}_${idx}.${ext}`;
            return urlToFile(url, filename);
          });
          return tasks.length ? Promise.all(tasks) : [];
        })();

        // Append existing first (to keep order), then newly selected additions
        existingFiles.forEach((f) => formDataToSend.append("sub_images[]", f));
        selectedImages.forEach((image) => formDataToSend.append("sub_images[]", image));
      }
      // If no new gallery images were selected while editing, do NOT append sub_images[] at all
      // so the backend keeps old images unchanged.
    } else {
      // Creating a new product: just append selected gallery images if any
      selectedImages.forEach((image) => {
        formDataToSend.append("sub_images[]", image);
      });
    }

    try {
      setIsSubmitting(true);
      const url = editingProduct
        ? API_CONFIG.ADMIN_FUNCTIONS.products.update(
            editingProduct.product_id
          )
        : API_CONFIG.ADMIN_FUNCTIONS.products.add;
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: getAuthHeaders().Authorization },
        body: formDataToSend,
      });
      const result = await parseResponse(res);
      if (!res.ok) throw new Error(result.message || "Failed to save product");

      showSuccessToast(
        editingProduct
          ? "Product updated successfully!"
          : "Product added successfully!"
      );
      await fetchProducts();
      setFormData({
        name: "",
        category_id: "",
        price: "",
        is_in_stock: "",
        description: "",
        main_image_url: "",
      });
      setSelectedImages([]);
      setSelectedMainImage(null);
      setEditingProduct(null);
      setIsAddDialogOpen(false);
    } catch (err: any) {
      showErrorToast(err.message || "Network error while saving product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteProduct = (id: string) => {
    const product = products.find((p) => p.product_id === id);
    const productName = product?.name || "this product";
    setDeleteTarget({ type: "product", id, name: productName });
    setShowDeleteConfirm(true);
  };

  const deleteProduct = async () => {
    if (!deleteTarget || deleteTarget.type !== "product") return;
    try {
      setIsSubmitting(true);
      await http.delete(
        `${API_CONFIG.ADMIN_FUNCTIONS.products.delete(deleteTarget.id)}`
      );
      showSuccessToast("Product deleted successfully!");
      setProducts((prev) =>
        prev.filter((p) => p.product_id !== deleteTarget.id)
      );
    } catch (err: any) {
      showErrorToast(err?.message || "Network error while deleting product");
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    }
  };

  const handleSubImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        showErrorToast(`Image ${file.name} file size must be less than 5MB`);
        continue;
      }
      if (!file.type.startsWith("image/")) {
        showErrorToast(`Please select a valid image file for ${file.name}`);
        continue;
      }
      validFiles.push(file);
    }
    setSelectedImages((prev) => {
      const combined = [...prev, ...validFiles];
      const seen = new Set<string>();
      return combined.filter((f) => {
        const key = `${f.name}-${f.size}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    });
    if (e.target) e.target.value = "";
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = (e.target.files || [])[0] || null;
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showErrorToast(`Image ${file.name} file size must be less than 5MB`);
        return;
      }
      if (!file.type.startsWith("image/")) {
        showErrorToast(`Please select a valid image file for ${file.name}`);
        return;
      }
    }
    setSelectedMainImage(file);
  };

  const startEditCategory = (category: Category) => {
    setEditingCategoryId(category.category_id);
    setEditingCategoryName(category.name);
  };

  const cancelEditCategory = () => {
    setEditingCategoryId(null);
    setEditingCategoryName("");
  };

  // Use initialLoading without rendering a page-level loader (layout handles common loading)
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  initialLoading;

  return (
    <AdminLayout>
      <div className="space-y-8 p-8 bg-gradient-to-br from-slate-50 to-white min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-start p-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-4">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <Package className="h-8 w-8 text-indigo-600" />
              </div>
              Products Management
            </h1>
            <p className="text-slate-600 mt-4 text-lg">
              Manage your product catalog, categories, and inventory with ease
            </p>
          </div>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 px-7 py-3 text-base"
          >
            <Plus className="h-5 w-5" />
            Add New Product
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-indigo-100 hover:shadow-xl transition-all duration-200">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-indigo-700 mb-1">Total Products</p>
                  <p className="text-3xl font-bold text-indigo-900">{products.length}</p>
                </div>
                <div className="p-3 bg-indigo-200 rounded-full">
                  <Package className="h-8 w-8 text-indigo-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-all duration-200">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 mb-1">In Stock</p>
                  <p className="text-3xl font-bold text-blue-900">{products.filter((p) => p.is_in_stock === "1").length}</p>
                </div>
                <div className="p-3 bg-blue-200 rounded-full">
                  <CheckCircle className="h-8 w-8 text-blue-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-all duration-200">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700 mb-1">Categories</p>
                  <p className="text-3xl font-bold text-purple-900">{categories.length}</p>
                </div>
                <div className="p-3 bg-purple-200 rounded-full">
                  <Tag className="h-8 w-8 text-purple-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Management */}
        <Card className="border-0 shadow-lg bg-white overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-8 py-6 border-b border-blue-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Tag className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg text-slate-800 font-semibold">
                    Category Management
                  </CardTitle>
                  <p className="text-sm text-slate-500 mt-0.5">Organize your products with custom categories</p>
                </div>
              </div>
              <Button
                onClick={generateCategories}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 hover:bg-blue-50 border-blue-200 bg-white shadow-sm transition-all duration-200 hover:shadow"
              >
                <Sparkles className="h-4 w-4 text-blue-600" />
                Generate Categories
              </Button>
            </div>
          </div>
          <CardContent className="space-y-8 p-8">
            {/* Add Category Form */}
            <div className="flex gap-4 bg-slate-50 p-6 rounded-lg border border-slate-100">
              <Input
                placeholder="Enter category name..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addCategory()}
                disabled={isSubmitting}
                className="flex-1 h-10 border-slate-200 focus:border-blue-500 bg-white shadow-sm"
              />
              <Button
                onClick={addCategory}
                disabled={isSubmitting || !newCategoryName.trim()}
                className="bg-blue-600 hover:bg-blue-700 shadow-sm transition-all duration-200 hover:shadow"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Add Category
              </Button>
            </div>

            {/* Category Generator */}
            {showCategoryGenerator && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    <h4 className="font-semibold text-slate-900">
                      Suggested Categories
                    </h4>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCategoryGenerator(false)}
                    className="hover:bg-blue-100/50 rounded-full h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {CATEGORY_SUGGESTIONS.filter(
                    (suggestion) =>
                      !categories.some(
                        (cat) =>
                          cat.name.toLowerCase() === suggestion.toLowerCase()
                      )
                  )
                    .slice(0, 6)
                    .map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => addGeneratedCategory(suggestion)}
                        disabled={isSubmitting}
                        className="justify-start text-left h-auto py-2 px-3 hover:bg-blue-50"
                      >
                        {suggestion}
                      </Button>
                    ))}
                </div>
              </div>
            )}

            {/* Categories Grid */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <Tag className="h-3.5 w-3.5" />
                Your Categories ({categories.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {paginatedCategories.map((cat) => (
                  <div
                    key={cat.category_id}
                    className="group relative bg-white rounded-lg p-4 border border-slate-200 transition-all duration-200 hover:shadow-md hover:border-blue-200 overflow-hidden"
                  >
                    {editingCategoryId === cat.category_id ? (
                      <div className="space-y-3">
                        <Input
                          value={editingCategoryName}
                          onChange={(e) => setEditingCategoryName(e.target.value)}
                          onKeyPress={(e) =>
                            e.key === "Enter" && updateCategory()
                          }
                          onKeyDown={(e) =>
                            e.key === "Escape" && cancelEditCategory()
                          }
                          disabled={isSubmitting}
                          className="border-blue-300 focus:border-blue-500 shadow-sm"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={updateCategory}
                            disabled={isSubmitting}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            {isSubmitting ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <Save className="h-4 w-4 mr-2" />
                            )}
                            Save
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={cancelEditCategory}
                            disabled={isSubmitting}
                            className="border-slate-200 hover:bg-slate-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span className="font-medium text-slate-900 truncate">
                            {cat.name}
                          </span>
                        </div>
                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditCategory(cat)}
                            disabled={isSubmitting}
                            className="h-8 w-8 p-0 hover:bg-blue-50 rounded-full"
                          >
                            <Edit3 className="h-3.5 w-3.5 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => confirmDeleteCategory(cat.category_id)}
                            disabled={isSubmitting}
                            className="h-8 w-8 p-0 hover:bg-red-50 rounded-full"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    )}
                    <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-blue-100 rounded-full opacity-10"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Pagination */}
            {totalCategoryPages > 1 && (
              <div className="flex justify-center items-center gap-1.5 mt-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentCategoryPage(Math.max(1, currentCategoryPage - 1))}
                  disabled={currentCategoryPage === 1}
                  className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {Array.from({ length: totalCategoryPages }, (_, i) => {
                  // Show first page, last page, and pages around current page
                  const pageNum = i + 1;
                  const isCurrentPage = currentCategoryPage === pageNum;
                  const isFirstPage = pageNum === 1;
                  const isLastPage = pageNum === totalCategoryPages;
                  const isNearCurrentPage = Math.abs(currentCategoryPage - pageNum) <= 1;
                  
                  if (isFirstPage || isLastPage || isNearCurrentPage) {
                    return (
                      <Button
                        key={i}
                        variant={isCurrentPage ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setCurrentCategoryPage(pageNum)}
                        className={`w-8 h-8 rounded-full ${
                          isCurrentPage
                            ? "bg-blue-600 hover:bg-blue-700 text-white font-medium"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        }`}
                      >
                        {pageNum}
                      </Button>
                    );
                  } else if (
                    (pageNum === 2 && currentCategoryPage > 3) ||
                    (pageNum === totalCategoryPages - 1 && currentCategoryPage < totalCategoryPages - 2)
                  ) {
                    // Show ellipsis
                    return <span key={i} className="text-slate-400">...</span>;
                  }
                  
                  return null;
                })}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentCategoryPage(Math.min(totalCategoryPages, currentCategoryPage + 1))}
                  disabled={currentCategoryPage === totalCategoryPages}
                  className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Search */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-6 px-8 pt-6">
            <CardTitle className="flex items-center gap-3 text-slate-800">
              <Search className="h-5 w-5 text-indigo-600" />
              Search Products
            </CardTitle>
            <CardDescription className="text-slate-600 mt-2">
              Find products by name, description, or filter by category
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                <Input
                  placeholder="Search products by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-base border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div className="w-full md:w-64">
                <Select
                  value={selectedCategory}
                  onValueChange={(val) => setSelectedCategory(val)}
                >
                  <SelectTrigger className="w-full h-12 text-base border-slate-200 focus:border-indigo-500 focus:ring-indigo-500">
                    <div className="flex items-center gap-3">
                      <Tag className="h-5 w-5 text-slate-500" />
                      <SelectValue placeholder="Filter by category" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-lg border-slate-200 shadow-lg">
                    <SelectItem value="all" className="flex items-center gap-3 py-3 text-base hover:bg-indigo-50">
                      <span className="text-sm px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">All</span>
                      <span>All Categories</span>
                    </SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.category_id} value={cat.category_id} className="py-3 text-base hover:bg-indigo-50">
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {(searchTerm || selectedCategory !== "all") && (
              <div className="mt-4 flex items-center gap-3">
                <span className="text-sm text-slate-600">
                  Found {filteredProducts.length} products
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                  }}
                  className="h-7 px-3 text-xs hover:bg-slate-50"
                >
                  Clear Search
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card className="border-0 shadow-lg rounded-xl overflow-hidden">
          <CardHeader className="bg-white px-6 py-4 border-b border-slate-100">
            <CardTitle className="text-lg font-semibold text-slate-800">Products</CardTitle>
            <CardDescription className="text-sm text-slate-500">Manage your product inventory</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 border-b border-slate-200">
                    <TableHead className="w-16 font-medium text-slate-600 py-3 px-6">
                      ID
                    </TableHead>
                    <TableHead className="w-20 font-medium text-slate-600 py-3 px-6">
                      Image
                    </TableHead>
                    <TableHead className="min-w-[200px] font-medium text-slate-600 py-3 px-6">
                      Product Name
                    </TableHead>
                    <TableHead className="w-24 font-medium text-slate-600 py-3 px-6">
                      Price
                    </TableHead>
                    <TableHead className="min-w-[150px] font-medium text-slate-600 py-3 px-6">
                      Category
                    </TableHead>
                    <TableHead className="w-24 font-medium text-slate-600 py-3 px-6">
                      Stock
                    </TableHead>
                    <TableHead className="w-32 text-center font-medium text-slate-600 py-3 px-6">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProducts.map((product: Product, index) => {
                    const category = categories.find(
                      (c) => c.category_id === product.category_id
                    );

                    return (
                      <TableRow
                        key={product.product_id}
                        className="hover:bg-slate-50/70 transition-colors duration-200 border-b border-slate-100"
                      >
                        <TableCell className="font-medium text-slate-500 py-4 px-6">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          {product.main_image_url ? (
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden shadow-sm border border-slate-200 transition-transform hover:scale-105">
                              <img
                                src={`${API_BASE}${product.main_image_url}`}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
                              <ImageIcon className="h-6 w-6 text-slate-400" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <div>
                            <p className="font-medium text-slate-800 mb-1 line-clamp-2">
                              {product.name}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <Badge
                            variant="default"
                            className="bg-indigo-100/80 text-indigo-700 hover:bg-indigo-100 px-2.5 py-1 rounded-md font-medium"
                          >
                            {product.price} EGP
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          {category && (
                            <Badge
                              variant="secondary"
                              className="bg-slate-100/80 text-slate-700 hover:bg-slate-100 px-2.5 py-1 rounded-md font-medium"
                            >
                              {category.name}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <Badge
                            variant={
                              product.is_in_stock === "1"
                                ? "default"
                                : "secondary"
                            }
                            className={
                              product.is_in_stock === "1"
                                ? "bg-emerald-100/80 text-emerald-700 hover:bg-emerald-100 px-2.5 py-1 rounded-md font-medium"
                                : "bg-red-100/80 text-red-700 hover:bg-red-100 px-2.5 py-1 rounded-md font-medium"
                            }
                          >
                            {product.is_in_stock === "1" ? "In Stock" : "Out of Stock"}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <div className="flex items-center justify-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDetails(product)}
                              className="h-9 px-4 hover:bg-indigo-50 border-indigo-200 text-indigo-700 bg-white shadow-sm hover:shadow-md transition-all duration-200 rounded-full font-medium"
                            >
                              <Eye className="h-3.5 w-3.5 mr-1.5 text-indigo-600" />
                              Details
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* No results */}
              {filteredProducts.length === 0 && (
                <div className="text-center py-24 px-6">
                  <div className="p-6 bg-slate-100/70 rounded-full w-28 h-28 mx-auto mb-8 flex items-center justify-center shadow-inner">
                    <Package className="h-12 w-12 text-slate-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-slate-800 mb-4">
                    {searchTerm || selectedCategory !== "all" ? "No products found" : "No products yet"}
                  </h3>
                  <p className="text-slate-500 mb-8 max-w-md mx-auto leading-relaxed">
                    {searchTerm || selectedCategory !== "all"
                      ? "Try adjusting your search criteria to find what you're looking for"
                      : "Get started by adding your first product to the platform"}
                  </p>
                  {!searchTerm && selectedCategory === "all" && (
                    <Button
                      onClick={() => setIsAddDialogOpen(true)}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-6 py-6 h-auto rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      <Plus className="h-5 w-5" />
                      Add Your First Product
                    </Button>
                  )}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 py-6 px-4 border-t border-slate-100 bg-white">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="h-9 w-9 rounded-full border-slate-200"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  {Array.from({ length: totalPages }, (_, i) => {
                    // Show first page, last page, and pages around current page
                    const pageNum = i + 1;
                    const isCurrentPage = currentPage === pageNum;
                    const isFirstPage = pageNum === 1;
                    const isLastPage = pageNum === totalPages;
                    const isNearCurrent = Math.abs(pageNum - currentPage) <= 1;
                    
                    if (isFirstPage || isLastPage || isNearCurrent) {
                      return (
                        <Button
                          key={i}
                          variant={isCurrentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-9 h-9 rounded-full ${
                            isCurrentPage
                              ? "bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                              : "hover:bg-slate-50 border-slate-200"
                          }`}
                        >
                          {pageNum}
                        </Button>
                      );
                    } else if (
                      (pageNum === 2 && currentPage > 3) ||
                      (pageNum === totalPages - 1 && currentPage < totalPages - 2)
                    ) {
                      return <div key={i} className="px-1">...</div>;
                    }
                    return null;
                  })}
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="h-9 w-9 rounded-full border-slate-200"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Product Details Dialog */}
        <Dialog open={!!detailsProduct} onOpenChange={() => setDetailsProduct(null)}>
          <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto overflow-x-hidden p-0 rounded-2xl border-none shadow-2xl bg-white">
            <DialogHeader className="p-12 bg-gradient-to-br from-blue-600 to-indigo-700 border-b relative overflow-hidden">
              {/* Optimized background elements */}
              <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] opacity-30"></div>
              <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute -top-8 -left-8 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
              <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-500/30 rounded-full blur-3xl"></div>
              
              <DialogTitle className="flex items-center gap-4 text-3xl font-bold relative z-10 text-white">
                <div className="p-3.5 bg-white/20 backdrop-blur-sm rounded-xl shadow-sm">
                  <Package className="h-7 w-7 text-white" />
                </div>
                Product Details
              </DialogTitle>
              <DialogDescription className="text-blue-100/90 relative z-10 mt-3 text-lg max-w-2xl">
                View complete product information and manage gallery images
              </DialogDescription>
            </DialogHeader>

            {detailsProduct && (
              <div className="space-y-8">
                {/* Top summary */}
                <div className="bg-white px-12 py-12 flex flex-col md:flex-row md:items-start justify-between gap-12">
                  <div className="flex flex-col md:flex-row items-start gap-10 w-full">
                    {/* Product image with enhanced hover effects */}
                    <div className="w-full md:w-64 h-64 relative rounded-2xl overflow-hidden border border-slate-200 shadow-lg transition-all duration-300 hover:shadow-xl group">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                      <Image
                        src={
                          detailsProduct.main_image_url
                            ? `${API_BASE}${detailsProduct.main_image_url}`
                            : "/placeholder.svg"
                        }
                        alt={detailsProduct.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 256px"
                        priority
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute bottom-0 left-0 right-0 p-4 z-20 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        <span className="text-xs text-white/90 font-medium px-3 py-1.5 bg-black/40 rounded-full backdrop-blur-sm">Main product image</span>
                      </div>
                    </div>
                    
                    {/* Product details with improved typography and spacing */}
                    <div className="flex-1 space-y-6">
                      <h3 className="font-bold text-slate-800 text-3xl tracking-tight">
                        {detailsProduct.name}
                      </h3>
                      <p className="text-slate-600 text-base leading-relaxed max-w-3xl">
                        {detailsProduct.description || "No description available for this product."}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-6">
                        {categories.find((c) => c.category_id === detailsProduct.category_id) && (
                          <Badge variant="secondary" className="text-sm bg-blue-50/80 text-blue-700 border border-blue-100 px-3 py-1.5 rounded-full font-medium">
                            <Tag className="h-3.5 w-3.5 mr-1.5" />
                            {categories.find((c) => c.category_id === detailsProduct.category_id)?.name}
                          </Badge>
                        )}
                        <Badge
                          className={`text-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium border ${
                            detailsProduct.is_in_stock === "1"
                              ? "bg-emerald-50/80 text-emerald-700 border-emerald-100"
                              : "bg-amber-50/80 text-amber-700 border-amber-100"
                          }`}
                        >
                          {detailsProduct.is_in_stock === "1" ? (
                            <>
                              <CheckCircle className="h-3.5 w-3.5" />
                              In Stock
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-3.5 w-3.5" />
                              Out of Stock
                            </>
                          )}
                        </Badge>
                        <span className="text-indigo-600 font-medium text-sm bg-indigo-50/80 px-3 py-1.5 rounded-full flex items-center border border-indigo-100">
                          <DollarSign className="h-3.5 w-3.5 mr-1" />
                          {detailsProduct.price} EGP
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action buttons with improved styling */}
                  <div className="flex md:flex-col gap-3 mt-6 md:mt-0">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => {
                        setEditingProduct(detailsProduct);
                        setFormData({
                          name: detailsProduct.name || "",
                          price: detailsProduct.price || "",
                          description: detailsProduct.description || "",
                          is_in_stock: detailsProduct.is_in_stock || "",
                          category_id: detailsProduct.category_id || "",
                          main_image_url: detailsProduct.main_image_url || "",
                        });
                        setIsAddDialogOpen(true);
                        setDetailsProduct(null);
                      }}
                      className="flex items-center justify-center gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50/70 hover:text-indigo-800 hover:border-indigo-300 shadow-sm rounded-xl px-4 py-2 transition-all duration-200 hover:shadow w-full md:w-auto"
                    >
                      <Edit3 className="h-4 w-4" />
                      Edit Product
                    </Button>
                    <Button
                      variant="destructive"
                      size="lg"
                      onClick={() => {
                        confirmDeleteProduct(detailsProduct.product_id);
                        setDetailsProduct(null);
                      }}
                      className="flex items-center justify-center gap-2 bg-red-50/80 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-200 rounded-xl px-4 py-2 transition-all duration-200 w-full md:w-auto"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Product
                    </Button>
                  </div>
                </div>

                {/* Quick info cards with improved visual design */}
                <div className="relative px-12">
                  {/* Optimized background elements */}
                  <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-100/50 rounded-full opacity-40 blur-3xl"></div>
                  <div className="absolute -left-10 bottom-20 w-40 h-40 bg-indigo-100/50 rounded-full opacity-30 blur-2xl"></div>
                  
                  <h4 className="font-semibold text-slate-800 mb-6 flex items-center gap-3 text-lg">
                    <div className="p-2 bg-indigo-50 rounded-lg shadow-sm border border-indigo-100">
                      <Info className="h-4 w-4 text-indigo-600" />
                    </div>
                    Product Information
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow transition-all duration-300 hover:border-indigo-200 group">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-slate-500">Category</span>
                        <div className="p-1.5 bg-indigo-50 rounded-md group-hover:bg-indigo-100 transition-colors duration-300">
                          <Tag className="h-3.5 w-3.5 text-indigo-600" />
                        </div>
                      </div>
                      <div className="flex items-center">
                        {categories.find((c) => c.category_id === detailsProduct.category_id) ? (
                          <Badge variant="secondary" className="text-sm bg-indigo-50/80 text-indigo-700 border border-indigo-100 font-medium px-3 py-1.5 rounded-full">
                            {categories.find((c) => c.category_id === detailsProduct.category_id)?.name}
                          </Badge>
                        ) : (
                          <span className="text-sm text-slate-400 font-medium">—</span>
                        )}
                      </div>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow transition-all duration-300 hover:border-emerald-200 group">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-slate-500">Stock Status</span>
                        <div className={`p-1.5 rounded-md transition-colors duration-300 ${detailsProduct.is_in_stock === "1" ? "bg-emerald-50 group-hover:bg-emerald-100" : "bg-amber-50 group-hover:bg-amber-100"}`}>
                          {detailsProduct.is_in_stock === "1" ? (
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Badge
                          className={`text-sm font-medium px-3 py-1.5 rounded-full border ${
                            detailsProduct.is_in_stock === "1"
                              ? "bg-emerald-50/80 text-emerald-700 border-emerald-100"
                              : "bg-amber-50/80 text-amber-700 border-amber-100"
                          }`}
                        >
                          {detailsProduct.is_in_stock === "1" ? "In Stock" : "Out of Stock"}
                        </Badge>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow transition-all duration-300 hover:border-indigo-200 group">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-slate-500">Price</span>
                        <div className="p-1.5 bg-indigo-50 rounded-md group-hover:bg-indigo-100 transition-colors duration-300">
                          <DollarSign className="h-3.5 w-3.5 text-indigo-600" />
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="text-base font-medium text-indigo-600">{detailsProduct.price} EGP</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gallery grid */}
                <div className="relative mt-8 bg-white rounded-xl border border-slate-200 p-6 shadow-sm mx-8 mb-8">
                  <div className="absolute -left-6 -top-6 w-28 h-28 bg-indigo-100/40 rounded-full opacity-30 blur-xl"></div>
                  <div className="absolute right-1/4 bottom-1/3 w-16 h-16 bg-indigo-100/40 rounded-full opacity-20 blur-lg"></div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 relative z-10">
                    <div className="flex items-center gap-3 mb-4 sm:mb-0">
                      <div className="bg-indigo-600 p-2 rounded-lg shadow-sm text-white">
                        <ImageIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800 text-base flex items-center gap-2">
                          Product Gallery
                          {detailsProduct?.sub_images && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium bg-indigo-50/80 text-indigo-700 border border-indigo-100 rounded-full px-2 py-0.5">
                              <ImageIcon className="h-3 w-3" />
                              {(detailsProduct.sub_images || []).length}
                            </span>
                          )}
                        </h4>
                        <span className="text-xs text-slate-500">Click an image to preview. Replace any image from the overlay.</span>
                      </div>
                    </div>
                    {Object.keys(getSubImageState(detailsProduct.product_id).replacements).length > 0 && (
                      <Badge className="bg-indigo-50/80 text-indigo-700 border border-indigo-100 px-3 py-1.5 font-medium rounded-full">
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                        {Object.keys(getSubImageState(detailsProduct.product_id).replacements).length} changes pending
                      </Badge>
                    )}
                  </div>

                  {detailsProduct.sub_images && detailsProduct.sub_images.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                      {detailsProduct.sub_images.map((img, idx) => {
                        const subState = getSubImageState(detailsProduct.product_id);
                        const hasReplacement = !!subState.replacements[idx];
                        const inputId = `details-sub-${detailsProduct.product_id}-${idx}`;
                        return (
                          <div key={idx} className="group space-y-2">
                            <div className="relative w-full h-40 rounded-xl overflow-hidden border border-slate-200 shadow-sm group-hover:shadow transition-all duration-300 group-hover:border-indigo-200">
                              <Image
                                src={
                                  hasReplacement && subState.replacements[idx]
                                    ? URL.createObjectURL(subState.replacements[idx] as File)
                                    : `${API_BASE}${img}`
                                }
                                alt={`Gallery ${idx + 1}`}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105 cursor-zoom-in"
                                onClick={() => {
                                  const url = hasReplacement && subState.replacements[idx]
                                    ? URL.createObjectURL(subState.replacements[idx] as File)
                                    : `${API_BASE}${img}`;
                                  setPreviewImageUrl(url);
                                }}
                              />
                              {hasReplacement ? (
                                <div className="absolute inset-0 bg-blue-50/80 flex items-center justify-center transition-opacity duration-300">
                                  <div className="bg-white rounded-full p-2.5 shadow-md">
                                    <CheckCircle className="h-6 w-6 text-blue-600" />
                                  </div>
                                </div>
                              ) : (
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 flex items-end justify-center transition-opacity duration-300 p-4">
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    size="default"
                                    onClick={() => document.getElementById(inputId)?.click()}
                                    className="bg-white/95 hover:bg-white text-slate-800 shadow-md w-full"
                                  >
                                    <Edit3 className="h-4 w-4 mr-2" />
                                    Replace
                                  </Button>
                                </div>
                              )}
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              id={inputId}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file && file.type.startsWith("image/")) {
                                  replaceSubImageFor(detailsProduct.product_id, idx, file);
                                }
                                e.target.value = "";
                              }}
                            />
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-slate-600 font-medium">Image {idx + 1}</span>
                              {hasReplacement && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => document.getElementById(inputId)?.click()}
                                  className="h-8 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium"
                                >
                                  <Edit3 className="h-3.5 w-3.5 mr-1.5" />
                                  Change
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {/* Add new images tile */}
                      <div className="group space-y-3">
                        <div className="relative w-full h-48 rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-300 flex items-center justify-center bg-slate-50/50 cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []).filter(f => f.type.startsWith('image/'));
                              if (files.length > 0) addNewSubImages(detailsProduct.product_id, files as File[]);
                              if (e.target) e.target.value = '';
                            }}
                          />
                          <div className="text-center">
                            <UploadCloud className="h-7 w-7 text-blue-500 mx-auto mb-2" />
                            <span className="text-sm text-slate-600 font-medium">Add Images</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-200 transition-colors duration-300">
                      <div className="bg-blue-50 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-sm">
                        <Package className="h-10 w-10 text-blue-500" />
                      </div>
                      <p className="text-base font-medium text-slate-700 mb-2">No gallery images</p>
                      <p className="text-sm text-slate-500 max-w-md mx-auto">Add additional images to showcase your product from different angles</p>
                    </div>
                  )}

                  <div className="flex justify-end items-center pt-6 mt-6 border-t border-slate-200">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDetailsProduct(null)}
                      className="mr-auto hover:bg-slate-100 border-slate-300 text-slate-600 font-medium px-5"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Close
                    </Button>
                    <Button
                      onClick={() => saveInlineChanges(detailsProduct)}
                      disabled={
                        isSubmitting ||
                        Object.keys(getSubImageState(detailsProduct.product_id).replacements).length === 0
                      }
                      className={`flex items-center gap-2 shadow-md px-5 transition-all duration-300 ${Object.keys(getSubImageState(detailsProduct.product_id).replacements).length > 0 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-400 hover:bg-slate-500'}`}
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Save className="h-5 w-5" />
                      )}
                      {Object.keys(getSubImageState(detailsProduct.product_id).replacements).length > 0 ? 
                        `Save ${Object.keys(getSubImageState(detailsProduct.product_id).replacements).length} Changes` : 
                        "No Changes to Save"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Preview Lightbox */}
        <Dialog open={!!previewImageUrl} onOpenChange={() => setPreviewImageUrl(null)}>
          <DialogContent className="max-w-6xl p-0 bg-black/95 overflow-hidden rounded-xl border-none">
            <div className="relative w-full h-[85vh]">
              {/* Use native img for simplicity in full-screen preview */}
              {previewImageUrl && (
                <img src={previewImageUrl} alt="Preview" className="w-full h-full object-contain" />
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setPreviewImageUrl(null)} 
                className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full h-10 w-10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <DialogFooter className="p-4 bg-black/80 border-t border-white/10">
              <Button variant="outline" onClick={() => setPreviewImageUrl(null)} className="bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-xl">
                <X className="h-4 w-4 mr-2" />
                Close Preview
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add/Edit Product Dialog */}
        <Dialog 
          open={isAddDialogOpen} 
          onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) {
              setFormData({
                name: "",
                category_id: "",
                price: "",
                is_in_stock: "",
                description: "",
                main_image_url: "",
              });
              setSelectedImages([]);
              setSelectedMainImage(null);
              setEditingProduct(null);
            }
          }}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 rounded-xl border-none shadow-2xl">
            <DialogHeader className="p-8 bg-gradient-to-br from-indigo-600 to-indigo-700 border-b relative overflow-hidden">
              {/* Background elements */}
              <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] opacity-30"></div>
              <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute -top-8 -left-8 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
              
              <DialogTitle className="flex items-center gap-3 text-2xl font-bold relative z-10 text-white mb-2">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-sm">
                  <Package className="h-6 w-6 text-white" />
                </div>
                {editingProduct ? "Edit Product" : "Add New Product"}
              </DialogTitle>
              <DialogDescription className="text-white/80 text-base relative z-10">
                {editingProduct
                  ? "Update the product information below."
                  : "Fill in the details to add a new product to your platform."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-8 p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Product Name */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    <span>Product Name</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    placeholder="Enter product name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    disabled={isSubmitting}
                    className="h-12 border-slate-200 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200"
                  />
                </div>

                {/* Category */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    <span>Category</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(val) =>
                      setFormData({ ...formData, category_id: val })
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="h-12 border-slate-200 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg border-slate-200 shadow-lg">
                      {categories.map((cat) => (
                        <SelectItem
                          key={cat.category_id}
                          value={cat.category_id}
                        >
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    <span>Price</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      required
                      disabled={isSubmitting}
                      className="h-12 pl-7 border-slate-200 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* Stock Status */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <span>Stock Status</span>
                </label>
                <Select
                  value={formData.is_in_stock}
                  onValueChange={(val) =>
                    setFormData({ ...formData, is_in_stock: val })
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="h-12 border-slate-200 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200">
                    <SelectValue placeholder="Select stock status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg border-slate-200 shadow-lg">
                    <SelectItem value="1">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        In Stock
                      </div>
                    </SelectItem>
                    <SelectItem value="0">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-red-500"></div>
                        Out of Stock
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700">
                  Product Description
                </label>
                <Textarea
                  placeholder="Enter a brief description of the product"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  disabled={isSubmitting}
                  rows={4}
                  className="border-slate-200 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Main Product Image */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-700">
                    Product Image
                  </label>
                  <div className="space-y-4">
                    <div className="relative group">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleMainImageChange}
                        disabled={isSubmitting}
                        className="h-12 border-slate-200 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      />
                      <div className="absolute inset-0 w-full h-full rounded-lg pointer-events-none border-2 border-dashed border-slate-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    </div>
                    {selectedMainImage && (
                      <div className="relative w-40 h-40 rounded-lg overflow-hidden border-2 border-indigo-100 shadow-md">
                        <img
                          src={URL.createObjectURL(selectedMainImage)}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200"></div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="absolute bottom-2 right-2 h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-md rounded-full border-slate-200"
                          onClick={() => {
                            setSelectedMainImage(null);
                          }}
                        >
                          <X className="h-4 w-4 text-slate-600" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Gallery Images */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-700">
                    Gallery Images <span className="text-slate-500 text-xs">(Optional)</span>
                  </label>
                  <div className="space-y-4">
                    <div className="relative group">
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleSubImagesChange}
                        disabled={isSubmitting}
                        className="h-12 border-slate-200 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      />
                      <div className="absolute inset-0 w-full h-full rounded-lg pointer-events-none border-2 border-dashed border-slate-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    </div>
                    {selectedImages.length > 0 && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 rounded-lg text-indigo-700 text-sm">
                        <ImageIcon className="h-4 w-4" />
                        {selectedImages.length} image{selectedImages.length > 1 ? 's' : ''} selected
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter className="flex gap-4 pt-8 border-t border-slate-100 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setFormData({
                      name: "",
                      category_id: "",
                      price: "",
                      is_in_stock: "",
                      description: "",
                      main_image_url: "",
                    });
                    setSelectedImages([]);
                    setSelectedMainImage(null);
                    setEditingProduct(null);
                  }}
                  disabled={isSubmitting}
                  className="px-8 py-6 bg-white hover:bg-slate-50 border-slate-200 text-slate-700 rounded-xl shadow-sm transition-all duration-200 font-medium"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 px-8 py-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 font-medium text-base"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {editingProduct ? "Updating..." : "Adding..."}
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      {editingProduct ? "Update Product" : "Add Product"}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                Confirm Deletion
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{deleteTarget?.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={deleteTarget?.type === "category" ? deleteCategory : deleteProduct}
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete {deleteTarget?.type === "category" ? "Category" : "Product"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
