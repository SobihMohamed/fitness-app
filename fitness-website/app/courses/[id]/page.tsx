"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { API_CONFIG } from "@/config/api"
import axios from "axios"
import Link from "next/link"
import { useParams } from "next/navigation"
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
  AlertCircle,
  Play,
  Users,
  Award,
  DollarSign,
  GraduationCap,
  CheckCircle,
  BookOpen,
  Download,
  Globe,
  Target,
} from "lucide-react"
import { formatNumber, formatDateUTC } from "@/utils/format"
import { Course } from "@/types/course"

export default function CourseDetailPage() {
  const params = useParams()
  const courseId = params.id as string
  
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [enrolling, setEnrolling] = useState(false)

  const API = API_CONFIG

  // Normalize raw API course object
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

  // Fetch course details
  const fetchCourse = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get(API.USER_FUNCTIONS.courses.getById(courseId))
      const data = response.data

      if (data) {
        const normalized = normalizeCourse(data)
        setCourse(normalized)
      } else {
        throw new Error("Course not found")
      }
    } catch (err) {
      console.error("Fetch error:", err)
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || err.message || "Failed to fetch course")
      } else {
        setError(err instanceof Error ? err.message : "Failed to fetch course")
      }
    } finally {
      setLoading(false)
    }
  }

  // Handle enrollment
  const handleEnroll = async () => {
    try {
      setEnrolling(true)
      // Add enrollment logic here
      // await axios.post(API.USER_FUNCTIONS.requests.courses.create, { course_id: courseId })
      console.log("Enrolling in course:", courseId)
    } catch (err) {
      console.error("Enrollment failed:", err)
    } finally {
      setEnrolling(false)
    }
  }

  useEffect(() => {
    if (courseId) {
      fetchCourse()
    }
  }, [courseId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-64 w-full mb-8" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-6 w-2/3 mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <Card className="border-0 shadow-lg max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Course Not Found</h2>
            <p className="text-muted-foreground mb-6">{error || "The course you're looking for doesn't exist."}</p>
            <Link href="/courses">
              <Button className="bg-primary hover:bg-primary/90">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Courses
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link href="/courses" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Courses
        </Link>

        {/* Course Header */}
        <div className="mb-8">
          <div className="relative h-80 bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/10 rounded-lg overflow-hidden mb-6">
            {course.image_url || course.featuredImage ? (
              <img
                src={course.image_url || course.featuredImage || ""}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <GraduationCap className="h-20 w-20 text-primary/60" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline" className="bg-white/90 text-foreground">
                  {course.categoryName || "Fitness"}
                </Badge>
                {course.difficulty && (
                  <Badge className={getDifficultyColor(course.difficulty)}>
                    {course.difficulty}
                  </Badge>
                )}
                {course.rating && (
                  <div className="flex items-center gap-1 bg-white/90 rounded-full px-2 py-1">
                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                    <span className="text-xs font-medium">{course.rating}</span>
                  </div>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{course.title}</h1>
              <p className="text-white/90 text-lg">{course.excerpt}</p>
            </div>
          </div>

          {/* Course Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-blue-600">{course.duration || "4 weeks"}</p>
                <p className="text-xs text-muted-foreground">Duration</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <Play className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-green-600">{course.totalLessons || 12}</p>
                <p className="text-xs text-muted-foreground">Lessons</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <Users className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-purple-600">{formatNumber(course.views || 0)}</p>
                <p className="text-xs text-muted-foreground">Enrolled</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <Award className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-orange-600">Certificate</p>
                <p className="text-xs text-muted-foreground">Included</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Description */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <h2 className="text-2xl font-bold text-foreground">About This Course</h2>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {course.description}
                </p>
              </CardContent>
            </Card>

            {/* What You'll Learn */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <h2 className="text-2xl font-bold text-foreground">What You'll Learn</h2>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {[
                    "Master fundamental fitness principles",
                    "Develop proper exercise form and technique",
                    "Create personalized workout routines",
                    "Understand nutrition and meal planning",
                    "Track progress and set achievable goals",
                    "Build sustainable healthy habits"
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Prerequisites */}
            {course.prerequisites && course.prerequisites.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <h2 className="text-2xl font-bold text-foreground">Prerequisites</h2>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {course.prerequisites.map((prereq, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Target className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground">{prereq}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enrollment Card */}
            <Card className="border-0 shadow-lg sticky top-6">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-primary mb-2">
                    ${course.price}
                  </div>
                  <p className="text-muted-foreground">One-time payment</p>
                </div>

                <Button 
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="w-full bg-primary hover:bg-primary/90 mb-4"
                  size="lg"
                >
                  {enrolling ? "Enrolling..." : "Enroll Now"}
                </Button>

                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span>Lifetime access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    <span>Downloadable resources</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    <span>Certificate of completion</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    <span>Community support</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instructor Info */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <h3 className="text-lg font-semibold text-foreground">Your Instructor</h3>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{course.instructor}</h4>
                    <p className="text-sm text-muted-foreground">
                      {course.instructorRole || "Certified Trainer"}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Expert fitness professional with years of experience helping people achieve their health and fitness goals.
                </p>
              </CardContent>
            </Card>

            {/* Course Details */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <h3 className="text-lg font-semibold text-foreground">Course Details</h3>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span className="font-medium">{formatDateUTC(course.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span className="font-medium">{formatDateUTC(course.updated_at || course.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Language:</span>
                  <span className="font-medium">English</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Level:</span>
                  <span className="font-medium">{course.difficulty || "Beginner"}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
