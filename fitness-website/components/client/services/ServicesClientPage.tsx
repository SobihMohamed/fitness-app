"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ClientService } from "@/types";
import { useServices } from "@/hooks/queries";
import ServicesGrid from "./ServicesGrid";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
}

const UnifiedPagination = React.memo<PaginationProps>(
  ({
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [6, 12, 24, 48],
    itemLabel = "items",
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

    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);
    const handlePageSizeChange = useCallback(
      (value: string) => onPageSizeChange(Number(value)),
      [onPageSizeChange],
    );

    if (totalPages <= 1 && totalItems <= pageSize) return null;

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-600 font-medium">
          Showing{" "}
          <span className="text-gray-900 font-semibold">{startItem}</span> to{" "}
          <span className="text-gray-900 font-semibold">{endItem}</span> of{" "}
          <span className="text-gray-900 font-semibold">{totalItems}</span>{" "}
          {itemLabel}
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
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Show:</span>
          <Select
            value={pageSize.toString()}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="w-24 h-9 border-gray-300 hover:border-blue-300 transition-colors">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  },
);

UnifiedPagination.displayName = "UnifiedPagination";

interface ServicesClientPageProps {
  initialServices?: ClientService[];
}

export function ServicesClientPage({
  initialServices = [],
}: ServicesClientPageProps) {
  const {
    data: services = initialServices,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useServices(initialServices.length > 0 ? initialServices : undefined);

  const error = queryError
    ? (queryError as Error).message || "Failed to load services"
    : null;
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const retryFetch = useCallback(() => {
    refetch();
  }, [refetch]);

  // Memoized calculations for better performance
  const hasServices = useMemo(
    () => !loading && !error && services.length > 0,
    [loading, error, services.length],
  );
  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return services.slice(start, start + pageSize);
  }, [services, page, pageSize]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-gray-700 text-lg font-medium">
            Loading services...
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Plans */}
      <section
        id="plans"
        className="py-16 bg-white"
        aria-labelledby="plans-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2
              id="plans-heading"
              className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent"
            >
              Plans & Pricing
            </h2>
            <p className="text-gray-600 text-lg">
              Simple, transparent pricing. Cancel anytime.
            </p>
          </div>
        </div>
      </section>
      {/* Services Grid */}
      <section
        id="services"
        className="py-16 bg-slate-50"
        aria-labelledby="services-list"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="services-list" className="sr-only">
            Available Services
          </h2>

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-12">
              <Card className="max-w-md mx-auto shadow-2xl">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Failed to Load Services
                  </h2>
                  <p className="text-gray-600 mb-6">{error}</p>
                  <Button
                    onClick={retryFetch}
                    className="px-6 bg-blue-600 hover:bg-blue-700"
                  >
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Services Grid - Dynamic Data */}
          {hasServices && <ServicesGrid services={paged} />}
          {hasServices && (
            <UnifiedPagination
              currentPage={page}
              totalPages={Math.ceil(services.length / pageSize)}
              pageSize={pageSize}
              totalItems={services.length}
              onPageChange={(p) => setPage(p)}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
              pageSizeOptions={[6, 12, 18, 24]}
              itemLabel="services"
            />
          )}

          {/* Empty State */}
          {!loading && !error && services.length === 0 && (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No Services Available
                </h3>
                <p className="text-muted-foreground mb-4">
                  We're currently updating our services. Please check back
                  later.
                </p>
                <Button onClick={retryFetch}>Refresh</Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
