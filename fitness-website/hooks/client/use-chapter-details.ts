"use client";

import { useState, useEffect, useCallback } from "react";
import { API_CONFIG } from "@/config/api";
import { toast } from "sonner";

interface Chapter {
  chapter_id: number;
  module_id: number;
  title: string;
  description: string;
  video_link: string;
  order_number: number;
  created_at: string;
}

interface Note {
  id: string;
  content: string;
  timestamp: number;
  created_at: string;
}

interface ChapterDetailsState {
  chapter: Chapter | null;
  moduleChapters: Chapter[];
  notes: Note[];
  loading: boolean;
  error: string | null;
}

export function useChapterDetails(chapterId: string, courseId?: string) {
  const [state, setState] = useState<ChapterDetailsState>({
    chapter: null,
    moduleChapters: [],
    notes: [],
    loading: true,
    error: null,
  });

  // Fetch chapter details
  const fetchChapterDetails = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Attach auth token if available (admin endpoints may require it)
      const token = typeof window !== 'undefined' ? sessionStorage.getItem("token") : null;
      const target = API_CONFIG.USER_FUNCTIONS.courses.chapters.getById(chapterId);
      const response = await fetch(
        `/proxy-json?url=${encodeURIComponent(target)}`,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            'Accept': 'application/json',
          },
        }
      );

      if (response.status === 401 || !response.ok) {
        // Fallback: use CoursePage if available
        if (!courseId) {
          const message = "Unauthorized – please login to view this chapter.";
          console.error("Chapter details 401 or failed and no courseId for fallback");
          setState(prev => ({ ...prev, loading: false, error: message }));
          toast.error(message);
          return;
        }
        const courseTarget = API_CONFIG.USER_FUNCTIONS.courses.getById(courseId);
        const courseRes = await fetch(`/proxy-json?url=${encodeURIComponent(courseTarget)}`, {
          headers: { 'Accept': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        });
        const courseData = await courseRes.json();
        if (courseRes.ok && courseData?.status === 'success') {
          const modules = courseData?.Course?.modules || [];
          let foundChapter: any = null;
          let moduleIdOfChapter: number | null = null;
          for (const m of modules) {
            const ch = (m.chapters || []).find((c: any) => String(c.chapter_id) === String(chapterId));
            if (ch) {
              foundChapter = ch;
              moduleIdOfChapter = m.module_id;
              break;
            }
          }
          if (foundChapter) {
            setState(prev => ({ ...prev, chapter: foundChapter, loading: false }));
            // Also set module chapters list for navigation
            const parentModule = modules.find((m: any) => String(m.module_id) === String(moduleIdOfChapter));
            if (parentModule?.chapters) {
              setState(prev => ({ ...prev, moduleChapters: parentModule.chapters.sort((a: Chapter, b: Chapter) => a.order_number - b.order_number) }));
            }
            return;
          }
        }
        throw new Error('Failed to load chapter via fallback');
      }
      const data = await response.json();
      
      if (data.status === "success") {
        setState(prev => ({ 
          ...prev, 
          chapter: data.Chapter,
          loading: false 
        }));
        
        // Fetch other chapters in the same module
        if (data.Chapter?.module_id) {
          await fetchModuleChapters(data.Chapter.module_id);
        }
      } else {
        throw new Error(data.message || "Failed to fetch chapter details");
      }
    } catch (error: any) {
      console.error("Error fetching chapter details:", error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || "Failed to load chapter details" 
      }));
    }
  }, [chapterId, courseId]);

  // Fetch all chapters in the module
  const fetchModuleChapters = useCallback(async (moduleId: number) => {
    try {
      const token = typeof window !== 'undefined' ? sessionStorage.getItem("token") : null;
      const target = API_CONFIG.USER_FUNCTIONS.courses.modules.getById(moduleId.toString());
      const response = await fetch(
        `/proxy-json?url=${encodeURIComponent(target)}`,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            'Accept': 'application/json',
          },
        }
      );

      if (response.status === 401) {
        console.error("Module chapters 401 Unauthorized");
        return;
      }
      const data = await response.json();
      
      if (data.status === "success" && data.Module?.chapters) {
        setState(prev => ({ 
          ...prev, 
          moduleChapters: data.Module.chapters.sort((a: Chapter, b: Chapter) => a.order_number - b.order_number)
        }));
      }
    } catch (error: any) {
      console.error("Error fetching module chapters:", error);
    }
  }, []);

  // Mark chapter as completed
  const markAsCompleted = useCallback(async () => {
    try {
      // This would typically call an API to mark progress
      toast.success("Chapter completed!");
    } catch (error: any) {
      console.error("Error marking chapter as completed:", error);
      toast.error("Failed to mark chapter as completed");
    }
  }, []);

  // Add note
  const addNote = useCallback(async (content: string, timestamp: number) => {
    try {
      const newNote: Note = {
        id: Date.now().toString(),
        content,
        timestamp,
        created_at: new Date().toISOString(),
      };
      
      setState(prev => ({ 
        ...prev, 
        notes: [...prev.notes, newNote].sort((a, b) => a.timestamp - b.timestamp)
      }));
      
      toast.success("Note added successfully");
    } catch (error: any) {
      console.error("Error adding note:", error);
      toast.error("Failed to add note");
    }
  }, []);

  // Update note
  const updateNote = useCallback(async (noteId: string, content: string) => {
    try {
      setState(prev => ({ 
        ...prev, 
        notes: prev.notes.map(note => 
          note.id === noteId ? { ...note, content } : note
        )
      }));
      
      toast.success("Note updated successfully");
    } catch (error: any) {
      console.error("Error updating note:", error);
      toast.error("Failed to update note");
    }
  }, []);

  // Delete note
  const deleteNote = useCallback(async (noteId: string) => {
    try {
      setState(prev => ({ 
        ...prev, 
        notes: prev.notes.filter(note => note.id !== noteId)
      }));
      
      toast.success("Note deleted successfully");
    } catch (error: any) {
      console.error("Error deleting note:", error);
      toast.error("Failed to delete note");
    }
  }, []);

  // Load chapter details on mount
  useEffect(() => {
    if (chapterId) {
      fetchChapterDetails();
    }
  }, [chapterId, fetchChapterDetails]);

  const actions = {
    refetch: fetchChapterDetails,
    markAsCompleted,
    addNote,
    updateNote,
    deleteNote,
  };

  return {
    state,
    actions,
  };
}
