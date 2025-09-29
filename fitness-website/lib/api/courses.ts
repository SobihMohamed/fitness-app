"use client";

import { getHttpClient } from "@/lib/http";
import { API_CONFIG } from "@/config/api";
import type {
  Course,
  CourseFormData,
  CourseApiResponse,
} from "@/types";

const http = getHttpClient();

// Course API functions
export const courseApi = {
  // Fetch all courses
  async fetchCourses(): Promise<Course[]> {
    const response = await http.get<CourseApiResponse>(
      `${API_CONFIG.BASE_URL}/AdminCourses/getAll`,
      { headers: this.getAuthHeaders() }
    );

    const data = response.data;
    const coursesData = Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.courses)
        ? data.courses
        : Array.isArray(data) ? data : [];

    return this.formatCoursesData(coursesData);
  },

  // Search courses
  async searchCourses(keyword: string): Promise<Course[]> {
    const response = await http.post<CourseApiResponse>(
      API_CONFIG.USER_FUNCTIONS.courses.search,
      { keyword }
    );

    const data = response.data;
    const coursesData = Array.isArray((data as any)?.data)
      ? (data as any).data
      : Array.isArray((data as any)?.courses)
        ? (data as any).courses
        : Array.isArray(data) ? (data as any) : [];

    return this.formatCoursesData(coursesData);
  },

  // Add new course
  async addCourse(formData: CourseFormData): Promise<void> {
    const endpoint = `${API_CONFIG.BASE_URL}/AdminCourses/addCourse`;

    // Try single multipart submit (preferred)
    try {
      const body = new FormData();
      body.append('title', formData.title);
      body.append('price', formData.price);
      body.append('description', formData.description);
      
      if (formData.image_url instanceof File) {
        body.append('image_url', formData.image_url);
      } else if (formData.image_url && typeof formData.image_url === 'string') {
        body.append('image_url', formData.image_url);
      }

      await http.post(endpoint, body, {
        headers: {
          ...this.getAuthHeaders(false),
        },
      });
    } catch (err: any) {
      // Fallback to x-www-form-urlencoded if multipart fails
      const status = err?.response?.status;
      if (status !== 400 && status !== 415 && status !== 422 && status !== 500) {
        throw err;
      }

      const requestBody = new URLSearchParams();
      requestBody.append('title', formData.title);
      requestBody.append('price', formData.price);
      requestBody.append('description', formData.description);
      
      if (formData.image_url && typeof formData.image_url === 'string') {
        requestBody.append('image_url', formData.image_url);
      }

      await http.post(endpoint, requestBody.toString(), {
        headers: {
          ...this.getAuthHeaders(false),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
    }
  },

  // Update existing course
  async updateCourse(courseId: string, formData: CourseFormData): Promise<void> {
    const endpoint = `${API_CONFIG.BASE_URL}/AdminCourses/updateCourse/${courseId}`;

    // Try single multipart submit (preferred)
    try {
      const body = new FormData();
      body.append('title', formData.title);
      body.append('price', formData.price);
      body.append('description', formData.description);
      
      if (formData.image_url instanceof File) {
        body.append('image_url', formData.image_url);
      } else if (formData.image_url && typeof formData.image_url === 'string') {
        body.append('image_url', formData.image_url);
      }

      await http.post(endpoint, body, {
        headers: {
          ...this.getAuthHeaders(false),
        },
      });
    } catch (err: any) {
      // Fallback to x-www-form-urlencoded if multipart fails
      const status = err?.response?.status;
      if (status !== 400 && status !== 415 && status !== 422 && status !== 500) {
        throw err;
      }

      const requestBody = new URLSearchParams();
      requestBody.append('title', formData.title);
      requestBody.append('price', formData.price);
      requestBody.append('description', formData.description);
      
      if (formData.image_url && typeof formData.image_url === 'string') {
        requestBody.append('image_url', formData.image_url);
      }

      await http.post(endpoint, requestBody.toString(), {
        headers: {
          ...this.getAuthHeaders(false),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
    }
  },

  // Delete course
  async deleteCourse(courseId: string): Promise<void> {
    await http.delete(
      `${API_CONFIG.BASE_URL}/AdminCourses/deleteCourse/${courseId}`,
      { headers: this.getAuthHeaders() }
    );
  },

  // Format raw course data from API
  formatCoursesData(coursesData: any[]): Course[] {
    return coursesData
      .filter((course): course is Record<string, any> => !!course)
      .map((course): Course => ({
        course_id: String(course.course_id || course.id || ''),
        title: String(course.title || 'Untitled Course'),
        price: String(course.price || course.course_price || '0'),
        image_url: course.image_url ? String(course.image_url) : '',
        description: String(course.description || ''),
        created_at: course.created_at ? new Date(course.created_at).toISOString() : new Date().toISOString(),
        content_link: course.content_link ? String(course.content_link) : undefined,
      }));
  },

  // Get auth headers (will be overridden in component context)
  getAuthHeaders(includeContentType: boolean = true): Record<string, string> {
    return {};
  }
};
