"use client";

import React, { useCallback, useMemo } from "react";
import { useCart } from "@/contexts/cart-context";
import { useProductsData } from "@/hooks/client/use-products-data";
import { getFullImageUrl } from "@/lib/images";
import type { ClientProduct, ClientCategory } from "@/types";
import ProductGrid from "./ProductGrid";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal, Heart } from "lucide-react";

interface FavoritesClientPageProps {
  initialProducts?: ClientProduct[];
  initialCategories?: ClientCategory[];
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

const Pagination = React.memo<PaginationProps>(
  ({
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    onPageChange,
    onPageSizeChange,
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

    const handlePageSizeChange = useCallback(
      (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = Number(event.target.value);
        onPageSizeChange(value);
      },
      [onPageSizeChange],
    );

    if (totalPages <= 1 && totalItems <= pageSize) return null;

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-600 font-medium">
          Showing{" "}
          <span className="text-gray-900 font-semibold">
            {(currentPage - 1) * pageSize + 1}
          </span>{" "}
          to
          <span className="text-gray-900 font-semibold">
            {" "}
            {Math.min(currentPage * pageSize, totalItems)}
          </span>{" "}
          of
          <span className="text-gray-900 font-semibold">
            {" "}
            {totalItems}
          </span>{" "}
          favorites
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="border-gray-300 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 transition-colors"
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
                    className={`min-w-[36px] h-9 transition-all ${currentPage === page ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm" : "border-gray-300 hover:bg-blue-50 hover:border-blue-300"}`}
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
            className="border-gray-300 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 transition-colors"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <label htmlFor="pageSize" className="font-medium">
            Show:
          </label>
          <select
            id="pageSize"
            value={pageSize}
            onChange={handlePageSizeChange}
            className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {[6, 12, 18, 24].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  },
);

Pagination.displayName = "Pagination";

const FavoritesClientPage = React.memo(
  ({
    initialProducts = [],
    initialCategories = [],
  }: FavoritesClientPageProps) => {
    const { addItem } = useCart();
    const {
      categories,
      favorites,
      loading,
      filteredProducts,
      paginatedProducts,
      totalPages,
      filter,
      actions,
    } = useProductsData(initialProducts, initialCategories, {
      initialShowFavoritesOnly: true,
    });

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

    const hasFavorites = favorites.size > 0;

    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
              <p className="text-gray-600">
                Products you have marked with the heart icon.
              </p>
            </div>
          </div>

          {!hasFavorites && !loading ? (
            <div className="text-center py-20 border border-dashed border-gray-200 rounded-xl bg-gray-50">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-red-400">
                  <Heart className="w-8 h-8" />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                No favorites yet
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Tap the heart on any product to add it here. Your saved items
                will appear in this list.
              </p>
              <Button
                variant="default"
                className="mt-6 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => (window.location.href = "/products")}
              >
                Browse products
              </Button>
            </div>
          ) : (
            <>
              <ProductGrid
                products={paginatedProducts}
                categories={categories}
                favorites={favorites}
                loading={loading}
                onAddToCart={handleAddToCart}
                onToggleFavorite={actions.toggleFavorite}
                onClearFilters={() =>
                  actions.updateFilter({
                    searchTerm: "",
                    category: "",
                    sortBy: "",
                  })
                }
              />

              {filteredProducts.length > 0 && (
                <Pagination
                  currentPage={filter.page}
                  totalPages={totalPages}
                  pageSize={filter.pageSize}
                  totalItems={filteredProducts.length}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              )}
            </>
          )}
        </div>
      </section>
    );
  },
);

FavoritesClientPage.displayName = "FavoritesClientPage";

export default FavoritesClientPage;
