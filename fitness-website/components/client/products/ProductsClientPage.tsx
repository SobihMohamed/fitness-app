"use client";

import React, { useCallback, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { getFullImageUrl } from "@/lib/images";
import { useProductsData } from "@/hooks/client/use-products-data";
import type { ClientProduct, ClientCategory } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import ProductsFilterSection from "@/components/client/products/ProductsFilterSection";
import ProductGrid from "@/components/client/products/ProductGrid";

// Define Pagination Component locally to avoid cross-file import issues if it was in the page file
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

const UnifiedPagination = React.memo<PaginationProps>(
  ({
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [6, 12, 24, 48],
    itemLabel = "items",
  }) => {
    const pageNumbers = useMemo(() => {
      const pages: (number | string)[] = [];
      const maxVisiblePages = 5;
      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
      } else {
        if (currentPage <= 3) {
          pages.push(1, 2, 3, 4, "...", totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(
            1,
            "...",
            totalPages - 3,
            totalPages - 2,
            totalPages - 1,
            totalPages,
          );
        } else {
          pages.push(
            1,
            "...",
            currentPage - 1,
            currentPage,
            currentPage + 1,
            "...",
            totalPages,
          );
        }
      }
      return pages;
    }, [currentPage, totalPages]);

    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);
    const handlePageSizeChange = useCallback(
      (value: string) => onPageSizeChange(Number(value)),
      [onPageSizeChange],
    );

    if (totalPages <= 1 && totalItems <= pageSize) return null;

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-600 font-medium">
          Showing{" "}
          <span className="text-gray-900 font-semibold">{startItem}</span> to{" "}
          <span className="text-gray-900 font-semibold">{endItem}</span> of{" "}
          <span className="text-gray-900 font-semibold">{totalItems}</span>{" "}
          {itemLabel}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="border-gray-200 text-gray-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 disabled:opacity-50 transition-all duration-200 shadow-sm"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Prev</span>
          </Button>
          <div className="flex items-center gap-1">
            {pageNumbers.map((page, index) => (
              <React.Fragment key={page === "..." ? `ellipsis-${index}` : page}>
                {page === "..." ? (
                  <div className="px-2 py-2">
                    <MoreHorizontal className="w-4 h-4 text-gray-400" />
                  </div>
                ) : (
                  <Button
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(page as number)}
                    className={`min-w-[36px] h-9 transition-all duration-200 ${
                      currentPage === page
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md transform scale-105"
                        : "border-gray-200 text-gray-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-sm"
                    }`}
                  >
                    {page}
                  </Button>
                )}
              </React.Fragment>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="border-gray-200 text-gray-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 disabled:opacity-50 transition-all duration-200 shadow-sm"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Show:</span>
          <Select
            value={pageSize.toString()}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="w-24 h-9 border-gray-300 hover:border-blue-300 transition-colors">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  },
);

UnifiedPagination.displayName = "UnifiedPagination";

interface ProductsClientPageProps {
  initialProducts?: ClientProduct[];
  initialCategories?: ClientCategory[];
}

const ProductsClientPage = React.memo<ProductsClientPageProps>(() => {
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

  const handleAddToCart = useCallback(
    (product: ClientProduct) => {
      const imagePath = getFullImageUrl(product.image_url);
      addItem({
        id: product.product_id.toString(),
        name: product.name,
        price: product.price,
        image: imagePath,
        category:
          categories.find((cat) => cat.category_id === product.category_id)
            ?.name || "Unknown",
      });
    },
    [addItem, categories],
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      actions.updateFilter({ searchTerm: value });
    },
    [actions],
  );

  const handleCategoryChange = useCallback(
    (value: string) => {
      actions.updateFilter({ category: value });
    },
    [actions],
  );

  const handleSortChange = useCallback(
    (value: string) => {
      actions.updateFilter({ sortBy: value });
    },
    [actions],
  );

  const handleFavoritesToggle = useCallback(() => {
    actions.updateFilter({ showFavoritesOnly: !filter.showFavoritesOnly });
  }, [actions, filter.showFavoritesOnly]);

  const handleClearFilters = useCallback(() => {
    actions.updateFilter({
      searchTerm: "",
      category: "",
      sortBy: "",
      showFavoritesOnly: false,
      page: 1,
    });
  }, [actions]);

  const handlePageChange = useCallback(
    (page: number) => {
      actions.updateFilter({ page });
    },
    [actions],
  );

  const handlePageSizeChange = useCallback(
    (pageSize: number) => {
      actions.updateFilter({ pageSize, page: 1 });
    },
    [actions],
  );

  const hasValidData = useMemo(
    () => products && categories && !loading,
    [products, categories, loading],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-gray-700 text-lg font-medium">
            Loading products...
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
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
            onClearFilters={handleClearFilters}
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
    </>
  );
});

ProductsClientPage.displayName = "ProductsClientPage";

export default ProductsClientPage;
