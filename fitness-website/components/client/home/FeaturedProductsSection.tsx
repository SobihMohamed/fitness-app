"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductCardSkeleton, SectionWrapper, SectionHeader, PrimaryButton } from "@/components/common";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { ProtectedAction } from "@/components/auth/Protected-Route";
import { getFullImageUrl } from "@/lib/images";
import { formatNumber } from "@/utils/format";
import type { FeaturedProductsSectionProps } from "@/types/home";

const FeaturedProductsSection = React.memo<FeaturedProductsSectionProps>(({ 
  products, 
  isLoading, 
  onAddToCart 
}) => {
  // Resolve best image URL for product with safe fallbacks (use direct URL)
  const resolveProductImage = (product: any): string => {
    const raw = product?.image || product?.image_url || product?.main_image_url || "";
    return raw ? getFullImageUrl(raw) : "/placeholder.svg";
  };

  return (
    <SectionWrapper backgroundColor="white">
      <SectionHeader 
        title="Featured Products"
        description="Premium fitness equipment and supplements to support your fitness journey"
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          // Loading skeletons using shared component
          Array(3).fill(0).map((_, index) => (
            <ProductCardSkeleton key={`skeleton-${index}`} />
          ))
          ) : products.length > 0 ? (
            products.map((product, index) => (
              <Card
                key={`${product.id}-${index}`}
                className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white"
              >
                <CardHeader className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <Image
                      unoptimized
                      src={resolveProductImage(product)}
                      alt={product.name}
                      width={300}
                      height={300}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      priority={index < 3} // First 3 featured products get priority
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      onError={(e) => {
                        const img = e.currentTarget as HTMLImageElement;
                        // Prevent infinite loop if placeholder also fails
                        img.onerror = null;
                        img.src = "/placeholder.svg";
                        const originalUrl = resolveProductImage(product);
                        if (originalUrl !== "/placeholder.svg" && process.env.NODE_ENV !== 'production') {
                          // Log only original failing URL to avoid noise with placeholder
                          console.info("[images] Product image failed, swapped to placeholder:", originalUrl);
                        }
                      }}
                    />
                    <div className="absolute top-4 right-4">
                      <Badge style={{ backgroundColor: "#32CD32", color: "#FFFFFF" }}>
                        {product.rating && product.rating > 0 ? `${product.rating} ★` : "New"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <CardTitle className="text-xl mb-2" style={{ color: "#212529" }}>
                    {product.name}
                  </CardTitle>
                  <CardDescription className="mb-4" style={{ color: "#6C757D" }}>
                    {(product.reviews || 0)} reviews
                  </CardDescription>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold" style={{ color: "#007BFF" }}>
                      {formatNumber(product.price || 0)} EGP
                    </span>
                    <ProtectedAction onAction={() => onAddToCart(product)}>
                      <PrimaryButton>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </PrimaryButton>
                    </ProtectedAction>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-3 text-center py-8">
              <p className="text-gray-500">No featured products available at the moment.</p>
            </div>
          )}
      </div>

      <div className="text-center mt-12">
        <PrimaryButton asChild variant="outline" size="lg">
          <Link href="/products" className="inline-flex items-center gap-2">
            View All Products
            <ArrowRight className="h-5 w-5" />
          </Link>
        </PrimaryButton>
      </div>
    </SectionWrapper>
  );
});

FeaturedProductsSection.displayName = "FeaturedProductsSection";

export default FeaturedProductsSection;
