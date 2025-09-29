"use client";

import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination } from "@/components/common";
import type { ProductPaginationProps } from "@/types";

const ProductPagination = React.memo<ProductPaginationProps>(({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}) => {
  const handlePageSizeChange = React.useCallback((value: string) => {
    onPageSizeChange(Number(value));
  }, [onPageSizeChange]);

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-16 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="text-sm text-muted-foreground font-medium">
        Page {currentPage} of {totalPages} • {totalItems} items
      </div>
      <div className="flex items-center gap-4">
        <Pagination
          total={totalItems}
          page={currentPage}
          pageSize={pageSize}
          onPageChange={onPageChange}
          className="flex items-center gap-2"
        />
        <div className="ml-4">
          <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="w-28 h-9 bg-white border-gray-200 hover:border-gray-300 transition-colors">
              <SelectValue placeholder="Page size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="8">8 / page</SelectItem>
              <SelectItem value="12">12 / page</SelectItem>
              <SelectItem value="16">16 / page</SelectItem>
              <SelectItem value="24">24 / page</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
});

ProductPagination.displayName = "ProductPagination";

export default ProductPagination;
