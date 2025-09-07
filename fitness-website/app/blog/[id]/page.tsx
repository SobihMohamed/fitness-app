// "use client"

// import { useState, useEffect } from "react"
// import { useParams, useRouter } from "next/navigation"
// import { Card, CardContent } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import { Skeleton } from "@/components/ui/skeleton"
// import { API_CONFIG } from "@/config/api"
// import axios from "axios"
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
//   Facebook,
//   Twitter,
//   Linkedin,
//   Copy,
//   ChevronRight,
//   Dumbbell,
//   Target,
//   TrendingUp,
// } from "lucide-react"
// import { formatNumber, formatDateUTC } from "@/utils/format"

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

// export default function BlogPostPage() {
//   const params = useParams()
//   const router = useRouter()
//   const [blog, setBlog] = useState<BlogPost | null>(null)
//   const [relatedBlogs, setRelatedBlogs] = useState<BlogPost[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)
//   const [liked, setLiked] = useState(false)
//   const [shareMenuOpen, setShareMenuOpen] = useState(false)

//   const API =  API_CONFIG
//   // const blogId = Array.isArray(params.id) ? params.id[0] : params.id
//   const blogId = params?.id as string


//   console.log("Raw params:", params)
//   console.log("Extracted blogId:", blogId)

//   // Fetch single blog post
//   const fetchBlog = async () => {
//     // Check if blogId is valid
//     if (!blogId || blogId === "undefined" || blogId === "null") {
//       setError("Invalid blog ID")
//       setLoading(false)
//       return
//     }

//     try {
//       setLoading(true)
//       setError(null)

//       // Debug: Log the API URL being called
//       const apiUrl = API.USER_BLOG_API.getById(blogId)
//       console.log("Fetching blog from URL:", apiUrl)
//       console.log("Blog ID:", blogId)

//       const response = await axios.get(apiUrl)

//       // Debug: Log response status
//       console.log("Response status:", response.status)
//       console.log("Response data:", response.data)

//       const data = response.data

//       // Handle different API response formats
//       let blogData: BlogPost | null = null

//       // Try different possible response structures
//       if (data && typeof data === "object") {
//         // Direct blog object
//         if (data.id || data._id) {
//           blogData = {
//             id: data.id || data._id,
//             title: data.title || "Untitled",
//             content: data.content || data.body || "",
//             excerpt: data.excerpt || data.summary || "",
//             featuredImage: data.featuredImage || data.image || data.thumbnail,
//             author: data.author || data.authorName || "Unknown Author",
//             authorRole: data.authorRole || data.role,
//             categoryId: data.categoryId || data.category_id || data.catId,
//             categoryName: data.categoryName || data.category || data.categoryTitle,
//             tags: data.tags || [],
//             status: data.status || "published",
//             views: data.views || 0,
//             likes: data.likes || 0,
//             comments: data.comments || 0,
//             readTime: data.readTime || data.read_time || "5 min read",
//             difficulty: data.difficulty || data.level,
//             featured: data.featured || false,
//             rating: data.rating,
//             estimatedCalories: data.estimatedCalories || data.calories,
//             createdAt: data.createdAt || data.created_at || data.publishedAt || new Date().toISOString(),
//             updatedAt: data.updatedAt || data.updated_at || new Date().toISOString(),
//           }
//         }
//         // Nested in blog property
//         else if (data.blog && (data.blog.id || data.blog._id)) {
//           const blogObj = data.blog
//           blogData = {
//             id: blogObj.id || blogObj._id,
//             title: blogObj.title || "Untitled",
//             content: blogObj.content || blogObj.body || "",
//             excerpt: blogObj.excerpt || blogObj.summary || "",
//             featuredImage: blogObj.featuredImage || blogObj.image || blogObj.thumbnail,
//             author: blogObj.author || blogObj.authorName || "Unknown Author",
//             authorRole: blogObj.authorRole || blogObj.role,
//             categoryId: blogObj.categoryId || blogObj.category_id || blogObj.catId,
//             categoryName: blogObj.categoryName || blogObj.category || blogObj.categoryTitle,
//             tags: blogObj.tags || [],
//             status: blogObj.status || "published",
//             views: blogObj.views || 0,
//             likes: blogObj.likes || 0,
//             comments: blogObj.comments || 0,
//             readTime: blogObj.readTime || blogObj.read_time || "5 min read",
//             difficulty: blogObj.difficulty || blogObj.level,
//             featured: blogObj.featured || false,
//             rating: blogObj.rating,
//             estimatedCalories: blogObj.estimatedCalories || blogObj.calories,
//             createdAt: blogObj.createdAt || blogObj.created_at || blogObj.publishedAt || new Date().toISOString(),
//             updatedAt: blogObj.updatedAt || blogObj.updated_at || new Date().toISOString(),
//           }
//         }
//         // Nested in data property
//         else if (data.data && (data.data.id || data.data._id)) {
//           const blogObj = data.data
//           blogData = {
//             id: blogObj.id || blogObj._id,
//             title: blogObj.title || "Untitled",
//             content: blogObj.content || blogObj.body || "",
//             excerpt: blogObj.excerpt || blogObj.summary || "",
//             featuredImage: blogObj.featuredImage || blogObj.image || blogObj.thumbnail,
//             author: blogObj.author || blogObj.authorName || "Unknown Author",
//             authorRole: blogObj.authorRole || blogObj.role,
//             categoryId: blogObj.categoryId || blogObj.category_id || blogObj.catId,
//             categoryName: blogObj.categoryName || blogObj.category || blogObj.categoryTitle,
//             tags: blogObj.tags || [],
//             status: blogObj.status || "published",
//             views: blogObj.views || 0,
//             likes: blogObj.likes || 0,
//             comments: blogObj.comments || 0,
//             readTime: blogObj.readTime || blogObj.read_time || "5 min read",
//             difficulty: blogObj.difficulty || blogObj.level,
//             featured: blogObj.featured || false,
//             rating: blogObj.rating,
//             estimatedCalories: blogObj.estimatedCalories || blogObj.calories,
//             createdAt: blogObj.createdAt || blogObj.created_at || blogObj.publishedAt || new Date().toISOString(),
//             updatedAt: blogObj.updatedAt || blogObj.updated_at || new Date().toISOString(),
//           }
//         }
//         // Check if the response indicates success but no data
//         else if (data.status === "success" && data.blog === null) {
//           throw new Error("Blog post not found in database")
//         }
//       }

