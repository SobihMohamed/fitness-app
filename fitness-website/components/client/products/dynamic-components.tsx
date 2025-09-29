"use client";

import dynamic from "next/dynamic";
import { CardSkeleton } from "@/components/common/LoadingSkeletons";

// Dynamic imports with SSR disabled to prevent hydration mismatches
export const ProductsHeroSectionDynamic = dynamic(
  () => import("./ProductsHeroSection"),
  {
    ssr: false,
    loading: () => (
      <div className="py-12 lg:py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-pulse">
            <div className="h-6 w-32 bg-gray-200 rounded-full mx-auto mb-4" />
            <div className="h-12 w-96 bg-gray-200 rounded-lg mx-auto mb-6" />
            <div className="h-6 w-full max-w-3xl bg-gray-100 rounded-lg mx-auto" />
          </div>
        </div>
      </div>
    ),
  }
);

export const ProductsFilterSectionDynamic = dynamic(
  () => import("./ProductsFilterSection"),
  {
    ssr: false,
    loading: () => (
      <div className="py-8 bg-gray-50 border-y">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
              <div className="h-12 w-full max-w-md bg-gray-200 rounded-lg" />
              <div className="flex gap-4">
                <div className="h-12 w-56 bg-gray-200 rounded-lg" />
                <div className="h-12 w-56 bg-gray-200 rounded-lg" />
                <div className="h-12 w-32 bg-gray-200 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  }
);

export const ProductGridDynamic = dynamic(
  () => import("./ProductGrid"),
  {
    ssr: false,
    loading: () => (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
        {Array(12)
          .fill(0)
          .map((_, index) => (
            <CardSkeleton key={`skeleton-${index}`} />
          ))}
      </div>
    ),
  }
);

export const ProductPaginationDynamic = dynamic(
  () => import("./ProductPagination"),
  {
    ssr: false,
    loading: () => (
      <div className="mt-16 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="animate-pulse">
          <div className="flex justify-between items-center">
            <div className="h-5 w-32 bg-gray-200 rounded" />
            <div className="flex gap-2">
              <div className="h-9 w-16 bg-gray-200 rounded" />
              <div className="h-9 w-12 bg-gray-200 rounded" />
              <div className="h-9 w-16 bg-gray-200 rounded" />
              <div className="h-9 w-28 bg-gray-200 rounded ml-4" />
            </div>
          </div>
        </div>
      </div>
    ),
  }
);
