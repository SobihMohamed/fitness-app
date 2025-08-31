// "use client"

// import { useState, useEffect } from "react"
// import { useParams, useRouter } from "next/navigation"
// import { Card, CardContent } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import { Skeleton } from "@/components/ui/skeleton"
// import { API_CONFIG } from "@/config/api"
// import Link from "next/link"
// import {
//   Calendar,
//   Clock,
//   User,
//   ArrowLeft,
//   Eye,
//   Heart,
//   MessageCircle,
//   Share2,
//   Star,
//   BookOpen,
//   AlertCircle,
//   Tag,
//   Facebook,
//   Twitter,
//   Linkedin,
//   Copy,
//   TrendingUp,
// } from "lucide-react"

// interface BlogPost {
//   id: string
//   title: string
//   content: string
//   excerpt: string
//   featuredImage?: string
//   author: string
//   authorRole?: string
//   categoryId: string
//   categoryName?: string
//   tags: string[]
//   status: "draft" | "published"
//   views: number
//   likes: number
//   comments: number
//   readTime: string
//   difficulty?: string
//   featured: boolean
//   rating?: number
//   estimatedCalories?: string
//   createdAt: string
//   updatedAt: string
// }

// export default function SingleBlogPage() {
//   const params = useParams()
//   const router = useRouter()
//   const [blog, setBlog] = useState<BlogPost | null>(null)
//   const [relatedBlogs, setRelatedBlogs] = useState<BlogPost[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)
//   const [liked, setLiked] = useState(false)
//   const [shareMenuOpen, setShareMenuOpen] = useState(false)

//   const fetchBlog = async () => {
//     try {
//       setLoading(true)
//       const response = await fetch(API_CONFIG.USER_BLOG_API.getById(params.id as string))
//       if (!response.ok) {
//         if (response.status === 404) {
//           throw new Error("Blog post not found")
//         }
//         throw new Error("Failed to fetch blog")
//       }
//       const data = await response.json()

//       if (data.status !== "published") {
//         throw new Error("Blog post is not published")
//       }

//       setBlog(data)

//       // Fetch related blogs (same category)
//       if (data.categoryName) {
//         fetchRelatedBlogs(data.categoryName, data.id)
//       }
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Failed to fetch blog")
//     } finally {
//       setLoading(false)
//     }
//   }

//   const fetchRelatedBlogs = async (categoryName: string, currentBlogId: string) => {
//     try {
//       const response = await fetch(API_CONFIG.USER_BLOG_API.getAll)
//       if (!response.ok) return

//       const data = await response.json()
//       const related = data
//         .filter((b: BlogPost) => b.status === "published" && b.categoryName === categoryName && b.id !== currentBlogId)
//         .slice(0, 3)

//       setRelatedBlogs(related)
//     } catch (err) {
//       console.error("Failed to fetch related blogs:", err)
//     }
//   }

//   useEffect(() => {
//     if (params.id) {
//       fetchBlog()
//     }
//   }, [params.id])

//   const getDifficultyColor = (difficulty: string) => {
//     switch (difficulty) {
//       case "Beginner":
//         return "bg-green-100 text-green-800"
//       case "Intermediate":
//         return "bg-yellow-100 text-yellow-800"
//       case "Advanced":
//         return "bg-red-100 text-red-800"
//       default:
//         return "bg-gray-100 text-gray-800"
//     }
//   }

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     })
//   }

//   const getImageUrl = (imagePath?: string) => {
//     if (!imagePath) return null
//     return imagePath.startsWith("http") ? imagePath : `${API_CONFIG.BASE_URL}${imagePath}`
//   }

//   const handleLike = () => {
//     setLiked(!liked)
//     // Here you would typically make an API call to update the like count
//   }

//   const handleShare = (platform: string) => {
//     const url = window.location.href
//     const title = blog?.title || ""

