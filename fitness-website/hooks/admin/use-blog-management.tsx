"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { blogApi, categoryApi } from "@/lib/api/blogs";
import { useAdminApi } from "@/hooks/admin/use-admin-api";
import type { Blog, BlogCategory, BlogFilters, BlogState, BlogActions } from "@/types";

export const useBlogManagement = (): BlogState & BlogActions & {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedStatus: "all" | "archived" | "published";
  setSelectedStatus: (status: "all" | "archived" | "published") => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  sortByDate: "desc" | "asc";
  setSortByDate: (sort: "desc" | "asc") => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  currentCategoryPage: number;
  setCurrentCategoryPage: (page: number) => void;
  totalPages: number;
  categoryTitleById: Record<string, string>;
  paginatedBlogs: Blog[];
  paginatedCategories: BlogCategory[];
  totalCategoryPages: number;
  filteredBlogs: Blog[];
  sortedBlogs: Blog[];
  filteredCategories: BlogCategory[];
} => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [remoteSearchBlogs, setRemoteSearchBlogs] = useState<Blog[] | null>(null);
  const [loading, setLoading] = useState({
    blogs: false,
    categories: false,
    form: false,
    initial: true
  });

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "archived" | "published">("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortByDate, setSortByDate] = useState<"desc" | "asc">("desc");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [currentCategoryPage, setCurrentCategoryPage] = useState(1);

  const { getAuthHeaders, showSuccessToast, showErrorToast } = useAdminApi();
  // Keep stable refs for toast functions to avoid changing dependencies
  const showErrorToastRef = useRef(showErrorToast);
  const showSuccessToastRef = useRef(showSuccessToast);
  useEffect(() => {
    showErrorToastRef.current = showErrorToast;
    showSuccessToastRef.current = showSuccessToast;
  }, [showErrorToast, showSuccessToast]);

  const itemsPerPage = 5;
  const categoriesPerPage = 5;

  // Add auth headers to API functions
  useEffect(() => {
    const authHeaders = getAuthHeaders();
    blogApi.getAuthHeaders = () => authHeaders;
    categoryApi.getAuthHeaders = () => authHeaders;
  }, [getAuthHeaders]);

  // Fetch data functions
  const fetchBlogs = useCallback(async (): Promise<void> => {
    try {
      setLoading(prev => ({ ...prev, blogs: true }));
      const blogsData = await blogApi.fetchBlogs();
      setBlogs(blogsData);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err.message || 'Failed to load blogs';
      showErrorToastRef.current(errorMessage);
    } finally {
      setLoading(prev => ({ ...prev, blogs: false, initial: false }));
    }
  }, []);

  const fetchCategories = useCallback(async (): Promise<void> => {
    try {
      setLoading(prev => ({ ...prev, categories: true }));
      const categoriesData = await categoryApi.fetchCategories();
      // Transform Category[] to BlogCategory[] format
      const blogCategories: BlogCategory[] = categoriesData.map(cat => ({
        id: cat.category_id,
        name: cat.name,
        description: cat.description,
        color: '#007bff',
        blogCount: 0
      }));
      setCategories(blogCategories);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message ||
                         err.message ||
                         'Failed to load categories. Please try again later.';
      console.error('Error fetching categories:', err);
      showErrorToastRef.current(errorMessage);
    } finally {
      setLoading(prev => ({ ...prev, categories: false, initial: false }));
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    const term = searchTerm.trim();
    if (!term) {
      setRemoteSearchBlogs(null);
      return;
    }

    let cancelled = false;
    const handle = setTimeout(async () => {
      try {
        setLoading(prev => ({ ...prev, blogs: true }));
        const searchResults = await blogApi.searchBlogs(term);

        if (!cancelled) {
          setRemoteSearchBlogs(searchResults);
          setCurrentPage(1);
        }
      } catch (err: any) {
        if (!cancelled) {
          setRemoteSearchBlogs([]);
          const errorMessage = err?.response?.data?.message || err.message || 'Failed to search blogs';
          showErrorToastRef.current(errorMessage);
        }
      } finally {
        if (!cancelled) setLoading(prev => ({ ...prev, blogs: false }));
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [searchTerm]);

  // Initial data fetch
  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([fetchBlogs(), fetchCategories()]);
      } finally {
        setLoading(prev => ({ ...prev, initial: false }));
      }
    };
    // Run once on mount. fetchBlogs/fetchCategories are stable due to [] deps
    initializeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset category page when search changes
  useEffect(() => {
    setCurrentCategoryPage(1);
  }, [selectedCategory]);

  // Computed values
  const filteredBlogs = useMemo(() => {
    const term = searchTerm.trim();
    const source = term ? (remoteSearchBlogs ?? []) : blogs;
    return source.filter((b: Blog) => {
      const matchesStatus = selectedStatus === "all" || b.status === selectedStatus;
      const matchesCategory = selectedCategory === "all" || String(b.category_id || "") === selectedCategory;
      return matchesStatus && matchesCategory;
    });
  }, [blogs, remoteSearchBlogs, searchTerm, selectedStatus, selectedCategory]);

  const sortedBlogs = useMemo(() => {
    const arr = [...filteredBlogs];
    arr.sort((a, b) => {
      const da = new Date(a.created_at).getTime();
      const db = new Date(b.created_at).getTime();
      return sortByDate === "desc" ? db - da : da - db;
    });
    return arr;
  }, [filteredBlogs, sortByDate]);

  const filteredCategories = useMemo(() => {
    return categories;
  }, [categories]);

  const totalPages = useMemo(
    () => Math.ceil(sortedBlogs.length / itemsPerPage),
    [sortedBlogs.length, itemsPerPage]
  );

  const paginatedBlogs = useMemo(
    () =>
      sortedBlogs.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      ),
    [sortedBlogs, currentPage, itemsPerPage]
  );

  const totalCategoryPages = useMemo(
    () => Math.ceil(filteredCategories.length / categoriesPerPage),
    [filteredCategories.length, categoriesPerPage]
  );

  const paginatedCategories = useMemo(
    () =>
      filteredCategories.slice(
        (currentCategoryPage - 1) * categoriesPerPage,
        currentCategoryPage * categoriesPerPage
      ),
    [filteredCategories, currentCategoryPage, categoriesPerPage]
  );

  const categoryTitleById = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach((c) => {
      map[String(c.id)] = c.name;
    });
    return map;
  }, [categories]);

  // Action functions
  const setFilters = useCallback((filters: Partial<BlogFilters>) => {
    if (filters.searchTerm !== undefined) setSearchTerm(filters.searchTerm);
    if (filters.selectedStatus !== undefined) setSelectedStatus(filters.selectedStatus);
    if (filters.selectedCategory !== undefined) setSelectedCategory(filters.selectedCategory);
    if (filters.sortByDate !== undefined) setSortByDate(filters.sortByDate);
  }, []);

  return {
    // State
    blogs,
    categories,
    remoteSearchBlogs,
    loading,
    // Top-level fields for convenient access
    searchTerm,
    selectedStatus,
    selectedCategory,
    sortByDate,
    currentPage,
    currentCategoryPage,
    filters: {
      searchTerm,
      selectedStatus,
      selectedCategory,
      sortByDate
    },
    pagination: {
      currentPage,
      itemsPerPage
    },
    categoryPagination: {
      currentPage: currentCategoryPage,
      categoriesPerPage
    },

    // Computed values
    filteredBlogs,
    sortedBlogs,
    filteredCategories,
    totalPages,
    paginatedBlogs,
    totalCategoryPages,
    paginatedCategories,
    categoryTitleById,

    // Actions
    fetchBlogs,
    fetchCategories,
    setSearchTerm,
    setFilters,
    setPagination: setCurrentPage,
    setCategoryPagination: setCurrentCategoryPage,

    // Individual setters for direct access
    setSelectedStatus,
    setSelectedCategory,
    setSortByDate,
    setCurrentPage,
    setCurrentCategoryPage
  };
};
