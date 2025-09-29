"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export const Pagination = React.memo<PaginationProps>(({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false
}) => {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex justify-center gap-2 p-6 border-t bg-slate-50">
      {Array.from({ length: totalPages }, (_, i) => (
        <Button
          key={i}
          variant={currentPage === i + 1 ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(i + 1)}
          disabled={disabled}
          className={`w-10 h-10 ${
            currentPage === i + 1
              ? "bg-indigo-600 hover:bg-indigo-700"
              : "hover:bg-slate-100"
          }`}
        >
          {i + 1}
        </Button>
      ))}
    </div>
  );
});

Pagination.displayName = "Pagination";
