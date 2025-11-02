import type { LucideIcon } from "lucide-react";

// Homepage Product interface
export interface HomeProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  rating?: number;
  reviews?: number;
  stock?: number;
}

// Homepage Course interface
export interface HomeCourse {
  id: string;
  title: string;
  instructor: string;
  students: number;
  rating: number;
  price: number;
  image: string;
  category: string;
  description?: string;
}

// Feature interface for features section
export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  color: string;
  bgColor: string;
}

// Stat interface for statistics section
export interface Stat {
  icon: LucideIcon;
  label: string;
  value: string;
}

// Hero section props
export interface HeroSectionProps {
  isVisible: boolean;
  heroImageSrc: string;
}

// Features section props
export interface FeaturesSectionProps {
  features: Feature[];
}

// Stats section props
export interface StatsSectionProps {
  stats: Stat[];
}

// Featured courses section props
export interface FeaturedCoursesSectionProps {
  courses: HomeCourse[];
  isLoading: boolean;
  onEnrollment: (course: HomeCourse) => void;
}

// Featured products section props
export interface FeaturedProductsSectionProps {
  products: HomeProduct[];
  isLoading: boolean;
  onAddToCart: (product: HomeProduct) => void;
}

// CTA section props
export interface CTASectionProps {}

// API response interfaces
export interface HomeProductsApiResponse {
  status: string;
  data?: HomeProduct[];
  products?: HomeProduct[];
}

export interface HomeCoursesApiResponse {
  status: string;
  data?: HomeCourse[];
  courses?: HomeCourse[];
}

// Home data hook return type
export interface UseHomeDataReturn {
  featuredProducts: HomeProduct[];
  featuredCourses: HomeCourse[];
  isLoadingProducts: boolean;
  isLoadingCourses: boolean;
  handleCourseEnrollment: (course: HomeCourse) => Promise<void>;
  handleAddToCart: (product: HomeProduct) => void;
}

// HomePage component props
export interface HomePageProps {
  initialFeaturedProducts?: HomeProduct[];
  initialFeaturedCourses?: HomeCourse[];
}

// Home state interface
export interface HomeState {
  featuredProducts: HomeProduct[];
  featuredCourses: HomeCourse[];
  isLoadingProducts: boolean;
  isLoadingCourses: boolean;
  isVisible: boolean;
}

// Home actions interface
export interface HomeActions {
  setFeaturedProducts: (products: HomeProduct[]) => void;
  setFeaturedCourses: (courses: HomeCourse[]) => void;
  setIsLoadingProducts: (loading: boolean) => void;
  setIsLoadingCourses: (loading: boolean) => void;
  setIsVisible: (visible: boolean) => void;
}
