// "use client"

// import { useState } from "react"
// import { Card, CardContent, CardHeader } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import {
//   Calendar,
//   Clock,
//   User,
//   Search,
//   ArrowRight,
//   Eye,
//   Heart,
//   MessageCircle,
//   Share2,
//   TrendingUp,
//   Star,
//   BookOpen,
// } from "lucide-react"

// const blogPosts = [
//   {
//     id: 1,
//     title: "10 Best Exercises for Beginners: Complete Guide to Starting Your Fitness Journey",
//     excerpt:
//       "Discover the most effective beginner-friendly exercises that will help you build strength, improve endurance, and develop proper form. This comprehensive guide includes step-by-step instructions, common mistakes to avoid, and progression tips.",
//     category: "Workouts",
//     author: "Sarah Johnson",
//     authorRole: "Certified Personal Trainer",
//     authorImage: "/placeholder.svg?height=40&width=40",
//     date: "Jan 15, 2024",
//     readTime: "8 min read",
//     views: 2847,
//     likes: 156,
//     comments: 23,
//     difficulty: "Beginner",
//     featured: true,
//     tags: ["Beginner", "Strength Training", "Form", "Exercise Guide"],
//     image: "/placeholder.svg?height=400&width=600",
//     rating: 4.9,
//     estimatedCalories: "200-300 calories burned",
//   },
//   {
//     id: 2,
//     title: "Complete Nutrition Guide for Muscle Building and Fat Loss",
//     excerpt:
//       "Master the science of nutrition with this comprehensive guide covering macronutrients, meal timing, supplements, and practical meal planning strategies for optimal body composition.",
//     category: "Nutrition",
//     author: "Dr. Emily Davis",
//     authorRole: "Sports Nutritionist",
//     authorImage: "/placeholder.svg?height=40&width=40",
//     date: "Jan 12, 2024",
//     readTime: "12 min read",
//     views: 3921,
//     likes: 287,
//     comments: 45,
//     difficulty: "Intermediate",
//     featured: false,
//     tags: ["Nutrition", "Muscle Building", "Fat Loss", "Meal Planning"],
//     image: "/placeholder.svg?height=400&width=600",
//     rating: 4.8,
//     estimatedCalories: "Meal plans: 1800-2500 calories",
//   },
//   {
//     id: 3,
//     title: "HIIT vs Steady-State Cardio: The Ultimate Comparison for Fat Loss",
//     excerpt:
//       "Dive deep into the science behind high-intensity interval training and steady-state cardio. Learn which approach works best for your goals, schedule, and fitness level.",
//     category: "Cardio",
//     author: "Mike Chen",
//     authorRole: "Exercise Physiologist",
//     authorImage: "/placeholder.svg?height=40&width=40",
//     date: "Jan 10, 2024",
//     readTime: "10 min read",
//     views: 4156,
//     likes: 312,
//     comments: 67,
//     difficulty: "Intermediate",
//     featured: false,
//     tags: ["HIIT", "Cardio", "Fat Loss", "Training Methods"],
//     image: "/placeholder.svg?height=400&width=600",
//     rating: 4.7,
//     estimatedCalories: "400-600 calories per session",
//   },
//   {
//     id: 4,
//     title: "Recovery and Rest: The Missing Piece in Your Fitness Puzzle",
//     excerpt:
//       "Understand why recovery is just as important as your workouts. Learn about sleep optimization, active recovery techniques, and how to prevent overtraining syndrome.",
//     category: "Recovery",
//     author: "David Wilson",
//     authorRole: "Recovery Specialist",
//     authorImage: "/placeholder.svg?height=40&width=40",
//     date: "Jan 8, 2024",
//     readTime: "9 min read",
//     views: 2634,
//     likes: 198,
//     comments: 34,
//     difficulty: "Beginner",
//     featured: false,
//     tags: ["Recovery", "Sleep", "Rest Days", "Overtraining"],
//     image: "/placeholder.svg?height=400&width=600",
//     rating: 4.6,
//     estimatedCalories: "Recovery focused",
//   },
//   {
//     id: 5,
//     title: "Building the Perfect Home Gym: Equipment Guide for Every Budget",
//     excerpt:
//       "Create an effective home workout space without breaking the bank. From essential basics to advanced equipment, discover what you really need for a complete home gym setup.",
//     category: "Equipment",
//     author: "Sarah Johnson",
//     authorRole: "Certified Personal Trainer",
//     authorImage: "/placeholder.svg?height=40&width=40",
//     date: "Jan 5, 2024",
//     readTime: "11 min read",
//     views: 5234,
//     likes: 423,
//     comments: 89,
//     difficulty: "Beginner",
//     featured: false,
//     tags: ["Home Gym", "Equipment", "Budget", "Setup Guide"],
//     image: "/placeholder.svg?height=400&width=600",
//     rating: 4.9,
//     estimatedCalories: "Equipment for all workout types",
//   },
//   {
//     id: 6,
//     title: "Mindful Eating: Transform Your Relationship with Food and Nutrition",
//     excerpt:
//       "Discover the power of mindful eating practices to improve your relationship with food, reduce stress eating, and support your fitness goals through conscious nutrition choices.",
//     category: "Wellness",
//     author: "Dr. Lisa Park",
//     authorRole: "Wellness Coach",
//     authorImage: "/placeholder.svg?height=40&width=40",
//     date: "Jan 3, 2024",
//     readTime: "7 min read",
//     views: 1876,
//     likes: 134,
//     comments: 28,
//     difficulty: "Beginner",
//     featured: false,
//     tags: ["Mindfulness", "Nutrition", "Wellness", "Mental Health"],
//     image: "/placeholder.svg?height=400&width=600",
//     rating: 4.5,
//     estimatedCalories: "Focus on eating habits",
//   },
// ]

