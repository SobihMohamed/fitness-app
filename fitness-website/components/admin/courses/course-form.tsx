"use client";

import React, { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { BookOpen, Save, Loader2, X } from "lucide-react";
import { API_CONFIG } from "@/config/api";
import type { Course, CourseFormData } from "@/types";

interface CourseFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingCourse: Course | null;
  formData: CourseFormData;
  onFormDataChange: (data: CourseFormData) => void;
  selectedImage: File | null;
  onImageChange: (file: File | null) => void;
  formErrors: Record<string, string>;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
}

export const CourseForm = React.memo<CourseFormProps>(({
  isOpen,
  onClose,
  editingCourse,
  formData,
  onFormDataChange,
  selectedImage,
  onImageChange,
  formErrors,
  onSubmit,
  isSubmitting
}) => {
  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // Handle error - could use toast here
        return;
      }
      onImageChange(file);
    }
  }, [onImageChange]);

  const clearImage = useCallback(() => {
    onImageChange(null);
    onFormDataChange({ ...formData, image_url: "" });
  }, [onImageChange, onFormDataChange, formData]);

  const getImagePreview = () => {
    if (selectedImage) {
      return URL.createObjectURL(selectedImage);
    }
    if (typeof formData.image_url === 'string' && formData.image_url) {
      return formData.image_url.startsWith("/uploads")
        ? `${API_CONFIG.BASE_URL}${formData.image_url}`
        : formData.image_url;
    }
    return null;
  };

  const imagePreview = getImagePreview();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <BookOpen className="h-5 w-5 text-indigo-600" />
            </div>
            {editingCourse ? "Edit Course" : "Add New Course"}
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            {editingCourse
              ? "Update the course information below."
              : "Fill in the details to add a new course to your platform."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Course Title */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Course Title *
              </label>
              <Input
                placeholder="Enter course title"
                value={formData.title}
                onChange={(e) =>
                  onFormDataChange({ ...formData, title: e.target.value })
                }
                required
                disabled={isSubmitting}
                className={`h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 ${
                  formErrors.title ? 'border-red-500' : ''
                }`}
              />
              {formErrors.title && (
                <p className="text-sm text-red-600">{formErrors.title}</p>
              )}
            </div>

            {/* Price */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Price *
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) =>
                  onFormDataChange({ ...formData, price: e.target.value })
                }
                required
                disabled={isSubmitting}
                className={`h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 ${
                  formErrors.price ? 'border-red-500' : ''
                }`}
              />
              {formErrors.price && (
                <p className="text-sm text-red-600">{formErrors.price}</p>
              )}
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Course Image
              </label>
              <div className="space-y-3">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  disabled={isSubmitting}
                  className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
                {imagePreview && (
                  <div className="relative w-32 h-32">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg border shadow-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-white shadow-md"
                      onClick={clearImage}
                      disabled={isSubmitting}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Course Description *
            </label>
            <Textarea
              placeholder="Enter a brief description of the course"
              value={formData.description}
              onChange={(e) =>
                onFormDataChange({ ...formData, description: e.target.value })
              }
              required
              disabled={isSubmitting}
              rows={4}
              className={`border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 ${
                formErrors.description ? 'border-red-500' : ''
              }`}
            />
            {formErrors.description && (
              <p className="text-sm text-red-600">{formErrors.description}</p>
            )}
          </div>

          <DialogFooter className="flex gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
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
                  {editingCourse ? "Updating..." : "Adding..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {editingCourse ? "Update Course" : "Add Course"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
});

CourseForm.displayName = "CourseForm";
