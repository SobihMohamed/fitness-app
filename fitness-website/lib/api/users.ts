"use client";

import { getHttpClient } from "@/lib/http";
import { API_CONFIG } from "@/config/api";
import type {
  UserType,
  AdminType,
  UserFormData,
  UserApiResponse
} from "@/types";

const http = getHttpClient();

// Users API functions
export const usersApi = {
  // Fetch all users
  async fetchUsers(): Promise<UserType[]> {
    try {
      const response = await http.get<UserApiResponse>(
        API_CONFIG.ADMIN_FUNCTIONS.users.getAll,
        { 
          headers: usersApi.getAuthHeaders(),
          params: { _: Date.now() }
        }
      );

      const data = response.data;
      const usersData = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.users)
        ? data.users
        : [];

      return usersApi.formatUsersData(usersData);
    } catch (error: any) {
      if (error?.status === 404) {
        return [];
      }
      throw new Error(error.message || "Failed to load users");
    }
  },

  // Fetch all admins
  async fetchAdmins(): Promise<AdminType[]> {
    try {
      const response = await http.get<UserApiResponse>(
        API_CONFIG.ADMIN_FUNCTIONS.admins.getAll,
        { 
          headers: usersApi.getAuthHeaders(),
          params: { _: Date.now() }
        }
      );

      const data = response.data;
      const adminsData = Array.isArray(data)
        ? data
        : Array.isArray(data?.users)
        ? data.users
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.admins)
        ? data.admins
        : [];

      return usersApi.formatAdminsData(adminsData);
    } catch (error: any) {
      if (error?.status === 404) {
        return [];
      }
      throw new Error(error.message || "Failed to load admins");
    }
  },

  // Add new user
  async addUser(formData: UserFormData): Promise<void> {
    const endpoint = formData.user_type === "admin" 
      ? API_CONFIG.ADMIN_FUNCTIONS.admins.add
      : API_CONFIG.ADMIN_FUNCTIONS.users.add;
    
    const requestBody = formData.user_type === "admin" ? {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || "",
      address: formData.address?.trim() || "",
      password: formData.password,
      country: formData.country.trim(),
      is_super_admin: 1,
    } : {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || "",
      address: formData.address.trim(),
      password: formData.password,
      country: formData.country.trim(),
      user_type: formData.user_type,
    };

    await http.post(endpoint, requestBody, {
      headers: usersApi.getAuthHeaders()
    });
  },

  // Update existing user
  async updateUser(userId: string, formData: UserFormData, type: "user" | "admin"): Promise<void> {
    const endpoint = type === "user"
      ? API_CONFIG.ADMIN_FUNCTIONS.users.update(userId)
      : API_CONFIG.ADMIN_FUNCTIONS.admins.update(userId);
    
    const requestBody = type === "admin" ? {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || "",
      address: formData.address?.trim() || "",
      country: formData.country.trim(),
      role: formData.role,
      ...(formData.password.trim() && { password: formData.password }),
      is_super_admin: 1,
    } : {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      country: formData.country.trim(),
      user_type: formData.user_type,
      ...(formData.password.trim() && { password: formData.password }),
    };

    await http.put(endpoint, requestBody, {
      headers: usersApi.getAuthHeaders()
    });
  },

  // Delete user
  async deleteUser(userId: string, type: "user" | "admin"): Promise<void> {
    const endpoint = type === "user"
      ? API_CONFIG.ADMIN_FUNCTIONS.users.delete(userId)
      : API_CONFIG.ADMIN_FUNCTIONS.admins.delete(userId);
    
    await http.delete(endpoint, {
      headers: usersApi.getAuthHeaders()
    });
  },

  // Format raw user data from API
  formatUsersData(usersData: any[]): UserType[] {
    return usersData
      .filter((user): user is Record<string, any> => !!user)
      .map((user): UserType => ({
        user_id: String(user.user_id || user.id || ''),
        name: String(user.name || ''),
        email: String(user.email || ''),
        phone: String(user.phone || ''),
        address: String(user.address || ''),
        country: user.country || '',
        user_type: String(user.user_type || 'customer'),
        // Handle various date field names and formats from API
        created_at: user.created_at || user.createdAt || user.date_created || 
                   user.registration_date || user.signup_date || new Date().toISOString(),
        is_active: user.is_active,
      }));
  },

  // Format raw admin data from API
  formatAdminsData(adminsData: any[]): AdminType[] {
    return adminsData
      .filter((admin): admin is Record<string, any> => !!admin)
      .map((admin): AdminType => ({
        admin_id: String(admin.admin_id || admin.id || ''),
        name: String(admin.name || ''),
        email: String(admin.email || ''),
        phone: String(admin.phone || ''),
        role: String(admin.role || 'admin'),
        // Handle various date field names and formats from API
        created_at: admin.created_at || admin.createdAt || admin.date_created || 
                   admin.registration_date || admin.signup_date || new Date().toISOString(),
        is_active: admin.is_active,
      }));
  },

  // Get auth headers (will be overridden in component context)
  getAuthHeaders(includeContentType: boolean = true): Record<string, string> {
    return {};
  }
};
