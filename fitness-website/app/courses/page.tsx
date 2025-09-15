"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { API_CONFIG } from "@/config/api"
import axios from "axios"
import Link from "next/link"
import {
  Calendar,
  Clock,
  User,
  Search,
  ArrowRight,
  Star,
  BookOpen,
  AlertCircle,
  Play,
  Users,
  Award,
  DollarSign,
  GraduationCap,
} from "lucide-react"
import { formatNumber, formatDateUTC, timeOrEpoch } from "@/utils/format"
import { Course } from "@/types/course"

interface CourseCategory {
  id: string
  name: string
  description?: string
  color?: string
  courseCount?: number
}

export default function CoursesPage() {
  const [mounted, setMounted] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("latest")
  const [searchLoading, setSearchLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(6)

  const API = API_CONFIG

  // Normalize raw API course object into our Course shape
  const normalizeCourse = (raw: any): Course => ({
    course_id: String(raw?.course_id ?? raw?.id ?? raw?._id ?? ""),
    id: String(raw?.course_id ?? raw?.id ?? raw?._id ?? ""),
    title: raw?.title ?? "Untitled Course",
    description: raw?.description ?? raw?.body ?? "",
    excerpt: raw?.excerpt ?? raw?.summary ?? "",
    price: raw?.price ?? "0",
    image_url: raw?.image_url ?? raw?.featuredImage ?? raw?.image ?? raw?.thumbnail ?? "",
    featuredImage: raw?.image_url ?? raw?.featuredImage ?? raw?.image ?? raw?.thumbnail,
    instructor: raw?.instructor ?? raw?.instructorName ?? "Expert Trainer",
    instructorRole: raw?.instructorRole ?? raw?.role ?? "Certified Trainer",
    categoryId: String(raw?.categoryId ?? raw?.category_id ?? raw?.catId ?? ""),
    categoryName: raw?.categoryName ?? raw?.category_name ?? raw?.category ?? raw?.categoryTitle,
    tags: Array.isArray(raw?.tags) ? raw.tags : [],
    status: raw?.status ?? "published",
    views: Number(raw?.views ?? 0),
    likes: Number(raw?.likes ?? 0),
    comments: Number(raw?.comments ?? 0),
    duration: raw?.duration ?? "4 weeks",
    level: raw?.level ?? raw?.difficulty,
    difficulty: raw?.difficulty ?? raw?.level ?? "Beginner",
    skillLevel: raw?.skillLevel ?? raw?.difficulty ?? raw?.level ?? "Beginner",
    featured: Boolean(raw?.featured ?? false),
    rating: raw?.rating != null ? Number(raw.rating) : undefined,
    estimatedCalories: raw?.estimatedCalories ?? raw?.calories,
    totalLessons: Number(raw?.totalLessons ?? raw?.lessons ?? 0),
    completionRate: Number(raw?.completionRate ?? 0),
    prerequisites: Array.isArray(raw?.prerequisites) ? raw.prerequisites : [],
    created_at: raw?.created_at ?? raw?.createdAt ?? raw?.publishedAt ?? new Date().toISOString(),
    updated_at: raw?.updated_at ?? raw?.updatedAt ?? new Date().toISOString(),
  })

  // Fetch all courses
  const fetchCourses = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get(API.USER_FUNCTIONS.courses.getAll)
      const data = response.data

      let coursesArray: Course[] = []

      if (Array.isArray(data)) {
        coursesArray = data
      } else if (data && Array.isArray(data.courses)) {
        coursesArray = data.courses
      } else if (data && Array.isArray(data.data)) {
        coursesArray = data.data
      } else if (data && typeof data === "object") {
        const possibleArrays = Object.values(data).filter(Array.isArray)
        if (possibleArrays.length > 0) {
          coursesArray = possibleArrays[0] as Course[]
        }
      }

      if (Array.isArray(coursesArray)) {
        const publishedCourses = coursesArray.filter((course: any) => course && (course.status === "published" || !course.status))
        const normalized = publishedCourses.map(normalizeCourse).filter((c) => c.course_id)
        setCourses(normalized)
      } else {
        throw new Error("Invalid data format received from API")
      }
    } catch (err) {
      console.error("Fetch error:", err)
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || err.message || "Failed to fetch courses")
      } else {
        setError(err instanceof Error ? err.message : "Failed to fetch courses")
      }
    } finally {
      setLoading(false)
    }
  }

  // Search courses
  const searchCourses = async (query: string) => {
    if (!query.trim()) {
      fetchCourses()
      return
    }

    try {
      setSearchLoading(true)
      const response = await axios.post(API.USER_FUNCTIONS.courses.search, { keyword: query })
      const data = response.data

      let coursesArray: Course[] = []

      if (Array.isArray(data)) {
        coursesArray = data
      } else if (data && Array.isArray(data.courses)) {
        coursesArray = data.courses
      } else if (data && Array.isArray(data.data)) {
        coursesArray = data.data
      } else if (data && typeof data === "object") {
        const possibleArrays = Object.values(data).filter(Array.isArray)
        if (possibleArrays.length > 0) {
          coursesArray = possibleArrays[0] as Course[]
        }
      }

      if (Array.isArray(coursesArray)) {
        const publishedCourses = coursesArray.filter((course: any) => course && (course.status === "published" || !course.status))
        const normalized = publishedCourses.map(normalizeCourse).filter((c) => c.course_id)
        setCourses(normalized)
      } else {
        const filtered = courses.filter(
          (course) =>
            course.title.toLowerCase().includes(query.toLowerCase()) ||
            course.description.toLowerCase().includes(query.toLowerCase()) ||
            (course.tags && course.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))),
        )
        setCourses(filtered)
      }
    } catch (err) {
      console.error("Search failed:", err)
      const filtered = courses.filter(
        (course) =>
          course.title.toLowerCase().includes(query.toLowerCase()) ||
          course.description.toLowerCase().includes(query.toLowerCase()) ||
          (course.tags && course.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))),
      )
      setCourses(filtered)
    } finally {
      setSearchLoading(false)
    }
  }

  // Extract unique categories from courses
  const getUniqueCategories = () => {
    const categoryMap = new Map()

    courses.forEach((course) => {
      if (course.categoryName) {
        if (categoryMap.has(course.categoryName)) {
          categoryMap.set(course.categoryName, categoryMap.get(course.categoryName) + 1)
        } else {
          categoryMap.set(course.categoryName, 1)
        }
      }
    })

    const categoryStats = Array.from(categoryMap.entries()).map(([name, count], index) => ({
      name,
      count,
      color: getCategoryColor(index),
    }))

    return [{ name: "All", count: courses.length, color: "bg-blue-500" }, ...categoryStats]
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

  // Handle category selection
  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName)
    setSearchTerm("")
    setCurrentPage(1)

    if (categoryName === "All") {
      fetchCourses()
    }
  }

  useEffect(() => {
    setMounted(true)
    fetchCourses()
  }, [])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm) {
        searchCourses(searchTerm)
      } else {
        if (selectedCategory === "All") {
          fetchCourses()
        }
      }
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [searchTerm])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, sortBy])

  // Filter and sort courses
  const filteredCourses = courses.filter((course) => {
    const matchesCategory = selectedCategory === "All" || course.categoryName === selectedCategory
    return matchesCategory
  })

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return (b.views || 0) - (a.views || 0)
      case "rating":
        return (b.rating || 0) - (a.rating || 0)
      case "price-low":
        return parseFloat(a.price || "0") - parseFloat(b.price || "0")
      case "price-high":
        return parseFloat(b.price || "0") - parseFloat(a.price || "0")
      default:
        return timeOrEpoch(b.created_at || b.updated_at) - timeOrEpoch(a.created_at || a.updated_at)
    }
  })

  const featuredCourse = sortedCourses.find((course) => course.featured)
  const regularCourses = sortedCourses.filter((course) => !course.featured)

  // Pagination
  const totalItems = regularCourses.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const startIndex = (safeCurrentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedCourses = regularCourses.slice(startIndex, endIndex)

  const categoryStats = getUniqueCategories()

  // Prevent hydration mismatch
  if (!mounted) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="shadow-sm">
                <div className="md:flex">
                  <Skeleton className="md:w-1/3 h-64" />
                  <div className="md:w-2/3 p-6 space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Error Loading Courses</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={fetchCourses}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="py-16 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Fitness Courses</h1>
          <p className="text-xl text-gray-600 mb-8">
            Transform your body and mind with our expert-designed fitness courses
          </p>
          <div className="flex justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{formatNumber(courses.length)}+ Courses</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>Expert Instructors</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4" />
              <span>4.9 Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-6 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  disabled={searchLoading}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-600">Sort by:</span>
              <div className="flex gap-2">
                {[
                  { value: "latest", label: "Latest" },
                  { value: "popular", label: "Popular" },
                  { value: "rating", label: "Top Rated" },
                  { value: "price-low", label: "Price: Low" },
                  { value: "price-high", label: "Price: High" },
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={sortBy === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSortBy(option.value)}
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
                onClick={() => handleCategorySelect(category.name)}
                className="rounded-full"
              >
                <div className={`w-2 h-2 rounded-full ${category.color} mr-2`}></div>
                {category.name} ({formatNumber(category.count)})
              </Button>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Featured Course */}
            {featuredCourse && selectedCategory === "All" && (
              <div className="mb-12">
                <div className="flex items-center gap-2 mb-6">
                  <Star className="h-5 w-5 text-yellow-500 fill-current" />
                  <span className="text-lg font-semibold">Featured Course</span>
                </div>
                <Card className="shadow-xl overflow-hidden">
                  <div className="relative">
                    <div className="h-80 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center relative">
                      {featuredCourse.image_url || featuredCourse.featuredImage ? (
                        <img
                          src={featuredCourse.image_url || featuredCourse.featuredImage || ""}
                          alt={featuredCourse.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement
                            target.onerror = null
                            target.src = "/placeholder.jpg"
                          }}
                        />
                      ) : (
                        <GraduationCap className="h-20 w-20 text-blue-400" />
                      )}
                      <Badge className="absolute top-4 left-4 bg-red-500 text-white">Featured</Badge>
                    </div>
                    <CardContent className="p-8">
                      <h2 className="text-3xl font-bold mb-4">{featuredCourse.title}</h2>
                      <p className="text-gray-600 mb-6">{featuredCourse.excerpt || featuredCourse.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <Clock className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                          <p className="text-sm font-semibold text-blue-600">{featuredCourse.duration || "4 weeks"}</p>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <Play className="h-5 w-5 text-green-600 mx-auto mb-1" />
                          <p className="text-sm font-semibold text-green-600">{featuredCourse.totalLessons || 12}</p>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <Users className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                          <p className="text-sm font-semibold text-purple-600">{formatNumber(featuredCourse.views || 0)}</p>
                        </div>
                        <div className="text-center p-3 bg-orange-50 rounded-lg">
                          <Award className="h-5 w-5 text-orange-600 mx-auto mb-1" />
                          <p className="text-sm font-semibold text-orange-600">${featuredCourse.price}</p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                          {formatDateUTC(featuredCourse.created_at)}
                        </div>
                        <Link href={`/courses/${featuredCourse.course_id}`}>
                          <Button size="lg">
                            Enroll Now
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </div>
            )}

            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  {selectedCategory === "All" ? "All Courses" : `${selectedCategory} Courses`}
                </h2>
                <span className="text-gray-500">
                  {regularCourses.length} course{regularCourses.length !== 1 ? "s" : ""} found
                </span>
              </div>

              {/* Page size selector */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>Per page:</span>
                  <select
                    className="border rounded px-2 py-1"
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(parseInt(e.target.value))
                      setCurrentPage(1)
                    }}
                  >
                    {[6, 9, 12, 24].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <div className="text-sm text-gray-500">
                  Page {safeCurrentPage} of {totalPages}
                </div>
              </div>

              <div className="grid gap-6">
                {paginatedCourses.map((course) => (
                  <Link key={course.course_id} href={`/courses/${course.course_id}`}>
                    <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                      <div className="md:flex">
                        <div className="md:w-1/3">
                          <div className="h-64 md:h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center relative">
                            {course.image_url || course.featuredImage ? (
                              <img
                                src={course.image_url || course.featuredImage || ""}
                                alt={course.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.currentTarget as HTMLImageElement
                                  target.onerror = null
                                  target.src = "/placeholder.jpg"
                                }}
                              />
                            ) : (
                              <GraduationCap className="h-12 w-12 text-blue-400" />
                            )}
                            {course.difficulty && (
                              <Badge className="absolute top-3 left-3 bg-green-100 text-green-800">
                                {course.difficulty}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="md:w-2/3 p-6">
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="outline">
                              {course.categoryName || "Fitness"}
                            </Badge>
                            <span className="text-sm text-blue-600 font-medium">${course.price}</span>
                          </div>

                          <h3 className="text-xl font-bold mb-3">{course.title}</h3>
                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {course.excerpt || course.description}
                          </p>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Clock className="h-4 w-4" />
                              <span>{course.duration || "4 weeks"}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Play className="h-4 w-4" />
                              <span>{course.totalLessons || 12} lessons</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Users className="h-4 w-4" />
                              <span>{formatNumber(course.views || 0)} enrolled</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Award className="h-4 w-4" />
                              <span>Certificate</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <User className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{course.instructor}</p>
                                <p className="text-xs text-gray-500">{course.instructorRole || "Certified Trainer"}</p>
                              </div>
                            </div>
                            <Button size="sm">
                              Enroll Now
                              <ArrowRight className="ml-1 h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-8">
                  <Button
                    variant="outline"
                    disabled={safeCurrentPage <= 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <div className="text-sm text-gray-500">
                    Showing {Math.min(totalItems, startIndex + 1)}–{Math.min(totalItems, endIndex)} of {totalItems}
                  </div>
                  <Button
                    variant="outline"
                    disabled={safeCurrentPage >= totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Course Stats</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">Total Courses</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">{courses.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-600">Students</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    {formatNumber(courses.reduce((sum, course) => sum + (course.views || 0), 0))}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-600">Avg Rating</span>
                  </div>
                  <span className="text-lg font-bold text-purple-600">4.9</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
