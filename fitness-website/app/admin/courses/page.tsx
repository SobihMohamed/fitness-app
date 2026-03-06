"use client";

import React, { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { AdminLayout } from "@/components/admin/admin-layout";
import { PageHeader } from "@/components/admin/shared/page-header";
import { useCourseManagement } from "@/hooks/admin/use-course-management";
import { courseApi } from "@/lib/api/courses";
import type { Course, CourseFormData, DeleteTarget } from "@/types";
import { useAdminApi } from "@/hooks/admin/use-admin-api";
import { Plus, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

// Lazy load heavy components for better performance
const StatsCards = dynamic(
  () => import("@/components/admin/courses/stats-cards").then((mod) => mod.StatsCards),
  {
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-lg" />
        ))}
      </div>
    ),
  }
);
const SearchAndFilter = dynamic(
  () => import("@/components/admin/courses/search-and-filter").then((mod) => mod.SearchAndFilter),
  { loading: () => <div className="h-16 bg-slate-100 animate-pulse rounded-lg mb-6" /> }
);
const CourseTable = dynamic(
  () => import("@/components/admin/courses/course-table").then((mod) => mod.CourseTable),
  { loading: () => <div className="h-96 bg-slate-100 animate-pulse rounded-lg" /> }
);
const CourseForm = dynamic(
  () => import("@/components/admin/courses/course-form").then((mod) => mod.CourseForm),
  { loading: () => <div className="h-80 bg-slate-100 animate-pulse rounded-lg" /> }
);
const DeleteConfirmation = dynamic(
  () => import("@/components/admin/courses/delete-confirmation").then((mod) => mod.DeleteConfirmation),
  { loading: () => <div className="h-48 bg-slate-100 animate-pulse rounded-lg" /> }
);

const INITIAL_COURSE_FORM_DATA: CourseFormData = {
  title: "",
  price: "",
  description: "",
  image_url: "",
};

export default function CoursesManagement() {
  const courseManagement = useCourseManagement();
  const { showSuccessToast, showErrorToast, showInfoToast } = useAdminApi();

  // Local UI state for form and delete dialog
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<CourseFormData>(INITIAL_COURSE_FORM_DATA);

  // Stable, guarded handlers
  const onSearchChange = useCallback((term: string) => courseManagement.setSearchTerm(term), [courseManagement]);
  const onPageChange = useCallback((page: number) => {
    if (courseManagement.currentPage !== page) courseManagement.setCurrentPage(page);
  }, [courseManagement]);
  const onClearFilters = useCallback(() => courseManagement.setFilters({ searchTerm: "" }), [courseManagement]);

  // Handlers
  const handleOpenCreate = useCallback(() => {
    setEditingCourse(null);
    setFormData(INITIAL_COURSE_FORM_DATA);
    setSelectedImage(null);
    setFormErrors({});
    setIsFormOpen(true);
  }, []);

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
    const course = courseManagement.courses.find((c) => c.course_id === courseId);
    setDeleteTarget({ id: courseId, name: course?.title || "Course" });
    setShowDeleteConfirm(true);
  }, [courseManagement]);

  // Validation
  const validateForm = useCallback((data: CourseFormData) => {
    const errors: Record<string, string> = {};

    const title = String(data.title || "").trim();
    if (!title) errors.title = "Title is required";
    else if (title.length < 5) errors.title = "Title must be at least 5 characters";
    else if (title.length > 200) errors.title = "Title must be at most 200 characters";

    const description = String(data.description || "").trim();
    if (!description) errors.description = "Description is required";
    else if (description.length < 10) errors.description = "Description must be at least 10 characters";
    else if (description.length > 1000) errors.description = "Description must be at most 1000 characters";

    const priceRaw = String(data.price || "").trim();
    if (!priceRaw) {
      errors.price = "Price is required";
    } else {
      const normalized = priceRaw.replace(/,/g, "");
      const num = Number(normalized);
      if (!Number.isFinite(num)) {
        errors.price = "Price must be a valid number";
      } else if (num < 0) {
        errors.price = "Price must be 0 or greater";
      } else if (num > 1000000) {
        errors.price = "Price must be 1,000,000 or less";
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, []);

  const normalizeSaveCourseError = useCallback((err: any) => {
    const msg = String(err?.response?.data?.message || err?.message || "Failed to save course");
    if (/title/i.test(msg) && (/max|too\s*long|length/i.test(msg) || /200/.test(msg))) return "Course title must be at most 200 characters";
    if (/description/i.test(msg) && (/max|too\s*long|length/i.test(msg) || /1000/.test(msg))) return "Course description must be at most 1000 characters";
    if (/price/i.test(msg) && (/invalid|number|numeric|max|min/i.test(msg) || /1,?000,?000/.test(msg))) return "Course price must be valid between 0 and 1,000,000";
    return msg;
  }, []);

  // Submit
  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload = { ...formData };
    payload.title = String(payload.title || "").trim();
    payload.description = String(payload.description || "").trim();
    payload.price = String(payload.price || "").trim();
    if (selectedImage) payload.image_url = selectedImage;
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
      setFormData(INITIAL_COURSE_FORM_DATA);
      setSelectedImage(null);
    } catch (err: any) {
      showErrorToast(normalizeSaveCourseError(err));
    } finally {
      setIsSubmitting(false);
    }
  }, [editingCourse, formData, selectedImage, validateForm, courseManagement, showSuccessToast, showErrorToast, normalizeSaveCourseError]);

  const handleImageChange = useCallback((file: File | null) => {
    setSelectedImage(file);
    setFormData((prev) => ({ ...prev, image_url: file ?? "" }));
  }, []);

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
      const status = err?.status || err?.response?.status;
      const msg = String(err?.data?.message || err?.response?.data?.message || err?.message || "");
      const isBlockedDelete = status === 409 || status === 400 || status === 422 || status === 500 ||
        /enroll|enrolled|subscribe|subscribed|students?|applications?|approved|pending/i.test(msg) ||
        /foreign\s*key|constraint|cannot\s*delete|can't\s*delete|in\s*use|dependent|related/i.test(msg);

      if (isBlockedDelete) {
        showInfoToast("Cannot delete course: Users are currently enrolled.");
      } else {
        showErrorToast(msg || "Failed to delete course");
      }
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget, courseManagement, showSuccessToast, showErrorToast, showInfoToast]);

  return (
    <AdminLayout>
      <div className="space-y-10 p-6 lg:p-8 bg-slate-50 min-h-screen">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <PageHeader
            title="Courses Management"
            description="Manage your fitness courses, pricing, and content with ease"
          />
          <Button onClick={handleOpenCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-md hover:shadow-lg transition-all w-full md:w-auto mt-4 md:mt-0">
            <Plus className="h-4 w-4" /> Add Course
          </Button>
        </div>

        {/* Setting the `courses` to `any` because `StatsCards` internally expects `any` due to differing generic Course types across the repo currently. */}
        <StatsCards courses={courseManagement.courses as any} />


        <SearchAndFilter
          searchTerm={courseManagement.searchTerm}
          onSearchChange={onSearchChange}
          filteredCoursesCount={courseManagement.filteredCourses.length}
          onClearFilters={onClearFilters}
          loading={courseManagement.loading.initial || courseManagement.loading.courses}
        />

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

        <DeleteConfirmation
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          target={deleteTarget}
          onConfirm={confirmDelete}
          isSubmitting={isSubmitting}
        />
      </div>
    </AdminLayout>
  );
}
