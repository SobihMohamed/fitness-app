"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { servicesApi } from "@/lib/api/services";
import { useAdminApi } from "./use-admin-api";
import type { Service, ServiceFormData, ServiceDeleteTarget, ServiceStats } from "@/types";

interface ServiceManagementState {
  services: Service[];
  loading: {
    initial: boolean;
    services: boolean;
    submitting: boolean;
    deleting: boolean;
  };
  searchTerm: string;
  debouncedSearchTerm: string;
}

interface ServiceManagementActions {
  fetchServices: () => Promise<void>;
  refreshData: () => Promise<void>;
  setSearchTerm: (term: string) => void;
  addService: (formData: ServiceFormData) => Promise<void>;
  updateService: (serviceId: string, formData: ServiceFormData) => Promise<void>;
  deleteService: (serviceId: string) => Promise<void>;
}

interface ServiceManagementReturn extends ServiceManagementState, ServiceManagementActions {
  filteredServices: Service[];
  stats: ServiceStats;
}

export function useServiceManagement(): ServiceManagementReturn {
  const { getAuthHeaders, showErrorToast, showSuccessToast } = useAdminApi();
  
  // State
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState({
    initial: true,
    services: false,
    submitting: false,
    deleting: false,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Override API auth headers
  useEffect(() => {
    const authHeaders = (includeContentType = true) => {
      const headers = getAuthHeaders(includeContentType);
      return headers;
    };

    servicesApi.getAuthHeaders = authHeaders;
  }, [getAuthHeaders]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch services
  const fetchServices = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, services: true }));
      const data = await servicesApi.fetchServices();
      setServices(data);
    } catch (error: any) {
      showErrorToast(error.message || "Failed to load services");
    } finally {
      setLoading(prev => ({ ...prev, services: false }));
    }
  }, []);

  // Refresh data
  const refreshData = useCallback(async () => {
    await fetchServices();
  }, [fetchServices]);

  // Add service
  const addService = useCallback(async (formData: ServiceFormData) => {
    try {
      setLoading(prev => ({ ...prev, submitting: true }));
      await servicesApi.addService(formData);
      showSuccessToast("Service created successfully!");
      await refreshData();
    } catch (error: any) {
      showErrorToast(error.message || "Failed to create service");
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }));
    }
  }, [refreshData]);

  // Update service
  const updateService = useCallback(async (serviceId: string, formData: ServiceFormData) => {
    try {
      setLoading(prev => ({ ...prev, submitting: true }));
      await servicesApi.updateService(serviceId, formData);
      showSuccessToast("Service updated successfully!");
      
      // Optimistic update
      setServices(prev => prev.map(service => 
        service.service_id === serviceId 
          ? {
              ...service,
              title: formData.title,
              details: formData.details,
              duration: formData.duration,
              price: formData.price,
              // Keep existing picture if none uploaded
            }
          : service
      ));
      
      await refreshData();
    } catch (error: any) {
      showErrorToast(error.message || "Failed to update service");
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }));
    }
  }, [refreshData]);

  // Delete service
  const deleteService = useCallback(async (serviceId: string) => {
    try {
      setLoading(prev => ({ ...prev, deleting: true }));
      await servicesApi.deleteService(serviceId);
      showSuccessToast("Service deleted successfully!");
      await refreshData();
    } catch (error: any) {
      showErrorToast(error.message || "Failed to delete service");
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, deleting: false }));
    }
  }, [refreshData]);

  // Initial load
  useEffect(() => {
    const init = async () => {
      try {
        await fetchServices();
      } finally {
        setLoading(prev => ({ ...prev, initial: false }));
      }
    };
    init();
  }, [fetchServices]);

  // Computed values
  const filteredServices = useMemo(() => {
    const query = debouncedSearchTerm.trim().toLowerCase();
    if (!query) return services;
    
    return services.filter(service =>
      [service.title, service.details, service.duration, String(service.price)]
        .some(value => (value || "").toString().toLowerCase().includes(query))
    );
  }, [services, debouncedSearchTerm]);

  const stats = useMemo((): ServiceStats => {
    const totalPrice = services.reduce((sum, service) => {
      const price = parseFloat(String(service.price));
      return sum + (isNaN(price) ? 0 : price);
    }, 0);

    return {
      totalServices: services.length,
      totalPrice,
    };
  }, [services]);

  return {
    // State
    services,
    loading,
    searchTerm,
    debouncedSearchTerm,
    
    // Actions
    fetchServices,
    refreshData,
    setSearchTerm,
    addService,
    updateService,
    deleteService,
    
    // Computed
    filteredServices,
    stats,
  };
}
