"use client";

import { QueryClient } from "@tanstack/react-query";

/**
 * Factory for the shared QueryClient.
 *
 * Defaults tuned for a gym-management website:
 *  • staleTime 5 min  – products / courses rarely change mid-session
 *  • gcTime 30 min    – keep inactive data in memory for back-navigations
 *  • retry 1          – fast failure; PHP backend is local / low-latency
 *  • refetchOnWindowFocus false – avoid surprise spinners
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnReconnect: "always",
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

// Singleton – avoids creating a new client on every render in client components
let browserQueryClient: QueryClient | undefined;

export function getQueryClient(): QueryClient {
  if (typeof window === "undefined") {
    // Server: always create a new client (avoid sharing state across requests)
    return makeQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}