//       console.log("Processed blog data:", blogData)

//       if (blogData && (blogData.status === "published" || !blogData.status)) {
//         setBlog(blogData)
//         // Fetch related blogs from the same category
//         fetchRelatedBlogs(blogData.categoryId || blogData.categoryName)
//       } else {
//         throw new Error("Blog post not found, not published, or invalid data structure")
//       }
//     } catch (err) {
//       console.error("Fetch error:", err)
//       if (axios.isAxiosError(err)) {
//         setError(err.response?.data?.message || err.message || "Failed to fetch blog post")
//       } else {
//         setError(err instanceof Error ? err.message : "Failed to fetch blog post")
//       }
//     } finally {
//       setLoading(false)
//     }
//   }

//   // Fetch related blogs
//   const fetchRelatedBlogs = async (categoryId?: string) => {
//     try {
//       console.log("Fetching related blogs for category:", categoryId)
//       const response = await axios.get(API.USER_BLOG_API.getAll)
//       const data = response.data

//       console.log("All blogs response:", data)

//       // Handle different API response formats
//       let blogsArray: any[] = []

//       if (Array.isArray(data)) {
//         blogsArray = data
//       } else if (data && Array.isArray(data.blogs)) {
//         blogsArray = data.blogs
//       } else if (data && Array.isArray(data.data)) {
//         blogsArray = data.data
//       }

//       if (Array.isArray(blogsArray)) {
//         const related = blogsArray
//           .filter(
//             (b: any) =>
//               (b.id || b._id) !== blogId &&
//               (b.status === "published" || !b.status) &&
//               ((b.categoryId || b.category_id || b.catId) === categoryId ||
//                 (b.categoryName || b.category || b.categoryTitle) === categoryId),
//           )
//           .slice(0, 3)
//           .map((b: any) => ({
//             id: b.id || b._id,
//             title: b.title || "Untitled",
//             content: b.content || b.body || "",
//             excerpt: b.excerpt || b.summary || "",
//             featuredImage: b.featuredImage || b.image || b.thumbnail,
//             author: b.author || b.authorName || "Unknown Author",
//             authorRole: b.authorRole || b.role,
//             categoryId: b.categoryId || b.category_id || b.catId,
//             categoryName: b.categoryName || b.category || b.categoryTitle,
//             tags: b.tags || [],
//             status: b.status || "published",
//             views: b.views || 0,
//             likes: b.likes || 0,
//             comments: b.comments || 0,
//             readTime: b.readTime || b.read_time || "5 min read",
//             difficulty: b.difficulty || b.level,
//             featured: b.featured || false,
//             rating: b.rating,
//             estimatedCalories: b.estimatedCalories || b.calories,
//             createdAt: b.createdAt || b.created_at || b.publishedAt || new Date().toISOString(),
//             updatedAt: b.updatedAt || b.updated_at || new Date().toISOString(),
//           }))

//         console.log("Related blogs found:", related)
//         setRelatedBlogs(related)
//       }
//     } catch (err) {
//       console.error("Failed to fetch related blogs:", err)
//     }
//   }

//   useEffect(() => {
//     console.log("Component mounted with blogId:", blogId)
//     console.log("Params object:", params)

//     if (blogId && blogId !== "undefined" && blogId !== "null") {
//       fetchBlog()
//     } else {
//       setError("No blog ID provided")
//       setLoading(false)
//     }
//   }, [blogId])

