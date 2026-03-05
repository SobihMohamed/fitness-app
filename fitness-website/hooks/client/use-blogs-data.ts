"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useBlogs, useBlogCategories } from "@/hooks/queries";
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
  paginatedBlogs: BlogPost[];
  featuredPost: BlogPost | undefined;
  categoryStats: Array<{
    id: string;
    name: string;
    count: number;
    color: string;
  }>;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  actions: {
    setSearchTerm: (term: string) => void;
    setSortBy: (sort: string) => void;
    handleCategorySelect: (categoryId: string) => void;
    setCurrentPage: (page: number) => void;
    setPageSize: (size: number) => void;
    refresh: () => Promise<void>;
  };
}

export function useBlogsData(initialData?: {
  blogs?: BlogPost[];
  categories?: BlogCategory[];
}): UseBlogsDataReturn {
  // React Query handles fetching, caching, and background revalidation
  const {
    data: blogs = [],
    isLoading: blogsLoading,
    error: blogsError,
    refetch: refetchBlogs,
  } = useBlogs(initialData?.blogs);

  const { data: categories = [], isLoading: catsLoading } = useBlogCategories(
    initialData?.categories,
  );

  const loading = blogsLoading || catsLoading;
  const error = blogsError
    ? "Failed to load blog posts. Please try again later."
    : null;

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("latest");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(6);

  // Enrich blogs with category name (derived – no extra fetch)
  const enrichedBlogs = useMemo(() => {
    const catMap = new Map(categories.map((c) => [c.id, c.name]));
    return blogs.map((b) => ({
      ...b,
      categoryName:
        b.categoryName || (b.categoryId ? catMap.get(b.categoryId) : undefined),
    }));
  }, [blogs, categories]);

  const filteredBlogs = useMemo(() => {
    let result = [...enrichedBlogs];

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (blog) =>
          blog.title.toLowerCase().includes(q) ||
          blog.excerpt?.toLowerCase().includes(q) ||
          blog.content?.toLowerCase().includes(q),
      );
    }

    if (selectedCategory) {
      const selected = categories.find((c) => c.name === selectedCategory);
      const selectedId = selected?.id;
      result = result.filter((blog) => {
        const byId = selectedId ? blog.categoryId === selectedId : false;
        const byName = blog.categoryName === selectedCategory;
        return byId || byName;
      });
    }

    switch (sortBy) {
      case "latest":
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        break;
      case "oldest":
        result.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
        break;
      case "popular":
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        break;
      case "title-asc":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title-desc":
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
    }

    return result;
  }, [enrichedBlogs, categories, searchTerm, selectedCategory, sortBy]);

  const featuredPost = useMemo(
    () => enrichedBlogs.find((blog) => blog.featuredImage),
    [enrichedBlogs],
  );

  const categoryStats = useMemo(
    () =>
      categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        count: enrichedBlogs.filter((b) => b.categoryId === cat.id).length,
        color: cat.color || "#6b7280",
      })),
    [categories, enrichedBlogs],
  );

  const totalPages = useMemo(
    () => Math.ceil(filteredBlogs.length / pageSize) || 1,
    [filteredBlogs.length, pageSize],
  );

  const paginatedBlogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBlogs.slice(start, start + pageSize);
  }, [filteredBlogs, currentPage, pageSize]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, sortBy]);

  const handleCategorySelect = useCallback((categoryName: string) => {
    setSelectedCategory((prev) => (prev === categoryName ? "" : categoryName));
  }, []);

  const refresh = useCallback(async () => {
    await refetchBlogs();
  }, [refetchBlogs]);

  return {
    blogs: enrichedBlogs,
    categories,
    loading,
    error,
    selectedCategory,
    searchTerm,
    sortBy,
    filteredBlogs,
    paginatedBlogs,
    featuredPost,
    categoryStats,
    currentPage,
    pageSize,
    totalPages,
    actions: {
      setSearchTerm,
      setSortBy,
      handleCategorySelect,
      setCurrentPage,
      setPageSize,
      refresh,
    },
  };
}
