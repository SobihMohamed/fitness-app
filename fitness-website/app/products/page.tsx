"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useCart } from "@/contexts/cart-context";
import { toast } from "sonner";
import { getFullImageUrl } from "@/lib/images";
import { useProductsData } from "@/hooks/client/use-products-data";
import type { ClientProduct } from "@/types";
import { motion } from "framer-motion";

// Dynamic imports to prevent hydration mismatches
const ProductsHeroSection = dynamic(
  () => import("@/components/client/products/ProductsHeroSection"),
  { ssr: false }
);

const ProductsFilterSection = dynamic(
  () => import("@/components/client/products/ProductsFilterSection"),
  { ssr: false }
);

const ProductGrid = dynamic(
  () => import("@/components/client/products/ProductGrid"),
  { ssr: false }
);

const ProductPagination = dynamic(
  () => import("@/components/client/products/ProductPagination"),
  { ssr: false }
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

  // Handle add to cart with proper error checking
  const handleAddToCart = React.useCallback(
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

  // Memoized handlers for filter actions
  const handleSearchChange = React.useCallback((value: string) => {
    actions.updateFilter({ searchTerm: value });
  }, [actions]);

  const handleCategoryChange = React.useCallback((value: string) => {
    actions.updateFilter({ category: value });
  }, [actions]);

  const handleSortChange = React.useCallback((value: string) => {
    actions.updateFilter({ sortBy: value });
  }, [actions]);

  const handleFavoritesToggle = React.useCallback(() => {
    actions.updateFilter({ showFavoritesOnly: !filter.showFavoritesOnly });
  }, [actions, filter.showFavoritesOnly]);

  const handlePageChange = React.useCallback((page: number) => {
    actions.updateFilter({ page });
  }, [actions]);

  const handlePageSizeChange = React.useCallback((pageSize: number) => {
    actions.updateFilter({ pageSize, page: 1 });
  }, [actions]);

  return (
    <div className="min-h-screen bg-background">
       <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
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

      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProductGrid
            products={paginatedProducts}
            categories={categories}
            favorites={favorites}
            loading={loading}
            onAddToCart={handleAddToCart}
            onToggleFavorite={actions.toggleFavorite}
          />
          
          {!loading && filteredProducts.length > 0 && (
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
        </motion.div>
      
     
    </div>
  );
});

ProductsPage.displayName = "ProductsPage";

export default ProductsPage;
