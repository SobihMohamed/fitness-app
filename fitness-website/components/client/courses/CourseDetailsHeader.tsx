"use client";

import React from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { getProxyImageUrl } from "@/lib/images";
import { formatNumber } from "@/utils/format";
import { 
  Clock, 
  Users, 
  Star, 
  Award,
  Calendar,
  BookOpen
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
  modules?: any[];
}

interface CourseDetailsHeaderProps {
  course: Course;
}

const CourseDetailsHeader = React.memo<CourseDetailsHeaderProps>(({ course }) => {
  const resolveCourseImage = (course: Course): string => {
    // Try multiple possible image field names from the API
    const raw = course?.image || course?.image_url || course?.main_image_url || course?.thumbnail || "";
    
    // Debug log to see what image data we're getting
    if (process.env.NODE_ENV === 'development') {
      console.log('Course detail image data:', { 
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
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1549476464-37392f717541?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop'
      ];
      
      // Use course ID to consistently pick the same image for the same course
      const imageIndex = course.course_id % sampleImages.length;
      return getProxyImageUrl(sampleImages[imageIndex]);
    }
    
    return getProxyImageUrl(raw);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Course Image */}
        <div className="relative">
          <Image
            unoptimized
            src={resolveCourseImage(course)}
            alt={course.title}
            width={600}
            height={400}
            className="w-full h-64 lg:h-full object-cover"
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement;
              img.onerror = null;
              img.src = "/placeholder.svg";
            }}
          />
          
          {/* Level Badge */}
          <div className="absolute top-4 left-4">
            <Badge variant="secondary" className="bg-white/90 text-gray-800 font-medium">
              {course.level || "All Levels"}
            </Badge>
          </div>

          {/* Price Badge */}
          <div className="absolute top-4 right-4">
            <Badge className="bg-primary text-white font-bold text-lg px-4 py-2">
              {formatNumber(course.price)} EGP
            </Badge>
          </div>
        </div>

        {/* Course Info */}
        <div className="p-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              {course.title}
            </h1>

            {course.instructor && (
              <p className="text-lg text-muted-foreground mb-6">
                Instructor: <span className="font-semibold text-foreground">{course.instructor}</span>
              </p>
            )}

            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              {course.description}
            </p>

            {/* Course Stats */}
            <div className="grid grid-cols-2 gap-6">
              {course.duration && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-semibold">{course.duration}</p>
                  </div>
                </div>
              )}

              {course.students_count && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Students</p>
                    <p className="font-semibold">{formatNumber(course.students_count)}</p>
                  </div>
                </div>
              )}

              {course.rating && course.rating > 0 && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Rating</p>
                    <p className="font-semibold">{course.rating} / 5</p>
                  </div>
                </div>
              )}

              {course.modules && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Modules</p>
                    <p className="font-semibold">{course.modules.length}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-semibold">{formatDate(course.created_at)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Award className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Certificate</p>
                  <p className="font-semibold">Included</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

CourseDetailsHeader.displayName = "CourseDetailsHeader";

export default CourseDetailsHeader;
