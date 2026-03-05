"use client";

import axios, { type AxiosInstance } from "axios";
import { getApiBaseUrl } from "@/lib/env";

// ---------------------------------------------------------------------------
// Unified Axios HTTP clients (singleton pattern – created once, reused)
// ---------------------------------------------------------------------------

let adminClient: AxiosInstance | null = null;
let userClient: AxiosInstance | null = null;

/**
 * Shared error-normalising response interceptor.
 */
function attachErrorInterceptor(instance: AxiosInstance) {
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const normalized = {
        status: error?.response?.status || 0,
        message:
          error?.response?.data?.message || error?.message || "Network error",
        data: error?.response?.data,
      };
      return Promise.reject(normalized);
    },
  );
}

/**
 * Admin-scoped HTTP client.
 * Reads `adminAuth` from localStorage for Bearer token.
 */
export function getHttpClient(): AxiosInstance {
  if (adminClient) return adminClient;

  adminClient = axios.create({
    baseURL: getApiBaseUrl(),
    timeout: 15_000,
    withCredentials: false,
  });

  adminClient.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("adminAuth");
      if (token) {
        config.headers = config.headers || {};
        (config.headers as Record<string, string>).Authorization =
          `Bearer ${token}`;
      }
    }
    return config;
  });

  attachErrorInterceptor(adminClient);
  return adminClient;
}

/**
 * User-scoped HTTP client.
 * Reads `token` from sessionStorage (set by AuthProvider on login).
 */
export function getUserHttpClient(): AxiosInstance {
  if (userClient) return userClient;

  userClient = axios.create({
    baseURL: getApiBaseUrl(),
    timeout: 15_000,
    withCredentials: false,
  });

  userClient.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
      const token = sessionStorage.getItem("token");
      if (token) {
        config.headers = config.headers || {};
        (config.headers as Record<string, string>).Authorization =
          `Bearer ${token}`;
      }
    }
    return config;
  });

  attachErrorInterceptor(userClient);
  return userClient;
}
