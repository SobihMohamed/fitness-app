"use client";

import { useState, useEffect, useCallback } from "react";
import { courseDetailsApi } from "@/lib/api/course-details";
import { useAdminApi } from "./use-admin-api";
import type { 
  Course, 
  Module, 
  Chapter, 
  ModuleFormData, 
  ChapterFormData,
  CourseDetailsDeleteTarget
} from "@/types";

interface CourseDetailsState {
  course: Course | null;
  modules: Module[];
  chaptersByModule: Record<string, Chapter[]>;
  loading: {
    initial: boolean;
    saving: boolean;
    deleting: boolean;
  };
}

interface CourseDetailsActions {
  loadCourseData: () => Promise<void>;
  loadModulesAndChapters: () => Promise<void>;
  createModule: (formData: ModuleFormData) => Promise<void>;
  updateModule: (moduleId: string, formData: ModuleFormData) => Promise<void>;
  deleteModule: (moduleId: string) => Promise<void>;
  createChapter: (moduleId: string, formData: ChapterFormData) => Promise<void>;
  updateChapter: (chapterId: string, formData: ChapterFormData) => Promise<void>;
  deleteChapter: (chapterId: string) => Promise<void>;
  optimisticUpdateChapter: (moduleId: string, chapter: Chapter, isEdit: boolean, editingChapterId?: string) => void;
}

interface CourseDetailsReturn extends CourseDetailsState, CourseDetailsActions {}

export function useCourseDetailsManagement(courseId: string): CourseDetailsReturn {
  const { getAuthHeaders, showSuccessToast, showErrorToast } = useAdminApi();
  
  // State
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [chaptersByModule, setChaptersByModule] = useState<Record<string, Chapter[]>>({});
  const [loading, setLoading] = useState({
    initial: true,
    saving: false,
    deleting: false,
  });

  // Note: Auth headers are now handled directly in the API

  // Load course data
  const loadCourseData = useCallback(async () => {
    if (!courseId) return;
    
    try {
      const courseData = await courseDetailsApi.loadCourse(courseId);
      setCourse(courseData);
    } catch (error: any) {
      showErrorToast(error?.message || "Failed to load course");
      throw error;
    }
  }, [courseId, showErrorToast]);

  // Load modules and chapters
  const loadModulesAndChapters = useCallback(async () => {
    if (!courseId) return;
    
    try {
      const [modulesData, chaptersData] = await Promise.all([
        courseDetailsApi.loadModules(courseId),
        courseDetailsApi.loadChapters()
      ]);
      
      setModules(modulesData);
      setChaptersByModule(chaptersData);
    } catch (error: any) {
      showErrorToast(error?.message || "Failed to load modules and chapters");
      throw error;
    }
  }, [courseId, showErrorToast]);

  // Module operations
  const createModule = useCallback(async (formData: ModuleFormData) => {
    if (!courseId) return;
    
    try {
      setLoading(prev => ({ ...prev, saving: true }));
      await courseDetailsApi.createModule(courseId, formData);
      showSuccessToast("Module created successfully");
      await loadModulesAndChapters();
    } catch (error: any) {
      showErrorToast(error?.message || "Failed to create module");
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  }, [courseId, loadModulesAndChapters, showSuccessToast, showErrorToast]);

  const updateModule = useCallback(async (moduleId: string, formData: ModuleFormData) => {
    try {
      setLoading(prev => ({ ...prev, saving: true }));
      await courseDetailsApi.updateModule(moduleId, formData);
      showSuccessToast("Module updated successfully");
      await loadModulesAndChapters();
    } catch (error: any) {
      showErrorToast(error?.message || "Failed to update module");
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  }, [loadModulesAndChapters, showSuccessToast, showErrorToast]);

  const deleteModule = useCallback(async (moduleId: string) => {
    try {
      setLoading(prev => ({ ...prev, deleting: true }));
      await courseDetailsApi.deleteModule(moduleId);
      showSuccessToast("Module deleted successfully");
      await loadModulesAndChapters();
    } catch (error: any) {
      showErrorToast(error?.message || "Failed to delete module");
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, deleting: false }));
    }
  }, [loadModulesAndChapters, showSuccessToast, showErrorToast]);

  // Optimistic update for chapters
  const optimisticUpdateChapter = useCallback((
    moduleId: string, 
    chapter: Chapter, 
    isEdit: boolean, 
    editingChapterId?: string
  ) => {
    setChaptersByModule((prev) => {
      const copy = { ...prev };
      const list = copy[moduleId] ? [...copy[moduleId]] : [];
      
      if (isEdit && editingChapterId) {
        copy[moduleId] = list.map((c) =>
          c.chapter_id === editingChapterId ? chapter : c
        );
      } else {
        list.push(chapter);
        copy[moduleId] = list;
      }
      
      return copy;
    });
  }, []);

  // Chapter operations
  const createChapter = useCallback(async (moduleId: string, formData: ChapterFormData) => {
    try {
      setLoading(prev => ({ ...prev, saving: true }));
      await courseDetailsApi.createChapter(moduleId, formData);
      showSuccessToast("Chapter created successfully");
      
      // Optimistic update for immediate UI feedback
      const tempChapter: Chapter = {
        chapter_id: `temp-${Date.now()}`,
        title: formData.title,
        description: formData.description,
        video_link: formData.video_link,
        order_number: formData.order_number ? Number(formData.order_number) : "",
        module_id: moduleId,
        created_at: new Date().toISOString(),
      };
      
      optimisticUpdateChapter(moduleId, tempChapter, false);
      
      // Refresh with real data
      await loadModulesAndChapters();
    } catch (error: any) {
      showErrorToast(error?.message || "Failed to create chapter");
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  }, [loadModulesAndChapters, optimisticUpdateChapter, showSuccessToast, showErrorToast]);

  const updateChapter = useCallback(async (chapterId: string, formData: ChapterFormData) => {
    try {
      setLoading(prev => ({ ...prev, saving: true }));
      await courseDetailsApi.updateChapter(chapterId, formData);
      showSuccessToast("Chapter updated successfully");
      await loadModulesAndChapters();
    } catch (error: any) {
      showErrorToast(error?.message || "Failed to update chapter");
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  }, [loadModulesAndChapters, showSuccessToast, showErrorToast]);

  const deleteChapter = useCallback(async (chapterId: string) => {
    try {
      setLoading(prev => ({ ...prev, deleting: true }));
      await courseDetailsApi.deleteChapter(chapterId);
      showSuccessToast("Chapter deleted successfully");
      await loadModulesAndChapters();
    } catch (error: any) {
      showErrorToast(error?.message || "Failed to delete chapter");
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, deleting: false }));
    }
  }, [loadModulesAndChapters, showSuccessToast, showErrorToast]);

  // Initialize data on mount
  useEffect(() => {
    if (!courseId) return;
    
    const init = async () => {
      try {
        await Promise.all([loadCourseData(), loadModulesAndChapters()]);
      } catch (error: any) {
        showErrorToast(error?.message || "Failed to load course details");
      } finally {
        setLoading(prev => ({ ...prev, initial: false }));
      }
    };
    
    init();
  }, [courseId, loadCourseData, loadModulesAndChapters, showErrorToast]);

  return {
    // State
    course,
    modules,
    chaptersByModule,
    loading,
    
    // Actions
    loadCourseData,
    loadModulesAndChapters,
    createModule,
    updateModule,
    deleteModule,
    createChapter,
    updateChapter,
    deleteChapter,
    optimisticUpdateChapter,
  };
}
