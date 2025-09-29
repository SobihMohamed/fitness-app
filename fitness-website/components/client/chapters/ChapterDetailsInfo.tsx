"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  FileText, 
  Clock, 
  Target, 
  CheckCircle,
  BookOpen,
  Lightbulb
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

interface ChapterDetailsInfoProps {
  chapter: Chapter;
}

const ChapterDetailsInfo = React.memo<ChapterDetailsInfoProps>(({ chapter }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Mock learning objectives for the chapter
  const chapterObjectives = [
    "Understand the key concepts presented in this chapter",
    "Apply the techniques demonstrated in practical scenarios",
    "Identify common mistakes and how to avoid them",
    "Build upon previous knowledge for advanced understanding"
  ];

  // Mock key takeaways
  const keyTakeaways = [
    "Master the fundamental technique shown",
    "Practice proper form and execution",
    "Understand the science behind the method",
    "Prepare for the next chapter's content"
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="space-y-6"
    >
      {/* Chapter Overview */}
      <Card className="border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <FileText className="w-6 h-6 text-primary" />
            Chapter Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="prose prose-gray max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                {chapter.description}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                This chapter builds upon the concepts from previous lessons and introduces 
                new techniques that will enhance your understanding and practical skills. 
                Pay close attention to the demonstrations and take notes for future reference.
              </p>
            </div>

            {/* Chapter Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div className="text-sm font-semibold">15 min</div>
                <div className="text-xs text-muted-foreground">Duration</div>
              </div>
              
              <div className="text-center">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div className="text-sm font-semibold">Beginner</div>
                <div className="text-xs text-muted-foreground">Level</div>
              </div>
              
              <div className="text-center">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div className="text-sm font-semibold">#{chapter.order_number}</div>
                <div className="text-xs text-muted-foreground">Chapter</div>
              </div>
              
              <div className="text-center">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                </div>
                <div className="text-sm font-semibold">Video</div>
                <div className="text-xs text-muted-foreground">Format</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learning Objectives */}
      <Card className="border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Target className="w-6 h-6 text-primary" />
            Learning Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {chapterObjectives.map((objective, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="flex items-start gap-3"
              >
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{objective}</span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Takeaways */}
      <Card className="border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Lightbulb className="w-6 h-6 text-primary" />
            Key Takeaways
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {keyTakeaways.map((takeaway, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10"
              >
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span className="text-muted-foreground text-sm">{takeaway}</span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chapter Info */}
      <Card className="border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Chapter Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-muted-foreground">Chapter Number</span>
              <Badge variant="outline">#{chapter.order_number}</Badge>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-muted-foreground">Module ID</span>
              <span className="font-semibold">{chapter.module_id}</span>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-muted-foreground">Created Date</span>
              <span className="font-semibold">{formatDate(chapter.created_at)}</span>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Video Available</span>
              <Badge className={chapter.video_link ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                {chapter.video_link ? "Yes" : "No"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

ChapterDetailsInfo.displayName = "ChapterDetailsInfo";

export default ChapterDetailsInfo;
