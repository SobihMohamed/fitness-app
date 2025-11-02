"use client";

import React, { useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { useCoursesData } from "@/hooks/client/use-courses-data";

// Lazy load heavy components for better performance
const CoursesHeroSection = dynamic(
  () => import("@/components/client/courses/CoursesHeroSection"),
  { 
    loading: () => <div className="h-96 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 animate-pulse rounded-lg" />
  }
);

const CoursesFilterSection = dynamic(
  () => import("@/components/client/courses/CoursesFilterSection"),
  { 
    loading: () => <div className="h-32 bg-gray-100 animate-pulse rounded-lg" />
  }
);

const CourseGrid = dynamic(
  () => import("@/components/client/courses/CourseGrid"),
  { 
    loading: () => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-80 bg-gray-100 animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }
);

const CoursesPage = React.memo(() => {
  const {
    courses,
    loading,
    filter,
    filteredCourses,
    paginatedCourses,
    totalPages,
    actions,
  } = useCoursesData();

  // Memoized handlers for filter actions
  const handleSearchChange = useCallback((value: string) => {
    actions.updateFilter({ searchTerm: value });
  }, [actions]);

  const handleSortChange = useCallback((value: string) => {
    actions.updateFilter({ sortBy: value });
  }, [actions]);

  const handlePageChange = useCallback((page: number) => {
    actions.updateFilter({ page });
  }, [actions]);

  const handlePageSizeChange = useCallback((pageSize: number) => {
    actions.updateFilter({ pageSize, page: 1 });
  }, [actions]);

  // Memoized calculations for better performance
  const hasValidData = useMemo(() => 
    courses && !loading,
    [courses, loading]
  );

  const courseStats = useMemo(() => ({
    totalCourses: courses?.length || 0,
    filteredCount: filteredCourses?.length || 0,
    currentPage: filter.page,
    totalPages
  }), [courses, filteredCourses, filter.page, totalPages]);

  // Show loading state with modern design
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-gray-700 text-lg font-medium">Loading courses...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <CoursesHeroSection />

      <CoursesFilterSection
        searchTerm={filter.searchTerm}
        sortBy={filter.sortBy}
        onSearchChange={handleSearchChange}
        onSortChange={handleSortChange}
      />

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CourseGrid
            courses={paginatedCourses}
            loading={loading}
          />
          
          {hasValidData && filteredCourses.length > 0 && (
            <UnifiedPagination
              currentPage={filter.page}
              totalPages={totalPages}
              pageSize={filter.pageSize}
              totalItems={filteredCourses.length}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={[6, 12, 24, 48]}
              itemLabel="courses"
            />
          )}
        </div>
      </section>
    </div>
  );
});

CoursesPage.displayName = "CoursesPage";

// Unified Pagination Component
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

const UnifiedPagination = React.memo<PaginationProps>(({ currentPage, totalPages, pageSize, totalItems, onPageChange, onPageSizeChange, pageSizeOptions = [6, 12, 24, 48], itemLabel = "items" }) => {
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  }, [currentPage, totalPages]);

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  const handlePageSizeChange = useCallback((value: string) => onPageSizeChange(Number(value)), [onPageSizeChange]);

  if (totalPages <= 1 && totalItems <= pageSize) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-6 border-t border-gray-200">
      <div className="text-sm text-gray-600 font-medium">
        Showing <span className="text-gray-900 font-semibold">{startItem}</span> to <span className="text-gray-900 font-semibold">{endItem}</span> of <span className="text-gray-900 font-semibold">{totalItems}</span> {itemLabel}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="border-gray-300 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Prev</span>
        </Button>
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => (
            <React.Fragment key={page === "..." ? `ellipsis-${index}` : page}>
              {page === "..." ? (
                <div className="px-2 py-2"><MoreHorizontal className="w-4 h-4 text-gray-400" /></div>
              ) : (
                <Button variant={currentPage === page ? "default" : "outline"} size="sm" onClick={() => onPageChange(page as number)} className={`min-w-[36px] h-9 transition-all ${currentPage === page ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm" : "border-gray-300 hover:bg-blue-50 hover:border-blue-300"}`}>
                  {page}
                </Button>
              )}
            </React.Fragment>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="border-gray-300 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 transition-colors">
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Show:</span>
        <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
          <SelectTrigger className="w-24 h-9 border-gray-300 hover:border-blue-300 transition-colors">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map(size => (
              <SelectItem key={size} value={size.toString()}>{size}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
});

UnifiedPagination.displayName = "UnifiedPagination";

export default CoursesPage;
