"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { AdminLayout } from "@/components/admin/admin-layout";
import { useProductManagement } from "@/hooks/admin/use-product-management";
import { Plus, Package } from "lucide-react";
import type { Product, ProductFormData, ProductDeleteTarget } from "@/types";

// Dynamic imports for heavy components to prevent hydration mismatches
const StatsCards = dynamic(() => import("@/components/admin/products").then(mod => ({ default: mod.StatsCards })), { ssr: false });
const CategoryFilter = dynamic(() => import("@/components/admin/products").then(mod => ({ default: mod.CategoryFilter })), { ssr: false });
const SearchAndFilter = dynamic(() => import("@/components/admin/products").then(mod => ({ default: mod.SearchAndFilter })), { ssr: false });
const ProductsTable = dynamic(() => import("@/components/admin/products").then(mod => ({ default: mod.ProductsTable })), { ssr: false });
const ProductForm = dynamic(() => import("@/components/admin/products").then(mod => ({ default: mod.ProductForm })), { ssr: false });
const ProductDetailsDialog = dynamic(() => import("@/components/admin/products").then(mod => ({ default: mod.ProductDetailsDialog })), { ssr: false });
const CategoryManagementDialog = dynamic(() => import("@/components/admin/products").then(mod => ({ default: mod.CategoryManagementDialog })), { ssr: false });
const DeleteConfirmationDialog = dynamic(() => import("@/components/admin/products").then(mod => ({ default: mod.DeleteConfirmationDialog })), { ssr: false });
const ImagePreviewDialog = dynamic(() => import("@/components/admin/products").then(mod => ({ default: mod.ImagePreviewDialog })), { ssr: false });

