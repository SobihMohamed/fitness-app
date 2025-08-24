"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useLoading } from "@/hooks/use-loading"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AdminLayout } from "@/components/admin/admin-layout"
import { useAdminApi } from "@/hooks/admin/use-admin-api"
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Save,
  X,
  FileText,
  Tag,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  Calendar,
} from "lucide-react"
import Loading from "@/app/loading"
import { API_CONFIG } from "@/config/api"
import { toast } from "sonner"

type BlogCategory = {
  category_id: string
  name: string
}

type Blog = {
  blog_id: string
  title: string
  content: string
  excerpt: string
  image_url: string
  author: string
  status: string
  category_id: string
  created_at: string
  updated_at: string
}

const BLOG_CATEGORY_SUGGESTIONS = [
  "Fitness Tips",
  "Nutrition",
  "Weight Loss",
  "Muscle Building",
  "Workout Routines",
  "Mental Health",
  "Recovery",
  "Supplements",
  "Cardio Training",
  "Strength Training",
  "Yoga & Flexibility",
  "Sports Performance",
  "Healthy Recipes",
  "Lifestyle",
  "Success Stories",
  "Equipment Reviews",
]

export default function BlogsManagement() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const { isAnyLoading, withLoading } = useLoading()
  const [searchTerm, setSearchTerm] = useState("")
  const [initialLoading, setInitialLoading] = useState(true)
  const [categories, setCategories] = useState<BlogCategory[]>([])

  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([
          (async () => {
            try {
              const res = await fetch(API_CONFIG.ADMIN_FUNCTIONS.AdminBlogs.getAllBlogs, {
                headers: getAuthHeaders(),
              })
              const data = await res.json()
              if (res.ok) {
                setCategories(data.data || [])
              } else {
                showErrorToast("Failed to load blog categories")
              }
            } catch (err) {
              showErrorToast("Network error while loading blog categories")
            }
          })(),
          fetchBlogs(),
        ])
      } finally {
        setInitialLoading(false)
      }
    }
    initializeData()
  }, [])

  const [newCategoryName, setNewCategoryName] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    author: "",
    status: "draft",
    category_id: "",
    image_url: "",
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editingCategoryName, setEditingCategoryName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCategoryGenerator, setShowCategoryGenerator] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "category" | "blog"
    id: string
    name: string
  } | null>(null)

  const itemsPerPage = 5
  const [currentPage, setCurrentPage] = useState(1)
  const categoriesPerPage = 4
  const [currentCategoryPage, setCurrentCategoryPage] = useState(1)

  const { getAuthHeaders, parseResponse, showSuccessToast, showErrorToast } = useAdminApi()

  const showInfoToast = (message: string) => {
    toast(message, {
      duration: 3000,
      style: {
        background: "linear-gradient(135deg, #3b82f6, #2563eb)",
        color: "#fff",
        fontWeight: "600",
        borderRadius: "12px",
        padding: "16px 20px",
        boxShadow: "0 10px 25px rgba(59, 130, 246, 0.3)",
      },
      icon: "✨",
    })
  }

  const addCategory = async () => {
    if (!newCategoryName.trim()) {
      showErrorToast("Blog category name is required")
      return
    }

    const existingCategory = categories.find(
      (cat) => cat.name.toLowerCase().trim() === newCategoryName.toLowerCase().trim(),
    )
    if (existingCategory) {
      showErrorToast("A blog category with this name already exists")
      return
    }

    try {
      setIsSubmitting(true)
      const res = await fetch(API_CONFIG.ADMIN_FUNCTIONS.AdminBlogs.add, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: newCategoryName }),
      })
      const data = await res.json()
      if (res.ok) {
        showSuccessToast(`Category "${newCategoryName}" added successfully!`)
        setNewCategoryName("")
        const refreshRes = await fetch(API_CONFIG.USER_BLOG_API.getAll, {
          headers: getAuthHeaders(),
        })
        const refreshData = await refreshRes.json()
        if (refreshRes.ok) {
          setCategories(refreshData.data || [])
        }
      } else {
        showErrorToast(data.message || "Failed to add blog category")
      }
    } catch (err) {
      showErrorToast("Network error while adding blog category")
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateCategory = async () => {
    if (!editingCategoryName.trim()) {
      showErrorToast("Blog category name is required")
      return
    }

    const currentCategory = categories.find((cat) => cat.category_id === editingCategoryId)
    if (currentCategory && currentCategory.name === editingCategoryName.trim()) {
      setEditingCategoryId(null)
      setEditingCategoryName("")
      return
    }

    const existingCategory = categories.find(
      (cat) =>
        cat.category_id !== editingCategoryId &&
        cat.name.toLowerCase().trim() === editingCategoryName.toLowerCase().trim(),
    )
    if (existingCategory) {
      showErrorToast("A blog category with this name already exists")
      return
    }

    try {
      setIsSubmitting(true)
      const res = await fetch(API_CONFIG.ADMIN_FUNCTIONS.AdminBlogs.update, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: editingCategoryName.trim(),
        }),
      })
      const data = await res.json()
      if (res.ok) {
        showSuccessToast(`Blog category updated successfully!`)
        setEditingCategoryId(null)
        setEditingCategoryName("")
        const refreshRes = await fetch(API_CONFIG.USER_BLOG_API.getAll, {
          headers: getAuthHeaders(),
        })
        const refreshData = await refreshRes.json()
        if (refreshRes.ok) {
          setCategories(refreshData.data || [])
        }
      } else {
        showErrorToast(data.message || `Failed to update blog category`)
      }
    } catch (err) {
      showErrorToast("Network error while updating blog category")
    } finally {
      setIsSubmitting(false)
    }
  }

  const confirmDeleteCategory = (id: string) => {
    const categoryName = categories.find((cat) => cat.category_id === id)?.name || "this category"
    const blogsInCategory = blogs.filter((b) => b.category_id === id)
    if (blogsInCategory.length > 0) {
      showErrorToast(
        `Cannot delete category "${categoryName}". It contains ${blogsInCategory.length} blog(s). Please remove or reassign the blogs first.`,
      )
      return
    }
    setDeleteTarget({ type: "category", id, name: categoryName })
    setShowDeleteConfirm(true)
  }

  const deleteCategory = async () => {
    if (!deleteTarget || deleteTarget.type !== "category") return
    try {
      setIsSubmitting(true)
      const res = await fetch(API_CONFIG.ADMIN_FUNCTIONS.AdminBlogs.delete(deleteTarget.id), {
        method: "DELETE",
        headers: getAuthHeaders(),
      })
      const data = await res.json()
      if (res.ok) {
        showSuccessToast(`Category "${deleteTarget.name}" deleted successfully!`)
        setCategories(categories.filter((cat) => cat.category_id !== deleteTarget.id))
      } else {
        showErrorToast(data.message || `Failed to delete category`)
      }
    } catch (err) {
      showErrorToast("Network error while deleting category")
    } finally {
      setIsSubmitting(false)
      setShowDeleteConfirm(false)
      setDeleteTarget(null)
    }
  }

  const generateCategories = () => {
    const existingNames = categories.map((cat) => cat.name.toLowerCase())
    const newCategories = BLOG_CATEGORY_SUGGESTIONS.filter(
      (suggestion) => !existingNames.includes(suggestion.toLowerCase()),
    ).slice(0, 5)

    if (newCategories.length === 0) {
      showInfoToast("All suggested categories already exist!")
      return
    }

    showInfoToast(`Generated ${newCategories.length} category suggestions!`)
    setShowCategoryGenerator(true)
  }

  const addGeneratedCategory = async (categoryName: string) => {
    try {
      setIsSubmitting(true)
      const res = await fetch(API_CONFIG.ADMIN_FUNCTIONS.AdminBlogs.add, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: categoryName }),
      })
      const data = await res.json()
      if (res.ok) {
        showSuccessToast(`Category "${categoryName}" added successfully!`)
        const refreshRes = await fetch(API_CONFIG.USER_BLOG_API.getAll, {
          headers: getAuthHeaders(),
        })
        const refreshData = await refreshRes.json()
        if (refreshRes.ok) {
          setCategories(refreshData.data || [])
        }
      } else {
        showErrorToast(data.message || "Failed to add blog category")
      }
    } catch (err) {
      showErrorToast("Network error while adding blog category")
    } finally {
      setIsSubmitting(false)
    }
  }

  const fetchBlogs = async () => {
    await withLoading("blogs", async () => {
      try {
        const res = await fetch(API_CONFIG.USER_BLOG_API.getAll, {
          headers: getAuthHeaders(),
        })
        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.message || "Failed to fetch blogs")
        }
        const result = await res.json()
        const data = result.data || result.blogs || result || []
        const formattedData = data.map((blog: any) => ({
          blog_id: blog.blog_id,
          title: blog.title,
          content: blog.content,
          excerpt: blog.excerpt,
          image_url: blog.image_url || null,
          author: blog.author,
          status: blog.status || "draft",
          category_id: blog.category_id,
          created_at: blog.created_at,
          updated_at: blog.updated_at,
        }))
        setBlogs(formattedData)
      } catch (err: any) {
        showErrorToast(err.message || "Network error while loading blogs")
      }
    })
  }

  const filteredBlogs = blogs.filter(
    (b: Blog) =>
      b.title?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === "all" || b.category_id?.toString() === selectedCategory) &&
      (selectedStatus === "all" || b.status === selectedStatus),
  )

  const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage)
  const paginatedBlogs = filteredBlogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.content) {
      showErrorToast("Blog title and content are required")
      return
    }
    if (!formData.category_id) {
      showErrorToast("Please select a blog category")
      return
    }

    const formDataToSend = new FormData()
    formDataToSend.append("title", formData.title)
    formDataToSend.append("content", formData.content)
    formDataToSend.append("excerpt", formData.excerpt)
    formDataToSend.append("author", formData.author)
    formDataToSend.append("status", formData.status)
    formDataToSend.append("category_id", formData.category_id)

    if (selectedImage) {
      formDataToSend.append("image_url", selectedImage)
    }

    try {
      setIsSubmitting(true)
      const endpoint = editingBlog ? API_CONFIG.ADMIN_FUNCTIONS.AdminBlogs.update : API_CONFIG.ADMIN_FUNCTIONS.AdminBlogs.add

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: getAuthHeaders().Authorization,
        },
        body: formDataToSend,
      })
      const result = await parseResponse(res)
      if (!res.ok) throw new Error(result.message || "Failed to save blog")

      if (editingBlog) {
        showSuccessToast(`Blog updated successfully!`)
      } else {
        showSuccessToast(`Blog added successfully!`)
      }

      await fetchBlogs()
      setFormData({
        title: "",
        content: "",
        excerpt: "",
        author: "",
        status: "draft",
        category_id: "",
        image_url: "",
      })
      setSelectedImage(null)
      setEditingBlog(null)
      setIsAddDialogOpen(false)
    } catch (err: any) {
      showErrorToast(err.message || "Network error while saving blog")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog)
    setFormData({
      title: blog.title || "",
      content: blog.content || "",
      excerpt: blog.excerpt || "",
      author: blog.author || "",
      status: blog.status || "draft",
      category_id: blog.category_id?.toString() || "",
      image_url: blog.image_url || "",
    })
    setSelectedImage(null)
    setIsAddDialogOpen(true)
  }

  const confirmDeleteBlog = (id: string) => {
    const blog = blogs.find((b) => b.blog_id === id)
    const blogTitle = blog?.title || "this blog"
    setDeleteTarget({ type: "blog", id, name: blogTitle })
    setShowDeleteConfirm(true)
  }

  const deleteBlog = async () => {
    if (!deleteTarget || deleteTarget.type !== "blog") return
    try {
      setIsSubmitting(true)
      const res = await fetch(API_CONFIG.ADMIN_FUNCTIONS.AdminBlogs.delete(deleteTarget.id), {
        method: "DELETE",
        headers: getAuthHeaders(),
      })
      const result = await parseResponse(res)
      if (!res.ok) throw new Error(result.message || "Delete failed")
      showSuccessToast(`Blog deleted successfully!`)
      await fetchBlogs()
    } catch (err: any) {
      showErrorToast(err.message || "Network error while deleting blog")
    } finally {
      setIsSubmitting(false)
      setShowDeleteConfirm(false)
      setDeleteTarget(null)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showErrorToast("Image file size must be less than 5MB")
        return
      }
      if (!file.type.startsWith("image/")) {
        showErrorToast("Please select a valid image file")
        return
      }
      setSelectedImage(file)
    }
  }

  const startEditCategory = (category: BlogCategory) => {
    setEditingCategoryId(category.category_id)
    setEditingCategoryName(category.name)
    setTimeout(() => {
      const inputElement = document.querySelector(`[data-category-input="${category.category_id}"]`) as HTMLInputElement
      if (inputElement) {
        inputElement.focus()
        inputElement.select()
      }
    }, 100)
  }

  const cancelEditCategory = () => {
    setEditingCategoryId(null)
    setEditingCategoryName("")
  }

  const handleConfirmDelete = () => {
    if (deleteTarget?.type === "category") {
      deleteCategory()
    } else if (deleteTarget?.type === "blog") {
      deleteBlog()
    }
  }

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false)
    setDeleteTarget(null)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (isAnyLoading() || initialLoading) {
    return (
      <AdminLayout>
        <Loading
          variant="admin"
          size="lg"
          message="Loading blogs and categories..."
          icon="loader"
          className="h-[80vh]"
        />
      </AdminLayout>
    )
  }

  const totalCategoryPages = Math.ceil(categories.length / categoriesPerPage)
  const paginatedCategories = categories.slice(
    (currentCategoryPage - 1) * categoriesPerPage,
    currentCategoryPage * categoriesPerPage,
  )

  return (
    <AdminLayout>
      <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 to-white min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-xl">
                <FileText className="h-8 w-8 text-indigo-600" />
              </div>
              Blog Management
            </h1>
            <p className="text-slate-600 mt-3 text-lg">Create and manage your blog content and categories</p>
          </div>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 text-base"
          >
            <Plus className="h-5 w-5" />
            Add New Blog
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-indigo-100 hover:shadow-xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-indigo-700 mb-1">Total Blogs</p>
                  <p className="text-3xl font-bold text-indigo-900">{blogs.length}</p>
                </div>
                <div className="p-3 bg-indigo-200 rounded-full">
                  <FileText className="h-8 w-8 text-indigo-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100 hover:shadow-xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-700 mb-1">Published</p>
                  <p className="text-3xl font-bold text-emerald-900">
                    {blogs.filter((b) => b.status === "published").length}
                  </p>
                </div>
                <div className="p-3 bg-emerald-200 rounded-full">
                  <Eye className="h-8 w-8 text-emerald-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100 hover:shadow-xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-700 mb-1">Drafts</p>
                  <p className="text-3xl font-bold text-amber-900">
                    {blogs.filter((b) => b.status === "draft").length}
                  </p>
                </div>
                <div className="p-3 bg-amber-200 rounded-full">
                  <Edit3 className="h-8 w-8 text-amber-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700 mb-1">Categories</p>
                  <p className="text-3xl font-bold text-purple-900">{categories.length}</p>
                </div>
                <div className="p-3 bg-purple-200 rounded-full">
                  <Tag className="h-8 w-8 text-purple-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Management Section */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Tag className="h-6 w-6 text-indigo-600" />
                <CardTitle className="text-xl text-slate-800">Category Management</CardTitle>
              </div>
              <Button
                onClick={generateCategories}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 hover:bg-indigo-50 border-indigo-200 bg-transparent"
              >
                <Sparkles className="h-4 w-4" />
                Generate Categories
              </Button>
            </div>
            <CardDescription className="text-slate-600">
              Create and manage blog categories for better organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Category Form */}
            <div className="flex gap-3">
              <Input
                placeholder="Enter category name..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addCategory()}
                disabled={isSubmitting}
                className="flex-1 h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
              />
              <Button
                onClick={addCategory}
                disabled={isSubmitting || !newCategoryName.trim()}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Add Category
              </Button>
            </div>

            {/* Category Generator Dialog */}
            {showCategoryGenerator && (
              <div className="bg-white rounded-lg p-4 border border-indigo-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-slate-900">Suggested Categories</h4>
                  <Button variant="ghost" size="sm" onClick={() => setShowCategoryGenerator(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {BLOG_CATEGORY_SUGGESTIONS.filter(
                    (suggestion) => !categories.some((cat) => cat.name.toLowerCase() === suggestion.toLowerCase()),
                  )
                    .slice(0, 6)
                    .map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => addGeneratedCategory(suggestion)}
                        disabled={isSubmitting}
                        className="justify-start text-left h-auto py-2 px-3 hover:bg-indigo-50"
                      >
                        {suggestion}
                      </Button>
                    ))}
                </div>
              </div>
            )}

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {paginatedCategories.map((cat) => (
                <div
                  key={cat.category_id}
                  className={`group relative bg-white rounded-lg p-3 border-2 transition-all duration-200 hover:shadow-md ${
                    editingCategoryId === cat.category_id
                      ? "border-indigo-300 shadow-lg"
                      : "border-slate-200 hover:border-indigo-200"
                  }`}
                >
                  {editingCategoryId === cat.category_id ? (
                    <div className="space-y-3">
                      <Input
                        value={editingCategoryName}
                        onChange={(e) => setEditingCategoryName(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && updateCategory()}
                        onKeyDown={(e) => e.key === "Escape" && cancelEditCategory()}
                        disabled={isSubmitting}
                        className="border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500"
                        data-category-input={cat.category_id}
                        autoFocus
                        placeholder="Type category name..."
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={updateCategory} disabled={isSubmitting} className="flex-1">
                          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          Save
                        </Button>
                        <Button variant="outline" size="sm" onClick={cancelEditCategory} disabled={isSubmitting}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-900 truncate">{cat.name}</span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditCategory(cat)}
                            disabled={isSubmitting}
                            className="h-8 w-8 p-0 hover:bg-indigo-50"
                          >
                            <Edit3 className="h-4 w-4 text-indigo-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => confirmDeleteCategory(cat.category_id)}
                            disabled={isSubmitting}
                            className="h-8 w-8 p-0 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Category Pagination */}
            {totalCategoryPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {Array.from({ length: totalCategoryPages }, (_, i) => (
                  <Button
                    key={i}
                    variant={currentCategoryPage === i + 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentCategoryPage(i + 1)}
                    className={`w-10 h-10 ${
                      currentCategoryPage === i + 1 ? "bg-indigo-600 hover:bg-indigo-700" : "hover:bg-slate-100"
                    }`}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Search and Filter */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Search className="h-5 w-5 text-indigo-600" />
              Search & Filter Blogs
            </CardTitle>
            <CardDescription className="text-slate-600">
              Find blogs by title or filter by category and status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <Input
                    placeholder="Search blogs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 text-base border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={(val) => setSelectedCategory(val)}>
                <SelectTrigger className="w-full md:w-48 h-12 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.category_id} value={cat.category_id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={(val) => setSelectedStatus(val)}>
                <SelectTrigger className="w-full md:w-48 h-12 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(searchTerm || selectedCategory !== "all" || selectedStatus !== "all") && (
              <div className="mt-4 flex items-center gap-3">
                <span className="text-sm text-slate-600">Found {filteredBlogs.length} blogs</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedCategory("all")
                    setSelectedStatus("all")
                  }}
                  className="h-7 px-3 text-xs hover:bg-slate-50"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Blogs Table */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 border-b border-slate-200">
                    <TableHead className="w-16 font-semibold text-slate-700">Image</TableHead>
                    <TableHead className="font-semibold text-slate-700">Title</TableHead>
                    <TableHead className="font-semibold text-slate-700">Category</TableHead>
                    <TableHead className="font-semibold text-slate-700">Author</TableHead>
                    <TableHead className="font-semibold text-slate-700">Status</TableHead>
                    <TableHead className="font-semibold text-slate-700">Date</TableHead>
                    <TableHead className="w-32 text-center font-semibold text-slate-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedBlogs.map((blog: Blog) => (
                    <TableRow
                      key={blog.blog_id}
                      className="hover:bg-slate-50 transition-colors duration-150 border-b border-slate-100"
                    >
                      <TableCell>
                        <div className="w-14 h-14 relative rounded-lg overflow-hidden border shadow-sm">
                          <Image
                            src={blog.image_url ? `${API_CONFIG.BASE_URL}${blog.image_url}` : "/placeholder.svg"}
                            alt={blog.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-semibold text-slate-900 mb-1">{blog.title}</div>
                          {blog.excerpt && (
                            <div className="text-sm text-slate-500 truncate max-w-xs">{blog.excerpt}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {categories.find((cat) => cat.category_id === blog.category_id)?.name || blog.category_id}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600">{blog.author || "N/A"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={blog.status === "published" ? "default" : "secondary"}
                          className={`text-xs ${
                            blog.status === "published"
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                          }`}
                        >
                          {blog.status === "published" ? (
                            <Eye className="h-3 w-3 mr-1" />
                          ) : (
                            <Edit3 className="h-3 w-3 mr-1" />
                          )}
                          {blog.status === "published" ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(blog.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(blog)}
                            disabled={isSubmitting}
                            className="h-9 w-9 p-0 hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-150"
                          >
                            <Edit3 className="h-4 w-4 text-indigo-600" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => confirmDeleteBlog(blog.blog_id)}
                            disabled={isSubmitting}
                            className="h-9 w-9 p-0 hover:bg-red-50 hover:border-red-200 transition-all duration-150"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* No results */}
              {filteredBlogs.length === 0 && (
                <div className="text-center py-16">
                  <div className="p-4 bg-slate-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                    <FileText className="h-10 w-10 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    {searchTerm || selectedCategory !== "all" || selectedStatus !== "all"
                      ? "No blogs found"
                      : "No blogs yet"}
                  </h3>
                  <p className="text-slate-500 mb-6 max-w-md mx-auto">
                    {searchTerm || selectedCategory !== "all" || selectedStatus !== "all"
                      ? "Try adjusting your search or filter criteria to find what you're looking for"
                      : "Get started by creating your first blog post"}
                  </p>
                  {!searchTerm && selectedCategory === "all" && selectedStatus === "all" && (
                    <Button
                      onClick={() => setIsAddDialogOpen(true)}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Plus className="h-4 w-4" />
                      Create Your First Blog
                    </Button>
                  )}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 p-6 border-t bg-slate-50">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <Button
                      key={i}
                      variant={currentPage === i + 1 ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-10 h-10 ${
                        currentPage === i + 1 ? "bg-indigo-600 hover:bg-indigo-700" : "hover:bg-slate-100"
                      }`}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <FileText className="h-5 w-5 text-indigo-600" />
                </div>
                {editingBlog ? "Edit Blog" : "Add New Blog"}
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                {editingBlog ? "Update the blog information below." : "Fill in the details to create a new blog post."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Blog Title */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Blog Title *</label>
                  <Input
                    placeholder="Enter blog title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    disabled={isSubmitting}
                    className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Category *</label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(val) => setFormData({ ...formData, category_id: val })}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.category_id} value={cat.category_id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Author */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Author</label>
                  <Input
                    placeholder="Enter author name"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    disabled={isSubmitting}
                    className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Status</label>
                  <Select
                    value={formData.status}
                    onValueChange={(val) => setFormData({ ...formData, status: val })}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Excerpt */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Excerpt</label>
                <Textarea
                  rows={3}
                  placeholder="Enter a brief excerpt or summary..."
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  disabled={isSubmitting}
                  className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Content *</label>
                <Textarea
                  rows={8}
                  placeholder="Write your blog content here..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  disabled={isSubmitting}
                  className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Featured Image</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isSubmitting}
                  className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
                {selectedImage && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    Selected: {selectedImage.name}
                  </div>
                )}
              </div>

              <DialogFooter className="flex gap-3 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  disabled={isSubmitting}
                  className="px-6 bg-transparent"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-6"
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

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                Confirm Deletion
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{deleteTarget?.name}"? This action cannot be undone.
                {deleteTarget?.type === "blog" && " The associated image will also be removed."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-3">
              <Button variant="outline" onClick={handleCancelDelete} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="flex items-center gap-2"
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
    </AdminLayout>
  )
}
