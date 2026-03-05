"use client";

import { useMemo, useCallback } from "react";
import { useCourseDetail } from "@/hooks/queries";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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

  const {
    data,
    isLoading,
    error: queryError,
    refetch,
  } = useCourseDetail(courseId);

  const state: CourseDetailsState = useMemo(() => {
    const isAuthError =
      queryError &&
      (String((queryError as any)?.response?.status) === "401" ||
        String(queryError?.message).includes("401") ||
        String(queryError?.message).includes("Unauthorized"));

    const errorMsg = queryError
      ? isAuthError
        ? "Please log in to view course details"
        : (queryError as Error).message || "Failed to load course details"
      : null;

    const course = data ? data.Course || data : null;

    return { course, loading: isLoading, error: errorMsg };
  }, [data, isLoading, queryError]);

  // Handle course enrollment
  const handleEnrollment = useCallback(
    async (course: Course) => {
      try {
        const token = localStorage.getItem("userAuth");
        if (!token) {
          toast.error("Please login to enroll in courses");
          router.push("/auth/login");
          return;
        }
        router.push(`/courses/${course.course_id}/enroll`);
      } catch (error) {
        toast.error("Failed to process enrollment");
      }
    },
    [router],
  );

  const actions = useMemo(() => ({ refetch }), [refetch]);

  return {
    state,
    actions,
    handleEnrollment,
  };
}
