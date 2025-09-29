"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import type { ProductsHeroSectionProps } from "@/types";

const ProductsHeroSection = React.memo<ProductsHeroSectionProps>(({ className = "" }) => {
  return (
    <section className={`py-12 lg:py-20 bg-gradient-to-b from-white to-gray-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Badge className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors mb-4 px-4 py-1 text-sm font-medium">
          Our Collection
        </Badge>
        <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-foreground">
          Premium Fitness{" "}
          <span className="text-primary bg-clip-text bg-gradient-to-r from-primary to-primary/80">
            Products
          </span>
        </h1>
        <p className="text-xl max-w-3xl mx-auto text-muted leading-relaxed">
          Discover our curated collection of high-quality fitness equipment
          and supplements designed to help you achieve your goals and maintain
          a healthy lifestyle.
        </p>
      </div>
    </section>
  );
});

ProductsHeroSection.displayName = "ProductsHeroSection";

export default ProductsHeroSection;
