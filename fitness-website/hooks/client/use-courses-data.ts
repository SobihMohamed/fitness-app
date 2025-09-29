"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { API_CONFIG } from "@/config/api";
import { toast } from "sonner";

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
}

interface CoursesFilter {
  searchTerm: string;
  sortBy: string;
  page: number;
  pageSize: number;
}

interface CoursesState {
  courses: Course[];
  loading: boolean;
  filter: CoursesFilter;
}

interface CoursesActions {
  updateFilter: (updates: Partial<CoursesFilter>) => void;
  searchCourses: (keyword: string) => Promise<void>;
}

export function useCoursesData() {
  const [state, setState] = useState<CoursesState>({
    courses: [],
    loading: true,
    filter: {
      searchTerm: "",
      sortBy: "newest",
      page: 1,
      pageSize: 12,
    },
  });

  // Fetch all courses
  const fetchCourses = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const response = await fetch(API_CONFIG.USER_FUNCTIONS.courses.getAll);
      const data = await response.json();
      
      if (data.status === "success") {
        // Debug log to see what courses data we're getting
        if (process.env.NODE_ENV === 'development') {
          console.log('Courses API response:', data);
          console.log('Courses data:', data.data);
          if (data.data && data.data.length > 0) {
            console.log('First course sample:', data.data[0]);
          }
        }
        
        setState(prev => ({ 
          ...prev, 
          courses: data.data || [],
          loading: false 
        }));
      } else {
        throw new Error(data.message || "Failed to fetch courses");
      }
    } catch (error: any) {
      console.error("Error fetching courses:", error);
      toast.error(error.message || "Failed to load courses");
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  // Search courses
  const searchCourses = useCallback(async (keyword: string) => {
    if (!keyword.trim()) {
      await fetchCourses();
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const response = await fetch(API_CONFIG.USER_FUNCTIONS.courses.search, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keyword }),
      });
      
      const data = await response.json();
      
      if (data.status === "success") {
        setState(prev => ({ 
          ...prev, 
          courses: data.data || [],
          loading: false 
        }));
      } else {
        throw new Error(data.message || "No courses found");
      }
    } catch (error: any) {
      console.error("Error searching courses:", error);
      setState(prev => ({ ...prev, courses: [], loading: false }));
    }
  }, [fetchCourses]);

  // Update filter
  const updateFilter = useCallback((updates: Partial<CoursesFilter>) => {
    setState(prev => ({
      ...prev,
      filter: { ...prev.filter, ...updates }
    }));
  }, []);

  // Filter and sort courses
  const filteredCourses = useMemo(() => {
    let filtered = [...state.courses];

    // Apply search filter
    if (state.filter.searchTerm) {
      const searchTerm = state.filter.searchTerm.toLowerCase();
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm) ||
        course.description.toLowerCase().includes(searchTerm) ||
        (course.instructor && course.instructor.toLowerCase().includes(searchTerm))
      );
    }

    // Apply sorting
    switch (state.filter.sortBy) {
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
        filtered.sort((a, b) => (b.students_count || 0) - (a.students_count || 0));
        break;
      case "newest":
      default:
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    return filtered;
  }, [state.courses, state.filter.searchTerm, state.filter.sortBy]);

  // Paginate courses
  const paginatedCourses = useMemo(() => {
    const startIndex = (state.filter.page - 1) * state.filter.pageSize;
    const endIndex = startIndex + state.filter.pageSize;
    return filteredCourses.slice(startIndex, endIndex);
  }, [filteredCourses, state.filter.page, state.filter.pageSize]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(filteredCourses.length / state.filter.pageSize);
  }, [filteredCourses.length, state.filter.pageSize]);

  // Load courses on mount
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Search when search term changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (state.filter.searchTerm) {
        searchCourses(state.filter.searchTerm);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [state.filter.searchTerm, searchCourses]);

  const actions: CoursesActions = {
    updateFilter,
    searchCourses,
  };

  return {
    courses: state.courses,
    loading: state.loading,
    filter: state.filter,
    filteredCourses,
    paginatedCourses,
    totalPages,
    actions,
  };
}