// const categories = [
//   { name: "All", count: blogPosts.length, color: "bg-blue-500" },
//   { name: "Workouts", count: 2, color: "bg-red-500" },
//   { name: "Nutrition", count: 2, color: "bg-green-500" },
//   { name: "Cardio", count: 1, color: "bg-orange-500" },
//   { name: "Recovery", count: 1, color: "bg-purple-500" },
//   { name: "Equipment", count: 1, color: "bg-yellow-500" },
//   { name: "Wellness", count: 1, color: "bg-pink-500" },
// ]

// const trendingTopics = [
//   { name: "HIIT Workouts", posts: 15, trend: "+12%" },
//   { name: "Home Fitness", posts: 23, trend: "+8%" },
//   { name: "Nutrition Tips", posts: 18, trend: "+15%" },
//   { name: "Recovery Methods", posts: 12, trend: "+5%" },
// ]

// export default function BlogPage() {
//   const [selectedCategory, setSelectedCategory] = useState("All")
//   const [searchTerm, setSearchTerm] = useState("")
//   const [sortBy, setSortBy] = useState("latest")

//   const filteredPosts = blogPosts.filter((post) => {
//     const matchesCategory = selectedCategory === "All" || post.category === selectedCategory
//     const matchesSearch =
//       post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       post.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
//     return matchesCategory && matchesSearch
//   })

//   const sortedPosts = [...filteredPosts].sort((a, b) => {
//     switch (sortBy) {
//       case "popular":
//         return b.views - a.views
//       case "rating":
//         return b.rating - a.rating
//       case "comments":
//         return b.comments - a.comments
//       default:
//         return new Date(b.date).getTime() - new Date(a.date).getTime()
//     }
//   })

