"use client";

import { useEffect, useState } from "react";
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
import { toast } from "react-hot-toast";
import {
  Plus,
  Search,
  Filter,
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
  AlertTriangle,
} from "lucide-react";

const API_BASE = "http://localhost:8000";

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

// Predefined category suggestions for generation
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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
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

  // Category editing states
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryGenerator, setShowCategoryGenerator] = useState(false);

  // Confirmation dialog states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "category" | "product";
    id: string;
    name: string;
  } | null>(null);

  const itemsPerPage = 8;
  const [currentPage, setCurrentPage] = useState(1);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("adminAuth");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  // Enhanced toast functions with better styling
  const showSuccessToast = (message: string) => {
    toast.success(message, {
      duration: 3000,
      style: {
        background: "linear-gradient(135deg, #10b981, #059669)",
        color: "#fff",
        fontWeight: "600",
        borderRadius: "12px",
        padding: "16px 20px",
        boxShadow: "0 10px 25px rgba(16, 185, 129, 0.3)",
      },
      iconTheme: {
        primary: "#fff",
        secondary: "#10b981",
      },
    });
  };

  const showErrorToast = (message: string) => {
    toast.error(message, {
      duration: 4000,
      style: {
        background: "linear-gradient(135deg, #ef4444, #dc2626)",
        color: "#fff",
        fontWeight: "600",
        borderRadius: "12px",
        padding: "16px 20px",
        boxShadow: "0 10px 25px rgba(239, 68, 68, 0.3)",
      },
      iconTheme: {
        primary: "#fff",
        secondary: "#ef4444",
      },
    });
  };

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

  // Fetch categories from the backend API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE}/AdminCategories/getAll`, {
          headers: getAuthHeaders(),
        });
        const data = await res.json();
        if (res.ok) {
          setCategories(data.data || []);
        } else {
          showErrorToast("Failed to load categories");
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        showErrorToast("Network error while loading categories");
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  const addCategory = async () => {
    if (!newCategoryName.trim()) {
      showErrorToast("Category name is required");
      return;
    }

    // Check for duplicate category names
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
      const res = await fetch(`${API_BASE}/AdminCategories/addCategory`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: newCategoryName }),
      });

      const data = await res.json();
      if (res.ok) {
        showSuccessToast(`Category "${newCategoryName}" added successfully!`);
        setNewCategoryName("");
        // Refresh categories
        const refreshRes = await fetch(`${API_BASE}/AdminCategories/getAll`, {
          headers: getAuthHeaders(),
        });
        const refreshData = await refreshRes.json();
        if (refreshRes.ok) {
          setCategories(refreshData.data || []);
        }
      } else {
        showErrorToast(data.message || "Failed to add category");
      }
    } catch (err) {
      console.error("Error adding category:", err);
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

    // Check if the name actually changed
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

    // Check for duplicate category names (excluding current category)
    const existingCategory = categories.find(
      (cat) =>
        cat.category_id !== editingCategoryId &&
        cat.name.toLowerCase().trim() ===
          editingCategoryName.toLowerCase().trim()
    );
    if (existingCategory) {
      showErrorToast("A category with this name already exists");
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
        showSuccessToast(`Category updated successfully!`);
        setEditingCategoryId(null);
        setEditingCategoryName("");
        // Refresh categories
        const refreshRes = await fetch(`${API_BASE}/AdminCategories/getAll`, {
          headers: getAuthHeaders(),
        });
        const refreshData = await refreshRes.json();
        if (refreshRes.ok) {
          setCategories(refreshData.data || []);
        }
      } else {
        console.error("Update category error:", data);
        showErrorToast(data.message || `Failed to update category`);
      }
    } catch (err) {
      console.error("Error updating category:", err);
      showErrorToast("Network error while updating category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteCategory = (id: string) => {
    const categoryName =
      categories.find((cat) => cat.category_id === id)?.name || "this category";

    // Check if category has products
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
        console.error("Delete category error:", data);
        showErrorToast(data.message || `Failed to delete category`);
      }
    } catch (err) {
      console.error("Error deleting category:", err);
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
        // Refresh categories
        const refreshRes = await fetch(`${API_BASE}/AdminCategories/getAll`, {
          headers: getAuthHeaders(),
        });
        const refreshData = await refreshRes.json();
        if (refreshRes.ok) {
          setCategories(refreshData.data || []);
        }
      } else {
        showErrorToast(data.message || "Failed to add category");
      }
    } catch (err) {
      console.error("Error adding category:", err);
      showErrorToast("Network error while adding category");
    } finally {
      setIsSubmitting(false);
    }
  };