export default function ProductsManagement() {
  // Use the centralized product management hook
  const {
    products,
    categories,
    loading,
    searchTerm,
    selectedCategory,
    currentPage,
    filteredProducts,
    paginatedProducts,
    totalPages,
    stats,
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
  } = useProductManagement();

  // Local UI state
  const [detailsProduct, setDetailsProduct] = useState<Product | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProductDeleteTarget | null>(null);
  const [isCatDialogOpen, setIsCatDialogOpen] = useState(false);
  const [maxPrimary, setMaxPrimary] = useState(8);
  const [cacheBuster, setCacheBuster] = useState(0);

  // Responsive primary categories count for pills bar
  useEffect(() => {
    const compute = () => {
      const w = typeof window !== "undefined" ? window.innerWidth : 1280;
      if (w < 640) return 3;
      if (w < 1024) return 5;
      return 8;
    };
    const update = () => setMaxPrimary(compute());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Prevent background scroll when dialog is open
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

  // Memoized event handlers to prevent unnecessary re-renders
  const handleAddProduct = useCallback(() => {
    setEditingProduct(null);
    setIsAddDialogOpen(true);
  }, []);

  const handleEditProduct = useCallback((product: Product) => {
    setEditingProduct(product);
    setIsAddDialogOpen(true);
  }, []);

  const handleViewDetails = useCallback(async (product: Product) => {
    try {
      const productWithDetails = await getProductDetails(product.product_id);
      setDetailsProduct(productWithDetails);
    } catch (error) {
      setDetailsProduct(product);
    }
  }, [getProductDetails]);

  const handleDeleteProduct = useCallback((productId: string) => {
    const product = products.find(p => p.product_id === productId);
    if (product) {
      setDeleteTarget({
        type: "product",
        id: productId,
        name: product.name,
      });
      setShowDeleteConfirm(true);
    }
  }, [products]);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    
    if (deleteTarget.type === "product") {
      await deleteProduct(deleteTarget.id);
    } else {
      await deleteCategory(deleteTarget.id);
    }
  }, [deleteTarget, deleteProduct, deleteCategory]);

  const handleProductFormSubmit = useCallback(async (
    formData: ProductFormData,
    mainImage?: File,
    subImages?: File[]
  ) => {
    if (editingProduct) {
      await updateProduct(editingProduct.product_id, formData, mainImage, subImages);
      // If details dialog is open for this product, refresh it and bump cache buster
      if (detailsProduct && detailsProduct.product_id === editingProduct.product_id) {
        const updated = await getProductDetails(editingProduct.product_id);
        setDetailsProduct(updated);
        setCacheBuster((v) => v + 1);
      }
    } else {
      await addProduct(formData, mainImage, subImages);
    }
  }, [editingProduct, addProduct, updateProduct]);

  const handleAddCategory = useCallback(async (name: string) => {
    await addCategory(name);
  }, [addCategory]);

  const handleUpdateCategory = useCallback(async (categoryId: string, name: string) => {
    await updateCategory(categoryId, name);
  }, [updateCategory]);

  const handleRemoveSubImage = useCallback(async (imagePath: string) => {
    if (!detailsProduct) return;
    
    const currentImages = detailsProduct.sub_images || [];
    const keepImages = currentImages.filter(img => img !== imagePath);
    
    await removeSubImage(detailsProduct.product_id, imagePath, keepImages);
    
    // Update local state
    setDetailsProduct(prev => prev ? {
      ...prev,
      sub_images: keepImages
    } : null);
  }, [detailsProduct, removeSubImage]);

  const handleReplaceSubImage = useCallback(async (oldImagePath: string, file: File, existingImages: string[]) => {
    if (!detailsProduct) return;
    // Optimistic UI: show the selected file immediately
    const tempUrl = URL.createObjectURL(file);
    setDetailsProduct(prev => prev ? {
      ...prev,
      sub_images: (prev.sub_images || []).map(p => p === oldImagePath ? tempUrl : p)
    } : prev);

    try {
      await replaceSubImage(detailsProduct.product_id, oldImagePath, file, existingImages);
    } finally {
      // Release object URL and refresh to get the canonical server URL
      URL.revokeObjectURL(tempUrl);
      const updated = await getProductDetails(detailsProduct.product_id);
      setDetailsProduct(updated);
      setCacheBuster((v) => v + 1);
    }
  }, [detailsProduct, replaceSubImage, getProductDetails]);

  const handleImagePreview = useCallback((imageUrl: string) => {
    setPreviewImageUrl(imageUrl);
  }, []);

  const handleCloseDialogs = useCallback(() => {
    setIsAddDialogOpen(false);
    setDetailsProduct(null);
    setShowDeleteConfirm(false);
    setDeleteTarget(null);
    setIsCatDialogOpen(false);
    setPreviewImageUrl(null);
    setEditingProduct(null);
  }, []);

  // Show loading state during initial load
  if (loading.initial) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Package className="h-12 w-12 text-indigo-600 mx-auto mb-4 animate-pulse" />
            <p className="text-slate-600">Loading products...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8 p-8 bg-gradient-to-br from-slate-50 to-white min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-start">
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
        </div>

        {/* Stats Cards */}
        <StatsCards
          totalProducts={stats.totalProducts}
          inStockProducts={stats.inStockProducts}
          totalCategories={stats.totalCategories}
        />

        {/* Category Filter */}
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onAddCategory={() => setIsCatDialogOpen(true)}
          onManageCategories={() => setIsCatDialogOpen(true)}
          maxPrimary={maxPrimary}
        />

        {/* Search */}
        <SearchAndFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filteredCount={filteredProducts.length}
        />

        {/* Products Table */}
        <ProductsTable
          products={paginatedProducts}
          categories={categories}
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={8}
          searchTerm={searchTerm}
          selectedCategory={selectedCategory}
          onPageChange={setCurrentPage}
          onViewDetails={handleViewDetails}
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleDeleteProduct}
          onAddProduct={handleAddProduct}
        />

        {/* Product Form Dialog */}
        <ProductForm
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          onSubmit={handleProductFormSubmit}
          categories={categories}
          editingProduct={editingProduct}
          isSubmitting={loading.submitting}
        />

        {/* Product Details Dialog */}
        <ProductDetailsDialog
          product={detailsProduct}
          categories={categories}
          isOpen={!!detailsProduct}
          onClose={() => setDetailsProduct(null)}
          onEdit={handleEditProduct}
          onImagePreview={handleImagePreview}
          onRemoveSubImage={handleRemoveSubImage}
          onReplaceSubImage={handleReplaceSubImage}
          isSubUploading={loading.subUploading}
          cacheBuster={cacheBuster}
        />

        {/* Category Management Dialog */}
        <CategoryManagementDialog
          isOpen={isCatDialogOpen}
          onClose={() => setIsCatDialogOpen(false)}
          categories={categories}
          products={products}
          onAddCategory={handleAddCategory}
          onUpdateCategory={handleUpdateCategory}
          onDeleteCategory={deleteCategory}
          isSubmitting={loading.submitting}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleConfirmDelete}
          deleteTarget={deleteTarget}
          isDeleting={loading.submitting}
        />

        {/* Image Preview Dialog */}
        <ImagePreviewDialog
          imageUrl={previewImageUrl}
          isOpen={!!previewImageUrl}
          onClose={() => setPreviewImageUrl(null)}
        />
      </div>
      <div className="fixed bottom-8 right-8">
        <button
          onClick={handleAddProduct}
          className="px-4 py-3 rounded-full shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
          aria-label="Add Product"
        >
          + New Product
        </button>
      </div>
    </AdminLayout>
  );
}
