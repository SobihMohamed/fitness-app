"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
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
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  Calendar,
} from "lucide-react"
import Loading from "@/app/loading"
import { API_CONFIG } from "@/config/api"

type Blog = {
  blog_id: string
  title: string
  video_link: string | null
  main_image: string | null
  content: string
  created_at: string
  status: string
  admin_id: string | number
}

 

export default function BlogsManagement() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const { isAnyLoading, withLoading } = useLoading()
  const [searchTerm, setSearchTerm] = useState("")
  const [initialLoading, setInitialLoading] = useState(true)
  

  useEffect(() => {
    const initializeData = async () => {
      try {
        await fetchBlogs()
      } finally {
        setInitialLoading(false)
      }
    }
    initializeData()
  }, [])

  const [selectedStatus, setSelectedStatus] = useState("all")

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    status: "draft",
    video_link: "",
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string
    name: string
    type?: string
  } | null>(null)

  const itemsPerPage = 5
  const [currentPage, setCurrentPage] = useState(1)

  const { getAuthHeaders, parseResponse, showSuccessToast, showErrorToast } = useAdminApi()


  const fetchBlogs = async () => {
    try {
      await withLoading("blogs", async () => {
        const res = await fetch(API_CONFIG.ADMIN_FUNCTIONS.AdminBlogs.getAllBlogs, {
          headers: getAuthHeaders(),
        })
        // Gracefully handle empty state (backend returns 404 when no blogs)
        if (res.status === 404) {
          setBlogs([])
          return
        }
        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.message || "Failed to fetch blogs")
        }
        const result = await res.json()
        const data = result.data || result.blogs || result || []
        const formattedData = data.map((blog: any) => ({
          blog_id: String(blog.blog_id),
          title: blog.title,
          video_link: blog.video_link ?? null,
          // Accept multiple possible backend keys for image path
          main_image: (blog.main_image ?? blog.image_url ?? blog.image ?? null) as string | null,
          content: blog.content,
          created_at: blog.created_at,
          // Normalize numeric or string status to UI values
          status:
            blog.status === 1 || blog.status === "1" || String(blog.status).toLowerCase() === "published"
              ? "published"
              : "draft",
          admin_id: blog.admin_id,
        }))
        setBlogs(formattedData)
      })
    } catch (err: any) {
      showErrorToast(err.message || "Network error while loading blogs")
    }
  }

  const saveBlog = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!formData.title || !formData.content) {
      showErrorToast("Blog title and content are required")
      return
    }
    const formDataToSend = new FormData()
    formDataToSend.append("title", formData.title)
    formDataToSend.append("content", formData.content)
    // Backend expects numeric status (1 = published, 0 = draft)
    const statusValue = formData.status === "published" ? "1" : "0"
    formDataToSend.append("status", statusValue)
    if (formData.video_link) formDataToSend.append("video_link", formData.video_link)

    if (selectedImage) {
      formDataToSend.append("main_image", selectedImage)
    }

    try {
      setIsSubmitting(true)
      const endpoint = editingBlog
        ? API_CONFIG.ADMIN_FUNCTIONS.AdminBlogs.update(String(editingBlog.blog_id))
        : API_CONFIG.ADMIN_FUNCTIONS.AdminBlogs.add

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
        status: "draft",
        video_link: "",
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
      status: blog.status || "draft",
      video_link: blog.video_link || "",
    });
    setSelectedImage(null)
    setIsAddDialogOpen(true)
  }

  const confirmDeleteBlog = (id: string) => {
    const blog = blogs.find((b) => b.blog_id === id)
    const blogTitle = blog?.title || "this blog"
    setDeleteTarget({ id, name: blogTitle, type: "blog" })
    setShowDeleteConfirm(true)
  }

  const deleteBlog = async () => {
    if (!deleteTarget) return
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

  

  const handleConfirmDelete = () => {
    if (deleteTarget) {
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

  const filteredBlogs = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return blogs.filter(
      (b: Blog) =>
        (b.title?.toLowerCase().includes(term) || b.content?.toLowerCase().includes(term)) &&
        (selectedStatus === "all" || b.status === selectedStatus),
    )
  }, [blogs, searchTerm, selectedStatus])

  const totalPages = useMemo(() => Math.ceil(filteredBlogs.length / itemsPerPage), [filteredBlogs.length])
  const paginatedBlogs = useMemo(
    () => filteredBlogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [filteredBlogs, currentPage, itemsPerPage],
  )

  if (isAnyLoading() || initialLoading) {
    return (
      <AdminLayout>
        <Loading
          variant="admin"
          size="lg"
          message="Loading blogs..."
          icon="loader"
          className="h-[80vh]"
        />
      </AdminLayout>
    )
  }
  

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
            <p className="text-slate-600 mt-3 text-lg">
              Create and manage your blog content and categories
            </p>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-indigo-100 hover:shadow-xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-indigo-700 mb-1">
                    Total Blogs
                  </p>
                  <p className="text-3xl font-bold text-indigo-900">
                    {blogs.length}
                  </p>
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
                  <p className="text-sm font-medium text-emerald-700 mb-1">
                    Published
                  </p>
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
                  <p className="text-sm font-medium text-amber-700 mb-1">
                    Drafts
                  </p>
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

          
        </div>

        

        {/* Search and Filter */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Search className="h-5 w-5 text-indigo-600" />
              Search & Filter Blogs
            </CardTitle>
            <CardDescription className="text-slate-600">
              Find blogs by title/content and status
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
              <Select
                value={selectedStatus}
                onValueChange={(val) => setSelectedStatus(val)}
              >
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
            {(searchTerm || selectedStatus !== "all") && (
              <div className="mt-4 flex items-center gap-3">
                <span className="text-sm text-slate-600">
                  Found {filteredBlogs.length} blogs
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedStatus("all");
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
                    <TableHead className="w-16 font-semibold text-slate-700">
                      Image
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Title
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Status
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Date
                    </TableHead>
                    <TableHead className="w-32 text-center font-semibold text-slate-700">
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
                      <TableCell>
                        <div className="w-14 h-14 relative rounded-lg overflow-hidden border shadow-sm">
                          <Image
                            src={
                              blog.main_image
                                ? (blog.main_image.startsWith("http")
                                  ? blog.main_image
                                  : `${API_CONFIG.BASE_URL}${blog.main_image.startsWith("/") ? "" : "/"}${blog.main_image}`)
                                : "/placeholder.svg"
                            }
                            alt={blog.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-semibold text-slate-900 mb-1">
                            {blog.title}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            blog.status === "published"
                              ? "default"
                              : "secondary"
                          }
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
                    {searchTerm || selectedStatus !== "all"
                      ? "No blogs found"
                      : "No blogs yet"}
                  </h3>
                  <p className="text-slate-500 mb-6 max-w-md mx-auto">
                    {searchTerm || selectedStatus !== "all"
                      ? "Try adjusting your search or filter criteria to find what you're looking for"
                      : "Get started by creating your first blog post"}
                  </p>
                  {!searchTerm && selectedStatus === "all" && (
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
                        currentPage === i + 1
                          ? "bg-indigo-600 hover:bg-indigo-700"
                          : "hover:bg-slate-100"
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
                {editingBlog
                  ? "Update the blog information below."
                  : "Fill in the details to create a new blog post."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={saveBlog} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Blog Title */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Blog Title *
                  </label>
                  <Input
                    placeholder="Enter blog title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                    disabled={isSubmitting}
                    className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                {/* Video Link (optional) */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Video Link (optional)
                  </label>
                  <Input
                    placeholder="https://..."
                    value={formData.video_link}
                    onChange={(e) =>
                      setFormData({ ...formData, video_link: e.target.value })
                    }
                    disabled={isSubmitting}
                    className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Status
                  </label>
                  <Select
                    value={formData.status}
                    onValueChange={(val) =>
                      setFormData({ ...formData, status: val })
                    }
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

              {/* Content */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Content *
                </label>
                <Textarea
                  rows={8}
                  placeholder="Write your blog content here..."
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  required
                  disabled={isSubmitting}
                  className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Featured Image
                </label>
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
                Are you sure you want to delete "{deleteTarget?.name}"? This
                action cannot be undone.
                {deleteTarget?.type === "blog" &&
                  " The associated image will also be removed."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleCancelDelete}
                disabled={isSubmitting}
              >
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
  );
}
