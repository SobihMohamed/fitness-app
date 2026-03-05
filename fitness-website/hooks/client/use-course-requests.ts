"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { fetchCourseRequests } from "@/lib/api/fetchers";

interface CourseRequest {
  request_id: number;
  course_id: number;
  user_id: number;
  gender: string;
  job: string;
  age: number;
  status: "pending" | "approved" | "cancelled";
  promo_code_used?: string;
  original_total: number;
  discount_value: number;
  net_total: number;
  created_at: string;
}

export function useCourseRequests() {
  const queryClient = useQueryClient();

  const hasToken =
    typeof window !== "undefined" && !!sessionStorage.getItem("token");

  const { data, isLoading, error, refetch } = useQuery<CourseRequest[]>({
    queryKey: queryKeys.user.courseRequests,
    queryFn: fetchCourseRequests as () => Promise<CourseRequest[]>,
    enabled: hasToken,
  });

  const requests = data ?? [];

  // Get request status for a specific course
  const getCourseRequestStatus = useCallback(
    (courseId: number) => {
      const request = requests.find((req) => req.course_id === courseId);
      return {
        isSubscribed: !!request,
        status: request?.status || null,
        request: request || null,
      };
    },
    [requests],
  );

  // Check if user can enroll in a course
  const canEnroll = useCallback(
    (courseId: number) => {
      const { isSubscribed, status } = getCourseRequestStatus(courseId);

      if (!isSubscribed) return true;
      if (status === "cancelled") return true;
      return false;
    },
    [getCourseRequestStatus],
  );

  // Get enrollment button state
  const getEnrollmentButtonState = useCallback(
    (courseId: number) => {
      const { isSubscribed, status } = getCourseRequestStatus(courseId);

      if (!isSubscribed) {
        return {
          text: "Enroll Now",
          disabled: false,
          className:
            "w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 text-lg",
          icon: "ShoppingCart",
        };
      }

      switch (status) {
        case "approved":
          return {
            text: "Enrolled",
            disabled: true,
            className:
              "w-full bg-green-600 text-white font-semibold py-3 text-lg cursor-not-allowed",
            icon: "CheckCircle",
          };
        case "pending":
          return {
            text: "Request Pending",
            disabled: true,
            className:
              "w-full bg-yellow-600 text-white font-semibold py-3 text-lg cursor-not-allowed",
            icon: "Eye",
          };
        case "cancelled":
          return {
            text: "Request Again",
            disabled: false,
            className:
              "w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 text-lg",
            icon: "ShoppingCart",
          };
        default:
          return {
            text: "Enroll Now",
            disabled: false,
            className:
              "w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 text-lg",
            icon: "ShoppingCart",
          };
      }
    },
    [getCourseRequestStatus],
  );

  return {
    requests,
    loading: isLoading,
    error: error?.message || null,
    refetch,
    getCourseRequestStatus,
    canEnroll,
    getEnrollmentButtonState,
  };
}
