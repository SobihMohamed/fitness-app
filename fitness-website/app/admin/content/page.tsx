"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AdminLayout } from "@/components/admin/admin-layout"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Search, Filter, Eye, Calendar } from "lucide-react"

const initialPosts = [
  {
    id: 1,
    title: "10 Best Exercises for Beginners",
    category: "Workouts",
    status: "published",
    author: "Sarah Johnson",
    publishDate: "2024-01-15",
    views: 1250,
    excerpt: "Start your fitness journey with these beginner-friendly exercises...",
  },
  {
    id: 2,
    title: "Nutrition Guide for Muscle Building",
    category: "Nutrition",
    status: "published",
    author: "Mike Chen",
    publishDate: "2024-01-12",
    views: 890,
    excerpt: "Learn the essential nutrition principles for building muscle...",
  },
  {
    id: 3,
    title: "The Benefits of HIIT Training",
    category: "Cardio",
    status: "draft",
    author: "Emily Davis",
    publishDate: "",
    views: 0,
    excerpt: "Discover why High-Intensity Interval Training is so effective...",
  },
  {
    id: 4,
    title: "Recovery and Rest Day Importance",
    category: "Recovery",
    status: "published",
    author: "David Wilson",
    publishDate: "2024-01-10",
    views: 567,
    excerpt: "Understanding why rest days are crucial for your fitness progress...",
  },
]

export default function ContentManagement() {
  const [posts, setPosts] = useState(initialPosts)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    status: "draft",
    excerpt: "",
    content: "",
  })

  const categories = ["Workouts", "Nutrition", "Cardio", "Recovery", "Equipment"]
  const statuses = ["draft", "published", "archived"]

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory
    const matchesStatus = selectedStatus === "all" || post.status === selectedStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingPost) {
      // Update existing post
      setPosts(
        posts.map((p) =>
          p.id === editingPost.id
            ? {
                ...p,
                ...formData,
                publishDate:
                  formData.status === "published" && !p.publishDate
                    ? new Date().toISOString().split("T")[0]
                    : p.publishDate,
              }
            : p,
        ),
      )
      setEditingPost(null)
    } else {
      // Add new post
      const newPost = {
        id: Math.max(...posts.map((p) => p.id)) + 1,
        ...formData,
        author: "Admin User",
        publishDate: formData.status === "published" ? new Date().toISOString().split("T")[0] : "",
        views: 0,
      }
      setPosts([...posts, newPost])
    }

    setFormData({
      title: "",
      category: "",
      status: "draft",
      excerpt: "",
      content: "",
    })
    setIsAddDialogOpen(false)
  }

  const handleEdit = (post: any) => {
    setEditingPost(post)
    setFormData({
      title: post.title,
      category: post.category,
      status: post.status,
      excerpt: post.excerpt,
      content: post.content || "",
    })
    setIsAddDialogOpen(true)
  }

  const handleDelete = (id: number) => {
    setPosts(posts.filter((p) => p.id !== id))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "#32CD32"
      case "draft":
        return "#007BFF"
      case "archived":
        return "#6C757D"
      default:
        return "#6C757D"
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: "#212529" }}>
              Content Management
            </h1>
            <p style={{ color: "#6C757D" }}>Manage blog posts and website content</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button style={{ backgroundColor: "#007BFF" }}>
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPost ? "Edit Post" : "Create New Post"}</DialogTitle>
                <DialogDescription>
                  {editingPost ? "Update your blog post" : "Create a new blog post for your website"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Post Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    rows={2}
                    placeholder="Brief description of the post..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={10}
                    placeholder="Write your blog post content here..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddDialogOpen(false)
                      setEditingPost(null)
                      setFormData({
                        title: "",
                        category: "",
                        status: "draft",
                        excerpt: "",
                        content: "",
                      })
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" style={{ backgroundColor: "#007BFF" }}>
                    {editingPost ? "Update Post" : "Create Post"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="bg-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                  style={{ color: "#6C757D" }}
                />
                <Input
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Posts Table */}
        <Card className="bg-white border-0 shadow-lg">
          <CardHeader>
            <CardTitle style={{ color: "#212529" }}>Blog Posts ({filteredPosts.length})</CardTitle>
            <CardDescription style={{ color: "#6C757D" }}>Manage your blog content</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium" style={{ color: "#212529" }}>
                          {post.title}
                        </p>
                        <p className="text-sm" style={{ color: "#6C757D" }}>
                          {post.excerpt}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{post.category}</Badge>
                    </TableCell>
                    <TableCell style={{ color: "#6C757D" }}>{post.author}</TableCell>
                    <TableCell>
                      <Badge
                        style={{
                          backgroundColor: getStatusColor(post.status),
                          color: "#FFFFFF",
                        }}
                      >
                        {post.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {post.publishDate ? (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" style={{ color: "#6C757D" }} />
                          <span className="text-sm" style={{ color: "#6C757D" }}>
                            {post.publishDate}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm" style={{ color: "#6C757D" }}>
                          Not published
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" style={{ color: "#6C757D" }} />
                        <span className="text-sm" style={{ color: "#6C757D" }}>
                          {post.views}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(post)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(post.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
