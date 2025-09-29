"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useCourseDetails } from "@/hooks/client/use-course-details";
import { motion } from "framer-motion";

// Dynamic imports to prevent hydration mismatches
const CourseDetailsHeader = dynamic(
  () => import("@/components/client/courses/CourseDetailsHeader"),
  { ssr: false }
);

const CourseDetailsInfo = dynamic(
  () => import("@/components/client/courses/CourseDetailsInfo"),
  { ssr: false }
);

const CourseModulesSection = dynamic(
  () => import("@/components/client/courses/CourseModulesSection"),
  { ssr: false }
);

const CourseEnrollmentSection = dynamic(
  () => import("@/components/client/courses/CourseEnrollmentSection"),
  { ssr: false }
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

  // Handle back navigation
  const handleBack = React.useCallback(() => {
    router.back();
  }, [router]);

  if (state.loading) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="animate-pulse">
            <div className="flex flex-col lg:flex-row gap-10">
              <div className="lg:w-1/2">
                <div className="aspect-video bg-gray-200 rounded-xl shadow-sm" />
              </div>
              <div className="lg:w-1/2 space-y-6">
                <div className="h-10 bg-gray-200 rounded-lg w-3/4" />
                <div className="h-6 bg-gray-100 rounded-lg w-1/4" />
                <div className="h-24 bg-gray-100 rounded-lg w-full" />
                <div className="h-12 bg-gray-200 rounded-lg w-1/3" />
                <div className="h-10 bg-gray-100 rounded-lg w-full" />
                <div className="h-12 bg-gray-200 rounded-lg w-full" />
              </div>
            </div>
            <div className="mt-12 space-y-4">
              <div className="h-8 bg-gray-200 rounded-lg w-1/4" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-lg w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!state.course) {
    return (
      <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
        <div className="text-center bg-white p-12 rounded-xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Course not found</h1>
          <p className="mt-4 text-muted-foreground">The course you are looking for does not exist or has been removed.</p>
          <Button onClick={() => router.push("/courses")} className="mt-6 bg-primary hover:bg-primary/90 transition-all">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="outline" 
          onClick={handleBack} 
          className="mb-6 text-muted-foreground hover:text-foreground border-gray-200 hover:border-gray-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Courses
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Course Header */}
          <CourseDetailsHeader course={state.course} />

          {/* Course Details */}
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2">
              <CourseDetailsInfo course={state.course} />
              <CourseModulesSection 
                modules={state.course.modules || []}
                courseId={courseId}
              />
            </div>
            
            <div className="lg:col-span-1">
              <CourseEnrollmentSection
                course={state.course}
                onEnrollment={handleEnrollment}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
});

CourseDetailsPage.displayName = "CourseDetailsPage";

export default CourseDetailsPage;
