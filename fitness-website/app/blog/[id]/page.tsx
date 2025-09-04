"use client";

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { API_CONFIG } from "@/config/api"
import { Calendar, User, Eye, Heart, MessageCircle, Clock, AlertCircle } from "lucide-react"
import { formatDateUTC } from "@/utils/format"

interface BlogPost {
  id: string
  title: string
  content: string
  excerpt: string
  featuredImage?: string
  author: string
  authorRole?: string
  categoryName?: string
  tags: string[]
  views: number
  likes: number
  comments: number
  readTime: string
  createdAt: string
}

export default function SingleBlogPage() {
  const { id } = useParams()
  const [blog, setBlog] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const fetchBlog = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(API_CONFIG.USER_BLOG_API.getById(id as string))
        if (!response.ok) throw new Error("Failed to fetch blog")

        const data = await response.json()
        setBlog(data)
      } catch (err) {
        console.error("Error fetching blog:", err)
        setError(err instanceof Error ? err.message : "Something went wrong")
      } finally {
        setLoading(false)
      }
    }

    fetchBlog()
  }, [id])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <Skeleton className="h-10 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/3 mb-6" />
        <Skeleton className="h-64 w-full mb-6" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-5/6 mb-2" />
        <Skeleton className="h-6 w-4/6" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-lg font-semibold">{error}</p>
        <Button className="mt-4" onClick={() => location.reload()}>
          Try Again
        </Button>
      </div>
    )
  }

  if (!blog) return null

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* Blog header */}
      <Card className="border-0 shadow-lg">
        {blog.featuredImage && (
          <img
            src={blog.featuredImage.startsWith("http") ? blog.featuredImage : `${API_CONFIG.BASE_URL}${blog.featuredImage}`}
            alt={blog.title}
            className="w-full h-96 object-cover rounded-t-lg"
          />
        )}
        <CardHeader>
          <h1 className="text-4xl font-bold">{blog.title}</h1>
          <div className="flex gap-4 text-muted-foreground mt-2">
            <span className="flex items-center gap-1 text-sm">
              <User className="h-4 w-4" /> {blog.author} 
            </span>
            <span className="flex items-center gap-1 text-sm">
              <Calendar className="h-4 w-4" /> {formatDateUTC(blog.createdAt)}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" /> {blog.views}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-4 w-4" /> {blog.likes}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" /> {blog.comments}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" /> {blog.readTime}
            </span>
          </div>

          {/* Blog content */}
          <article
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {blog.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
