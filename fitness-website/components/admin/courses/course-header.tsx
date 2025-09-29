"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, BookOpen } from "lucide-react";
import { formatDateTimeDDMMYYYYHHmm } from "@/utils/format";
import type { Course } from "@/types";

interface CourseHeaderProps {
  course: Course | null;
}

export const CourseHeader = React.memo<CourseHeaderProps>(({ course }) => {
  const router = useRouter();

  return (
    <>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={() => router.push("/admin/courses")}
          className="gap-2 hover:bg-indigo-600 hover:border-indigo-200 transition-all duration-200"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Courses
        </Button>
      </div>

      <Card className="border-0 shadow-xl bg-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2"></div>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <BookOpen className="h-8 w-8 text-indigo-600" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold text-slate-800">
                  {course?.title || "Course Details"}
                </CardTitle>
                <CardDescription className="text-slate-600 mt-2">
                  Manage modules and chapters associated with this course
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
            <h3 className="text-sm font-medium text-slate-500 mb-2">
              Description
            </h3>
            <p className="text-slate-700">
              {course?.description || "No description provided for this course."}
            </p>
          </div>
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <span className="text-slate-500 block">Created</span>
              <span className="font-medium">
                {course?.created_at
                  ? formatDateTimeDDMMYYYYHHmm(course.created_at)
                  : "-"}
              </span>
            </div>
            {course?.price && (
              <div>
                <span className="text-slate-500 block">Price</span>
                <span className="font-medium">{course.price}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
});

CourseHeader.displayName = "CourseHeader";
