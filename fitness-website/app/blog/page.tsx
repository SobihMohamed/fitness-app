import React from "react";
import BlogClientPage from "@/components/client/blogs/BlogClientPage";
import { API_CONFIG } from "@/config/api";
import { normalizeBlog, normalizeBlogCategory } from "@/lib/api/normalizers";
import type { BlogPost, BlogCategory } from "@/types";

export const dynamic = "force-dynamic";

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export default async function BlogPage() {
  const [blogsRes, categoriesRes] = await Promise.all([
    fetch(API_CONFIG.USER_FUNCTIONS.blogs.getAll, { cache: "no-store" }),
    fetch(API_CONFIG.USER_FUNCTIONS.blogs.categories.getAll, {
      cache: "no-store",
    }),
  ]);

  const [blogsJson, categoriesJson] = await Promise.all([
    safeJson(blogsRes),
    safeJson(categoriesRes),
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
  const initialCategories: BlogCategory[] = rawCategories.map(
    normalizeBlogCategory,
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <BlogClientPage
        initialBlogs={initialBlogs}
        initialCategories={initialCategories}
      />
    </div>
  );
}
