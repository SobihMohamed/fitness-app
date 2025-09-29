"use client";

import React, { useCallback } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getProxyImageUrl } from "@/lib/images";
import { Package, Edit3, X, Trash2, RefreshCw } from "lucide-react";
import type { Product, Category } from "@/types";

interface ProductDetailsDialogProps {
  product: Product | null;
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  onEdit: (product: Product) => void;
  onImagePreview: (imageUrl: string) => void;
  onRemoveSubImage: (imagePath: string) => void;
  onReplaceSubImage: (oldImagePath: string, file: File, existingImages: string[]) => void;
  isSubUploading: boolean;
  cacheBuster?: number;
}

export const ProductDetailsDialog = React.memo<ProductDetailsDialogProps>(({
  product,
  categories,
  isOpen,
  onClose,
  onEdit,
  onImagePreview,
  onRemoveSubImage,
  onReplaceSubImage,
  isSubUploading,
  cacheBuster,
}) => {
  const getCategoryName = useCallback((categoryId: string) => {
    return categories.find(c => c.category_id === categoryId)?.name || "Unknown";
  }, [categories]);

  const handleReplaceFile = useCallback((e: React.ChangeEvent<HTMLInputElement>, oldPath: string) => {
    const file = e.target.files?.[0];
    if (file && product) {
      onReplaceSubImage(oldPath, file, product.sub_images || []);
    }
    if (e.target) e.target.value = "";
  }, [onReplaceSubImage, product]);

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl border-none shadow-2xl bg-white">
        <DialogHeader className="p-8 bg-gradient-to-br from-blue-600 to-indigo-700 border-b relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] opacity-30"></div>
          <DialogTitle className="flex items-center gap-4 text-2xl font-bold relative z-10 text-white">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-sm">
              <Package className="h-6 w-6 text-white" />
            </div>
            Product Details
          </DialogTitle>
          <DialogDescription className="text-blue-100/90 relative z-10 mt-3 text-base">
            View complete product information and gallery images
          </DialogDescription>
        </DialogHeader>

        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="relative w-full h-64 lg:h-96 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
              <img
                src={
                  product.main_image_url
                    ? `${getProxyImageUrl(product.main_image_url)}${typeof cacheBuster === 'number' ? `&v=${cacheBuster}` : ''}`
                    : "/placeholder.svg"
                }
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-slate-900">
                {product.name}
              </h3>
              <div className="space-y-2">
                <p className="text-slate-600">
                  <strong>Price:</strong> {product.price} EGP
                </p>
                <p className="text-slate-600">
                  <strong>Stock Status:</strong>
                  <Badge
                    className={`ml-2 ${
                      product.is_in_stock === "1"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {product.is_in_stock === "1" ? "In Stock" : "Out of Stock"}
                  </Badge>
                </p>
                <p className="text-slate-600">
                  <strong>Category:</strong> {getCategoryName(product.category_id)}
                </p>
                {product.description && (
                  <div>
                    <p className="text-slate-600 font-medium">Description:</p>
                    <p className="text-slate-700 mt-1">{product.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sub Images Gallery */}
          <div>
            <div className="flex items-center justify-between mb-4 gap-3">
              <h4 className="text-lg font-semibold text-slate-800">
                Gallery Images
              </h4>
            </div>
            
            {Array.isArray(product.sub_images) && product.sub_images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {product.sub_images.map((path, idx) => (
                  <div
                    key={`${path}-${idx}`}
                    className="relative w-full aspect-square rounded-lg overflow-hidden border border-slate-200 bg-white shadow-sm group"
                  >
                    <button
                      type="button"
                      onClick={() => onImagePreview(getProxyImageUrl(path))}
                      className="absolute inset-0"
                      aria-label={`Open image ${idx + 1}`}
                    />
                    <img
                      src={`${getProxyImageUrl(path)}${typeof cacheBuster === 'number' ? `&v=${cacheBuster}` : ''}`}
                      alt={`Gallery image ${idx + 1}`}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                    {/* Replace button with hidden input */}
                    <label
                      className="absolute top-2 left-2 h-8 w-8 p-0 inline-flex items-center justify-center rounded-full bg-white/90 border border-slate-200 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"

                    >
                      <RefreshCw className="h-4 w-4 text-slate-700" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={isSubUploading}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleReplaceFile(e, path);
                        }}
                      />
                    </label>
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      disabled={isSubUploading}
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveSubImage(path);
                      }}
                      className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove image"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-500 text-sm">No gallery images yet.</div>
            )}
          </div>

          <div className="flex justify-end items-center pt-6 mt-6 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="mr-auto hover:bg-slate-100 border-slate-300 text-slate-600 font-medium px-5"
            >
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onEdit(product)}
                className="hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-150"
              >
                <Edit3 className="h-4 w-4 text-indigo-600 mr-2" />
                Edit Product
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

ProductDetailsDialog.displayName = "ProductDetailsDialog";
