"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { API_CONFIG } from "@/config/api";
import { toast } from "sonner";
import { useUserApi } from "./use-user-api";

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
  const { makeAuthenticatedRequest } = useUserApi();
  
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

  // Fetch all courses - try authenticated first, fallback to unauthenticated
  const fetchCourses = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      // Check if user is logged in
      const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;
      
      if (token) {
        // User is logged in - make authenticated request
        try {
          const data = await makeAuthenticatedRequest(API_CONFIG.USER_FUNCTIONS.courses.getAll);
          console.log(data)

          if (data.status === "success") {
            setState(prev => ({ 
              ...prev, 
              courses: data.data || [],
              loading: false 
            }));
            return;
          } else {
            throw new Error(data.message || "Failed to fetch courses");
          }
        } catch (authError: any) {
          console.error("Authenticated request failed:", authError);
          // If authenticated request fails, fall through to unauthenticated request
        }
      }
      
      // User is not logged in OR authenticated request failed - make unauthenticated request
      const response = await fetch(API_CONFIG.USER_FUNCTIONS.courses.getAll, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      // Handle 401 Unauthorized silently - just show empty state
      if (response.status === 401) {
        setState(prev => ({ 
          ...prev, 
          courses: [],
          loading: false 
        }));
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const text = await response.text();
      let data;
      
      if (!text || text.trim() === "") {
        data = { status: "success", data: [] };
      } else {
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("Invalid response format");
        }
      }
      
      if (data.status === "success") {
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
      // Don't show error toast for authentication issues
      if (!error.message?.includes("401") && !error.message?.includes("Unauthorized")) {
        toast.error(error.message || "Failed to load courses");
      }
      setState(prev => ({ ...prev, courses: [], loading: false }));
    }
  }, [makeAuthenticatedRequest]);

  // Search courses - try authenticated first, fallback to unauthenticated
  const searchCourses = useCallback(async (keyword: string) => {
    if (!keyword.trim()) {
      await fetchCourses();
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true }));
      
      // Check if user is logged in
      const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;
      
      if (token) {
        // User is logged in - make authenticated request
        try {
          const data = await makeAuthenticatedRequest(API_CONFIG.USER_FUNCTIONS.courses.search, {
            method: "POST",
            body: JSON.stringify({ keyword }),
          });
          
          if (data.status === "success") {
            setState(prev => ({ 
              ...prev, 
              courses: data.data || [],
              loading: false 
            }));
            return;
          } else {
            throw new Error(data.message || "No courses found");
          }
        } catch (authError: any) {
          console.error("Authenticated search failed:", authError);
          // If authenticated request fails, fall through to unauthenticated request
        }
      }
      
      // User is not logged in OR authenticated request failed - make unauthenticated request
      const response = await fetch(API_CONFIG.USER_FUNCTIONS.courses.search, {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword }),
      });
      
      // Handle 401 Unauthorized silently - just show empty state
      if (response.status === 401) {
        setState(prev => ({ 
          ...prev, 
          courses: [],
          loading: false 
        }));
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const text = await response.text();
      let data;
      
      if (!text || text.trim() === "") {
        data = { status: "success", data: [] };
      } else {
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("Invalid response format");
        }
      }
      
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
      // Don't show error toast for authentication issues
      if (!error.message?.includes("401") && !error.message?.includes("Unauthorized")) {
        toast.error("No courses found for your search");
      }
      setState(prev => ({ ...prev, courses: [], loading: false }));
    }
  }, [fetchCourses, makeAuthenticatedRequest]);

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
