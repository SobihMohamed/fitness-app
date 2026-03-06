"use client";

/**
 * Pure fetcher functions consumed by React Query hooks.
 *
 * Each function:
 *  1. Calls the PHP backend via the unified Axios clients
 *  2. Normalises the response into the app's TypeScript types
 *  3. Throws on failure (React Query catches and retries automatically)
 *
 * No caching logic here – that's React Query's job.
 */

import axios from "axios";
import { API_CONFIG } from "@/config/api";
import { getUserHttpClient } from "@/lib/http";
import { extractArray } from "@/lib/data";
import type { ClientProduct, ClientCategory, ClientService } from "@/types";
import {
  normalizeService,
  normalizeBlog,
  normalizeBlogCategory,
  normalizeProduct,
  normalizeCategory,
  normalizeHomeProduct,
  normalizeHomeCourse,
} from "@/lib/api/normalizers";
export {
  normalizeService,
  normalizeBlog,
  normalizeBlogCategory,
  normalizeProduct,
  normalizeCategory,
  normalizeHomeProduct,
  normalizeHomeCourse,
};
import type { HomeProduct, HomeCourse } from "@/types/home";
import type { BlogPost, BlogCategory } from "@/types";

// ═══════════════════════════════════════════════════════════
//  PUBLIC FETCHER FUNCTIONS (consumed by React Query hooks)
// ═══════════════════════════════════════════════════════════

// ---- Products ----

export async function fetchProducts(): Promise<ClientProduct[]> {
  const res = await axios.get(API_CONFIG.USER_FUNCTIONS.products.getAll);
  return extractArray(res.data).map(normalizeProduct);
}

export async function fetchProductById(id: string): Promise<ClientProduct> {
  const res = await axios.get(API_CONFIG.USER_FUNCTIONS.products.getById(id));
  const raw =
    res.data?.data || res.data?.Product || res.data?.product || res.data;
  if (!raw) throw new Error("Product not found");
  return normalizeProduct(raw);
}

export async function searchProducts(
  keyword: string,
): Promise<ClientProduct[]> {
  const res = await axios.post(API_CONFIG.USER_FUNCTIONS.products.search, {
    keyword,
  });
  return extractArray(res.data).map(normalizeProduct);
}

export async function fetchProductsByCategory(
  catId: number,
): Promise<ClientProduct[]> {
  const res = await axios.get(
    API_CONFIG.USER_FUNCTIONS.categories.getProductsByCategory(
      catId.toString(),
    ),
  );
  return extractArray(res.data).map(normalizeProduct);
}

export async function fetchRelatedProducts(
  catId: number,
  excludeId?: number,
): Promise<ClientProduct[]> {
  const all = await fetchProductsByCategory(catId);
  return all
    .filter((p) => p.product_id !== excludeId && p.is_active)
    .slice(0, 4);
}

// ---- Categories ----

export async function fetchCategories(): Promise<ClientCategory[]> {
  const res = await axios.get(API_CONFIG.USER_FUNCTIONS.categories.getAll);
  return extractArray(res.data, ["data", "categories"]).map(normalizeCategory);
}

// ---- Courses ----

export async function fetchCourses(): Promise<any[]> {
  const http = getUserHttpClient();
  const res = await http.get(API_CONFIG.USER_FUNCTIONS.courses.getAll);
  return extractArray(res.data);
}

export async function fetchCourseById(id: string): Promise<any> {
  const http = getUserHttpClient();
  const res = await http.get(API_CONFIG.USER_FUNCTIONS.courses.getById(id));
  return res.data?.data || res.data?.Course || res.data?.course || res.data;
}

export async function searchCourses(keyword: string): Promise<any[]> {
  const http = getUserHttpClient();
  const res = await http.post(API_CONFIG.USER_FUNCTIONS.courses.search, {
    keyword,
  });
  return extractArray(res.data);
}

// ---- Services ----

export async function fetchServices(): Promise<ClientService[]> {
  const res = await axios.get(API_CONFIG.USER_FUNCTIONS.services.getAll);
  return extractArray(res.data, ["data", "services"]).map(normalizeService);
}

export async function fetchServiceById(id: string): Promise<ClientService> {
  const res = await axios.get(API_CONFIG.USER_FUNCTIONS.services.getById(id));
  const raw =
    res.data?.data || res.data?.Service || res.data?.service || res.data;
  if (!raw) throw new Error("Service not found");
  return normalizeService(raw);
}

