"use client";

import dynamic from "next/dynamic";

// Loading component for sections
const SectionLoadingFallback = () => (
  <div className="py-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="h-48 bg-gray-100 animate-pulse rounded-lg" />
    </div>
  </div>
);

// Dynamic imports for heavy components with SSR disabled
// Note: Hero section is imported directly in page.tsx as it's critical above-the-fold content
export const FeaturedCoursesSectionDynamic = dynamic(
  () => import("./FeaturedCoursesSection"),
  {
    ssr: false,
    loading: () => <SectionLoadingFallback />
  }
);

export const FeaturedProductsSectionDynamic = dynamic(
  () => import("./FeaturedProductsSection"),
  {
    ssr: false,
    loading: () => <SectionLoadingFallback />
  }
);
