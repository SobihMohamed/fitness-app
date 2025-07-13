"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Play,
  Star,
  Users,
  Clock,
  BookOpen,
  Award,
  CheckCircle,
  PlayCircle,
  Download,
  Share2,
  Heart,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Loader2,
  Lock,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { LoginModal } from "@/components/auth/login-modal"

interface Lesson {
  id: number
  title: string
  duration: string
  type: "video" | "reading" | "quiz"
  preview: boolean
  completed?: boolean
}

interface Module {
  id: number
  title: string
  description: string
  lessons: Lesson[]
  duration: string
}

interface Review {
  id: number
  user: string
  avatar: string
  rating: number
  date: string
  comment: string
}

interface Course {
  id: number
  title: string
  instructor: {
    name: string
    bio: string
    avatar: string
    credentials: string[]
    courses: number
    students: number
  }
  description: string
  longDescription: string
  duration: string
  lessons: number
  students: number
  rating: number
  reviewCount: number
  level: "Beginner" | "Intermediate" | "Advanced"
  category: string
  price: number
  originalPrice?: number
  image: string
  videoPreview: string
  featured: boolean
  whatYouLearn: string[]
  requirements: string[]
  modules: Module[]
  reviews: Review[]
  tags: string[]
}

const courseData: Record<string, Course> = {
  "1": {
    id: 1,
    title: "Complete Strength Training Masterclass",
    instructor: {
      name: "Mike Johnson",
      bio: "Certified Personal Trainer with 15+ years of experience in strength training and bodybuilding. Former competitive powerlifter and fitness model.",
      avatar: "/placeholder.svg?height=100&width=100",
      credentials: ["NASM-CPT", "CSCS", "Precision Nutrition Level 1"],
      courses: 8,
      students: 12500,
    },
    description: "Master the fundamentals of strength training with progressive overload techniques and proper form.",
    longDescription:
      "This comprehensive strength training course will take you from beginner to advanced level, covering everything from basic movement patterns to advanced programming techniques. You'll learn proper form, progressive overload principles, and how to design effective workout programs for maximum muscle growth and strength gains.",
    duration: "12 weeks",
    lessons: 48,
    students: 1250,
    rating: 4.9,
    reviewCount: 324,
    level: "Beginner",
    category: "Strength Training",
    price: 89,
    originalPrice: 129,
    image: "/placeholder.svg?height=400&width=600",
    videoPreview: "/placeholder.svg?height=300&width=500",
    featured: true,
    whatYouLearn: [
      "Proper form and technique for all major compound movements",
      "Progressive overload principles and periodization",
      "How to design effective workout programs",
      "Nutrition strategies for muscle growth",
      "Injury prevention and mobility work",
      "Advanced training techniques and methods",
    ],
    requirements: [
      "Access to a gym or basic home equipment",
      "Willingness to learn and practice consistently",
      "No prior experience required",
    ],
    modules: [
      {
        id: 1,
        title: "Foundation & Form",
        description: "Learn the basics of strength training and master proper form",
        duration: "2 weeks",
        lessons: [
          { id: 1, title: "Introduction to Strength Training", duration: "15:30", type: "video", preview: true },
          { id: 2, title: "Basic Movement Patterns", duration: "22:45", type: "video", preview: true },
          { id: 3, title: "Squat Technique Breakdown", duration: "18:20", type: "video", preview: false },
          { id: 4, title: "Deadlift Fundamentals", duration: "20:15", type: "video", preview: false },
          { id: 5, title: "Form Assessment Quiz", duration: "10:00", type: "quiz", preview: false },
        ],
      },
      {
        id: 2,
        title: "Progressive Overload",
        description: "Understanding how to progressively increase training stimulus",
        duration: "3 weeks",
        lessons: [
          { id: 6, title: "Progressive Overload Principles", duration: "25:10", type: "video", preview: false },
          { id: 7, title: "Rep Ranges and Intensity", duration: "19:30", type: "video", preview: false },
          { id: 8, title: "Periodization Basics", duration: "28:45", type: "video", preview: false },
          { id: 9, title: "Training Log Setup", duration: "12:20", type: "reading", preview: false },
          { id: 10, title: "Week 1-3 Program", duration: "5:00", type: "reading", preview: false },
        ],
      },
      {
        id: 3,
        title: "Advanced Techniques",
        description: "Advanced training methods and program design",
        duration: "4 weeks",
        lessons: [
          { id: 11, title: "Drop Sets and Supersets", duration: "21:15", type: "video", preview: false },
          { id: 12, title: "Tempo Training", duration: "16:40", type: "video", preview: false },
          { id: 13, title: "Deload Weeks", duration: "14:25", type: "video", preview: false },
          { id: 14, title: "Program Customization", duration: "30:20", type: "video", preview: false },
          { id: 15, title: "Final Assessment", duration: "15:00", type: "quiz", preview: false },
        ],
      },
    ],
    reviews: [
      {
        id: 1,
        user: "Sarah M.",
        avatar: "/placeholder.svg?height=40&width=40",
        rating: 5,
        date: "2 weeks ago",
        comment:
          "Incredible course! Mike's teaching style is clear and easy to follow. I've seen amazing progress in just 8 weeks.",
      },
      {
        id: 2,
        user: "David L.",
        avatar: "/placeholder.svg?height=40&width=40",
        rating: 5,
        date: "1 month ago",
        comment: "Best investment I've made in my fitness journey. The progressive approach really works!",
      },
      {
        id: 3,
        user: "Emma R.",
        avatar: "/placeholder.svg?height=40&width=40",
        rating: 4,
        date: "3 weeks ago",
        comment: "Great content and well structured. Would love to see more advanced variations in future updates.",
      },
    ],
    tags: ["Strength Training", "Muscle Building", "Progressive Overload", "Compound Movements", "Beginner Friendly"],
  },
}