//   const featuredPost = sortedPosts.find((post) => post.featured)
//   const regularPosts = sortedPosts.filter((post) => !post.featured)

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

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
//       {/* Dynamic Hero Section */}
//       <section className="relative py-24 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/5 overflow-hidden">
//         <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
//           <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
//             <BookOpen className="h-4 w-4 text-primary" />
//             <span className="text-sm font-medium text-primary">Fitness Knowledge Hub</span>
//           </div>
//           <h1 className="text-5xl lg:text-6xl font-bold mb-6 text-foreground">
//             Expert Fitness
//             <span className="text-primary block lg:inline"> Insights</span>
//           </h1>
//           <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
//             Discover evidence-based fitness strategies, nutrition science, and wellness tips from certified
//             professionals
//           </p>
//           <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
//             <div className="flex items-center gap-1">
//               <TrendingUp className="h-4 w-4" />
//               <span>50+ Expert Articles</span>
//             </div>
//             <div className="flex items-center gap-1">
//               <User className="h-4 w-4" />
//               <span>Certified Trainers</span>
//             </div>
//             <div className="flex items-center gap-1">
//               <Star className="h-4 w-4" />
//               <span>4.8 Average Rating</span>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Advanced Search and Filters */}
//       <section className="py-8 bg-white border-b shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex flex-col lg:flex-row gap-6">
//             {/* Search */}
//             <div className="flex-1">
//               <div className="relative max-w-md">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
//                 <Input
//                   placeholder="Search articles, tags, or topics..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="pl-10 h-12 text-base border-2 focus:border-primary"
//                 />
//               </div>
//             </div>

//             {/* Sort Options */}
//             <div className="flex items-center gap-4">
//               <span className="text-sm font-medium text-muted-foreground">Sort by:</span>
//               <div className="flex gap-2">
//                 {[
//                   { value: "latest", label: "Latest" },
//                   { value: "popular", label: "Popular" },
//                   { value: "rating", label: "Top Rated" },
//                   { value: "comments", label: "Most Discussed" },
//                 ].map((option) => (
//                   <Button
//                     key={option.value}
//                     variant={sortBy === option.value ? "default" : "outline"}
//                     size="sm"
//                     onClick={() => setSortBy(option.value)}
//                     className="rounded-full"
//                   >
//                     {option.label}
//                   </Button>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Categories */}
//           <div className="flex flex-wrap gap-3 mt-6">
//             {categories.map((category) => (
//               <Button
//                 key={category.name}
//                 variant={selectedCategory === category.name ? "default" : "outline"}
//                 onClick={() => setSelectedCategory(category.name)}
//                 className={`rounded-full transition-all duration-200 hover:scale-105 ${
//                   selectedCategory === category.name ? "shadow-lg" : ""
//                 }`}
//               >
//                 <div className={`w-2 h-2 rounded-full ${category.color} mr-2`}></div>
//                 {category.name} ({category.count})
//               </Button>
//             ))}
//           </div>
//         </div>
//       </section>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//         <div className="grid lg:grid-cols-4 gap-8">
//           {/* Main Content */}
//           <div className="lg:col-span-3">
//             {/* Featured Post - Highly Detailed */}
//             {featuredPost && selectedCategory === "All" && (
//               <div className="mb-12">
//                 <div className="flex items-center gap-2 mb-6">
//                   <Star className="h-5 w-5 text-yellow-500 fill-current" />
//                   <span className="text-lg font-semibold text-foreground">Featured Article</span>
//                 </div>
//                 <Card className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden group">
//                   <div className="relative">
//                     <div className="h-80 bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/10 flex items-center justify-center relative overflow-hidden">
//                       <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
//                       <BookOpen className="h-20 w-20 text-primary/60 group-hover:scale-110 transition-transform duration-300" />
//                       <Badge className="absolute top-4 left-4 bg-red-500 text-white">Featured</Badge>
//                       <Badge className={`absolute top-4 right-4 ${getDifficultyColor(featuredPost.difficulty)}`}>
//                         {featuredPost.difficulty}
//                       </Badge>
//                     </div>
//                     <CardContent className="p-8">
//                       <div className="flex items-center gap-2 mb-4">
//                         <Badge variant="outline" className="text-sm px-3 py-1">
//                           {featuredPost.category}
//                         </Badge>
//                         <div className="flex items-center gap-1 text-yellow-500">
//                           <Star className="h-4 w-4 fill-current" />
//                           <span className="text-sm font-medium">{featuredPost.rating}</span>
//                         </div>
//                       </div>

