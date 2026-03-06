import React from "react";
import BlogClientPage from "@/components/client/blogs/BlogClientPage";
import { API_CONFIG } from "@/config/api";
import { normalizeBlog, normalizeBlogCategory } from "@/lib/api/normalizers";
import type { BlogPost, BlogCategory } from "@/types";

// Revalidate every 60 seconds (ISR) instead of force-dynamic for better performance
export const revalidate = 60;

async function fetchWithTimeout(url: string, options: RequestInit = {}) {
  try {
    const res = await fetch(url, {
      ...options,
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error(`Fetch failed for ${url}:`, error);
    return null;
  }
}

export default async function BlogPage() {
  const [blogsJson, categoriesJson] = await Promise.all([
    fetchWithTimeout(API_CONFIG.USER_FUNCTIONS.blogs.getAll),
    fetchWithTimeout(API_CONFIG.USER_FUNCTIONS.blogs.categories.getAll),
  ]);

  const rawBlogs: Record<string, any>[] = (
    Array.isArray(blogsJson)
      ? blogsJson
      : blogsJson?.data || blogsJson?.blogs || []
  ).slice(0, 12);

  const initialBlogs: BlogPost[] = rawBlogs
    .map(normalizeBlog)
    .filter((b) => b.id);

  const rawCategories: Record<string, any>[] = Array.isArray(categoriesJson)
    ? categoriesJson
    : categoriesJson?.data || categoriesJson?.categories || [];

  const initialCategories: BlogCategory[] = rawCategories.map(normalizeBlogCategory);

  return (
    <div className="min-h-screen bg-slate-50">
      <BlogClientPage
        initialBlogs={initialBlogs}
        initialCategories={initialCategories}
      />
    </div>
  );
}
