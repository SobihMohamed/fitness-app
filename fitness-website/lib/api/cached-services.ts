"use client";

import { dataCache } from "@/lib/cache";
import type { ClientService } from "@/types";
import { servicesApi } from "@/lib/api/services";

/**
 * Cached Services API Client
 */

const CACHE_CONFIG = {
  services: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 60 * 60 * 1000, // 1 hour
  },
  serviceDetail: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  },
};

export const cachedServicesApi = {
  async fetchServices(): Promise<ClientService[]> {
    return dataCache.get(
      'services:all',
      async () => {
        // Use normalized public services to ensure UI receives ClientService shape
        return servicesApi.fetchPublicServices();
      },
      CACHE_CONFIG.services
    );
  },

  async fetchServiceById(serviceId: string): Promise<ClientService | null> {
    return dataCache.get(
      `service:${serviceId}`,
      async () => {
        return servicesApi.fetchPublicServiceById(serviceId);
      },
      CACHE_CONFIG.serviceDetail
    );
  },

  async prefetchServices(): Promise<void> {
    await dataCache.prefetch('services:all', async () => {
      return servicesApi.fetchPublicServices();
    });
  },

  async prefetchServiceDetail(serviceId: string): Promise<void> {
    await dataCache.prefetch(`service:${serviceId}`, async () => {
      return servicesApi.fetchPublicServiceById(serviceId);
    });
  },
};

// Prefetch on mount - defer to avoid blocking initial render (optimized from 400ms to 700ms)
if (typeof window !== 'undefined') {
  setTimeout(() => cachedServicesApi.prefetchServices().catch(() => {}), 700);
}
