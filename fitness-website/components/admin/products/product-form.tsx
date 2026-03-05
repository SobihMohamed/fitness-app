"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Package,
  Save,
  X,
  Loader2,
  ImageIcon,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { getProxyImageUrl, withCacheBuster } from "@/lib/images";
import type { Product, Category, ProductFormData } from "@/types";

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    formData: ProductFormData,
    mainImage?: File,
    subImages?: File[],
  ) => Promise<void>;
  categories: Category[];
  products: Product[];
  editingProduct?: Product | null;
  isSubmitting: boolean;
  onRemoveSubImage?: (imagePath: string) => Promise<void>;
  onReplaceSubImage?: (
    oldImagePath: string,
    file: File,
    existingImages: string[],
  ) => Promise<void>;
  onReloadEditingProduct?: () => Promise<Product | null | undefined>;
  isSubUploading?: boolean;
  cacheBuster?: number;
}

export const ProductForm = React.memo<ProductFormProps>(
  ({
    isOpen,
    onClose,
    onSubmit,
    categories,
    products,
    editingProduct,
    isSubmitting,
    onRemoveSubImage,
    onReplaceSubImage,
    onReloadEditingProduct,
    isSubUploading,
    cacheBuster,
  }) => {
    const [formData, setFormData] = useState<ProductFormData>({
      name: "",
      category_id: "",
      price: "",
      is_in_stock: "",
      description: "",
      main_image_url: "",
    });
    const [selectedMainImage, setSelectedMainImage] = useState<File | null>(
      null,
    );
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [existingGallery, setExistingGallery] = useState<string[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const NAME_MIN = 3;
    const NAME_MAX = 50;
    const DESC_MIN = 10;
    const DESC_MAX = 500;
    const PRICE_MIN = 1;
    const PRICE_MAX = 100000;
    const MAX_IMAGE_MB = 5;

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
          setExistingGallery(
            Array.isArray(editingProduct.sub_images)
              ? editingProduct.sub_images
              : [],
          );
        } else {
          setFormData({
            name: "",
            category_id: "",
            price: "",
            is_in_stock: "",
            description: "",
            main_image_url: "",
          });
          setExistingGallery([]);
        }
        setSelectedMainImage(null);
        setSelectedImages([]);
        setErrors({});
      }
    }, [isOpen, editingProduct]);

    const handleFormDataChange = useCallback(
      (field: keyof ProductFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => {
          if (!prev[field]) return prev;
          const next = { ...prev };
          delete next[field];
          return next;
        });
      },
      [],
    );

    const handleMainImageChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
          if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
            setErrors((prev) => ({
              ...prev,
              main_image_url: `Image size must be less than ${MAX_IMAGE_MB}MB`,
            }));
            return;
          }
          if (!file.type.startsWith("image/")) {
            setErrors((prev) => ({
              ...prev,
              main_image_url: "Please select a valid image file",
            }));
            return;
          }
        }
        setSelectedMainImage(file);
        setErrors((prev) => {
          if (!prev.main_image_url) return prev;
          const next = { ...prev };
          delete next.main_image_url;
          return next;
        });
      },
      [],
    );

    const handleSubImagesChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const validFiles: File[] = [];

        for (const file of files) {
          if (file.size > MAX_IMAGE_MB * 1024 * 1024) continue;
          if (!file.type.startsWith("image/")) continue;
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
      },
      [],
    );

    const validate = useCallback(() => {
      const next: Record<string, string> = {};
      const name = formData.name.trim();
      const desc = formData.description.trim();
      const priceNum = Number(formData.price);

      if (!name) next.name = "Product name is required";
      else if (name.length < NAME_MIN)
        next.name = `The minimum length of the product name field is ${NAME_MIN} characters`;
      else if (name.length > NAME_MAX)
        next.name = `The maximum length of the product name field is ${NAME_MAX} characters`;

      if (!formData.category_id) next.category_id = "Please select a category";

      if (!formData.price) next.price = "Price is required";
      else if (!Number.isFinite(priceNum))
        next.price = "Please enter a valid price";
      else if (!Number.isInteger(priceNum))
        next.price = "Price must be a whole number";
      else if (priceNum < PRICE_MIN)
        next.price = `The minimum price is ${PRICE_MIN}`;
      else if (priceNum > PRICE_MAX)
        next.price = `The maximum price is ${PRICE_MAX}`;

      if (!formData.is_in_stock)
        next.is_in_stock = "Please choose stock status";

      if (!editingProduct && !selectedMainImage)
        next.main_image_url = "Product image is required";

      if (desc) {
        if (desc.length < DESC_MIN)
          next.description = `The minimum length of the product description field is ${DESC_MIN} characters`;
        else if (desc.length > DESC_MAX)
          next.description = `The maximum length of the product description field is ${DESC_MAX} characters`;
      }

      if (name) {
        const normalized = name.toLowerCase();
        const duplicate = products.some((p) => {
          if (
            editingProduct &&
            String(p.product_id) === String(editingProduct.product_id)
          )
            return false;
          return (
            String(p.name || "")
              .trim()
              .toLowerCase() === normalized
          );
        });
        if (duplicate) next.name = "A product with this name already exists";
      }

      setErrors(next);
      return Object.keys(next).length === 0;
    }, [
      DESC_MAX,
      DESC_MIN,
      NAME_MAX,
      NAME_MIN,
      PRICE_MAX,
      PRICE_MIN,
      editingProduct,
      formData,
      products,
      selectedMainImage,
    ]);

    const handleSubmit = useCallback(
      async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        try {
          await onSubmit(
            formData,
            selectedMainImage || undefined,
            selectedImages,
          );
          onClose();
        } catch (error) {
          // Error is handled in the parent component
        }
      },
      [
        formData,
        selectedMainImage,
        selectedImages,
        onSubmit,
        onClose,
        validate,
      ],
    );

    const handleRemoveExistingImage = useCallback(
      async (path: string) => {
        if (!editingProduct || !onRemoveSubImage) return;
        await onRemoveSubImage(path);
        setExistingGallery((prev) => prev.filter((p) => p !== path));
        if (onReloadEditingProduct) {
          const refreshed = await onReloadEditingProduct();
          if (refreshed && Array.isArray(refreshed.sub_images)) {
            setExistingGallery(refreshed.sub_images);
          }
        }
      },
      [editingProduct, onRemoveSubImage, onReloadEditingProduct],
    );

    const handleReplaceExistingImage = useCallback(
      async (oldPath: string, file: File) => {
        if (!editingProduct || !onReplaceSubImage) return;
        const existing = Array.isArray(editingProduct.sub_images)
          ? editingProduct.sub_images
          : [];
        await onReplaceSubImage(oldPath, file, existing);
        if (onReloadEditingProduct) {
          const refreshed = await onReloadEditingProduct();
          if (refreshed && Array.isArray(refreshed.sub_images)) {
            setExistingGallery(refreshed.sub_images);
          }
        }
      },
      [editingProduct, onReplaceSubImage, onReloadEditingProduct],
    );

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

          <form noValidate onSubmit={handleSubmit} className="space-y-8 p-6">
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
                  minLength={NAME_MIN}
                  maxLength={NAME_MAX}
                  disabled={isSubmitting}
                  className="h-12 border-slate-200 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200"
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name}</p>
                )}
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
                    handleFormDataChange("category_id", val)
                  }
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
                {errors.category_id && (
                  <p className="text-sm text-red-600">{errors.category_id}</p>
                )}
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
                    step="1"
                    min={String(PRICE_MIN)}
                    max={String(PRICE_MAX)}
                    placeholder="0"
                    value={formData.price}
                    onChange={(e) =>
                      handleFormDataChange("price", e.target.value)
                    }
                    disabled={isSubmitting}
                    className="h-12 pl-12 border-slate-200 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200"
                  />
                </div>
                {errors.price && (
                  <p className="text-sm text-red-600">{errors.price}</p>
                )}
              </div>

              {/* Stock Status */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <span>Stock Status</span>
                  <span className="text-rose-500">*</span>
                </label>
                <Select
                  value={formData.is_in_stock}
                  onValueChange={(val) =>
                    handleFormDataChange("is_in_stock", val)
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
                {errors.is_in_stock && (
                  <p className="text-sm text-red-600">{errors.is_in_stock}</p>
                )}
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
                onChange={(e) =>
                  handleFormDataChange("description", e.target.value)
                }
                disabled={isSubmitting}
                rows={4}
                minLength={DESC_MIN}
                maxLength={DESC_MAX}
                className="border-slate-200 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200"
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Main Product Image */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700">
                  Product Image
                  {!editingProduct && <span className="text-rose-500"> *</span>}
                </label>
                <div className="space-y-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageChange}
                    disabled={isSubmitting}
                    className="h-12 border-slate-200 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  {errors.main_image_url && (
                    <p className="text-sm text-red-600">
                      {errors.main_image_url}
                    </p>
                  )}
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
                  {!selectedMainImage && editingProduct?.main_image_url && (
                    <div className="relative w-40 h-40 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                      <img
                        src={withCacheBuster(
                          getProxyImageUrl(editingProduct.main_image_url),
                          cacheBuster,
                        )}
                        alt={editingProduct.name || "Current main image"}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
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
                  <div>
                    <input
                      id="product-gallery-images"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleSubImagesChange}
                      disabled={isSubmitting}
                      className="hidden"
                    />
                    <label
                      htmlFor="product-gallery-images"
                      className={`h-12 w-full border border-slate-200 rounded-lg shadow-sm transition-all duration-200 inline-flex items-center px-3 gap-3 ${
                        isSubmitting
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : "bg-white cursor-pointer hover:border-indigo-300 focus-within:border-indigo-500"
                      }`}
                    >
                      <span className="inline-flex items-center justify-center rounded-md bg-indigo-50 text-indigo-700 text-sm font-medium px-4 py-2">
                        Choose Files
                      </span>
                      <span className="text-sm text-slate-500">
                        {selectedImages.length > 0
                          ? `${selectedImages.length} image${selectedImages.length > 1 ? "s" : ""} selected`
                          : "No files selected"}
                      </span>
                    </label>
                  </div>
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

                  {/* Existing Gallery (edit mode) */}
                  {editingProduct && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-slate-700">
                          Current Gallery
                        </label>
                        <span className="text-xs text-slate-500">
                          Replace or remove images
                        </span>
                      </div>
                      {existingGallery.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {existingGallery.map((path, idx) => (
                            <div
                              key={`${path}-${idx}`}
                              className="relative w-full aspect-square rounded-lg overflow-hidden border border-slate-200 bg-white shadow-sm group"
                            >
                              <img
                                src={withCacheBuster(
                                  getProxyImageUrl(path),
                                  cacheBuster,
                                )}
                                alt={`Gallery image ${idx + 1}`}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                              <label className="absolute top-2 left-2 z-10 h-8 w-8 p-0 inline-flex items-center justify-center rounded-full bg-white/90 border border-slate-200 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <RefreshCw className="h-4 w-4 text-slate-700" />
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  disabled={isSubmitting || isSubUploading}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      void handleReplaceExistingImage(
                                        path,
                                        file,
                                      );
                                    }
                                    e.currentTarget.value = "";
                                  }}
                                />
                              </label>
                              <Button
                                type="button"
                                size="icon"
                                variant="destructive"
                                disabled={isSubmitting || isSubUploading}
                                onClick={() => handleRemoveExistingImage(path)}
                                className="absolute top-2 right-2 z-10 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label="Remove image"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500">
                          No gallery images yet.
                        </p>
                      )}
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
                className="px-8 py-6 bg-white hover:bg-slate-50 hover:text-slate-800 border-slate-200 text-slate-700 rounded-xl shadow-sm transition-all duration-200 font-medium"
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
  },
);

ProductForm.displayName = "ProductForm";
