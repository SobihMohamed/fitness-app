"use client";

import React, { useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { useModuleDetails } from "@/hooks/client/use-module-details";

// Lazy load heavy components for better performance
const ModuleDetailsHeader = dynamic(
  () => import("@/components/client/modules/ModuleDetailsHeader"),
  { 
    loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
  }
);

const ModuleDetailsInfo = dynamic(
  () => import("@/components/client/modules/ModuleDetailsInfo"),
  { 
    loading: () => <div className="h-48 bg-gray-100 animate-pulse rounded-lg" />
  }
);

const ModuleChaptersSection = dynamic(
  () => import("@/components/client/modules/ModuleChaptersSection"),
  { 
    loading: () => <div className="h-80 bg-gray-100 animate-pulse rounded-lg" />
  }
);

const ModuleProgressSection = dynamic(
  () => import("@/components/client/modules/ModuleProgressSection"),
  { 
    loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
  }
);

const ModuleDetailsPage = React.memo(() => {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const moduleId = params.moduleId as string;
  
  const {
    state,
    actions,
  } = useModuleDetails(moduleId, courseId);

  // Memoized handlers for better performance
  const handleBack = useCallback(() => {
    router.push(`/courses/${courseId}`);
  }, [router, courseId]);

  // Memoized calculations
  const moduleStats = useMemo(() => ({
    hasChapters: state.module?.chapters && state.module.chapters.length > 0,
    chapterCount: state.module?.chapters?.length || 0,
    moduleTitle: state.module?.title || ''
  }), [state.module]);

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-20">
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-gray-700 text-lg font-medium">Loading module details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!state.module) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-20 flex items-center justify-center">
        <Card className="shadow-2xl max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Module Not Found</h2>
            <p className="text-gray-600 mb-6">The module you are looking for does not exist or has been removed.</p>
            <Button onClick={handleBack} className="bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Course
            </Button>
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
          Back to Course
        </Button>

        {/* Module Header */}
        <ModuleDetailsHeader module={state.module} />

        {/* Module Content */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <ModuleDetailsInfo module={state.module} />
            <ModuleChaptersSection 
              chapters={state.module.chapters || []}
              moduleId={moduleId}
              courseId={courseId}
            />
          </div>
          
          <div className="lg:col-span-1">
            <ModuleProgressSection
              module={state.module}
              chapters={state.module.chapters || []}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

ModuleDetailsPage.displayName = "ModuleDetailsPage";

export default ModuleDetailsPage;
