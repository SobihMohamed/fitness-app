"use client";

import { useCallback } from "react";
import { useCart } from "@/contexts/cart-context";
import { useRouter } from "next/navigation";
import { useFeaturedProducts, useFeaturedCourses } from "@/hooks/queries";
import type { HomeProduct, HomeCourse } from "@/types/home";

export interface UseHomeDataParams {
  initialFeaturedProducts?: HomeProduct[];
  initialFeaturedCourses?: HomeCourse[];
}

export interface UseHomeDataReturn {
  featuredProducts: HomeProduct[];
  featuredCourses: HomeCourse[];
  isLoadingProducts: boolean;
  isLoadingCourses: boolean;
  handleAddToCart: (product: HomeProduct) => void;
  handleCourseEnrollment: (course: HomeCourse) => void;
}

export function useHomeData(params: UseHomeDataParams = {}): UseHomeDataReturn {
  const { initialFeaturedProducts = [], initialFeaturedCourses = [] } = params;
  const router = useRouter();
  const { addItem } = useCart();

  // React Query handles caching, background revalidation, and deduplication
  const { data: featuredProducts = [], isLoading: isLoadingProducts } =
    useFeaturedProducts(initialFeaturedProducts.slice(0, 3), 3);

  const { data: featuredCourses = [], isLoading: isLoadingCourses } =
    useFeaturedCourses(initialFeaturedCourses.slice(0, 3), 3);

  const handleAddToCart = useCallback(
    (product: HomeProduct) => {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        description: product.description,
        stock: product.stock,
      });
    },
    [addItem],
  );

  const handleCourseEnrollment = useCallback(
    (course: HomeCourse) => {
      const id = String(course.id);
      router.push(id ? `/courses/${encodeURIComponent(id)}` : "/courses");
    },
    [router],
  );

  return {
    featuredProducts,
    featuredCourses,
    isLoadingProducts,
    isLoadingCourses,
    handleAddToCart,
    handleCourseEnrollment,
  };
}
