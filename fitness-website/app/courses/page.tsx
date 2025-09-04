"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { formatNumber } from "@/utils/format";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Play,
  Star,
  Users,
  Clock,
  BookOpen,
  Search,
  ChevronRight,
  Filter,
  TrendingUp,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { API_CONFIG } from "@/config/api";
import axios from "axios";
import { toast } from "sonner";

// Interface for course data
interface Course {
  id: number;
  title: string;
  instructor: string;
  duration: string;
  lessons: number;
  students: number;
  rating: number;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  level: string;
  featured: boolean;
  description: string;
  tags?: string[];
  enrollmentStatus?: string;
  lastUpdated?: string;
  language?: string;
  type?: string;
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const scaleOnHover = {
  whileHover: {
    scale: 1.02,
    y: -4,
    transition: { type: "spring" as const, stiffness: 300, damping: 20 },
  },
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);

  const { TARGET_URL: API_TARGET, USER_COURSES_API } = API_CONFIG;

  const getFullImageUrl = useCallback(
    (imagePath: string) => {
      if (!imagePath) return "/outdoor-fitness-course.png";
      if (imagePath.startsWith("http")) return imagePath;
      return `${API_TARGET}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
    },
    [API_TARGET]
  );

  const handleEnrollCourse = useCallback(async (courseId: number) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        toast.error("Please login to enroll in courses");
        return;
      }

      const response = await axios.post(
        API_CONFIG.USER_COURSES_API.enroll,
        { courseId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status === "success") {
        toast.success("Successfully enrolled in the course!");
        setCourses((prevCourses) =>
          prevCourses.map((course) =>
            course.id === courseId
              ? { ...course, enrollmentStatus: "enrolled" }
              : course
          )
        );
      } else {
        toast.error(response.data.message || "Failed to enroll in the course");
      }
    } catch (error: any) {
      console.error("Error enrolling in course:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to enroll in the course. Please try again."
      );
    }
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const response = await axios.get(USER_COURSES_API.getAll);
        const result = response.data;

        const rawData =
          result.data ||
          result.courses ||
          (Array.isArray(result) ? result : []);

        const normalizedCourses: Course[] = rawData.map((item: any) => ({
          id: Number.parseInt(item.id || item.course_id, 10),
          title: item.title || item.name || "Untitled Course",
          instructor:
            item.instructor || item.instructor_name || "Unknown Instructor",
          duration: item.duration || `${item.weeks || 0} weeks`,
          lessons: Number.parseInt(item.lessons || item.lesson_count, 10) || 0,
          students:
            Number.parseInt(item.students || item.student_count, 10) || 0,
          rating: Number.parseFloat(item.rating) || 0,
          price: Number.parseFloat(item.price) || 0,
          originalPrice: Number.parseFloat(item.originalPrice) || undefined,
          image: getFullImageUrl(item.image_url || item.image),
          category: item.category || item.category_name || "General",
          level: item.level || item.difficulty || "Beginner",
          featured: Boolean(item.featured || item.is_featured),
          description:
            item.description ||
            item.short_description ||
            "No description available for this course.",
          enrollmentStatus:
            item.enrollment_status || item.enrollmentStatus || "not_enrolled",
        }));

        const featured = normalizedCourses.filter((course) => course.featured);
        setFeaturedCourses(featured);

        const sortedCourses = [...normalizedCourses].sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return b.rating - a.rating;
        });

        setCourses(sortedCourses);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchEnrolledCourses = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) return;

        const response = await axios.get(
          API_CONFIG.USER_FUNCTIONS.RequestForCourses.getAllMyRequests,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.status === "success" && response.data.data) {
          const enrolledCourseIds = response.data.data.map((course: any) =>
            Number.parseInt(course.id || course.course_id, 10)
          );

          setCourses((prevCourses) =>
            prevCourses.map((course) =>
              enrolledCourseIds.includes(course.id)
                ? { ...course, enrollmentStatus: "enrolled" }
                : course
            )
          );
        }
      } catch (error) {
        console.error("Error fetching enrolled courses:", error);
      }
    };

    fetchCourses();
    fetchEnrolledCourses();
  }, [
    API_TARGET,
    USER_COURSES_API.getAll,
    API_CONFIG.USER_FUNCTIONS.RequestForCourses.getAllMyRequests,
    getFullImageUrl,
  ]);

  const categories = useMemo(() => {
    return [
      "all",
      ...Array.from(new Set(courses.map((course) => course.category))),
    ];
  }, [courses]);

  const filteredCourses = useMemo(() => {
    if (!searchTerm && selectedCategory === "all") return courses;

    return courses.filter((course) => {
      const matchesSearch =
        !searchTerm ||
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || course.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [courses, searchTerm, selectedCategory]);

  const CourseCard = useMemo(
    () =>
      ({ course, featured = false }: { course: Course; featured?: boolean }) =>
        (
          <motion.div variants={fadeInUp} {...scaleOnHover} className="h-full">
            <Card
              className={`flex flex-col h-full overflow-hidden rounded-2xl border-0 shadow-lg hover:shadow-2xl transition-all duration-500 ${
                featured
                  ? "bg-gradient-to-br from-blue-50 via-white to-indigo-50"
                  : "bg-white"
              }`}
            >
              <div className="relative overflow-hidden group">
                <Image
                  src={course.image || "/placeholder.svg"}
                  alt={course.title}
                  width={400}
                  height={250}
                  className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300"></div>

                {course.featured && (
                  <Badge className="absolute top-4 left-4 bg-gradient-to-r from-amber-400 to-orange-500 text-amber-900 shadow-lg px-3 py-1.5 font-semibold">
                    <Star className="h-3 w-3 mr-1 fill-amber-900" />
                    Featured
                  </Badge>
                )}

                <Badge
                  className={`absolute top-4 right-4 shadow-lg px-3 py-1.5 font-medium ${
                    course.level === "Beginner"
                      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                      : course.level === "Intermediate"
                      ? "bg-amber-100 text-amber-800 border-amber-200"
                      : "bg-rose-100 text-rose-800 border-rose-200"
                  }`}
                >
                  {course.level}
                </Badge>

                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold">
                        {course.rating.toFixed(1)}
                      </span>
                    </div>
                    <div className="text-2xl font-bold bg-black/40 backdrop-blur-sm rounded-full px-3 py-1">
                      {course.price.toFixed(0)} EGP
                    </div>
                  </div>
                </div>
              </div>

              <CardHeader className="pb-3 pt-6">
                <CardTitle className="text-xl font-bold leading-tight text-gray-900 line-clamp-2 min-h-[3.5rem] mb-2">
                  {course.title}
                </CardTitle>
                <CardDescription className="text-blue-600 font-semibold text-base">
                  by {course.instructor}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-grow flex flex-col justify-between pt-0 pb-6">
                <div className="space-y-4 mb-6">
                  <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>

                  <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-full">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-full">
                      <BookOpen className="h-4 w-4 text-green-600" />
                      <span className="font-medium">
                        {course.lessons} lessons
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-purple-50 px-3 py-1.5 rounded-full">
                      <Users className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">
                        {formatNumber(course.students)}
                      </span>
                    </div>
                  </div>
                </div>

                {course.enrollmentStatus === "enrolled" ? (
                  <Link href={`/courses/${course.id}`} passHref>
                    <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 h-12 text-base font-semibold">
                      <BookOpen className="h-5 w-5 mr-2" />
                      Continue Learning
                      <ChevronRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Button
                      onClick={() => handleEnrollCourse(course.id)}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 h-12 text-base font-semibold"
                    >
                      <Play className="h-5 w-5 mr-2" />
                      Enroll Now
                      <ChevronRight className="h-5 w-5 ml-2" />
                    </Button>
                    <Link href={`/courses/${course.id}`} passHref>
                      <Button
                        variant="outline"
                        className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 hover:border-blue-700 h-10 font-medium bg-transparent"
                      >
                        View Details
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ),
    [handleEnrollCourse]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <section className="relative bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/abstract-fitness-pattern.png')] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-12">
            <motion.div
              className="lg:max-w-2xl"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.h1
                className="text-5xl lg:text-7xl font-black mb-6 leading-tight"
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Transform Your{" "}
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  Fitness Journey
                </span>
              </motion.h1>

              <motion.p
                className="text-xl lg:text-2xl mb-8 text-blue-100 leading-relaxed"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Join thousands of fitness enthusiasts learning from world-class
                instructors. From beginner-friendly workouts to advanced
                training programs.
              </motion.p>

              <motion.div
                className="flex flex-wrap gap-3 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                {[
                  "Expert-Led Training",
                  "Flexible Scheduling",
                  "Community Support",
                  "Progress Tracking",
                ].map((feature, index) => (
                  <Badge
                    key={feature}
                    className="bg-white/20 hover:bg-white/30 text-white border-0 px-4 py-2 text-sm font-medium backdrop-blur-sm"
                  >
                    {feature}
                  </Badge>
                ))}
              </motion.div>

              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-bold h-14 px-8 text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
                  asChild
                >
                  <Link href="#courses-grid">
                    <Play className="mr-3 h-6 w-6" />
                    Start Learning Today
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-blue-800 bg-transparent h-14 px-8 text-lg font-semibold backdrop-blur-sm"
                  asChild
                >
                  <Link href="#featured">
                    <TrendingUp className="mr-3 h-6 w-6" />
                    View Featured Courses
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              className="lg:max-w-md w-full"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
                <h3 className="text-2xl font-bold mb-6 text-center">
                  Find Your Perfect Course
                </h3>
                <div className="relative mb-6">
                  <Input
                    type="text"
                    placeholder="Search courses, instructors..."
                    className="pl-12 h-14 bg-white/10 border-white/20 text-white placeholder:text-white/70 focus-visible:ring-white text-lg rounded-2xl"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-white/70" />
                </div>
                <div className="text-center mb-6">
                  <p className="text-white/80 mb-4">
                    Popular: Yoga • HIIT • Strength Training • Pilates
                  </p>
                  <div className="flex justify-center gap-4 text-sm text-white/60">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      50K+ Students
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      4.8 Rating
                    </span>
                  </div>
                </div>
                <Button className="w-full bg-white text-indigo-700 hover:bg-white/90 h-12 text-lg font-semibold shadow-lg">
                  Explore All Courses
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="py-8 bg-white/80 backdrop-blur-sm border-b-2 border-blue-100 sticky top-0 z-20 shadow-sm"
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="relative w-full lg:w-1/2 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search courses, instructors, topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-base rounded-2xl border-2 border-blue-200 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
              />
            </div>

            <div className="flex items-center gap-4">
              <Filter className="h-5 w-5 text-gray-600" />
              <Tabs defaultValue="all" className="w-auto">
                <TabsList className="bg-blue-50 border border-blue-200 h-12 p-1 rounded-2xl">
                  {categories.map((category) => (
                    <TabsTrigger
                      key={category}
                      value={category}
                      onClick={() => setSelectedCategory(category)}
                      className="data-[state=active]:bg-blue-600 data-[state=active]:text-white px-6 py-2 rounded-xl font-medium transition-all duration-200"
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>
      </motion.section>

      <main id="courses-grid" className="py-16">
        <div className="container mx-auto px-4">
          <AnimatePresence mode="wait">
            {/* Featured Courses Section */}
            {featuredCourses.length > 0 && (
              <motion.div
                id="featured"
                className="mb-20"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                <motion.div variants={fadeInUp} className="text-center mb-12">
                  <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Featured Courses
                  </h2>
                  <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Hand-picked courses from our top-rated instructors
                  </p>
                </motion.div>

                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                  variants={staggerContainer}
                >
                  {featuredCourses.slice(0, 3).map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      featured={true}
                    />
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* All Courses Section */}
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              <motion.div variants={fadeInUp} className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4 text-gray-900">
                  All Courses
                </h2>
                <p className="text-xl text-gray-600">
                  {filteredCourses.length} courses available
                </p>
              </motion.div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="overflow-hidden rounded-2xl">
                      <Skeleton className="h-56 w-full" />
                      <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2 mt-2" />
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-12 w-full mt-4" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredCourses.length === 0 ? (
                <motion.div variants={fadeInUp} className="text-center py-20">
                  <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">
                    No courses found
                  </h3>
                  <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                    We couldn't find any courses matching your search. Try
                    adjusting your filters.
                  </p>
                  <Button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("all");
                    }}
                    className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg"
                  >
                    Clear All Filters
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                  variants={staggerContainer}
                >
                  {filteredCourses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <section className="bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/fitness-motivation-pattern.png')] opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Ready to Transform Your Life?
            </h2>
            <p className="text-xl lg:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed">
              Join over 50,000 students who have already achieved their fitness
              goals with our expert-led courses and supportive community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-bold h-14 px-8 text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
                asChild
              >
                <Link href="#courses-grid">
                  <Play className="mr-3 h-6 w-6" />
                  Start Your Journey
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-800 bg-transparent h-14 px-8 text-lg font-semibold"
                asChild
              >
                <Link href="#featured">
                  <BookOpen className="mr-3 h-6 w-6" />
                  Browse Free Previews
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