//                       <h2 className="text-3xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors">
//                         {featuredPost.title}
//                       </h2>

//                       <p className="text-lg text-muted-foreground mb-6 leading-relaxed">{featuredPost.excerpt}</p>

//                       {/* Tags */}
//                       <div className="flex flex-wrap gap-2 mb-6">
//                         {featuredPost.tags.map((tag) => (
//                           <Badge
//                             key={tag}
//                             variant="secondary"
//                             className="text-xs hover:bg-primary hover:text-white cursor-pointer transition-colors"
//                           >
//                             {tag}
//                           </Badge>
//                         ))}
//                       </div>

//                       {/* Author Info */}
//                       <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
//                         <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
//                           <User className="h-6 w-6 text-white" />
//                         </div>
//                         <div>
//                           <p className="font-semibold text-foreground">{featuredPost.author}</p>
//                           <p className="text-sm text-muted-foreground">{featuredPost.authorRole}</p>
//                         </div>
//                       </div>

//                       {/* Stats and Meta */}
//                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
//                         <div className="text-center p-3 bg-blue-50 rounded-lg">
//                           <Eye className="h-5 w-5 text-blue-600 mx-auto mb-1" />
//                           <p className="text-sm font-semibold text-blue-600">{featuredPost.views.toLocaleString()}</p>
//                           <p className="text-xs text-blue-500">Views</p>
//                         </div>
//                         <div className="text-center p-3 bg-red-50 rounded-lg">
//                           <Heart className="h-5 w-5 text-red-600 mx-auto mb-1" />
//                           <p className="text-sm font-semibold text-red-600">{featuredPost.likes}</p>
//                           <p className="text-xs text-red-500">Likes</p>
//                         </div>
//                         <div className="text-center p-3 bg-green-50 rounded-lg">
//                           <MessageCircle className="h-5 w-5 text-green-600 mx-auto mb-1" />
//                           <p className="text-sm font-semibold text-green-600">{featuredPost.comments}</p>
//                           <p className="text-xs text-green-500">Comments</p>
//                         </div>
//                         <div className="text-center p-3 bg-purple-50 rounded-lg">
//                           <Clock className="h-5 w-5 text-purple-600 mx-auto mb-1" />
//                           <p className="text-sm font-semibold text-purple-600">{featuredPost.readTime}</p>
//                           <p className="text-xs text-purple-500">Read Time</p>
//                         </div>
//                       </div>

//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center gap-4 text-sm text-muted-foreground">
//                           <div className="flex items-center gap-1">
//                             <Calendar className="h-4 w-4" />
//                             {featuredPost.date}
//                           </div>
//                           <div className="text-primary font-medium">{featuredPost.estimatedCalories}</div>
//                         </div>
//                         <div className="flex gap-2">
//                           <Button variant="outline" size="sm">
//                             <Share2 className="h-4 w-4 mr-2" />
//                             Share
//                           </Button>
//                           <Button size="lg" className="bg-primary hover:bg-primary/90 group">
//                             Read Full Article
//                             <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
//                           </Button>
//                         </div>
//                       </div>
//                     </CardContent>
//                   </div>
//                 </Card>
//               </div>
//             )}

//             {/* Regular Posts - Enhanced Cards */}
//             <div className="space-y-8">
//               <div className="flex items-center justify-between">
//                 <h2 className="text-2xl font-bold text-foreground">
//                   {selectedCategory === "All" ? "Latest Articles" : `${selectedCategory} Articles`}
//                 </h2>
//                 <span className="text-muted-foreground">
//                   {regularPosts.length} article{regularPosts.length !== 1 ? "s" : ""} found
//                 </span>
//               </div>

