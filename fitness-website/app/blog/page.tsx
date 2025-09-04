"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { API_CONFIG } from "@/config/api"
import Link from "next/link"
import {
  Calendar,
  Clock,
  User,
  Search,
  ArrowRight,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  TrendingUp,
  Star,
  BookOpen,
  AlertCircle,
} from "lucide-react"
import { formatNumber, formatDateUTC, timeOrEpoch, hashPercent } from "@/utils/format"

interface BlogPost {
  id: string
  title: string
  content: string
  excerpt: string
  featuredImage?: string
  author: string
  authorRole?: string
  categoryId: string
  categoryName?: string
  tags: string[]
  status: "draft" | "published"
  views: number
  likes: number
  comments: number
  readTime: string
  difficulty?: string
  featured: boolean
  rating?: number
  estimatedCalories?: string
  createdAt: string
  updatedAt: string
}

export default function BlogPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("latest")
  const [searchLoading, setSearchLoading] = useState(false)

  // Fetch all blogs
  const fetchBlogs = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(API_CONFIG.USER_BLOG_API.getAll)
      if (!response.ok) throw new Error("Failed to fetch blogs")
      const data = await response.json()

      console.log("API Response:", data) // Debug log

      // Handle different API response formats
      let blogsArray: BlogPost[] = []

      if (Array.isArray(data)) {
        blogsArray = data
      } else if (data && Array.isArray(data.blogs)) {
        blogsArray = data.blogs
      } else if (data && Array.isArray(data.data)) {
        blogsArray = data.data
      } else if (data && typeof data === "object") {
        // If it's an object, try to find an array property
        const possibleArrays = Object.values(data).filter(Array.isArray)
        if (possibleArrays.length > 0) {
          blogsArray = possibleArrays[0] as BlogPost[]
        }
      }

      // Ensure we have an array and filter only published blogs
      if (Array.isArray(blogsArray)) {
        const publishedBlogs = blogsArray.filter((blog: any) => blog && (blog.status === "published" || !blog.status))
        setBlogs(publishedBlogs)
      } else {
        throw new Error("Invalid data format received from API")
      }
    } catch (err) {
      console.error("Fetch error:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch blogs")
    } finally {
      setLoading(false)
    }
  }

  // Search blogs
  const searchBlogs = async (query: string) => {
    if (!query.trim()) {
      fetchBlogs()
      return
    }

    try {
      setSearchLoading(true)
      const response = await fetch(API_CONFIG.USER_BLOG_API.search, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      })

      if (!response.ok) throw new Error("Search failed")
      const data = await response.json()

      console.log("Search Response:", data) // Debug log

      // Handle different API response formats for search
      let blogsArray: BlogPost[] = []

      if (Array.isArray(data)) {
        blogsArray = data
      } else if (data && Array.isArray(data.blogs)) {
        blogsArray = data.blogs
      } else if (data && Array.isArray(data.data)) {
        blogsArray = data.data
      } else if (data && typeof data === "object") {
        const possibleArrays = Object.values(data).filter(Array.isArray)
        if (possibleArrays.length > 0) {
          blogsArray = possibleArrays[0] as BlogPost[]
        }
      }

      if (Array.isArray(blogsArray)) {
        const publishedBlogs = blogsArray.filter((blog: any) => blog && (blog.status === "published" || !blog.status))
        setBlogs(publishedBlogs)
      } else {
        // Fallback to client-side search if API search fails
        const filtered = blogs.filter(
          (blog) =>
            blog.title.toLowerCase().includes(query.toLowerCase()) ||
            blog.excerpt.toLowerCase().includes(query.toLowerCase()) ||
            (blog.tags && blog.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))),
        )
        setBlogs(filtered)
      }
    } catch (err) {
      console.error("Search failed:", err)
      // Fallback to client-side search
      const filtered = blogs.filter(
        (blog) =>
          blog.title.toLowerCase().includes(query.toLowerCase()) ||
          blog.excerpt.toLowerCase().includes(query.toLowerCase()) ||
          (blog.tags && blog.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))),
      )
      setBlogs(filtered)
    } finally {
      setSearchLoading(false)
    }
  }

  useEffect(() => {
    fetchBlogs()
  }, [])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm) {
        searchBlogs(searchTerm)
      } else {
        fetchBlogs()
      }
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [searchTerm])

  // Extract unique categories from blogs
  const getUniqueCategories = () => {
    const categoryMap = new Map()

    blogs.forEach((blog) => {
      if (blog.categoryName) {
        if (categoryMap.has(blog.categoryName)) {
          categoryMap.set(blog.categoryName, categoryMap.get(blog.categoryName) + 1)
        } else {
          categoryMap.set(blog.categoryName, 1)
        }
      }
    })

    const categories = Array.from(categoryMap.entries()).map(([name, count], index) => ({
      name,
      count,
      color: getCategoryColor(index),
    }))

    return [{ name: "All", count: blogs.length, color: "bg-blue-500" }, ...categories]
  }

  // Generate consistent colors for categories
  const getCategoryColor = (index: number) => {
    const colors = [
      "bg-red-500",
      "bg-green-500",
      "bg-orange-500",
      "bg-purple-500",
      "bg-yellow-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
      "bg-cyan-500",
      "bg-lime-500",
    ]
    return colors[index % colors.length]
  }

  // Generate trending topics from blog data
  const getTrendingTopics = () => {
    const tagCounts = new Map()

    blogs.forEach((blog) => {
      if (blog.tags && Array.isArray(blog.tags)) {
        blog.tags.forEach((tag) => {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
        })
      }
    })

    return Array.from(tagCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
      .map(([name, posts], index) => ({
        name,
        posts,
        trend: `+${hashPercent(String(name))}%`,
      }))
  }

  // Filter and sort blogs
  const filteredBlogs = blogs.filter((blog) => {
    const matchesCategory = selectedCategory === "All" || blog.categoryName === selectedCategory
    return matchesCategory
  })

  const sortedBlogs = [...filteredBlogs].sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return (b.views || 0) - (a.views || 0)
      case "rating":
        return (b.rating || 0) - (a.rating || 0)
      case "comments":
        return (b.comments || 0) - (a.comments || 0)
      default:
        return (
          timeOrEpoch(b.createdAt || b.updatedAt) -
          timeOrEpoch(a.createdAt || a.updatedAt)
        )
    }
  })

  const featuredPost = sortedBlogs.find((blog) => blog.featured)
  const regularPosts = sortedBlogs.filter((blog) => !blog.featured)

  const categoryStats = getUniqueCategories()
  const trendingTopics = getTrendingTopics()

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "Advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return formatDateUTC(dateString)
    } catch {
      return "Recent"
    }
  }

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return null
    return imagePath.startsWith("http") ? imagePath : `${API_CONFIG.BASE_URL}${imagePath}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        {/* Hero Skeleton */}
        <section className="relative py-24 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Skeleton className="h-8 w-64 mx-auto mb-6" />
            <Skeleton className="h-16 w-96 mx-auto mb-6" />
            <Skeleton className="h-6 w-full max-w-3xl mx-auto mb-8" />
          </div>
        </section>

        {/* Search and Filters Skeleton */}
        <section className="py-8 bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <Skeleton className="h-12 w-full max-w-md" />
              </div>
              <div className="flex gap-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-20" />
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-24" />
              ))}
            </div>
          </div>
        </section>

        {/* Content Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 space-y-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="border-0 shadow-lg">
                  <div className="md:flex">
                    <Skeleton className="md:w-1/3 h-64" />
                    <div className="md:w-2/3 p-6 space-y-4">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <div className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <Card className="border-0 shadow-lg max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Error Loading Blogs</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={fetchBlogs} className="bg-primary hover:bg-primary/90">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Dynamic Hero Section */}
      <section className="relative py-24 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/5 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Fitness Knowledge Hub</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold mb-6 text-foreground">
            Expert Fitness
            <span className="text-primary block lg:inline"> Insights</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Discover evidence-based fitness strategies, nutrition science, and wellness tips from certified
            professionals
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span>{formatNumber(blogs.length)}+ Expert Articles</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>Certified Trainers</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4" />
              <span>4.8 Average Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Search and Filters */}
      <section className="py-8 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search articles, tags, or topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-base border-2 focus:border-primary"
                  disabled={searchLoading}
                />
                {searchLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground">Sort by:</span>
              <div className="flex gap-2">
                {[
                  { value: "latest", label: "Latest" },
                  { value: "popular", label: "Popular" },
                  { value: "rating", label: "Top Rated" },
                  { value: "comments", label: "Most Discussed" },
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={sortBy === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSortBy(option.value)}
                    className="rounded-full"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-3 mt-6">
            {categoryStats.map((category) => (
              <Button
                key={category.name}
                variant={selectedCategory === category.name ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.name)}
                className={`rounded-full transition-all duration-200 hover:scale-105 ${
                  selectedCategory === category.name ? "shadow-lg" : ""
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${category.color} mr-2`}></div>
                {category.name} ({formatNumber(category.count)})
              </Button>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Featured Post - Highly Detailed */}
            {featuredPost && selectedCategory === "All" && (
              <div className="mb-12">
                <div className="flex items-center gap-2 mb-6">
                  <Star className="h-5 w-5 text-yellow-500 fill-current" />
                  <span className="text-lg font-semibold text-foreground">Featured Article</span>
                </div>
                <Card className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden group">
                  <div className="relative">
                    <div className="h-80 bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/10 flex items-center justify-center relative overflow-hidden">
                      {featuredPost.featuredImage ? (
                        <img
                          src={getImageUrl(featuredPost.featuredImage) || ""}
                          alt={featuredPost.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <BookOpen className="h-20 w-20 text-primary/60 group-hover:scale-110 transition-transform duration-300" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      <Badge className="absolute top-4 left-4 bg-red-500 text-white">Featured</Badge>
                      {featuredPost.difficulty && (
                        <Badge className={`absolute top-4 right-4 ${getDifficultyColor(featuredPost.difficulty)}`}>
                          {featuredPost.difficulty}
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-8">
                      <div className="flex items-center gap-2 mb-4">
                        <Badge variant="outline" className="text-sm px-3 py-1">
                          {featuredPost.categoryName || "General"}
                        </Badge>
                        {featuredPost.rating && (
                          <div className="flex items-center gap-1 text-yellow-500">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="text-sm font-medium">{featuredPost.rating}</span>
                          </div>
                        )}
                      </div>

                      <h2 className="text-3xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors">
                        {featuredPost.title}
                      </h2>

                      <p className="text-lg text-muted-foreground mb-6 leading-relaxed">{featuredPost.excerpt}</p>

                      {/* Tags */}
                      {featuredPost.tags && featuredPost.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                          {featuredPost.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs hover:bg-primary hover:text-white cursor-pointer transition-colors"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Author Info */}
                      <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{featuredPost.author}</p>
                          <p className="text-sm text-muted-foreground">
                            {featuredPost.authorRole || "Content Creator"}
                          </p>
                        </div>
                      </div>

                      {/* Stats and Meta */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <Eye className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                          <p className="text-sm font-semibold text-blue-600">
                            {formatNumber(featuredPost.views || 0)}
                          </p>
                          <p className="text-xs text-blue-500">Views</p>
                        </div>
                        <div className="text-center p-3 bg-red-50 rounded-lg">
                          <Heart className="h-5 w-5 text-red-600 mx-auto mb-1" />
                          <p className="text-sm font-semibold text-red-600">{featuredPost.likes || 0}</p>
                          <p className="text-xs text-red-500">Likes</p>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <MessageCircle className="h-5 w-5 text-green-600 mx-auto mb-1" />
                          <p className="text-sm font-semibold text-green-600">{featuredPost.comments || 0}</p>
                          <p className="text-xs text-green-500">Comments</p>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <Clock className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                          <p className="text-sm font-semibold text-purple-600">{featuredPost.readTime || "5 min"}</p>
                          <p className="text-xs text-purple-500">Read Time</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(featuredPost.createdAt)}
                          </div>
                          {featuredPost.estimatedCalories && (
                            <div className="text-primary font-medium">{featuredPost.estimatedCalories}</div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                          </Button>
                          <Link href={`/blog/${featuredPost.id}`}>
                            <Button size="lg" className="bg-primary hover:bg-primary/90 group">
                              Read Full Article
                              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </div>
            )}

            {/* Regular Posts - Enhanced Cards */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">
                  {selectedCategory === "All" ? "Latest Articles" : `${selectedCategory} Articles`}
                </h2>
                <span className="text-muted-foreground">
                  {regularPosts.length} article{regularPosts.length !== 1 ? "s" : ""} found
                </span>
              </div>

              <div className="grid gap-6">
                {regularPosts.map((post) => (
                  <Link key={post.id} href={`/blog/${post.id}`}>
                    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group bg-white cursor-pointer">
                      <div className="md:flex">
                        <div className="md:w-1/3">
                          <div className="h-64 md:h-full bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/10 flex items-center justify-center relative">
                            {post.featuredImage ? (
                              <img
                                src={getImageUrl(post.featuredImage) || ""}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <BookOpen className="h-12 w-12 text-primary/60 group-hover:scale-110 transition-transform duration-300" />
                            )}
                            {post.difficulty && (
                              <Badge className={`absolute top-3 left-3 ${getDifficultyColor(post.difficulty)}`}>
                                {post.difficulty}
                              </Badge>
                            )}
                            {post.rating && (
                              <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                <span className="text-xs font-medium">{post.rating}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="md:w-2/3 p-6">
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="outline" className="text-xs">
                              {post.categoryName || "General"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">•</span>
                            {post.estimatedCalories && (
                              <span className="text-xs text-primary font-medium">{post.estimatedCalories}</span>
                            )}
                          </div>

                          <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors line-clamp-2">
                            {post.title}
                          </h3>

                          <p className="text-muted-foreground mb-4 line-clamp-3 leading-relaxed">{post.excerpt}</p>

                          {/* Tags */}
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-4">
                              {post.tags.slice(0, 3).map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="text-xs hover:bg-primary hover:text-white cursor-pointer transition-colors"
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {post.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{post.tags.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}

                          {/* Author and Stats */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                                <User className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground">{post.author}</p>
                                <p className="text-xs text-muted-foreground">{post.authorRole || "Content Creator"}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {formatNumber(post.views || 0)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Heart className="h-3 w-3" />
                                {post.likes || 0}
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageCircle className="h-3 w-3" />
                                {post.comments || 0}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(post.createdAt)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {post.readTime || "5 min"}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={(e) => e.preventDefault()}>
                                <Heart className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={(e) => e.preventDefault()}>
                                <Share2 className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" className="group bg-transparent">
                                Read More
                                <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            {filteredBlogs.length === 0 && (
              <div className="text-center py-20">
                <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-xl text-muted-foreground mb-2">No articles found</p>
                <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Trending Topics */}
            {trendingTopics.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <h3 className="font-bold text-foreground">Trending Topics</h3>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {trendingTopics.map((topic) => (
                    <div
                      key={topic.name}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                    >
                      <div>
                        <p className="font-medium text-foreground">{topic.name}</p>
                        <p className="text-sm text-muted-foreground">{formatNumber(topic.posts)} articles</p>
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        {topic.trend}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Newsletter Signup */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardHeader>
                <h3 className="font-bold text-foreground">Stay Updated</h3>
                <p className="text-sm text-muted-foreground">Get expert fitness tips delivered weekly</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="Enter your email" type="email" className="border-2 focus:border-primary" />
                <Button className="w-full bg-primary hover:bg-primary/90">Subscribe to Newsletter</Button>
                <p className="text-xs text-muted-foreground text-center">
                  Join 10,000+ fitness enthusiasts. Unsubscribe anytime.
                </p>
              </CardContent>
            </Card>

            {/* Popular Articles */}
            {blogs.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    <h3 className="font-bold text-foreground">Most Popular</h3>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {blogs
                    .sort((a, b) => (b.views || 0) - (a.views || 0))
                    .slice(0, 4)
                    .map((post, index) => (
                      <Link key={post.id} href={`/blog/${post.id}`}>
                        <div className="flex gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                          <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm text-foreground line-clamp-2 mb-1">{post.title}</h4>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Eye className="h-3 w-3" />
                              <span>{formatNumber(post.views || 0)} views</span>
                              <span>•</span>
                              <span>{post.readTime || "5 min"}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
