"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface SortOption {
  value: string;
  label: string;
}

interface SortOptionsProps {
  options: SortOption[];
  selectedSort: string;
  onSortChange: (sort: string) => void;
  label?: string;
  className?: string;
}

export const SortOptions = React.memo<SortOptionsProps>(({
  options,
  selectedSort,
  onSortChange,
  label = "Sort by:",
  className = ""
}) => {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <span className="text-sm font-medium text-gray-600">
        {label}
      </span>
      <div className="flex gap-2">
        {options.map((option) => (
          <Button
            key={option.value}
            variant={selectedSort === option.value ? "default" : "outline"}
            size="sm"
            onClick={() => onSortChange(option.value)}
            className={
              selectedSort === option.value
                ? "rounded-full bg-blue-600 text-white border-0 shadow-sm"
                : "rounded-full border-gray-200 text-blue-700 hover:bg-gray-50"
            }
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
});

SortOptions.displayName = "SortOptions";