//   const handleLike = () => {
//     setLiked(!liked)
//     // Here you would typically make an API call to update the like count
//   }

//   const handleShare = (platform: string) => {
//     const url = window.location.href
//     const title = blog?.title || "Check out this blog post"

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
//         alert("Link copied to clipboard!")
//         break
//     }
//     setShareMenuOpen(false)
//   }

//   const getDifficultyColor = (difficulty: string) => {
//     switch (difficulty) {
//       case "Beginner":
//         return "bg-green-100 text-green-700 border-green-200"
//       case "Intermediate":
//         return "bg-blue-100 text-blue-700 border-blue-200"
//       case "Advanced":
//         return "bg-red-100 text-red-700 border-red-200"
//       default:
//         return "bg-gray-100 text-gray-700 border-gray-200"
//     }
//   }

//   const formatDate = (dateString: string) => {
//     try {
//       return formatDateUTC(dateString)
//     } catch {
//       return "Recent"
//     }
//   }

//   const getImageUrl = (imagePath?: string) => {
//     if (!imagePath) return null
//     return imagePath.startsWith("http") ? imagePath : `${API.BASE_URL}${imagePath}`
//   }

//   // Show error immediately if no blog ID
//   if (!blogId || blogId === "undefined" || blogId === "null") {
//     return (
//       <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
//         <Card className="shadow-lg max-w-md mx-auto border border-gray-200">
//           <CardContent className="p-8 text-center">
//             <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
//             <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Blog URL</h2>
//             <p className="text-gray-600 mb-4">The blog URL is missing or invalid.</p>
//             <div className="text-sm text-gray-500 mb-6">
//               <p>URL Parameters: {JSON.stringify(params)}</p>
//               <p>Extracted ID: {blogId || "undefined"}</p>
//             </div>
//             <div className="flex gap-3 justify-center">
//               <Button onClick={() => router.back()} variant="outline" className="border-gray-300">
//                 Go Back
//               </Button>
//               <Link href="/blog">
//                 <Button className="bg-blue-600 hover:bg-blue-700 text-white">Browse All Blogs</Button>
//               </Link>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     )
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-white pt-20">
//         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//           <Skeleton className="h-8 w-32 mb-6" />
//           <Skeleton className="h-12 w-3/4 mb-4" />
//           <Skeleton className="h-6 w-1/2 mb-8" />
//           <Skeleton className="h-64 w-full mb-8 rounded-lg" />
//           <div className="space-y-4">
//             <Skeleton className="h-4 w-full" />
//             <Skeleton className="h-4 w-full" />
//             <Skeleton className="h-4 w-3/4" />
//           </div>
//         </div>
//       </div>
//     )
//   }

//   if (error || !blog) {
//     return (
//       <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
//         <Card className="shadow-lg max-w-md mx-auto border border-gray-200">
//           <CardContent className="p-8 text-center">
//             <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
//             <h2 className="text-2xl font-bold text-gray-900 mb-2">Blog Post Not Found</h2>
//             <p className="text-gray-600 mb-4">{error || "The blog post you're looking for doesn't exist."}</p>
//             <div className="text-sm text-gray-500 mb-6">
//               <p>Blog ID: {blogId}</p>
//               <p>URL: {typeof window !== "undefined" ? window.location.href : "N/A"}</p>
//               <p>Check the console for more details</p>
//             </div>
//             <div className="flex gap-3 justify-center">
//               <Button onClick={() => router.back()} variant="outline" className="border-gray-300">
//                 Go Back
//               </Button>
//               <Link href="/blog">
//                 <Button className="bg-blue-600 hover:bg-blue-700 text-white">Browse All Blogs</Button>
//               </Link>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-white pt-20">
//       {/* Breadcrumb Navigation */}
//       <div className="bg-gray-50 border-b border-gray-200">
//         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
//           <nav className="flex items-center gap-2 text-sm text-gray-600">
//             <Link href="/" className="hover:text-blue-600 transition-colors font-medium">
//               Home
//             </Link>
//             <ChevronRight className="h-4 w-4 text-gray-400" />
//             <Link href="/blog" className="hover:text-blue-600 transition-colors font-medium">
//               Blog
//             </Link>
//             <ChevronRight className="h-4 w-4 text-gray-400" />
//             <span className="text-gray-900 font-medium truncate">{blog.title}</span>
//           </nav>
//         </div>
//       </div>

//       <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Back Button */}
//         <Button
//           variant="ghost"
//           onClick={() => router.back()}
//           className="mb-8 text-gray-600 hover:text-blue-600 hover:bg-blue-50 -ml-2"
//         >
//           <ArrowLeft className="h-4 w-4 mr-2" />
//           Back to Blog
//         </Button>

