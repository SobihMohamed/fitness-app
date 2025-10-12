"use client";

import { useState, useEffect, useCallback } from "react";
import { API_CONFIG } from "@/config/api";
import { useUserApi } from "./use-user-api";

interface CourseRequest {
  request_id: number;
  course_id: number;
  user_id: number;
  gender: string;
  job: string;
  age: number;
  status: 'pending' | 'approved' | 'cancelled';
  promo_code_used?: string;
  original_total: number;
  discount_value: number;
  net_total: number;
  created_at: string;
}

interface CourseRequestsState {
  requests: CourseRequest[];
  loading: boolean;
  error: string | null;
}

export function useCourseRequests() {
  const { makeAuthenticatedRequest } = useUserApi();
  const [state, setState] = useState<CourseRequestsState>({
    requests: [],
    loading: true,
    error: null,
  });

  // Fetch user's course requests
  const fetchRequests = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;
      if (!token) {
        setState(prev => ({ ...prev, requests: [], loading: false }));
        return;
      }

      const data = await makeAuthenticatedRequest(API_CONFIG.USER_FUNCTIONS.requests.courses.getMyRequests);
      
      if (data.status === "success") {
        setState(prev => ({ 
          ...prev, 
          requests: data.data || [],
          loading: false 
        }));
      } else {
        setState(prev => ({ ...prev, requests: [], loading: false }));
      }
    } catch (error: any) {
      console.error("Error fetching course requests:", error);
      setState(prev => ({ 
        ...prev, 
        requests: [], 
        loading: false,
        error: error.message || "Failed to load course requests" 
      }));
    }
  }, [makeAuthenticatedRequest]);

  // Get request status for a specific course
  const getCourseRequestStatus = useCallback((courseId: number) => {
    const request = state.requests.find(req => req.course_id === courseId);
    return {
      isSubscribed: !!request,
      status: request?.status || null,
      request: request || null
    };
  }, [state.requests]);

  // Check if user can enroll in a course
  const canEnroll = useCallback((courseId: number) => {
    const { isSubscribed, status } = getCourseRequestStatus(courseId);
    
    if (!isSubscribed) return true; // Can enroll if no request exists
    if (status === 'cancelled') return true; // Can re-enroll if cancelled
    return false; // Cannot enroll if pending or approved
  }, [getCourseRequestStatus]);

  // Get enrollment button state
  const getEnrollmentButtonState = useCallback((courseId: number) => {
    const { isSubscribed, status } = getCourseRequestStatus(courseId);
    
    if (!isSubscribed) {
      return {
        text: "Enroll Now",
        disabled: false,
        className: "w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 text-lg",
        icon: "ShoppingCart"
      };
    }
    
    switch (status) {
      case 'approved':
        return {
          text: "Enrolled",
          disabled: true,
          className: "w-full bg-green-600 text-white font-semibold py-3 text-lg cursor-not-allowed",
          icon: "CheckCircle"
        };
      case 'pending':
        return {
          text: "Request Pending",
          disabled: true,
          className: "w-full bg-yellow-600 text-white font-semibold py-3 text-lg cursor-not-allowed",
          icon: "Eye"
        };
      case 'cancelled':
        return {
          text: "Request Again",
          disabled: false,
          className: "w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 text-lg",
          icon: "ShoppingCart"
        };
      default:
        return {
          text: "Enroll Now",
          disabled: false,
          className: "w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 text-lg",
          icon: "ShoppingCart"
        };
    }
  }, [getCourseRequestStatus]);

  // Load requests on mount
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return {
    ...state,
    refetch: fetchRequests,
    getCourseRequestStatus,
    canEnroll,
    getEnrollmentButtonState,
  };
}
