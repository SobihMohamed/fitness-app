"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Alert, AlertDescription } from "@/components/ui/alert";
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
  ClipboardCheck,
  FileText,
  Globe,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  AlertCircle,
  BookmarkPlus,
} from "lucide-react";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { LoginModal } from "@/components/auth/login-modal";
import { ProtectedAction } from "@/components/auth/Protected-Route";
import { API_CONFIG } from "@/config/api";
import { toast } from "sonner";
import axios from "axios";

interface Lesson {
  id: number;
  title: string;
  duration: string;
  type: "video" | "reading" | "quiz";
  preview: boolean;
  completed?: boolean;
}

interface Module {
  id: number;
  title: string;
  description: string;
  lessons: Lesson[];
  duration: string;
}

interface Review {
  id: number;
  user: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
}

interface Course {
  id: number;
  title: string;
  instructor: {
    name: string;
    bio: string;
    avatar: string;
    credentials: string[];
    courses: number;
    students: number;
    rating?: number;
  };
  description: string;
  longDescription: string;
  duration: string;
  lessons: number;
  students: number;
  rating: number;
  reviewCount: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  videoPreview: string;
  featured: boolean;
  whatYouLearn: string[];
  requirements: string[];
  modules: Module[];
  reviews: Review[];
  tags: string[];
  certificate?: boolean;
  language?: string;
  lastUpdated?: string;
  accessType?: string;
  benefits?: string[];
  subtitles?: string[];
}

