"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Users, Award, TrendingUp, Star, ShoppingCart, BookOpen, Heart, Settings } from "lucide-react";
import { useHomeData } from "@/hooks/client/use-home-data";
import FeaturesSection from "@/components/client/home/FeaturesSection";
import StatsSection from "@/components/client/home/StatsSection";
import CTASection from "@/components/client/home/CTASection";
import HeroSection from "@/components/client/home/HeroSection";
import FeaturedCoursesSection from "@/components/client/home/FeaturedCoursesSection";
import FeaturedProductsSection from "@/components/client/home/FeaturedProductsSection";
import type { HomePageProps, Feature, Stat } from "@/types";


// Statistics data for the stats section - memoized for performance
const useStatsData = (): Stat[] => {
  return useMemo(() => [
    { icon: Users, label: "Active Members", value: "50K+" },
    { icon: Award, label: "Certified Trainers", value: "200+" },
    { icon: TrendingUp, label: "Success Stories", value: "10K+" },
    { icon: Star, label: "Average Rating", value: "4.9" },
  ], []);
};

// Features data for the features section - memoized for performance
const useFeaturesData = (): Feature[] => {
  return useMemo(() => [
    {
      icon: ShoppingCart,
      title: "E-Commerce Store",
      description: "Premium fitness products, supplements, and equipment with secure checkout.",
      href: "/products",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      icon: BookOpen,
      title: "Online Courses",
      description: "Expert-led fitness courses and training programs for all levels.",
      href: "/courses",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      icon: Heart,
      title: "Wellness Blog",
      description: "Latest fitness tips, nutrition advice, and success stories.",
      href: "/blog",
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      icon: Settings,
      title: "Admin Dashboard",
      description: "Complete management system for products, users, and content.",
      href: "/admin/login",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ], []);
};


// Optimized HomePage component with React.memo and performance optimizations
const HomePage = React.memo<HomePageProps>(({ 
  initialFeaturedProducts = [], 
  initialFeaturedCourses = [] 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Use custom hook for all data management and API calls
  const {
    featuredProducts,
    featuredCourses,
    isLoadingProducts,
    isLoadingCourses,
    handleCourseEnrollment,
    handleAddToCart
  } = useHomeData({ initialFeaturedProducts, initialFeaturedCourses });
  
  // Memoized data for static sections
  const stats = useStatsData();
  const features = useFeaturesData();
  
  // Memoized hero image source
  const heroImageSrc = useMemo(() => "/home-hero-fitness.jpg", []);
  
  // Initialize visibility state for animations
  useEffect(() => {
    setIsVisible(true);
  }, []);


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section - Critical above-the-fold content */}
      <HeroSection 
        isVisible={isVisible} 
        heroImageSrc={heroImageSrc} 
      />

      {/* Features Section - Memoized component */}
      <FeaturesSection features={features} />

      {/* Stats Section - Memoized component */}
      <StatsSection stats={stats} />

      {/* Featured Courses */}
      <FeaturedCoursesSection 
        courses={featuredCourses}
        isLoading={isLoadingCourses}
        onEnrollment={handleCourseEnrollment}
      />

      {/* Featured Products */}
      <FeaturedProductsSection 
        products={featuredProducts}
        isLoading={isLoadingProducts}
        onAddToCart={handleAddToCart}
      />

      {/* CTA Section - Memoized component */}
      <CTASection />
    </div>
  );
});

// Set display name for debugging
HomePage.displayName = "HomePage";

export { HomePage };
export default HomePage;
