"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  Clock, 
  CheckCircle, 
  Lock,
  FileText,
  Video,
  ChevronRight
} from "lucide-react";

interface Chapter {
  chapter_id: number;
  module_id: number;
  title: string;
  description: string;
  video_link: string;
  order_number: number;
  created_at: string;
}

interface ModuleChaptersSectionProps {
  chapters: Chapter[];
  moduleId: string;
  courseId: string;
}

const ModuleChaptersSection = React.memo<ModuleChaptersSectionProps>(({ 
  chapters, 
  moduleId, 
  courseId 
}) => {
  // Mock completion status - in real app, this would come from user progress API
  const [completedChapters, setCompletedChapters] = React.useState<Set<number>>(new Set());

  const isChapterCompleted = (chapterId: number) => completedChapters.has(chapterId);
  const isChapterLocked = (chapterIndex: number) => {
    // First chapter is always unlocked, others require previous completion
    if (chapterIndex === 0) return false;
    const previousChapter = sortedChapters[chapterIndex - 1];
    return !isChapterCompleted(previousChapter.chapter_id);
  };

  const sortedChapters = chapters.sort((a, b) => a.order_number - b.order_number);
  const completionPercentage = (completedChapters.size / chapters.length) * 100;

  const formatDuration = () => "15m"; // Mock duration

  if (!chapters || chapters.length === 0) {
    return (
      <Card className="border-gray-100 shadow-sm">
        <CardContent className="p-8 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No chapters available</h3>
          <p className="text-muted-foreground">Chapters will be available soon.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <Card className="border-gray-100 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Video className="w-6 h-6 text-primary" />
              Module Chapters
            </CardTitle>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {completedChapters.size} of {chapters.length} completed
            </Badge>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>Progress</span>
              <span>{Math.round(completionPercentage)}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="space-y-1">
            {sortedChapters.map((chapter, index) => {
              const isCompleted = isChapterCompleted(chapter.chapter_id);
              const isLocked = isChapterLocked(index);
              
              return (
                <div
                  key={chapter.chapter_id}
                >
                  {isLocked ? (
                    <div className="flex items-center gap-4 p-6 border-b border-gray-100 opacity-60">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Lock className="w-5 h-5 text-gray-400" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded">
                            Chapter {chapter.order_number}
                          </span>
                          <Badge variant="outline" className="text-xs border-gray-200 text-gray-400">
                            Locked
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-gray-400 mb-1 truncate">
                          {chapter.title}
                        </h3>
                        <p className="text-sm text-gray-400 truncate">
                          Complete previous chapter to unlock
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{formatDuration()}</span>
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={`/courses/${courseId}/modules/${moduleId}/chapters/${chapter.chapter_id}`}
                      className="block"
                    >
                      <div className="flex items-center gap-4 p-6 border-b border-gray-100 hover:bg-gray-50 transition-colors group">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isCompleted 
                            ? 'bg-green-100' 
                            : 'bg-primary/10 group-hover:bg-primary/20'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          ) : (
                            <Play className="w-5 h-5 text-primary group-hover:text-primary/80" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                              Chapter {chapter.order_number}
                            </span>
                            {isCompleted && (
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                Completed
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1 truncate">
                            {chapter.title}
                          </h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {chapter.description}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{formatDuration()}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Continue Learning Button */}
          {completedChapters.size < chapters.length && (
            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Ready to continue your learning journey?
                </p>
                <Link href={`/courses/${courseId}/modules/${moduleId}/chapters/${sortedChapters[completedChapters.size]?.chapter_id}`}>
                  <Button className="bg-primary hover:bg-primary/90 text-white">
                    <Play className="w-4 h-4 mr-2" />
                    {completedChapters.size === 0 ? 'Start Module' : 'Continue Learning'}
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

ModuleChaptersSection.displayName = "ModuleChaptersSection";

export default ModuleChaptersSection;
