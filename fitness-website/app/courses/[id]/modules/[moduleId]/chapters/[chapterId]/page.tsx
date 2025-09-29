"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useChapterDetails } from "@/hooks/client/use-chapter-details";
import { motion } from "framer-motion";

// Dynamic imports to prevent hydration mismatches
const ChapterVideoPlayer = dynamic(
  () => import("@/components/client/chapters/ChapterVideoPlayer"),
  { ssr: false }
);

const ChapterDetailsInfo = dynamic(
  () => import("@/components/client/chapters/ChapterDetailsInfo"),
  { ssr: false }
);

const ChapterNavigationSection = dynamic(
  () => import("@/components/client/chapters/ChapterNavigationSection"),
  { ssr: false }
);

const ChapterNotesSection = dynamic(
  () => import("@/components/client/chapters/ChapterNotesSection"),
  { ssr: false }
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

  // Handle back navigation
  const handleBack = React.useCallback(() => {
    router.push(`/courses/${courseId}/modules/${moduleId}`);
  }, [router, courseId, moduleId]);

  if (state.loading) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="animate-pulse">
            <div className="mb-6">
              <div className="h-10 bg-gray-200 rounded-lg w-32" />
            </div>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="aspect-video bg-gray-200 rounded-xl shadow-sm mb-6" />
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="h-8 bg-gray-200 rounded-lg w-3/4 mb-4" />
                  <div className="h-4 bg-gray-100 rounded-lg w-1/2 mb-6" />
                  <div className="h-24 bg-gray-100 rounded-lg w-full" />
                </div>
              </div>
              <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                  <div className="h-6 bg-gray-200 rounded-lg w-1/2 mb-4" />
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-12 bg-gray-100 rounded-lg w-full" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!state.chapter) {
    return (
      <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
        <div className="text-center bg-white p-12 rounded-xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Chapter not found</h1>
          <p className="mt-4 text-muted-foreground">The chapter you are looking for does not exist or has been removed.</p>
          <Button onClick={handleBack} className="mt-6 bg-primary hover:bg-primary/90 transition-all">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Module
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
          Back to Module
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
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
        </motion.div>
      </div>
    </div>
  );
});

ChapterDetailsPage.displayName = "ChapterDetailsPage";

export default ChapterDetailsPage;
