"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Heart, Star, Share2, Plus, Minus, Truck, Shield, RotateCcw } from "lucide-react";
import { ProtectedAction } from "@/components/auth/Protected-Route";
import { PrimaryButton } from "@/components/common";
import type { ProductDetailsInfoProps } from "@/types";

const ProductDetailsInfo = React.memo<ProductDetailsInfoProps>(({
  product,
  quantity,
  isFavorite,
  onQuantityChange,
  onAddToCart,
  onToggleFavorite,
  onShare,
}) => {
  const handleQuantityDecrease = React.useCallback(() => {
    onQuantityChange(Math.max(1, quantity - 1));
  }, [quantity, onQuantityChange]);

  const handleQuantityIncrease = React.useCallback(() => {
    onQuantityChange(quantity + 1);
  }, [quantity, onQuantityChange]);

  const handleQuantityInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number.parseInt(e.target.value || "1", 10);
    if (Number.isNaN(val)) {
      onQuantityChange(1);
      return;
    }
    const clamped = Math.max(1, val);
    onQuantityChange(clamped);
  }, [onQuantityChange]);

  const handleQuantityKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      onQuantityChange(quantity + 1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      onQuantityChange(Math.max(1, quantity - 1));
    }
  }, [quantity, onQuantityChange]);

  const handleQuantityBlur = React.useCallback(() => {
    onQuantityChange(Math.max(1, quantity));
  }, [quantity, onQuantityChange]);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">{product.name}</h1>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onToggleFavorite}
              className="rounded-full w-12 h-12 bg-transparent border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onShare}
              className="rounded-full w-12 h-12 bg-transparent border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <span className="text-4xl font-bold text-primary">{product.price.toFixed(2)} EGP</span>
          <Badge
            variant={
              Number.isFinite(product.stock_quantity)
                ? product.stock_quantity > 10
                  ? "secondary"
                  : product.stock_quantity > 0
                    ? "outline"
                    : "destructive"
                : "secondary"
            }
            className="px-4 py-2"
          >
            {Number.isFinite(product.stock_quantity)
              ? product.stock_quantity > 0
                ? `${product.stock_quantity} in stock`
                : "Out of stock"
              : "In stock"}
          </Badge>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-5 h-5 ${i < 4 ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
            ))}
          </div>
          <span className="text-sm text-muted">(4.0) • 128 reviews</span>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold mb-3">Description</h3>
        <p className="text-muted-foreground leading-relaxed">{product.description}</p>
      </div>

      <Separator />

      {/* Quantity Selector */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="font-medium text-gray-700">Quantity:</span>
          <div className="flex items-center border rounded-lg border-gray-200 shadow-sm">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleQuantityDecrease}
              disabled={quantity <= 1}
              className="rounded-r-none hover:bg-gray-50 transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={handleQuantityInputChange}
              onKeyDown={handleQuantityKeyDown}
              onBlur={handleQuantityBlur}
              className="px-4 py-2 min-w-[3rem] w-16 text-center outline-none border-0 focus:ring-0"
              aria-label="Quantity"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={handleQuantityIncrease}
              className="rounded-l-none hover:bg-gray-50 transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <ProtectedAction onAction={onAddToCart}>
          <Button
            size="lg"
            disabled={Number.isFinite(product.stock_quantity) && product.stock_quantity === 0}
            className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            {Number.isFinite(product.stock_quantity)
              ? product.stock_quantity > 0
                ? "Add to Cart"
                : "Out of Stock"
              : "Add to Cart"}
          </Button>
        </ProtectedAction>
      </div>

      {/* Features */}
      <div className="grid grid-cols-3 gap-4 pt-6">
        <div className="text-center p-4 rounded-lg bg-gray-50">
          <Truck className="w-6 h-6 mx-auto mb-2 text-primary" />
          <p className="text-sm font-medium">Free Shipping</p>
          <p className="text-xs text-muted">On orders over 50 EGP</p>
        </div>
        <div className="text-center p-4 rounded-lg bg-gray-50">
          <Shield className="w-6 h-6 mx-auto mb-2 text-primary" />
          <p className="text-sm font-medium">Warranty</p>
          <p className="text-xs text-muted">1 year guarantee</p>
        </div>
        <div className="text-center p-4 rounded-lg bg-gray-50">
          <RotateCcw className="w-6 h-6 mx-auto mb-2 text-primary" />
          <p className="text-sm font-medium">Returns</p>
          <p className="text-xs text-muted">30-day policy</p>
        </div>
      </div>
    </div>
  );
});

ProductDetailsInfo.displayName = "ProductDetailsInfo";

export default ProductDetailsInfo;
