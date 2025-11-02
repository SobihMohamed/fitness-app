"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import type { FeaturesSectionProps } from "@/types/home";

const FeaturesSection = React.memo<FeaturesSectionProps>(({ features }) => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4" style={{ color: "#212529" }}>
            Complete Fitness Platform
          </h2>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: "#6C757D" }}>
            Everything you need in one powerful platform - from shopping to learning to managing
          </p>
        </div>

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
                <Link href={feature.href}>
                  <Button variant="outline" className="inline-flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-300">
                    Explore
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
});

FeaturesSection.displayName = "FeaturesSection";

export default FeaturesSection;
