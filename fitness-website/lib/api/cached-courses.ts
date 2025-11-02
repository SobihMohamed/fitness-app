"use client";

import { dataCache } from "@/lib/cache";
import axios from "axios";
import { API_CONFIG } from "@/config/api";

/**
 * Cached Courses API Client
 */

const CACHE_CONFIG = {
  courses: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 60 * 60 * 1000, // 1 hour
  },
  courseDetail: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  },
};

export const cachedCoursesApi = {
  // Helper to include Authorization header if user token exists
  _getAuthHeaders(): Record<string, string> {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('token');
      if (token) return { Authorization: `Bearer ${token}` };
    }
    return {};
  },

  async fetchCourses(): Promise<any[]> {
    return dataCache.get(
      'courses:all',
      async () => {
        try {
          const response = await axios.get(
            API_CONFIG.USER_FUNCTIONS.courses.getAll,
            { headers: this._getAuthHeaders() }
          );
          return response.data?.data || response.data || [];
        } catch (error: any) {
          // Handle 401 Unauthorized - return empty array for unauthenticated users
          if (error?.response?.status === 401) {
            console.info('[Cached Courses] Courses require authentication - returning empty array');
            return [];
          }
          throw error;
        }
      },
      CACHE_CONFIG.courses
    );
  },

  async fetchCourseById(courseId: string): Promise<any> {
    return dataCache.get(
      `course:${courseId}`,
      async () => {
        try {
          const response = await axios.get(
            API_CONFIG.USER_FUNCTIONS.courses.getById(courseId),
            { headers: this._getAuthHeaders() }
          );
          return response.data?.data || response.data;
        } catch (error: any) {
          // Handle 401 Unauthorized
          if (error?.response?.status === 401) {
            console.info('[Cached Courses] Course requires authentication');
            return null;
          }
          throw error;
        }
      },
      CACHE_CONFIG.courseDetail
    );
  },

  async prefetchCourses(): Promise<void> {
    try {
      await dataCache.prefetch('courses:all', async () => {
        const response = await axios.get(
          API_CONFIG.USER_FUNCTIONS.courses.getAll,
          { headers: cachedCoursesApi._getAuthHeaders() }
        );
        return response.data?.data || response.data || [];
      });
    } catch (error: any) {
      // Silently handle 401 errors during prefetch
      if (error?.response?.status === 401) {
        console.info('[Cached Courses] Prefetch skipped - authentication required');
        return;
      }
      // Ignore other prefetch errors to not block app
      console.warn('[Cached Courses] Prefetch failed:', error.message);
    }
  },

  async prefetchCourseDetail(courseId: string): Promise<void> {
    try {
      await dataCache.prefetch(`course:${courseId}`, async () => {
        const response = await axios.get(
          API_CONFIG.USER_FUNCTIONS.courses.getById(courseId),
          { headers: cachedCoursesApi._getAuthHeaders() }
        );
        return response.data?.data || response.data;
      });
    } catch (error: any) {
      // Silently handle 401 errors during prefetch
      if (error?.response?.status === 401) {
        console.info('[Cached Courses] Course prefetch skipped - authentication required');
        return;
      }
      // Ignore other prefetch errors
      console.warn('[Cached Courses] Course prefetch failed:', error.message);
    }
  },
};

// Prefetch on mount - only if user is authenticated
if (typeof window !== 'undefined') {
  // Defer to avoid blocking initial render (optimized from 200ms to 500ms)
  setTimeout(() => {
    const token = sessionStorage.getItem('token');
    if (token) {
      // Only prefetch if user is authenticated
      cachedCoursesApi.prefetchCourses().catch(() => {});
    }
  }, 500);
}