//     switch (platform) {
//       case "facebook":
//         window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank")
//         break
//       case "twitter":
//         window.open(
//           `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
//           "_blank",
//         )
//         break
//       case "linkedin":
//         window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank")
//         break
//       case "copy":
//         navigator.clipboard.writeText(url)
//         // You could show a toast notification here
//         break
//     }
//     setShareMenuOpen(false)
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
//         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//           <Skeleton className="h-8 w-32 mb-8" />
//           <Skeleton className="h-64 w-full mb-8 rounded-lg" />
//           <Skeleton className="h-12 w-3/4 mb-4" />
//           <Skeleton className="h-6 w-full mb-2" />
//           <Skeleton className="h-6 w-full mb-2" />
//           <Skeleton className="h-6 w-2/3 mb-8" />
//           <div className="space-y-4">
//             {[...Array(5)].map((_, i) => (
//               <Skeleton key={i} className="h-4 w-full" />
//             ))}
//           </div>
//         </div>
//       </div>
//     )
//   }

//   if (error || !blog) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
//         <Card className="border-0 shadow-lg max-w-md mx-auto">
//           <CardContent className="p-8 text-center">
//             <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
//             <h2 className="text-2xl font-bold text-foreground mb-2">Blog Not Found</h2>
//             <p className="text-muted-foreground mb-6">{error || "The blog post you're looking for doesn't exist."}</p>
//             <div className="flex gap-3 justify-center">
//               <Button variant="outline" onClick={() => router.back()}>
//                 <ArrowLeft className="h-4 w-4 mr-2" />
//                 Go Back
//               </Button>
//               <Link href="/blog">
//                 <Button className="bg-primary hover:bg-primary/90">View All Blogs</Button>
//               </Link>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
//       {/* Header */}
//       <div className="bg-white border-b shadow-sm">
//         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//           <Link href="/blog">
//             <Button variant="ghost" className="mb-4">
//               <ArrowLeft className="h-4 w-4 mr-2" />
//               Back to Blog
//             </Button>
//           </Link>
//         </div>
//       </div>

//       {/* Main Content */}
//       <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//         {/* Featured Image */}
//         {blog.featuredImage && (
//           <div className="mb-8">
//             <img
//               src={getImageUrl(blog.featuredImage) || ""}
//               alt={blog.title}
//               className="w-full h-96 object-cover rounded-lg shadow-lg"
//             />
//           </div>
//         )}

//         {/* Article Header */}
//         <header className="mb-8">
//           <div className="flex flex-wrap items-center gap-3 mb-4">
//             <Badge variant="outline" className="text-sm px-3 py-1">
//               {blog.categoryName}
//             </Badge>
//             {blog.difficulty && <Badge className={getDifficultyColor(blog.difficulty)}>{blog.difficulty}</Badge>}
//             {blog.featured && <Badge className="bg-red-500 text-white">Featured</Badge>}
//             {blog.rating && (
//               <div className="flex items-center gap-1 text-yellow-500">
//                 <Star className="h-4 w-4 fill-current" />
//                 <span className="text-sm font-medium">{blog.rating}</span>
//               </div>
//             )}
//           </div>

//           <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">{blog.title}</h1>

//           <p className="text-xl text-muted-foreground mb-6 leading-relaxed">{blog.excerpt}</p>

//           {/* Author and Meta Info */}
//           <div className="flex flex-wrap items-center justify-between gap-4 p-6 bg-gray-50 rounded-lg">
//             <div className="flex items-center gap-4">
//               <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
//                 <User className="h-6 w-6 text-white" />
//               </div>
//               <div>
//                 <p className="font-semibold text-foreground">{blog.author}</p>
//                 <p className="text-sm text-muted-foreground">{blog.authorRole || "Content Creator"}</p>
//               </div>
//             </div>

//             <div className="flex items-center gap-6 text-sm text-muted-foreground">
//               <div className="flex items-center gap-1">
//                 <Calendar className="h-4 w-4" />
//                 {formatDate(blog.createdAt)}
//               </div>
//               <div className="flex items-center gap-1">
//                 <Clock className="h-4 w-4" />
//                 {blog.readTime}
//               </div>
//               <div className="flex items-center gap-1">
//                 <Eye className="h-4 w-4" />
//                 {blog.views.toLocaleString()} views
//               </div>
//             </div>
//           </div>
//         </header>

