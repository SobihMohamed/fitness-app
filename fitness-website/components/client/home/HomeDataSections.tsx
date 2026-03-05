"use client";

/**
 * HomeDataSections — Client Component
 *
 * Isolated to only the two sections that depend on API data (React Query hooks).
 * Keeping this client boundary tight ensures HeroSection / FeaturesSection /
 * StatsSection / CTASection all render in the initial server HTML, dramatically
 * improving LCP.
 */

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { useHomeData } from "@/hooks/client/use-home-data";
import type { HomeProduct, HomeCourse } from "@/types/home";

const FeaturedCoursesSection = dynamic(
  () => import("@/components/client/home/FeaturedCoursesSection"),
  {
    loading: () => (
      <div className="py-20 bg-gray-50">
        <Skeleton className="h-96 max-w-7xl mx-auto" />
      </div>
    ),
  },
);

const FeaturedProductsSection = dynamic(
  () => import("@/components/client/home/FeaturedProductsSection"),
  {
    loading: () => (
      <div className="py-20 bg-white">
        <Skeleton className="h-96 max-w-7xl mx-auto" />
      </div>
    ),
  },
);

interface HomeDataSectionsProps {
  initialFeaturedProducts?: HomeProduct[];
  initialFeaturedCourses?: HomeCourse[];
}

export default function HomeDataSections({
  initialFeaturedProducts = [],
  initialFeaturedCourses = [],
}: HomeDataSectionsProps) {
  const {
    featuredProducts,
    featuredCourses,
    isLoadingProducts,
    isLoadingCourses,
    handleCourseEnrollment,
    handleAddToCart,
  } = useHomeData({ initialFeaturedProducts, initialFeaturedCourses });

  return (
    <>
      <FeaturedCoursesSection
        courses={featuredCourses}
        isLoading={isLoadingCourses}
        onEnrollment={handleCourseEnrollment}
      />
      <FeaturedProductsSection
        products={featuredProducts}
        isLoading={isLoadingProducts}
        onAddToCart={handleAddToCart}
      />
    </>
  );
}
