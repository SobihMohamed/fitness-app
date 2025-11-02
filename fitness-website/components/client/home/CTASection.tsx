"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { CTASectionProps } from "@/types/home";

const CTASection = React.memo<CTASectionProps>(() => {
  return (
    <section className="py-20 text-center bg-gradient-to-r from-blue-600 to-indigo-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
          Ready to Start Your Fitness Journey?
        </h2>
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Join thousands of members who have already transformed their lives. Get started today with our comprehensive
          fitness programs and expert-led courses.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/courses">
            <Button size="lg" className="text-lg px-8 bg-white text-black hover:bg-gray-100">
              Start Free Trial
            </Button>
          </Link>
          <Link href="/about">
            <Button size="lg" variant="outline" className="text-lg px-8 text-white border-white hover:bg-white hover:text-black bg-transparent">
              Learn More
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
});

CTASection.displayName = "CTASection";

export default CTASection;