//         {/* Tags */}
//         {blog.tags.length > 0 && (
//           <div className="mb-8">
//             <div className="flex items-center gap-2 mb-3">
//               <Tag className="h-4 w-4 text-muted-foreground" />
//               <span className="text-sm font-medium text-muted-foreground">Tags:</span>
//             </div>
//             <div className="flex flex-wrap gap-2">
//               {blog.tags.map((tag) => (
//                 <Badge
//                   key={tag}
//                   variant="secondary"
//                   className="text-sm hover:bg-primary hover:text-white cursor-pointer transition-colors"
//                 >
//                   {tag}
//                 </Badge>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Article Content */}
//         <div className="prose prose-lg max-w-none mb-12">
//           <div className="text-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: blog.content }} />
//         </div>

//         {/* Estimated Calories */}
//         {blog.estimatedCalories && (
//           <div className="mb-8 p-4 bg-primary/5 rounded-lg border border-primary/20">
//             <div className="flex items-center gap-2 text-primary font-medium">
//               <TrendingUp className="h-5 w-5" />
//               <span>Estimated Impact: {blog.estimatedCalories}</span>
//             </div>
//           </div>
//         )}

//         {/* Engagement Actions */}
//         <div className="flex items-center justify-between py-6 border-t border-b border-gray-200 mb-12">
//           <div className="flex items-center gap-6">
//             <Button variant={liked ? "default" : "outline"} onClick={handleLike} className="flex items-center gap-2">
//               <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
//               <span>{blog.likes + (liked ? 1 : 0)}</span>
//             </Button>

//             <div className="flex items-center gap-1 text-muted-foreground">
//               <MessageCircle className="h-4 w-4" />
//               <span>{blog.comments} comments</span>
//             </div>
//           </div>

//           <div className="relative">
//             <Button
//               variant="outline"
//               onClick={() => setShareMenuOpen(!shareMenuOpen)}
//               className="flex items-center gap-2"
//             >
//               <Share2 className="h-4 w-4" />
//               Share
//             </Button>

//             {shareMenuOpen && (
//               <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10">
//                 <div className="flex flex-col gap-1 min-w-[150px]">
//                   <Button variant="ghost" size="sm" onClick={() => handleShare("facebook")} className="justify-start">
//                     <Facebook className="h-4 w-4 mr-2" />
//                     Facebook
//                   </Button>
//                   <Button variant="ghost" size="sm" onClick={() => handleShare("twitter")} className="justify-start">
//                     <Twitter className="h-4 w-4 mr-2" />
//                     Twitter
//                   </Button>
//                   <Button variant="ghost" size="sm" onClick={() => handleShare("linkedin")} className="justify-start">
//                     <Linkedin className="h-4 w-4 mr-2" />
//                     LinkedIn
//                   </Button>
//                   <Button variant="ghost" size="sm" onClick={() => handleShare("copy")} className="justify-start">
//                     <Copy className="h-4 w-4 mr-2" />
//                     Copy Link
//                   </Button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Related Articles */}
//         {relatedBlogs.length > 0 && (
//           <section>
//             <h2 className="text-2xl font-bold text-foreground mb-6">Related Articles</h2>
//             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {relatedBlogs.map((relatedBlog) => (
//                 <Link key={relatedBlog.id} href={`/blog/${relatedBlog.id}`}>
//                   <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
//                     <div className="h-48 bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/10 flex items-center justify-center relative">
//                       {relatedBlog.featuredImage ? (
//                         <img
//                           src={getImageUrl(relatedBlog.featuredImage) || ""}
//                           alt={relatedBlog.title}
//                           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
//                         />
//                       ) : (
//                         <BookOpen className="h-8 w-8 text-primary/60 group-hover:scale-110 transition-transform duration-300" />
//                       )}
//                     </div>
//                     <CardContent className="p-4">
//                       <Badge variant="outline" className="text-xs mb-2">
//                         {relatedBlog.categoryName}
//                       </Badge>
//                       <h3 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
//                         {relatedBlog.title}
//                       </h3>
//                       <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{relatedBlog.excerpt}</p>
//                       <div className="flex items-center justify-between text-xs text-muted-foreground">
//                         <div className="flex items-center gap-1">
//                           <Clock className="h-3 w-3" />
//                           {relatedBlog.readTime}
//                         </div>
//                         <div className="flex items-center gap-1">
//                           <Eye className="h-3 w-3" />
//                           {relatedBlog.views.toLocaleString()}
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 </Link>
//               ))}
//             </div>
//           </section>
//         )}
//       </article>
//     </div>
//   )
// }
// /////////

