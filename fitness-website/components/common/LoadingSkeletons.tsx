import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Common loading skeleton for card-based content (courses, products, etc.)
export const CardSkeleton = React.memo(() => (
  <Card className="border-0 shadow-md bg-white">
    <CardHeader className="p-0">
      <Skeleton className="w-full h-48 rounded-t-lg" />
    </CardHeader>
    <CardContent className="p-6">
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-4" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-10 w-32" />
      </div>
    </CardContent>
  </Card>
));

CardSkeleton.displayName = "CardSkeleton";

// Product card skeleton (taller image)
export const ProductCardSkeleton = React.memo(() => (
  <Card className="border-0 shadow-md bg-white">
    <CardHeader className="p-0">
      <Skeleton className="w-full h-64 rounded-t-lg" />
    </CardHeader>
    <CardContent className="p-6">
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-4" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-10 w-32" />
      </div>
    </CardContent>
  </Card>
));

ProductCardSkeleton.displayName = "ProductCardSkeleton";

// Section header skeleton
export const SectionHeaderSkeleton = React.memo(() => (
  <div className="text-center mb-16">
    <Skeleton className="h-10 w-64 mx-auto mb-4" />
    <Skeleton className="h-6 w-96 mx-auto" />
  </div>
));

SectionHeaderSkeleton.displayName = "SectionHeaderSkeleton";

// Hero section skeleton
export const HeroSkeleton = React.memo(() => (
  <div className="grid lg:grid-cols-2 gap-12 items-center">
    <div className="space-y-8">
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-6 w-3/4" />
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-12 w-40" />
      </div>
      <div className="flex items-center space-x-8 pt-8">
        <Skeleton className="h-16 w-20" />
        <Skeleton className="h-16 w-20" />
        <Skeleton className="h-16 w-20" />
      </div>
    </div>
    <div className="relative">
      <Skeleton className="w-full h-96 rounded-2xl" />
    </div>
  </div>
));

HeroSkeleton.displayName = "HeroSkeleton";

// Grid loading skeleton for multiple cards
interface GridSkeletonProps {
  count?: number;
  CardComponent?: React.ComponentType;
  className?: string;
}

export const GridSkeleton = React.memo<GridSkeletonProps>(({ 
  count = 3, 
  CardComponent = CardSkeleton,
  className = "grid md:grid-cols-2 lg:grid-cols-3 gap-8"
}) => (
  <div className={className}>
    {Array(count).fill(0).map((_, index) => (
      <CardComponent key={`skeleton-${index}`} />
    ))}
  </div>
));

GridSkeleton.displayName = "GridSkeleton";
