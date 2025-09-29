"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  List, 
  Play,
  CheckCircle,
  Lock
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

interface ChapterNavigationSectionProps {
  currentChapter: Chapter;
  moduleChapters: Chapter[];
  courseId: string;
  moduleId: string;
}

const ChapterNavigationSection = React.memo<ChapterNavigationSectionProps>(({ 
  currentChapter, 
  moduleChapters, 
  courseId, 
  moduleId 
}) => {
  // Mock completion status
  const [completedChapters] = React.useState<Set<number>>(new Set([1, 2]));

  const sortedChapters = moduleChapters.sort((a, b) => a.order_number - b.order_number);
  const currentIndex = sortedChapters.findIndex(ch => ch.chapter_id === currentChapter.chapter_id);
  const previousChapter = currentIndex > 0 ? sortedChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < sortedChapters.length - 1 ? sortedChapters[currentIndex + 1] : null;

  const isChapterCompleted = (chapterId: number) => completedChapters.has(chapterId);
  const isChapterLocked = (chapterIndex: number) => {
    if (chapterIndex === 0) return false;
    const prevChapter = sortedChapters[chapterIndex - 1];
    return !isChapterCompleted(prevChapter.chapter_id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="space-y-6"
    >
      {/* Navigation Controls */}
      <Card className="border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Chapter Navigation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Previous Chapter */}
          {previousChapter ? (
            <Link href={`/courses/${courseId}/modules/${moduleId}/chapters/${previousChapter.chapter_id}`}>
              <Button variant="outline" className="w-full justify-start text-left h-auto p-4">
                <ChevronLeft className="w-4 h-4 mr-2 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground mb-1">Previous Chapter</div>
                  <div className="font-semibold truncate">{previousChapter.title}</div>
                </div>
              </Button>
            </Link>
          ) : (
            <Button variant="outline" disabled className="w-full justify-start text-left h-auto p-4 opacity-50">
              <ChevronLeft className="w-4 h-4 mr-2 flex-shrink-0" />
              <div>
                <div className="text-xs text-muted-foreground mb-1">Previous Chapter</div>
                <div className="font-semibold">This is the first chapter</div>
              </div>
            </Button>
          )}

          {/* Next Chapter */}
          {nextChapter ? (
            <Link href={`/courses/${courseId}/modules/${moduleId}/chapters/${nextChapter.chapter_id}`}>
              <Button className="w-full justify-between text-left h-auto p-4 bg-primary hover:bg-primary/90">
                <div className="min-w-0">
                  <div className="text-xs text-primary-foreground/80 mb-1">Next Chapter</div>
                  <div className="font-semibold text-primary-foreground truncate">{nextChapter.title}</div>
                </div>
                <ChevronRight className="w-4 h-4 ml-2 flex-shrink-0" />
              </Button>
            </Link>
          ) : (
            <Button variant="outline" disabled className="w-full justify-between text-left h-auto p-4 opacity-50">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Next Chapter</div>
                <div className="font-semibold">This is the last chapter</div>
              </div>
              <ChevronRight className="w-4 h-4 ml-2 flex-shrink-0" />
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Chapter List */}
      <Card className="border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <List className="w-5 h-5 text-primary" />
            All Chapters
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto">
            {sortedChapters.map((chapter, index) => {
              const isCompleted = isChapterCompleted(chapter.chapter_id);
              const isLocked = isChapterLocked(index);
              const isCurrent = chapter.chapter_id === currentChapter.chapter_id;

              return (
                <motion.div
                  key={chapter.chapter_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  {isLocked ? (
                    <div className={`flex items-center gap-3 p-4 border-b border-gray-100 opacity-60 ${
                      isCurrent ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                    }`}>
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Lock className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-gray-400">
                            Chapter {chapter.order_number}
                          </span>
                          <Badge variant="outline" className="text-xs border-gray-200 text-gray-400">
                            Locked
                          </Badge>
                        </div>
                        <h4 className="font-medium text-gray-400 truncate text-sm">
                          {chapter.title}
                        </h4>
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={`/courses/${courseId}/modules/${moduleId}/chapters/${chapter.chapter_id}`}
                      className="block"
                    >
                      <div className={`flex items-center gap-3 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        isCurrent ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                      }`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isCompleted 
                            ? 'bg-green-100' 
                            : isCurrent 
                              ? 'bg-primary/20' 
                              : 'bg-gray-100'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Play className={`w-3 h-3 ${isCurrent ? 'text-primary' : 'text-gray-600'}`} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-medium ${
                              isCurrent ? 'text-primary' : 'text-muted-foreground'
                            }`}>
                              Chapter {chapter.order_number}
                            </span>
                            {isCompleted && (
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                Completed
                              </Badge>
                            )}
                            {isCurrent && (
                              <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                                Current
                              </Badge>
                            )}
                          </div>
                          <h4 className={`font-medium truncate text-sm ${
                            isCurrent ? 'text-primary' : 'text-foreground'
                          }`}>
                            {chapter.title}
                          </h4>
                        </div>
                      </div>
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Progress Summary */}
      <Card className="border-gray-100 shadow-sm">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground mb-1">
              {completedChapters.size} / {sortedChapters.length}
            </div>
            <div className="text-sm text-muted-foreground mb-4">
              Chapters Completed
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${sortedChapters.length > 0 ? (completedChapters.size / sortedChapters.length) * 100 : 0}%` 
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

ChapterNavigationSection.displayName = "ChapterNavigationSection";

export default ChapterNavigationSection;
