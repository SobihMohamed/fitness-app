"use client";

import axios, { AxiosInstance } from "axios";
import { getApiBaseUrl } from "@/lib/env";

let client: AxiosInstance | null = null;

export function getHttpClient(): AxiosInstance {
  if (client) return client;

  client = axios.create({
    baseURL: getApiBaseUrl(),
    timeout: 15000,
    withCredentials: false,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Inject auth token from localStorage on the client only
  client.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("adminAuth");
      if (token) {
        config.headers = config.headers || {};
        (config.headers as any).Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });

  // Normalize errors
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      const normalized = {
        status: error?.response?.status || 0,
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Network error",
        data: error?.response?.data,
      };
      return Promise.reject(normalized);
    }
  );

  return client;
}
