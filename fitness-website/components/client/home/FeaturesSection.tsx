"use client";

import React from "react";
import Link from "next/link";
import { SectionWrapper, SectionHeader, PrimaryButton } from "@/components/common";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import type { FeaturesSectionProps } from "@/types/home";

const FeaturesSection = React.memo<FeaturesSectionProps>(({ features }) => {
  return (
    <SectionWrapper backgroundColor="gray">
      <SectionHeader 
        title="Complete Fitness Platform"
        description="Everything you need in one powerful platform - from shopping to learning to managing"
      />

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <Card key={feature.title} className="transition-all duration-300 border-0 shadow-md bg-white">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className={`flex items-center justify-center w-16 h-16 rounded-full ${feature.bgColor}`}>
                    <feature.icon className={`h-8 w-8 ${feature.color}`} />
                  </div>
                </div>
                <CardTitle className="text-xl" style={{ color: "#212529" }}>
                  {feature.title}
                </CardTitle>
                <CardDescription style={{ color: "#6C757D" }}>
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <PrimaryButton
                  asChild
                  variant="outline"
                  className="inline-flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-300"
                >
                  <Link href={feature.href} className="inline-flex items-center gap-2">
                    Explore
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </PrimaryButton>
              </CardContent>
            </Card>
          ))}
      </div>
    </SectionWrapper>
  );
});

FeaturesSection.displayName = "FeaturesSection";

export default FeaturesSection;
