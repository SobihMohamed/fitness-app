"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Heart } from "lucide-react";
import type { ProductsFilterSectionProps } from "@/types";

const ProductsFilterSection = React.memo<ProductsFilterSectionProps>(({
  searchTerm,
  selectedCategory,
  sortBy,
  showFavoritesOnly,
  categories,
  onSearchChange,
  onCategoryChange,
  onSortChange,
  onFavoritesToggle,
}) => {
  return (
    <section className="py-8 bg-gray-50 border-y sticky top-16 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-12 bg-white border-gray-200 focus:border-primary focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <Select value={selectedCategory} onValueChange={onCategoryChange}>
              <SelectTrigger className="w-full sm:w-56 h-12 bg-white border-gray-200 hover:border-gray-300 transition-colors">
                <Filter className="h-4 w-4 mr-2 text-primary" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.category_id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-full sm:w-56 h-12 bg-white border-gray-200 hover:border-gray-300 transition-colors">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant={showFavoritesOnly ? "default" : "outline"}
              className={`h-12 ${
                showFavoritesOnly
                  ? "bg-primary text-white"
                  : "bg-white border-gray-200 hover:border-gray-300 transition-colors"
              }`}
              onClick={onFavoritesToggle}
            >
              <Heart
                className={`w-4 h-4 mr-2 ${
                  showFavoritesOnly ? "fill-current" : ""
                }`}
              />
              Favorites Only
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
});

ProductsFilterSection.displayName = "ProductsFilterSection";

export default ProductsFilterSection;
