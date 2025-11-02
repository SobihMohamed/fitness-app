"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { cachedBlogsApi } from "@/lib/api/cached-blogs";
import { clientBlogApi } from "@/lib/api/client-blogs";
import type { BlogPost, BlogCategory, UseBlogDetailsReturn } from "@/types";

export function useBlogDetails(id: string, autoWatch = false): UseBlogDetailsReturn {
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showVideoModal, setShowVideoModal] = useState<boolean>(false);
  const [watchRequested, setWatchRequested] = useState<boolean>(false);

  const fetchCategories = useCallback(async () => {
    try {
      const cats = await clientBlogApi.fetchCategories();
      setCategories(cats);
    } catch (e) {
      // categories are optional for details page; keep silent failure with empty fallback
      setCategories([]);
    }
  }, []);

  const fetchBlog = useCallback(async (blogId: string) => {
    setLoading(true);
    setError(null);
    try {
      const b = await cachedBlogsApi.fetchBlogById(blogId);
      if (!b) {
        setError("Blog not found");
        setBlog(null);
      } else {
        // Enrich blog with category name and safe title fallback
        const catMap = new Map(categories.map((c) => [c.id, c.name]));
        const withCategory = {
          ...b,
          categoryName: b.categoryName || (b.categoryId ? catMap.get(b.categoryId) : undefined),
        };
        let safeTitle = (withCategory.title || "").trim();
        if (!safeTitle || safeTitle === "Untitled") {
          const derived = (withCategory.excerpt || withCategory.content)
            .split(/\.|\n/)[0]
            ?.trim()
            ?.slice(0, 60);
          safeTitle = derived && derived.length > 3
            ? derived
            : (withCategory.id ? `Blog #${withCategory.id}` : "Blog");
        }
        setBlog({ ...withCategory, title: safeTitle });
      }
    } catch (e: any) {
      setError("Failed to load blog post. Please try again later.");
      setBlog(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRelatedBlogs = useCallback(async (categoryKey?: string) => {
    try {
      if (!categoryKey) {
        setRelatedBlogs([]);
        return;
      }
      const list = await clientBlogApi.fetchBlogsByCategory(categoryKey);
      // exclude current blog id
      const filtered = list.filter((p) => p.id !== id).slice(0, 6);
      setRelatedBlogs(filtered);
    } catch {
      setRelatedBlogs([]);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    // Load categories first, then blog to allow enrichment
    (async () => {
      await fetchCategories();
      await fetchBlog(id);
    })();
  }, [id, fetchCategories, fetchBlog]);

  // When blog changes, load related by its category
  useEffect(() => {
    if (blog?.categoryId) {
      fetchRelatedBlogs(blog.categoryId);
    } else if (blog?.categoryName && categories.length > 0) {
      // Map category name to id to fetch related
      const match = categories.find((c) => c.name === blog.categoryName);
      if (match?.id) fetchRelatedBlogs(match.id);
      else setRelatedBlogs([]);
    } else {
      setRelatedBlogs([]);
    }
  }, [blog?.categoryId, blog?.categoryName, categories, fetchRelatedBlogs]);

  // Auto-open video modal if requested via query param
  useEffect(() => {
    if (autoWatch && blog?.videoUrl) {
      setShowVideoModal(true);
      setWatchRequested(true);
    }
  }, [autoWatch, blog?.videoUrl]);

  const getCategoryName = useCallback(
    (categoryId?: string) => {
      if (!categoryId) return blog?.categoryName || "General";
      const c = categories.find((x) => x.id === categoryId);
      return c?.name || blog?.categoryName || "General";
    },
    [categories, blog?.categoryName]
  );

  const getImageUrl = useCallback((imagePath?: string) => {
    return clientBlogApi.getImageUrl(imagePath);
  }, []);

  const formatDate = useCallback((dateString?: string) => {
    if (!dateString) return "Recently";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Recently";
      }
      return date.toLocaleDateString();
    } catch {
      return "Recently";
    }
  }, []);

  // Returns a URL string suitable for iframe src
  const renderVideo = useCallback((url?: string, autoplay: boolean = false): string => {
    if (!url) return "";
    const u = String(url);
    const auto = autoplay ? 1 : 0;

    // YouTube
    const ytMatch = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/i);
    if (ytMatch && ytMatch[1]) {
      const id = ytMatch[1];
      return `https://www.youtube.com/embed/${id}?rel=0&autoplay=${auto}`;
    }

    // Vimeo
    const vimeoMatch = u.match(/vimeo\.com\/(\d+)/i);
    if (vimeoMatch && vimeoMatch[1]) {
      const id = vimeoMatch[1];
      return `https://player.vimeo.com/video/${id}?autoplay=${auto}`;
    }

    // Direct video - use native video source via data URL in an iframe not ideal; return original
    return u;
  }, []);

  const value: UseBlogDetailsReturn = useMemo(() => ({
    blog,
    relatedBlogs,
    loading,
    error,
    categories,
    showVideoModal,
    watchRequested,
    fetchBlog: async (bid: string) => { await fetchBlog(bid); },
    fetchCategories: async () => { await fetchCategories(); },
    fetchRelatedBlogs: async (categoryKey?: string) => { await fetchRelatedBlogs(categoryKey); },
    setShowVideoModal,
    setWatchRequested,
    getCategoryName,
    getImageUrl,
    formatDate,
    renderVideo,
  }), [
    blog,
    relatedBlogs,
    loading,
    error,
    categories,
    showVideoModal,
    watchRequested,
    fetchBlog,
    fetchCategories,
    fetchRelatedBlogs,
    getCategoryName,
    getImageUrl,
    formatDate,
    renderVideo,
  ]);

  return value;
}
