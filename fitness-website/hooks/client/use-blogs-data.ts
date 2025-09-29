"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { clientBlogApi } from "@/lib/api/client-blogs";
import type { BlogPost, BlogCategory } from "@/types";

interface UseBlogsDataReturn {
  blogs: BlogPost[];
  categories: BlogCategory[];
  loading: boolean;
  error: string | null;
  selectedCategory: string;
  searchTerm: string;
  sortBy: string;
  filteredBlogs: BlogPost[];
  featuredPost: BlogPost | undefined;
  categoryStats: Array<{ id: string; name: string; count: number; color: string }>;
  actions: {
    setSearchTerm: (term: string) => void;
    setSortBy: (sort: string) => void;
    handleCategorySelect: (categoryId: string) => void;
    refresh: () => Promise<void>;
  };
}

export function useBlogsData(initialData?: {
  blogs?: BlogPost[];
  categories?: BlogCategory[];
}): UseBlogsDataReturn {
  const [blogs, setBlogs] = useState<BlogPost[]>(initialData?.blogs || []);
  const [categories, setCategories] = useState<BlogCategory[]>(
    initialData?.categories || []
  );
  const [loading, setLoading] = useState<boolean>(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  // Align default with UI which uses "latest" | "popular"
  const [sortBy, setSortBy] = useState<string>("latest");

  const fetchBlogs = useCallback(async () => {
    if (initialData) return; // Skip if we have initial data

    setLoading(true);
    setError(null);

    try {
      const [blogsArr, catsArr] = await Promise.all([
        clientBlogApi.fetchBlogs(),
        clientBlogApi.fetchCategories(),
      ]);

      // Enrich blog posts with categoryName when possible
      const catMap = new Map(catsArr.map(c => [c.id, c.name]));
      const enriched = blogsArr.map(b => ({
        ...b,
        categoryName: b.categoryName || (b.categoryId ? catMap.get(b.categoryId) : undefined)
      }));

      setBlogs(enriched);
      setCategories(catsArr);
    } catch (err) {
      console.error("Error fetching blog data:", err);
      setError("Failed to load blog posts. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [initialData]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const filteredBlogs = useMemo(() => {
    let result = [...blogs];

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (blog) =>
          blog.title.toLowerCase().includes(searchLower) ||
          blog.excerpt?.toLowerCase().includes(searchLower) ||
          blog.content?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by category (selectedCategory holds category NAME from UI)
    if (selectedCategory) {
      // Try to find the category id by name
      const selected = categories.find(c => c.name === selectedCategory);
      const selectedId = selected?.id;
      result = result.filter(blog => {
        // Match either by categoryId (id) or by categoryName (name)
        const byId = selectedId ? blog.categoryId === selectedId : false;
        const byName = blog.categoryName === selectedCategory;
        return byId || byName;
      });
    }

    // Sort - map UI values to internal logic
    switch (sortBy) {
      case "latest": // newest first
      case "newest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "popular":
        // If popularity metric not available, keep latest as sensible default
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "title-asc":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title-desc":
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        break;
    }

    return result;
  }, [blogs, categories, searchTerm, selectedCategory, sortBy]);

  const featuredPost = useMemo(() => {
    return blogs.find(blog => blog.featuredImage);
  }, [blogs]);

  const categoryStats = useMemo(() => {
    return categories.map(category => ({
      id: category.id,
      name: category.name,
      count: blogs.filter(blog => blog.categoryId === category.id).length,
      color: category.color || '#6b7280' // Default gray color
    }));
  }, [categories, blogs]);

  // UI passes category NAME; toggle by name
  const handleCategorySelect = useCallback((categoryName: string) => {
    setSelectedCategory(prev => prev === categoryName ? '' : categoryName);
  }, []);

  const refresh = useCallback(async () => {
    await fetchBlogs();
  }, [fetchBlogs]);

  return {
    blogs,
    categories,
    loading,
    error,
    selectedCategory,
    searchTerm,
    sortBy,
    filteredBlogs,
    featuredPost,
    categoryStats,
    actions: {
      setSearchTerm,
      setSortBy,
      handleCategorySelect,
      refresh,
    },
  };
}
