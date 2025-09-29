"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Save, X, Loader2, ImageIcon } from "lucide-react";
import type { Product, Category, ProductFormData } from "@/types";

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: ProductFormData, mainImage?: File, subImages?: File[]) => Promise<void>;
  categories: Category[];
  editingProduct?: Product | null;
  isSubmitting: boolean;
}

export const ProductForm = React.memo<ProductFormProps>(({
  isOpen,
  onClose,
  onSubmit,
  categories,
  editingProduct,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    category_id: "",
    price: "",
    is_in_stock: "",
    description: "",
    main_image_url: "",
  });
  const [selectedMainImage, setSelectedMainImage] = useState<File | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  // Reset form when dialog opens/closes or editing product changes
  useEffect(() => {
    if (isOpen) {
      if (editingProduct) {
        setFormData({
          name: editingProduct.name,
          category_id: editingProduct.category_id,
          price: editingProduct.price,
          is_in_stock: editingProduct.is_in_stock,
          description: editingProduct.description,
          main_image_url: editingProduct.main_image_url,
        });
      } else {
        setFormData({
          name: "",
          category_id: "",
          price: "",
          is_in_stock: "",
          description: "",
          main_image_url: "",
        });
      }
      setSelectedMainImage(null);
      setSelectedImages([]);
    }
  }, [isOpen, editingProduct]);

  const handleFormDataChange = useCallback((field: keyof ProductFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleMainImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert(`Image ${file.name} file size must be less than 5MB`);
        return;
      }
      if (!file.type.startsWith("image/")) {
        alert(`Please select a valid image file for ${file.name}`);
        return;
      }
    }
    setSelectedMainImage(file);
  }, []);

  const handleSubImagesChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        alert(`Image ${file.name} file size must be less than 5MB`);
        continue;
      }
      if (!file.type.startsWith("image/")) {
        alert(`Please select a valid image file for ${file.name}`);
        continue;
      }
      validFiles.push(file);
    }
    
    setSelectedImages(prev => {
      const combined = [...prev, ...validFiles];
      const seen = new Set<string>();
      return combined.filter(f => {
        const key = `${f.name}-${f.size}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    });
    
    if (e.target) e.target.value = "";
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price) {
      alert("Product name and price are required");
      return;
    }
    if (!formData.category_id) {
      alert("Please select a category");
      return;
    }

    try {
      await onSubmit(formData, selectedMainImage || undefined, selectedImages);
      onClose();
    } catch (error) {
      // Error is handled in the parent component
    }
  }, [formData, selectedMainImage, selectedImages, onSubmit, onClose]);

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      onClose();
    }
  }, [isSubmitting, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 rounded-xl border-none shadow-2xl">
        <DialogHeader className="p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] opacity-30"></div>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold text-slate-800">
            <div className="p-2 bg-indigo-100 rounded-lg shadow-sm">
              <Package className="h-6 w-6 text-indigo-600" />
            </div>
            {editingProduct ? "Edit Product" : "Add New Product"}
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            {editingProduct
              ? "Update the product information below."
              : "Fill in the details to add a new product to your platform."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-8 p-6">
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
                onChange={(e) => handleFormDataChange("name", e.target.value)}
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
                onValueChange={(val) => handleFormDataChange("category_id", val)}
                disabled={isSubmitting}
              >
                <SelectTrigger className="h-12 border-slate-200 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="rounded-lg border-slate-200 shadow-lg">
                  {categories.map((cat) => (
                    <SelectItem key={cat.category_id} value={cat.category_id}>
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
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  EGP
                </span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => handleFormDataChange("price", e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="h-12 pl-12 border-slate-200 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200"
                />
              </div>
            </div>

            {/* Stock Status */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <span>Stock Status</span>
              </label>
              <Select
                value={formData.is_in_stock}
                onValueChange={(val) => handleFormDataChange("is_in_stock", val)}
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
          </div>

          {/* Description */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700">
              Product Description
            </label>
            <Textarea
              placeholder="Enter a brief description of the product"
              value={formData.description}
              onChange={(e) => handleFormDataChange("description", e.target.value)}
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
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleMainImageChange}
                  disabled={isSubmitting}
                  className="h-12 border-slate-200 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                {selectedMainImage && (
                  <div className="relative w-40 h-40 rounded-lg overflow-hidden border-2 border-indigo-100 shadow-md">
                    <img
                      src={URL.createObjectURL(selectedMainImage)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="absolute bottom-2 right-2 h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-md rounded-full border-slate-200"
                      onClick={() => setSelectedMainImage(null)}
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
                Gallery Images{" "}
                <span className="text-slate-500 text-xs">(Optional)</span>
              </label>
              <div className="space-y-4">
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleSubImagesChange}
                  disabled={isSubmitting}
                  className="h-12 border-slate-200 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                {selectedImages.length > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 rounded-lg text-indigo-700 text-sm">
                    <ImageIcon className="h-4 w-4" />
                    {selectedImages.length} image
                    {selectedImages.length > 1 ? "s" : ""} selected
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedImages([])}
                      className="ml-auto h-6 w-6 p-0 hover:bg-indigo-200 rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-4 pt-8 border-t border-slate-100 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
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
  );
});

ProductForm.displayName = "ProductForm";
