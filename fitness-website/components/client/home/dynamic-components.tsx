"use client";

import dynamic from "next/dynamic";
import { SectionHeaderSkeleton, GridSkeleton, HeroSkeleton, SectionWrapper } from "@/components/common";

// Loading component for sections
const SectionLoadingFallback = () => (
  <SectionWrapper>
    <SectionHeaderSkeleton />
    <GridSkeleton count={3} />
  </SectionWrapper>
);

// Loading component for hero section
const HeroLoadingFallback = () => (
  <SectionWrapper backgroundColor="white" className="relative py-20 lg:py-32">
    <HeroSkeleton />
  </SectionWrapper>
);

// Dynamic imports for heavy components with SSR disabled
export const FeaturedCoursesSectionDynamic = dynamic(
  () => import("./FeaturedCoursesSection"),
  {
    ssr: false,
    loading: SectionLoadingFallback
  }
);

export const FeaturedProductsSectionDynamic = dynamic(
  () => import("./FeaturedProductsSection"),
  {
    ssr: false,
    loading: SectionLoadingFallback
  }
);

// Hero section with motion animations - dynamic import to prevent hydration issues
export const HeroSectionDynamic = dynamic(
  () => import("./HeroSection"),
  {
    ssr: false,
    loading: HeroLoadingFallback
  }
);
