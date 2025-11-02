"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getProxyImageUrl } from "@/lib/images";
import { formatNumber } from "@/utils/format";
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
  // Resolve best image URL for course with safe fallbacks
  const resolveCourseImage = (course: Course): string => {
    // Try multiple possible image field names from the API
    const raw = course?.image || course?.image_url || course?.main_image_url || course?.thumbnail || "";
    
    
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
          <Card key={`skeleton-${index}`} className="border-0 shadow-md bg-white">
            <CardHeader className="p-0">
              <Skeleton className="w-full h-48 rounded-t-lg" />
            </CardHeader>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-10 w-32" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const displayCourses = courses;

  if (displayCourses.length === 0 && !loading) {
    return (
      <div
        className="text-center py-16"
      >
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No courses available</h3>
          <p className="text-muted-foreground mb-6">
            We're currently updating our course catalog. Please check back later for exciting new fitness courses!
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayCourses.map((course, index) => (
        <div
          key={course.course_id}
        >
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md bg-white overflow-hidden h-full">
            <CardHeader className="p-0">
              <div className="relative overflow-hidden">
                  <Image
                    src={resolveCourseImage(course)}
                    alt={course.title}
                    width={400}
                    height={240}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    priority={index < 3}
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      const originalSrc = img.src;
                      
                      
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
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
      </div>
    </div>
  );
});

CourseGrid.displayName = "CourseGrid";

export default CourseGrid;
