"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { usersApi } from "@/lib/api/users";
import { useAdminApi } from "./use-admin-api";
import type { 
  UserType, 
  AdminType, 
  UserFormData, 
  UserStats, 
  UserManagementReturn,
  CombinedUserItem
} from "@/types";

export function useUserManagement(): UserManagementReturn {
  const { getAuthHeaders, showErrorToast, showSuccessToast } = useAdminApi();
  
  // State
  const [users, setUsers] = useState<UserType[]>([]);
  const [admins, setAdmins] = useState<AdminType[]>([]);
  const [loading, setLoading] = useState({
    initial: true,
    users: false,
    admins: false,
    submitting: false,
    deleting: false,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("admins");
  const [currentPage, setCurrentPage] = useState(1);

  // Override API auth headers
  useEffect(() => {
    const authHeaders = (includeContentType = true) => {
      const headers = getAuthHeaders(includeContentType);
      return headers;
    };

    usersApi.getAuthHeaders = authHeaders;
  }, [getAuthHeaders]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Initialize data - removed fetchUsers/fetchAdmins from dependencies to prevent infinite re-renders
  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([fetchUsers(), fetchAdmins()]);
      } finally {
        setLoading(prev => ({ ...prev, initial: false }));
      }
    };

    initializeData();
  }, []); // Empty dependency array to run only once on mount

  // Fetch users - removed showErrorToast from dependencies to prevent infinite re-renders
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, users: true }));
      const data = await usersApi.fetchUsers();
      setUsers(data);
    } catch (error: any) {
      showErrorToast(error.message || "Failed to load users");
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  }, []);

  // Fetch admins - removed showErrorToast from dependencies to prevent infinite re-renders
  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, admins: true }));
      const data = await usersApi.fetchAdmins();
      setAdmins(data);
    } catch (error: any) {
      showErrorToast(error.message || "Failed to load admins");
    } finally {
      setLoading(prev => ({ ...prev, admins: false }));
    }
  }, []);

  // Refresh data
  const refreshData = useCallback(async () => {
    await Promise.all([fetchUsers(), fetchAdmins()]);
  }, [fetchUsers, fetchAdmins]);

  // Add user - removed toast functions from dependencies to prevent infinite re-renders
  const addUser = useCallback(async (formData: UserFormData) => {
    try {
      setLoading(prev => ({ ...prev, submitting: true }));
      await usersApi.addUser(formData);
      const successMessage = formData.user_type === "admin" 
        ? "Admin added successfully!" 
        : "User added successfully!";
      showSuccessToast(successMessage);
      await refreshData();
    } catch (error: any) {
      showErrorToast(error.message || "Failed to add user");
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }));
    }
  }, [refreshData]);

  // Update user - removed toast functions from dependencies to prevent infinite re-renders
  const updateUser = useCallback(async (userId: string, formData: UserFormData, type: "user" | "admin") => {
    try {
      setLoading(prev => ({ ...prev, submitting: true }));
      await usersApi.updateUser(userId, formData, type);
      const successMessage = type === "admin" 
        ? "Admin updated successfully!" 
        : "User updated successfully!";
      showSuccessToast(successMessage);
      await refreshData();
    } catch (error: any) {
      showErrorToast(error.message || "Failed to update user");
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }));
    }
  }, [refreshData]);

  // Delete user - removed toast functions from dependencies to prevent infinite re-renders
  const deleteUser = useCallback(async (userId: string, type: "user" | "admin") => {
    try {
      setLoading(prev => ({ ...prev, deleting: true }));
      await usersApi.deleteUser(userId, type);
      const successMessage = type === "admin" 
        ? "Admin deleted successfully!" 
        : "User deleted successfully!";
      showSuccessToast(successMessage);
      await refreshData();
    } catch (error: any) {
      showErrorToast(error.message || "Failed to delete user");
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, deleting: false }));
    }
  }, [refreshData]);

  // Check if email exists
  const checkEmailExists = useCallback((email: string, excludeId?: string): boolean => {
    const allEmails = [
      ...users.map((u) => ({ email: u.email, id: u.user_id })),
      ...admins.map((a) => ({ email: a.email, id: a.admin_id })),
    ];
    return allEmails.some(
      (item) =>
        item.email.toLowerCase() === email.toLowerCase() &&
        (!excludeId || item.id !== excludeId)
    );
  }, [users, admins]);

  // Check if phone exists
  const checkPhoneExists = useCallback((phone: string, excludeId?: string): boolean => {
    const allPhones = [
      ...users.map((u) => ({ phone: u.phone, id: u.user_id })),
      ...admins.map((a) => ({ phone: a.phone, id: a.admin_id })),
    ];
    return allPhones.some(
      (item) => item.phone === phone && (!excludeId || item.id !== excludeId)
    );
  }, [users, admins]);

  // Memoized filtered and paginated data
  const { filteredData, paginatedData, totalPages } = useMemo(() => {
    // Combine users and admins with type information
    const allData: CombinedUserItem[] = [
      ...users.map((u) => ({ ...u, type: "user" as const })),
      ...admins.map((a) => ({ ...a, type: "admin" as const })),
    ];
    
    // Filter data based on search term and selected type
    const filtered = allData.filter((item) => {
      // Search filter - check name and email
      const matchesSearch = debouncedSearchTerm
        ? item.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          item.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        : true;
      
      // Type filter - show users, admins, or both
      const matchesType = selectedType === "all" ||
        (selectedType === "users" && item.type === "user") ||
        (selectedType === "admins" && item.type === "admin");
      
      return matchesSearch && matchesType;
    });
    
    // Calculate pagination
    const itemsPerPage = 5;
    const total = Math.ceil(filtered.length / itemsPerPage);
    const paginated = filtered.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
    
    return {
      filteredData: filtered,
      totalPages: total,
      paginatedData: paginated
    };
  }, [users, admins, debouncedSearchTerm, selectedType, currentPage]);

  // Memoized stats
  const stats: UserStats = useMemo(() => {
    const activeUsers = users.filter(u => u.is_active !== "0").length;
    const recentUsers = users.filter(u => {
      const createdDate = new Date(u.created_at);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return createdDate > thirtyDaysAgo;
    }).length;

    return {
      totalUsers: users.length,
      totalAdmins: admins.length,
      activeUsers,
      recentUsers,
    };
  }, [users, admins]);

  return {
    // State
    users,
    admins,
    loading,
    searchTerm,
    debouncedSearchTerm,
    selectedType,
    currentPage,
    
    // Actions
    fetchUsers,
    fetchAdmins,
    refreshData,
    setSearchTerm,
    setSelectedType,
    setCurrentPage,
    addUser,
    updateUser,
    deleteUser,
    checkEmailExists,
    checkPhoneExists,
    
    // Computed data
    filteredData,
    paginatedData,
    totalPages,
    stats,
  };
}