//         {/* Article Header */}
//         <article className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
//           {/* Featured Image */}
//           <div className="relative h-80 bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
//             {blog.featuredImage ? (
//               <img
//                 src={getImageUrl(blog.featuredImage) || ""}
//                 alt={blog.title}
//                 className="w-full h-full object-cover"
//               />
//             ) : (
//               <div className="text-center">
//                 <BookOpen className="h-16 w-16 text-blue-400 mx-auto mb-4" />
//                 <p className="text-gray-500 font-medium">Featured Article</p>
//               </div>
//             )}
//             <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

//             {/* Badges */}
//             <div className="absolute top-6 left-6 flex gap-2">
//               <Badge className="bg-blue-600 text-white border-0 font-medium">{blog.categoryName || "General"}</Badge>
//               {blog.difficulty && (
//                 <Badge className={`${getDifficultyColor(blog.difficulty)} border font-medium`}>{blog.difficulty}</Badge>
//               )}
//             </div>

//             {blog.rating && (
//               <div className="absolute top-6 right-6 flex items-center gap-1 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 border border-gray-200">
//                 <Star className="h-4 w-4 text-yellow-500 fill-current" />
//                 <span className="text-sm font-semibold text-gray-900">{blog.rating}</span>
//                 <span className="text-sm font-semibold text-gray-900">{blog.rating}</span>
//               </div>
//             )}
//           </div>

//           {/* Article Content */}
//           <div className="p-8 lg:p-12">
//             {/* Title and Meta */}
//             <div className="mb-8">
//               <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">{blog.title}</h1>

//               <p className="text-xl text-gray-600 mb-8 leading-relaxed">{blog.excerpt}</p>

//               {/* Author and Meta Info */}
//               <div className="flex flex-wrap items-center gap-6 mb-6 pb-6 border-b border-gray-200">
//                 <div className="flex items-center gap-3">
//                   <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-green-600 rounded-full flex items-center justify-center">
//                     <User className="h-6 w-6 text-white" />
//                   </div>
//                   <div>
//                     <p className="font-semibold text-gray-900">{blog.author}</p>
//                     <p className="text-sm text-gray-600">{blog.authorRole || "Fitness Expert"}</p>
//                   </div>
//                 </div>

//                 <div className="flex items-center gap-6 text-sm text-gray-600">
//                   <div className="flex items-center gap-1.5">
//                     <Calendar className="h-4 w-4 text-blue-600" />
//                     <span className="font-medium">{formatDate(blog.createdAt)}</span>
//                   </div>
//                   <div className="flex items-center gap-1.5">
//                     <Clock className="h-4 w-4 text-green-600" />
//                     <span className="font-medium">{blog.readTime || "5 min read"}</span>
//                   </div>
//                   <div className="flex items-center gap-1.5">
//                     <Eye className="h-4 w-4 text-gray-500" />
//                     <span className="font-medium">{formatNumber(blog.views || 0)} views</span>
//                   </div>
//                 </div>
//               </div>

//               {/* Tags */}
//               {blog.tags && blog.tags.length > 0 && (
//                 <div className="flex flex-wrap gap-2 mb-8">
//                   {blog.tags.map((tag, index) => (
//                     <Badge
//                       key={index}
//                       variant="outline"
//                       className="border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 cursor-pointer transition-colors"
//                     >
//                       #{tag}
//                     </Badge>
//                   ))}
//                 </div>
//               )}

//               {/* Stats Cards */}
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
//                 <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
//                   <Eye className="h-6 w-6 text-blue-600 mx-auto mb-2" />
//                   <p className="text-lg font-bold text-blue-600">{formatNumber(blog.views || 0)}</p>
//                   <p className="text-xs text-blue-500 font-medium">Views</p>
//                 </div>
//                 <div className="text-center p-4 bg-red-50 rounded-lg border border-red-100">
//                   <Heart className="h-6 w-6 text-red-600 mx-auto mb-2" />
//                   <p className="text-lg font-bold text-red-600">{blog.likes || 0}</p>
//                   <p className="text-xs text-red-500 font-medium">Likes</p>
//                 </div>
//                 <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
//                   <MessageCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
//                   <p className="text-lg font-bold text-green-600">{blog.comments || 0}</p>
//                   <p className="text-xs text-green-500 font-medium">Comments</p>
//                 </div>
//                 <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-100">
//                   <Star className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
//                   <p className="text-lg font-bold text-yellow-600">{blog.rating || "N/A"}</p>
//                   <p className="text-xs text-yellow-500 font-medium">Rating</p>
//                 </div>
//               </div>
//             </div>

//             {/* Article Content */}
//             <div className="prose prose-lg max-w-none mb-12 text-gray-800 leading-relaxed">
//               <div dangerouslySetInnerHTML={{ __html: blog.content }} />
//             </div>

//             {/* Workout Information */}
//             {blog.estimatedCalories && (
//               <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6 mb-8">
//                 <div className="flex items-center gap-3 mb-3">
//                   <Dumbbell className="h-6 w-6 text-blue-600" />
//                   <h3 className="text-lg font-bold text-gray-900">Workout Information</h3>
//                 </div>
//                 <p className="text-gray-700 font-medium">{blog.estimatedCalories}</p>
//               </div>
//             )}

