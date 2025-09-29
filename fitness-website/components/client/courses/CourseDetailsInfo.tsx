"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  Target, 
  CheckCircle, 
  Users, 
  BookOpen,
  Award,
  Clock
} from "lucide-react";

interface Course {
  course_id: number;
  title: string;
  description: string;
  price: number;
  image: string;
  instructor?: string;
  duration?: string;
  level?: string;
  students_count?: number;
  rating?: number;
  created_at: string;
  modules?: any[];
}

interface CourseDetailsInfoProps {
  course: Course;
}

const CourseDetailsInfo = React.memo<CourseDetailsInfoProps>(({ course }) => {
  // Mock data for what students will learn and requirements
  const learningOutcomes = [
    "Master fundamental fitness principles and techniques",
    "Develop a personalized workout routine",
    "Learn proper form and injury prevention",
    "Understand nutrition basics for fitness goals",
    "Build strength, endurance, and flexibility",
    "Track progress and set achievable goals"
  ];



  const courseFeatures = [
    { icon: BookOpen, label: "Comprehensive Modules", value: `${course.modules?.length || 0} modules` },
    { icon: Clock, label: "Flexible Schedule", value: "Learn at your pace" },
    { icon: Award, label: "Certificate", value: "Upon completion" },
    { icon: Users, label: "Community", value: "Join fellow learners" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="space-y-8"
    >
      {/* What You'll Learn */}
      <Card className="border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Target className="w-6 h-6 text-primary" />
            What You'll Learn
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {learningOutcomes.map((outcome, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="flex items-start gap-3"
              >
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{outcome}</span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Course Features */}
      <Card className="border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Course Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {courseFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{feature.label}</h4>
                  <p className="text-sm text-muted-foreground">{feature.value}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>



      {/* Course Description */}
      <Card className="border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">About This Course</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-gray max-w-none">
            <p className="text-muted-foreground leading-relaxed">
              {course.description}
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              This comprehensive fitness course is designed to help you achieve your health and wellness goals 
              through structured learning and practical application. Whether you're a complete beginner or 
              looking to enhance your existing knowledge, this course provides the foundation you need to 
              succeed in your fitness journey.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Our expert instructors will guide you through each module, ensuring you understand not just 
              the "what" but also the "why" behind effective fitness practices. Join thousands of students 
              who have transformed their lives through our proven methodology.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

CourseDetailsInfo.displayName = "CourseDetailsInfo";

export default CourseDetailsInfo;
