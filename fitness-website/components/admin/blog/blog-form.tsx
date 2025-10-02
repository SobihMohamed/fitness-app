"use client";

import React, { useState, useCallback } from "react";
import NextImage from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Video, Save, Loader2, AlertCircle, Info, CheckCircle } from "lucide-react";
import { getProxyImageUrl } from "@/lib/images";
import type { BlogFormProps } from "@/types";

export const BlogForm = React.memo(({
  isOpen,
  onClose,
  editingBlog,
  formData,
  onFormDataChange,
  categories,
  selectedImage,
  onImageChange,
  formErrors,
  onSubmit,
  isSubmitting
}: BlogFormProps) => {
  const [localFormData, setLocalFormData] = useState(formData);

  // Memoize form data change handler
  const handleFormDataChange = useCallback((newData: Partial<typeof formData>) => {
    const updatedData = { ...localFormData, ...newData };
    setLocalFormData(updatedData);
    onFormDataChange(updatedData);
  }, [localFormData, onFormDataChange]);

  // Memoize image change handler
  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file (JPEG, PNG, WebP)");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image file size must be less than 5MB");
      return;
    }

    onImageChange(file);
  }, [onImageChange]);

  // Update local state when formData prop changes
  React.useEffect(() => {
    setLocalFormData(formData);
  }, [formData]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-lg border border-slate-100">
        <DialogHeader className="pb-4 border-b border-slate-100">
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold text-slate-800">
            <div className="p-2 bg-indigo-100 rounded-lg shadow-sm">
              <FileText className="h-6 w-6 text-indigo-600" />
            </div>
            {editingBlog ? "Edit Blog" : "Add New Blog"}
          </DialogTitle>
          <DialogDescription className="text-slate-600 mt-2">
            {editingBlog
              ? "Update the blog information below."
              : "Fill in the details to create a new blog post."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-6 p-2">
          {Object.keys(formErrors).length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 font-medium">
                    Please fix the following errors:
                  </p>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-red-700">
                    {Object.entries(formErrors).map(([key, msg]) => (
                      <li key={key}>{msg}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Blog Title */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                Blog Title <span className="text-red-500">*</span>
              </label>
              <Input
                id="title"
                placeholder="Enter blog title"
                value={localFormData.title}
                onChange={(e) => {
                  handleFormDataChange({ title: e.target.value });
                  if (formErrors.title) {
                    // Clear error would be handled by parent
                  }
                }}
                className={`h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm text-base font-medium ${
                  formErrors.title ? "border-red-500" : ""
                }`}
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Video Link (optional) */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                Video Link{" "}
                <span className="text-slate-400 text-xs font-normal">
                  (optional)
                </span>
              </label>
              <div className="relative">
                <Input
                  placeholder="https://..."
                  value={localFormData.video_link}
                  onChange={(e) =>
                    handleFormDataChange({
                      video_link: e.target.value,
                    })
                  }
                  disabled={isSubmitting}
                  className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm pl-10"
                />
                <Video className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <Info className="h-3 w-3" />
                Add a video to enhance your blog content
              </p>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Status
              </label>
              <div className="relative">
                <Select
                  value={localFormData.status}
                  onValueChange={(value) =>
                    handleFormDataChange({
                      status: value as "published" | "archived",
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                Category <span className="text-red-500">*</span>
              </label>
              <Select
                value={localFormData.category_id}
                onValueChange={(value) => {
                  handleFormDataChange({ category_id: value });
                  if (formErrors.category_id) {
                    // Clear error would be handled by parent
                  }
                }}
              >
                <SelectTrigger
                  className={`w-full ${
                    formErrors.category_id ? "border-red-500" : ""
                  }`}
                >
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-slate-500">
                      No categories available
                    </div>
                  ) : (
                    categories.map((c) => (
                      <SelectItem
                        key={c.id || `category-${Math.random()}`}
                        value={String(c.id)}
                      >
                        {c.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {formErrors.category_id && (
                <p className="text-xs text-red-600">
                  {formErrors.category_id}
                </p>
              )}
            </div>

            {/* Blog Content */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                Content <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="content"
                placeholder="Write your blog content here..."
                value={localFormData.content}
                onChange={(e) => {
                  handleFormDataChange({ content: e.target.value });
                  if (formErrors.content) {
                    // Clear error would be handled by parent
                  }
                }}
                className={`min-h-[140px] rounded-lg shadow-sm ${
                  formErrors.content ? "border-red-500" : ""
                }`}
                disabled={isSubmitting}
              />
              {formErrors.content && (
                <p className="text-xs text-red-600">
                  {formErrors.content}
                </p>
              )}
            </div>

            {/* Image Upload */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="md:col-span-1">
                {(localFormData.main_image || selectedImage) ? (
                  <div className="relative w-full h-40 rounded-lg overflow-hidden border shadow-sm">
                    <NextImage
                      src={
                        selectedImage
                          ? URL.createObjectURL(selectedImage)
                          : localFormData.main_image instanceof File
                          ? URL.createObjectURL(localFormData.main_image)
                          : typeof localFormData.main_image === "string"
                          ? localFormData.main_image.startsWith("http")
                            ? localFormData.main_image
                            : getProxyImageUrl(localFormData.main_image)
                          : "/placeholder.svg"
                      }
                      alt="Featured image"
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="w-full h-40 rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center bg-slate-50 text-slate-400">
                    <NextImage
                      className="h-12 w-12 text-slate-300 mb-2"
                      width={48}
                      height={48}
                      src="/placeholder.svg"
                      alt="Upload placeholder"
                      sizes="48px"
                    />
                    <span className="text-sm">No image selected</span>
                  </div>
                )}
              </div>
              <div className="md:col-span-2">
                <div className="p-4 border-2 border-dashed border-slate-200 rounded-lg hover:border-indigo-300 transition-colors duration-200">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={isSubmitting}
                    className="h-11 border-none focus:ring-0 cursor-pointer"
                  />
                </div>
                {selectedImage && (
                  <div className="flex items-center gap-2 text-sm text-emerald-600 mt-2">
                    <CheckCircle className="h-4 w-4" />
                    Selected: {selectedImage.name}
                  </div>
                )}
                <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Recommended size: 1200x630 pixels, max 5MB
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-3 pt-6 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 bg-transparent rounded-lg hover:bg-slate-50 transition-colors duration-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {editingBlog ? "Saving..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {editingBlog ? "Save Changes" : "Create Blog"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
});

BlogForm.displayName = "BlogForm";
