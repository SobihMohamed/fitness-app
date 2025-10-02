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
    const { data: modData } = await http.get(
      API_CONFIG.ADMIN_FUNCTIONS.courses.modules.getAll,
      { 
        headers: this.getAuthHeaders(), 
        params: { _: Date.now() } 
      }
    );
    
    const allMods = Array.isArray(modData) ? modData : 
                   Array.isArray((modData as any)?.data) ? (modData as any).data : [];
    
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
    const { data: chapData } = await http.get(
      API_CONFIG.ADMIN_FUNCTIONS.courses.chapters.getAll,
      { 
        headers: this.getAuthHeaders(), 
        params: { _: Date.now() } 
      }
    );
    
    const allChaps = Array.isArray(chapData) ? chapData : 
                    Array.isArray((chapData as any)?.data) ? (chapData as any).data : [];
    
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

    await http.post(
      API_CONFIG.ADMIN_FUNCTIONS.courses.modules.add,
      payload,
      { headers: this.getAuthHeaders(true) }
    );
  },

  async updateModule(moduleId: string, formData: ModuleFormData): Promise<void> {
    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      order_number: formData.order_number ? Number(formData.order_number) : undefined,
    };

    await http.post(
      API_CONFIG.ADMIN_FUNCTIONS.courses.modules.update(moduleId),
      payload,
      { headers: this.getAuthHeaders(true) }
    );
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

    await http.post(
      API_CONFIG.ADMIN_FUNCTIONS.courses.chapters.add,
      payload,
      { headers: this.getAuthHeaders(true) }
    );
  },

  async updateChapter(chapterId: string, formData: ChapterFormData): Promise<void> {
    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      video_link: formData.video_link.trim(),
      order_number: formData.order_number ? Number(formData.order_number) : undefined,
    };

    await http.post(
      API_CONFIG.ADMIN_FUNCTIONS.courses.chapters.update(chapterId),
      payload,
      { headers: this.getAuthHeaders(true) }
    );
  },

  async deleteChapter(chapterId: string): Promise<void> {
    await http.delete(
      API_CONFIG.ADMIN_FUNCTIONS.courses.chapters.delete(chapterId),
      { headers: this.getAuthHeaders() }
    );
  },

  // Get auth headers (will be overridden in component context)
  getAuthHeaders(includeContentType: boolean = false): Record<string, string> {
    const token = typeof window !== "undefined" ? localStorage.getItem("adminAuth") : null;
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    headers["Accept"] = "application/json";
    if (includeContentType) headers["Content-Type"] = "application/json";
    return headers;
  }
};
