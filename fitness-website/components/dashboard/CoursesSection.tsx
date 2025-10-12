"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, PlayCircle } from "lucide-react";
import { SectionCard } from "./SectionCard";
import { EmptyState } from "./EmptyState";
import { CardSkeleton } from "./LoadingSkeleton";

interface SubscribedCourse {
  id: string;
  title: string;
  description: string;
  image?: string;
  progress?: number;
  total_modules?: number;
  completed_modules?: number;
  enrolled_at: string;
  status: string;
}

interface CoursesSectionProps {
  courses: SubscribedCourse[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function CoursesSection({ courses, isLoading, onRefresh }: CoursesSectionProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'paused':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <SectionCard
      title="My Courses"
      icon={BookOpen}
      iconColor="text-indigo-600"
      count={courses.length}
      isLoading={isLoading}
      onRefresh={onRefresh}
    >
      {isLoading ? (
        <CardSkeleton />
      ) : courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No subscribed courses"
          description="Start your fitness journey by enrolling in courses"
          actionText="Browse available courses"
          actionHref="/courses"
        />
      ) : (
        <ScrollArea className="h-[400px] pr-2">
          <div className="space-y-4">
            {courses.map((course) => (
              <div key={course.id} className="p-4 border rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 hover:shadow-md transition-all duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900 text-lg">{course.title}</h4>
                      <Badge className={`${getStatusColor(course.status)} border`}>
                        {course.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>
                    
                    {course.progress !== undefined && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                          <span className="font-medium">Progress</span>
                          <span className="font-semibold">{course.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>
                        <span className="font-medium">Enrolled:</span> {formatDate(course.enrolled_at)}
                      </span>
                      {course.total_modules && (
                        <span>
                          <span className="font-medium">Modules:</span> {course.completed_modules || 0}/{course.total_modules}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Link href={`/courses/${course.id}`}>
                      <Button 
                        size="sm" 
                        className="hover:scale-105 transition-transform duration-200 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                      >
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Continue
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </SectionCard>
  );
}
