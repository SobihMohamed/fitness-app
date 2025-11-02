"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Target, 
  CheckCircle, 
  BookOpen,
  Lightbulb,
  Award
} from "lucide-react";

interface Module {
  module_id: number;
  course_id: number;
  title: string;
  description: string;
  order_number: number;
  created_at: string;
  chapters?: any[];
}

interface ModuleDetailsInfoProps {
  module: Module;
}

const ModuleDetailsInfo = React.memo<ModuleDetailsInfoProps>(({ module }) => {
  // Mock learning objectives based on module content
  const learningObjectives = [
    "Understand the core concepts covered in this module",
    "Apply practical techniques through hands-on exercises",
    "Master the fundamental skills required for progression",
    "Build confidence through structured learning approach",
    "Prepare for advanced topics in subsequent modules"
  ];

  const keyTopics = [
    "Foundation principles and theory",
    "Step-by-step practical demonstrations",
    "Common mistakes and how to avoid them",
    "Best practices and professional tips",
    "Real-world application examples"
  ];

  return (
    <div className="space-y-6">
      {/* Module Overview */}
      <Card className="border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="w-6 h-6 text-primary" />
            Module Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-gray max-w-none">
            <p className="text-muted-foreground leading-relaxed">
              {module.description}
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              This module is carefully designed to build upon previous knowledge while introducing 
              new concepts that will enhance your understanding and practical skills. Each chapter 
              within this module focuses on specific aspects that contribute to your overall learning journey.
            </p>
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
            {learningObjectives.map((objective, index) => (
              <div
                key={index}
                className="flex items-start gap-3"
              >
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{objective}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Topics */}
      <Card className="border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Lightbulb className="w-6 h-6 text-primary" />
            Key Topics Covered
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {keyTopics.map((topic, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span className="text-muted-foreground text-sm">{topic}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Prerequisites */}
      <Card className="border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Award className="w-6 h-6 text-primary" />
            Prerequisites
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              {module.order_number > 1 
                ? `Complete Module ${module.order_number - 1} before starting this module for the best learning experience.`
                : "This is the first module - no prerequisites required! Perfect for beginners."
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

ModuleDetailsInfo.displayName = "ModuleDetailsInfo";

export default ModuleDetailsInfo;
