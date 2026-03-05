"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingCart,
  Heart,
  Share2,
  Plus,
  Minus,
  Truck,
  Shield,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import { ProtectedAction } from "@/components/auth/Protected-Route";
import type { ProductDetailsInfoProps } from "@/types";

const isArabicText = (text: string) =>
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text);

const ProductDetailsInfo = React.memo<ProductDetailsInfoProps>(
  ({
    product,
    quantity,
    isFavorite,
    onQuantityChange,
    onAddToCart,
    onToggleFavorite,
    onShare,
  }) => {
    const descriptionIsArabic = React.useMemo(
      () => isArabicText(product.description || ""),
      [product.description],
    );
    const priceText = React.useMemo(() => {
      const raw = product?.price;
      const n = Number(raw);

      if (Number.isFinite(n)) {
        return `${n.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} EGP`;
      }

      // Fallback to stringified raw value when not numeric
      if (raw === null || raw === undefined) return "0.00 EGP";
      return `${String(raw)} EGP`;
    }, [product?.price]);
    const inStock = React.useMemo(() => {
      const stock = Number(product.stock_quantity);
      return !Number.isFinite(stock) || stock > 0;
    }, [product.stock_quantity]);

    const handleQuantityDecrease = React.useCallback(() => {
      if (!inStock) return;
      onQuantityChange(Math.max(1, quantity - 1));
    }, [quantity, onQuantityChange, inStock]);

    const handleQuantityIncrease = React.useCallback(() => {
      if (!inStock) return;
      onQuantityChange(Math.min(50, quantity + 1));
    }, [quantity, onQuantityChange, inStock]);

    const handleQuantityInputChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!inStock) return;
        const val = Number.parseInt(e.target.value || "1", 10);
        if (Number.isNaN(val)) {
          onQuantityChange(1);
          return;
        }
        const clamped = Math.min(50, Math.max(1, val));
        onQuantityChange(clamped);
      },
      [onQuantityChange, inStock],
    );

    const handleQuantityKeyDown = React.useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!inStock) return;
        if (e.key === "ArrowUp") {
          e.preventDefault();
          onQuantityChange(Math.min(50, quantity + 1));
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          onQuantityChange(Math.max(1, quantity - 1));
        }
      },
      [quantity, onQuantityChange, inStock],
    );

    const handleQuantityBlur = React.useCallback(() => {
      if (!inStock) return;
      onQuantityChange(Math.min(50, Math.max(1, quantity)));
    }, [quantity, onQuantityChange, inStock]);

    return (
      <div className="flex flex-col h-full space-y-6">
        {/* Header: Title and Actions */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              <span className="block max-w-full break-all whitespace-normal leading-tight">
                {product.name}
              </span>
            </h1>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="icon"
                variant="outline"
                onClick={onToggleFavorite}
                className="rounded-full w-10 h-10 border-slate-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-500 transition-all duration-200"
                title={
                  isFavorite ? "Remove from favorites" : "Add to favorites"
                }
              >
                <Heart
                  className={`w-5 h-5 ${isFavorite ? "fill-rose-500 text-rose-500" : "text-slate-400"}`}
                />
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={onShare}
                className="rounded-full w-10 h-10 border-slate-200 text-slate-500 hover:bg-blue-600 hover:text-white hover:border-blue-600 shadow-sm hover:shadow focus-visible:ring-2 focus-visible:ring-blue-500 transition-all duration-200"
                title="Share product"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Price
              </span>
              <span className="text-3xl font-black text-blue-600">
                {priceText}
              </span>
            </div>
            <div className="h-10 w-px bg-slate-200 hidden sm:block mx-2" />
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Availability
              </span>
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
                className={`px-3 py-1 font-medium ${
                  !Number.isFinite(product.stock_quantity) ||
                  product.stock_quantity > 0
                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none"
                    : ""
                }`}
              >
                {!Number.isFinite(product.stock_quantity)
                  ? "In stock"
                  : product.stock_quantity > 0
                    ? `${product.stock_quantity} units left`
                    : "Out of stock"}
              </Badge>
            </div>
          </div>
        </div>

        <Separator className="bg-slate-100" />

        {/* Purchase Controls - Moved up to minimize scrolling */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <span className="text-sm font-bold text-slate-900 uppercase tracking-widest">
                Select Quantity
              </span>
              <div className="flex items-center bg-slate-100 rounded-xl p-1 w-fit">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleQuantityDecrease}
                  disabled={!inStock || quantity <= 1}
                  className="rounded-lg h-10 w-10 text-slate-600 hover:bg-blue-600 hover:text-white hover:shadow-sm disabled:opacity-30 transition-all"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={quantity}
                  onChange={handleQuantityInputChange}
                  onKeyDown={handleQuantityKeyDown}
                  onBlur={handleQuantityBlur}
                  className="bg-transparent font-bold text-lg text-slate-900 w-16 text-center outline-none border-0 focus:ring-0 disabled:opacity-50"
                  disabled={!inStock}
                  aria-label="Quantity"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleQuantityIncrease}
                  disabled={!inStock || quantity >= 50}
                  className="rounded-lg h-10 w-10 text-slate-600 hover:bg-blue-600 hover:text-white hover:shadow-sm transition-all disabled:opacity-30"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 max-w-xl w-full">
              {inStock ? (
                <ProtectedAction onAction={onAddToCart}>
                  <Button
                    size="lg"
                    className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-blue-100 shadow-lg hover:shadow-blue-200 transition-all duration-300 flex items-center justify-center gap-3"
                  >
                    <ShoppingCart className="w-6 h-6" />
                    Add to Cart
                  </Button>
                </ProtectedAction>
              ) : (
                <Button
                  size="lg"
                  disabled
                  className="w-full h-14 text-lg font-bold bg-slate-100 text-slate-400 cursor-not-allowed rounded-xl flex items-center justify-center gap-3"
                >
                  <AlertCircle className="w-6 h-6" />
                  Out of Stock
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 pt-2">
            <div className="flex flex-col items-center text-center gap-1.5">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-1">
                <Truck className="w-5 h-5" />
              </div>
              <p className="text-[11px] font-bold text-slate-900 uppercase tracking-tighter">
                Free Delivery
              </p>
              <p className="text-[10px] text-slate-500 leading-tight">
                Orders over 50 EGP
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-1.5">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-1">
                <Shield className="w-5 h-5" />
              </div>
              <p className="text-[11px] font-bold text-slate-900 uppercase tracking-tighter">
                Genuine
              </p>
              <p className="text-[10px] text-slate-500 leading-tight">
                1 Year Warranty
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-1.5">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-1">
                <RotateCcw className="w-5 h-5" />
              </div>
              <p className="text-[11px] font-bold text-slate-900 uppercase tracking-tighter">
                Returns
              </p>
              <p className="text-[10px] text-slate-500 leading-tight">
                30-day policy
              </p>
            </div>
          </div>
        </div>

        <Separator className="bg-slate-100" />

        {/* Description */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-3">
            Product Story
          </h3>
          <p
            dir={descriptionIsArabic ? "rtl" : "ltr"}
            className={`text-slate-600 leading-relaxed text-base ${descriptionIsArabic ? "text-right font-arabic" : "text-left"}`}
          >
            {product.description}
          </p>
        </div>
      </div>
    );
  },
);

ProductDetailsInfo.displayName = "ProductDetailsInfo";

export default ProductDetailsInfo;
