"use client";

import React, { useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-context";
import { toast } from "sonner";
import { getFullImageUrl } from "@/lib/images";
import { useProductsData } from "@/hooks/client/use-products-data";
import type { ClientProduct } from "@/types";

// Lazy load heavy components for better performance
const ProductsHeroSection = dynamic(
  () => import("@/components/client/products/ProductsHeroSection"),
  { 
    loading: () => <div className="h-96 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 animate-pulse rounded-lg" />
  }
);

const ProductsFilterSection = dynamic(
  () => import("@/components/client/products/ProductsFilterSection"),
  { 
    loading: () => <div className="h-32 bg-gray-100 animate-pulse rounded-lg" />
  }
);

const ProductGrid = dynamic(
  () => import("@/components/client/products/ProductGrid"),
  { 
    loading: () => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-96 bg-gray-100 animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }
);

const ProductPagination = dynamic(
  () => import("@/components/client/products/ProductPagination"),
  { 
    loading: () => <div className="h-16 bg-gray-100 animate-pulse rounded-lg" />
  }
);

const ProductsPage = React.memo(() => {
  const { addItem } = useCart();
  const {
    products,
    categories,
    loading,
    favorites,
    filter,
    filteredProducts,
    paginatedProducts,
    totalPages,
    actions,
  } = useProductsData();

  // Memoized handlers for better performance
  const handleAddToCart = useCallback(
    (product: ClientProduct) => {
      if (product.stock_quantity <= 0) {
        toast.error("This product is out of stock");
        return;
      }

      const imagePath = getFullImageUrl(product.image_url);

      addItem({
        id: product.product_id.toString(),
        name: product.name,
        price: product.price,
        stock: product.stock_quantity,
        image: imagePath,
        category: categories.find((cat) => cat.category_id === product.category_id)?.name || "Unknown",
      });

      toast.success(`${product.name} added to cart`);
    },
    [addItem, categories]
  );

  const handleSearchChange = useCallback((value: string) => {
    actions.updateFilter({ searchTerm: value });
  }, [actions]);

  const handleCategoryChange = useCallback((value: string) => {
    actions.updateFilter({ category: value });
  }, [actions]);

  const handleSortChange = useCallback((value: string) => {
    actions.updateFilter({ sortBy: value });
  }, [actions]);

  const handleFavoritesToggle = useCallback(() => {
    actions.updateFilter({ showFavoritesOnly: !filter.showFavoritesOnly });
  }, [actions, filter.showFavoritesOnly]);

  const handlePageChange = useCallback((page: number) => {
    actions.updateFilter({ page });
  }, [actions]);

  const handlePageSizeChange = useCallback((pageSize: number) => {
    actions.updateFilter({ pageSize, page: 1 });
  }, [actions]);

  // Memoized calculations for better performance
  const hasValidData = useMemo(() => 
    products && categories && !loading,
    [products, categories, loading]
  );

  const productStats = useMemo(() => ({
    totalProducts: products?.length || 0,
    totalCategories: categories?.length || 0,
    filteredCount: filteredProducts?.length || 0,
    favoriteCount: favorites?.size || 0
  }), [products, categories, filteredProducts, favorites]);

  // Show loading state with modern design
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-gray-700 text-lg font-medium">Loading products...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <ProductsHeroSection />

      <ProductsFilterSection
        searchTerm={filter.searchTerm}
        selectedCategory={filter.category}
        sortBy={filter.sortBy}
        showFavoritesOnly={filter.showFavoritesOnly}
        categories={categories}
        onSearchChange={handleSearchChange}
        onCategoryChange={handleCategoryChange}
        onSortChange={handleSortChange}
        onFavoritesToggle={handleFavoritesToggle}
      />

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProductGrid
            products={paginatedProducts}
            categories={categories}
            favorites={favorites}
            loading={loading}
            onAddToCart={handleAddToCart}
            onToggleFavorite={actions.toggleFavorite}
          />
          
          {hasValidData && filteredProducts.length > 0 && (
            <ProductPagination
              currentPage={filter.page}
              totalPages={totalPages}
              pageSize={filter.pageSize}
              totalItems={filteredProducts.length}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </div>
      </section>
    </div>
  );
});

ProductsPage.displayName = "ProductsPage";

export default ProductsPage;
