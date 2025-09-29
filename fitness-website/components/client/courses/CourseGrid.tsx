"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/common/LoadingSkeletons";
import { getProxyImageUrl } from "@/lib/images";
import { formatNumber } from "@/utils/format";
import { motion } from "framer-motion";
import { 
  Clock, 
  Users, 
  Star, 
  Play, 
  BookOpen,
  Award,
  ChevronRight 
} from "lucide-react";

interface Course {
  course_id: number;
  title: string;
  description: string;
  price: number;
  image: string;
  image_url?: string;
  main_image_url?: string;
  thumbnail?: string;
  instructor?: string;
  duration?: string;
  level?: string;
  students_count?: number;
  rating?: number;
  created_at: string;
}

interface CourseGridProps {
  courses: Course[];
  loading: boolean;
}

const CourseGrid = React.memo<CourseGridProps>(({ courses, loading }) => {
  // Debug log to see what we're receiving
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('CourseGrid render:', { 
        coursesLength: courses?.length || 0, 
        loading, 
        courses: courses?.slice(0, 2) // Show first 2 courses for debugging
      });
    }
  }, [courses, loading]);
  // Resolve best image URL for course with safe fallbacks
  const resolveCourseImage = (course: Course): string => {
    // Try multiple possible image field names from the API
    const raw = course?.image || course?.image_url || course?.main_image_url || course?.thumbnail || "";
    
    // Debug log to see what image data we're getting
    if (process.env.NODE_ENV === 'development') {
      console.log('Course image data:', { 
        courseId: course.course_id, 
        title: course.title,
        image: course.image,
        image_url: course?.image_url,
        main_image_url: course?.main_image_url,
        raw 
      });
    }
    
    // If no image data, try to use a sample fitness image based on course title
    if (!raw || raw.trim() === '' || raw === 'null' || raw === 'undefined') {
      // For testing purposes, let's use some sample fitness images from a public CDN
      const sampleImages = [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=240&fit=crop',
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=240&fit=crop',
        'https://images.unsplash.com/photo-1549476464-37392f717541?w=400&h=240&fit=crop',
        'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=240&fit=crop',
        'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=240&fit=crop'
      ];
      
      // Use course ID to consistently pick the same image for the same course
      const imageIndex = course.course_id % sampleImages.length;
      return getProxyImageUrl(sampleImages[imageIndex]);
    }
    
    return getProxyImageUrl(raw);
  };

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array(6).fill(0).map((_, index) => (
          <CardSkeleton key={`skeleton-${index}`} />
        ))}
      </div>
    );
  }

  // Create mock courses for testing - always show these if no real data
  const mockCourses: Course[] = [
    {
      course_id: 1,
      title: "Beginner Fitness Program",
      description: "A comprehensive fitness program designed for beginners to build strength and endurance.",
      price: 1000,
      image: "",
      instructor: "John Doe",
      duration: "8 weeks",
      level: "Beginner",
      students_count: 150,
      rating: 4.5,
      created_at: new Date().toISOString()
    },
    {
      course_id: 2,
      title: "Advanced Strength Training",
      description: "Take your strength training to the next level with advanced techniques and programming.",
      price: 1500,
      image: "",
      instructor: "Jane Smith",
      duration: "12 weeks",
      level: "Advanced",
      students_count: 89,
      rating: 4.8,
      created_at: new Date().toISOString()
    },
    {
      course_id: 3,
      title: "Yoga & Flexibility",
      description: "Improve your flexibility and mindfulness with our comprehensive yoga program.",
      price: 800,
      image: "",
      instructor: "Sarah Johnson",
      duration: "6 weeks",
      level: "All Levels",
      students_count: 200,
      rating: 4.7,
      created_at: new Date().toISOString()
    }
  ];

  // Use real courses if available, otherwise use mock courses
  const displayCourses = courses.length > 0 ? courses : mockCourses;
  const showMockWarning = courses.length === 0 && !loading;

  if (displayCourses.length === 0 && !loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No courses available</h3>
          <p className="text-muted-foreground mb-6">
            Check back later for new courses or contact support.
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {showMockWarning && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 text-sm">
            <strong>Development Mode:</strong> No courses found from API, showing sample courses for testing.
          </p>
        </div>
      )}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayCourses.map((course, index) => (
        <motion.div
          key={course.course_id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md bg-white overflow-hidden h-full">
            <CardHeader className="p-0">
              <div className="relative overflow-hidden">
                  <Image
                    unoptimized
                    src={resolveCourseImage(course)}
                    alt={course.title}
                    width={400}
                    height={240}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      const originalSrc = img.src;
                      
                      // Debug log for image loading errors
                      if (process.env.NODE_ENV === 'development') {
                        console.log('Image failed to load:', {
                          courseId: course.course_id,
                          title: course.title,
                          originalSrc,
                          imageData: course.image
                        });
                      }
                      
                      img.onerror = null;
                      img.src = "/placeholder.svg";
                    }}
                  />
                
                {/* Overlay with level badge */}
                <div className="absolute top-4 left-4">
                  <Badge 
                    variant="secondary" 
                    className="bg-white/90 text-gray-800 font-medium"
                  >
                    {course.level || "All Levels"}
                  </Badge>
                </div>

                {/* Price badge */}
                <div className="absolute top-4 right-4">
                  <Badge className="bg-primary text-white font-bold">
                    {formatNumber(course.price)} EGP
                  </Badge>
                </div>

                {/* Play button overlay */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                    <Play className="w-6 h-6 text-primary ml-1" />
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 flex flex-col h-full">
              {/* Course Title */}
              <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                {course.title}
              </h3>

              {/* Inline quick details link (fallback CTA) */}
              <div className="mb-3">
                <Link
                  href={`/courses/${course.course_id}`}
                  className="text-sm text-primary hover:underline inline-flex items-center"
                >
                  View details
                  <ChevronRight className="w-3 h-3 ml-1" />
                </Link>
              </div>

              {/* Instructor */}
              {course.instructor && (
                <p className="text-sm text-muted-foreground mb-3">
                  by {course.instructor}
                </p>
              )}

              {/* Description */}
              <p className="text-muted-foreground text-sm mb-4 line-clamp-3 flex-grow">
                {course.description}
              </p>

              {/* Course Stats */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                {course.duration && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration}</span>
                  </div>
                )}
                
                {course.students_count && (
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{formatNumber(course.students_count)}</span>
                  </div>
                )}

                {course.rating && course.rating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{course.rating}</span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                  <Link href={`/courses/${course.course_id}`} className="block">
                    View Course Details
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
      </div>
    </div>
  );
});

CourseGrid.displayName = "CourseGrid";

export default CourseGrid;
