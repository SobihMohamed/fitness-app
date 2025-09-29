"use client";

import React from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useCoursesData } from "@/hooks/client/use-courses-data";

// Dynamic imports to prevent hydration mismatches
const CoursesHeroSection = dynamic(
  () => import("@/components/client/courses/CoursesHeroSection"),
  { ssr: false }
);

const CoursesFilterSection = dynamic(
  () => import("@/components/client/courses/CoursesFilterSection"),
  { ssr: false }
);

const CourseGrid = dynamic(
  () => import("@/components/client/courses/CourseGrid"),
  { ssr: false }
);

const CoursePagination = dynamic(
  () => import("@/components/client/courses/CoursePagination"),
  { ssr: false }
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
  const handleSearchChange = React.useCallback((value: string) => {
    actions.updateFilter({ searchTerm: value });
  }, [actions]);

  const handleSortChange = React.useCallback((value: string) => {
    actions.updateFilter({ sortBy: value });
  }, [actions]);

  const handlePageChange = React.useCallback((page: number) => {
    actions.updateFilter({ page });
  }, [actions]);

  const handlePageSizeChange = React.useCallback((pageSize: number) => {
    actions.updateFilter({ pageSize, page: 1 });
  }, [actions]);

  return (
    <div className="min-h-screen bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <CoursesHeroSection />

        <CoursesFilterSection
          searchTerm={filter.searchTerm}
          sortBy={filter.sortBy}
          onSearchChange={handleSearchChange}
          onSortChange={handleSortChange}
        />

        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <CourseGrid
              courses={paginatedCourses}
              loading={loading}
            />
            
            {!loading && filteredCourses.length > 0 && (
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
      </motion.div>
    </div>
  );
});

CoursesPage.displayName = "CoursesPage";

export default CoursesPage;
