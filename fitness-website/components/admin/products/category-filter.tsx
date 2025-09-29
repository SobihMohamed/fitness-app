"use client";

import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Category } from "@/types";

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  onAddCategory: () => void;
  onManageCategories: () => void;
  maxPrimary?: number;
}

export const CategoryFilter = React.memo<CategoryFilterProps>(({
  categories,
  selectedCategory,
  onCategoryChange,
  onAddCategory,
  onManageCategories,
  maxPrimary = 8,
}) => {
  const { primaryCategories, overflowCategories } = useMemo(() => ({
    primaryCategories: categories.slice(0, maxPrimary),
    overflowCategories: categories.slice(maxPrimary),
  }), [categories, maxPrimary]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h2 className="text-lg font-semibold text-slate-800">
          Product Categories
        </h2>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={onManageCategories}
            className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Manage Categories
          </Button>
        </div>
      </div>
      
      <div className="relative">
        <div className="flex items-center gap-2 py-2 overflow-x-auto">
          <button
            onClick={() => onCategoryChange("all")}
            className={`whitespace-nowrap px-4 py-2 rounded-full border text-sm transition-colors shadow-sm ${
              selectedCategory === "all"
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            All
          </button>

          {primaryCategories.map((cat) => (
            <button
              key={cat.category_id}
              onClick={() => onCategoryChange(String(cat.category_id))}
              className={`whitespace-nowrap px-4 py-2 rounded-full border text-sm transition-colors shadow-sm ${
                selectedCategory === String(cat.category_id)
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {cat.name}
            </button>
          ))}

          {overflowCategories.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="whitespace-nowrap px-4 py-2 rounded-full border text-sm transition-colors shadow-sm bg-white text-slate-700 border-slate-200 hover:bg-slate-50">
                  +{overflowCategories.length} more
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="max-h-72 overflow-auto"
              >
                <DropdownMenuLabel>More Categories</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {overflowCategories.map((cat) => (
                  <DropdownMenuItem
                    key={cat.category_id}
                    onClick={() => onCategoryChange(String(cat.category_id))}
                  >
                    {cat.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
});

CategoryFilter.displayName = "CategoryFilter";
