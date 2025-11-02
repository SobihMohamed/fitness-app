"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { formatNumber } from "@/utils/format";
import type { BlogFilterSectionProps } from "@/types";

const BlogFilterSection = React.memo<BlogFilterSectionProps>(({
  selectedCategory,
  searchTerm,
  sortBy,
  categories,
  onCategoryChange,
  onSearchChange,
  onSortChange,
  loading = false
}) => {
  return (
    <section className="py-8 bg-gray-50 border-y sticky top-16 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-12 bg-white border-gray-200 focus:border-blue-600 focus:ring-blue-600/20 transition-all"
              disabled={loading}
            />
            {loading && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              </div>
            )}
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600">
              Sort by:
            </span>
            <div className="flex gap-2">
              {[
                { value: "latest", label: "Latest" },
                { value: "popular", label: "Popular" },
              ].map((option) => (
                <Button
                  key={option.value}
                  variant={sortBy === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => onSortChange(option.value)}
                  className={
                    sortBy === option.value
                      ? "rounded-full bg-blue-600 text-white border-0 shadow-sm"
                      : "rounded-full border-gray-200 text-blue-700 "
                  }
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-3 mt-6">
          {categories.map((category) => (
            <Button
              key={category.id || category.name}
              variant={selectedCategory === category.name ? "default" : "outline"}
              onClick={() => onCategoryChange(category.name)}
              className={`rounded-full transition-all duration-200 hover:scale-105 ${
                selectedCategory === category.name
                  ? "shadow-lg bg-blue-600 text-white border-0"
                  : "bg-white border border-gray-200 text-blue-700 "
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full mr-2 ${
                  selectedCategory === category.name ? "bg-white" : "bg-blue-600"
                }`}
              ></div>
              {category.name} ({formatNumber(category.count)})
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
});

BlogFilterSection.displayName = "BlogFilterSection";

export default BlogFilterSection;
