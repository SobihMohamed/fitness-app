"use client";

import { useCallback } from "react";
import { toast } from "sonner";

export function useUserApi() {
  const getAuthHeaders = useCallback((withJson = true) => {
    const token =
      typeof window !== "undefined" ? sessionStorage.getItem("token") : null;
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    headers["Accept"] = "application/json";
    if (withJson) headers["Content-Type"] = "application/json";
    return headers;
  }, []);

  const parseResponse = useCallback(async <T = any>(
    response: Response
  ): Promise<T | { status: string; message: string }> => {
    const text = await response.text();
    if (!text || text.trim() === "") {
      return {
        status: response.ok ? "success" : "error",
        message: response.ok
          ? "Operation completed successfully"
          : "Operation failed",
      } as any;
    }
    try {
      return JSON.parse(text);
    } catch {
      return {
        status: response.ok ? "success" : "error",
        message: text.trim() || (response.ok ? "Success" : "An error occurred"),
      } as any;
    }
  }, []);

  const makeAuthenticatedRequest = useCallback(async <T = any>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> => {
    const headers = getAuthHeaders();
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Handle unauthorized - just throw error without redirect
        throw new Error("Authentication required for this action");
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await parseResponse<T>(response);
    return result as T;
  }, [getAuthHeaders, parseResponse]);

  const showSuccessToast = useCallback((message: string) => {
    toast.success(message, {
      duration: 3000,
      position: "top-right",
      style: {
        background: "#22C55E", 
        color: "#fff",
        fontWeight: "600",
        borderRadius: "12px",
        padding: "14px 18px",
        boxShadow: "0 4px 15px rgba(34, 197, 94, 0.35)",
        fontSize: "15px",
        letterSpacing: "0.3px",
      },
    });
  }, []);

  const showErrorToast = useCallback((message: string) => {
    toast.error(message, {
      duration: 4000,
      position: "top-right",
      style: {
        background: "#DC2626",
        color: "#fff",
        fontWeight: "600",
        borderRadius: "12px",
        padding: "14px 18px",
        boxShadow: "0 4px 15px rgba(220, 38, 38, 0.35)",
        fontSize: "15px",
        letterSpacing: "0.3px",
      },
    });
  }, []);

  const showInfoToast = useCallback((message: string) => {
    toast.info(message, {
      duration: 3000,
      position: "top-right",
      style: {
        background: "#3B82F6",
        color: "#fff",
        fontWeight: "600",
        borderRadius: "12px",
        padding: "14px 18px",
        boxShadow: "0 4px 15px rgba(59, 130, 246, 0.35)",
        fontSize: "15px",
        letterSpacing: "0.3px",
      },
    });
  }, []);

  return {
    getAuthHeaders,
    parseResponse,
    makeAuthenticatedRequest,
    showSuccessToast,
    showErrorToast,
    showInfoToast,
  };
}