//             {/* Action Buttons */}
//             <div className="flex items-center justify-between border-t border-b border-gray-200 py-6 mb-8">
//               <div className="flex items-center gap-4">
//                 <Button
//                   variant={liked ? "default" : "outline"}
//                   onClick={handleLike}
//                   className={
//                     liked
//                       ? "bg-red-500 hover:bg-red-600 text-white border-0"
//                       : "border-gray-300 text-gray-700 hover:bg-red-50 hover:border-red-300 hover:text-red-600"
//                   }
//                 >
//                   <Heart className={`h-4 w-4 mr-2 ${liked ? "fill-current" : ""}`} />
//                   {liked ? "Liked" : "Like"} ({blog.likes || 0})
//                 </Button>

//                 <div className="relative">
//                   <Button
//                     variant="outline"
//                     onClick={() => setShareMenuOpen(!shareMenuOpen)}
//                     className="border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
//                   >
//                     <Share2 className="h-4 w-4 mr-2" />
//                     Share
//                   </Button>

//                   {shareMenuOpen && (
//                     <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10 min-w-[160px]">
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         onClick={() => handleShare("facebook")}
//                         className="w-full justify-start text-gray-700 hover:bg-blue-50 hover:text-blue-600"
//                       >
//                         <Facebook className="h-4 w-4 mr-2" />
//                         Facebook
//                       </Button>
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         onClick={() => handleShare("twitter")}
//                         className="w-full justify-start text-gray-700 hover:bg-blue-50 hover:text-blue-600"
//                       >
//                         <Twitter className="h-4 w-4 mr-2" />
//                         Twitter
//                       </Button>
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         onClick={() => handleShare("linkedin")}
//                         className="w-full justify-start text-gray-700 hover:bg-blue-50 hover:text-blue-600"
//                       >
//                         <Linkedin className="h-4 w-4 mr-2" />
//                         LinkedIn
//                       </Button>
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         onClick={() => handleShare("copy")}
//                         className="w-full justify-start text-gray-700 hover:bg-blue-50 hover:text-blue-600"
//                       >
//                         <Copy className="h-4 w-4 mr-2" />
//                         Copy Link
//                       </Button>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <Button
//                 variant="outline"
//                 onClick={() => window.print()}
//                 className="border-gray-300 text-gray-700 hover:bg-gray-50"
//               >
//                 Print Article
//               </Button>
//             </div>

//             {/* Author Bio */}
//             <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
//               <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
//                 <Target className="h-5 w-5 text-blue-600" />
//                 About the Author
//               </h3>
//               <div className="flex items-start gap-4">
//                 <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
//                   <User className="h-8 w-8 text-white" />
//                 </div>
//                 <div>
//                   <h4 className="font-bold text-gray-900 mb-1">{blog.author}</h4>
//                   <p className="text-sm text-blue-600 font-medium mb-2">{blog.authorRole || "Fitness Expert"}</p>
//                   <p className="text-sm text-gray-600 leading-relaxed">
//                     Passionate about fitness and helping others achieve their health goals through evidence-based
//                     content and practical advice. Dedicated to making fitness accessible and enjoyable for everyone.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </article>

