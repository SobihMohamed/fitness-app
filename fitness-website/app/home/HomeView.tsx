/**
 * HomeView — Server Component (shared display layer)
 *
 * Static sections (Hero, Features, Stats, CTA) render server-side for fast LCP.
 * Only FeaturedCourses / FeaturedProducts (which need React Query hooks) are
 * deferred to the HomeDataSections Client Component below the fold.
 */

import React from "react";
import HeroSection from "@/components/client/home/HeroSection";
import FeaturesSection from "@/components/client/home/FeaturesSection";
import StatsSection from "@/components/client/home/StatsSection";
import CTASection from "@/components/client/home/CTASection";
import HomeDataSections from "@/components/client/home/HomeDataSections";
import type { HomePageProps } from "@/types";

export default function HomeView({
  initialFeaturedProducts = [],
  initialFeaturedCourses = [],
  dataSlot,
}: HomePageProps & { dataSlot?: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section — static, rendered server-side for fast LCP */}
      <HeroSection />

      {/* Static below-fold sections — data defined inside each client component */}
      <FeaturesSection />
      <StatsSection />

      {/* API-dependent sections — streamed via Suspense or passed as prop */}
      {dataSlot ?? (
        <HomeDataSections
          initialFeaturedProducts={initialFeaturedProducts}
          initialFeaturedCourses={initialFeaturedCourses}
        />
      )}

      <CTASection />
    </div>
  );
}
