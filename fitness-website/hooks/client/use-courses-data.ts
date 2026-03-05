"use client";

import { useState, useMemo, useCallback } from "react";
import { useCourses } from "@/hooks/queries";

interface Course {
  course_id: number;
  title: string;
  description: string;
  price: number;
  image: string;
  instructor?: string;
  duration?: string;
  level?: string;
  students_count?: number;
  rating?: number;
  created_at: string;
  is_subscribed?: boolean;
}

interface CoursesFilter {
  searchTerm: string;
  sortBy: string;
  page: number;
  pageSize: number;
}

interface CoursesActions {
  updateFilter: (updates: Partial<CoursesFilter>) => void;
}

export function useCoursesData(initialCourses?: any[]) {
  // React Query handles fetching, caching, retries, and background revalidation
  const { data: courses = [], isLoading: loading } = useCourses(initialCourses);

  const [filter, setFilter] = useState<CoursesFilter>({
    searchTerm: "",
    sortBy: "newest",
    page: 1,
    pageSize: 6,
  });

  const updateFilter = useCallback((updates: Partial<CoursesFilter>) => {
    setFilter((prev) => ({ ...prev, ...updates }));
  }, []);

  // Filter and sort courses (derived state, no extra fetch)
  const filteredCourses = useMemo(() => {
    let filtered = [...(courses as Course[])];

    if (filter.searchTerm) {
      const term = filter.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title?.toLowerCase().includes(term) ||
          c.description?.toLowerCase().includes(term) ||
          c.instructor?.toLowerCase().includes(term),
      );
    }

    switch (filter.sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "students":
        filtered.sort(
          (a, b) => (b.students_count || 0) - (a.students_count || 0),
        );
        break;
      case "newest":
      default:
        filtered.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        break;
    }
    return filtered;
  }, [courses, filter.searchTerm, filter.sortBy]);

  const totalPages = useMemo(
    () => Math.ceil(filteredCourses.length / filter.pageSize) || 1,
    [filteredCourses.length, filter.pageSize],
  );

  const paginatedCourses = useMemo(() => {
    const start = (filter.page - 1) * filter.pageSize;
    return filteredCourses.slice(start, start + filter.pageSize);
  }, [filteredCourses, filter.page, filter.pageSize]);

  const actions: CoursesActions = useMemo(
    () => ({ updateFilter }),
    [updateFilter],
  );

  return {
    courses,
    loading,
    filter,
    filteredCourses,
    paginatedCourses,
    totalPages,
    actions,
  };
}
