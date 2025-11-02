"use client";

import React, { useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, AlertCircle, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useCourseDetails } from "@/hooks/client/use-course-details";
import { useCourseRequests } from "@/hooks/client/use-course-requests";

// Lazy load heavy components for better performance
const CourseDetailsHeader = dynamic(
  () => import("@/components/client/courses/CourseDetailsHeader"),
  { 
    loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />
  }
);

const CourseDetailsInfo = dynamic(
  () => import("@/components/client/courses/CourseDetailsInfo"),
  { 
    loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
  }
);

const CourseModulesSection = dynamic(
  () => import("@/components/client/courses/CourseModulesSection"),
  { 
    loading: () => <div className="h-80 bg-gray-100 animate-pulse rounded-lg" />
  }
);

const CourseEnrollmentSection = dynamic(
  () => import("@/components/client/courses/CourseEnrollmentSection"),
  { 
    loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />
  }
);

const CourseDetailsPage = React.memo(() => {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  
  const {
    state,
    actions,
    handleEnrollment,
  } = useCourseDetails(courseId);
  
  const { getCourseRequestStatus } = useCourseRequests();
  
  // Get enrollment status for this course
  const { isSubscribed, status } = state.course ? getCourseRequestStatus(state.course.course_id) : { isSubscribed: false, status: null };

  // Memoized handlers for better performance
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleCoursesRedirect = useCallback(() => {
    router.push("/courses");
  }, [router]);

  // Memoized calculations
  const courseStats = useMemo(() => ({
    hasModules: state.course?.modules && state.course.modules.length > 0,
    isEnrolled: isSubscribed,
    enrollmentStatus: status,
    courseTitle: state.course?.title || '',
    moduleCount: state.course?.modules?.length || 0
  }), [state.course, isSubscribed, status]);

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-20">
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-gray-700 text-lg font-medium">Loading course details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!state.course || state.error) {
    const isAuthError = state.error?.includes("log in") || state.error?.includes("authentication");
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-20 flex items-center justify-center p-4">
        <Card className="shadow-2xl max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            {isAuthError ? (
              <>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
                <p className="text-gray-600 mb-6">
                  Please log in to view course details and access the learning materials.
                </p>
                <div className="flex flex-col gap-3">
                  <Button onClick={() => router.push("/auth/login")} className="bg-blue-600 hover:bg-blue-700">
                    Log In to Continue
                  </Button>
                  <Button onClick={handleCoursesRedirect} variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Courses
                  </Button>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h2>
                <p className="text-gray-600 mb-6">
                  {state.error || "The course you are looking for does not exist or has been removed."}
                </p>
                <Button onClick={handleCoursesRedirect} className="bg-blue-600 hover:bg-blue-700">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Courses
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="outline" 
          onClick={handleBack} 
          className="mb-6 text-gray-600 hover:text-gray-900 border-gray-200 hover:border-gray-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Courses
        </Button>

        {/* Course Header */}
        <CourseDetailsHeader course={state.course} />

        {/* Course Details */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <CourseDetailsInfo course={state.course} />
            <CourseModulesSection 
              modules={state.course.modules || []}
              courseId={courseId}
              isEnrolled={courseStats.isEnrolled}
              enrollmentStatus={courseStats.enrollmentStatus}
            />
          </div>
          
          <div className="lg:col-span-1">
            <CourseEnrollmentSection
              course={state.course}
              onEnrollment={handleEnrollment}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

CourseDetailsPage.displayName = "CourseDetailsPage";

export default CourseDetailsPage;
