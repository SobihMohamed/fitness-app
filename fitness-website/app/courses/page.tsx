"use client";

import React, { useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

const CoursePagination = dynamic(
  () => import("@/components/client/courses/CoursePagination"),
  { 
    loading: () => <div className="h-16 bg-gray-100 animate-pulse rounded-lg" />
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

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CourseGrid
            courses={paginatedCourses}
            loading={loading}
          />
          
          {hasValidData && filteredCourses.length > 0 && (
            <CoursePagination
              currentPage={filter.page}
              totalPages={totalPages}
              pageSize={filter.pageSize}
              totalItems={filteredCourses.length}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </div>
      </section>
    </div>
  );
});

CoursesPage.displayName = "CoursesPage";

export default CoursesPage;
