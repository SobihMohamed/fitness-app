"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { API_CONFIG } from "@/config/api"
import axios from "axios"
import Link from "next/link"
import { Calendar, Clock, User, ArrowLeft, Eye, Heart, Share2, Star, BookOpen, AlertCircle, ChevronRight, TrendingUp } from "lucide-react"
import { formatNumber, formatDateUTC } from "@/utils/format"

interface BlogPost {
  id: string
  title: string
  content: string
  excerpt: string
  featuredImage?: string
  author: string
  authorRole?: string
  categoryId?: string
  categoryName?: string
  tags?: string[]
  status?: "draft" | "published"
  views?: number
  likes?: number
  comments?: number
  readTime?: string
  difficulty?: string
  featured?: boolean
  rating?: number
  estimatedCalories?: string
  createdAt?: string
  updatedAt?: string
}

export default function BlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const [blog, setBlog] = useState<BlogPost | null>(null)
  const [relatedBlogs, setRelatedBlogs] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [liked, setLiked] = useState(false)
  const [shareMenuOpen, setShareMenuOpen] = useState(false)

  const API = API_CONFIG
  const blogId = (params?.id as string) || ""

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return null
    let p = String(imagePath).replace(/\\/g, "/")
    p = p.replace(/^\/?public\//i, "/")
    if (/^https?:\/\//i.test(p)) return p
    const rel = p.startsWith("/") ? p : `/${p}`
    const base = API.BASE_URL.replace(/\/$/, "")
    return `${base}${rel}`
  }

  const formatDate = (dateString?: string) => {
    try {
      return dateString ? formatDateUTC(dateString) : "Recent"
    } catch {
      return "Recent"
    }
  }

  const normalizeBlog = (raw: any): BlogPost => ({
    id: String(raw.blog_id ?? raw.id ?? raw._id ?? ""),
    title: raw.title ?? "Untitled",
    content: raw.content ?? raw.body ?? "",
    excerpt: raw.excerpt ?? raw.summary ?? "",
    featuredImage: raw.main_image ?? raw.featuredImage ?? raw.image ?? raw.thumbnail,
    author: raw.author ?? raw.authorName ?? "Unknown Author",
    authorRole: raw.authorRole ?? raw.role,
    categoryId: raw.categoryId ?? raw.category_id ?? raw.catId,
    categoryName: raw.categoryName ?? raw.category_name ?? raw.category ?? raw.categoryTitle,
    tags: raw.tags ?? [],
    status: raw.status ?? "published",
    views: raw.views ?? 0,
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    readTime: raw.readTime ?? raw.read_time ?? "5 min read",
    difficulty: raw.difficulty ?? raw.level,
    featured: raw.featured ?? false,
    rating: raw.rating,
    estimatedCalories: raw.estimatedCalories ?? raw.calories,
    createdAt: raw.createdAt ?? raw.created_at ?? raw.publishedAt,
    updatedAt: raw.updatedAt ?? raw.updated_at,
  })

  const fetchRelatedBlogs = async (categoryKey?: string) => {
    try {
      const resp = await axios.get(API.USER_BLOG_API.getAll)
      const payload = resp.data
      const arr = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.blogs)
        ? payload.blogs
        : Array.isArray(payload?.data)
        ? payload.data
        : []
      const related = arr
        .filter((b: any) => String(b.blog_id ?? b.id ?? b._id) !== String(blogId))
        .filter((b: any) => (b.status ?? "published") === "published")
        .filter(
          (b: any) =>
            String(b.category_id ?? b.categoryId ?? b.catId) === String(categoryKey) ||
            (b.category_name ?? b.categoryName ?? b.category ?? b.categoryTitle) === categoryKey,
        )
        .slice(0, 3)
        .map(normalizeBlog)
      setRelatedBlogs(related)
    } catch {
      // ignore
    }
  }

  const fetchBlog = async () => {
    // If blogId isn't available yet, do nothing and wait
    if (!blogId || blogId === "undefined" || blogId === "null") {
      return
    }
    try {
      setLoading(true)
      setError(null)
      const url = API.USER_BLOG_API.getById(blogId)
      const response = await axios.get(url)
      const data = response.data
      const raw = data?.Blog ?? data?.blog ?? data?.data ?? data
      if (!raw) throw new Error("Blog not found")
      const normalized = normalizeBlog(raw)
      if (normalized.status === "published" || !normalized.status) {
        setBlog(normalized)
        fetchRelatedBlogs(normalized.categoryId ?? normalized.categoryName)
      } else {
        throw new Error("Blog is not published")
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to fetch blog post")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!blogId || blogId === "undefined" || blogId === "null") return
    fetchBlog()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blogId])

  const handleShare = (platform: string) => {
    const url = window.location.href
    const title = blog?.title || "Check out this blog post"
    switch (platform) {
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank")
        break
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
          "_blank",
        )
        break
      case "linkedin":
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank")
        break
      case "copy":
        navigator.clipboard.writeText(url)
        alert("Link copied to clipboard!")
        break
    }
    setShareMenuOpen(false)
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-64 w-full mb-8 rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
        <Card className="shadow-lg max-w-md mx-auto border border-gray-200">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Blog Post Not Found</h2>
            <p className="text-gray-600 mb-4">{error || "The blog post you're looking for doesn't exist."}</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => router.back()} variant="outline" className="border-gray-300">
                Go Back
              </Button>
              <Link href="/blog">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">Browse All Blogs</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-8 text-gray-600 hover:text-blue-600 hover:bg-blue-50 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog
        </Button>

        <article className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
          <div className="relative h-80 bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
            {blog.featuredImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={getImageUrl(blog.featuredImage) || ""} alt={blog.title} className="w-full h-full object-cover" />
            ) : (
              <div className="text-center">
                <BookOpen className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Featured Article</p>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

            <div className="absolute top-6 left-6 flex gap-2">
              <Badge className="bg-blue-600 text-white border-0 font-medium">{blog.categoryName || "General"}</Badge>
              {blog.difficulty && <Badge variant="outline">{blog.difficulty}</Badge>}
            </div>

            {blog.rating && (
              <div className="absolute top-6 right-6 flex items-center gap-1 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 border border-gray-200">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="text-sm font-semibold text-gray-900">{blog.rating}</span>
              </div>
            )}
          </div>

          <div className="p-8 lg:p-12">
            <div className="mb-8">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">{blog.title}</h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">{blog.excerpt}</p>
              <div className="flex flex-wrap items-center gap-6 mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-green-600 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{blog.author}</p>
                    <p className="text-sm text-gray-600">{blog.authorRole || "Fitness Expert"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">{formatDate(blog.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-green-600" />
                    <span className="font-medium">{blog.readTime || "5 min read"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Eye className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{formatNumber(blog.views || 0)} views</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="prose prose-lg max-w-none mb-12 text-gray-800 leading-relaxed">
              <div dangerouslySetInnerHTML={{ __html: blog.content }} />
            </div>

            {blog.estimatedCalories && (
              <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6 mb-8">
                <p className="text-gray-700 font-medium">{blog.estimatedCalories}</p>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-b border-gray-200 py-6 mb-8">
              <div className="flex items-center gap-4">
                <Button
                  variant={liked ? "default" : "outline"}
                  onClick={() => setLiked((v) => !v)}
                  className={liked ? "bg-red-500 hover:bg-red-600 text-white border-0" : "border-gray-300"}
                >
                  <Heart className={`h-4 w-4 mr-2 ${liked ? "fill-current" : ""}`} />
                  {liked ? "Liked" : "Like"} ({blog.likes || 0})
                </Button>
                <div className="relative">
                  <Button
                    variant="outline"
                    onClick={() => setShareMenuOpen(!shareMenuOpen)}
                    className="border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  {shareMenuOpen && (
                    <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10 min-w-[160px]">
                      <Button variant="ghost" size="sm" onClick={() => handleShare("facebook")} className="w-full justify-start text-gray-700 hover:bg-blue-50 hover:text-blue-600">Facebook</Button>
                      <Button variant="ghost" size="sm" onClick={() => handleShare("twitter")} className="w-full justify-start text-gray-700 hover:bg-blue-50 hover:text-blue-600">Twitter</Button>
                      <Button variant="ghost" size="sm" onClick={() => handleShare("linkedin")} className="w-full justify-start text-gray-700 hover:bg-blue-50 hover:text-blue-600">LinkedIn</Button>
                      <Button variant="ghost" size="sm" onClick={() => handleShare("copy")} className="w-full justify-start text-gray-700 hover:bg-blue-50 hover:text-blue-600">Copy Link</Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
  )
}

