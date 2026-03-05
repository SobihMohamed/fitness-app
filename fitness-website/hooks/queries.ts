"use client";

/**
 * React Query hooks for client-facing data.
 *
 * Each hook is a thin wrapper around `useQuery` / `useMutation` that:
 *  - Specifies the query key (from queryKeys)
 *  - Calls the matching fetcher from `lib/api/fetchers`
 *  - Optionally accepts `initialData` for SSR hydration
 *
 * Consumers get `{ data, isLoading, error, refetch }` for free — no
 * manual `useState`, `useEffect`, or custom cache management needed.
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import * as fetchers from "@/lib/api/fetchers";
import type { ClientProduct, ClientCategory, ClientService } from "@/types";
import type { HomeProduct, HomeCourse } from "@/types/home";
import type { BlogPost, BlogCategory } from "@/types";

// ═══════════════════ Products ═══════════════════

export function useProducts(initialData?: ClientProduct[]) {
  return useQuery({
    queryKey: queryKeys.products.all,
    queryFn: fetchers.fetchProducts,
    ...(initialData ? { initialData } : {}),
  });
}

export function useProductDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => fetchers.fetchProductById(id),
    enabled: !!id,
  });
}

export function useProductSearch(keyword: string) {
  return useQuery({
    queryKey: queryKeys.products.search(keyword),
    queryFn: () => fetchers.searchProducts(keyword),
    enabled: keyword.trim().length > 0,
  });
}

export function useProductsByCategory(categoryId: number) {
  return useQuery({
    queryKey: queryKeys.products.byCategory(categoryId),
    queryFn: () => fetchers.fetchProductsByCategory(categoryId),
    enabled: categoryId > 0,
  });
}

export function useRelatedProducts(categoryId: number, excludeId?: number) {
  return useQuery({
    queryKey: queryKeys.products.related(categoryId, excludeId),
    queryFn: () => fetchers.fetchRelatedProducts(categoryId, excludeId),
    enabled: categoryId > 0,
  });
}

// ═══════════════════ Categories ═══════════════════

export function useCategories(initialData?: ClientCategory[]) {
  return useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: fetchers.fetchCategories,
    staleTime: 30 * 60 * 1000, // categories rarely change
    ...(initialData ? { initialData } : {}),
  });
}

// ═══════════════════ Courses ═══════════════════

export function useCourses(initialData?: any[]) {
  return useQuery({
    queryKey: queryKeys.courses.all,
    queryFn: fetchers.fetchCourses,
    ...(initialData && initialData.length > 0 ? { initialData } : {}),
  });
}

export function useCourseDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.courses.detail(id),
    queryFn: () => fetchers.fetchCourseById(id),
    enabled: !!id,
  });
}

export function useCourseSearch(keyword: string) {
  return useQuery({
    queryKey: queryKeys.courses.search(keyword),
    queryFn: () => fetchers.searchCourses(keyword),
    enabled: keyword.trim().length > 0,
  });
}

// ═══════════════════ Services ═══════════════════

export function useServices(initialData?: ClientService[]) {
  return useQuery({
    queryKey: queryKeys.services.all,
    queryFn: fetchers.fetchServices,
    ...(initialData ? { initialData } : {}),
  });
}

export function useServiceDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.services.detail(id),
    queryFn: () => fetchers.fetchServiceById(id),
    enabled: !!id,
  });
}

// ═══════════════════ Blogs ═══════════════════

export function useBlogs(initialData?: BlogPost[]) {
  return useQuery({
    queryKey: queryKeys.blogs.all,
    queryFn: fetchers.fetchBlogs,
    ...(initialData ? { initialData } : {}),
  });
}

export function useBlogDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.blogs.detail(id),
    queryFn: () => fetchers.fetchBlogById(id),
    enabled: !!id,
  });
}

export function useBlogSearch(keyword: string) {
  return useQuery({
    queryKey: queryKeys.blogs.search(keyword),
    queryFn: () => fetchers.searchBlogs(keyword),
    enabled: keyword.trim().length > 0,
  });
}

export function useBlogCategories(initialData?: BlogCategory[]) {
  return useQuery({
    queryKey: queryKeys.blogs.categories,
    queryFn: fetchers.fetchBlogCategories,
    staleTime: 30 * 60 * 1000,
    ...(initialData ? { initialData } : {}),
  });
}

export function useBlogsByCategory(categoryId: string) {
  return useQuery({
    queryKey: queryKeys.blogs.byCategory(categoryId),
    queryFn: () => fetchers.fetchBlogsByCategory(categoryId),
    enabled: !!categoryId,
  });
}

// ═══════════════════ Home (featured) ═══════════════════

export function useFeaturedProducts(initialData?: HomeProduct[], limit = 6) {
  return useQuery({
    queryKey: [...queryKeys.products.all, "featured", limit],
    queryFn: () => fetchers.fetchFeaturedProducts(limit),
    ...(initialData?.length ? { initialData } : {}),
  });
}

export function useFeaturedCourses(initialData?: HomeCourse[], limit = 6) {
  return useQuery({
    queryKey: [...queryKeys.courses.all, "featured", limit],
    queryFn: () => fetchers.fetchFeaturedCourses(limit),
    ...(initialData?.length ? { initialData } : {}),
  });
}

// ═══════════════════ User Dashboard ═══════════════════

export function useUserOrders(enabled = true) {
  return useQuery({
    queryKey: queryKeys.user.orders,
    queryFn: fetchers.fetchUserOrders,
    enabled,
  });
}

export function useUserNotifications(enabled = true) {
  return useQuery({
    queryKey: queryKeys.user.notifications,
    queryFn: fetchers.fetchUserNotifications,
    enabled,
  });
}

export function useUserProfile(enabled = true) {
  return useQuery({
    queryKey: queryKeys.user.profile,
    queryFn: fetchers.fetchUserProfile,
    enabled,
  });
}

export function useSubscribedCourses(enabled = true) {
  return useQuery({
    queryKey: queryKeys.user.subscribedCourses,
    queryFn: fetchers.fetchSubscribedCourses,
    enabled,
  });
}

export function useTrainingRequests(enabled = true) {
  return useQuery({
    queryKey: queryKeys.user.trainingRequests,
    queryFn: fetchers.fetchTrainingRequests,
    enabled,
  });
}

export function useCourseRequests(enabled = true) {
  return useQuery({
    queryKey: queryKeys.user.courseRequests,
    queryFn: fetchers.fetchCourseRequests,
    enabled,
  });
}

// ═══════════════════ Cache Invalidation Helpers ═══════════════════

/**
 * Hook that returns helpers to invalidate specific cache segments.
 * Use after mutations (add/update/delete) to keep UI in sync.
 */
export function useInvalidateQueries() {
  const qc = useQueryClient();
  return {
    invalidateProducts: () =>
      qc.invalidateQueries({ queryKey: queryKeys.products.all }),
    invalidateCategories: () =>
      qc.invalidateQueries({ queryKey: queryKeys.categories.all }),
    invalidateCourses: () =>
      qc.invalidateQueries({ queryKey: queryKeys.courses.all }),
    invalidateServices: () =>
      qc.invalidateQueries({ queryKey: queryKeys.services.all }),
    invalidateBlogs: () =>
      qc.invalidateQueries({ queryKey: queryKeys.blogs.all }),
    invalidateUserOrders: () =>
      qc.invalidateQueries({ queryKey: queryKeys.user.orders }),
    invalidateUserNotifications: () =>
      qc.invalidateQueries({ queryKey: queryKeys.user.notifications }),
    invalidateAll: () => qc.invalidateQueries(),
  };
}