// ---- Blogs ----

export async function fetchBlogs(): Promise<BlogPost[]> {
  const res = await axios.get(API_CONFIG.USER_FUNCTIONS.blogs.getAll);
  const arr = extractArray(res.data, ["data", "blogs"]);
  return arr
    .filter((b: any) => (b.status ?? "published") !== "archived")
    .map(normalizeBlog)
    .filter((b) => b.id);
}

export async function fetchBlogById(id: string): Promise<BlogPost | null> {
  const res = await axios.get(API_CONFIG.USER_FUNCTIONS.blogs.getById(id));
  const data: any = res.data;
  let raw: any =
    data?.blog ||
    data?.Blog ||
    data?.data ||
    (Array.isArray(data) ? data[0] : data);
  if (Array.isArray(raw)) raw = raw[0];
  if (!raw || typeof raw !== "object") return null;
  const blog = normalizeBlog(raw);
  if (!blog.id && id) blog.id = String(id);
  return blog;
}

export async function searchBlogs(keyword: string): Promise<BlogPost[]> {
  const res = await axios.post(API_CONFIG.USER_FUNCTIONS.blogs.search, {
    keyword,
  });
  return extractArray(res.data, ["data", "blogs"])
    .map(normalizeBlog)
    .filter((b) => b.id);
}

export async function fetchBlogCategories(): Promise<BlogCategory[]> {
  const res = await axios.get(
    API_CONFIG.USER_FUNCTIONS.blogs.categories.getAll,
  );
  return extractArray(res.data, ["data", "categories"])
    .map(normalizeBlogCategory)
    .filter((c) => c.id && c.name);
}

export async function fetchBlogsByCategory(
  categoryId: string,
): Promise<BlogPost[]> {
  const res = await axios.get(
    API_CONFIG.USER_FUNCTIONS.blogs.categories.getBlogsByCategory(categoryId),
  );
  return extractArray(res.data, ["data", "blogs"])
    .filter((b: any) => (b.status ?? "published") !== "archived")
    .map(normalizeBlog)
    .filter((b) => b.id);
}

// ---- Home (featured) ----

export async function fetchFeaturedProducts(limit = 6): Promise<HomeProduct[]> {
  const res = await axios.get(API_CONFIG.USER_FUNCTIONS.products.getAll);
  return extractArray(res.data).slice(0, limit).map(normalizeHomeProduct);
}

export async function fetchFeaturedCourses(limit = 6): Promise<HomeCourse[]> {
  try {
    const http = getUserHttpClient();
    const res = await http.get(API_CONFIG.USER_FUNCTIONS.courses.getAll);
    return extractArray(res.data).slice(0, limit).map(normalizeHomeCourse);
  } catch (err: any) {
    // Courses may require auth – return empty for unauthenticated visitors
    if (err?.status === 401 || err?.response?.status === 401) return [];
    throw err;
  }
}

// ---- User dashboard ----

export async function fetchUserOrders(): Promise<any[]> {
  const http = getUserHttpClient();
  const res = await http.get(API_CONFIG.USER_FUNCTIONS.orders.getMyOrders);
  return extractArray(res.data);
}

export async function fetchUserNotifications(): Promise<any[]> {
  const http = getUserHttpClient();
  const res = await http.get(API_CONFIG.USER_FUNCTIONS.notifications.getAll);
  return extractArray(res.data);
}

export async function fetchUserProfile(): Promise<any> {
  const http = getUserHttpClient();
  const res = await http.get(API_CONFIG.USER_FUNCTIONS.user.profile);
  return res.data?.data || res.data?.user || res.data;
}

export async function fetchSubscribedCourses(): Promise<any[]> {
  const http = getUserHttpClient();
  const res = await http.get(
    API_CONFIG.USER_FUNCTIONS.courses.allSubscribedCourses,
  );
  return extractArray(res.data);
}

async function fetchUserRequests(type: "training" | "courses"): Promise<any[]> {
  const token =
    typeof window !== "undefined" ? sessionStorage.getItem("token") : null;
  const res = await fetch(`/api/user-requests?type=${type}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) return [];
  const json = await res.json();
  return extractArray(json);
}

export function fetchTrainingRequests(): Promise<any[]> {
  return fetchUserRequests("training");
}

export function fetchCourseRequests(): Promise<any[]> {
  return fetchUserRequests("courses");
}
