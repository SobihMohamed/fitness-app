"use client";

import { getHttpClient } from "@/lib/http";
import { API_CONFIG } from "@/config/api";
import type {
  Service,
  ClientService,
  ServiceFormData,
  ServiceApiResponse,
  ServicesPublicApiResponse,
} from "@/types";

const http = getHttpClient();

// Services API functions
export const servicesApi = {
  // Fetch all services
  async fetchServices(): Promise<Service[]> {
    try {
      // Try admin endpoint first
      try {
        const response = await http.get<ServiceApiResponse>(
          API_CONFIG.ADMIN_FUNCTIONS.services.getAll,
          { 
            headers: servicesApi.getAuthHeaders(),
            params: { _: Date.now() }
          }
        );

        const data = response.data;
        const servicesData = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : [];

        return servicesApi.formatServicesData(servicesData);
      } catch (err: any) {
        if (err?.status === 404) {
          return [];
        }
        // Fall through to public endpoint
      }

      // Fallback to public endpoint
      try {
        const response = await http.get<ServiceApiResponse>(
          API_CONFIG.USER_FUNCTIONS.services.getAll,
          { params: { _: Date.now() } }
        );

        const data = response.data;
        const servicesData = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : [];

        return servicesApi.formatServicesData(servicesData);
      } catch (err2: any) {
        if (err2?.status === 404) {
          return [];
        }
        throw err2;
      }
    } catch (error: any) {
      throw new Error(error.message || "Failed to load services");
    }
  },

  // Public: fetch services normalized for client consumption
  async fetchPublicServices(): Promise<ClientService[]> {
    try {
      const response = await http.get<ServicesPublicApiResponse>(
        API_CONFIG.USER_FUNCTIONS.services.getAll,
        { params: { _: Date.now() } }
      );

      const data = response.data as any;
      const raw: any[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.services)
        ? data.services
        : (Object.values(data || {}).find((v: any) => Array.isArray(v)) as any[]) || [];

      return raw.map((s: any): ClientService => ({
        id: Number.parseInt(s.service_id || s.id, 10),
        title: s.title || s.name || "Unnamed Service",
        description: s.details || s.description || "",
        price: Number.parseFloat((s.price ?? 0).toString()),
        duration: s.duration || s.time || "",
        image: s.picture || s.image || s.image_url || s.main_image_url || null,
        popular: s.popular === true || s.popular === 1,
        features: Array.isArray(s.features)
          ? s.features
          : typeof s.features === "string" && s.features.trim().length
          ? s.features.split(",").map((x: string) => x.trim()).filter(Boolean)
          : [],
        category: s.category || s.category_name || undefined,
        created_at: s.created_at,
      }));
    } catch (error: any) {
      throw new Error(error?.message || "Failed to load services");
    }
  },

  // Public: fetch one service by id normalized
  async fetchPublicServiceById(id: string | number): Promise<ClientService | null> {
    try {
      const endpoint = API_CONFIG.USER_FUNCTIONS.services.getById(String(id));
      const response = await http.get<any>(endpoint, { params: { _: Date.now() } });
      const data = response.data as any;
      const raw = (data?.data ?? data?.service ?? data?.Service ?? data) as any;
      if (!raw || typeof raw !== "object") return null;
      return {
        id: Number.parseInt(raw.service_id || raw.id, 10),
        title: raw.title || raw.name || "Unnamed Service",
        description: raw.details || raw.description || "",
        price: Number.parseFloat((raw.price ?? 0).toString()),
        duration: raw.duration || raw.time || "",
        image: raw.picture || raw.image || raw.image_url || null,
        popular: raw.popular === true || raw.popular === 1,
        features: Array.isArray(raw.features)
          ? raw.features
          : typeof raw.features === "string" && raw.features.trim().length
          ? raw.features.split(",").map((x: string) => x.trim()).filter(Boolean)
          : [],
        category: raw.category || raw.category_name || undefined,
        created_at: raw.created_at,
      };
    } catch (error: any) {
      if (error?.status === 404) return null;
      throw new Error(error?.message || "Failed to load service");
    }
  },

  // Add new service
  async addService(formData: ServiceFormData): Promise<void> {
    const endpoint = API_CONFIG.ADMIN_FUNCTIONS.services.add;
    
    const body = new FormData();
    body.append('title', formData.title);
    body.append('details', formData.details);
    body.append('duration', formData.duration);
    body.append('price', formData.price);
    
    if (formData.picture) {
      body.append('picture', formData.picture);
    }

    await http.post(endpoint, body, {
      headers: {
        ...servicesApi.getAuthHeaders(false),
      },
    });
  },

  // Update existing service
  async updateService(serviceId: string, formData: ServiceFormData): Promise<void> {
    const endpoint = `${API_CONFIG.ADMIN_FUNCTIONS.services.update}/${serviceId}`;
    
    const body = new FormData();
    body.append('title', formData.title);
    body.append('details', formData.details);
    body.append('duration', formData.duration);
    body.append('price', formData.price);
    
    if (formData.picture) {
      body.append('picture', formData.picture);
    }

    await http.post(endpoint, body, {
      headers: {
        ...servicesApi.getAuthHeaders(false),
      },
    });
  },

  // Delete service
  async deleteService(serviceId: string): Promise<void> {
    const endpoint = API_CONFIG.ADMIN_FUNCTIONS.services.delete(serviceId);
    
    await http.delete(endpoint, {
      headers: servicesApi.getAuthHeaders()
    });
  },

  // Format raw service data from API
  formatServicesData(servicesData: any[]): Service[] {
    return servicesData
      .filter((service): service is Record<string, any> => !!service)
      .map((service): Service => ({
        service_id: String(service.service_id || service.id || ''),
        title: String(service.title || service.name || ''),
        details: String(service.details || service.description || ''),
        duration: String(service.duration || ''),
        price: service.price || '',
        picture: service.picture || service.image_url || null,
        created_at: service.created_at,
        admin_id: service.admin_id,
      }));
  },

  // Get auth headers (will be overridden in component context)
  getAuthHeaders(includeContentType: boolean = true): Record<string, string> {
    return {};
  }
};
