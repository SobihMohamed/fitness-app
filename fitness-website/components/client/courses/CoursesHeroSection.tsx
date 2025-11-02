"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";

const CoursesHeroSection = React.memo(() => {
  return (
    <section className="py-12 lg:py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Badge className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors mb-4 px-4 py-1 text-sm font-medium">
          Professional Training
        </Badge>
        <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-foreground">
          Master Your{" "}
          <span className="text-primary bg-clip-text bg-gradient-to-r from-primary to-primary/80">
            Fitness Journey
          </span>
        </h1>
        <p className="text-xl max-w-3xl mx-auto text-muted leading-relaxed">
          Unlock your potential with our comprehensive fitness courses. From beginner-friendly workouts
          to advanced training programs, we have everything you need to achieve your goals.
        </p>
      </div>
    </section>
  );
});

CoursesHeroSection.displayName = "CoursesHeroSection";

export default CoursesHeroSection;
