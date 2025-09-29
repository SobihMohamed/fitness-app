"use client";

import { getHttpClient } from "@/lib/http";
import { API_CONFIG } from "@/config/api";
import type {
  PromoCode,
  PromoCodeFormData,
  PromoCodeApiResponse
} from "@/types";

const http = getHttpClient();

// PromoCode API functions
export const promoCodeApi = {
  // Fetch all promo codes
  async fetchPromoCodes(): Promise<PromoCode[]> {
    try {
      const response = await http.get<PromoCodeApiResponse>(
        API_CONFIG.ADMIN_FUNCTIONS.promoCodes.getAll,
        { 
          headers: promoCodeApi.getAuthHeaders(),
          params: { _: Date.now() }
        }
      );

      const data = response.data;
      const promoCodesData = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];

      return promoCodeApi.formatPromoCodesData(promoCodesData);
    } catch (error: any) {
      if (error?.status === 404) {
        return [];
      }
      throw new Error(error.message || "Failed to load promo codes");
    }
  },

  // Fetch single promo code by ID
  async fetchPromoCodeById(id: string): Promise<PromoCode | null> {
    try {
      const response = await http.get<PromoCodeApiResponse>(
        API_CONFIG.ADMIN_FUNCTIONS.promoCodes.getById(id),
        { 
          headers: promoCodeApi.getAuthHeaders(),
          params: { _: Date.now() }
        }
      );

      const data = response.data;
      const promoCodeData = data?.data || data;
      
      if (!promoCodeData) return null;
      
      return promoCodeApi.formatSinglePromoCodeData(promoCodeData);
    } catch (error: any) {
      if (error?.status === 404) {
        return null;
      }
      throw new Error(error.message || "Failed to load promo code");
    }
  },

  // Create new promo code
  async createPromoCode(formData: PromoCodeFormData): Promise<PromoCode> {
    try {
      const response = await fetch(API_CONFIG.ADMIN_FUNCTIONS.promoCodes.add, {
        method: "POST",
        headers: promoCodeApi.getAuthHeaders(),
        body: JSON.stringify({
          promo_code: formData.promo_code.trim(),
          start_date: formData.start_date,
          end_date: formData.end_date,
          percentage_of_discount: Number(formData.percentage_of_discount),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.message || "Failed to create promo code");
      }

      const data = await response.json();
      return promoCodeApi.formatSinglePromoCodeData(data?.data || data);
    } catch (error: any) {
      throw new Error(error.message || "Failed to create promo code");
    }
  },

  // Update existing promo code
  async updatePromoCode(id: string, formData: PromoCodeFormData): Promise<PromoCode> {
    try {
      const response = await fetch(API_CONFIG.ADMIN_FUNCTIONS.promoCodes.update(id), {
        method: "POST",
        headers: promoCodeApi.getAuthHeaders(),
        body: JSON.stringify({
          promo_code: formData.promo_code.trim(),
          start_date: formData.start_date,
          end_date: formData.end_date,
          percentage_of_discount: Number(formData.percentage_of_discount),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.message || "Failed to update promo code");
      }

      const data = await response.json();
      return promoCodeApi.formatSinglePromoCodeData(data?.data || data);
    } catch (error: any) {
      throw new Error(error.message || "Failed to update promo code");
    }
  },

  // Delete promo code
  async deletePromoCode(id: string): Promise<void> {
    try {
      const response = await fetch(API_CONFIG.ADMIN_FUNCTIONS.promoCodes.delete(id), {
        method: "DELETE",
        headers: promoCodeApi.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.message || "Failed to delete promo code");
      }
    } catch (error: any) {
      throw new Error(error.message || "Failed to delete promo code");
    }
  },

  // Format raw promo codes data from API
  formatPromoCodesData(promoCodesData: any[]): PromoCode[] {
    return promoCodesData
      .filter((promoCode): promoCode is Record<string, any> => !!promoCode)
      .map((promoCode): PromoCode => promoCodeApi.formatSinglePromoCodeData(promoCode));
  },

  // Format single promo code data
  formatSinglePromoCodeData(promoCodeData: any): PromoCode {
    return {
      promoCode_id: String(promoCodeData.promoCode_id || promoCodeData.id || ''),
      promo_code: String(promoCodeData.promo_code || ''),
      start_date: String(promoCodeData.start_date || ''),
      end_date: String(promoCodeData.end_date || ''),
      percentage_of_discount: promoCodeData.percentage_of_discount || 0,
      created_at: promoCodeData.created_at || promoCodeData.createdAt || new Date().toISOString(),
    };
  },

  // Utility function to check if promo code is active
  isPromoCodeActive(promoCode: PromoCode): boolean {
    try {
      const today = new Date().toISOString().slice(0, 10);
      return promoCode.start_date <= today && promoCode.end_date >= today;
    } catch {
      return false;
    }
  },

  // Get auth headers (will be overridden in component context)
  getAuthHeaders(includeContentType: boolean = true): Record<string, string> {
    const headers: Record<string, string> = {};
    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
  }
};