interface ApiCourse {
  id: number;
  course_id: number;
  title: string;
  description: string;
  short_description: string;
  instructor_name: string;
  duration: string;
  lessons: number;
  students: number;
  rating: number;
  price: number;
  originalPrice?: number;
  image: string;
  image_url: string;
  category: string;
  category_name: string;
  level: string;
  difficulty: string;
  featured: boolean;
  is_featured: boolean;
  weeks?: number;
  lesson_count?: number;
  student_count?: number;
}

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;
  const { user, isLoading } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<number[]>([1]);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollmentSuccess, setEnrollmentSuccess] = useState(false);
  const [userEnrolled, setUserEnrolled] = useState(false);
  const [enrollmentPending, setEnrollmentPending] = useState(false);

  const {
    TARGET_URL: API_TARGET,
    USER_COURSES_API,
    USER_FUNCTIONS,
  } = API_CONFIG;

  // Helper function to construct full image URL
  const getFullImageUrl = (imagePath: string) => {
    if (!imagePath) return "/placeholder.svg?height=400&width=600";
    // If it's already a full URL, return as is
    if (imagePath.startsWith("http")) return imagePath;
    // If it's an absolute path, prepend the API target URL
    if (imagePath.startsWith("/")) return `${API_TARGET}${imagePath}`;
    // Otherwise, assume it's a relative path and prepend the API target URL
    return `${API_TARGET}/${imagePath}`;
  };

  // Helper function to normalize course data
  const normalizeCourse = (rawData: any): Course => {
    return {
      id: parseInt(rawData.id || rawData.course_id, 10),
      title: rawData.title || rawData.name || "",
      description: rawData.short_description || rawData.description || "",
      longDescription:
        rawData.description ||
        rawData.long_description ||
        rawData.short_description ||
        "",
      instructor: {
        name:
          rawData.instructor_name || rawData.instructor || "Unknown Instructor",
        bio: rawData.instructor_bio || "Experienced fitness professional",
        avatar:
          rawData.instructor_avatar || "/placeholder.svg?height=100&width=100",
        credentials: rawData.instructor_credentials || ["Certified Trainer"],
        courses: rawData.instructor_courses || 5,
        students: rawData.instructor_students || 1000,
      },
      duration: rawData.duration || `${rawData.weeks || 0} weeks`,
      lessons: parseInt(rawData.lessons || rawData.lesson_count, 10) || 0,
      students: parseInt(rawData.students || rawData.student_count, 10) || 0,
      rating: parseFloat(rawData.rating) || 0,
      reviewCount: parseInt(rawData.review_count) || 0,
      level: rawData.level || rawData.difficulty || "Beginner",
      category: rawData.category || rawData.category_name || "General",
      price: parseFloat(rawData.price) || 0,
      originalPrice: parseFloat(rawData.originalPrice) || undefined,
      image: getFullImageUrl(rawData.image || rawData.image_url),
      videoPreview: getFullImageUrl(
        rawData.video_preview ||
          rawData.videoPreview ||
          "/placeholder.svg?height=300&width=500"
      ),
      featured: Boolean(rawData.featured || rawData.is_featured),
      whatYouLearn: rawData.what_you_learn || [
        "Master the fundamentals of training",
        "Learn proper form and technique",
        "Design effective workout programs",
      ],
      requirements: rawData.requirements || [
        "Access to basic equipment",
        "Willingness to learn and practice",
      ],
      modules: rawData.modules || [
        {
          id: 1,
          title: "Introduction",
          description: "Getting started with the course",
          duration: "1 week",
          lessons: [
            {
              id: 1,
              title: "Course Overview",
              duration: "10:00",
              type: "video",
              preview: true,
            },
            {
              id: 2,
              title: "Getting Started",
              duration: "15:00",
              type: "video",
              preview: true,
            },
          ],
        },
      ],
      reviews: rawData.reviews || [
        {
          id: 1,
          user: "Alex M.",
          avatar: "/placeholder.svg?height=40&width=40",
          rating: 5,
          date: "2 weeks ago",
          comment: "Excellent course with clear explanations!",
        },
      ],
      tags: rawData.tags || [rawData.category || "Fitness"],
    };
  };

  // Fetch course data from API with improved error handling and data normalization
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use axios for better error handling
        const res = await axios.get(USER_COURSES_API.getById(courseId));
        const result = res.data;

        // Fetch all courses for related courses section
        const allCoursesRes = await axios.get(USER_COURSES_API.getAll);
        if (allCoursesRes.data && Array.isArray(allCoursesRes.data)) {
          const normalizedCourses = allCoursesRes.data.map(normalizeCourse);
          setCourses(normalizedCourses);
        }

        // Normalize data to match our Course interface
        let rawData: any = {};
        if (result && typeof result === "object") {
          rawData = result.Course || result.course || result.data || result;
        }

        // Map API response to frontend Course structure
        const normalizedCourse = normalizeCourse(rawData);

        setCourse(normalizedCourse);
      } catch (err) {
        console.error("Error fetching course:", err);
        setError(err instanceof Error ? err.message : "Failed to load course");
        toast.error("Failed to load course");
      } finally {
        setLoading(false);
      }
    };

    const checkEnrollmentStatus = async () => {
      if (!user) return;

      try {
        // Get token from session storage or local storage
        const token =
          sessionStorage.getItem("token") || localStorage.getItem("token");

        if (!token) return;

        const response = await axios.post(
          USER_FUNCTIONS.RequestForCourses.getAllMyRequests,
          {},
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data && response.data.data) {
          // Check if the user has a request for this specific course
          const courseRequests = response.data.data;
          const courseRequest = courseRequests.find(
            (request: any) => parseInt(request.course_id) === parseInt(courseId)
          );

          if (courseRequest) {
            // Check if the request is approved
            if (courseRequest.status === "approved") {
              setUserEnrolled(true);
              setEnrollmentPending(false);
            }
            // Check if the request is pending
            else if (courseRequest.status === "pending") {
              setUserEnrolled(false);
              setEnrollmentPending(true);
            }
            // Check if the request is cancelled
            else if (courseRequest.status === "cancelled") {
              setUserEnrolled(false);
              setEnrollmentPending(false);
            }
          } else {
            // No request found for this course
            setUserEnrolled(false);
            setEnrollmentPending(false);
          }
        }
      } catch (error) {
        console.error("Error checking enrollment status:", error);
      }
    };

    if (courseId) {
      fetchCourse();
      checkEnrollmentStatus();
    }
  }, [courseId, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/courses">
            <Button>Back to Courses</Button>
          </Link>
        </div>
      </div>
    );
  }

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
    );
  }

  const progress = 0;

  const handleEnrollment = async () => {
    if (!user) {
      setShowLogin(true);
      return;
    }

    setEnrolling(true);
    try {
      // Get token from session storage or local storage
      const token =
        sessionStorage.getItem("token") || localStorage.getItem("token");

      if (!token) {
        toast.error("Authentication required. Please log in again.");
        setShowLogin(true);
        return;
      }

      const requestData = {
        course_id: Number(courseId),
      };

      const response = await axios.post(
        USER_FUNCTIONS.RequestForCourses.createRequestToAdmin,
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status === "success" || response.status === 200) {
        setEnrollmentPending(true);
        setEnrollmentSuccess(true);
        toast.success(
          "Enrollment request submitted! Please wait for approval."
        );
        setTimeout(() => setEnrollmentSuccess(false), 5000);
      } else {
        const errorMessage =
          response.data?.message ||
          response.data?.error ||
          response.data?.data?.message ||
          "Enrollment failed";
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error("Enrollment error:", error);
      if (error.response?.status === 401) {
        toast.error("Your session has expired. Please log in again.");
        setShowLogin(true);
      } else {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.response?.data?.data?.message ||
          error.response?.statusText ||
          "Server error";

        toast.error(`Enrollment failed: ${errorMessage}`);
      }
    } finally {
      setEnrolling(false);
    }
  };

  const toggleModule = (moduleId: number) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  // Calculate total course duration
  const calculateTotalDuration = () => {
    if (!course?.modules || course.modules.length === 0) return 0;

    return course.modules.reduce((total, module) => {
      const moduleDuration = module.lessons.reduce((sum, lesson) => {
        const durationMatch = lesson.duration
          ? lesson.duration.match(/\d+/)
          : null;
        const minutes = durationMatch ? parseInt(durationMatch[0]) : 0;
        return sum + minutes;
      }, 0);
      return total + moduleDuration;
    }, 0);
  };

  // Format duration to hours and minutes
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ""}`;
    }
    return `${mins}m`;
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "bg-green-100 text-green-800";
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "Advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "video":
        return <PlayCircle className="h-5 w-5 text-blue-500" />;
      case "reading":
        return <BookOpen className="h-5 w-5 text-teal-500" />;
      case "quiz":
        return <Award className="h-5 w-5 text-orange-500" />;
      case "assignment":
        return <ClipboardCheck className="h-5 w-5 text-purple-500" />;
      case "resource":
        return <FileText className="h-5 w-5 text-gray-500" />;
      default:
        return <BookOpen className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/courses">
            <Button>Back to Courses</Button>
          </Link>
        </div>
      </div>
    );
  }

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
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/courses"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
          >
            <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
            Back to Courses
          </Link>
        </div>
      </div>

      {/* Course Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-1/3">
              <div className="relative rounded-lg overflow-hidden shadow-xl">
                <Image
                  src={course.image}
                  alt={course.title}
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover"
                />
                {course.featured && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-yellow-500 text-yellow-900">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  </div>
                )}
              </div>
            </div>
            <div className="md:w-2/3">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className={`${getLevelColor(course.level)} bg-opacity-20 text-white`}>
                  {course.level}
                </Badge>
                <Badge variant="outline" className="bg-white/20 text-white border-white/40">
                  {course.category}
                </Badge>
                {userEnrolled && (
                  <Badge className="bg-green-500 text-white">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Enrolled
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold mb-4">
                {course.title}
              </h1>

              <p className="text-lg text-white/80 mb-6">
                {course.description}
              </p>

              <div className="flex flex-wrap items-center gap-6 text-sm mb-8">
                <div className="flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-full">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{course.rating}</span>
                  <span>({course.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-full">
                  <Users className="h-4 w-4" />
                  <span>{course.students.toLocaleString()} students</span>
                </div>
                <div className="flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-full">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-full">
                  <BookOpen className="h-4 w-4" />
                  <span>{course.lessons} lessons</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-white">
                    <AvatarImage
                      src={course.instructor.avatar || "/placeholder.svg"}
                      alt={course.instructor.name}
                    />
                    <AvatarFallback className="bg-blue-800 text-white text-sm font-bold">
                      {course.instructor.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm text-white/70">Instructor</p>
                    <p className="font-medium">{course.instructor.name}</p>
                  </div>
                </div>

                <div className="ml-auto">
                  <Button 
                    className="bg-white text-blue-700 hover:bg-blue-50 font-medium"
                    size="lg"
                    onClick={handleEnrollment}
                    disabled={enrolling || userEnrolled || enrollmentPending}
                  >
                    {enrolling ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : userEnrolled ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Enrolled
                      </>
                    ) : enrollmentPending ? (
                      <>
                        <Clock className="mr-2 h-4 w-4" />
                        Pending Approval
                      </>
                    ) : (
                      <>Enroll Now • ${course.price}</>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enrollment Success Alert */}
      {enrollmentSuccess && (
        <div className="container mx-auto px-4 mt-6">
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              {userEnrolled
                ? "Successfully enrolled! You can now access all course content."
                : "Enrollment request submitted! Please wait for approval."}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Course Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* About This Course */}
            <Card>
              <CardHeader>
                <CardTitle>About This Course</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {course.longDescription}
                </p>
              </CardContent>
            </Card>

            {/* What You'll Learn */}
            <Card>
              <CardHeader>
                <CardTitle>What You'll Learn</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {course.whatYouLearn.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Course Content/Modules */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Course Content</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  onClick={() => {
                    if (expandedModules.length === course.modules.length) {
                      setExpandedModules([]);
                    } else {
                      setExpandedModules(course.modules.map((m) => m.id));
                    }
                  }}
                >
                  {expandedModules.length === course.modules.length
                    ? "Collapse All"
                    : "Expand All"}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600 mb-4">
                  {course.modules.length} modules •{" "}
                  {course.modules.reduce(
                    (total, module) => total + module.lessons.length,
                    0
                  )}{" "}
                  lessons • {formatDuration(calculateTotalDuration())}{" "}
                  total length
                </div>

                <div className="space-y-3">
                  {course.modules.map((module, moduleIndex) => (
                    <div
                      key={module.id}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <button
                        className="w-full flex justify-between items-center p-4 bg-white hover:bg-gray-50 transition-colors"
                        onClick={() => toggleModule(module.id)}
                      >
                        <div className="flex items-center">
                          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-semibold mr-3">
                            {moduleIndex + 1}
                          </span>
                          <div className="text-left">
                            <h4 className="font-medium">{module.title}</h4>
                            <p className="text-sm text-gray-500">
                              {module.lessons.length} lessons •
                              {formatDuration(
                                module.lessons.reduce((sum, lesson) => {
                                  const durationMatch = lesson.duration
                                    ? lesson.duration.match(/\d+/)
                                    : null;
                                  const minutes = durationMatch
                                    ? parseInt(durationMatch[0])
                                    : 0;
                                  return sum + minutes;
                                }, 0)
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {expandedModules.includes(module.id) ? (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                      </button>

                      {expandedModules.includes(module.id) && (
                        <div className="bg-gray-50 border-t border-gray-200">
                          {module.lessons.map((lesson, lessonIndex) => (
                            <div
                              key={lesson.id}
                              className={`flex items-center p-3 ${
                                lessonIndex !== module.lessons.length - 1
                                  ? "border-b border-gray-200"
                                  : ""
                              }`}
                            >
                              <div className="flex-shrink-0 mr-3">
                                {getTypeIcon(lesson.type)}
                              </div>
                              <div className="flex-grow">
                                <p className="text-sm">{lesson.title}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {lesson.preview && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    Preview
                                  </Badge>
                                )}
                                <span className="flex-shrink-0 text-xs text-gray-500">
                                  {lesson.duration}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {course.requirements.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Instructor */}
            <Card>
              <CardHeader>
                <CardTitle>Your Instructor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <Avatar className="h-20 w-20 border-2 border-blue-200">
                    <AvatarImage
                      src={course.instructor.avatar || "/placeholder.svg"}
                      alt={course.instructor.name}
                    />
                    <AvatarFallback className="bg-blue-600 text-white text-xl font-bold">
                      {course.instructor.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl text-blue-800 mb-1">
                      {course.instructor.name}
                    </h3>
                    <p className="text-gray-700 mb-3">
                      {course.instructor.bio}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {course.instructor.credentials.map(
                        (cred: string, index: number) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-white text-blue-600 border-blue-200 px-3 py-1"
                          >
                            {cred}
                          </Badge>
                        )
                      )}
                    </div>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4 text-blue-500" />
                        <span>{course.instructor.courses} courses</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span>
                          {course.instructor.students.toLocaleString()} students
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>


          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {/* Enrollment Card */}
              <Card className="mb-6 shadow-lg border-0">
                <CardContent className="pt-6">
                  <div className="mb-6">
                    {course.originalPrice && (
                      <p className="text-lg text-gray-500 line-through">
                        ${course.originalPrice}
                      </p>
                    )}
                    <div className="flex items-end gap-2">
                      <p className="text-3xl font-bold">
                        ${course.price}
                      </p>
                      {course.originalPrice && (
                        <p className="text-sm text-green-600 font-medium mb-1">
                          {Math.round((1 - course.price / course.originalPrice) * 100)}% off
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleEnrollment}
                      disabled={enrolling || userEnrolled || enrollmentPending}
                    >
                      {enrolling ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : userEnrolled ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Enrolled
                        </>
                      ) : enrollmentPending ? (
                        <>
                          <Clock className="mr-2 h-4 w-4" />
                          Pending Approval
                        </>
                      ) : (
                        "Enroll Now"
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setIsWishlisted(!isWishlisted)}
                    >
                      {isWishlisted ? (
                        <>
                          <Heart className="mr-2 h-4 w-4 fill-current" />
                          Wishlisted
                        </>
                      ) : (
                        <>
                          <Heart className="mr-2 h-4 w-4" />
                          Add to Wishlist
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-medium mb-3">This course includes:</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>{course.duration} of content</span>
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <BookOpen className="h-4 w-4 text-gray-500" />
                        <span>{course.lessons} lessons</span>
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <Globe className="h-4 w-4 text-gray-500" />
                        <span>Full lifetime access</span>
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <Download className="h-4 w-4 text-gray-500" />
                        <span>Downloadable resources</span>
                      </li>
                      {course.certificate && (
                        <li className="flex items-center gap-2 text-sm">
                          <Award className="h-4 w-4 text-gray-500" />
                          <span>Certificate of completion</span>
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-medium mb-3">Share this course:</h4>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" className="rounded-full">
                        <Facebook className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="rounded-full">
                        <Twitter className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="rounded-full">
                        <Linkedin className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="rounded-full">
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
      />
    </div>
  );
}