// // "use client";

// // import React, { useEffect, useState } from "react";
// // import axios from "axios";
// // import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// // import { Input } from "@/components/ui/input";
// // import { Button } from "@/components/ui/button";

// // const USER_BLOG_API = {
// //   getAll: "http://localhost:8000/Blogs/getAll",
// //   getById: (id: string) => `http://localhost:8000/Blogs/singleBlog/${id}`,
// //   search: "http://localhost:8000/Blogs/searchBlog",
// // };

// // interface Blog {
// //   id: string;
// //   title: string;
// //   content: string;
// // }

// // export default function BlogsPage() {
// //   const [blogs, setBlogs] = useState<Blog[]>([]);
// //   const [loading, setLoading] = useState(true);
// //   const [searchQuery, setSearchQuery] = useState("");
// //   const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);

// //   // Fetch all blogs
// //   const fetchAllBlogs = async () => {
// //     try {
// //       const response = await axios.get(USER_BLOG_API.getAll);

// //       const data = Array.isArray(response.data)
// //         ? response.data
// //         : response.data.data;

// //       setBlogs(data || []);
// //     } catch (error) {
// //       console.error("Error fetching blogs:", error);
// //       setBlogs([]);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // Search blogs
// //   const handleSearch = async () => {
// //     if (!searchQuery.trim()) {
// //       fetchAllBlogs();
// //       return;
// //     }

// //     try {
// //       const response = await axios.post(USER_BLOG_API.search, {
// //         query: searchQuery,
// //       });

// //       const data = Array.isArray(response.data)
// //         ? response.data
// //         : response.data.data;

// //       setBlogs(data || []);
// //     } catch (error) {
// //       console.error("Error searching blogs:", error);
// //     }
// //   };

// //   // View single blog
// //   const viewSingleBlog = async (id: string) => {
// //     try {
// //       const response = await axios.get(USER_BLOG_API.getById(id));

// //       const blog = response.data.data || response.data;
// //       setSelectedBlog(blog);
// //     } catch (error) {
// //       console.error("Error fetching single blog:", error);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchAllBlogs();
// //   }, []);

// //   if (loading) {
// //     return <p className="text-center">Loading blogs...</p>;
// //   }

// //   return (
// //     <div className="p-6">
// //       {/* Search bar */}
// //       <div className="flex gap-2 mb-6">
// //         <Input
// //           type="text"
// //           placeholder="Search blogs..."
// //           value={searchQuery}
// //           onChange={(e) => setSearchQuery(e.target.value)}
// //         />
// //         <Button onClick={handleSearch}>Search</Button>
// //       </div>

// //       {/* Single blog view */}
// //       {selectedBlog ? (
// //         <div className="mb-6 p-6 border rounded-xl shadow-md">
// //           <h2 className="text-xl font-bold mb-2">{selectedBlog.title}</h2>
// //           <p>{selectedBlog.content}</p>
// //           <Button className="mt-4" onClick={() => setSelectedBlog(null)}>
// //             Back to all blogs
// //           </Button>
// //         </div>
// //       ) : null}

// //       {/* Blog list */}
// //       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
// //         {blogs.length > 0 ? (
// //           blogs.map((blog, index) => (
// //             <Card
// //               key={index}
// //               className="shadow-md border rounded-2xl cursor-pointer hover:shadow-lg transition"
// //               onClick={() => viewSingleBlog(blog.id)}
// //             >
// //               <CardHeader>
// //                 <CardTitle>{blog.title}</CardTitle>
// //               </CardHeader>
// //               <CardContent>
// //                 <p>{blog.content?.slice(0, 100)}...</p>
// //               </CardContent>
// //             </Card>
// //           ))
// //         ) : (
// //           <p className="text-center col-span-full">No blogs found</p>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { API_CONFIG } from "@/config/api"
import Link from "next/link"
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Star,
  BookOpen,
  AlertCircle,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  ChevronRight,
} from "lucide-react"

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

