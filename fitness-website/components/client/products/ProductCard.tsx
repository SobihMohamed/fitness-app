"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart } from "lucide-react";
import { ProtectedAction } from "@/components/auth/Protected-Route";
import { getProxyImageUrl } from "@/lib/images";
import type { ProductCardProps } from "@/types";

const isArabicText = (text: string) =>
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text);

const ProductCard = React.memo<ProductCardProps>(
  ({
    product,
    categories,
    isFavorite,
    onAddToCart,
    onToggleFavorite,
    priority = false,
  }) => {
    const descriptionIsArabic = React.useMemo(
      () => isArabicText(product.description || ""),
      [product.description],
    );
    const priceNumber = React.useMemo(() => {
      const n = Number(product.price);
      return Number.isFinite(n) ? n : null;
    }, [product.price]);
    const inStock = Number(product.stock_quantity) > 0;

    const handleAddToCart = React.useCallback(() => {
      if (!inStock) return;
      onAddToCart(product);
    }, [product, onAddToCart, inStock]);

    const handleToggleFavorite = React.useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleFavorite(Number(product.product_id));
      },
      [product.product_id, onToggleFavorite],
    );

    return (
      <Card className="group overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-white rounded-lg border-0 flex flex-col h-full">
        <CardHeader className="p-0 relative">
          <Link href={`/products/${product.product_id}`}>
            <div className="relative aspect-square overflow-hidden cursor-pointer">
              <Image
                src={getProxyImageUrl(product.image_url) || "/placeholder.svg"}
                alt={product.name}
                fill
                priority={priority}
                unoptimized
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
                isFavorite
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

        <CardContent className="p-4 flex flex-col h-full">
          <div className="mb-4">
            <Link href={`/products/${product.product_id}`}>
              <CardTitle className="text-lg font-bold text-foreground mb-2 break-words whitespace-normal group-hover:text-primary transition-colors cursor-pointer leading-snug">
                {product.name}
              </CardTitle>
            </Link>
            <CardDescription
              dir={descriptionIsArabic ? "rtl" : "ltr"}
              className={`text-sm text-muted-foreground line-clamp-2 leading-relaxed ${descriptionIsArabic ? "text-right" : "text-left"}`}
            >
              {product.description}
            </CardDescription>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-primary">
                {priceNumber !== null
                  ? `${priceNumber.toFixed(2)} EGP`
                  : "Price unavailable"}
              </span>
              <Badge
                variant={
                  product.stock_quantity > 0 ? "secondary" : "destructive"
                }
                className={`px-2.5 py-1 text-xs ${
                  product.stock_quantity > 0
                    ? "bg-green-100 text-green-800"
                    : ""
                }`}
              >
                {product.stock_quantity > 0 ? "In stock" : "Out of stock"}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3  mt-auto">
            <Link
              href={`/products/${product.product_id}`}
              className="col-span-2"
            >
              <Button
                className="w-full h-11 text-sm font-semibold rounded-md shadow-sm hover:shadow-md transition-all duration-300 bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                View Details
              </Button>
            </Link>

            {inStock ? (
              <ProtectedAction onAction={handleAddToCart}>
                <Button
                  className="w-full h-11 text-sm font-semibold rounded-md shadow-sm hover:shadow-md transition-all duration-300 bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
              </ProtectedAction>
            ) : (
              <Button
                disabled
                className="w-full h-11 text-sm font-semibold rounded-md shadow-sm transition-all duration-300 bg-gray-200 text-gray-500 cursor-not-allowed"
                size="lg"
              >
                Out of Stock
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  },
);

ProductCard.displayName = "ProductCard";

export default ProductCard;
