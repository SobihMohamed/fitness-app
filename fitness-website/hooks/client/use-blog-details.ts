"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useBlogDetail,
  useBlogCategories,
  useBlogsByCategory,
} from "@/hooks/queries";
import { API_CONFIG } from "@/config/api";
import type { BlogPost, BlogCategory, UseBlogDetailsReturn } from "@/types";

/** Simple image URL builder (mirrors the deleted clientBlogApi.getImageUrl) */
function getBlogImageUrl(imagePath?: string): string | null {
  if (!imagePath) return null;
  let p = String(imagePath)
    .replace(/\\/g, "/")
    .replace(/^\/?public\//i, "/");
  if (/^https?:\/\//i.test(p)) return p;
  const path = p.startsWith("/") ? p : `/${p}`;
  const base = API_CONFIG.BASE_URL.replace(/\/$/, "");
  return `${base}${path}`;
}

export function useBlogDetails(
  id: string,
  autoWatch = false,
): UseBlogDetailsReturn {
  // React Query handles data fetching & caching
  const {
    data: rawBlog,
    isLoading: blogLoading,
    error: blogError,
    refetch: refetchBlog,
  } = useBlogDetail(id);
  const { data: categories = [], refetch: refetchCats } = useBlogCategories();

  // Determine the category id for fetching related blogs
  const relatedCategoryId = useMemo(() => {
    if (rawBlog?.categoryId) return rawBlog.categoryId;
    if (rawBlog?.categoryName && categories.length > 0) {
      const match = categories.find((c) => c.name === rawBlog.categoryName);
      return match?.id || "";
    }
    return "";
  }, [rawBlog, categories]);

  const { data: allRelated = [] } = useBlogsByCategory(relatedCategoryId);

  const relatedBlogs = useMemo(
    () => allRelated.filter((p) => p.id !== id).slice(0, 6),
    [allRelated, id],
  );

  // Enrich blog with category name + safe title
  const blog: BlogPost | null = useMemo(() => {
    if (!rawBlog) return null;
    const catMap = new Map(categories.map((c) => [c.id, c.name]));
    const enriched = {
      ...rawBlog,
      categoryName:
        rawBlog.categoryName ||
        (rawBlog.categoryId ? catMap.get(rawBlog.categoryId) : undefined),
    };
    let safeTitle = (enriched.title || "").trim();
    if (!safeTitle || safeTitle === "Untitled") {
      const derived = (enriched.excerpt || enriched.content)
        .split(/\.|\n/)[0]
        ?.trim()
        ?.slice(0, 60);
      safeTitle =
        derived && derived.length > 3
          ? derived
          : enriched.id
            ? `Blog #${enriched.id}`
            : "Blog";
    }
    return { ...enriched, title: safeTitle };
  }, [rawBlog, categories]);

  const loading = blogLoading;
  const error = blogError
    ? "Failed to load blog post. Please try again later."
    : rawBlog === null && !blogLoading
      ? "Blog not found"
      : null;

  const [showVideoModal, setShowVideoModal] = useState<boolean>(false);
  const [watchRequested, setWatchRequested] = useState<boolean>(false);

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
    [categories, blog?.categoryName],
  );

  const getImageUrl = useCallback((imagePath?: string) => {
    return getBlogImageUrl(imagePath);
  }, []);

  const formatDate = useCallback((dateString?: string) => {
    if (!dateString) return "Recently";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Recently";
      return date.toLocaleDateString();
    } catch {
      return "Recently";
    }
  }, []);

  // Returns a URL string suitable for iframe src
  const renderVideo = useCallback(
    (url?: string, autoplay: boolean = false): string => {
      if (!url) return "";
      const u = String(url);
      const auto = autoplay ? 1 : 0;

      // YouTube
      const ytMatch = u.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/i,
      );
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

      return "";
    },
    [],
  );

  return {
    blog,
    relatedBlogs,
    loading,
    error,
    categories,
    showVideoModal,
    watchRequested,
    fetchBlog: async () => {
      await refetchBlog();
    },
    fetchCategories: async () => {
      await refetchCats();
    },
    fetchRelatedBlogs: async () => {},
    setShowVideoModal,
    setWatchRequested,
    getCategoryName,
    getImageUrl,
    formatDate,
    renderVideo,
  };
}
