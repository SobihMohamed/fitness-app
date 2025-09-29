"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { SectionWrapper, PrimaryButton } from "@/components/common";
import { Play, ArrowRight, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import type { HeroSectionProps } from "@/types/home";

const HeroSection = React.memo<HeroSectionProps>(({ isVisible, heroImageSrc }) => {
  return (
    <SectionWrapper backgroundColor="white" className="relative py-20 lg:py-32">
        <motion.div 
          className="grid lg:grid-cols-2 gap-12 items-center" 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }}
        >
          <div
            className={`space-y-8 transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="space-y-4">
              <Badge style={{ backgroundColor: "#32CD32", color: "#FFFFFF" }}>
                #1 Fitness Platform
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight" style={{ color: "#212529" }}>
                Transform Your
                <span style={{ color: "#007BFF" }}> Body</span>,
                <span style={{ color: "#32CD32" }}> Mind</span> & Life
              </h1>
              <p className="text-xl max-w-lg" style={{ color: "#6C757D" }}>
                Join thousands of fitness enthusiasts on their journey to a healthier, stronger, and more confident
                version of themselves.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <PrimaryButton asChild size="lg" className="text-lg px-8">
                <Link href="/courses" className="inline-flex items-center">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </PrimaryButton>
              <PrimaryButton asChild size="lg" variant="outline" className="text-lg px-8">
                <Link href="/about" className="inline-flex items-center">
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Link>
              </PrimaryButton>
            </div>

            <div className="flex items-center space-x-8 pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: "#007BFF" }}>
                  50K+
                </div>
                <div className="text-sm" style={{ color: "#6C757D" }}>
                  Happy Members
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: "#32CD32" }}>
                  200+
                </div>
                <div className="text-sm" style={{ color: "#6C757D" }}>
                  Expert Trainers
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: "#007BFF" }}>
                  4.9★
                </div>
                <div className="text-sm" style={{ color: "#6C757D" }}>
                  User Rating
                </div>
              </div>
            </div>
          </div>

          <div
            className={`relative transition-all duration-1000 delay-300 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
            }`}
          >
            <div className="relative">
              <Image
                src={heroImageSrc}
                alt="Fitness Hero"
                width={500}
                height={600}
                className="rounded-2xl shadow-2xl"
                priority
                sizes="(min-width: 1024px) 500px, 100vw"
                style={{ width: "100%", height: "auto" }}
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#32CD32" }}
                  >
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold" style={{ color: "#212529" }}>
                      Progress Tracking
                    </div>
                    <div className="text-sm" style={{ color: "#6C757D" }}>
                      Real-time analytics
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
    </SectionWrapper>
  );
});

HeroSection.displayName = "HeroSection";

export default HeroSection;
