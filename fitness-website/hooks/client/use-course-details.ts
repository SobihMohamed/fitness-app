"use client";

import { useState, useEffect, useCallback } from "react";
import { cachedCoursesApi } from "@/lib/api/cached-courses";
import { API_CONFIG } from "@/config/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useUserApi } from "./use-user-api";

interface Module {
  module_id: number;
  course_id: number;
  title: string;
  description: string;
  order_number: number;
  created_at: string;
  chapters?: Chapter[];
}

interface Chapter {
  chapter_id: number;
  module_id: number;
  title: string;
  description: string;
  video_link: string;
  order_number: number;
  created_at: string;
}

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
  modules?: Module[];
  is_subscribed?: boolean;
}

interface CourseDetailsState {
  course: Course | null;
  loading: boolean;
  error: string | null;
}

export function useCourseDetails(courseId: string) {
  const router = useRouter();
  const { makeAuthenticatedRequest } = useUserApi();
  const [state, setState] = useState<CourseDetailsState>({
    course: null,
    loading: true,
    error: null,
  });

  // Fetch course details using cached API for instant loading
  const fetchCourseDetails = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const courseData = await cachedCoursesApi.fetchCourseById(courseId);
      
      // Handle null response (authentication required)
      if (!courseData) {
        setState(prev => ({ 
          ...prev, 
          course: null,
          loading: false,
          error: "Please log in to view course details" 
        }));
        return;
      }
      
      setState(prev => ({ 
        ...prev, 
        course: courseData.Course || courseData,
        loading: false 
      }));
    } catch (error: any) {
      // Handle authentication errors silently
      const isAuthError = error?.response?.status === 401 || 
                          error?.message?.includes("401") || 
                          error?.message?.includes("Unauthorized");
      
      if (isAuthError) {
        console.info("Course details require authentication");
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: "Please log in to view course details" 
        }));
      } else {
        console.error("Error fetching course details:", error);
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: error.message || "Failed to load course details" 
        }));
      }
    }
  }, [courseId]);

  // Handle course enrollment
  const handleEnrollment = useCallback(async (course: Course) => {
    try {
      const token = localStorage.getItem("userAuth");
      if (!token) {
        toast.error("Please login to enroll in courses");
        router.push("/auth/login");
        return;
      }

      // Navigate to enrollment form or process
      router.push(`/courses/${course.course_id}/enroll`);
    } catch (error: any) {
      console.error("Error handling enrollment:", error);
      toast.error("Failed to process enrollment");
    }
  }, [router]);

  // Load course details on mount
  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId, fetchCourseDetails]);

  const actions = {
    refetch: fetchCourseDetails,
  };

  return {
    state,
    actions,
    handleEnrollment,
  };
}