//               <div className="grid gap-6">
//                 {regularPosts.map((post) => (
//                   <Card
//                     key={post.id}
//                     className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group bg-white"
//                   >
//                     <div className="md:flex">
//                       <div className="md:w-1/3">
//                         <div className="h-64 md:h-full bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/10 flex items-center justify-center relative">
//                           <BookOpen className="h-12 w-12 text-primary/60 group-hover:scale-110 transition-transform duration-300" />
//                           <Badge className={`absolute top-3 left-3 ${getDifficultyColor(post.difficulty)}`}>
//                             {post.difficulty}
//                           </Badge>
//                           <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
//                             <Star className="h-3 w-3 text-yellow-500 fill-current" />
//                             <span className="text-xs font-medium">{post.rating}</span>
//                           </div>
//                         </div>
//                       </div>
//                       <div className="md:w-2/3 p-6">
//                         <div className="flex items-center gap-2 mb-3">
//                           <Badge variant="outline" className="text-xs">
//                             {post.category}
//                           </Badge>
//                           <span className="text-xs text-muted-foreground">•</span>
//                           <span className="text-xs text-primary font-medium">{post.estimatedCalories}</span>
//                         </div>

//                         <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors line-clamp-2">
//                           {post.title}
//                         </h3>

//                         <p className="text-muted-foreground mb-4 line-clamp-3 leading-relaxed">{post.excerpt}</p>

//                         {/* Tags */}
//                         <div className="flex flex-wrap gap-1 mb-4">
//                           {post.tags.slice(0, 3).map((tag) => (
//                             <Badge
//                               key={tag}
//                               variant="secondary"
//                               className="text-xs hover:bg-primary hover:text-white cursor-pointer transition-colors"
//                             >
//                               {tag}
//                             </Badge>
//                           ))}
//                           {post.tags.length > 3 && (
//                             <Badge variant="outline" className="text-xs">
//                               +{post.tags.length - 3} more
//                             </Badge>
//                           )}
//                         </div>

//                         {/* Author and Stats */}
//                         <div className="flex items-center justify-between mb-4">
//                           <div className="flex items-center gap-3">
//                             <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
//                               <User className="h-4 w-4 text-white" />
//                             </div>
//                             <div>
//                               <p className="text-sm font-medium text-foreground">{post.author}</p>
//                               <p className="text-xs text-muted-foreground">{post.authorRole}</p>
//                             </div>
//                           </div>
//                           <div className="flex items-center gap-4 text-xs text-muted-foreground">
//                             <div className="flex items-center gap-1">
//                               <Eye className="h-3 w-3" />
//                               {post.views.toLocaleString()}
//                             </div>
//                             <div className="flex items-center gap-1">
//                               <Heart className="h-3 w-3" />
//                               {post.likes}
//                             </div>
//                             <div className="flex items-center gap-1">
//                               <MessageCircle className="h-3 w-3" />
//                               {post.comments}
//                             </div>
//                           </div>
//                         </div>

//                         <div className="flex items-center justify-between">
//                           <div className="flex items-center gap-3 text-sm text-muted-foreground">
//                             <div className="flex items-center gap-1">
//                               <Calendar className="h-3 w-3" />
//                               {post.date}
//                             </div>
//                             <div className="flex items-center gap-1">
//                               <Clock className="h-3 w-3" />
//                               {post.readTime}
//                             </div>
//                           </div>
//                           <div className="flex gap-2">
//                             <Button variant="ghost" size="sm">
//                               <Heart className="h-4 w-4" />
//                             </Button>
//                             <Button variant="ghost" size="sm">
//                               <Share2 className="h-4 w-4" />
//                             </Button>
//                             <Button variant="outline" size="sm" className="group bg-transparent">
//                               Read More
//                               <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
//                             </Button>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </Card>
//                 ))}
//               </div>
//             </div>

//             {filteredPosts.length === 0 && (
//               <div className="text-center py-20">
//                 <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
//                 <p className="text-xl text-muted-foreground mb-2">No articles found</p>
//                 <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
//               </div>
//             )}
//           </div>

