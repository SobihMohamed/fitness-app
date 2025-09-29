"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Tag, Edit3, Trash2, Save, Loader2 } from "lucide-react";
import { CategoryPills } from "./category-pills";
import { CategoryForm } from "./category-form";
import { DeleteConfirmation } from "./delete-confirmation";
import { getHttpClient } from "@/lib/http";
import { useAdminApi } from "@/hooks/admin/use-admin-api";
import { API_CONFIG } from "@/config/api";
import type { Category } from "@/types";

interface CategoryManagementProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  onRefreshCategories: () => Promise<void> | void;
  blogs: Array<{ category_id: string | null }>;
  maxPrimary?: number;
}

export const CategoryManagement = React.memo(({
  categories,
  selectedCategory,
  onCategoryChange,
  onRefreshCategories,
  blogs,
  maxPrimary = 8
}: CategoryManagementProps) => {
  const [isCatDialogOpen, setIsCatDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catForm, setCatForm] = useState({ title: "", description: "" });
  const [isCatSubmitting, setIsCatSubmitting] = useState(false);
  const [quickCatTitle, setQuickCatTitle] = useState("");
  const [showCatDeleteConfirm, setShowCatDeleteConfirm] = useState(false);
  const [catDeleteTarget, setCatDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const { getAuthHeaders, showSuccessToast, showErrorToast } = useAdminApi();
  const http = getHttpClient();

  // Memoize filtered categories (for potential search functionality)
  const filteredCategories = useMemo(() => {
    return categories;
  }, [categories]);

  // Quick add category handler
  const handleQuickAddCategory = useCallback(async () => {
    const title = quickCatTitle.trim();
    if (!title) {
      showErrorToast("Please enter a category name");
      return;
    }
    try {
      setIsCatSubmitting(true);
      await http.post(
        API_CONFIG.ADMIN_FUNCTIONS.blogs.categories.add,
        { title, description: "" },
        { headers: getAuthHeaders() }
      );
      showSuccessToast("Category added successfully");
      setQuickCatTitle("");
      await onRefreshCategories();
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err.message || "Network error while adding category";
      showErrorToast(errorMessage);
    } finally {
      setIsCatSubmitting(false);
    }
  }, [quickCatTitle, getAuthHeaders, showSuccessToast, showErrorToast, http, onRefreshCategories]);

  // Categories CRUD helpers
  const openAddCategory = useCallback(() => {
    setEditingCategory(null);
    setCatForm({ title: "", description: "" });
    setIsCatDialogOpen(true);
  }, []);

  const openEditCategory = useCallback((cat: Category) => {
    setEditingCategory(cat);
    setCatForm({ title: cat.title || "", description: cat.description || "" });
    setIsCatDialogOpen(true);
  }, []);

  const validateCategoryForm = useCallback((): boolean => {
    const title = catForm.title.trim();
    if (!title) {
      showErrorToast("Category title is required");
      return false;
    }
    if (title.length > 50) {
      showErrorToast("Category title must be less than 50 characters");
      return false;
    }
    if (catForm.description && catForm.description.length > 255) {
      showErrorToast("Description must be less than 255 characters");
      return false;
    }
    return true;
  }, [catForm.title, catForm.description, showErrorToast]);

  const saveCategory = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateCategoryForm()) {
      return;
    }

    try {
      setIsCatSubmitting(true);
      const endpoint = editingCategory
        ? API_CONFIG.ADMIN_FUNCTIONS.blogs.categories.update(
            String(editingCategory.category_id)
          )
        : API_CONFIG.ADMIN_FUNCTIONS.blogs.categories.add;

      await http.post(
        endpoint,
        {
          title: catForm.title.trim(),
          description: catForm.description?.trim() || ''
        },
        {
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );

      showSuccessToast(
        editingCategory
          ? "Category updated successfully"
          : "Category added successfully"
      );

      // Close dialog and refresh categories
      setIsCatDialogOpen(false);
      setEditingCategory(null);
      setCatForm({ title: "", description: "" });

      await onRefreshCategories();
    } catch (err: any) {
      console.error('Error saving category:', err);
      const errorMessage = err?.response?.data?.message ||
                         err.message ||
                         'Failed to save category. Please try again.';
      showErrorToast(errorMessage);
    } finally {
      setIsCatSubmitting(false);
    }
  }, [editingCategory, catForm, validateCategoryForm, getAuthHeaders, showSuccessToast, showErrorToast, http, onRefreshCategories]);

  const confirmDeleteCategory = useCallback((cat: Category) => {
    setCatDeleteTarget({ id: cat.category_id, name: cat.title });
    setShowCatDeleteConfirm(true);
  }, []);

  const deleteCategory = useCallback(async () => {
    if (!catDeleteTarget) return;

    try {
      setIsCatSubmitting(true);

      // Check if category is in use
      const isInUse = blogs.some(blog =>
        String(blog.category_id) === String(catDeleteTarget.id)
      );

      if (isInUse) {
        showErrorToast("Cannot delete category: It's being used by one or more blogs");
        return;
      }

      await http.delete(
        API_CONFIG.ADMIN_FUNCTIONS.blogs.categories.delete(
          String(catDeleteTarget.id)
        ),
        {
          headers: getAuthHeaders(),
          timeout: 10000
        }
      );

      showSuccessToast("Category deleted successfully");
      await onRefreshCategories();
    } catch (err: any) {
      console.error('Error deleting category:', err);
      const errorMessage = err?.response?.data?.message ||
                         err.message ||
                         'Failed to delete category. Please try again.';
      showErrorToast(errorMessage);
    } finally {
      setIsCatSubmitting(false);
      setShowCatDeleteConfirm(false);
      setCatDeleteTarget(null);
    }
  }, [catDeleteTarget, blogs, getAuthHeaders, showSuccessToast, showErrorToast, http, onRefreshCategories]);

  // Memoize selected category details
  const selectedCategoryDetails = useMemo(() => {
    if (selectedCategory === "all") return null;
    return (
      categories.find((c) => String(c.category_id) === selectedCategory) ||
      null
    );
  }, [categories, selectedCategory]);

  return (
    <>
      <div className="w-full">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold text-slate-800">
            Blog Categories
          </h2>
          <div className="flex items-center gap-2">
            {/* Quick add category input */}
            <div className="flex items-center gap-2">
              <Input
                placeholder="Quick add category..."
                value={quickCatTitle}
                onChange={(e) => setQuickCatTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleQuickAddCategory();
                  }
                }}
                className="w-48 h-9 text-sm"
                disabled={isCatSubmitting}
              />
              <Button
                onClick={handleQuickAddCategory}
                disabled={isCatSubmitting || !quickCatTitle.trim()}
                size="sm"
                className="h-9 px-3"
              >
                {isCatSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </div>
            <Button
              onClick={openAddCategory}
              className="bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow transition-all duration-200 rounded-lg font-medium"
            >
              <Plus className="h-4 w-4 mr-2" /> Manage Categories
            </Button>
          </div>
        </div>

        <CategoryPills
          categories={filteredCategories}
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
          maxPrimary={maxPrimary}
        />

        {selectedCategoryDetails && (
          <div className="mt-3 rounded-xl border border-slate-200 bg-white shadow-sm p-4 flex items-start justify-between gap-4 overflow-hidden">
            <div className="flex items-start gap-3 min-w-0">
              <div className="p-2 bg-indigo-50 rounded-lg shrink-0">
                <Tag className="h-4 w-4 text-indigo-600" />
              </div>
              <div className="min-w-0 overflow-hidden">
                <div className="font-semibold text-slate-900 truncate">
                  {selectedCategoryDetails.title}
                </div>
                {selectedCategoryDetails.description ? (
                  <p className="text-sm text-slate-600 mt-1 line-clamp-2 overflow-hidden whitespace-normal break-words">
                    {selectedCategoryDetails.description}
                  </p>
                ) : (
                  <p className="text-sm text-slate-500 italic">
                    No description
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditCategory(selectedCategoryDetails)}
                  className="h-9 px-3 rounded-lg hover:bg-blue-50 hover:border-blue-200"
                  aria-label="Edit selected category"
                >
                  <Edit3 className="h-4 w-4 text-blue-600" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    confirmDeleteCategory(selectedCategoryDetails)
                  }
                  disabled={isCatSubmitting}
                  className="h-9 px-3 rounded-lg hover:bg-red-50 hover:border-red-200"
                  aria-label="Delete selected category"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Category Form Dialog */}
      <CategoryForm
        isOpen={isCatDialogOpen}
        onClose={() => setIsCatDialogOpen(false)}
        editingCategory={editingCategory}
        formData={catForm}
        onFormDataChange={setCatForm}
        onSubmit={saveCategory}
        isSubmitting={isCatSubmitting}
      />

      {/* Category Delete Confirmation Dialog */}
      <DeleteConfirmation
        isOpen={showCatDeleteConfirm}
        onClose={() => setShowCatDeleteConfirm(false)}
        target={catDeleteTarget ? {
          id: catDeleteTarget.id,
          name: catDeleteTarget.name,
          type: "category"
        } : null}
        onConfirm={deleteCategory}
        isSubmitting={isCatSubmitting}
      />
    </>
  );
});

CategoryManagement.displayName = "CategoryManagement";
