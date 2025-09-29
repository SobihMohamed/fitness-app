"use client";

import { getHttpClient } from "@/lib/http";
import { API_CONFIG } from "@/config/api";
import type {
  HomeProduct,
  HomeCourse,
  HomeProductsApiResponse,
  HomeCoursesApiResponse
} from "@/types/home";

const http = getHttpClient();

// Home API functions
export const homeApi = {
  // Fetch featured products for homepage
  async fetchFeaturedProducts(): Promise<HomeProduct[]> {
    try {
      const response = await http.get<HomeProductsApiResponse>(
        API_CONFIG.USER_FUNCTIONS.products.getAll
      );

      const data = response.data;
      const productsData = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.products)
          ? data.products
          : Array.isArray(data) ? data : [];

      return homeApi.formatProductsData(productsData);
    } catch (error) {
      console.error("Error fetching featured products:", error);
      throw error;
    }
  },

  // Fetch featured courses for homepage
  async fetchFeaturedCourses(): Promise<HomeCourse[]> {
    try {
      const response = await http.get<HomeCoursesApiResponse>(
        API_CONFIG.USER_FUNCTIONS.courses.getAll
      );

      const data = response.data;
      const coursesData = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.courses)
          ? data.courses
          : Array.isArray(data) ? data : [];

      return homeApi.formatCoursesData(coursesData);
    } catch (error) {
      console.error("Error fetching featured courses:", error);
      throw error;
    }
  },

  // Enroll in a course
  async enrollInCourse(courseId: string): Promise<void> {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await http.post(
        `${API_CONFIG.BASE_URL}/user/enroll-course`,
        { course_id: courseId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.status !== "success") {
        throw new Error(response.data.message || "Failed to enroll in course");
      }
    } catch (error) {
      console.error("Error enrolling in course:", error);
      throw error;
    }
  },

  // Format raw product data from API
  formatProductsData(productsData: any[]): HomeProduct[] {
    return productsData
      .filter((product): product is Record<string, any> => !!product)
      .map((product): HomeProduct => ({
        id: String(product.id || product.product_id || ''),
        name: String(product.name || product.title || 'Untitled Product'),
        price: Number(product.price || 0),
        image: String(product.image || product.image_url || product.main_image_url || ''),
        category: String(product.category || 'Uncategorized'),
        description: String(product.description || ''),
        rating: product.rating ? Number(product.rating) : undefined,
        reviews: product.reviews ? Number(product.reviews) : undefined,
        stock: product.stock ? Number(product.stock) : undefined,
      }));
  },

  // Format raw course data from API
  formatCoursesData(coursesData: any[]): HomeCourse[] {
    return coursesData
      .filter((course): course is Record<string, any> => !!course)
      .map((course): HomeCourse => ({
        id: String(course.id || course.course_id || ''),
        title: String(course.title || 'Untitled Course'),
        instructor: String(course.instructor || 'Unknown Instructor'),
        students: Number(course.students || course.enrolled_students || 0),
        rating: Number(course.rating || 0),
        price: Number(course.price || course.course_price || 0),
        image: String(course.image || course.image_url || course.main_image_url || ''),
        category: String(course.category || 'General'),
        description: String(course.description || ''),
      }));
  }
};