export default function BlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const [blog, setBlog] = useState<BlogPost | null>(null)
  const [relatedBlogs, setRelatedBlogs] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [liked, setLiked] = useState(false)
  const [shareMenuOpen, setShareMenuOpen] = useState(false)

  const blogId = params.id as string

  // Fetch single blog post
  const fetchBlog = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(API_CONFIG.USER_BLOG_API.getById(blogId))
      if (!response.ok) throw new Error("Failed to fetch blog post")
      const data = await response.json()

      console.log("Single Blog Response:", data) // Debug log

      // Handle different API response formats
      let blogData: BlogPost | null = null

      if (data && typeof data === "object") {
        if (data.id) {
          blogData = data
        } else if (data.blog && data.blog.id) {
          blogData = data.blog
        } else if (data.data && data.data.id) {
          blogData = data.data
        }
      }

      if (blogData && (blogData.status === "published" || !blogData.status)) {
        setBlog(blogData)
        // Fetch related blogs from the same category
        fetchRelatedBlogs(blogData.categoryId || blogData.categoryName)
      } else {
        throw new Error("Blog post not found or not published")
      }
    } catch (err) {
      console.error("Fetch error:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch blog post")
    } finally {
      setLoading(false)
    }
  }

  // Fetch related blogs
  const fetchRelatedBlogs = async (categoryId?: string) => {
    try {
      const response = await fetch(API_CONFIG.USER_BLOG_API.getAll)
      if (!response.ok) return
      const data = await response.json()

      // Handle different API response formats
      let blogsArray: BlogPost[] = []

      if (Array.isArray(data)) {
        blogsArray = data
      } else if (data && Array.isArray(data.blogs)) {
        blogsArray = data.blogs
      } else if (data && Array.isArray(data.data)) {
        blogsArray = data.data
      }

      if (Array.isArray(blogsArray)) {
        const related = blogsArray
          .filter(
            (b: BlogPost) =>
              b.id !== blogId &&
              (b.status === "published" || !b.status) &&
              (b.categoryId === categoryId || b.categoryName === categoryId),
          )
          .slice(0, 3)
        setRelatedBlogs(related)
      }
    } catch (err) {
      console.error("Failed to fetch related blogs:", err)
    }
  }

  useEffect(() => {
    if (blogId) {
      fetchBlog()
    }
  }, [blogId])

  const handleLike = () => {
    setLiked(!liked)
    // Here you would typically make an API call to update the like count
  }

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
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-64 w-full mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <Card className="border-0 shadow-lg max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Blog Post Not Found</h2>
            <p className="text-muted-foreground mb-6">{error || "The blog post you're looking for doesn't exist."}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => router.back()} variant="outline">
                Go Back
              </Button>
              <Link href="/blog">
                <Button className="bg-primary hover:bg-primary/90">Browse All Blogs</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/blog" className="hover:text-primary transition-colors">
              Blog
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium truncate">{blog.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.back()} className="mb-8 hover:bg-primary/10">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog
        </Button>

        {/* Article Header */}
        <article className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Featured Image */}
          <div className="relative h-96 bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/10 flex items-center justify-center">
            {blog.featuredImage ? (
              <img
                src={getImageUrl(blog.featuredImage) || ""}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <BookOpen className="h-24 w-24 text-primary/60" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

            {/* Badges */}
            <div className="absolute top-6 left-6 flex gap-2">
              <Badge variant="secondary" className="bg-white/90 text-foreground">
                {blog.categoryName || "General"}
              </Badge>
              {blog.difficulty && <Badge className={getDifficultyColor(blog.difficulty)}>{blog.difficulty}</Badge>}
            </div>

            {blog.rating && (
              <div className="absolute top-6 right-6 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium">{blog.rating}</span>
              </div>
            )}
          </div>

          {/* Article Content */}
          <div className="p-8 lg:p-12">
            {/* Title and Meta */}
            <div className="mb-8">
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">{blog.title}</h1>

              <p className="text-xl text-muted-foreground mb-6 leading-relaxed">{blog.excerpt}</p>

              {/* Author and Meta Info */}
              <div className="flex flex-wrap items-center gap-6 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{blog.author}</p>
                    <p className="text-sm text-muted-foreground">{blog.authorRole || "Content Creator"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(blog.createdAt)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {blog.readTime || "5 min read"}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {(blog.views || 0).toLocaleString()} views
                  </div>
                </div>
              </div>

              {/* Tags */}
              {blog.tags && blog.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {blog.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="hover:bg-primary hover:text-white cursor-pointer transition-colors"
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Eye className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-lg font-semibold text-blue-600">{(blog.views || 0).toLocaleString()}</p>
                  <p className="text-xs text-blue-500">Views</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <Heart className="h-6 w-6 text-red-600 mx-auto mb-2" />
                  <p className="text-lg font-semibold text-red-600">{blog.likes || 0}</p>
                  <p className="text-xs text-red-500">Likes</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <MessageCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-lg font-semibold text-green-600">{blog.comments || 0}</p>
                  <p className="text-xs text-green-500">Comments</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Star className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-lg font-semibold text-purple-600">{blog.rating || "N/A"}</p>
                  <p className="text-xs text-purple-500">Rating</p>
                </div>
              </div>
            </div>

            {/* Article Content */}
            <div className="prose prose-lg max-w-none mb-12">
              <div className="text-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: blog.content }} />
            </div>

            {/* Estimated Calories */}
            {blog.estimatedCalories && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-primary mb-2">Workout Information</h3>
                <p className="text-foreground">{blog.estimatedCalories}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between border-t border-b py-6 mb-8">
              <div className="flex items-center gap-4">
                <Button
                  variant={liked ? "default" : "outline"}
                  onClick={handleLike}
                  className={liked ? "bg-red-500 hover:bg-red-600" : ""}
                >
                  <Heart className={`h-4 w-4 mr-2 ${liked ? "fill-current" : ""}`} />
                  {liked ? "Liked" : "Like"} ({blog.likes || 0})
                </Button>

                <div className="relative">
                  <Button variant="outline" onClick={() => setShareMenuOpen(!shareMenuOpen)}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>

                  {shareMenuOpen && (
                    <div className="absolute top-full left-0 mt-2 bg-white border rounded-lg shadow-lg p-2 z-10">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare("facebook")}
                        className="w-full justify-start"
                      >
                        <Facebook className="h-4 w-4 mr-2" />
                        Facebook
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare("twitter")}
                        className="w-full justify-start"
                      >
                        <Twitter className="h-4 w-4 mr-2" />
                        Twitter
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare("linkedin")}
                        className="w-full justify-start"
                      >
                        <Linkedin className="h-4 w-4 mr-2" />
                        LinkedIn
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare("copy")}
                        className="w-full justify-start"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Link
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <Button variant="outline" onClick={() => window.print()}>
                Print Article
              </Button>
            </div>

            {/* Author Bio */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-4">About the Author</h3>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">{blog.author}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{blog.authorRole || "Content Creator"}</p>
                  <p className="text-sm text-muted-foreground">
                    Passionate about fitness and helping others achieve their health goals through evidence-based
                    content and practical advice.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Related Articles */}
        {relatedBlogs.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-foreground mb-8">Related Articles</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedBlogs.map((relatedBlog) => (
                <Link key={relatedBlog.id} href={`/blog/${relatedBlog.id}`}>
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer">
                    <div className="h-48 bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/10 flex items-center justify-center relative">
                      {relatedBlog.featuredImage ? (
                        <img
                          src={getImageUrl(relatedBlog.featuredImage) || ""}
                          alt={relatedBlog.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <BookOpen className="h-8 w-8 text-primary/60" />
                      )}
                      {relatedBlog.rating && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="text-xs font-medium">{relatedBlog.rating}</span>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <Badge variant="outline" className="text-xs mb-2">
                        {relatedBlog.categoryName || "General"}
                      </Badge>
                      <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {relatedBlog.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{relatedBlog.excerpt}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{relatedBlog.readTime || "5 min read"}</span>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {(relatedBlog.views || 0).toLocaleString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
