"use client";

import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronDown, Tag } from "lucide-react";
import type { CategoryPillsProps } from "@/types/blog";

export const CategoryPills = React.memo(({
  categories,
  selectedCategory,
  onCategoryChange,
  maxPrimary = 8
}: CategoryPillsProps) => {
  // Memoize category filtering to prevent unnecessary recalculations
  const { primaryCategories, overflowCategories } = useMemo(() => {
    const primary = categories.slice(0, maxPrimary);
    const overflow = categories.slice(maxPrimary);
    return { primaryCategories: primary, overflowCategories: overflow };
  }, [categories, maxPrimary]);

  return (
    <div className="w-full">
      <div className="relative">
        <div className="flex items-center gap-2 py-2 -mx-1 px-1 overflow-hidden">
          <TooltipProvider>
            {/* All pill */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedCategory !== "all") {
                      onCategoryChange("all");
                    }
                  }}
                  className={`whitespace-nowrap px-4 py-2 rounded-full border text-sm transition-colors shadow-sm ${
                    selectedCategory === "all"
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  All
                </button>
              </TooltipTrigger>
              <TooltipContent>Show all categories</TooltipContent>
            </Tooltip>

            {/* Primary categories */}
            {primaryCategories.map((cat) => (
              <Tooltip key={cat.id || `category-${Math.random()}`}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => {
                      const id = String(cat.id);
                      if (selectedCategory !== id) {
                        onCategoryChange(id);
                      }
                    }}
                    className={`whitespace-nowrap px-4 py-2 rounded-full border text-sm transition-colors shadow-sm ${
                      selectedCategory === String(cat.id)
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                    title={cat.name}
                  >
                    {cat.name}
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-center overflow-hidden">
                  {(cat.description && cat.description.trim()) || "No description"}
                </TooltipContent>
              </Tooltip>
            ))}

            {/* Overflow in More dropdown */}
            {overflowCategories.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={`whitespace-nowrap px-4 py-2 rounded-full border text-sm transition-colors shadow-sm flex items-center gap-1 ${
                      selectedCategory !== "all" &&
                      overflowCategories.some(
                        (c) => String(c.id) === selectedCategory
                      )
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                    aria-label="More categories"
                  >
                    More <ChevronDown className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 overflow-hidden"
                >
                  <DropdownMenuLabel>More Categories</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-72 overflow-y-auto overflow-x-hidden pr-2">
                    {overflowCategories.map((cat) => (
                      <DropdownMenuItem
                        key={cat.id || `overflow-${Math.random()}`}
                        onClick={() => {
                          const id = String(cat.id);
                          if (selectedCategory !== id) {
                            onCategoryChange(id);
                          }
                        }}
                        className="flex flex-col items-start gap-0.5"
                      >
                        <span className="text-sm text-slate-800">
                          {cat.name}
                        </span>
                        <span className="text-xs text-slate-500 line-clamp-1 break-words overflow-hidden">
                          {(cat.description && cat.description.trim()) ||
                            "No description"}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
});

CategoryPills.displayName = "CategoryPills";
