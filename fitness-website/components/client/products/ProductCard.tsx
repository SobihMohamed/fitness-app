"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart } from "lucide-react";
import { ProtectedAction } from "@/components/auth/Protected-Route";
import { PrimaryButton } from "@/components/common";
import { getProxyImageUrl } from "@/lib/images";
import type { ProductCardProps } from "@/types";

const ProductCard = React.memo<ProductCardProps>(({
  product,
  categories,
  favorites,
  onAddToCart,
  onToggleFavorite,
  priority = false,
}) => {
  const handleAddToCart = React.useCallback(() => {
    onAddToCart(product);
  }, [product, onAddToCart]);

  const handleToggleFavorite = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(product.product_id);
  }, [product.product_id, onToggleFavorite]);

  return (
    <Card className="group overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white rounded-xl border-0">
      <CardHeader className="p-0 relative">
        <Link href={`/products/${product.product_id}`}>
          <div className="relative aspect-square overflow-hidden cursor-pointer">
            <Image
              src={getProxyImageUrl(product.image_url) || "/placeholder.svg"}
              alt={product.name}
              fill
              priority={priority}
              style={{ objectFit: "cover" }}
              className="group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          </div>
        </Link>

        <Button
          size="sm"
          variant="ghost"
          className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
          onClick={handleToggleFavorite}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              favorites.has(product.product_id)
                ? "fill-red-500 text-red-500"
                : "text-gray-600 hover:text-red-500"
            }`}
          />
        </Button>

        {product.stock_quantity === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
            <Badge
              variant="destructive"
              className="text-white font-semibold px-4 py-2 text-sm uppercase tracking-wider"
            >
              Out of Stock
            </Badge>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="mb-4">
          <Link href={`/products/${product.product_id}`}>
            <CardTitle className="text-xl font-bold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors cursor-pointer">
              {product.name}
            </CardTitle>
          </Link>
          <CardDescription className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {product.description}
          </CardDescription>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">
              {product.price.toFixed(2)} EGP
            </span>
            <Badge
              variant={
                product.stock_quantity > 10
                  ? "secondary"
                  : product.stock_quantity > 0
                  ? "outline"
                  : "destructive"
              }
              className={`px-3 py-1 ${
                product.stock_quantity > 10
                  ? "bg-green-100 text-green-800"
                  : product.stock_quantity > 0
                  ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                  : ""
              }`}
            >
              {product.stock_quantity > 0
                ? `${product.stock_quantity} left`
                : "Out of stock"}
            </Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mt-4">
          <Link href={`/products/${product.product_id}`} className="col-span-2">
            <PrimaryButton
              className="w-full transition-all duration-300 font-medium"
              size="lg"
              variant="primary"
            >
              View Details
            </PrimaryButton>
          </Link>

          <ProtectedAction onAction={handleAddToCart}>
            <PrimaryButton
              disabled={product.stock_quantity === 0}
              className="w-full transition-all duration-300 font-medium"
              size="lg"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {product.stock_quantity > 0 ? "Add to Cart" : "Out of Stock"}
            </PrimaryButton>
          </ProtectedAction>
        </div>
      </CardContent>
    </Card>
  );
});

ProductCard.displayName = "ProductCard";

export default ProductCard;
