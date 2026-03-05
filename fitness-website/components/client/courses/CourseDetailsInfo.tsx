import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle,
  BookOpen,
  Award,
  Clock,
  Users,
  FileText,
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

export default function CourseDetailsInfo({ course }: CourseDetailsInfoProps) {
  const totalChapters =
    course.modules?.reduce((sum, m) => sum + (m.chapters?.length || 0), 0) || 0;

  const courseFeatures = [
    {
      icon: BookOpen,
      label: "Modules",
      value: `${course.modules?.length || 0} modules`,
    },
    {
      icon: FileText,
      label: "Chapters",
      value: `${totalChapters} chapters`,
    },
    {
      icon: Clock,
      label: "Schedule",
      value: course.duration || "Self-paced",
    },
    { icon: Award, label: "Certificate", value: "Upon completion" },
    {
      icon: Users,
      label: "Students",
      value: `${course.students_count || 0} enrolled`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Course Features — compact horizontal strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {courseFeatures.map((feature, index) => (
          <Card
            key={index}
            className="border-gray-100 shadow-sm text-center py-4 px-2"
          >
            <feature.icon className="w-5 h-5 text-primary mx-auto mb-1.5" />
            <p className="text-xs text-muted-foreground">{feature.label}</p>
            <p className="text-sm font-semibold text-foreground">
              {feature.value}
            </p>
          </Card>
        ))}
      </div>

      {/* Course Description */}
      <Card className="border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <CheckCircle className="w-5 h-5 text-primary" />
            About This Course
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-gray max-w-none">
            <p className="text-muted-foreground leading-relaxed break-words whitespace-pre-wrap">
              {course.description}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