//         {/* Related Articles */}
//         {relatedBlogs.length > 0 && (
//           <div className="mt-16">
//             <div className="flex items-center gap-3 mb-8">
//               <TrendingUp className="h-6 w-6 text-blue-600" />
//               <h2 className="text-3xl font-bold text-gray-900">Related Articles</h2>
//             </div>
//             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {relatedBlogs.map((relatedBlog) => (
//                 <Link key={relatedBlog.id} href={`/blog/${relatedBlog.id}`}>
//                   <Card className="shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer border border-gray-200 bg-white">
//                     <div className="h-48 bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center relative overflow-hidden">
//                       {relatedBlog.featuredImage ? (
//                         <img
//                           src={getImageUrl(relatedBlog.featuredImage) || ""}
//                           alt={relatedBlog.title}
//                           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
//                         />
//                       ) : (
//                         <BookOpen className="h-8 w-8 text-blue-400" />
//                       )}
//                       {relatedBlog.rating && (
//                         <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 backdrop-blur-sm rounded-full px-2 py-1 border border-gray-200">
//                           <Star className="h-3 w-3 text-yellow-500 fill-current" />
//                           <span className="text-xs font-semibold text-gray-900">{relatedBlog.rating}</span>
//                         </div>
//                       )}
//                     </div>
//                     <CardContent className="p-4">
//                       <Badge className="bg-blue-100 text-blue-700 border-0 text-xs mb-2 font-medium">
//                         {relatedBlog.categoryName || "General"}
//                       </Badge>
//                       <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
//                         {relatedBlog.title}
//                       </h3>
//                       <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">{relatedBlog.excerpt}</p>
//                       <div className="flex items-center justify-between text-xs text-gray-500">
//                         <span className="font-medium">{relatedBlog.readTime || "5 min read"}</span>
//                         <div className="flex items-center gap-1">
//                           <Eye className="h-3 w-3" />
//                           <span className="font-medium">{formatNumber(relatedBlog.views || 0)}</span>
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 </Link>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { API_CONFIG } from "@/config/api"
import axios from "axios"
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
  Dumbbell,
  Target,
  TrendingUp,
} from "lucide-react"
import { formatNumber, formatDateUTC } from "@/utils/format"

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

  const API = API_CONFIG
  // Ensure blogId is always a string, even if params.id is an array
  const blogId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  console.log("Raw params:", params)
  console.log("Extracted blogId:", blogId)

  // Fetch single blog post
  const fetchBlog = async () => {
    // Check if blogId is valid
    if (!blogId || blogId === "undefined" || blogId === "null") {
      setError("Invalid blog ID")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Debug: Log the API URL being called
      const apiUrl = API.USER_BLOG_API.getById(blogId)
      console.log(apiUrl);
      
      console.log("Fetching blog from URL:", apiUrl)
      console.log("Blog ID:", blogId)


      const response = await axios.get(apiUrl)

      // Debug: Log response status
      console.log("Response status:", response.status)
      console.log("Response data:", response.data)

      const data = response.data

      // Handle different API response formats
      let blogData: BlogPost | null = null

      // Try different possible response structures
      if (data && typeof data === "object") {
        // Direct blog object
        if (data.id || data._id) {
          blogData = {
            id: data.id || data._id,
            title: data.title || "Untitled",
            content: data.content || data.body || "",
            excerpt: data.excerpt || data.summary || "",
            featuredImage: data.featuredImage || data.image || data.thumbnail,
            author: data.author || data.authorName || "Unknown Author",
            authorRole: data.authorRole || data.role,
            categoryId: data.categoryId || data.category_id || data.catId,
            categoryName: data.categoryName || data.category || data.categoryTitle,
            tags: data.tags || [],
            status: data.status || "published",
            views: data.views || 0,
            likes: data.likes || 0,
            comments: data.comments || 0,
            readTime: data.readTime || data.read_time || "5 min read",
            difficulty: data.difficulty || data.level,
            featured: data.featured || false,
            rating: data.rating,
            estimatedCalories: data.estimatedCalories || data.calories,
            createdAt: data.createdAt || data.created_at || data.publishedAt || new Date().toISOString(),
            updatedAt: data.updatedAt || data.updated_at || new Date().toISOString(),
          }
        }
        // Nested in blog property
        else if (data.blog && (data.blog.id || data.blog._id)) {
          const blogObj = data.blog
          blogData = {
            id: blogObj.id || blogObj._id,
            title: blogObj.title || "Untitled",
            content: blogObj.content || blogObj.body || "",
            excerpt: blogObj.excerpt || blogObj.summary || "",
            featuredImage: blogObj.featuredImage || blogObj.image || blogObj.thumbnail,
            author: blogObj.author || blogObj.authorName || "Unknown Author",
            authorRole: blogObj.authorRole || blogObj.role,
            categoryId: blogObj.categoryId || blogObj.category_id || blogObj.catId,
            categoryName: blogObj.categoryName || blogObj.category || blogObj.categoryTitle,
            tags: blogObj.tags || [],
            status: blogObj.status || "published",
            views: blogObj.views || 0,
            likes: blogObj.likes || 0,
            comments: blogObj.comments || 0,
            readTime: blogObj.readTime || blogObj.read_time || "5 min read",
            difficulty: blogObj.difficulty || blogObj.level,
            featured: blogObj.featured || false,
            rating: blogObj.rating,
            estimatedCalories: blogObj.estimatedCalories || blogObj.calories,
            createdAt: blogObj.createdAt || blogObj.created_at || blogObj.publishedAt || new Date().toISOString(),
            updatedAt: blogObj.updatedAt || blogObj.updated_at || new Date().toISOString(),
          }
        }
        // Nested in data property
        else if (data.data && (data.data.id || data.data._id)) {
          const blogObj = data.data
          blogData = {
            id: blogObj.id || blogObj._id,
            title: blogObj.title || "Untitled",
            content: blogObj.content || blogObj.body || "",
            excerpt: blogObj.excerpt || blogObj.summary || "",
            featuredImage: blogObj.featuredImage || blogObj.image || blogObj.thumbnail,
            author: blogObj.author || blogObj.authorName || "Unknown Author",
            authorRole: blogObj.authorRole || blogObj.role,
            categoryId: blogObj.categoryId || blogObj.category_id || blogObj.catId,
            categoryName: blogObj.categoryName || blogObj.category || blogObj.categoryTitle,
            tags: blogObj.tags || [],
            status: blogObj.status || "published",
            views: blogObj.views || 0,
            likes: blogObj.likes || 0,
            comments: blogObj.comments || 0,
            readTime: blogObj.readTime || blogObj.read_time || "5 min read",
            difficulty: blogObj.difficulty || blogObj.level,
            featured: blogObj.featured || false,
            rating: blogObj.rating,
            estimatedCalories: blogObj.estimatedCalories || blogObj.calories,
            createdAt: blogObj.createdAt || blogObj.created_at || blogObj.publishedAt || new Date().toISOString(),
            updatedAt: blogObj.updatedAt || blogObj.updated_at || new Date().toISOString(),
          }
        }
        // Check if the response indicates success but no data
        else if (data.status === "success" && data.blog === null) {
          throw new Error("Blog post not found in database")
        }
      }

      console.log("Processed blog data:", blogData)

      if (blogData && (blogData.status === "published" || !blogData.status)) {
        setBlog(blogData)
        // Fetch related blogs from the same category
        fetchRelatedBlogs(blogData.categoryId || blogData.categoryName)
      } else {
        throw new Error("Blog post not found, not published, or invalid data structure")
      }
    } catch (err) {
      console.error("Fetch error:", err)
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || err.message || "Failed to fetch blog post")
      } else {
        setError(err instanceof Error ? err.message : "Failed to fetch blog post")
      }
    } finally {
      setLoading(false)
    }
  }

  // Fetch related blogs
  const fetchRelatedBlogs = async (categoryId?: string) => {
    try {
      console.log("Fetching related blogs for category:", categoryId)
      const response = await axios.get(API.USER_BLOG_API.getAll)
      const data = response.data

      console.log("All blogs response:", data)

      // Handle different API response formats
      let blogsArray: any[] = []

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
            (b: any) =>
              (b.id || b._id) !== blogId &&
              (b.status === "published" || !b.status) &&
              ((b.categoryId || b.category_id || b.catId) === categoryId ||
                (b.categoryName || b.category || b.categoryTitle) === categoryId),
          )
          .slice(0, 3)
          .map((b: any) => ({
            id: b.id || b._id,
            title: b.title || "Untitled",
            content: b.content || b.body || "",
            excerpt: b.excerpt || b.summary || "",
            featuredImage: b.featuredImage || b.image || b.thumbnail,
            author: b.author || b.authorName || "Unknown Author",
            authorRole: b.authorRole || b.role,
            categoryId: b.categoryId || b.category_id || b.catId,
            categoryName: b.categoryName || b.category || b.categoryTitle,
            tags: b.tags || [],
            status: b.status || "published",
            views: b.views || 0,
            likes: b.likes || 0,
            comments: b.comments || 0,
            readTime: b.readTime || b.read_time || "5 min read",
            difficulty: b.difficulty || b.level,
            featured: b.featured || false,
            rating: b.rating,
            estimatedCalories: b.estimatedCalories || b.calories,
            createdAt: b.createdAt || b.created_at || b.publishedAt || new Date().toISOString(),
            updatedAt: b.updatedAt || b.updated_at || new Date().toISOString(),
          }))

        console.log("Related blogs found:", related)
        setRelatedBlogs(related)
      }
    } catch (err) {
      console.error("Failed to fetch related blogs:", err)
    }
  }

  useEffect(() => {
    console.log("Component mounted with blogId:", blogId)
    console.log("Params object:", params)

    if (blogId && blogId !== "undefined" && blogId !== "null") {
      fetchBlog()
    } else {
      setError("No blog ID provided")
      setLoading(false)
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
        return "bg-green-100 text-green-700 border-green-200"
      case "Intermediate":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "Advanced":
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
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
    return imagePath.startsWith("http") ? imagePath : `${API.BASE_URL}${imagePath}`
  }

  // Show error immediately if no blog ID
  if (!blogId || blogId === "undefined" || blogId === "null") {
    return (
      <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
        <Card className="shadow-lg max-w-md mx-auto border border-gray-200">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Blog URL</h2>
            <p className="text-gray-600 mb-4">The blog URL is missing or invalid.</p>
            <div className="text-sm text-gray-500 mb-6">
              <p>URL Parameters: {JSON.stringify(params)}</p>
              <p>Extracted ID: {blogId || "undefined"}</p>
            </div>
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
            <div className="text-sm text-gray-500 mb-6">
              <p>Blog ID: {blogId}</p>
              <p>URL: {typeof window !== "undefined" ? window.location.href : "N/A"}</p>
              <p>Check the console for more details</p>
            </div>
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
    <div className="min-h-screen bg-white pt-20">
      {/* Breadcrumb Navigation */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600 transition-colors font-medium">
              Home
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <Link href="/blog" className="hover:text-blue-600 transition-colors font-medium">
              Blog
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="text-gray-900 font-medium truncate">{blog.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-8 text-gray-600 hover:text-blue-600 hover:bg-blue-50 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog
        </Button>

        {/* Article Header */}
        <article className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
          {/* Featured Image */}
          <div className="relative h-80 bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
            {blog.featuredImage ? (
              <img
                src={getImageUrl(blog.featuredImage) || ""}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center">
                <BookOpen className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Featured Article</p>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

            {/* Badges */}
            <div className="absolute top-6 left-6 flex gap-2">
              <Badge className="bg-blue-600 text-white border-0 font-medium">{blog.categoryName || "General"}</Badge>
              {blog.difficulty && (
                <Badge className={`${getDifficultyColor(blog.difficulty)} border font-medium`}>{blog.difficulty}</Badge>
              )}
            </div>

            {blog.rating && (
              <div className="absolute top-6 right-6 flex items-center gap-1 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 border border-gray-200">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="text-sm font-semibold text-gray-900">{blog.rating}</span>
                <span className="text-sm font-semibold text-gray-900">{blog.rating}</span>
              </div>
            )}
          </div>

          {/* Article Content */}
          <div className="p-8 lg:p-12">
            {/* Title and Meta */}
            <div className="mb-8">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">{blog.title}</h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">{blog.excerpt}</p>

              {/* Author and Meta Info */}
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

              {/* Tags */}
              {blog.tags && blog.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {blog.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 cursor-pointer transition-colors"
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <Eye className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-lg font-bold text-blue-600">{formatNumber(blog.views || 0)}</p>
                  <p className="text-xs text-blue-500 font-medium">Views</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-100">
                  <Heart className="h-6 w-6 text-red-600 mx-auto mb-2" />
                  <p className="text-lg font-bold text-red-600">{blog.likes || 0}</p>
                  <p className="text-xs text-red-500 font-medium">Likes</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                  <MessageCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-lg font-bold text-green-600">{blog.comments || 0}</p>
                  <p className="text-xs text-green-500 font-medium">Comments</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                  <Star className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                  <p className="text-lg font-bold text-yellow-600">{blog.rating || "N/A"}</p>
                  <p className="text-xs text-yellow-500 font-medium">Rating</p>
                </div>
              </div>
            </div>

            {/* Article Content */}
            <div className="prose prose-lg max-w-none mb-12 text-gray-800 leading-relaxed">
              <div dangerouslySetInnerHTML={{ __html: blog.content }} />
            </div>

            {/* Workout Information */}
            {blog.estimatedCalories && (
              <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6 mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <Dumbbell className="h-6 w-6 text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-900">Workout Information</h3>
                </div>
                <p className="text-gray-700 font-medium">{blog.estimatedCalories}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between border-t border-b border-gray-200 py-6 mb-8">
              <div className="flex items-center gap-4">
                <Button
                  variant={liked ? "default" : "outline"}
                  onClick={handleLike}
                  className={
                    liked
                      ? "bg-red-500 hover:bg-red-600 text-white border-0"
                      : "border-gray-300 text-gray-700 hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                  }
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare("facebook")}
                        className="w-full justify-start text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Facebook className="h-4 w-4 mr-2" />
                        Facebook
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare("twitter")}
                        className="w-full justify-start text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Twitter className="h-4 w-4 mr-2" />
                        Twitter
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare("linkedin")}
                        className="w-full justify-start text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Linkedin className="h-4 w-4 mr-2" />
                        LinkedIn
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare("copy")}
                        className="w-full justify-start text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Link
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => window.print()}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Print Article
              </Button>
            </div>

            {/* Author Bio */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                About the Author
              </h3>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">{blog.author}</h4>
                  <p className="text-sm text-blue-600 font-medium mb-2">{blog.authorRole || "Fitness Expert"}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Passionate about fitness and helping others achieve their health goals through evidence-based
                    content and practical advice. Dedicated to making fitness accessible and enjoyable for everyone.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Related Articles */}
        {relatedBlogs.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center gap-3 mb-8">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              <h2 className="text-3xl font-bold text-gray-900">Related Articles</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedBlogs.map((relatedBlog) => (
                <Link key={relatedBlog.id} href={`/blog/${relatedBlog.id}`}>
                  <Card className="shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer border border-gray-200 bg-white">
                    <div className="h-48 bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center relative overflow-hidden">
                      {relatedBlog.featuredImage ? (
                        <img
                          src={getImageUrl(relatedBlog.featuredImage) || ""}
                          alt={relatedBlog.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <BookOpen className="h-8 w-8 text-blue-400" />
                      )}
                      {relatedBlog.rating && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 backdrop-blur-sm rounded-full px-2 py-1 border border-gray-200">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="text-xs font-semibold text-gray-900">{relatedBlog.rating}</span>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <Badge className="bg-blue-100 text-blue-700 border-0 text-xs mb-2 font-medium">
                        {relatedBlog.categoryName || "General"}
                      </Badge>
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {relatedBlog.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">{relatedBlog.excerpt}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="font-medium">{relatedBlog.readTime || "5 min read"}</span>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span className="font-medium">{formatNumber(relatedBlog.views || 0)}</span>
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
