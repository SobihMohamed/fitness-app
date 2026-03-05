/**
 * Pure data-normalisation helpers.
 * No "use client" – safe to import from both Server and Client Components.
 */

import type {
  ClientService,
  ClientProduct,
  ClientCategory,
  BlogPost,
  BlogCategory,
} from "@/types";
import type { HomeProduct, HomeCourse } from "@/types/home";

// ─────────────────────── shared helpers ────────────────────────

function toStr(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v);
}

function toNum(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function pickFirst(
  obj: Record<string, unknown> | null | undefined,
  keys: string[],
  fallback?: unknown,
) {
  if (!obj) return fallback;
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null && obj[k] !== "") return obj[k];
  }
  return fallback;
}

export function normalizeProduct(item: Record<string, any>): ClientProduct {
  return {
    product_id: parseInt(item.product_id || item.id, 10) || 0,
    name: item.name || "Unnamed Product",
    category_id: parseInt(item.category_id || item.cat_id, 10) || 0,
    price: parseFloat(item.price) || 0,
    description: item.description || "",
    image_url: item.image_url || item.image || item.main_image_url || null,
    stock_quantity:
      parseInt(item.stock_quantity || item.is_in_stock || item.quantity, 10) ||
      0,
    is_active: item.is_active !== undefined ? item.is_active : true,
    created_at: item.created_at || "",
    updated_at: item.updated_at || "",
    sub_images: Array.isArray(item.sub_images) ? item.sub_images : [],
  };
}

export function normalizeCategory(item: Record<string, any>): ClientCategory {
  return {
    category_id: parseInt(item.category_id || item.id, 10) || 0,
    name: item.name || "Unknown Category",
  };
}

export function normalizeHomeProduct(raw: Record<string, any>): HomeProduct {
  const imageCandidate = pickFirst(raw, [
    "image",
    "image_url",
    "main_image_url",
    "main_image",
    "product_image",
    "thumbnail",
    "cover_image",
  ]);
  const imageUrl = Array.isArray(imageCandidate)
    ? toStr(imageCandidate[0])
    : toStr(imageCandidate);

  return {
    id: toStr(pickFirst(raw, ["id", "product_id", "_id"])) || "",
    name: toStr(pickFirst(raw, ["name", "title", "product_name"], "Product")),
    price: toNum(pickFirst(raw, ["price", "amount", "final_price"], 0)),
    image: imageUrl || "/placeholder.svg",
    stock: (() => {
      const s = pickFirst(raw, ["stock", "quantity", "available"]);
      return s === undefined ? undefined : toNum(s);
    })(),
    description: toStr(
      pickFirst(raw, ["description", "short_description"], ""),
    ),
    category: toStr(pickFirst(raw, ["category", "category_name"], "")),
  };
}

export function normalizeHomeCourse(raw: Record<string, any>): HomeCourse {
  const imageCandidate = pickFirst(raw, [
    "image",
    "image_url",
    "main_image_url",
    "main_image",
    "course_image",
    "thumbnail",
    "cover_image",
  ]);
  const imageUrl = Array.isArray(imageCandidate)
    ? toStr(imageCandidate[0])
    : toStr(imageCandidate);

  return {
    id: toStr(pickFirst(raw, ["id", "course_id", "_id"])) || "",
    title: toStr(pickFirst(raw, ["title", "name", "course_title"], "Course")),
    price: toNum(pickFirst(raw, ["price", "amount"], 0)),
    image: imageUrl || "/placeholder.svg",
    description: toStr(
      pickFirst(raw, ["description", "short_description"], ""),
    ),
    instructor: toStr(
      pickFirst(raw, ["instructor", "teacher", "trainer"], "Instructor"),
    ),
    students: toNum(
      pickFirst(raw, ["students", "enrolled", "registrations"], 0),
    ),
    rating: toNum(pickFirst(raw, ["rating", "avg_rating"], 0)),
    category: toStr(pickFirst(raw, ["category", "category_name"], "")),
  };
}

export function normalizeService(item: Record<string, any>): ClientService {
  return {
    id: parseInt(item.service_id || item.id, 10) || 0,
    title: item.name || item.title || "Unnamed Service",
    description: item.description || "",
    price: parseFloat(item.price) || 0,
    duration: item.duration || "",
    image:
      item.picture ||
      item.image_url ||
      item.image ||
      item.main_image_url ||
      null,
    created_at: item.created_at || "",
  };
}

export function normalizeBlog(raw: Record<string, any>): BlogPost {
  const id = toStr(pickFirst(raw, ["blog_id", "id", "blogId"]) ?? "");
  const title = toStr(
    pickFirst(raw, ["title", "blog_title", "name", "heading", "subject"]) ??
      "Untitled",
  );
  const content = toStr(
    pickFirst(raw, ["content", "description", "body", "text", "details"]) ?? "",
  );
  const providedExcerpt = pickFirst(raw, ["excerpt", "summary", "short_desc"]);
  const excerpt = toStr(
    providedExcerpt ||
      content
        .replace(/<[^>]+>/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 160),
  );
  const featuredImage = pickFirst(raw, [
    "main_image",
    "image",
    "image_url",
    "cover",
    "thumbnail",
  ]) as string | undefined;

  let createdAtVal = pickFirst(raw, [
    "created_at",
    "createdAt",
    "date",
    "published_at",
  ]);
  if (
    createdAtVal &&
    typeof createdAtVal === "object" &&
    (createdAtVal as any)?.date
  ) {
    createdAtVal = (createdAtVal as any).date;
  }
  let createdAt = "";
  if (createdAtVal) {
    const d = new Date(createdAtVal as string);
    createdAt = !isNaN(d.getTime())
      ? d.toISOString()
      : new Date().toISOString();
  } else {
    createdAt = new Date().toISOString();
  }

  return {
    id,
    title: title || `Blog #${id}`,
    content,
    excerpt,
    featuredImage: featuredImage || undefined,
    categoryId: toStr(pickFirst(raw, ["category_id", "categoryId"]) ?? ""),
    categoryName: pickFirst(raw, ["category_name", "categoryTitle"]) as
      | string
      | undefined,
    status: (pickFirst(raw, ["status", "state"]) as string) ?? "published",
    videoUrl: pickFirst(raw, ["video_link", "videoUrl", "video_url"]) as
      | string
      | undefined,
    createdAt,
  };
}

export function normalizeBlogCategory(raw: Record<string, any>): BlogCategory {
  return {
    id: toStr(pickFirst(raw, ["category_id", "id"]) ?? ""),
    name: toStr(
      pickFirst(raw, ["title", "name", "category_name"]) ?? "",
    ).trim(),
    description: pickFirst(raw, ["description"]) as string | undefined,
    color: pickFirst(raw, ["color"]) as string | undefined,
  };
}