const fetchProducts = async () => {
  try {
    setLoading(true);
    const res = await fetch(`${API_BASE}/AdminProducts/getAll`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message("Failed to fetch products"));
    }

    const result = await res.json();
    const data = result.data ||  result.products  || result || [];

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
    console.log(products);
    
    
    console.log(API_BASE, formattedData.image_url);
    
  } catch (err: any) {
    console.error("Fetch error:", err);
    showErrorToast(err.message || "Error loading products");
  } finally {
    setLoading(false);
  }
};


  const parseResponse = async (response: Response) => {
    const responseText = await response.text();
    try {
      return JSON.parse(responseText);
    } catch (e) {
      return {
        status: response.ok ? "success" : "error",
        message:
          responseText ||
          (response.ok ? "Operation completed" : "Operation failed"),
      };
    }
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
      showErrorToast("Please select a category for the product");
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
      console.error("Error saving product", err);
      showErrorToast(
        err.message || "Something went wrong while saving the product"
      );
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
      console.error("Delete error", err);
      showErrorToast(err.message || "Failed to delete product");
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => { 
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showErrorToast("Image file size must be less than 5MB");
        return;
      }

      // Validate file type
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

    // Auto-focus the input field after a short delay to ensure it's rendered
    setTimeout(() => {
      const inputElement = document.querySelector(
        `[data-category-input="${category.category_id}"]`
      ) as HTMLInputElement;
      if (inputElement) {
        inputElement.focus();
        inputElement.select(); // Select all text for easy editing
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

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <div className="text-lg text-gray-600">Loading products...</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Package className="h-8 w-8 text-blue-600" />
              Product Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your product catalog and categories
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-sm">
              {products.length} Products
            </Badge>
            <Badge variant="outline" className="text-sm">
              {categories.length} Categories
            </Badge>
          </div>
        </div>

        {/* Category Management Section */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Tag className="h-6 w-6 text-blue-600" />
                <CardTitle className="text-xl">Category Management</CardTitle>
              </div>
              <Button
                onClick={generateCategories}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 hover:bg-blue-100"
              >
                <Sparkles className="h-4 w-4" />
                Generate Categories
              </Button>
            </div>
            <CardDescription>
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
                className="flex-1"
              />
              <Button
                onClick={addCategory}
                disabled={isSubmitting || !newCategoryName.trim()}
                className="flex items-center gap-2"
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
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">
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
                        className="justify-start text-left h-auto py-2 px-3"
                      >
                        {suggestion}
                      </Button>
                    ))}
                </div>
              </div>
            )}

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {categories.map((cat) => (
                <div
                  key={cat.category_id}
                  className={`group relative bg-white rounded-lg p-3 border-2 transition-all duration-200 hover:shadow-md ${
                    editingCategoryId === cat.category_id
                      ? "border-blue-300 shadow-lg"
                      : "border-gray-200 hover:border-blue-200"
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
                        className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
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
                        <span className="font-medium text-gray-900 truncate">
                          {cat.name}
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditCategory(cat)}
                            disabled={isSubmitting}
                            className="h-8 w-8 p-0 hover:bg-blue-50"
                          >
                            <Edit3 className="h-4 w-4 text-blue-600" />
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
          </CardContent>
        </Card>

        {/* Product Management Section */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <Package className="h-6 w-6 text-green-600" />
              <CardTitle className="text-xl">Product Management</CardTitle>
            </div>
            <CardDescription>
              Manage your product inventory and details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search and Filter Bar */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={selectedCategory}
                onValueChange={(val) => setSelectedCategory(val)}
              >
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
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
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="w-16">Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead className="w-32">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProducts.map((product: Product) => (
                    <TableRow
                      key={product.product_id}
                      className="hover:bg-gray-50"
                    >
                      <TableCell>
                        <div className="w-12 h-12 relative rounded-lg overflow-hidden border">
                              <Image
                        src={
                               product.image_url
                                    ?`${API_BASE}${product.image_url}`: "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">
                            {product.name}
                          </div>
                          {product.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
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
                      <TableCell className="font-semibold text-green-600">
                        ${product.price}
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
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
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
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(product)}
                            disabled={isSubmitting}
                            className="h-8 w-8 p-0"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              confirmDeleteProduct(product.product_id)
                            }
                            disabled={isSubmitting}
                            className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-200"
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
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm || selectedCategory !== "all"
                      ? "No products found"
                      : "No products yet"}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || selectedCategory !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : "Get started by adding your first product"}
                  </p>
                  {!searchTerm && selectedCategory === "all" && (
                    <Button
                      onClick={() => setIsAddDialogOpen(true)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Your First Product
                    </Button>
                  )}
                </div>
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 p-4 border-t bg-gray-50">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <Button
                      key={i}
                      variant={currentPage === i + 1 ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(i + 1)}
                      className="w-10 h-10"
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dialog for Add/Edit Product */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {editingProduct ? "Edit Product" : "Add New Product"}
              </DialogTitle>
              <DialogDescription>
                {editingProduct
                  ? "Update the product information below."
                  : "Fill in the details to add a new product to your catalog."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
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
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Category *
                  </label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(val) =>
                      setFormData({ ...formData, category_id: val })
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
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
                  <label className="text-sm font-medium text-gray-700">
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
                  />
                </div>

                {/* Stock Status */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Stock Status
                  </label>
                  <Select
                    value={formData.is_in_stock}
                    onValueChange={(val) =>
                      setFormData({ ...formData, is_in_stock: val })
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
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
                <label className="text-sm font-medium text-gray-700">
                  Description
                </label>
                <Textarea
                  rows={3}
                  placeholder="Enter product description..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                  disabled={isSubmitting}
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Product Image
                </label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isSubmitting}
                />
                {selectedImage && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Selected: {selectedImage.name}
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {isSubmitting
                    ? editingProduct
                      ? "Saving..."
                      : "Adding..."
                    : editingProduct
                    ? "Save Changes"
                    : "Add Product"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Confirm Deletion
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Are you sure you want to delete "{deleteTarget?.name}"? This
                action cannot be undone.
                {deleteTarget?.type === "product" &&
                  " The associated image will also be removed."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2">
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
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
