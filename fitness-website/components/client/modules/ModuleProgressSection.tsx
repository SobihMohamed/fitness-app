"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Award,
  CheckCircle,
  Play,
  BookOpen,
  Calendar
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

interface Module {
  module_id: number;
  course_id: number;
  title: string;
  description: string;
  order_number: number;
  created_at: string;
  chapters?: Chapter[];
}

interface ModuleProgressSectionProps {
  module: Module;
  chapters: Chapter[];
}

const ModuleProgressSection = React.memo<ModuleProgressSectionProps>(({ 
  module, 
  chapters 
}) => {
  // Mock progress data - in real app, this would come from user progress API
  const [completedChapters, setCompletedChapters] = React.useState<Set<number>>(new Set());
  const [timeSpent, setTimeSpent] = React.useState(45); // minutes

  const totalChapters = chapters.length;
  const completedCount = completedChapters.size;
  const progressPercentage = totalChapters > 0 ? (completedCount / totalChapters) * 100 : 0;
  const estimatedTimeRemaining = (totalChapters - completedCount) * 15; // 15 min per chapter

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getProgressStatus = () => {
    if (progressPercentage === 0) return { text: "Not Started", color: "text-gray-500", bg: "bg-gray-100" };
    if (progressPercentage < 50) return { text: "In Progress", color: "text-blue-600", bg: "bg-blue-100" };
    if (progressPercentage < 100) return { text: "Almost Done", color: "text-orange-600", bg: "bg-orange-100" };
    return { text: "Completed", color: "text-green-600", bg: "bg-green-100" };
  };

  const status = getProgressStatus();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="space-y-6"
    >
      {/* Progress Overview */}
      <Card className="border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-primary" />
            Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Module Completion</span>
              <Badge className={`${status.bg} ${status.color} border-0`}>
                {status.text}
              </Badge>
            </div>
            <Progress value={progressPercentage} className="h-3 mb-2" />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{completedCount} of {totalChapters} chapters</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Clock className="w-5 h-5 text-primary mx-auto mb-1" />
              <div className="text-lg font-bold text-foreground">{formatTime(timeSpent)}</div>
              <div className="text-xs text-muted-foreground">Time Spent</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Target className="w-5 h-5 text-primary mx-auto mb-1" />
              <div className="text-lg font-bold text-foreground">{formatTime(estimatedTimeRemaining)}</div>
              <div className="text-xs text-muted-foreground">Remaining</div>
            </div>
          </div>

          {/* Next Action */}
          {progressPercentage < 100 ? (
            <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
              <Play className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium text-primary mb-2">
                Continue Learning
              </p>
              <p className="text-xs text-muted-foreground">
                {completedCount === 0 
                  ? "Start your first chapter to begin this module"
                  : `${totalChapters - completedCount} chapters remaining`
                }
              </p>
            </div>
          ) : (
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-green-800 mb-1">
                Module Completed!
              </p>
              <p className="text-xs text-green-600">
                Great job! You've finished all chapters in this module.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Module Info */}
      <Card className="border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="w-5 h-5 text-primary" />
            Module Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Module Number</span>
            <span className="font-semibold">#{module.order_number}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Chapters</span>
            <span className="font-semibold">{totalChapters}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Estimated Duration</span>
            <span className="font-semibold">{formatTime(totalChapters * 15)}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Difficulty Level</span>
            <Badge variant="outline" className="text-xs">
              Intermediate
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Achievement */}
      {progressPercentage >= 50 && (
        <Card className="border-yellow-200 shadow-sm bg-yellow-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <Award className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <h3 className="font-semibold text-yellow-800 mb-1">
                {progressPercentage === 100 ? "Module Master!" : "Halfway Hero!"}
              </h3>
              <p className="text-sm text-yellow-700">
                {progressPercentage === 100 
                  ? "You've completed this entire module. Excellent work!"
                  : "You're making great progress! Keep up the momentum."
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Study Tips */}
      <Card className="border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Study Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
              <span>Take notes while watching each chapter</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
              <span>Practice the techniques shown in videos</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
              <span>Review previous chapters if needed</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
              <span>Ask questions in the community forum</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

ModuleProgressSection.displayName = "ModuleProgressSection";

export default ModuleProgressSection;
