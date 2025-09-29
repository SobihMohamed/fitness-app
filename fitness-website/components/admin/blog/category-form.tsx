"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tag, Edit3, Save, Loader2 } from "lucide-react";
import type { CategoryFormProps } from "@/types/blog";

export const CategoryForm = React.memo(({
  isOpen,
  onClose,
  editingCategory,
  formData,
  onFormDataChange,
  onSubmit,
  isSubmitting
}: CategoryFormProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg rounded-xl shadow-lg border border-slate-100">
        <DialogHeader className="pb-4 border-b border-slate-100">
          <DialogTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg shadow-sm">
              {editingCategory ? (
                <Edit3 className="h-5 w-5 text-blue-600" />
              ) : (
                <Tag className="h-5 w-5 text-blue-600" />
              )}
            </div>
            {editingCategory ? "Edit Category" : "Add Category"}
          </DialogTitle>
          <DialogDescription className="text-slate-600 mt-2">
            {editingCategory
              ? "Update the category details."
              : "Create a new blog category."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-5 py-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.title}
              onChange={(e) =>
                onFormDataChange({ ...formData, title: e.target.value })
              }
              required
              disabled={isSubmitting}
              className="rounded-lg border-slate-200 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 shadow-sm"
              placeholder="Enter category title"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
              Description{" "}
              <span className="text-slate-400">(Optional)</span>
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                onFormDataChange({ ...formData, description: e.target.value })
              }
              rows={4}
              disabled={isSubmitting}
              className="rounded-lg border-slate-200 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 shadow-sm min-h-[120px]"
              placeholder="Enter category description"
            />
          </div>
          <DialogFooter className="pt-4 border-t border-slate-100 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border-slate-200 hover:bg-slate-50 transition-colors duration-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Save
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
});

CategoryForm.displayName = "CategoryForm";
