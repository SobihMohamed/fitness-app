"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/utils/format";

interface CategoryFilterItem {
  id?: string;
  name: string;
  count: number;
  color?: string;
}

interface CategoryFilterProps {
  categories: CategoryFilterItem[];
  selectedCategory: string;
  onCategoryChange: (categoryName: string) => void;
  className?: string;
}

export const CategoryFilter = React.memo<CategoryFilterProps>(({
  categories,
  selectedCategory,
  onCategoryChange,
  className = ""
}) => {
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {categories.map((category, idx) => (
        <Button
          key={`${category.name}-${idx}`}
          variant={selectedCategory === category.name ? "default" : "outline"}
          onClick={() => onCategoryChange(category.name)}
          className={`rounded-full transition-all duration-200 hover:scale-105 ${
            selectedCategory === category.name
              ? "shadow-lg bg-blue-600 text-white border-0"
              : "bg-white border border-gray-200 text-blue-700 hover:bg-gray-50"
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
  );
});

CategoryFilter.displayName = "CategoryFilter";
