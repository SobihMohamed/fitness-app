"use client";

import React, { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { AdminLayout } from "@/components/admin/admin-layout";
import { useCourseDetailsManagement } from "@/hooks/admin/use-course-details-management";
import { useParams } from "next/navigation";
import type { 
  Course, 
  Module, 
  Chapter, 
  ModuleFormData, 
  ChapterFormData,
  CourseDetailsDeleteTarget
} from "@/types";
import { Loader2 } from "lucide-react";

// Lazy load heavy components for better performance
const CourseHeader = dynamic(() => import("@/components/admin/courses/course-header").then(mod => ({ default: mod.CourseHeader })), { 
  loading: () => <div className="h-32 bg-gray-100 animate-pulse rounded-lg mb-6" />
});
const ModulesAccordion = dynamic(() => import("@/components/admin/courses/modules-accordion").then(mod => ({ default: mod.ModulesAccordion })), { 
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />
});
const ModuleForm = dynamic(() => import("@/components/admin/courses/module-form").then(mod => ({ default: mod.ModuleForm })), { 
  loading: () => <div className="h-80 bg-gray-100 animate-pulse rounded-lg" />
});
const ChapterForm = dynamic(() => import("@/components/admin/courses/chapter-form").then(mod => ({ default: mod.ChapterForm })), { 
  loading: () => <div className="h-80 bg-gray-100 animate-pulse rounded-lg" />
});
const CourseDetailsDeleteConfirmation = dynamic(() => import("@/components/admin/courses/course-details-delete-confirmation").then(mod => ({ default: mod.CourseDetailsDeleteConfirmation })), { 
  loading: () => <div className="h-48 bg-gray-100 animate-pulse rounded-lg" />
});

export default function CourseDetailsPage() {
  const params = useParams<{ id: string }>();
  const courseId = params?.id ? String(params.id) : "";
  
  const courseManagement = useCourseDetailsManagement(courseId);

  // Local UI state for forms and delete dialog
  const [isModuleFormOpen, setIsModuleFormOpen] = useState(false);
  const [isChapterFormOpen, setIsChapterFormOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [currentModuleForChapter, setCurrentModuleForChapter] = useState<Module | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CourseDetailsDeleteTarget | null>(null);

  const initialModuleFormData: ModuleFormData = useMemo(() => ({
    title: "",
    description: "",
    order_number: "",
  }), []);

  const initialChapterFormData: ChapterFormData = useMemo(() => ({
    title: "",
    description: "",
    video_link: "",
    order_number: "",
  }), []);

  const [moduleFormData, setModuleFormData] = useState<ModuleFormData>(initialModuleFormData);
  const [chapterFormData, setChapterFormData] = useState<ChapterFormData>(initialChapterFormData);

  // Handlers with useCallback for performance
  const handleOpenCreateModule = useCallback(() => {
    setEditingModule(null);
    setModuleFormData(initialModuleFormData);
    setIsModuleFormOpen(true);
  }, [initialModuleFormData]);

  const handleEditModule = useCallback((module: Module) => {
    setEditingModule(module);
    setModuleFormData({
      title: module.title || "",
      description: module.description || "",
      order_number: String(module.order_number ?? ""),
    });
    setIsModuleFormOpen(true);
  }, []);

  const handleSubmitModule = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleFormData.title.trim()) return;

    try {
      if (editingModule) {
        await courseManagement.updateModule(String(editingModule.module_id), moduleFormData);
      } else {
        await courseManagement.createModule(moduleFormData);
      }
      setIsModuleFormOpen(false);
      setEditingModule(null);
      setModuleFormData(initialModuleFormData);
    } catch (error) {
      // Error handling is done in the hook
    }
  }, [editingModule, moduleFormData, courseManagement, initialModuleFormData]);

  const handleDeleteModule = useCallback((module: Module) => {
    setDeleteTarget({
      type: "module",
      id: module.module_id,
      name: module.title,
    });
    setShowDeleteConfirm(true);
  }, []);

  const handleOpenCreateChapter = useCallback((module: Module) => {
    setEditingChapter(null);
    setCurrentModuleForChapter(module);
    setChapterFormData(initialChapterFormData);
    setIsChapterFormOpen(true);
  }, [initialChapterFormData]);

  const handleEditChapter = useCallback((module: Module, chapter: Chapter) => {
    setCurrentModuleForChapter(module);
    setEditingChapter(chapter);
    setChapterFormData({
      title: chapter.title || "",
      description: chapter.description || "",
      video_link: chapter.video_link || "",
      order_number: String(chapter.order_number ?? ""),
    });
    setIsChapterFormOpen(true);
  }, []);

  const handleSubmitChapter = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapterFormData.title.trim() || !currentModuleForChapter) return;

    try {
      if (editingChapter) {
        await courseManagement.updateChapter(String(editingChapter.chapter_id), chapterFormData);
      } else {
        await courseManagement.createChapter(String(currentModuleForChapter.module_id), chapterFormData);
      }
      setIsChapterFormOpen(false);
      setEditingChapter(null);
      setCurrentModuleForChapter(null);
      setChapterFormData(initialChapterFormData);
    } catch (error) {
      // Error handling is done in the hook
    }
  }, [editingChapter, chapterFormData, currentModuleForChapter, courseManagement, initialChapterFormData]);

  const handleDeleteChapter = useCallback((chapter: Chapter) => {
    setDeleteTarget({ type: "chapter", id: chapter.chapter_id, name: chapter.title });
    setShowDeleteConfirm(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;

    try {
      if (deleteTarget.type === "module") {
        await courseManagement.deleteModule(String(deleteTarget.id));
      } else {
        await courseManagement.deleteChapter(String(deleteTarget.id));
      }
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    } catch (error) {
      // Error handling is done in the hook
    }
  }, [deleteTarget, courseManagement]);

  return (
    <AdminLayout>
      <div className="sm:space-y-8 sm:p-8 bg-gradient-to-br from-slate-50 to-white">
        <CourseHeader course={courseManagement.course} />
        
        <ModulesAccordion
          modules={courseManagement.modules}
          chaptersByModule={courseManagement.chaptersByModule}
          onCreateModule={handleOpenCreateModule}
          onEditModule={handleEditModule}
          onDeleteModule={handleDeleteModule}
          onCreateChapter={handleOpenCreateChapter}
          onEditChapter={handleEditChapter}
          onDeleteChapter={handleDeleteChapter}
        />

        <ModuleForm
          isOpen={isModuleFormOpen}
          onClose={() => setIsModuleFormOpen(false)}
          editingModule={editingModule}
          formData={moduleFormData}
          onFormDataChange={setModuleFormData}
          onSubmit={handleSubmitModule}
          isSubmitting={courseManagement.loading.saving}
        />

        <ChapterForm
          isOpen={isChapterFormOpen}
          onClose={() => setIsChapterFormOpen(false)}
          editingChapter={editingChapter}
          formData={chapterFormData}
          onFormDataChange={setChapterFormData}
          onSubmit={handleSubmitChapter}
          isSubmitting={courseManagement.loading.saving}
        />

        <CourseDetailsDeleteConfirmation
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          target={deleteTarget}
          onConfirm={handleConfirmDelete}
          isSubmitting={courseManagement.loading.deleting}
        />
      </div>
    </AdminLayout>
  );
}