//           {/* Enhanced Sidebar */}
//           <div className="space-y-6">
//             {/* Trending Topics */}
//             <Card className="border-0 shadow-lg">
//               <CardHeader>
//                 <div className="flex items-center gap-2">
//                   <TrendingUp className="h-5 w-5 text-primary" />
//                   <h3 className="font-bold text-foreground">Trending Topics</h3>
//                 </div>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 {trendingTopics.map((topic) => (
//                   <div
//                     key={topic.name}
//                     className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
//                   >
//                     <div>
//                       <p className="font-medium text-foreground">{topic.name}</p>
//                       <p className="text-sm text-muted-foreground">{topic.posts} articles</p>
//                     </div>
//                     <Badge variant="outline" className="text-green-600 border-green-600">
//                       {topic.trend}
//                     </Badge>
//                   </div>
//                 ))}
//               </CardContent>
//             </Card>

//             {/* Newsletter Signup */}
//             <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-secondary/5">
//               <CardHeader>
//                 <h3 className="font-bold text-foreground">Stay Updated</h3>
//                 <p className="text-sm text-muted-foreground">Get expert fitness tips delivered weekly</p>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <Input placeholder="Enter your email" type="email" className="border-2 focus:border-primary" />
//                 <Button className="w-full bg-primary hover:bg-primary/90">Subscribe to Newsletter</Button>
//                 <p className="text-xs text-muted-foreground text-center">
//                   Join 10,000+ fitness enthusiasts. Unsubscribe anytime.
//                 </p>
//               </CardContent>
//             </Card>

//             {/* Popular Articles */}
//             <Card className="border-0 shadow-lg">
//               <CardHeader>
//                 <div className="flex items-center gap-2">
//                   <Star className="h-5 w-5 text-yellow-500 fill-current" />
//                   <h3 className="font-bold text-foreground">Most Popular</h3>
//                 </div>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 {blogPosts
//                   .sort((a, b) => b.views - a.views)
//                   .slice(0, 4)
//                   .map((post, index) => (
//                     <div
//                       key={post.id}
//                       className="flex gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
//                     >
//                       <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
//                         {index + 1}
//                       </div>
//                       <div className="flex-1">
//                         <h4 className="font-medium text-sm text-foreground line-clamp-2 mb-1">{post.title}</h4>
//                         <div className="flex items-center gap-2 text-xs text-muted-foreground">
//                           <Eye className="h-3 w-3" />
//                           <span>{post.views.toLocaleString()} views</span>
//                           <span>•</span>
//                           <span>{post.readTime}</span>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
// import { USER_BLOG_API } from "@/u/apis";
import { API_CONFIG } from "../../config/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Blog {
  id: string;
  title: string;
  description: string;
  created_at: string;
  image?: string;
}

const USER_BLOG_API = API_CONFIG.USER_BLOG_API;

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(USER_BLOG_API.getAll);

      // check backend structure
      const data = response.data.data || response.data;
      setBlogs(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      setError("Failed to load blogs");
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const response = await axios.post(USER_BLOG_API.search, { query: searchTerm });
      const data = response.data.data || response.data;
      setBlogs(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch {
      setError("Failed to search blogs");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  if (loading) return <p className="text-center py-10">Loading blogs...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Latest Blogs</h1>

      {/* Search bar */}
      <div className="flex gap-2 mb-6">
        <Input
          placeholder="Search blogs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button onClick={handleSearch}>Search</Button>
      </div>

      {blogs.length === 0 ? (
        <p>No blogs found</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <Link href={`/blogs/${blog.id}`} key={blog.id}>
              <Card className="cursor-pointer hover:shadow-lg transition">
                {blog.image && (
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-40 object-cover rounded-t-2xl"
                  />
                )}
                <CardContent className="p-4">
                  <h2 className="text-xl font-semibold">{blog.title}</h2>
                  <p className="text-gray-600 text-sm mt-2 line-clamp-3">
                    {blog.description}
                  </p>
                  <p className="text-gray-400 text-xs mt-2">
                    {new Date(blog.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
