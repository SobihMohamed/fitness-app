"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { cachedProductsApi } from "@/lib/api/cached-client";
import { cachedCoursesApi } from "@/lib/api/cached-courses";
import { API_CONFIG } from "@/config/api";
import { useCart } from "@/contexts/cart-context";
import { useRouter } from "next/navigation";
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

// Helpers to normalize API responses that may vary in shape
function toStr(v: any): string {
  if (v === null || v === undefined) return "";
  return String(v);
}

function toNum(v: any, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function pickFirst<T = any>(obj: any, keys: string[], fallback?: any): T {
  for (const k of keys) {
    if (obj && obj[k] !== undefined && obj[k] !== null && obj[k] !== "") {
      return obj[k];
    }
  }
  return fallback as T;
}

function normalizeProduct(raw: any): HomeProduct {
  const id = toStr(pickFirst(raw, ["id", "product_id", "_id"])) || crypto.randomUUID();
  const name = toStr(pickFirst(raw, ["name", "title", "product_name"], "Product"));
  const price = toNum(pickFirst(raw, ["price", "amount", "final_price", "net_total"], 0));

  // Try common image fields (include backend's main_image_url/image_url)
  const imageCandidate = pickFirst<any>(raw, [
    "image",
    "image_url",
    "main_image_url",
    "main_image",
    "product_image",
    "product_image_url",
    "imageLink",
    "image_link",
    "coverImage",
    "photo",
    "picture",
    "thumbnail",
    "cover",
    "cover_image",
    "img",
    // arrays
    "sub_images",
    "images",
    "gallery",
  ]);

  // If candidate is an array, pick first entry; otherwise stringify
  const imageUrl = Array.isArray(imageCandidate) ? toStr(imageCandidate[0]) : toStr(imageCandidate);

  const stock = pickFirst<number>(raw, ["stock", "quantity", "available", "count_in_stock"], undefined as any);
  const description = toStr(pickFirst(raw, ["description", "desc", "short_description"], ""));
  const category = toStr(pickFirst(raw, ["category", "category_name"], ""));

  return {
    id,
    name,
    price,
    image: imageUrl || "/placeholder.svg",
    stock: stock === undefined ? undefined : toNum(stock),
    description,
    category,
  };
}

function normalizeCourse(raw: any): HomeCourse {
  const id = toStr(pickFirst(raw, ["id", "course_id", "_id"])) || crypto.randomUUID();
  const title = toStr(pickFirst(raw, ["title", "name", "course_title"], "Course"));
  const price = toNum(pickFirst(raw, ["price", "amount", "original_total", "net_total"], 0));

  const courseImageCandidate = pickFirst<any>(raw, [
    "image",
    "image_url",
    "main_image_url",
    "main_image",
    "course_image",
    "course_image_url",
    "imageLink",
    "image_link",
    "coverImage",
    "photo",
    "picture",
    "thumbnail",
    "cover",
    "cover_image",
    "img",
    // arrays
    "images",
    "gallery",
  ]);
  const imageUrl = Array.isArray(courseImageCandidate) ? toStr(courseImageCandidate[0]) : toStr(courseImageCandidate);

  const description = toStr(pickFirst(raw, ["description", "short_description", "desc"], ""));
  const instructor = toStr(pickFirst(raw, ["instructor", "teacher", "author", "trainer"], "Instructor"));
  const students = toNum(pickFirst(raw, ["students", "enrolled", "learners", "registrations"], 0));
  const rating = toNum(pickFirst(raw, ["rating", "avg_rating", "average_rating"], 0));
  const category = toStr(pickFirst(raw, ["category", "category_name", "topic"], ""));

  return {
    id,
    title,
    price,
    image: imageUrl || "/placeholder.svg",
    description,
    instructor,
    students,
    rating,
    category,
  };
}

export function useHomeData(params: UseHomeDataParams = {}): UseHomeDataReturn {
  const { initialFeaturedProducts = [], initialFeaturedCourses = [] } = params;
  const router = useRouter();
  const { addItem } = useCart();

  const [featuredProducts, setFeaturedProducts] = useState<HomeProduct[]>(initialFeaturedProducts);
  const [featuredCourses, setFeaturedCourses] = useState<HomeCourse[]>(initialFeaturedCourses);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState<boolean>(false);


  const fetchFeaturedProducts = useCallback(async () => {
    setIsLoadingProducts(true);
    try {
      // Use cached API for instant data access
      const data = await cachedProductsApi.fetchProducts();
      const normalized = data.slice(0, 3).map((item: any) => normalizeProduct(item));
      if (normalized.length > 0) setFeaturedProducts(normalized);
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.info("[Home] Featured products unavailable. Using initial/fallback.", err);
      }
      if (initialFeaturedProducts.length > 0) setFeaturedProducts(initialFeaturedProducts.slice(0, 3));
    } finally {
      setIsLoadingProducts(false);
    }
  }, [initialFeaturedProducts]);

  const fetchFeaturedCourses = useCallback(async () => {
    setIsLoadingCourses(true);
    try {
      // Use cached API for instant data access
      const data = await cachedCoursesApi.fetchCourses();
      const normalized = data.slice(0, 3).map((item: any) => normalizeCourse(item));
      if (normalized.length > 0) setFeaturedCourses(normalized);
      else if (initialFeaturedCourses.length > 0) setFeaturedCourses(initialFeaturedCourses.slice(0, 3));
      else setFeaturedCourses([]); // Set empty array if no courses available
    } catch (err: any) {
      // Handle all errors silently for courses - they may require authentication
      // Don't log errors or show any warnings to users
      const isAuthError = err?.response?.status === 401 || 
                          err?.message?.includes("401") || 
                          err?.message?.includes("Unauthorized");
      
      if (isAuthError && process.env.NODE_ENV !== "production") {
        console.info("[Home] Courses require authentication - showing empty state");
      } else if (process.env.NODE_ENV !== "production") {
        console.info("[Home] Featured courses unavailable - showing fallback");
      }
      
      // Use fallback or show empty state without errors
      if (initialFeaturedCourses.length > 0) {
        setFeaturedCourses(initialFeaturedCourses.slice(0, 3));
      } else {
        setFeaturedCourses([]);
      }
    } finally {
      setIsLoadingCourses(false);
    }
  }, [initialFeaturedCourses]);

  useEffect(() => {
    // Kick off both fetches in parallel
    void fetchFeaturedProducts();
    void fetchFeaturedCourses();
  }, [fetchFeaturedProducts, fetchFeaturedCourses]);

  const handleAddToCart = useCallback((product: HomeProduct) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      description: product.description,
      stock: product.stock,
    });
  }, [addItem]);

  const handleCourseEnrollment = useCallback((course: HomeCourse) => {
    // For now, navigate to the course details page. Advanced flows can open request modal.
    const id = toStr(course.id);
    if (id) {
      router.push(`/courses/${encodeURIComponent(id)}`);
    } else {
      router.push("/courses");
    }
  }, [router]);

  return useMemo(() => ({
    featuredProducts,
    featuredCourses,
    isLoadingProducts,
    isLoadingCourses,
    handleAddToCart,
    handleCourseEnrollment,
  }), [
    featuredProducts,
    featuredCourses,
    isLoadingProducts,
    isLoadingCourses,
    handleAddToCart,
    handleCourseEnrollment,
  ]);
}
