"use client";

import { getHttpClient } from "@/lib/http";
import { API_CONFIG } from "@/config/api";
import type {
  Course,
  Module,
  Chapter,
  ModuleFormData,
  ChapterFormData,
} from "@/types";

const http = getHttpClient();

// Course Details API functions
export const courseDetailsApi = {
  // Load course by ID
  async loadCourse(courseId: string): Promise<Course> {
    const { data } = await http.get(
      API_CONFIG.ADMIN_FUNCTIONS.courses.getById(courseId),
      { 
        headers: this.getAuthHeaders(), 
        params: { _: Date.now() } 
      }
    );
    
    const c = (data as any)?.Course || 
              (Array.isArray((data as any)?.data) ? (data as any).data?.[0] : (data as any).data) || 
              data;
    
    return {
      course_id: String(c.course_id),
      title: c.title || "",
      description: c.description || "",
      price: String(c.price ?? ""),
      image_url: c.image_url || null,
      created_at: c.created_at,
    };
  },

  // Load modules for a course
  async loadModules(courseId: string): Promise<Module[]> {
    let modData: any;
    try {
      const res = await http.get(
        API_CONFIG.ADMIN_FUNCTIONS.courses.modules.getAll,
        {
          headers: this.getAuthHeaders(),
          params: { _: Date.now() },
        }
      );
      modData = res.data;
    } catch (error: any) {
      // If backend returns 404 when no modules exist, treat as empty.
      if (error?.status === 404 || error?.response?.status === 404) return [];
      throw error;
    }

    const allMods = Array.isArray(modData)
      ? modData
      : Array.isArray((modData as any)?.data)
        ? (modData as any).data
        : [];
    
    return allMods
      .filter((m: any) => String(m.course_id) === courseId)
      .map((m: any) => ({
        module_id: String(m.module_id),
        title: m.title || "",
        description: m.description || "",
        order_number: m.order_number ?? m.order ?? "",
        course_id: String(m.course_id ?? ""),
        created_at: m.created_at,
      }));
  },

  // Load chapters grouped by module
  async loadChapters(): Promise<Record<string, Chapter[]>> {
    let chapData: any;
    try {
      const res = await http.get(
        API_CONFIG.ADMIN_FUNCTIONS.courses.chapters.getAll,
        {
          headers: this.getAuthHeaders(),
          params: { _: Date.now() },
        }
      );
      chapData = res.data;
    } catch (error: any) {
      // If backend returns 404 when no chapters exist, treat as empty.
      if (error?.status === 404 || error?.response?.status === 404) return {};
      throw error;
    }

    const allChaps = Array.isArray(chapData)
      ? chapData
      : Array.isArray((chapData as any)?.data)
        ? (chapData as any).data
        : [];
    
    const byMod: Record<string, Chapter[]> = {};
    
    allChaps.forEach((c: any) => {
      const mid = String(c.module_id ?? "");
      if (!mid) return;
      
      const ch: Chapter = {
        chapter_id: String(c.chapter_id),
        title: c.title || "",
        description: c.description || "",
        video_link: c.video_link || c.link || "",
        order_number: c.order_number ?? c.order ?? "",
        module_id: mid,
        created_at: c.created_at,
      };
      
      if (!byMod[mid]) byMod[mid] = [];
      byMod[mid].push(ch);
    });
    
    return byMod;
  },

  // Module CRUD operations
  async createModule(courseId: string, formData: ModuleFormData): Promise<void> {
    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      order_number: formData.order_number ? Number(formData.order_number) : undefined,
      course_id: courseId,
    };

    try {
      await http.post(
        API_CONFIG.ADMIN_FUNCTIONS.courses.modules.add,
        payload,
        { headers: this.getAuthHeaders(true) }
      );
    } catch (err: any) {
      const status = err?.response?.status;
      if (status !== 400 && status !== 415 && status !== 422 && status !== 500) {
        throw err;
      }
      const requestBody = new URLSearchParams();
      requestBody.append('title', payload.title);
      requestBody.append('description', payload.description);
      if (payload.order_number != null) requestBody.append('order_number', String(payload.order_number));
      requestBody.append('course_id', payload.course_id);
      await http.post(
        API_CONFIG.ADMIN_FUNCTIONS.courses.modules.add,
        requestBody.toString(),
        {
          headers: {
            ...this.getAuthHeaders(false),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
    }
  },

  async updateModule(moduleId: string, formData: ModuleFormData): Promise<void> {
    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      order_number: formData.order_number ? Number(formData.order_number) : undefined,
    };

    try {
      await http.post(
        API_CONFIG.ADMIN_FUNCTIONS.courses.modules.update(moduleId),
        payload,
        { headers: this.getAuthHeaders(true) }
      );
    } catch (err: any) {
      const status = err?.response?.status;
      if (status !== 400 && status !== 415 && status !== 422 && status !== 500) {
        throw err;
      }
      const requestBody = new URLSearchParams();
      requestBody.append('title', payload.title);
      requestBody.append('description', payload.description);
      if (payload.order_number != null) requestBody.append('order_number', String(payload.order_number));
      await http.post(
        API_CONFIG.ADMIN_FUNCTIONS.courses.modules.update(moduleId),
        requestBody.toString(),
        {
          headers: {
            ...this.getAuthHeaders(false),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
    }
  },

  async deleteModule(moduleId: string): Promise<void> {
    await http.delete(
      API_CONFIG.ADMIN_FUNCTIONS.courses.modules.delete(moduleId),
      { headers: this.getAuthHeaders() }
    );
  },

  // Chapter CRUD operations
  async createChapter(moduleId: string, formData: ChapterFormData): Promise<void> {
    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      video_link: formData.video_link.trim(),
      order_number: formData.order_number ? Number(formData.order_number) : undefined,
      module_id: moduleId,
    };

    try {
      await http.post(
        API_CONFIG.ADMIN_FUNCTIONS.courses.chapters.add,
        payload,
        { headers: this.getAuthHeaders(true) }
      );
    } catch (err: any) {
      const status = err?.response?.status;
      if (status !== 400 && status !== 415 && status !== 422 && status !== 500) {
        throw err;
      }
      const requestBody = new URLSearchParams();
      requestBody.append('title', payload.title);
      requestBody.append('description', payload.description);
      requestBody.append('video_link', payload.video_link);
      if (payload.order_number != null) requestBody.append('order_number', String(payload.order_number));
      requestBody.append('module_id', payload.module_id);
      await http.post(
        API_CONFIG.ADMIN_FUNCTIONS.courses.chapters.add,
        requestBody.toString(),
        {
          headers: {
            ...this.getAuthHeaders(false),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
    }
  },

  async updateChapter(chapterId: string, formData: ChapterFormData): Promise<void> {
    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      video_link: formData.video_link.trim(),
      order_number: formData.order_number ? Number(formData.order_number) : undefined,
    };

    try {
      await http.post(
        API_CONFIG.ADMIN_FUNCTIONS.courses.chapters.update(chapterId),
        payload,
        { headers: this.getAuthHeaders(true) }
      );
    } catch (err: any) {
      const status = err?.response?.status;
      if (status !== 400 && status !== 415 && status !== 422 && status !== 500) {
        throw err;
      }
      const requestBody = new URLSearchParams();
      requestBody.append('title', payload.title);
      requestBody.append('description', payload.description);
      requestBody.append('video_link', payload.video_link);
      if (payload.order_number != null) requestBody.append('order_number', String(payload.order_number));
      await http.post(
        API_CONFIG.ADMIN_FUNCTIONS.courses.chapters.update(chapterId),
        requestBody.toString(),
        {
          headers: {
            ...this.getAuthHeaders(false),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
    }
  },

  async deleteChapter(chapterId: string): Promise<void> {
    await http.delete(
      API_CONFIG.ADMIN_FUNCTIONS.courses.chapters.delete(chapterId),
      { headers: courseDetailsApi.getAuthHeaders() }
    );
  },

  // Get auth headers (will be overridden in component context)
  getAuthHeaders: (includeContentType: boolean = false): Record<string, string> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("adminAuth") : null;
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    headers["Accept"] = "application/json";
    if (includeContentType) headers["Content-Type"] = "application/json";
    return headers;
  }
};
