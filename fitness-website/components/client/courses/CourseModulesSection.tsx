"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  ChevronDown, 
  ChevronRight, 
  Play, 
  Clock,
  FileText,
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

interface Module {
  module_id: number;
  course_id: number;
  title: string;
  description: string;
  order_number: number;
  created_at: string;
  chapters?: Chapter[];
}

interface CourseModulesSectionProps {
  modules: Module[];
  courseId: string;
}

const CourseModulesSection = React.memo<CourseModulesSectionProps>(({ modules, courseId }) => {
  const [openModules, setOpenModules] = React.useState<Set<number>>(new Set([modules[0]?.module_id]));

  const toggleModule = (moduleId: number) => {
    setOpenModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  const formatDuration = (chapters: Chapter[] = []) => {
    // Mock duration calculation - in real app, this would come from API
    const totalMinutes = chapters.length * 15; // Assume 15 min per chapter
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (!modules || modules.length === 0) {
    return (
      <Card className="border-gray-100 shadow-sm">
        <CardContent className="p-8 text-center">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No modules available</h3>
          <p className="text-muted-foreground">Course modules will be available soon.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <Card className="border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="w-6 h-6 text-primary" />
            Course Content
          </CardTitle>
          <p className="text-muted-foreground">
            {modules.length} modules • {modules.reduce((total, module) => total + (module.chapters?.length || 0), 0)} chapters
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-2">
            {modules
              .sort((a, b) => a.order_number - b.order_number)
              .map((module, moduleIndex) => (
                <motion.div
                  key={module.module_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: moduleIndex * 0.1 }}
                >
                  <Collapsible
                    open={openModules.has(module.module_id)}
                    onOpenChange={() => toggleModule(module.module_id)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-between p-6 h-auto text-left hover:bg-gray-50 border-b border-gray-100"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-sm font-semibold text-primary">
                              {module.order_number}
                            </span>
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold text-foreground mb-1">
                              {module.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {module.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Play className="w-3 h-3" />
                                {module.chapters?.length || 0} chapters
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDuration(module.chapters)}
                              </span>
                            </div>
                          </div>
                        </div>
                        {openModules.has(module.module_id) ? (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="pl-6 pr-6 pb-4">
                        {module.chapters && module.chapters.length > 0 ? (
                          <div className="space-y-2 ml-12">
                            {module.chapters
                              .sort((a, b) => a.order_number - b.order_number)
                              .map((chapter, chapterIndex) => (
                                <motion.div
                                  key={chapter.chapter_id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.3, delay: chapterIndex * 0.05 }}
                                >
                                  <Link
                                    href={`/courses/${courseId}/modules/${module.module_id}/chapters/${chapter.chapter_id}`}
                                    className="block"
                                  >
                                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Play className="w-3 h-3 text-gray-600 group-hover:text-primary transition-colors" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                                          {chapter.title}
                                        </h4>
                                        <p className="text-sm text-muted-foreground truncate">
                                          {chapter.description}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Clock className="w-3 h-3" />
                                        <span>15m</span> {/* Mock duration */}
                                        <Lock className="w-3 h-3" />
                                      </div>
                                    </div>
                                  </Link>
                                </motion.div>
                              ))}
                          </div>
                        ) : (
                          <div className="ml-12 p-4 text-center text-muted-foreground">
                            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No chapters available in this module</p>
                          </div>
                        )}
                        
                        {/* Module Action Button */}
                        <div className="ml-12 mt-4">
                          <Link href={`/courses/${courseId}/modules/${module.module_id}`}>
                            <Button variant="outline" size="sm" className="text-primary border-primary hover:bg-primary hover:text-white">
                              <BookOpen className="w-4 h-4 mr-2" />
                              View Module Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </motion.div>
              ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

CourseModulesSection.displayName = "CourseModulesSection";

export default CourseModulesSection;
