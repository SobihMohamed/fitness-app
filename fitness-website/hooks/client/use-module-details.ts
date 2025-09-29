"use client";

import { useState, useEffect, useCallback } from "react";
import { API_CONFIG } from "@/config/api";
import { toast } from "sonner";

interface Chapter {
  chapter_id: number;
  module_id: number;
  title: string;
  description: string;
  video_link: string;
  order_number: number;
  created_at: string;
}

interface Module {
  module_id: number;
  course_id: number;
  title: string;
  description: string;
  order_number: number;
  created_at: string;
  chapters?: Chapter[];
}

interface ModuleDetailsState {
  module: Module | null;
  loading: boolean;
  error: string | null;
}

export function useModuleDetails(moduleId: string, courseId?: string) {
  const [state, setState] = useState<ModuleDetailsState>({
    module: null,
    loading: true,
    error: null,
  });

  // Fetch module details
  const fetchModuleDetails = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const token = typeof window !== 'undefined' ? sessionStorage.getItem("token") : null;
      const adminTarget = API_CONFIG.USER_FUNCTIONS.courses.modules.getById(moduleId);
      let response = await fetch(
        `/proxy-json?url=${encodeURIComponent(adminTarget)}`,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            'Accept': 'application/json',
          },
        }
      );

      // If unauthorized or failed, try public CoursePage fallback when courseId is available
      if (response.status === 401 || !response.ok) {
        if (!courseId) {
          const message = "Unauthorized – please login to view this module.";
          console.error("Module details 401 or failed and no courseId for fallback");
          setState(prev => ({ ...prev, loading: false, error: message }));
          toast.error(message);
          return;
        }

        const courseTarget = API_CONFIG.USER_FUNCTIONS.courses.getById(courseId);
        const courseRes = await fetch(`/proxy-json?url=${encodeURIComponent(courseTarget)}`, {
          headers: { 'Accept': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        });
        const courseData = await courseRes.json();
        if (courseRes.ok && courseData?.status === 'success') {
          const found = (courseData?.Course?.modules || []).find((m: any) => String(m.module_id) === String(moduleId));
          if (found) {
            setState(prev => ({ ...prev, module: found, loading: false }));
            return;
          }
        }
        throw new Error("Failed to load module via fallback");
      }

      const data = await response.json();
      if (data.status === 'success') {
        setState(prev => ({ ...prev, module: data.Module, loading: false }));
      } else {
        throw new Error(data.message || 'Failed to fetch module details');
      }
    } catch (error: any) {
      console.error("Error fetching module details:", error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: (error?.message === 'Failed to fetch') 
          ? "Network error while contacting server. Please check your API URL/CORS and try again." 
          : error.message || "Failed to load module details" 
      }));
    }
  }, [moduleId, courseId]);

  // Load module details on mount
  useEffect(() => {
    if (moduleId) {
      fetchModuleDetails();
    }
  }, [moduleId, fetchModuleDetails]);

  const actions = {
    refetch: fetchModuleDetails,
  };

  return {
    state,
    actions,
  };
}
