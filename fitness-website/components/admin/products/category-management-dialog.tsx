"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminApi } from "@/hooks/admin/use-admin-api";
import { Save, X, Loader2, Edit3, Trash2 } from "lucide-react";
import type { Category } from "@/types";

interface CategoryManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  products: any[]; // For checking if category is in use
  onAddCategory: (name: string) => Promise<void>;
  onUpdateCategory: (categoryId: string, name: string) => Promise<void>;
  onDeleteCategory: (categoryId: string) => Promise<void>;
  isSubmitting: boolean;
}

export const CategoryManagementDialog = React.memo<CategoryManagementDialogProps>(({
  isOpen,
  onClose,
  categories,
  products,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  isSubmitting,
}) => {
  const { showErrorToast } = useAdminApi();
  const [catFormName, setCatFormName] = useState("");
  const [editingCat, setEditingCat] = useState<{ category_id: string; name: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const MIN_NAME_LEN = 3;
  const MAX_NAME_LEN = 50;

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setCatFormName("");
      setEditingCat(null);
    }
  }, [isOpen]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const name = catFormName.trim();
    if (!name) return;

    if (name.length < MIN_NAME_LEN || name.length > MAX_NAME_LEN) {
      showErrorToast(`Category name must be between ${MIN_NAME_LEN} and ${MAX_NAME_LEN} characters`);
      return;
    }

    const normalized = name.toLowerCase();
    const duplicate = categories.some((c) => {
      const cName = String(c.name || "").trim().toLowerCase();
      if (editingCat && String(c.category_id) === String(editingCat.category_id)) return false;
      return cName === normalized;
    });
    if (duplicate) {
      showErrorToast(`Name "${name}" already exists.`);
      return;
    }

    try {
      if (editingCat) {
        await onUpdateCategory(editingCat.category_id, name);
      } else {
        await onAddCategory(name);
      }
      setCatFormName("");
      setEditingCat(null);
    } catch (error) {
      // Error is handled in the parent component
    }
  }, [catFormName, editingCat, onAddCategory, onUpdateCategory, categories]);

  const handleEdit = useCallback((cat: Category) => {
    setEditingCat({ category_id: cat.category_id, name: cat.name });
    setCatFormName(cat.name);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingCat(null);
    setCatFormName("");
  }, []);

  const handleDelete = useCallback(async (cat: Category) => {
    // Check if category is in use
    const inUse = products.some(p => String(p.category_id) === String(cat.category_id));
    if (inUse) {
      return;
    }

    setDeleteTarget(cat);
  }, [products]);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await onDeleteCategory(deleteTarget.category_id);
    } catch (error) {
      // Error is handled in the parent component
    } finally {
      setDeleteTarget(null);
    }
  }, [deleteTarget, onDeleteCategory]);

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      onClose();
    }
  }, [isSubmitting, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-xl">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-br from-indigo-600 to-indigo-700">
          <DialogTitle className="text-white">
            Manage Product Categories
          </DialogTitle>
          <DialogDescription className="text-indigo-100">
            Add, rename, and delete categories. Categories in use by products cannot be deleted.
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-6 space-y-6">
          {/* Add/Edit Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="text-sm font-medium text-slate-700">
              {editingCat ? "Rename Category" : "Add New Category"}
            </label>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Category name"
                value={catFormName}
                onChange={(e) => setCatFormName(e.target.value)}
                disabled={isSubmitting}
                required
                minLength={MIN_NAME_LEN}
                maxLength={MAX_NAME_LEN}
                className="h-11"
              />
              <Button type="submit" disabled={isSubmitting} className="h-11">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {editingCat ? "Save" : "Add"}
                  </>
                )}
              </Button>
              {editingCat && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isSubmitting}
                  className="h-11"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              )}
            </div>
          </form>

          {/* Categories List */}
          <div className="border rounded-lg overflow-hidden">
            <div className="max-h-80 overflow-auto divide-y">
              {categories.length === 0 ? (
                <div className="p-6 text-sm text-slate-600">
                  No categories found.
                </div>
              ) : (
                categories.map((cat) => {
                  const inUse = products.some(p => String(p.category_id) === String(cat.category_id));
                  
                  return (
                    <div
                      key={cat.category_id}
                      className="flex items-center justify-between px-4 py-3 hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="font-medium text-slate-800 max-w-[280px] truncate" title={cat.name}>
                          {cat.name}
                        </div>
                        {inUse && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            In use
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(cat)}
                          disabled={isSubmitting}
                          className="h-8 px-3"
                        >
                          <Edit3 className="h-3.5 w-3.5 mr-1" /> Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(cat)}
                          disabled={isSubmitting || inUse}
                          className="h-8 px-3"
                          title={inUse ? "Cannot delete category in use" : "Delete category"}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <AlertDialog open={!!deleteTarget} onOpenChange={(open) => (!open ? setDeleteTarget(null) : null)}>
          <AlertDialogContent className="rounded-xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete category?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete{" "}
                <span className="font-medium text-slate-900" title={deleteTarget?.name}>
                  &quot;{deleteTarget?.name}&quot;
                </span>
                ? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isSubmitting} className="hover:text-slate-800">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                disabled={isSubmitting}
                onClick={(e) => {
                  e.preventDefault();
                  void handleConfirmDelete();
                }}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
});

CategoryManagementDialog.displayName = "CategoryManagementDialog";
