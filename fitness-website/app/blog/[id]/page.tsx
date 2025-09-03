

"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { API_CONFIG } from "@/config/api"

export default function SingleBlogPage() {
  const { id } = useParams()
  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { USER_BLOG_API } = API_CONFIG

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(USER_BLOG_API.getById(id as string))
        if (!res.ok) throw new Error("Failed to fetch blog")
        const data = await res.json()
        setPost(data)
      } catch (err) {
        console.error("Error fetching blog:", err)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchPost()
  }, [id])

  if (loading) return <div className="p-8">Loading...</div>

  if (!post) return <div className="p-8">Post not found</div>

  return (
    <div className="p-8">
      <Card className="border-0 shadow-lg rounded-2xl">
        <CardContent className="p-6 space-y-4">
          <h1 className="text-3xl font-bold">{post.title}</h1>
          {post.category && (
            <Badge variant="secondary" className="mb-4">
              {post.category}
            </Badge>
          )}
          <p className="text-gray-600 text-sm">
            {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ""}
          </p>
          <div className="prose max-w-none">{post.content}</div>
        </CardContent>
      </Card>
    </div>
  )
}

