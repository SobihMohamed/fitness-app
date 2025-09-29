"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { promoCodeApi } from "@/lib/api/promocode";
import { useAdminApi } from "./use-admin-api";
import type { 
  PromoCode, 
  PromoCodeFormData, 
  PromoCodeManagementReturn
} from "@/types";

const todayStr = () => new Date().toISOString().slice(0, 10);

export function usePromoCodeManagement(): PromoCodeManagementReturn {
  const { getAuthHeaders, showErrorToast, showSuccessToast } = useAdminApi();
  
  // State
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PromoCode | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<PromoCode | null>(null);
  const [form, setForm] = useState<PromoCodeFormData>({
    promo_code: "",
    start_date: todayStr(),
    end_date: todayStr(),
    percentage_of_discount: "",
  });

  // Override API auth headers
  useEffect(() => {
    const authHeaders = (includeContentType = true) => {
      const headers = getAuthHeaders(includeContentType);
      return headers;
    };

    promoCodeApi.getAuthHeaders = authHeaders;
  }, [getAuthHeaders]);

  // Initialize data - removed loadPromoCodes from dependencies to prevent infinite re-renders
  useEffect(() => {
    const initializeData = async () => {
      try {
        await loadPromoCodes();
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []); // Empty dependency array to run only once on mount

  // Load promo codes - removed showErrorToast from dependencies to prevent infinite re-renders
  const loadPromoCodes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await promoCodeApi.fetchPromoCodes();
      setPromoCodes(data);
    } catch (error: any) {
      showErrorToast(error.message || "Failed to load promo codes");
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh data after operations
  const refreshData = useCallback(async () => {
    try {
      const data = await promoCodeApi.fetchPromoCodes();
      setPromoCodes(data);
    } catch (error: any) {
      // Silent refresh, don't show error toast
    }
  }, []);

  // Filtered promo codes based on search
  const filteredPromoCodes = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();
    if (!searchTerm) return promoCodes;
    
    return promoCodes.filter((promoCode) =>
      promoCode.promo_code?.toLowerCase().includes(searchTerm) ||
      promoCode.percentage_of_discount?.toString().includes(searchTerm)
    );
  }, [search, promoCodes]);

  // Check if promo code is active
  const isActive = useCallback((promoCode: PromoCode): boolean => {
    return promoCodeApi.isPromoCodeActive(promoCode);
  }, []);

  // Open add dialog
  const openAdd = useCallback(() => {
    setEditing(null);
    setForm({
      promo_code: "",
      start_date: todayStr(),
      end_date: todayStr(),
      percentage_of_discount: "",
    });
    setIsDialogOpen(true);
  }, []);

  // Open edit dialog
  const openEdit = useCallback((promoCode: PromoCode) => {
    setEditing(promoCode);
    setForm({
      promo_code: promoCode.promo_code || "",
      start_date: (promoCode.start_date || todayStr()).slice(0, 10),
      end_date: (promoCode.end_date || todayStr()).slice(0, 10),
      percentage_of_discount: (promoCode.percentage_of_discount ?? "").toString(),
    });
    setIsDialogOpen(true);
  }, []);

  // Validate form
  const validateForm = useCallback((): boolean => {
    if (!form.promo_code.trim()) {
      showErrorToast("Promo code is required");
      return false;
    }
    if (!form.start_date || !form.end_date) {
      showErrorToast("Start and end date are required");
      return false;
    }
    if (form.end_date < form.start_date) {
      showErrorToast("End date must be after start date");
      return false;
    }
    const pct = Number(form.percentage_of_discount);
    if (Number.isNaN(pct) || pct <= 0 || pct > 100) {
      showErrorToast("Percentage must be a number between 1 and 100");
      return false;
    }
    return true;
  }, [form, showErrorToast]);

  // Save promo code (create or update) - removed toast functions from dependencies to prevent infinite re-renders
  const savePromoCode = useCallback(async () => {
    if (!validateForm()) return;
    
    try {
      setSubmitting(true);
      
      if (editing) {
        await promoCodeApi.updatePromoCode(editing.promoCode_id, form);
        showSuccessToast("Promo code updated successfully");
      } else {
        await promoCodeApi.createPromoCode(form);
        showSuccessToast("Promo code created successfully");
      }

      await refreshData();
      setIsDialogOpen(false);
      setEditing(null);
    } catch (error: any) {
      showErrorToast(error.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  }, [editing, form, validateForm, refreshData]);

  // Delete promo code - removed toast functions from dependencies to prevent infinite re-renders
  const deletePromoCode = useCallback(async () => {
    if (!confirmDelete) return;
    
    try {
      setSubmitting(true);
      await promoCodeApi.deletePromoCode(confirmDelete.promoCode_id);
      showSuccessToast("Promo code deleted successfully");
      
      // Update local state immediately for better UX
      setPromoCodes(prev => prev.filter(p => p.promoCode_id !== confirmDelete.promoCode_id));
      setConfirmDelete(null);
    } catch (error: any) {
      showErrorToast(error.message || "Failed to delete promo code");
    } finally {
      setSubmitting(false);
    }
  }, [confirmDelete]);

  // Update form field
  const updateForm = useCallback((field: keyof PromoCodeFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  return {
    // State
    promoCodes,
    loading,
    submitting,
    search,
    isDialogOpen,
    editing,
    confirmDelete,
    form,
    
    // Computed values
    filteredPromoCodes,
    
    // Actions
    loadPromoCodes,
    openAdd,
    openEdit,
    savePromoCode,
    deletePromoCode,
    setSearch,
    setIsDialogOpen,
    setConfirmDelete,
    validateForm,
    isActive,
    updateForm,
  };
}
