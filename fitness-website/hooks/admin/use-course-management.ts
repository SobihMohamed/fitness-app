"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { courseApi } from "@/lib/api/courses";
import { useAdminApi } from "./use-admin-api";
import type { Course } from "@/types";

interface CourseManagementState {
  courses: Course[];
  loading: {
    initial: boolean;
    courses: boolean;
  };
  searchTerm: string;
  currentPage: number;
  pagination: {
    itemsPerPage: number;
  };
}

interface CourseManagementActions {
  fetchCourses: () => Promise<void>;
  setSearchTerm: (term: string) => void;
  setCurrentPage: (page: number) => void;
  setFilters: (filters: { searchTerm: string }) => void;
}

interface CourseManagementReturn extends CourseManagementState, CourseManagementActions {
  filteredCourses: Course[];
  sortedCourses: Course[];
  totalPages: number;
  debouncedSearchTerm: string;
  remoteSearchCourses: Course[] | null;
}

export function useCourseManagement(): CourseManagementReturn {
  const { getAuthHeaders, showErrorToast } = useAdminApi();
  
  // State
  const [courses, setCourses] = useState<Course[]>([]);
  const [remoteSearchCourses, setRemoteSearchCourses] = useState<Course[] | null>(null);
  const [loading, setLoading] = useState({
    initial: true,
    courses: false,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  const pagination = { itemsPerPage: 10 };

  // Override API auth headers
  useEffect(() => {
    courseApi.getAuthHeaders = (includeContentType = true) => {
      const headers = getAuthHeaders(includeContentType);
      return headers;
    };
  }, [getAuthHeaders]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Remote search when debounced term changes
  useEffect(() => {
    const term = debouncedSearchTerm.trim();
    if (!term) {
      setRemoteSearchCourses(null);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const results = await courseApi.searchCourses(term);
        if (!cancelled) {
          setRemoteSearchCourses(results);
          setCurrentPage(1);
        }
      } catch (err: any) {
        if (!cancelled) {
          // Fail silently for search to keep UX smooth
          setRemoteSearchCourses([]);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [debouncedSearchTerm]);

  // Fetch courses
  const fetchCourses = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, courses: true }));
      const coursesData = await courseApi.fetchCourses();
      setCourses(coursesData);
    } catch (error: any) {
      if (error?.status === 404) {
        setCourses([]);
        return;
      }
      showErrorToast(error?.message || "Failed to load courses");
    } finally {
      setLoading(prev => ({ ...prev, courses: false, initial: false }));
    }
  }, []); // Removed showErrorToast to prevent infinite loop

  // Load courses on mount
  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem("adminAuth");
        if (!token) {
          showErrorToast("Please login as admin to access this page");
          window.location.href = "/admin/login";
          return;
        }
        await fetchCourses();
      } catch (error) {
        setLoading(prev => ({ ...prev, initial: false }));
      }
    };
    init();
  }, [fetchCourses]); // Removed showErrorToast to prevent infinite loop

  // Filtered courses (memoized)
  const filteredCourses = useMemo(() => {
    const term = debouncedSearchTerm.trim();
    return term ? (remoteSearchCourses ?? []) : courses;
  }, [courses, remoteSearchCourses, debouncedSearchTerm]);

  // Sorted courses (memoized)
  const sortedCourses = useMemo(() => {
    const start = (currentPage - 1) * pagination.itemsPerPage;
    const end = currentPage * pagination.itemsPerPage;
    return filteredCourses.slice(start, end);
  }, [filteredCourses, currentPage, pagination.itemsPerPage]);

  // Total pages
  const totalPages = Math.ceil(filteredCourses.length / pagination.itemsPerPage);

  // Actions
  const setFilters = useCallback((filters: { searchTerm: string }) => {
    setSearchTerm(filters.searchTerm);
    setCurrentPage(1);
  }, []);

  return {
    // State
    courses,
    loading,
    searchTerm,
    currentPage,
    pagination,
    
    // Computed
    filteredCourses,
    sortedCourses,
    totalPages,
    debouncedSearchTerm,
    remoteSearchCourses,
    
    // Actions
    fetchCourses,
    setSearchTerm,
    setCurrentPage,
    setFilters,
  };
}
