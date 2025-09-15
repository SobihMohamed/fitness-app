"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminLayout } from "@/components/admin/admin-layout";
import { useAdminApi } from "@/hooks/admin/use-admin-api";
import { getHttpClient } from "@/lib/http";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Save,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  Calendar,
  AlertTriangle,
  Info,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Video,
  Tag,
  FolderOpen,
  ArrowUpDown,
  X,
} from "lucide-react";
import { API_CONFIG } from "@/config/api";
import { formatDateUTC } from "@/utils/format";
 

// Types
type Category = {
  category_id: string;
  title: string;
  description?: string;
};

type Blog = {
  blog_id: string;
  title: string;
  video_link: string | null;
  main_image: string | null;
  content: string;
  created_at: string;
  status: 'draft' | 'published';
  admin_id: string;
  category_id: string | null;
};

type BlogFormData = {
  title: string;
  content: string;
  status: 'draft' | 'published';
  video_link: string;
  category_id: string;
  main_image: File | string | null;
};

// API Response Types
type ApiResponse<T> = {
  data?: T;
  message?: string;
  error?: string;
};

type BlogApiResponse = ApiResponse<Blog | Blog[]> & {
  blogs?: Blog[];
};

type CategoryApiResponse = ApiResponse<Category | Category[]> & {
  categories?: Category[];
};

