export interface Course {
  course_id: string;
  id?: string; // For compatibility with blog-like structure
  title: string;
  description: string;
  excerpt?: string; // Short description for cards
  price: string;
  image_url: string;
  featuredImage?: string; // Alternative image field
  created_at: string;
  updated_at?: string;
  // Blog-like fields
  instructor?: string;
  instructorRole?: string;
  duration?: string;
  level?: string;
  difficulty?: string; // Alternative to level
  categoryId?: string;
  categoryName?: string;
  tags?: string[];
  status?: "draft" | "published";
  views?: number;
  likes?: number;
  comments?: number;
  rating?: number;
  featured?: boolean;
  estimatedCalories?: string;
  modules?: CourseModule[];
  // Course-specific fields
  totalLessons?: number;
  completionRate?: number;
  prerequisites?: string[];
  skillLevel?: "Beginner" | "Intermediate" | "Advanced";
}

export interface CourseRequest {
  request_id?: number;
  course_id: number;
  user_id: number;
  gender: string;
  email: string;
  job: string;
  age: number;
  created_at?: string;
  status?: "pending" | "approved" | "cancelled";
}

export interface CourseModule {
  id: number;
  course_id: number;
  title: string;
  description: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface CourseChapter {
  id: number;
  module_id: number;
  title: string;
  content: string;
  video_url?: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface CoursesResponse {
  courses: Course[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface SearchRequest {
  search: string;
  page?: number;
  limit?: number;
}
