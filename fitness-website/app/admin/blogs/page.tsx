"use client";

import React, { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { AdminLayout } from "@/components/admin/admin-layout";
import { PageHeader } from "@/components/admin/shared/page-header";
import { useBlogManagement } from "@/hooks/admin/use-blog-management";
import { blogApi } from "@/lib/api/blogs";
import type { Blog, BlogFormData } from "@/types";
import { useAdminApi } from "@/hooks/admin/use-admin-api";
import { BookOpen } from "lucide-react";

// Lazy load heavy components for better performance
const StatsCards = dynamic(
  () => import("@/components/admin/blog/stats-cards").then((mod) => mod.StatsCards),
  {
    loading: () => (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-lg" />
        ))}
      </div>
    ),
  }
);

const CategoryManagement = dynamic(
  () => import("@/components/admin/blog/category-management").then((mod) => mod.CategoryManagement),
  { loading: () => <div className="h-16 bg-gray-100 animate-pulse rounded-lg mb-4" /> }
);

const SearchAndFilter = dynamic(
  () => import("@/components/admin/blog/search-and-filter").then((mod) => mod.SearchAndFilter),
  { loading: () => <div className="h-16 bg-gray-100 animate-pulse rounded-lg mb-6" /> }
);

const BlogTable = dynamic(
  () => import("@/components/admin/blog/blog-table").then((mod) => mod.BlogTable),
  { loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" /> }
);

const BlogForm = dynamic(
  () => import("@/components/admin/blog/blog-form").then((mod) => mod.BlogForm),
  { loading: () => <div className="h-80 bg-gray-100 animate-pulse rounded-lg" /> }
);

const DeleteConfirmation = dynamic(
  () => import("@/components/admin/blog/delete-confirmation").then((mod) => mod.DeleteConfirmation),
  { loading: () => <div className="h-48 bg-gray-100 animate-pulse rounded-lg" /> }
);

const INITIAL_BLOG_FORM_DATA: BlogFormData = {
  title: "",
  content: "",
  status: "published",
  video_link: "",
  category_id: "",
  main_image: null,
};

export default function BlogsManagement() {
  const blogManagement = useBlogManagement();
  const { showSuccessToast, showErrorToast, showInfoToast } = useAdminApi();

  // Local UI state for form and delete dialog
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<BlogFormData>(INITIAL_BLOG_FORM_DATA);

  // Stable, guarded handlers
  const onCategoryChange = useCallback(
    (id: string) => {
      if (blogManagement.selectedCategory !== id) {
        blogManagement.setSelectedCategory(id);
        if (blogManagement.currentPage !== 1) {
          blogManagement.setCurrentPage(1);
        }
      }
    },
    [blogManagement]
  );

  const onStatusChange = useCallback(
    (status: "all" | "archived" | "published") => {
      if (blogManagement.selectedStatus !== status) {
        blogManagement.setSelectedStatus(status);
        if (blogManagement.currentPage !== 1) {
          blogManagement.setCurrentPage(1);
        }
      }
    },
    [blogManagement]
  );

  const onPageChange = useCallback(
    (page: number) => {
      if (blogManagement.currentPage !== page) {
        blogManagement.setCurrentPage(page);
      }
    },
    [blogManagement]
  );

  const onSearchChange = useCallback(
    (term: string) => {
      blogManagement.setSearchTerm(term);
    },
    [blogManagement]
  );

  const onClearFilters = useCallback(() => {
    blogManagement.setFilters({ searchTerm: "", selectedStatus: "all" });
  }, [blogManagement]);

  // Handlers
  const handleOpenCreate = useCallback(() => {
    setEditingBlog(null);
    setFormData(INITIAL_BLOG_FORM_DATA);
    setSelectedImage(null);
    setFormErrors({});
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((blog: Blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title || "",
      content: blog.content || "",
      status: blog.status,
      video_link: blog.video_link || "",
      category_id: blog.category_id ? String(blog.category_id) : "",
      main_image: blog.main_image || null,
    });
    setSelectedImage(null);
    setFormErrors({});
    setIsFormOpen(true);
  }, []);

  const handleDeleteRequest = useCallback((blogId: string) => {
    setDeleteTarget({ id: blogId, name: "Blog" });
    setShowDeleteConfirm(true);
  }, []);

  // Validation
  const validateForm = useCallback((data: BlogFormData) => {
    const errors: Record<string, string> = {};
    if (!data.title.trim()) errors.title = "Title is required";
    if (!data.content.trim()) errors.content = "Content is required";
    if (!data.category_id) errors.category_id = "Category is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, []);

  // Submit
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const payload = { ...formData };
      if (!validateForm(payload)) return;

      try {
        setIsSubmitting(true);
        if (editingBlog) {
          await blogApi.updateBlog(String(editingBlog.blog_id), payload);
          showSuccessToast("Blog updated successfully");
        } else {
          await blogApi.addBlog(payload);
          showSuccessToast("Blog created successfully");
        }
        await blogManagement.fetchBlogs();
        setIsFormOpen(false);
        setEditingBlog(null);
        setFormData(INITIAL_BLOG_FORM_DATA);
        setSelectedImage(null);
      } catch (err: any) {
        const message = err?.response?.data?.message || err?.message || "Failed to save blog";
        showErrorToast(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [editingBlog, formData, validateForm, blogManagement, showSuccessToast, showErrorToast]
  );

  const handleImageChange = useCallback((file: File | null) => {
    setSelectedImage(file);
    setFormData((prev) => ({ ...prev, main_image: file }));
  }, []);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      setIsSubmitting(true);
      await blogApi.deleteBlog(String(deleteTarget.id));
      showSuccessToast("Blog deleted successfully");
      await blogManagement.fetchBlogs();
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Failed to delete blog";
      showErrorToast(message);
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget, blogManagement, showSuccessToast, showErrorToast]);

  return (
    <AdminLayout>
      <div className="space-y-10 p-6 lg:p-8 bg-slate-50 min-h-screen">
        <PageHeader
          title="Blogs Management"
          description="Manage your fitness Blogs, content, and categories with ease"
        />

        <StatsCards blogs={blogManagement.blogs} />

        <CategoryManagement
          categories={blogManagement.categories.map((cat: any) => ({
            ...cat,
            name: cat.name ?? cat.title ?? "",
          }))}
          selectedCategory={blogManagement.selectedCategory}
          onCategoryChange={onCategoryChange}
          onRefreshCategories={blogManagement.fetchCategories}
          blogs={blogManagement.blogs.map((blog) => ({ category_id: blog.category_id }))}
        />

        <SearchAndFilter
          searchTerm={blogManagement.searchTerm}
          onSearchChange={onSearchChange}
          selectedStatus={blogManagement.selectedStatus}
          onStatusChange={onStatusChange}
          filteredBlogsCount={blogManagement.filteredBlogs.length}
          onClearFilters={onClearFilters}
          loading={blogManagement.loading}
        />

        <BlogTable
          blogs={blogManagement.sortedBlogs}
          categories={blogManagement.categories.map((cat: any) => ({
            ...cat,
            name: cat.name ?? cat.title ?? "",
          }))}
          categoryTitleById={blogManagement.categoryTitleById}
          currentPage={blogManagement.currentPage}
          itemsPerPage={blogManagement.pagination.itemsPerPage}
          totalPages={blogManagement.totalPages}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
          onPageChange={onPageChange}
          loading={blogManagement.loading.initial || blogManagement.loading.blogs}
        />

        <BlogForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          editingBlog={editingBlog}
          formData={formData}
          onFormDataChange={setFormData}
          categories={blogManagement.categories}
          selectedImage={selectedImage}
          onImageChange={handleImageChange}
          formErrors={formErrors}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />

        <DeleteConfirmation
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          target={deleteTarget ? { id: deleteTarget.id, name: deleteTarget.name, type: "blog" } : null}
          onConfirm={confirmDelete}
          isSubmitting={isSubmitting}
        />

        {!isFormOpen && (
          <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50">
            <button
              onClick={() => {
                if (blogManagement.categories.length === 0) {
                  showInfoToast("Please add a category first to create a blog");
                  return;
                }
                handleOpenCreate();
              }}
              title={blogManagement.categories.length === 0 ? "Add at least one category to create a blog" : "Add Blog"}
              aria-disabled={blogManagement.categories.length === 0}
              className={`px-4 py-3 rounded-full shadow-lg text-white font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${blogManagement.categories.length === 0
                  ? "bg-slate-300 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl active:scale-[0.98]"
                }`}
              aria-label="Add Blog"
            >
              + New Blog
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