export default function BlogsManagement() {
  // State
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState({
    initial: true,
    blogs: false,
    categories: false,
    form: false,
    initialLoading: true
  });
  const [catSearch, setCatSearch] = useState("");

  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([fetchBlogs(), fetchCategories()]);
      } finally {
        setLoading(prev => ({ ...prev, initialLoading: false }));
      }
    };
    initializeData();
  }, []);

  const [selectedStatus, setSelectedStatus] = useState<"all" | "draft" | "published">("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortByDate, setSortByDate] = useState<"desc" | "asc">("desc");

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [formData, setFormData] = useState<BlogFormData>({
    title: "",
    content: "",
    status: "draft" as const,
    video_link: "",
    category_id: "",
    main_image: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Categories management dialog state
  const [isCatDialogOpen, setIsCatDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{
    category_id: string;
    title: string;
    description?: string;
  } | null>(null);
  const [catForm, setCatForm] = useState({ title: "", description: "" });
  const [isCatSubmitting, setIsCatSubmitting] = useState(false);
  // Quick add category input
  const [quickCatTitle, setQuickCatTitle] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
    type?: string;
  } | null>(null);
  const [showCatDeleteConfirm, setShowCatDeleteConfirm] = useState(false);
  const [catDeleteTarget, setCatDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  // Categories pagination
  const categoriesPerPage = 5;
  const [currentCategoryPage, setCurrentCategoryPage] = useState(1);

  const { getAuthHeaders, parseResponse, showSuccessToast, showErrorToast } =
    useAdminApi();
  const http = getHttpClient();

  const fetchCategories = async () => {
    try {
      setLoading(prev => ({ ...prev, categories: true }));
      
      const response = await http.get<CategoryApiResponse>(
        API_CONFIG.ADMIN_FUNCTIONS.blogs.categories.getAll,
        { headers: getAuthHeaders() }
      );

      const data = response.data;
      const categoriesData = Array.isArray(data?.data) 
        ? data.data 
        : Array.isArray(data?.categories) 
          ? data.categories 
          : Array.isArray(data) ? data : [];

      const mapped = categoriesData
        .filter((c): c is Record<string, unknown> => !!c)
        .map((c) => {
          const category: Category = {
            category_id: String(c.category_id ?? c.category_Id ?? c.id ?? c.ID ?? ''),
            title: String(c.title ?? c.name ?? '')
          };
          if (c.description) {
            category.description = String(c.description);
          }
          return category;
        })
        .filter((c) => !!c.category_id);

      setCategories(mapped);
      return mapped;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err.message || 'Failed to load categories';
      showErrorToast(errorMessage);
      return [];
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  };

  // Quick add category handler (adds with title only)
  const handleQuickAddCategory = async () => {
    const title = quickCatTitle.trim();
    if (!title) {
      showErrorToast("Please enter a category name");
      return;
    }
    try {
      setIsCatSubmitting(true);
      await http.post(
        API_CONFIG.ADMIN_FUNCTIONS.blogs.categories.add,
        { title, description: "" },
        { headers: getAuthHeaders() }
      );
      showSuccessToast("Category added successfully");
      setQuickCatTitle("");
      await fetchCategories();
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err.message || "Network error while adding category";
      showErrorToast(errorMessage);
    } finally {
      setIsCatSubmitting(false);
    }
  };

  // Categories CRUD helpers
  const openAddCategory = () => {
    setEditingCategory(null);
    setCatForm({ title: "", description: "" });
    setIsCatDialogOpen(true);
  };

  const openEditCategory = (cat: {
    category_id: string;
    title: string;
    description?: string;
  }) => {
    setEditingCategory(cat);
    setCatForm({ title: cat.title || "", description: cat.description || "" });
    setIsCatDialogOpen(true);
  };

  const saveCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!catForm.title.trim()) {
      showErrorToast("Category title is required");
      return;
    }
    try {
      setIsCatSubmitting(true);
      const endpoint = editingCategory
        ? API_CONFIG.ADMIN_FUNCTIONS.blogs.categories.update(
            String(editingCategory.category_id)
          )
        : API_CONFIG.ADMIN_FUNCTIONS.blogs.categories.add;

      await http.post(
        endpoint,
        { title: catForm.title, description: catForm.description },
        { headers: { Authorization: getAuthHeaders().Authorization } }
      );
      showSuccessToast(
        editingCategory
          ? "Category updated successfully"
          : "Category added successfully"
      );
      setIsCatDialogOpen(false);
      setEditingCategory(null);
      await fetchCategories();
    } catch (err: any) {
      showErrorToast(err.message || "Network error while saving category");
    } finally {
      setIsCatSubmitting(false);
    }
  };

  const confirmDeleteCategory = (cat: {
    category_id: string;
    title: string;
  }) => {
    setCatDeleteTarget({ id: cat.category_id, name: cat.title });
    setShowCatDeleteConfirm(true);
  };

  const deleteCategory = async () => {
    if (!catDeleteTarget) return;
    try {
      setIsCatSubmitting(true);
      await http.delete(
        API_CONFIG.ADMIN_FUNCTIONS.blogs.categories.delete(
          String(catDeleteTarget.id)
        ),
        { headers: getAuthHeaders() }
      );
      showSuccessToast("Category deleted successfully");
      await fetchCategories();
    } catch (err: any) {
      showErrorToast(err.message || "Network error while deleting category");
    } finally {
      setIsCatSubmitting(false);
      setShowCatDeleteConfirm(false);
      setCatDeleteTarget(null);
    }
  };

  const fetchBlogs = async () => {
    try {
      setLoading(prev => ({ ...prev, blogs: true }));
      
      const response = await http.get<BlogApiResponse>(
        API_CONFIG.ADMIN_FUNCTIONS.blogs.getAll,
        { headers: getAuthHeaders() }
      );

      const data = response.data;
      const blogsData = Array.isArray(data?.data) 
        ? data.data 
        : Array.isArray(data?.blogs) 
          ? data.blogs 
          : Array.isArray(data) ? data : [];

      const formattedData = blogsData
        .filter((blog): blog is Record<string, any> => !!blog)
        .map((blog): Blog => {
          const status = blog.status;
          let blogStatus: 'draft' | 'published' = 'draft';
          
          if (status === 1 || status === '1' || String(status).toLowerCase() === 'published') {
            blogStatus = 'published';
          }
          
          return {
            blog_id: String(blog.blog_id || blog.id || ''),
            title: String(blog.title || 'Untitled Blog'),
            video_link: blog.video_link ? String(blog.video_link) : null,
            main_image: (blog.main_image || blog.image_url || blog.image) ? String(blog.main_image || blog.image_url || blog.image) : null,
            content: String(blog.content || ''),
            created_at: blog.created_at ? new Date(blog.created_at).toISOString() : new Date().toISOString(),
            status: blogStatus,
            admin_id: String(blog.admin_id || ''),
            category_id: blog.category_id || blog.category_Id ? String(blog.category_id || blog.category_Id) : null,
          };
        });

      setBlogs(formattedData);
      return formattedData;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err.message || 'Failed to load blogs';
      showErrorToast(errorMessage);
      return [];
    } finally {
      setLoading(prev => ({ ...prev, blogs: false, initial: false }));
    }
  };

  const saveBlog = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      showErrorToast("Blog title and content are required");
      return;
    }
    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("content", formData.content);
    // Backend expects numeric status (1 = published, 0 = draft)
    const statusValue = formData.status === "published" ? "1" : "0";
    formDataToSend.append("status", statusValue);
    if (formData.video_link) formDataToSend.append("video_link", formData.video_link);
    if (formData.category_id) formDataToSend.append("category_id", String(formData.category_id));
    if (selectedImage) formDataToSend.append("main_image", selectedImage);

    try {
      setIsSubmitting(true);
      const endpoint = editingBlog
        ? API_CONFIG.ADMIN_FUNCTIONS.blogs.update(editingBlog.blog_id)
        : API_CONFIG.ADMIN_FUNCTIONS.blogs.add;

      await http.post(endpoint, formDataToSend, {
        headers: { Authorization: getAuthHeaders().Authorization },
      });

      if (editingBlog) {
        showSuccessToast(`Blog updated successfully!`);
      } else {
        showSuccessToast(`Blog added successfully!`);
      }

      await fetchBlogs();
      setFormData({
        title: "",
        content: "",
        status: "draft",
        video_link: "",
        category_id: "",
        main_image: null,
      });
      setSelectedImage(null);
      setEditingBlog(null);
      setIsAddDialogOpen(false);
    } catch (err: any) {
      showErrorToast(err.message || "Network error while saving blog");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title || "",
      content: blog.content || "",
      status: blog.status || "draft",
      video_link: blog.video_link || "",
      category_id: blog.category_id ? String(blog.category_id) : "",
      main_image: blog.main_image || null,
    });
    setSelectedImage(null);
    setIsAddDialogOpen(true);
  };

  const confirmDeleteBlog = (id: string) => {
    const blog = blogs.find((b) => b.blog_id === id);
    const blogTitle = blog?.title || "this blog";
    setDeleteTarget({ id, name: blogTitle, type: "blog" });
    setShowDeleteConfirm(true);
  };

  const deleteBlog = async () => {
    if (!deleteTarget) return;
    try {
      const handleDeleteBlog = async (id: string) => {
        try {
          await http.delete(
            API_CONFIG.ADMIN_FUNCTIONS.blogs.delete(id),
            { headers: getAuthHeaders() }
          );
          showSuccessToast("Blog deleted successfully");
          await fetchBlogs();
        } catch (err: any) {
          const errorMessage = err?.response?.data?.message || err.message || "Error deleting blog";
          showErrorToast(errorMessage);
        }
      };
      handleDeleteBlog(deleteTarget.id);
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showErrorToast("Image file size must be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        showErrorToast("Please select a valid image file");
        return;
      }
      setSelectedImage(file);
    }
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteBlog();
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteTarget(null);
  };

  const formatDate = (dateString: string) => {
    return formatDateUTC(dateString);
  };

  const filteredBlogs = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return blogs.filter(
      (b: Blog) =>
        (b.title?.toLowerCase().includes(term) ||
          b.content?.toLowerCase().includes(term)) &&
        (selectedStatus === "all" || b.status === selectedStatus) &&
        (selectedCategory === "all" ||
          String(b.category_id || "") === selectedCategory)
    );
  }, [blogs, searchTerm, selectedStatus, selectedCategory]);

  // sort by created date
  const sortedBlogs = useMemo(() => {
    const arr = [...filteredBlogs];
    arr.sort((a, b) => {
      const da = new Date(a.created_at).getTime();
      const db = new Date(b.created_at).getTime();
      return sortByDate === "desc" ? db - da : da - db;
    });
    return arr;
  }, [filteredBlogs, sortByDate]);

  const categoryTitleById = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach((c) => {
      map[String(c.category_id)] = c.title;
    });
    return map;
  }, [categories]);

  // Responsive primary categories count for the pills bar
  const [maxPrimary, setMaxPrimary] = useState(8);
  useEffect(() => {
    const compute = () => {
      const w = typeof window !== "undefined" ? window.innerWidth : 1280;
      if (w < 640) return 3; // sm-
      if (w < 1024) return 5; // md/lg
      return 8; // xl+
    };
    const update = () => setMaxPrimary(compute());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const primaryCategories = useMemo(() => categories.slice(0, maxPrimary), [categories, maxPrimary]);
  const overflowCategories = useMemo(() => categories.slice(maxPrimary), [categories, maxPrimary]);

  // Selected category details (for showing description under pills)
  const selectedCategoryDetails = useMemo(() => {
    if (selectedCategory === "all") return null;
    return (
      categories.find((c) => String(c.category_id) === selectedCategory) ||
      null
    );
  }, [categories, selectedCategory]);

  // Categories filtering and pagination
  const filteredCategories = useMemo(() => {
    const term = catSearch.toLowerCase();
    return categories.filter(
      (c) =>
        c.title.toLowerCase().includes(term) ||
        (c.description || "").toLowerCase().includes(term)
    );
  }, [categories, catSearch]);

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

  useEffect(() => {
    setCurrentCategoryPage(1);
  }, [catSearch]);

  const totalPages = useMemo(
    () => Math.ceil(sortedBlogs.length / itemsPerPage),
    [sortedBlogs.length]
  );
  const paginatedBlogs = useMemo(
    () =>
      sortedBlogs.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      ),
    [sortedBlogs, currentPage, itemsPerPage]
  );

  // Loading state for initial data fetch
  const [isLoading, setIsLoading] = useState(true);

  // Update loading state when data is loaded
  useEffect(() => {
    if (blogs && categories) {
      setIsLoading(false);
    }
  }, [blogs, categories]);

  return (
    <AdminLayout>
      <div className="space-y-10 p-6 md:p-10 bg-gradient-to-br from-slate-50 to-white min-h-screen">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 border-b border-slate-200 pb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 flex items-center gap-3">
              <div className="p-3 bg-indigo-100 rounded-full shadow-sm">
                <FileText className="h-7 w-7 md:h-8 md:w-8 text-indigo-600" />
              </div>
              Blog Management
            </h1>
            <p className="text-slate-600 mt-3 text-base md:text-lg max-w-2xl leading-relaxed">
              Create and manage your blog content and categories
            </p>
          </div>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all duration-200 px-5 py-5 md:px-6 md:py-6 text-base rounded-xl font-medium"
          >
            <Plus className="h-5 w-5" />
            Add New Blog
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
          <Card className="border-0 shadow-md hover:shadow-lg bg-gradient-to-br from-indigo-50 to-indigo-100 transition-all duration-300 rounded-xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-indigo-700 mb-2">
                    Total Blogs
                  </p>
                  <p className="text-4xl font-bold text-indigo-900">
                    {blogs.length}
                  </p>
                </div>
                <div className="p-4 bg-white bg-opacity-50 rounded-full shadow-sm">
                  <FileText className="h-8 w-8 text-indigo-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100 transition-all duration-300 rounded-xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-700 mb-2">
                    Published
                  </p>
                  <p className="text-4xl font-bold text-emerald-900">
                    {blogs.filter((b) => b.status === "published").length}
                  </p>
                </div>
                <div className="p-4 bg-white bg-opacity-50 rounded-full shadow-sm">
                  <Eye className="h-8 w-8 text-emerald-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg bg-gradient-to-br from-amber-50 to-amber-100 transition-all duration-300 rounded-xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-700 mb-2">
                    Drafts
                  </p>
                  <p className="text-4xl font-bold text-amber-900">
                    {blogs.filter((b) => b.status === "draft").length}
                  </p>
                </div>
                <div className="p-4 bg-white bg-opacity-50 rounded-full shadow-sm">
                  <Edit3 className="h-8 w-8 text-amber-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Categories Pills Bar */}
        <div className="w-full">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Blog Categories</h2>
            <Button
              onClick={openAddCategory}
              className="bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow transition-all duration-200 rounded-lg font-medium"
            >
              <Plus className="h-4 w-4 mr-2" /> Manage Categories
            </Button>
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 py-2 -mx-1 px-1 overflow-hidden">
              {/* All pill */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className={`whitespace-nowrap px-4 py-2 rounded-full border text-sm transition-colors shadow-sm ${
                        selectedCategory === "all"
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      All
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Show all categories</TooltipContent>
                </Tooltip>

                {/* Primary categories */}
                {primaryCategories.map((cat) => (
                  <Tooltip key={cat.category_id}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setSelectedCategory(String(cat.category_id))}
                        className={`whitespace-nowrap px-4 py-2 rounded-full border text-sm transition-colors shadow-sm ${
                          selectedCategory === String(cat.category_id)
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                        title={cat.title}
                      >
                        {cat.title}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs text-center overflow-hidden">
                      {(cat.description && cat.description.trim()) || "No description"}
                    </TooltipContent>
                  </Tooltip>
                ))}

                {/* Overflow in More dropdown */}
                {overflowCategories.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={`whitespace-nowrap px-4 py-2 rounded-full border text-sm transition-colors shadow-sm flex items-center gap-1 ${
                          selectedCategory !== "all" && overflowCategories.some((c) => String(c.category_id) === selectedCategory)
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                        aria-label="More categories"
                      >
                        More <ChevronDown className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 overflow-hidden">
                      <DropdownMenuLabel>More Categories</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <div className="max-h-72 overflow-y-auto overflow-x-hidden pr-2">
                        {overflowCategories.map((cat) => (
                          <DropdownMenuItem
                            key={cat.category_id}
                            onClick={() => setSelectedCategory(String(cat.category_id))}
                            className="flex flex-col items-start gap-0.5"
                          >
                            <span className="text-sm text-slate-800">{cat.title}</span>
                            <span className="text-xs text-slate-500 line-clamp-1 break-words overflow-hidden">
                              {(cat.description && cat.description.trim()) || "No description"}
                            </span>
                          </DropdownMenuItem>
                        ))}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TooltipProvider>
            </div>
            {selectedCategoryDetails && (
              <div className="mt-3 rounded-xl border border-slate-200 bg-white shadow-sm p-4 flex items-start justify-between gap-4 overflow-hidden">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 bg-indigo-50 rounded-lg shrink-0">
                    <Tag className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div className="min-w-0 overflow-hidden">
                    <div className="font-semibold text-slate-900 truncate">
                      {selectedCategoryDetails.title}
                    </div>
                    {selectedCategoryDetails.description ? (
                      <p className="text-sm text-slate-600 mt-1 line-clamp-2 overflow-hidden whitespace-normal break-words">
                        {selectedCategoryDetails.description}
                      </p>
                    ) : (
                      <p className="text-sm text-slate-500 mt-1 italic">No description provided.</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditCategory(selectedCategoryDetails)}
                    disabled={isCatSubmitting}
                    className="h-9 px-3 rounded-lg hover:bg-blue-50 hover:border-blue-200"
                    aria-label="Edit selected category"
                  >
                    <Edit3 className="h-4 w-4 text-blue-600" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => confirmDeleteCategory(selectedCategoryDetails)}
                    disabled={isCatSubmitting}
                    className="h-9 px-3 rounded-lg hover:bg-red-50 hover:border-red-200"
                    aria-label="Delete selected category"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search and Filter */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden bg-white">
          <CardHeader className="pb-4 bg-gradient-to-r from-indigo-50 to-white border-b border-slate-100">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Search className="h-5 w-5 text-indigo-600" />
              </div>
              Search & Filter Blogs
            </CardTitle>
            <CardDescription className="text-slate-600 mt-1">
              Find blogs by title, content, status or category
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <Input
                    placeholder="Search by title, author or content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-11 text-base border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:gap-5">
                <div className="relative">
                  <Select
                    value={selectedStatus}
                    onValueChange={(val: "all" | "draft" | "published") => setSelectedStatus(val)}
                  >
                    <SelectTrigger
                      id="status-filter"
                      className="w-full h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm"
                    >
                      {loading.initialLoading ? (
                        <div className="flex items-center justify-center h-64">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-slate-400" />
                          <SelectValue placeholder="Filter by status" />
                        </div>
                      )}
                    </SelectTrigger>
                    <SelectContent className="rounded-lg">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-indigo-50 text-indigo-700 border-indigo-100 px-3 py-1"
                >
                  <FileText className="h-3.5 w-3.5 mr-1" />
                  {filteredBlogs.length}{" "}
                  {filteredBlogs.length === 1 ? "blog" : "blogs"}
                </Badge>
                {selectedStatus !== "all" && (
                  <Badge
                    variant="outline"
                    className="bg-emerald-50 text-emerald-700 border-emerald-100 px-3 py-1"
                  >
                    <CheckCircle className="h-3.5 w-3.5 mr-1" />
                    {selectedStatus === "published" ? "Published" : "Draft"}
                  </Badge>
                )}
                {selectedCategory !== "all" && (
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-100 px-3 py-1"
                  >
                    <FolderOpen className="h-3.5 w-3.5 mr-1" />
                    {categories.find(
                      (c) => String(c.category_id) === selectedCategory
                    )?.title || "Category"}
                  </Badge>
                )}
                {searchTerm && (
                  <Badge
                    variant="outline"
                    className="bg-amber-50 text-amber-700 border-amber-100 px-3 py-1"
                  >
                    <Search className="h-3.5 w-3.5 mr-1" />
                    Search: "
                    {searchTerm.length > 15
                      ? searchTerm.substring(0, 15) + "..."
                      : searchTerm}
                    "
                  </Badge>
                )}
              </div>
              {(searchTerm ||
                selectedStatus !== "all" ||
                selectedCategory !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedStatus("all");
                    setSelectedCategory("all");
                  }}
                  className="h-9 px-3 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-lg transition-all duration-200"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear All Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Categories on top, Blogs below */}
        <div className="flex flex-col gap-8">
          {/* Blogs Table */}
          <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden bg-white">
            <CardHeader className="pb-4 bg-gradient-to-r from-indigo-50 to-white border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <FileText className="h-5 w-5 text-indigo-600" />
                </div>
                Blog Posts
              </CardTitle>
              <CardDescription className="text-slate-600 mt-1">
                Manage your blog content and publications
              </CardDescription>
              <div className="mt-4 text-sm text-slate-500">
                {sortedBlogs.length > 0 && (
                  <p>
                    Showing {sortedBlogs.length}{" "}
                    {sortedBlogs.length === 1 ? "blog" : "blogs"}
                  </p>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 border-b border-slate-200">
                      <TableHead className="font-semibold text-slate-700 py-4">
                        Blog Title
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700 py-4">
                        Author
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700 py-4">
                        Category
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700 py-4 w-32 whitespace-nowrap">
                        Date
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700 py-4 w-28">
                        Status
                      </TableHead>
                      <TableHead className="w-28 text-center font-semibold text-slate-700 py-4">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedBlogs.map((blog: Blog) => (
                      <TableRow
                        key={blog.blog_id}
                        className="hover:bg-slate-50 transition-colors duration-150 border-b border-slate-100"
                      >
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative h-12 w-16 rounded-md overflow-hidden border border-slate-200 bg-white shadow-sm flex-shrink-0">
                              <Image
                                src={
                                  blog.main_image
                                    ? blog.main_image.startsWith("http")
                                      ? blog.main_image
                                      : `${API_CONFIG.BASE_URL}${
                                          blog.main_image.startsWith("/")
                                            ? ""
                                            : "/"
                                        }${blog.main_image}`
                                    : "/placeholder.svg"
                                }
                                alt={blog.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <h3 className="font-medium text-slate-900 line-clamp-2">
                                {blog.title}
                              </h3>
                              <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                                {blog.content
                                  ? `${blog.content.slice(0, 60)}${
                                      blog.content.length > 60 ? "..." : ""
                                    }`
                                  : ""}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 text-sm text-slate-700">
                          Admin
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge
                            variant="outline"
                            className="bg-slate-50 text-slate-700 border-slate-200"
                          >
                            {blog.category_id &&
                            categoryTitleById[String(blog.category_id)]
                              ? categoryTitleById[String(blog.category_id)]
                              : "Uncategorized"}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 text-sm text-slate-700 whitespace-nowrap w-32">
                          {formatDate(blog.created_at)}
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge
                            variant={
                              blog.status === "published"
                                ? "default"
                                : "secondary"
                            }
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              blog.status === "published"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {blog.status === "published"
                              ? "Published"
                              : "Draft"}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 w-28">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(blog)}
                              disabled={isSubmitting}
                              className="h-9 w-9 p-0 rounded-lg hover:bg-blue-50 hover:border-blue-200"
                              aria-label="Edit blog"
                            >
                              <Edit3 className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => confirmDeleteBlog(blog.blog_id)}
                              disabled={isSubmitting}
                              className="h-9 w-9 p-0 rounded-lg hover:bg-red-50 hover:border-red-200"
                              aria-label="Delete blog"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Empty states */}
                {blogs.length === 0 && (
                  <div className="text-center py-16 px-4">
                    <div className="p-5 bg-indigo-50 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                      <FileText className="h-12 w-12 text-indigo-300" />
                    </div>
                    <h3 className="text-2xl font-semibold text-slate-900 mb-3">
                      No blogs available. Create your first blog now!
                    </h3>
                    <Button
                      onClick={() => setIsAddDialogOpen(true)}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-6 py-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      <Plus className="h-5 w-5" />
                      Add Blog
                    </Button>
                  </div>
                )}
                {blogs.length > 0 && filteredBlogs.length === 0 && (
                  <div className="text-center py-12 px-4">
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      No blogs match your filters
                    </h3>
                    <p className="text-slate-500 mb-6">
                      Try adjusting your search or filter criteria.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedStatus("all");
                        setSelectedCategory("all");
                      }}
                      className="rounded-lg"
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && filteredBlogs.length > 0 && (
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-6 px-6 border-t bg-gradient-to-r from-white to-slate-50">
                    <div className="text-sm text-slate-500">
                      Showing{" "}
                      <span className="font-medium text-slate-700">
                        {(currentPage - 1) * itemsPerPage + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium text-slate-700">
                        {Math.min(
                          currentPage * itemsPerPage,
                          filteredBlogs.length
                        )}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium text-slate-700">
                        {filteredBlogs.length}
                      </span>{" "}
                      blogs
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                        className="h-9 px-3 rounded-lg shadow-sm hover:shadow transition-all duration-200 border-slate-200"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {/* First page */}
                        {currentPage > 3 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(1)}
                            className="h-9 w-9 p-0 rounded-lg shadow-sm hover:shadow hover:bg-slate-50 border-slate-200"
                          >
                            1
                          </Button>
                        )}

                        {/* Ellipsis if needed */}
                        {currentPage > 4 && (
                          <span className="text-slate-400 px-1">...</span>
                        )}

                        {/* Page numbers around current page */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter((page) => {
                            if (totalPages <= 5) return true;
                            return (
                              page === 1 ||
                              page === totalPages ||
                              Math.abs(page - currentPage) <= 1
                            );
                          })
                          .map((page) => (
                            <Button
                              key={page}
                              variant={
                                currentPage === page ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                              className={`h-9 w-9 p-0 rounded-lg shadow-sm hover:shadow transition-all duration-200 ${
                                currentPage === page
                                  ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                                  : "hover:bg-slate-50 border-slate-200"
                              }`}
                            >
                              {page}
                            </Button>
                          ))}

                        {/* Ellipsis if needed */}
                        {currentPage < totalPages - 3 && (
                          <span className="text-slate-400 px-1">...</span>
                        )}

                        {/* Last page */}
                        {currentPage < totalPages - 2 && totalPages > 4 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(totalPages)}
                            className="h-9 w-9 p-0 rounded-lg shadow-sm hover:shadow hover:bg-slate-50 border-slate-200"
                          >
                            {totalPages}
                          </Button>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage(Math.min(totalPages, currentPage + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="h-9 px-3 rounded-lg shadow-sm hover:shadow transition-all duration-200 border-slate-200"
                      >
                        Next <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Add/Edit Dialog */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-lg border border-slate-100">
              <DialogHeader className="pb-4 border-b border-slate-100">
                <DialogTitle className="flex items-center gap-2 text-2xl font-bold text-slate-800">
                  <div className="p-2 bg-indigo-100 rounded-lg shadow-sm">
                    <FileText className="h-6 w-6 text-indigo-600" />
                  </div>
                  {editingBlog ? "Edit Blog" : "Add New Blog"}
                </DialogTitle>
                <DialogDescription className="text-slate-600 mt-2">
                  {editingBlog
                    ? "Update the blog information below."
                    : "Fill in the details to create a new blog post."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={saveBlog} className="space-y-6 p-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Blog Title */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                      Blog Title <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Enter blog title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                      disabled={isSubmitting}
                      className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm text-base font-medium"
                    />
                  </div>

                  {/* Video Link (optional) */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                      Video Link{" "}
                      <span className="text-slate-400 text-xs font-normal">
                        (optional)
                      </span>
                    </label>
                    <div className="relative">
                      <Input
                        placeholder="https://..."
                        value={formData.video_link}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            video_link: e.target.value,
                          })
                        }
                        disabled={isSubmitting}
                        className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm pl-10"
                      />
                      <Video className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    </div>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      Add a video to enhance your blog content
                    </p>
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Status
                    </label>
                    <Select
                      value={formData.status}
                      onValueChange={(val: 'draft' | 'published') =>
                        setFormData({ ...formData, status: val })
                      }
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg">
                        <SelectItem
                          value="draft"
                          className="focus:bg-amber-50 flex items-center gap-2"
                        >
                          <Edit3 className="h-4 w-4 text-amber-600" />
                          Draft
                        </SelectItem>
                        <SelectItem
                          value="published"
                          className="focus:bg-emerald-50 flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4 text-emerald-600" />
                          Published
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Category */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                      Category
                    </label>
                    <Select
                      value={String(formData.category_id || "")}
                      onValueChange={(val) =>
                        setFormData({ ...formData, category_id: val })
                      }
                      disabled={isSubmitting || categories.length === 0}
                    >
                      <SelectTrigger className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm pl-10 relative">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <SelectValue
                          placeholder={
                            categories.length === 0
                              ? "No categories available. Please create a category first."
                              : "Select category"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg">
                        {categories.length === 0 ? (
                          <SelectItem value="" disabled>
                            No categories available. Please create a category
                            first.
                          </SelectItem>
                        ) : (
                          categories.map((cat) => (
                            <SelectItem
                              key={cat.category_id}
                              value={String(cat.category_id)}
                              className="focus:bg-indigo-50"
                            >
                              {cat.title}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {categories.length === 0 && (
                      <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        No categories available. Please create a category first.
                      </p>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                    Content <span className="text-red-500">*</span>
                  </label>
                  <div className="border border-slate-200 rounded-lg shadow-sm overflow-hidden focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all duration-200">
                    <Textarea
                      rows={10}
                      placeholder="Write your blog content here..."
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      required
                      disabled={isSubmitting}
                      className="border-0 focus:ring-0 resize-y min-h-[200px] text-base"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    Format your content with paragraphs for better readability
                  </p>
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Featured Image
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div className="md:col-span-1">
                      {formData.main_image || selectedImage ? (
                        <div className="relative w-full h-40 rounded-lg overflow-hidden border shadow-sm">
                          <Image
                            src={
                              selectedImage
                                ? URL.createObjectURL(selectedImage)
                                : formData.main_image instanceof File
                                ? URL.createObjectURL(formData.main_image)
                                : typeof formData.main_image === "string"
                                ? formData.main_image.startsWith("http")
                                  ? formData.main_image
                                  : `${API_CONFIG.BASE_URL}${
                                      formData.main_image.startsWith("/")
                                        ? ""
                                        : "/"
                                    }${formData.main_image}`
                                : "/placeholder.svg"
                            }
                            alt="Featured image"
                            fill
                            className="object-cover transition-transform duration-300 hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-40 rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center bg-slate-50 text-slate-400">
                          <Image
                            className="h-12 w-12 text-slate-300 mb-2"
                            width={48}
                            height={48}
                            src="/placeholder.svg"
                            alt="Upload placeholder"
                          />
                          <span className="text-sm">No image selected</span>
                        </div>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <div className="p-4 border-2 border-dashed border-slate-200 rounded-lg hover:border-indigo-300 transition-colors duration-200">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          disabled={isSubmitting}
                          className="h-11 border-none focus:ring-0 cursor-pointer"
                        />
                      </div>
                      {selectedImage && (
                        <div className="flex items-center gap-2 text-sm text-emerald-600 mt-2">
                          <CheckCircle className="h-4 w-4" />
                          Selected: {selectedImage.name}
                        </div>
                      )}
                      <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                        <Info className="h-3 w-3" />
                        Recommended size: 1200x630 pixels, max 5MB
                      </p>
                    </div>
                  </div>
                </div>

                <DialogFooter className="flex gap-3 pt-6 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    disabled={isSubmitting}
                    className="px-6 bg-transparent rounded-lg hover:bg-slate-50 transition-colors duration-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {editingBlog ? "Saving..." : "Creating..."}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        {editingBlog ? "Save Changes" : "Create Blog"}
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Category Add/Edit Dialog */}
          <Dialog open={isCatDialogOpen} onOpenChange={setIsCatDialogOpen}>
            <DialogContent className="max-w-lg rounded-xl shadow-lg border border-slate-100">
              <DialogHeader className="pb-4 border-b border-slate-100">
                <DialogTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-lg shadow-sm">
                    {editingCategory ? (
                      <Edit3 className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Tag className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  {editingCategory ? "Edit Category" : "Add Category"}
                </DialogTitle>
                <DialogDescription className="text-slate-600 mt-2">
                  {editingCategory
                    ? "Update the category details."
                    : "Create a new blog category."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={saveCategory} className="space-y-5 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={catForm.title}
                    onChange={(e) =>
                      setCatForm({ ...catForm, title: e.target.value })
                    }
                    required
                    disabled={isCatSubmitting}
                    className="rounded-lg border-slate-200 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 shadow-sm"
                    placeholder="Enter category title"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                    Description{" "}
                    <span className="text-slate-400">(Optional)</span>
                  </label>
                  <Textarea
                    value={catForm.description}
                    onChange={(e) =>
                      setCatForm({ ...catForm, description: e.target.value })
                    }
                    rows={4}
                    disabled={isCatSubmitting}
                    className="rounded-lg border-slate-200 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 shadow-sm min-h-[120px]"
                    placeholder="Enter category description"
                  />
                </div>
                <DialogFooter className="pt-4 border-t border-slate-100 flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCatDialogOpen(false)}
                    disabled={isCatSubmitting}
                    className="rounded-lg border-slate-200 hover:bg-slate-50 transition-colors duration-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isCatSubmitting}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    {isCatSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" /> Save
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Category Delete Confirmation Dialog */}
          <Dialog
            open={showCatDeleteConfirm}
            onOpenChange={setShowCatDeleteConfirm}
          >
            <DialogContent className="rounded-xl shadow-lg max-w-md">
              <DialogHeader className="pb-4 border-b border-slate-100">
                <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
                  <AlertTriangle className="h-5 w-5 text-amber-500" /> Confirm
                  Deletion
                </DialogTitle>
                <DialogDescription className="text-slate-600 mt-2">
                  <p className="mb-2">
                    Are you sure you want to delete{" "}
                    <span className="font-medium text-slate-800">
                      "{catDeleteTarget?.name}"
                    </span>
                    ?
                  </p>
                  <p className="text-red-600 font-medium">
                    This action cannot be undone.
                  </p>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCatDeleteConfirm(false)}
                  disabled={isCatSubmitting}
                  className="rounded-lg border-slate-200 hover:bg-slate-50 transition-colors duration-200"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={deleteCategory}
                  disabled={isCatSubmitting}
                  className="flex items-center gap-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                >
                  {isCatSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" /> Delete
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
            <DialogContent className="rounded-xl shadow-lg max-w-md">
              <DialogHeader className="pb-4 border-b border-slate-100">
                <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Confirm Deletion
                </DialogTitle>
                <DialogDescription className="text-slate-600 mt-2">
                  <p className="mb-2">
                    Are you sure you want to delete{" "}
                    <span className="font-medium text-slate-800">
                      "{deleteTarget?.name}"
                    </span>
                    ?
                  </p>
                  <p className="text-red-600 font-medium">
                    This action cannot be undone.
                    {deleteTarget?.type === "blog" &&
                      " The associated image will also be removed."}
                  </p>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={handleCancelDelete}
                  disabled={isSubmitting}
                  className="rounded-lg border-slate-200 hover:bg-slate-50 transition-colors duration-200 bg-transparent"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmDelete}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </AdminLayout>
  );
}
