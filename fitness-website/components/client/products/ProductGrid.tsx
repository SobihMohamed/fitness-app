"use client";

import React from "react";
import { Search } from "lucide-react";
import ProductCard from "./ProductCard";
import { CardSkeleton, PrimaryButton } from "@/components/common";
import type { ProductGridProps } from "@/types";

const ProductGrid = React.memo<ProductGridProps>(({
  products,
  categories,
  favorites,
  loading,
  onAddToCart,
  onToggleFavorite,
}) => {
  const handleClearFilters = React.useCallback(() => {
    // This will be handled by parent component
  }, []);

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
        {Array(12)
          .fill(0)
          .map((_, index) => (
            <CardSkeleton key={`skeleton-${index}`} />
          ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="col-span-full text-center py-20">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
            <Search className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-3">
            No products found
          </h3>
          <p className="text-muted mb-6">
            Try adjusting your search terms or filters to find what you're looking for.
          </p>
          <PrimaryButton onClick={handleClearFilters} variant="outline">
            Clear Filters
          </PrimaryButton>
        </div>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
      {products.map((product) => (
        <ProductCard
          key={product.product_id}
          product={product}
          categories={categories}
          favorites={favorites}
          onAddToCart={onAddToCart}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
});

ProductGrid.displayName = "ProductGrid";

export default ProductGrid;
