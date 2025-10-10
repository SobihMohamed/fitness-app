"use client";

import React, { useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { useChapterDetails } from "@/hooks/client/use-chapter-details";

// Lazy load heavy components for better performance
const ChapterVideoPlayer = dynamic(
  () => import("@/components/client/chapters/ChapterVideoPlayer"),
  { 
    loading: () => <div className="aspect-video bg-gray-100 animate-pulse rounded-lg" />
  }
);

const ChapterDetailsInfo = dynamic(
  () => import("@/components/client/chapters/ChapterDetailsInfo"),
  { 
    loading: () => <div className="h-48 bg-gray-100 animate-pulse rounded-lg" />
  }
);

const ChapterNavigationSection = dynamic(
  () => import("@/components/client/chapters/ChapterNavigationSection"),
  { 
    loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
  }
);

const ChapterNotesSection = dynamic(
  () => import("@/components/client/chapters/ChapterNotesSection"),
  { 
    loading: () => <div className="h-80 bg-gray-100 animate-pulse rounded-lg" />
  }
);

const ChapterDetailsPage = React.memo(() => {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const moduleId = params.moduleId as string;
  const chapterId = params.chapterId as string;
  
  const {
    state,
    actions,
  } = useChapterDetails(chapterId, courseId);

  // Memoized handlers for better performance
  const handleBack = useCallback(() => {
    router.push(`/courses/${courseId}/modules/${moduleId}`);
  }, [router, courseId, moduleId]);

  // Memoized calculations
  const chapterStats = useMemo(() => ({
    hasVideo: !!(state.chapter as any)?.videoUrl || !!(state.chapter as any)?.video_url,
    hasNotes: state.notes && state.notes.length > 0,
    chapterTitle: state.chapter?.title || '',
    notesCount: state.notes?.length || 0
  }), [state.chapter, state.notes]);

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-20">
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-gray-700 text-lg font-medium">Loading chapter...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!state.chapter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-20 flex items-center justify-center">
        <Card className="shadow-2xl max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Chapter Not Found</h2>
            <p className="text-gray-600 mb-6">The chapter you are looking for does not exist or has been removed.</p>
            <Button onClick={handleBack} className="bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Module
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
          Back to Module
        </Button>

        {/* Chapter Content */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            {/* Video Player */}
            <ChapterVideoPlayer 
              chapter={state.chapter}
              onVideoEnd={actions.markAsCompleted}
            />
            
            {/* Chapter Info */}
            <ChapterDetailsInfo chapter={state.chapter} />
            
            {/* Notes Section */}
            <ChapterNotesSection 
              chapterId={chapterId}
              notes={state.notes}
              onAddNote={actions.addNote}
              onUpdateNote={actions.updateNote}
              onDeleteNote={actions.deleteNote}
            />
          </div>
          
          <div className="lg:col-span-1">
            {/* Navigation */}
            <ChapterNavigationSection
              currentChapter={state.chapter}
              moduleChapters={state.moduleChapters}
              courseId={courseId}
              moduleId={moduleId}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

ChapterDetailsPage.displayName = "ChapterDetailsPage";

export default ChapterDetailsPage;
