"use client";

import React, { useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
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
      const imagePath = getFullImageUrl(product.image_url);

      addItem({
        id: product.product_id.toString(),
        name: product.name,
        price: product.price,
        image: imagePath,
        category: categories.find((cat) => cat.category_id === product.category_id)?.name || "Unknown",
      });
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

      <section className="py-16 bg-white">
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
            <UnifiedPagination
              currentPage={filter.page}
              totalPages={totalPages}
              pageSize={filter.pageSize}
              totalItems={filteredProducts.length}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={[6, 12, 18, 24]}
              itemLabel="products"
            />
          )}
        </div>
      </section>
    </div>
  );
});

ProductsPage.displayName = "ProductsPage";

// Unified Pagination Component
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
}

const UnifiedPagination = React.memo<PaginationProps>(({ currentPage, totalPages, pageSize, totalItems, onPageChange, onPageSizeChange, pageSizeOptions = [6, 12, 24, 48], itemLabel = "items" }) => {
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  }, [currentPage, totalPages]);

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  const handlePageSizeChange = useCallback((value: string) => onPageSizeChange(Number(value)), [onPageSizeChange]);

  if (totalPages <= 1 && totalItems <= pageSize) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-6 border-t border-gray-200">
      <div className="text-sm text-gray-600 font-medium">
        Showing <span className="text-gray-900 font-semibold">{startItem}</span> to <span className="text-gray-900 font-semibold">{endItem}</span> of <span className="text-gray-900 font-semibold">{totalItems}</span> {itemLabel}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="border-gray-300 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Prev</span>
        </Button>
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => (
            <React.Fragment key={page === "..." ? `ellipsis-${index}` : page}>
              {page === "..." ? (
                <div className="px-2 py-2"><MoreHorizontal className="w-4 h-4 text-gray-400" /></div>
              ) : (
                <Button variant={currentPage === page ? "default" : "outline"} size="sm" onClick={() => onPageChange(page as number)} className={`min-w-[36px] h-9 transition-all ${currentPage === page ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm" : "border-gray-300 hover:bg-blue-50 hover:border-blue-300"}`}>
                  {page}
                </Button>
              )}
            </React.Fragment>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="border-gray-300 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 transition-colors">
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Show:</span>
        <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
          <SelectTrigger className="w-24 h-9 border-gray-300 hover:border-blue-300 transition-colors">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map(size => (
              <SelectItem key={size} value={size.toString()}>{size}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
});

UnifiedPagination.displayName = "UnifiedPagination";

export default ProductsPage;