export default function CourseDetailPage() {
  const params = useParams()
  const courseId = params.id as string
  const course = courseData[courseId]
  const { user, isEnrolled, enrollInCourse, getProgress, loading } = useAuth()

  const [expandedModules, setExpandedModules] = useState<number[]>([1])
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [enrolling, setEnrolling] = useState(false)
  const [enrollmentSuccess, setEnrollmentSuccess] = useState(false)

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
          <Link href="/courses">
            <Button>Back to Courses</Button>
          </Link>
        </div>
      </div>
    )
  }

  const enrolled = isEnrolled(courseId)
  const progress = getProgress(courseId)

  const handleEnrollment = async () => {
    if (!user) {
      setShowLogin(true)
      return
    }

    setEnrolling(true)
    const success = await enrollInCourse(courseId)
    if (success) {
      setEnrollmentSuccess(true)
      setTimeout(() => setEnrollmentSuccess(false), 3000)
    }
    setEnrolling(false)
  }

  const toggleModule = (moduleId: number) => {
    setExpandedModules((prev) => (prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]))
  }

  const getLevelColor = (level: string) => {
    switch (level) {
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <PlayCircle className="h-4 w-4" />
      case "reading":
        return <BookOpen className="h-4 w-4" />
      case "quiz":
        return <Award className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Course Info */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <Link href="/courses" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  ← Back to Courses
                </Link>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className={getLevelColor(course.level)}>{course.level}</Badge>
                <Badge variant="outline">{course.category}</Badge>
                {course.featured && (
                  <Badge className="bg-yellow-500 text-yellow-900">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
                {enrolled && (
                  <Badge className="bg-green-500 text-white">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Enrolled
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{course.title}</h1>

              <p className="text-xl text-gray-600 mb-6">{course.description}</p>

              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-8">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{course.rating}</span>
                  <span>({course.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{course.students.toLocaleString()} students</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{course.lessons} lessons</span>
                </div>
              </div>

              {enrollmentSuccess && (
                <Alert className="mb-6">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription className="text-green-600">
                    Successfully enrolled! You can now access all course content.
                  </AlertDescription>
                </Alert>
              )}

              {/* Instructor Info */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-8">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={course.instructor.avatar || "/placeholder.svg"} alt={course.instructor.name} />
                  <AvatarFallback>
                    {course.instructor.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{course.instructor.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">{course.instructor.bio}</p>
                  <div className="flex flex-wrap gap-2">
                    {course.instructor.credentials.map((cred, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {cred}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Course Preview & Purchase */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <div className="relative">
                  <img
                    src={course.videoPreview || course.image}
                    alt="Course preview"
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-t-lg">
                    <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                      <Play className="h-5 w-5 mr-2" />
                      Preview Course
                    </Button>
                  </div>
                </div>

                <CardContent className="p-6">
                  {enrolled ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <Badge className="bg-green-500 text-white mb-4">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Enrolled
                        </Badge>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Course Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                      <Button className="w-full" size="lg" asChild>
                        <Link href={`/courses/${courseId}/learn`}>Continue Learning</Link>
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <span className="text-3xl font-bold text-blue-600">${course.price}</span>
                          {course.originalPrice && (
                            <span className="text-lg text-gray-500 line-through ml-2">${course.originalPrice}</span>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsWishlisted(!isWishlisted)}
                          className={isWishlisted ? "text-red-600 border-red-600" : ""}
                        >
                          <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
                        </Button>
                      </div>

                      <div className="space-y-3 mb-6">
                        <Button
                          className="w-full"
                          size="lg"
                          onClick={handleEnrollment}
                          disabled={enrolling || loading}
                          style={{ backgroundColor: "#007BFF" }}
                        >
                          {enrolling ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Enrolling...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Enroll Now
                            </>
                          )}
                        </Button>
                        <Button variant="outline" className="w-full bg-transparent">
                          Add to Cart
                        </Button>
                      </div>
                    </>
                  )}

                  <div className="text-center text-sm text-gray-600 mb-4">30-day money-back guarantee</div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Lifetime access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Mobile and desktop access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Certificate of completion</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Direct instructor support</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-6">
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                  <TabsTrigger value="instructor">Instructor</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-8">
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-2xl font-bold mb-4">About This Course</h3>
                      <p className="text-gray-700 leading-relaxed">{course.longDescription}</p>
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold mb-4">What You'll Learn</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {course.whatYouLearn.map((item, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold mb-4">Requirements</h3>
                      <ul className="space-y-2">
                        {course.requirements.map((req, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold mb-4">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {course.tags.map((tag, index) => (
                          <Badge key={index} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="curriculum" className="mt-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold">Course Curriculum</h3>
                      <div className="text-sm text-gray-600">
                        {course.modules.length} modules • {course.lessons} lessons
                      </div>
                    </div>

                    <div className="space-y-4">
                      {course.modules.map((module) => (
                        <Card key={module.id}>
                          <CardHeader
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() => toggleModule(module.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="text-lg">{module.title}</CardTitle>
                                <CardDescription>{module.description}</CardDescription>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-600">{module.duration}</span>
                                {expandedModules.includes(module.id) ? (
                                  <ChevronDown className="h-5 w-5" />
                                ) : (
                                  <ChevronRight className="h-5 w-5" />
                                )}
                              </div>
                            </div>
                          </CardHeader>

                          {expandedModules.includes(module.id) && (
                            <CardContent>
                              <div className="space-y-3">
                                {module.lessons.map((lesson) => (
                                  <div
                                    key={lesson.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                  >
                                    <div className="flex items-center gap-3">
                                      {getTypeIcon(lesson.type)}
                                      <div>
                                        <div className="font-medium">{lesson.title}</div>
                                        <div className="text-sm text-gray-600 flex items-center gap-2">
                                          <span>{lesson.duration}</span>
                                          {lesson.preview && (
                                            <Badge variant="outline" className="text-xs">
                                              Preview
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    {lesson.preview || enrolled ? (
                                      <Button size="sm" variant="outline">
                                        <Play className="h-4 w-4 mr-1" />
                                        {lesson.preview ? "Preview" : "Watch"}
                                      </Button>
                                    ) : (
                                      <div className="text-gray-400">
                                        <Lock className="h-4 w-4" />
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          )}
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="instructor" className="mt-8">
                  <Card>
                    <CardContent className="p-8">
                      <div className="flex items-start gap-6">
                        <Avatar className="h-24 w-24">
                          <AvatarImage
                            src={course.instructor.avatar || "/placeholder.svg"}
                            alt={course.instructor.name}
                          />
                          <AvatarFallback className="text-xl">
                            {course.instructor.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold mb-2">{course.instructor.name}</h3>
                          <p className="text-gray-600 mb-4">{course.instructor.bio}</p>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <div className="text-2xl font-bold text-blue-600">{course.instructor.courses}</div>
                              <div className="text-sm text-gray-600">Courses</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-blue-600">
                                {course.instructor.students.toLocaleString()}
                              </div>
                              <div className="text-sm text-gray-600">Students</div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2">Certifications</h4>
                            <div className="flex flex-wrap gap-2">
                              {course.instructor.credentials.map((cred, index) => (
                                <Badge key={index} variant="outline">
                                  {cred}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="reviews" className="mt-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold">Student Reviews</h3>
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{course.rating}</span>
                        <span className="text-gray-600">({course.reviewCount} reviews)</span>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {course.reviews.map((review) => (
                        <Card key={review.id}>
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <Avatar>
                                <AvatarImage src={review.avatar || "/placeholder.svg"} alt={review.user} />
                                <AvatarFallback>{review.user[0]}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-semibold">{review.user}</span>
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-4 w-4 ${
                                          i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm text-gray-600">{review.date}</span>
                                </div>
                                <p className="text-gray-700">{review.comment}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <div className="text-center">
                      <Button variant="outline">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Load More Reviews
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                {/* Progress Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{enrolled ? "Your Progress" : "Course Progress"}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Course Progress</span>
                          <span>{enrolled ? progress : 0}%</span>
                        </div>
                        <Progress value={enrolled ? progress : 0} className="h-2" />
                      </div>
                      {enrolled ? (
                        <Button className="w-full" asChild>
                          <Link href={`/courses/${courseId}/learn`}>Continue Learning</Link>
                        </Button>
                      ) : (
                        <Button
                          className="w-full"
                          onClick={handleEnrollment}
                          disabled={enrolling || loading}
                          style={{ backgroundColor: "#007BFF" }}
                        >
                          {enrolling ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Enrolling...
                            </>
                          ) : (
                            "Start Learning"
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Related Courses */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Related Courses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <img
                          src="/placeholder.svg?height=60&width=80"
                          alt="Related course"
                          className="w-20 h-15 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">Advanced Powerlifting</h4>
                          <p className="text-xs text-gray-600">Mike Johnson</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs">4.8</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <img
                          src="/placeholder.svg?height=60&width=80"
                          alt="Related course"
                          className="w-20 h-15 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">Nutrition for Athletes</h4>
                          <p className="text-xs text-gray-600">Dr. Sarah Wilson</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs">4.7</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  )
}
