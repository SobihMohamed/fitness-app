"use client";

import React from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { getProxyImageUrl } from "@/lib/images";
import type { ProductDetailsImageGalleryProps } from "@/types";

const ProductDetailsImageGallery = React.memo<ProductDetailsImageGalleryProps>(({
  product,
  activeImage,
  onImageChange,
}) => {
  const handleImageChange = React.useCallback((image: string) => {
    onImageChange(image);
  }, [onImageChange]);

  return (
    <div className="relative">
      <div className="aspect-square relative overflow-hidden rounded-xl bg-gray-100 border border-gray-100 shadow-sm">
        <Image
          src={getProxyImageUrl(activeImage || undefined) || "/placeholder.svg"}
          alt={product.name}
          fill
          priority
          style={{ objectFit: "cover" }}
          className="rounded-lg transition-transform duration-500 hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        {Number.isFinite(product.stock_quantity) && product.stock_quantity === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Badge variant="destructive" className="text-white font-semibold px-6 py-3 text-lg">
              Out of Stock
            </Badge>
          </div>
        )}
      </div>
      
      {/* Thumbnails */}
      {product.sub_images && product.sub_images.length > 0 && (
        <div className="grid grid-cols-5 gap-3 mt-4">
          {[product.image_url, ...product.sub_images]
            .filter(Boolean)
            .slice(0, 10)
            .map((img, idx) => (
              <button
                key={idx}
                onClick={() => handleImageChange(img as string)}
                className={`relative aspect-square rounded-md overflow-hidden border hover:shadow-md transition-all ${
                  activeImage === img ? "border-primary shadow-sm" : "border-transparent"
                }`}
                aria-label={`Thumbnail ${idx + 1}`}
              >
                <Image
                  src={getProxyImageUrl(img as string) || "/placeholder.svg"}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  style={{ objectFit: "cover" }}
                  className="transition-transform duration-300 hover:scale-110"
                  sizes="(max-width: 768px) 20vw, 10vw"
                />
              </button>
            ))}
        </div>
      )}
    </div>
  );
});

ProductDetailsImageGallery.displayName = "ProductDetailsImageGallery";

export default ProductDetailsImageGallery;
