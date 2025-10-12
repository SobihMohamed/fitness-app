"use client";

import React, { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { AdminLayout } from "@/components/admin/admin-layout";
import { useCourseManagement } from "@/hooks/admin/use-course-management";
import { courseApi } from "@/lib/api/courses";
import type { Course, CourseFormData, DeleteTarget } from "@/types";
import { useAdminApi } from "@/hooks/admin/use-admin-api";
import { Plus, BookOpen, Loader2 } from "lucide-react";

// Lazy load heavy components for better performance
const StatsCards = dynamic(() => import("@/components/admin/courses/stats-cards").then(mod => ({ default: mod.StatsCards })), { 
  loading: () => <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-lg" />)}</div>
});
const SearchAndFilter = dynamic(() => import("@/components/admin/courses/search-and-filter").then(mod => ({ default: mod.SearchAndFilter })), { 
  loading: () => <div className="h-16 bg-gray-100 animate-pulse rounded-lg mb-6" />
});
const CourseTable = dynamic(() => import("@/components/admin/courses/course-table").then(mod => ({ default: mod.CourseTable })), { 
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />
});
const CourseForm = dynamic(() => import("@/components/admin/courses/course-form").then(mod => ({ default: mod.CourseForm })), { 
  loading: () => <div className="h-80 bg-gray-100 animate-pulse rounded-lg" />
});
const DeleteConfirmation = dynamic(() => import("@/components/admin/courses/delete-confirmation").then(mod => ({ default: mod.DeleteConfirmation })), { 
  loading: () => <div className="h-48 bg-gray-100 animate-pulse rounded-lg" />
});

export default function CoursesManagement() {
  const courseManagement = useCourseManagement();
  const { showSuccessToast, showErrorToast } = useAdminApi();

  // Local UI state for form and delete dialog
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const initialFormData: CourseFormData = useMemo(() => ({
    title: "",
    price: "",
    description: "",
    image_url: "",
  }), []);

  const [formData, setFormData] = useState<CourseFormData>(initialFormData);

  // Stable, guarded handlers
  const onSearchChange = useCallback((term: string) => {
    courseManagement.setSearchTerm(term);
  }, [courseManagement]);

  const onPageChange = useCallback((page: number) => {
    if (courseManagement.currentPage !== page) {
      courseManagement.setCurrentPage(page);
    }
  }, [courseManagement]);

  const onClearFilters = useCallback(() => {
    courseManagement.setFilters({ searchTerm: "" });
  }, [courseManagement]);

  // Handlers
  const handleOpenCreate = useCallback(() => {
    setEditingCourse(null);
    setFormData(initialFormData);
    setSelectedImage(null);
    setFormErrors({});
    setIsFormOpen(true);
  }, [initialFormData]);

  const handleEdit = useCallback((course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title || "",
      price: course.price || "",
      description: course.description || "",
      image_url: course.image_url || "",
    });
    setSelectedImage(null);
    setFormErrors({});
    setIsFormOpen(true);
  }, []);

  const handleDeleteRequest = useCallback((courseId: string) => {
    const course = courseManagement.courses.find(c => c.course_id === courseId);
    setDeleteTarget({ id: courseId, name: course?.title || "Course" });
    setShowDeleteConfirm(true);
  }, [courseManagement]);

  // Validation
  const validateForm = useCallback((data: CourseFormData) => {
    const errors: Record<string, string> = {};
    if (!data.title.trim()) errors.title = "Title is required";
    if (!data.price.trim()) errors.price = "Price is required";
    if (!data.description.trim()) errors.description = "Description is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, []);

  // Submit
  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload = { ...formData };
    if (selectedImage) {
      payload.image_url = selectedImage;
    }
    if (!validateForm(payload)) return;

    try {
      setIsSubmitting(true);
      if (editingCourse) {
        await courseApi.updateCourse(String(editingCourse.course_id), payload);
        showSuccessToast("Course updated successfully");
      } else {
        await courseApi.addCourse(payload);
        showSuccessToast("Course created successfully");
      }
      await courseManagement.fetchCourses();
      setIsFormOpen(false);
      setEditingCourse(null);
      setFormData(initialFormData);
      setSelectedImage(null);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Failed to save course";
      showErrorToast(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [editingCourse, formData, selectedImage, validateForm, courseManagement, initialFormData, showSuccessToast, showErrorToast]);

  // Image change from CourseForm
  const handleImageChange = useCallback((file: File | null) => {
    setSelectedImage(file);
    setFormData((prev) => ({ ...prev, image_url: file ?? "" }));
  }, []);

  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      setIsSubmitting(true);
      await courseApi.deleteCourse(String(deleteTarget.id));
      showSuccessToast("Course deleted successfully");
      await courseManagement.fetchCourses();
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Failed to delete course";
      showErrorToast(message);
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget, courseManagement, showSuccessToast, showErrorToast]);

  return (
    <AdminLayout>
      <div className="space-y-10 p-6 md:p-10 bg-gradient-to-br from-slate-50 to-white min-h-screen">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-xl">
                <BookOpen className="h-8 w-8 text-indigo-600" />
              </div>
              Courses Management
            </h1>
            <p className="text-slate-600 mt-3 text-lg">
              Manage your fitness courses, pricing, and content with ease
            </p>
          </div>

        </div>

        {/* Stats */}
        <StatsCards courses={courseManagement.courses} />

        {/* Search & Filter */}
        <SearchAndFilter
          searchTerm={courseManagement.searchTerm}
          onSearchChange={onSearchChange}
          filteredCoursesCount={courseManagement.filteredCourses.length}
          onClearFilters={onClearFilters}
          loading={courseManagement.loading.initial || courseManagement.loading.courses}
        />

        {/* Course Table */}
        <CourseTable
          courses={courseManagement.sortedCourses}
          currentPage={courseManagement.currentPage}
          itemsPerPage={courseManagement.pagination.itemsPerPage}
          totalPages={courseManagement.totalPages}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
          onPageChange={onPageChange}
          onOpenCreate={handleOpenCreate}
          loading={courseManagement.loading.initial || courseManagement.loading.courses}
          searchTerm={courseManagement.searchTerm}
        />

        {/* Course Form */}
        <CourseForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          editingCourse={editingCourse}
          formData={formData}
          onFormDataChange={setFormData}
          selectedImage={selectedImage}
          onImageChange={handleImageChange}
          formErrors={formErrors}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />

        {/* Delete Confirmation */}
        <DeleteConfirmation
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          target={deleteTarget}
          onConfirm={confirmDelete}
          isSubmitting={isSubmitting}
        />

        {/* Floating action to add course */}
        <div className="fixed bottom-8 right-8">
          <button
            onClick={handleOpenCreate}
            className="px-4 py-3 rounded-full shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
            aria-label="Add Course"
          >
            + New Course
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
