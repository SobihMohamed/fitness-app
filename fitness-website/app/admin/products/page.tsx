"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useLoading } from "@/hooks/use-loading";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminLayout } from "@/components/admin/admin-layout";
import { useAdminApi } from "@/hooks/admin/use-admin-api";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Save,
  X,
  Package,
  Tag,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Loading from "@/app/loading";


import { API_CONFIG } from "@/config/api";
import { toast } from "sonner";

const { BASE_URL: API_BASE } = API_CONFIG;


type Category = {
  category_id: string;
  name: string;
};

type Product = {
  product_id: string;
  name: string;
  image_url: string;
  price: string;
  description: string;
  is_in_stock: string;
  category_id: string;
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
  "Shakes",
  "Energy Drinks",
  "Recovery",
  "Joint Support",
];



export default function ProductsManagement() {
  
  const [products, setProducts] = useState<Product[]>([]);
  const { isAnyLoading, withLoading } = useLoading();
  const [searchTerm, setSearchTerm] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([
          (async () => {
            try {
              const res = await fetch(`${API_BASE}/AdminCategories/getAll`, {
                headers: getAuthHeaders(),
              });
              const data = await res.json();
              if (res.ok) {
                setCategories(data.data || []);
              } else {
                showErrorToast("Failed to load product categories");
              }
            } catch (err) {
              showErrorToast("Network error while loading product categories");
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

  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  // Auth is enforced in AdminLayout; no extra client redirect needed here
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    price: "",
    is_in_stock: "",
    description: "",
    image_url: "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryGenerator, setShowCategoryGenerator] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "category" | "product";
    id: string;
    name: string;
  } | null>(null);

  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const categoriesPerPage = 4;
  const [currentCategoryPage, setCurrentCategoryPage] = useState(1);

  const { getAuthHeaders, parseResponse, showSuccessToast, showErrorToast } = useAdminApi();

  

  const showInfoToast = (message: string) => {
    toast(message, {
      duration: 3000,
      style: {
        background: "linear-gradient(135deg, #3b82f6, #2563eb)",
        color: "#fff",
        fontWeight: "600",
        borderRadius: "12px",
        padding: "16px 20px",
        boxShadow: "0 10px 25px rgba(59, 130, 246, 0.3)",
      },
      icon: "✨",
    });
  };


  const addCategory = async () => {
    if (!newCategoryName.trim()) {
      showErrorToast("Product category name is required");
      return;
    }

    const existingCategory = categories.find(
      (cat) =>
        cat.name.toLowerCase().trim() === newCategoryName.toLowerCase().trim()
    );
    if (existingCategory) {
      showErrorToast("A product category with this name already exists");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(`${API_BASE}/AdminCategories/addCategory`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: newCategoryName }),
      });
      const data = await res.json();
      if (res.ok) {
        showSuccessToast(`Category "${newCategoryName}" added successfully!`);
        setNewCategoryName("");
        const refreshRes = await fetch(`${API_BASE}/AdminCategories/getAll`, {
          headers: getAuthHeaders(),
        });
        const refreshData = await refreshRes.json();
        if (refreshRes.ok) {
          setCategories(refreshData.data || []);
        }
      } else {
        showErrorToast(data.message || "Failed to add product category");
      }
    } catch (err) {
      showErrorToast("Network error while adding product category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateCategory = async () => {
    if (!editingCategoryName.trim()) {
      showErrorToast("Product category name is required");
      return;
    }

    const currentCategory = categories.find(
      (cat) => cat.category_id === editingCategoryId
    );
    if (
      currentCategory &&
      currentCategory.name === editingCategoryName.trim()
    ) {
      setEditingCategoryId(null);
      setEditingCategoryName("");
      return;
    }

    const existingCategory = categories.find(
      (cat) =>
        cat.category_id !== editingCategoryId &&
        cat.name.toLowerCase().trim() ===
          editingCategoryName.toLowerCase().trim()
    );
    if (existingCategory) {
      showErrorToast("A product category with this name already exists");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(
        `${API_BASE}/AdminCategories/updateCategory/${editingCategoryId}`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            name: editingCategoryName.trim(),
          }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        showSuccessToast(`Product category updated successfully!`);
        setEditingCategoryId(null);
        setEditingCategoryName("");
        const refreshRes = await fetch(`${API_BASE}/AdminCategories/getAll`, {
          headers: getAuthHeaders(),
        });
        const refreshData = await refreshRes.json();
        if (refreshRes.ok) {
          setCategories(refreshData.data || []);
        }
      } else {
        showErrorToast(data.message || `Failed to update product category`);
      }
    } catch (err) {
      showErrorToast("Network error while updating product category");
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
        `Cannot delete category "${categoryName}". It contains ${productsInCategory.length} product(s). Please remove or reassign the products first.`
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
        `${API_BASE}/AdminCategories/deleteCategory/${deleteTarget.id}`,
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
        showErrorToast(data.message || `Failed to delete category`);
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
      const res = await fetch(`${API_BASE}/AdminCategories/addCategory`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: categoryName }),
      });
      const data = await res.json();
      if (res.ok) {
        showSuccessToast(`Category "${categoryName}" added successfully!`);
        const refreshRes = await fetch(`${API_BASE}/AdminCategories/getAll`, {
          headers: getAuthHeaders(),
        });
        const refreshData = await refreshRes.json();
        if (refreshRes.ok) {
          setCategories(refreshData.data || []);
        }
      } else {
        showErrorToast(data.message || "Failed to add product category");
      }
    } catch (err) {
      showErrorToast("Network error while adding product category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchProducts = async () => {
    await withLoading("products", async () => {
      try {
        const res = await fetch(`${API_BASE}/AdminProducts/getAll`, {
          headers: getAuthHeaders(),
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to fetch products");
        }
        const result = await res.json();
        const data = result.data || result.products || result || [];
        const formattedData = data.map((product: any) => ({
          product_id: product.product_id,
          name: product.name,
          image_url: product.image_url || null,
          price: product.price,
          description: product.description,
          is_in_stock: product.is_in_stock || "0",
          category_id: product.category_id,
        }));
        setProducts(formattedData);
      } catch (err: any) {
        showErrorToast(err.message || "Network error while loading products");
      }
    });
  };

  

  const filteredProducts = products.filter(
    (p: Product) =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === "all" ||
        p.category_id?.toString() === selectedCategory)
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      showErrorToast("Product name and price are required");
      return;
    }
    if (!formData.category_id) {
      showErrorToast("Please select a product category");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("price", formData.price);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("category_id", formData.category_id);
    formDataToSend.append("is_in_stock", formData.is_in_stock);

    if (selectedImage) {
      formDataToSend.append("image_url", selectedImage);
    }

    try {
      setIsSubmitting(true);
      const endpoint = editingProduct
        ? `updateProduct/${editingProduct.product_id}`
        : "addProduct";
      const res = await fetch(`${API_BASE}/AdminProducts/${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: getAuthHeaders().Authorization,
        },
        body: formDataToSend,
      });
      const result = await parseResponse(res);
      if (!res.ok) throw new Error(result.message || "Failed to save product");

      if (editingProduct) {
        showSuccessToast(`Product updated successfully!`);
      } else {
        showSuccessToast(`Product added successfully!`);
      }

      await fetchProducts();
      setFormData({
        name: "",
        category_id: "",
        price: "",
        is_in_stock: "",
        description: "",
        image_url: "",
      });
      setSelectedImage(null);
      setEditingProduct(null);
      setIsAddDialogOpen(false);
    } catch (err: any) {
      showErrorToast(err.message || "Network error while saving product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || "",
      category_id: product.category_id?.toString() || "",
      price: product.price?.toString() || "",
      is_in_stock: product.is_in_stock?.toString() || "",
      description: product.description || "",
      image_url: product.image_url || "",
    });
    setSelectedImage(null);
    setIsAddDialogOpen(true);
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
      const res = await fetch(
        `${API_BASE}/AdminProducts/deleteProduct/${deleteTarget.id}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );
      const result = await parseResponse(res);
      if (!res.ok) throw new Error(result.message || "Delete failed");
      showSuccessToast(`Product deleted successfully!`);
      await fetchProducts();
    } catch (err: any) {
      showErrorToast(err.message || "Network error while deleting product");
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showErrorToast("Image file size must be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        showErrorToast("Please select a valid image file");
        return;
      }
      setSelectedImage(file);
    }
  };

  const startEditCategory = (category: Category) => {
    setEditingCategoryId(category.category_id);
    setEditingCategoryName(category.name);
    setTimeout(() => {
      const inputElement = document.querySelector(
        `[data-category-input="${category.category_id}"]`
      ) as HTMLInputElement;
      if (inputElement) {
        inputElement.focus();
        inputElement.select();
      }
    }, 100);
  };

  const cancelEditCategory = () => {
    setEditingCategoryId(null);
    setEditingCategoryName("");
  };

  const handleConfirmDelete = () => {
    if (deleteTarget?.type === "category") {
      deleteCategory();
    } else if (deleteTarget?.type === "product") {
      deleteProduct();
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteTarget(null);
  };

  if (isAnyLoading() || initialLoading) {
    return (
           <AdminLayout>
             <Loading
               variant="admin"
               size="lg"
               message="Loading users and administrators..."
               icon="users"
               className="h-[80vh]"
             />
           </AdminLayout>
    );
  }

  const totalCategoryPages = Math.ceil(categories.length / categoriesPerPage);
  const paginatedCategories = categories.slice(
    (currentCategoryPage - 1) * categoriesPerPage,
    currentCategoryPage * categoriesPerPage
  );

  return (
    <AdminLayout>
      <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 to-white min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-xl">
                <Package className="h-8 w-8 text-indigo-600" />
              </div>
              Product Management
            </h1>
            <p className="text-slate-600 mt-3 text-lg">
              Manage your product catalog and categories with ease
            </p>
          </div>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 text-base"
          >
            <Plus className="h-5 w-5" />
            Add New Product
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-indigo-100 hover:shadow-xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-indigo-700 mb-1">
                    Total Products
                  </p>
                  <p className="text-3xl font-bold text-indigo-900">
                    {products.length}
                  </p>
                </div>
                <div className="p-3 bg-indigo-200 rounded-full">
                  <Package className="h-8 w-8 text-indigo-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100 hover:shadow-xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-700 mb-1">
                    In Stock
                  </p>
                  <p className="text-3xl font-bold text-emerald-900">
                    {products.filter((p) => p.is_in_stock === "1").length}
                  </p>
                </div>
                <div className="p-3 bg-emerald-200 rounded-full">
                  <CheckCircle className="h-8 w-8 text-emerald-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700 mb-1">
                    Categories
                  </p>
                  <p className="text-3xl font-bold text-purple-900">
                    {categories.length}
                  </p>
                </div>
                <div className="p-3 bg-purple-200 rounded-full">
                  <Tag className="h-8 w-8 text-purple-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Management Section */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Tag className="h-6 w-6 text-indigo-600" />
                <CardTitle className="text-xl text-slate-800">
                  Category Management
                </CardTitle>
              </div>
              <Button
                onClick={generateCategories}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 hover:bg-indigo-50 border-indigo-200 bg-transparent"
              >
                <Sparkles className="h-4 w-4" />
                Generate Categories
              </Button>
            </div>
            <CardDescription className="text-slate-600">
              Create and manage product categories for better organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Category Form */}
            <div className="flex gap-3">
              <Input
                placeholder="Enter category name..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addCategory()}
                disabled={isSubmitting}
                className="flex-1 h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
              />
              <Button
                onClick={addCategory}
                disabled={isSubmitting || !newCategoryName.trim()}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Add Category
              </Button>
            </div>

            {/* Category Generator Dialog */}
            {showCategoryGenerator && (
              <div className="bg-white rounded-lg p-4 border border-indigo-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-slate-900">
                    Suggested Categories
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCategoryGenerator(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
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
                        className="justify-start text-left h-auto py-2 px-3 hover:bg-indigo-50"
                      >
                        {suggestion}
                      </Button>
                    ))}
                </div>
              </div>
            )}

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {paginatedCategories.map((cat) => (
                <div
                  key={cat.category_id}
                  className={`group relative bg-white rounded-lg p-3 border-2 transition-all duration-200 hover:shadow-md ${
                    editingCategoryId === cat.category_id
                      ? "border-indigo-300 shadow-lg"
                      : "border-slate-200 hover:border-indigo-200"
                  }`}
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
                        className="border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500"
                        data-category-input={cat.category_id}
                        autoFocus
                        placeholder="Type category name..."
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={updateCategory}
                          disabled={isSubmitting}
                          className="flex-1"
                        >
                          {isSubmitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={cancelEditCategory}
                          disabled={isSubmitting}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-900 truncate">
                          {cat.name}
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditCategory(cat)}
                            disabled={isSubmitting}
                            className="h-8 w-8 p-0 hover:bg-indigo-50"
                          >
                            <Edit3 className="h-4 w-4 text-indigo-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              confirmDeleteCategory(cat.category_id)
                            }
                            disabled={isSubmitting}
                            className="h-8 w-8 p-0 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Category Pagination */}
            {totalCategoryPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {Array.from({ length: totalCategoryPages }, (_, i) => (
                  <Button
                    key={i}
                    variant={
                      currentCategoryPage === i + 1 ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setCurrentCategoryPage(i + 1)}
                    className={`w-10 h-10 ${
                      currentCategoryPage === i + 1
                        ? "bg-indigo-600 hover:bg-indigo-700"
                        : "hover:bg-slate-100"
                    }`}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Search and Filter */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Search className="h-5 w-5 text-indigo-600" />
              Search & Filter Products
            </CardTitle>
            <CardDescription className="text-slate-600">
              Find products by name or filter by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 text-base border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <Select
                value={selectedCategory}
                onValueChange={(val) => setSelectedCategory(val)}
              >
                <SelectTrigger className="w-full md:w-48 h-12 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.category_id} value={cat.category_id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 border-b border-slate-200">
                    <TableHead className="w-16 font-semibold text-slate-700">
                      Image
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Name
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Category
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Price
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Stock
                    </TableHead>
                    <TableHead className="w-32 text-center font-semibold text-slate-700">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProducts.map((product: Product) => (
                    <TableRow
                      key={product.product_id}
                      className="hover:bg-slate-50 transition-colors duration-150 border-b border-slate-100"
                    >
                      <TableCell>
                        <div className="w-14 h-14 relative rounded-lg overflow-hidden border shadow-sm">
                          <Image
                            src={
                              product.image_url
                                ? `${API_BASE}${product.image_url}`
                                : "/placeholder.svg"
                            }
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-semibold text-slate-900 mb-1">
                            {product.name}
                          </div>
                          {product.description && (
                            <div className="text-sm text-slate-500 truncate max-w-xs">
                              {product.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {categories.find(
                            (cat) => cat.category_id === product.category_id
                          )?.name || product.category_id}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-indigo-600">
                        {product.price} EGP
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            product.is_in_stock === "1"
                              ? "default"
                              : "secondary"
                          }
                          className={`text-xs ${
                            product.is_in_stock === "1"
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              : "bg-red-100 text-red-800 hover:bg-red-200"
                          }`}
                        >
                          {product.is_in_stock === "1" ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <AlertCircle className="h-3 w-3 mr-1" />
                          )}
                          {product.is_in_stock === "1"
                            ? "In Stock"
                            : "Out of Stock"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(product)}
                            disabled={isSubmitting}
                            className="h-9 w-9 p-0 hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-150"
                          >
                            <Edit3 className="h-4 w-4 text-indigo-600" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              confirmDeleteProduct(product.product_id)
                            }
                            disabled={isSubmitting}
                            className="h-9 w-9 p-0 hover:bg-red-50 hover:border-red-200 transition-all duration-150"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* No results */}
              {filteredProducts.length === 0 && (
                <div className="text-center py-16">
                  <div className="p-4 bg-slate-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                    <Package className="h-10 w-10 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    {searchTerm || selectedCategory !== "all"
                      ? "No products found"
                      : "No products yet"}
                  </h3>
                  <p className="text-slate-500 mb-6 max-w-md mx-auto">
                    {searchTerm || selectedCategory !== "all"
                      ? "Try adjusting your search or filter criteria to find what you're looking for"
                      : "Get started by adding your first product to the catalog"}
                  </p>
                  {!searchTerm && selectedCategory === "all" && (
                    <Button
                      onClick={() => setIsAddDialogOpen(true)}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Plus className="h-4 w-4" />
                      Add Your First Product
                    </Button>
                  )}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 p-6 border-t bg-slate-50">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <Button
                      key={i}
                      variant={currentPage === i + 1 ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-10 h-10 ${
                        currentPage === i + 1
                          ? "bg-indigo-600 hover:bg-indigo-700"
                          : "hover:bg-slate-100"
                      }`}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Package className="h-5 w-5 text-indigo-600" />
                </div>
                {editingProduct ? "Edit Product" : "Add New Product"}
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                {editingProduct
                  ? "Update the product information below."
                  : "Fill in the details to add a new product to your catalog."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Name */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Product Name *
                  </label>
                  <Input
                    placeholder="Enter product name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    disabled={isSubmitting}
                    className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Category *
                  </label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(val) =>
                      setFormData({ ...formData, category_id: val })
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
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
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Price *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    required
                    disabled={isSubmitting}
                    className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                {/* Stock Status */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Stock Status
                  </label>
                  <Select
                    value={formData.is_in_stock}
                    onValueChange={(val) =>
                      setFormData({ ...formData, is_in_stock: val })
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500">
                      <SelectValue placeholder="Select stock status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">In Stock</SelectItem>
                      <SelectItem value="0">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Description
                </label>
                <Textarea
                  rows={4}
                  placeholder="Enter product description..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  disabled={isSubmitting}
                  className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Product Image
                </label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isSubmitting}
                  className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
                {selectedImage && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    Selected: {selectedImage.name}
                  </div>
                )}
              </div>

              <DialogFooter className="flex gap-3 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  disabled={isSubmitting}
                  className="px-6 bg-transparent"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-6"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {editingProduct ? "Saving..." : "Adding..."}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {editingProduct ? "Save Changes" : "Add Product"}
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
                Are you sure you want to delete "{deleteTarget?.name}"? This
                action cannot be undone.
                {deleteTarget?.type === "product" &&
                  " The associated image will also be removed."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleCancelDelete}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
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
                    Delete
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
