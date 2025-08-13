"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
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
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Star, Users, Clock, BookOpen, Search, ChevronRight } from "lucide-react";
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

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);

  const { TARGET_URL: API_TARGET, USER_COURSES_API } = API_CONFIG;

  const getFullImageUrl = (imagePath: string) => {
    if (!imagePath) return "/placeholder.svg";
    if (imagePath.startsWith("http")) return imagePath;
    return `${API_TARGET}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
  };

  // Function to handle course enrollment
  const handleEnrollCourse = async (courseId: number) => {
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
        // Update the course status in the UI
        setCourses(prevCourses => 
          prevCourses.map(course => 
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
      toast.error(error.response?.data?.message || "Failed to enroll in the course. Please try again.");
    }
  };

  // Fetch courses once on page load with improved error handling and data normalization
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        // Use axios for better error handling
        const response = await axios.get(USER_COURSES_API.getAll);
        const result = response.data;

        const rawData =
          result.data ||
          result.courses ||
          (Array.isArray(result) ? result : []);

        // Enhanced data normalization with better fallbacks
        const normalizedCourses: Course[] = rawData.map((item: any) => ({
          id: parseInt(item.id || item.course_id, 10),
          title: item.title || item.name || "Untitled Course",
          instructor:
            item.instructor || item.instructor_name || "Unknown Instructor",
          duration: item.duration || `${item.weeks || 0} weeks`,
          lessons: parseInt(item.lessons || item.lesson_count, 10) || 0,
          students: parseInt(item.students || item.student_count, 10) || 0,
          rating: parseFloat(item.rating) || 0,
          price: parseFloat(item.price) || 0,
          originalPrice: parseFloat(item.originalPrice) || undefined,
          image: getFullImageUrl(item.image_url || item.image),
          category: item.category || item.category_name || "General",
          level: item.level || item.difficulty || "Beginner",
          featured: Boolean(item.featured || item.is_featured),
          description:
            item.description ||
            item.short_description ||
            "No description available for this course.",
          enrollmentStatus: item.enrollment_status || item.enrollmentStatus || "not_enrolled",
        }));

        // Extract featured courses
        const featured = normalizedCourses.filter(course => course.featured);
        setFeaturedCourses(featured);

        // Sort courses to show featured courses first
        const sortedCourses = [...normalizedCourses].sort((a, b) => {
          // First sort by featured status (featured courses first)
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          // Then sort by rating (higher ratings first)
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

    // Also fetch user's enrolled courses if logged in
    const fetchEnrolledCourses = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) return;

        const response = await axios.get(API_CONFIG.USER_FUNCTIONS.RequestForCourses.getAllMyRequests, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.status === "success" && response.data.data) {
          const enrolledCourseIds = response.data.data.map((course: any) => 
            parseInt(course.id || course.course_id, 10)
          );

          // Update enrollment status for courses
          setCourses(prevCourses => 
            prevCourses.map(course => 
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
  }, [API_TARGET, USER_COURSES_API.getAll, API_CONFIG.USER_FUNCTIONS.RequestForCourses.getAllMyRequests]);

  // Get unique categories from courses
  const categories = useMemo(() => {
    return ["all", ...Array.from(new Set(courses.map(course => course.category)))];
  }, [courses]);

  // Use useMemo for efficient client-side filtering
  const filteredCourses = useMemo(() => {
    if (!searchTerm && selectedCategory === "all") return courses;
    
    return courses.filter(
      (course) => {
        const matchesSearch = !searchTerm || 
          course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "all" || course.category === selectedCategory;
        return matchesSearch && matchesCategory;
      }
    );
  }, [courses, searchTerm, selectedCategory]);

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-6 md:mb-0 md:mr-8 md:max-w-2xl">
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="text-4xl lg:text-6xl font-bold mb-4"
              >
                Elevate Your <span className="text-yellow-400">Fitness Journey</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-xl mb-8 text-blue-100 max-w-3xl"
              >
                Discover expert-led courses designed to transform your health and wellness. 
                From beginner workouts to advanced training programs, find the perfect fit for your goals.
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="flex flex-wrap gap-3 mb-6"
              >
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 px-3 py-1">
                  Personalized Training
                </Badge>
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 px-3 py-1">
                  Expert Instructors
                </Badge>
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 px-3 py-1">
                  Flexible Learning
                </Badge>
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 px-3 py-1">
                  Community Support
                </Badge>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Button
                  size="lg"
                  className="bg-yellow-500 hover:bg-yellow-600 text-gray-900"
                  asChild
                >
                  <Link href="#courses-grid">
                    <Play className="mr-2 h-5 w-5" />
                    Start Learning Today
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-blue-800 bg-transparent"
                  asChild
                >
                  <Link href="#">
                    <BookOpen className="mr-2 h-5 w-5" />
                    Browse Free Previews
                  </Link>
                </Button>
              </motion.div>
            </div>
            <div className="relative max-w-md w-full">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <h3 className="text-xl font-semibold mb-4">Find Your Perfect Course</h3>
                <div className="relative mb-4">
                  <Input
                    type="text"
                    placeholder="Search courses..."
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/70 focus-visible:ring-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/70" />
                </div>
                <p className="text-sm text-white/80 mb-4">Popular searches: Yoga, HIIT, Strength Training</p>
                <Button className="w-full bg-white text-indigo-700 hover:bg-white/90">
                  Browse All Courses
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Tabs Section */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.6 }}
        className="py-6 bg-white border-b-2 sticky top-0 z-10"
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <motion.div
              initial={{ scale: 1 }}
              whileFocus={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              className="relative w-full md:w-1/2 lg:w-1/3 shadow-md rounded-full"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search for a course or instructor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-lg rounded-full border-blue-500 focus:border-blue-700 focus:ring-blue-700"
              />
            </motion.div>
            
            <Tabs defaultValue="all" className="w-full md:w-auto">
              <TabsList className="flex flex-wrap h-auto bg-transparent gap-2">
                {categories.map((category) => (
                  <TabsTrigger 
                    key={category} 
                    value={category}
                    onClick={() => setSelectedCategory(category)}
                    className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
      </motion.section>

      {/* Courses Grid Section */}
      <main id="courses-grid" className="py-16">
        <div className="container mx-auto px-4">
          {/* Featured Courses Section */}
          {featuredCourses.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <span className="bg-yellow-400 w-2 h-8 rounded mr-3"></span>
                Featured Courses
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredCourses.slice(0, 3).map((course) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card className="flex flex-col h-full overflow-hidden cursor-pointer rounded-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-white">
                      <div className="relative overflow-hidden">
                        <Image
                          src={course.image}
                          alt={course.title}
                          width={400}
                          height={250}
                          className="w-full h-52 object-cover transform hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                        <Badge className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-yellow-900 shadow-md px-3 py-1.5">
                          <Star className="h-3 w-3 mr-1 fill-yellow-900" />
                          Featured
                        </Badge>
                        <Badge
                          variant="secondary"
                          className={`absolute top-3 right-3 shadow-md px-3 py-1.5 ${course.level === 'Beginner' ? 'bg-green-100 text-green-800' : course.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}
                        >
                          {course.level}
                        </Badge>
                      </div>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-2xl font-bold text-blue-600">
                            ${course.price.toFixed(2)}
                          </span>
                          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium text-gray-700">
                              {course.rating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                        <CardTitle className="text-xl leading-tight text-gray-900 line-clamp-2 min-h-[3.5rem]">
                          {course.title}
                        </CardTitle>
                        <CardDescription className="text-blue-600 font-medium">
                          by {course.instructor}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow flex flex-col justify-between pt-0">
                        <div className="space-y-3 mb-4">
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {course.description}
                          </p>
                          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-blue-500" />
                              <span>{course.duration}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3 text-blue-500" />
                              <span>{course.lessons} lessons</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3 text-blue-500" />
                              <span>{course.students} students</span>
                            </div>
                          </div>
                        </div>
                        {course.enrollmentStatus === "enrolled" ? (
                        <Link href={`/courses/${course.id}`} passHref>
                          <Button className="w-full bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg transition-all duration-300">
                            <BookOpen className="h-4 w-4 mr-2" />
                            Continue Learning
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </Link>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <Button 
                            onClick={() => handleEnrollCourse(course.id)}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-md hover:shadow-lg transition-all duration-300"
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Enroll Now
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                          <Link href={`/courses/${course.id}`} passHref>
                            <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 mt-2">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* All Courses */}
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <span className="bg-blue-600 w-2 h-8 rounded mr-3"></span>
            All Courses
          </h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-10 w-full mt-4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredCourses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No courses found</h3>
              <p className="text-gray-600 mb-6">Try a different search term or category.</p>
              <Button onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
              }}>Clear Filters</Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course) => (
                <motion.div
                  key={course.id}
                  whileHover={{
                    scale: 1.03,
                    y: -8,
                    boxShadow: "0px 10px 30px -5px rgba(0, 0, 0, 0.1)",
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Card className="flex flex-col h-full overflow-hidden cursor-pointer rounded-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="relative overflow-hidden">
                      <Image
                        src={course.image}
                        alt={course.title}
                        width={400}
                        height={250}
                        className="w-full h-52 object-cover transform hover:scale-105 transition-transform duration-500"
                      />
                      {course.featured && (
                        <Badge className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 shadow-md px-3 py-1.5">
                          <Star className="h-3 w-3 mr-1 fill-yellow-900" />
                          Featured
                        </Badge>
                      )}
                      <Badge
                        variant="secondary"
                        className={`absolute top-3 right-3 shadow-md px-3 py-1.5 ${course.level === 'Beginner' ? 'bg-green-100 text-green-800' : course.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}
                      >
                        {course.level}
                      </Badge>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent h-16"></div>
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-2xl font-bold text-blue-600">
                          ${course.price.toFixed(2)}
                        </span>
                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium text-gray-700">
                            {course.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <CardTitle className="text-xl leading-tight text-gray-900 line-clamp-2 min-h-[3.5rem]">
                        {course.title}
                      </CardTitle>
                      <CardDescription className="text-blue-600 font-medium">
                        by {course.instructor}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col justify-between pt-0">
                      <div className="space-y-3 mb-4">
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {course.description}
                        </p>
                        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-blue-500" />
                            <span>{course.duration}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3 text-blue-500" />
                            <span>{course.lessons} lessons</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3 text-blue-500" />
                            <span>{course.students} students</span>
                          </div>
                        </div>
                      </div>
                      {course.enrollmentStatus === "enrolled" ? (
                        <Link href={`/courses/${course.id}`} passHref>
                          <Button className="w-full bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg transition-all duration-300">
                            <BookOpen className="h-4 w-4 mr-2" />
                            Continue Learning
                          </Button>
                        </Link>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <Button 
                            onClick={() => handleEnrollCourse(course.id)}
                            className="w-full bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-300"
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Enroll Now
                          </Button>
                          <Link href={`/courses/${course.id}`} passHref>
                            <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students who have already transformed their
            fitness knowledge and achieved their goals.
          </p>
          <Button
            size="lg"
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-blue-800 bg-transparent"
            asChild
          >
            <Link href="#courses-grid">Browse All Courses</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}