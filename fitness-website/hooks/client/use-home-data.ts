"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { API_CONFIG } from "@/config/api";
import { useCart } from "@/contexts/cart-context";
import { useRouter } from "next/navigation";

// Lightweight types for the Home page consumption
export interface HomeProductItem {
  id: string;
  name: string;
  price: number;
  image: string;
  stock?: number;
  category?: string;
  description?: string;
}

export interface HomeCourseItem {
  id: string;
  title: string;
  price?: number;
  image?: string;
  short_description?: string;
}

export interface UseHomeDataParams {
  initialFeaturedProducts?: HomeProductItem[];
  initialFeaturedCourses?: HomeCourseItem[];
}

export interface UseHomeDataReturn {
  featuredProducts: HomeProductItem[];
  featuredCourses: HomeCourseItem[];
  isLoadingProducts: boolean;
  isLoadingCourses: boolean;
  handleAddToCart: (product: HomeProductItem) => void;
  handleCourseEnrollment: (course: HomeCourseItem) => void;
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

function normalizeProduct(raw: any): HomeProductItem {
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

function normalizeCourse(raw: any): HomeCourseItem {
  const id = toStr(pickFirst(raw, ["id", "course_id", "_id"])) || crypto.randomUUID();
  const title = toStr(pickFirst(raw, ["title", "name", "course_title"], "Course"));
  const price = pickFirst<number>(raw, ["price", "amount", "original_total", "net_total"], undefined as any);

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

  const short_description = toStr(pickFirst(raw, ["short_description", "description", "desc"], ""));

  return {
    id,
    title,
    price: price === undefined ? undefined : toNum(price),
    image: imageUrl || "/placeholder.svg",
    short_description,
  };
}

export function useHomeData(params: UseHomeDataParams = {}): UseHomeDataReturn {
  const { initialFeaturedProducts = [], initialFeaturedCourses = [] } = params;
  const router = useRouter();
  const { addItem } = useCart();

  const [featuredProducts, setFeaturedProducts] = useState<HomeProductItem[]>(initialFeaturedProducts);
  const [featuredCourses, setFeaturedCourses] = useState<HomeCourseItem[]>(initialFeaturedCourses);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState<boolean>(false);

  const productsUrl = API_CONFIG.USER_FUNCTIONS.products.getAll;
  const coursesUrl = API_CONFIG.USER_FUNCTIONS.courses.getAll;

  const fetchFeaturedProducts = useCallback(async () => {
    setIsLoadingProducts(true);
    try {
      const res = await fetch(productsUrl, { method: "GET" });
      if (!res.ok) throw new Error(`Products fetch failed: ${res.status}`);
      const data = await res.json();

      // Support different response shapes: {data: [...]}, {products: [...]}, or array
      const list: any[] = Array.isArray(data)
        ? data
        : (data?.data ?? data?.products ?? []);

      const normalized = list.slice(0, 8).map(normalizeProduct);
      if (normalized.length > 0) setFeaturedProducts(normalized);
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.info("[Home] Featured products unavailable. Using initial/fallback.", err);
      }
      if (initialFeaturedProducts.length > 0) setFeaturedProducts(initialFeaturedProducts);
    } finally {
      setIsLoadingProducts(false);
    }
  }, [productsUrl, initialFeaturedProducts]);

  const fetchFeaturedCourses = useCallback(async () => {
    setIsLoadingCourses(true);
    try {
      const res = await fetch(coursesUrl, { method: "GET" });
      if (!res.ok) throw new Error(`Courses fetch failed: ${res.status}`);
      const data = await res.json();

      const list: any[] = Array.isArray(data)
        ? data
        : (data?.data ?? data?.courses ?? []);

      const normalized = list.slice(0, 8).map(normalizeCourse);
      if (normalized.length > 0) setFeaturedCourses(normalized);
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.info("[Home] Featured courses unavailable. Using initial/fallback.", err);
      }
      if (initialFeaturedCourses.length > 0) setFeaturedCourses(initialFeaturedCourses);
    } finally {
      setIsLoadingCourses(false);
    }
  }, [coursesUrl, initialFeaturedCourses]);

  useEffect(() => {
    // Kick off both fetches in parallel
    void fetchFeaturedProducts();
    void fetchFeaturedCourses();
  }, [fetchFeaturedProducts, fetchFeaturedCourses]);

  const handleAddToCart = useCallback((product: HomeProductItem) => {
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

  const handleCourseEnrollment = useCallback((course: HomeCourseItem) => {
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
