"use client";

import { useState, useEffect, useMemo, useCallback, memo } from "react";
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
  ArrowLeft,
  TrendingUp,
  Shield,
  Smartphone,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { LoginModal } from "@/components/auth/login-modal";
import { ProtectedAction } from "@/components/auth/Protected-Route";
import { API_CONFIG } from "@/config/api";
import { toast } from "sonner";
import axios from "axios";
import { formatNumber } from "@/utils/format";

// <CHANGE> Enhanced TypeScript interfaces with better typing
interface Lesson {
  id: number;
  title: string;
  duration: string;
  type: "video" | "reading" | "quiz" | "assignment" | "resource";
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

interface Instructor {
  name: string;
  bio: string;
  avatar: string;
  credentials: string[];
  courses: number;
  students: number;
  rating?: number;
}

interface Course {
  id: number;
  title: string;
  instructor: Instructor;
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

// <CHANGE> Memoized components for better performance
const CourseStats = memo(({ course }: { course: Course }) => (
  <div className="flex flex-wrap items-center gap-4 text-sm">
    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      <span className="font-semibold">{course.rating}</span>
      <span className="text-white/80">({course.reviewCount} reviews)</span>
    </div>
    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
      <Users className="h-4 w-4" />
      <span>{formatNumber(course.students)} students</span>
    </div>
    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
      <Clock className="h-4 w-4" />
      <span>{course.duration}</span>
    </div>
    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
      <BookOpen className="h-4 w-4" />
      <span>{course.lessons} lessons</span>
    </div>
  </div>
));

const LessonItem = memo(
  ({
    lesson,
    moduleIndex,
    lessonIndex,
  }: {
    lesson: Lesson;
    moduleIndex: number;
    lessonIndex: number;
  }) => {
    const getTypeIcon = useCallback((type: string) => {
      const iconProps = { className: "h-4 w-4" };
      switch (type?.toLowerCase()) {
        case "video":
          return (
            <PlayCircle {...iconProps} className="h-4 w-4 text-blue-500" />
          );
        case "reading":
          return (
            <BookOpen {...iconProps} className="h-4 w-4 text-emerald-500" />
          );
        case "quiz":
          return <Award {...iconProps} className="h-4 w-4 text-orange-500" />;
        case "assignment":
          return (
            <ClipboardCheck
              {...iconProps}
              className="h-4 w-4 text-purple-500"
            />
          );
        case "resource":
          return <FileText {...iconProps} className="h-4 w-4 text-gray-500" />;
        default:
          return <BookOpen {...iconProps} className="h-4 w-4 text-gray-500" />;
      }
    }, []);

    return (
      <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">{getTypeIcon(lesson.type)}</div>
          <div>
            <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
              {lesson.title}
            </p>
            <p className="text-sm text-gray-500 capitalize">{lesson.type}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {lesson.preview && (
            <Badge
              variant="outline"
              className="text-xs bg-blue-50 text-blue-600 border-blue-200"
            >
              <Play className="h-3 w-3 mr-1" />
              Preview
            </Badge>
          )}
          <span className="text-sm text-gray-500 font-medium">
            {lesson.duration}
          </span>
          {lesson.completed && (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
        </div>
      </div>
    );
  }
);

const ModuleCard = memo(
  ({
    module,
    moduleIndex,
    isExpanded,
    onToggle,
  }: {
    module: Module;
    moduleIndex: number;
    isExpanded: boolean;
    onToggle: () => void;
  }) => {
    const totalDuration = useMemo(() => {
      return module.lessons.reduce((sum, lesson) => {
        const durationMatch = lesson.duration?.match(/\d+/);
        return sum + (durationMatch ? parseInt(durationMatch[0]) : 0);
      }, 0);
    }, [module.lessons]);

    const formatDuration = useCallback((minutes: number) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return hours > 0 ? `${hours}h ${mins > 0 ? `${mins}m` : ""}` : `${mins}m`;
    }, []);

    return (
      <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <button
          className="w-full flex justify-between items-center p-6 bg-white hover:bg-gray-50 transition-colors"
          onClick={onToggle}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-sm">
              {moduleIndex + 1}
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-gray-900 text-lg">
                {module.title}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {module.lessons.length} lessons •{" "}
                {formatDuration(totalDuration)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-sm text-gray-500">
                {module.lessons.length} lessons
              </p>
            </div>
            <div className="p-1">
              {isExpanded ? (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-400" />
              )}
            </div>
          </div>
        </button>

        {isExpanded && (
          <div className="bg-gray-50 border-t border-gray-200">
            {module.lessons.map((lesson, lessonIndex) => (
              <div
                key={lesson.id}
                className={
                  lessonIndex !== module.lessons.length - 1
                    ? "border-b border-gray-200"
                    : ""
                }
              >
                <LessonItem
                  lesson={lesson}
                  moduleIndex={moduleIndex}
                  lessonIndex={lessonIndex}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

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

  // <CHANGE> Memoized helper functions for better performance
  const getFullImageUrl = useCallback(
    (imagePath: string) => {
      if (!imagePath) return "/placeholder.svg?height=400&width=600";
      if (imagePath.startsWith("http")) return imagePath;
      if (imagePath.startsWith("/")) return `${API_TARGET}${imagePath}`;
      return `${API_TARGET}/${imagePath}`;
    },
    [API_TARGET]
  );

  const normalizeCourse = useCallback(
    (rawData: any): Course => {
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
            rawData.instructor_name ||
            rawData.instructor ||
            "Unknown Instructor",
          bio: rawData.instructor_bio || "Experienced fitness professional",
          avatar:
            rawData.instructor_avatar ||
            "/placeholder.svg?height=100&width=100",
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
    },
    [getFullImageUrl]
  );

  // <CHANGE> Memoized calculations for performance
  const courseStats = useMemo(() => {
    if (!course?.modules) return { totalDuration: 0, totalLessons: 0 };

    const totalDuration = course.modules.reduce((total, module) => {
      const moduleDuration = module.lessons.reduce((sum, lesson) => {
        const durationMatch = lesson.duration?.match(/\d+/);
        return sum + (durationMatch ? parseInt(durationMatch[0]) : 0);
      }, 0);
      return total + moduleDuration;
    }, 0);

    const totalLessons = course.modules.reduce(
      (total, module) => total + module.lessons.length,
      0
    );

    return { totalDuration, totalLessons };
  }, [course?.modules]);

  const formatDuration = useCallback((minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins > 0 ? `${mins}m` : ""}` : `${mins}m`;
  }, []);

  const getLevelColor = useCallback((level: string) => {
    switch (level) {
      case "Beginner":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Intermediate":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Advanced":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  }, []);

  // <CHANGE> Optimized API calls with better error handling
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError(null);

        const [courseRes, allCoursesRes] = await Promise.all([
          axios.get(USER_COURSES_API.getById(courseId)),
          axios.get(USER_COURSES_API.getAll),
        ]);

        if (allCoursesRes.data && Array.isArray(allCoursesRes.data)) {
          const normalizedCourses = allCoursesRes.data.map(normalizeCourse);
          setCourses(normalizedCourses);
        }

        const result = courseRes.data;
        let rawData: any = {};
        if (result && typeof result === "object") {
          rawData = result.Course || result.course || result.data || result;
        }

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

        if (response.data?.data) {
          const courseRequests = response.data.data;
          const courseRequest = courseRequests.find(
            (request: any) => parseInt(request.course_id) === parseInt(courseId)
          );

          if (courseRequest) {
            setUserEnrolled(courseRequest.status === "approved");
            setEnrollmentPending(courseRequest.status === "pending");
          } else {
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
  }, [courseId, user, normalizeCourse, USER_COURSES_API, USER_FUNCTIONS]);

  const handleEnrollment = useCallback(async () => {
    if (!user) {
      setShowLogin(true);
      return;
    }

    setEnrolling(true);
    try {
      const token =
        sessionStorage.getItem("token") || localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication required. Please log in again.");
        setShowLogin(true);
        return;
      }

      const response = await axios.post(
        USER_FUNCTIONS.RequestForCourses.createRequestToAdmin,
        { course_id: Number(courseId) },
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
          response.data?.message || response.data?.error || "Enrollment failed";
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
          error.response?.statusText ||
          "Server error";
        toast.error(`Enrollment failed: ${errorMessage}`);
      }
    } finally {
      setEnrolling(false);
    }
  }, [user, courseId, USER_FUNCTIONS, setShowLogin]);

  const toggleModule = useCallback((moduleId: number) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  }, []);

  const toggleAllModules = useCallback(() => {
    if (!course?.modules) return;

    if (expandedModules.length === course.modules.length) {
      setExpandedModules([]);
    } else {
      setExpandedModules(course.modules.map((m) => m.id));
    }
  }, [course?.modules, expandedModules.length]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full h-20 w-20 border-4 border-transparent border-t-blue-400 animate-pulse mx-auto"></div>
          </div>
          <p className="text-xl text-gray-700 font-medium">Loading course...</p>
          <p className="text-sm text-gray-500 mt-2">
            Please wait while we fetch the details
          </p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="bg-red-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold mb-4 text-red-800">
            {error ? "Error Loading Course" : "Course Not Found"}
          </h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            {error ||
              "The course you're looking for doesn't exist or has been removed."}
          </p>
          <Link href="/courses">
            <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Courses
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* <CHANGE> Enhanced navigation with better styling */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50 border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/courses"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Courses
          </Link>
        </div>
      </div>

      {/* <CHANGE> Enhanced course header with modern gradient and better layout */}
      <div className="relative bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-transparent"></div>

        <div className="relative container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="flex flex-wrap gap-3 mb-6">
                <Badge className={`${getLevelColor(course.level)} border`}>
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {course.level}
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-white/10 text-white border-white/30 backdrop-blur-sm"
                >
                  {course.category}
                </Badge>
                {course.featured && (
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-yellow-900 border-0">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    Featured
                  </Badge>
                )}
                {userEnrolled && (
                  <Badge className="bg-green-500 text-white border-0">
                    <CheckCircle className="h-3 w-3" />
                    Enrolled
                  </Badge>
                )}
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                {course.title}
              </h1>

              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                {course.description}
              </p>

              <CourseStats course={course} />

              <div className="flex items-center gap-6 mt-8 pt-8 border-t border-white/20">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border-2 border-white/30">
                    <AvatarImage
                      src={course.instructor.avatar || "/placeholder.svg"}
                      alt={course.instructor.name}
                    />
                    <AvatarFallback className="bg-blue-800 text-white font-bold">
                      {course.instructor.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm text-white/70">Instructor</p>
                    <p className="font-semibold text-lg">
                      {course.instructor.name}
                    </p>
                  </div>
                </div>

                <div className="ml-auto">
                  <Button
                    className="bg-white text-blue-700 hover:bg-blue-50 font-semibold px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all"
                    size="lg"
                    onClick={handleEnrollment}
                    disabled={enrolling || userEnrolled || enrollmentPending}
                  >
                    {enrolling ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : userEnrolled ? (
                      <>
                        <CheckCircle className="mr-2 h-5 w-5" />
                        Enrolled
                      </>
                    ) : enrollmentPending ? (
                      <>
                        <Clock className="mr-2 h-5 w-5" />
                        Pending Approval
                      </>
                    ) : (
                      <>Enroll Now • ${course.price}</>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl blur-2xl opacity-30 scale-105"></div>
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/20">
                  <Image
                    src={course.image || "/placeholder.svg"}
                    alt={course.title}
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* <CHANGE> Enhanced enrollment success alert */}
      {enrollmentSuccess && (
        <div className="container mx-auto px-4 mt-8">
          <Alert className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <AlertDescription className="text-green-800 font-medium">
              {userEnrolled
                ? "🎉 Successfully enrolled! You can now access all course content."
                : "📝 Enrollment request submitted! Please wait for approval."}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* <CHANGE> Enhanced main content with better spacing and modern cards */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Course Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* About This Course */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                  About This Course
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {course.longDescription}
                </p>
              </CardContent>
            </Card>

            {/* What You'll Learn */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Award className="h-6 w-6 text-green-600" />
                  What You'll Learn
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {course.whatYouLearn.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-green-50 transition-colors"
                    >
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Course Content/Modules */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <PlayCircle className="h-6 w-6 text-purple-600" />
                  Course Content
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                  onClick={toggleAllModules}
                >
                  {expandedModules.length === course.modules.length
                    ? "Collapse All"
                    : "Expand All"}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6 border border-blue-100">
                  <div className="flex flex-wrap gap-6 text-sm font-medium text-gray-700">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>{course.modules.length} modules</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>{formatNumber(courseStats.totalLessons)} lessons</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>
                        {formatDuration(courseStats.totalDuration)} total length
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {course.modules.map((module, moduleIndex) => (
                    <ModuleCard
                      key={module.id}
                      module={module}
                      moduleIndex={moduleIndex}
                      isExpanded={expandedModules.includes(module.id)}
                      onToggle={() => toggleModule(module.id)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Shield className="h-6 w-6 text-orange-600" />
                  Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {course.requirements.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-orange-50 transition-colors"
                    >
                      <CheckCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* <CHANGE> Enhanced instructor section with better layout */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Users className="h-6 w-6 text-indigo-600" />
                  Your Instructor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row items-start gap-8">
                  <div className="flex-shrink-0">
                    <Avatar className="h-24 w-24 border-4 border-indigo-200 shadow-lg">
                      <AvatarImage
                        src={course.instructor.avatar || "/placeholder.svg"}
                        alt={course.instructor.name}
                      />
                      <AvatarFallback className="bg-indigo-600 text-white text-2xl font-bold">
                        {course.instructor.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-2xl text-indigo-800 mb-2">
                      {course.instructor.name}
                    </h3>
                    <p className="text-gray-700 mb-4 leading-relaxed text-lg">
                      {course.instructor.bio}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {course.instructor.credentials.map(
                        (cred: string, index: number) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-indigo-50 text-indigo-700 border-indigo-200 px-3 py-1 font-medium"
                          >
                            {cred}
                          </Badge>
                        )
                      )}
                    </div>
                    <div className="flex gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                        <BookOpen className="h-4 w-4 text-indigo-500" />
                        <span className="font-medium">
                          {formatNumber(course.instructor.courses)} courses
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                        <Users className="h-4 w-4 text-indigo-500" />
                        <span className="font-medium">
                          {formatNumber(course.instructor.students)} students
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* <CHANGE> Enhanced right sidebar with modern styling */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
                  <div className="mb-4">
                    {course.originalPrice && (
                      <p className="text-lg text-white/70 line-through">
                        ${course.originalPrice}
                      </p>
                    )}
                    <div className="flex items-end gap-3">
                      <p className="text-4xl font-bold">${course.price}</p>
                      {course.originalPrice && (
                        <p className="text-sm bg-green-500 text-white px-2 py-1 rounded-full font-medium mb-2">
                          {Math.round(
                            (1 - course.price / course.originalPrice) * 100
                          )}
                          % off
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="space-y-3 mb-6">
                    <Button
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all"
                      size="lg"
                      onClick={handleEnrollment}
                      disabled={enrolling || userEnrolled || enrollmentPending}
                    >
                      {enrolling ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : userEnrolled ? (
                        <>
                          <CheckCircle className="mr-2 h-5 w-5" />
                          Enrolled
                        </>
                      ) : enrollmentPending ? (
                        <>
                          <Clock className="mr-2 h-5 w-5" />
                          Pending Approval
                        </>
                      ) : (
                        "Enroll Now"
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full border-2 hover:bg-red-50 hover:border-red-300 transition-colors"
                      onClick={() => setIsWishlisted(!isWishlisted)}
                    >
                      {isWishlisted ? (
                        <>
                          <Heart className="mr-2 h-4 w-4 fill-red-500 text-red-500" />
                          <span className="text-red-600 font-medium">
                            Wishlisted
                          </span>
                        </>
                      ) : (
                        <>
                          <Heart className="mr-2 h-4 w-4" />
                          Add to Wishlist
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="font-semibold mb-4 text-gray-900">
                      This course includes:
                    </h4>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3 text-sm">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Clock className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-gray-700 font-medium">
                          {course.duration} of content
                        </span>
                      </li>
                      <li className="flex items-center gap-3 text-sm">
                        <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <BookOpen className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="text-gray-700 font-medium">
                          {course.lessons} lessons
                        </span>
                      </li>
                      <li className="flex items-center gap-3 text-sm">
                        <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <Globe className="h-4 w-4 text-purple-600" />
                        </div>
                        <span className="text-gray-700 font-medium">
                          Full lifetime access
                        </span>
                      </li>
                      <li className="flex items-center gap-3 text-sm">
                        <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <Download className="h-4 w-4 text-orange-600" />
                        </div>
                        <span className="text-gray-700 font-medium">
                          Downloadable resources
                        </span>
                      </li>
                      <li className="flex items-center gap-3 text-sm">
                        <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                          <Smartphone className="h-4 w-4 text-indigo-600" />
                        </div>
                        <span className="text-gray-700 font-medium">
                          Mobile & desktop access
                        </span>
                      </li>
                      {course.certificate && (
                        <li className="flex items-center gap-3 text-sm">
                          <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                            <Award className="h-4 w-4 text-yellow-600" />
                          </div>
                          <span className="text-gray-700 font-medium">
                            Certificate of completion
                          </span>
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="border-t border-gray-200 pt-6 mt-6">
                    <h4 className="font-semibold mb-4 text-gray-900">
                      Share this course:
                    </h4>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full hover:bg-blue-50 hover:border-blue-300"
                      >
                        <Facebook className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full hover:bg-sky-50 hover:border-sky-300"
                      >
                        <Twitter className="h-4 w-4 text-sky-600" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full hover:bg-blue-50 hover:border-blue-300"
                      >
                        <Linkedin className="h-4 w-4 text-blue-700" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full hover:bg-gray-50 hover:border-gray-300"
                      >
                        <Mail className="h-4 w-4 text-gray-600" />
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
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
}
