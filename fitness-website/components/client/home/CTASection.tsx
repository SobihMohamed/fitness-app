"use client";

import React from "react";
import Link from "next/link";
import { SectionWrapper, PrimaryButton } from "@/components/common";
import type { CTASectionProps } from "@/types/home";

const CTASection = React.memo<CTASectionProps>(() => {
  return (
    <SectionWrapper 
      backgroundColor="gradient" 
      className="max-w-4xl mx-auto text-center"
    >
        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
          Ready to Start Your Fitness Journey?
        </h2>
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Join thousands of members who have already transformed their lives. Get started today with our comprehensive
          fitness programs and expert-led courses.
        </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <PrimaryButton 
          asChild 
          size="lg" 
          className="text-lg px-8 bg-white text-black hover:bg-gray-100"
        >
          <Link href="/courses" className="inline-flex items-center">
            Start Free Trial
          </Link>
        </PrimaryButton>
        <PrimaryButton
          asChild
          size="lg"
          variant="outline"
          className="text-lg px-8 text-white border-white hover:bg-white hover:text-black bg-transparent"
        >
          <Link href="/about">Learn More</Link>
        </PrimaryButton>
      </div>
    </SectionWrapper>
  );
});

CTASection.displayName = "CTASection";

export default CTASection;
