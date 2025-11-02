"use client";

import { getHttpClient } from "@/lib/http";
import { API_CONFIG } from "@/config/api";
import type {
  BlogPost,
  BlogCategory,
  BlogApiResponse,
  CategoryApiResponse
} from "@/types";

const http = getHttpClient();

function devLog(...args: any[]) {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.info("[client-blogs]", ...args);
  }
}

// Helper to pick first defined value from a set of possible keys (case-insensitive fallback)
function pick(raw: Record<string, any> | null | undefined, keys: string[], def?: any) {
  if (!raw) return def;
  for (const k of keys) {
    if (raw[k] !== undefined && raw[k] !== null) return raw[k];
    const alt = Object.keys(raw).find((rk) => rk.toLowerCase() === k.toLowerCase());
    if (alt && raw[alt] !== undefined && raw[alt] !== null) return raw[alt];
  }
  return def;
}

// Normalize blog category objects from API (support multiple shapes)
const normalizeCategory = (raw: any): BlogCategory => ({
  id: String(
    pick(raw, ["category_id", "id", "catId", "categoryId", "CategoryId"]) ?? ""
  ),
  name: String(
    pick(raw, ["title", "name", "category_name", "categoryTitle", "Title"]) ?? ""
  ).trim(),
  description: pick(raw, ["description", "desc", "details", "Description"]) ?? undefined,
  color: pick(raw, ["color", "Color"]) ?? undefined,
  blogCount: typeof raw?.blogCount === "number" ? raw.blogCount : undefined,
});

// Normalize raw API blog object into our BlogPost shape (support multiple keys)
const normalizeBlog = (raw: any): BlogPost => {
  const id = String(pick(raw, ["blog_id", "id", "blogId", "BlogId"]) ?? "");
  let title = pick(raw, [
    "title",
    "blog_title",
    "BlogTitle",
    "blog_title_en",
    "blogTitleEn",
    "title_en",
    "Title_en",
    "blog_subject",
    "blogSubject",
    "name",
    "Name",
    "blogname",
    "blog_name",
    "post_title",
    "postName",
    "postTitle",
    "page_title",
    "pageTitle",
    "name_en",
    "heading",
    "Heading",
    "headline",
    "Title",
    "subject",
    "Subject",
  ]) as string | undefined;
  const contentRaw =
    pick(raw, [
      "content",
      "Content",
      "description",
      "Description",
      "body",
      "text",
      "details",
      "Details",
      "content_text",
      "contentHtml",
      "post_content",
    ]) ?? "";
  const content = String(contentRaw);
  const providedExcerpt = pick(raw, ["excerpt", "summary", "short_desc", "shortDescription", "Excerpt", "Summary"]);
  const excerpt = String(
    providedExcerpt
      ? providedExcerpt
      : content
          .replace(/<[^>]+>/g, "")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 160)
  ).trim();
  let featuredImage = pick(raw, [
    "main_image",
    "image",
    "image_url",
    "cover",
    "thumbnail",
    "img",
    "image_path",
    "img_url",
    "photo",
    "photo_url",
    "picture",
    "Image",
  ]);
  const categoryId = String(pick(raw, ["category_id", "categoryId", "category", "categoryID", "CategoryId"]) ?? "");
  const categoryName = pick(raw, ["category_name", "categoryTitle", "CategoryName"]);
  const status = pick(raw, ["status", "state", "Status"]) ?? "published";
  const videoUrl = pick(raw, ["video_link", "videoUrl", "video_url", "Video"]);

  // Handle different date keys and formats
  let createdAtVal = pick(raw, ["created_at", "createdAt", "date", "published_at", "CreatedAt", "Created_at", "createdDate", "create_date"]);
  if (createdAtVal && typeof createdAtVal === "object" && createdAtVal?.date) {
    createdAtVal = createdAtVal.date; // common PHP date object shape
  }
  
  // Validate and normalize the date
  let createdAt = "";
  if (createdAtVal) {
    const testDate = new Date(createdAtVal);
    if (!isNaN(testDate.getTime())) {
      createdAt = testDate.toISOString();
    } else {
      // Invalid date, use current date as fallback
      createdAt = new Date().toISOString();
      if (process.env.NODE_ENV !== "production") {
        devLog("Invalid date value detected:", createdAtVal, "for blog:", id);
      }
    }
  } else {
    createdAt = new Date().toISOString();
  }

  // Final fallbacks
  // Try to extract first image from HTML content when featured image is missing
  if (!featuredImage && content) {
    try {
      const imgMatch = String(content).match(/<img[^>]+src=["']([^"']+)["']/i);
      if (imgMatch && imgMatch[1]) {
        featuredImage = imgMatch[1];
      }
    } catch {}
  }

  if (!title || String(title).trim().length === 0) {
    // Try to derive from heading tags inside HTML content
    try {
      const headingMatch = String(content).match(/<h[12][^>]*>(.*?)<\/h[12]>/i);
      const candidate = headingMatch && headingMatch[1]
        ? headingMatch[1].replace(/<[^>]+>/g, "").trim()
        : undefined;
      if (candidate && candidate.length > 3) {
        title = candidate.slice(0, 100);
      }
    } catch {}
  }

  if (!title || String(title).trim().length === 0) {
    // Derive a readable title from excerpt/content if backend didn't provide one
    const derived = (excerpt || content).split(/\.|\n/)[0]?.trim()?.slice(0, 60);
    title = derived && derived.length > 3 ? derived : "Untitled";
  }
  if (title === "Untitled" && id) {
    title = `Blog #${id}`;
  }

  // Dev logging when normalization produced weak values
  if (process.env.NODE_ENV !== "production") {
    const weak = title === "Untitled" || !featuredImage;
    if (weak) {
      try {
        devLog("Normalized with weak fields", {
          keys: Object.keys(raw || {}),
          id,
          title,
          hasImage: Boolean(featuredImage),
          categoryId,
          categoryName,
        });
      } catch {}
    }
  }

  return {
    id,
    title: String(title),
    content,
    excerpt,
    featuredImage,
    categoryId,
    categoryName,
    status,
    videoUrl,
    createdAt,
  };
};

// Client-side blog API functions
export const clientBlogApi = {
  // Fetch all published blogs
  async fetchBlogs(): Promise<BlogPost[]> {
    const response = await http.get<BlogApiResponse>(
      API_CONFIG.USER_FUNCTIONS.blogs.getAll
    );
    const data = response.data;

    // Handle different API response formats
    let blogsArray: any[] = [];

    if (Array.isArray(data)) {
      blogsArray = data;
    } else if (data && Array.isArray(data.blogs)) {
      blogsArray = data.blogs;
    } else if (data && Array.isArray(data.data)) {
      blogsArray = data.data;
    } else if (data && typeof data === "object") {
      // If it's an object, try to find an array property
      const possibleArrays = Object.values(data).filter(Array.isArray);
      if (possibleArrays.length > 0) {
        blogsArray = possibleArrays[0] as any[];
      }
    }

    // Ensure we have an array and filter only published blogs (exclude archived)
    if (Array.isArray(blogsArray)) {
      const publishedBlogs = blogsArray.filter((blog: any) => blog && (blog.status ?? "published") !== "archived");
      const normalized = publishedBlogs.map(normalizeBlog).filter((b) => b.id);
      // Dev: log first item if suspicious
      if (normalized[0] && (normalized[0].title === "Untitled" || !normalized[0].featuredImage)) {
        try { devLog("fetchBlogs first item weak", normalized[0]); } catch {}
      }
      return normalized;
    } else {
      throw new Error("No blogs available from API");
    }
  },

  // Fetch blog categories
  async fetchCategories(): Promise<BlogCategory[]> {
    const response = await http.get<CategoryApiResponse>(
      API_CONFIG.USER_FUNCTIONS.blogs.categories.getAll
    );
    const data = response.data;

    let categoriesArray: any[] = [];

    if (Array.isArray(data)) {
      categoriesArray = data;
    } else if (data && Array.isArray(data.categories)) {
      categoriesArray = data.categories;
    } else if (data && Array.isArray(data.data)) {
      categoriesArray = data.data;
    }

    // Normalize and keep only categories with valid id and name
    return categoriesArray.map(normalizeCategory).filter((c) => c.id && c.name);
  },

  // Search blogs
  async searchBlogs(query: string): Promise<BlogPost[]> {
    const response = await http.post<BlogApiResponse>(
      API_CONFIG.USER_FUNCTIONS.blogs.search,
      { keyword: query }
    );
    const data = response.data;

    // Handle different API response formats for search
    let blogsArray: any[] = [];

    if (Array.isArray(data)) {
      blogsArray = data;
    } else if (data && Array.isArray(data.blogs)) {
      blogsArray = data.blogs;
    } else if (data && Array.isArray(data.data)) {
      blogsArray = data.data;
    } else if (data && typeof data === "object") {
      const possibleArrays = Object.values(data).filter(Array.isArray);
      if (possibleArrays.length > 0) {
        blogsArray = possibleArrays[0] as any[];
      }
    }

    if (Array.isArray(blogsArray)) {
      const publishedBlogs = blogsArray.filter((blog: any) => blog && (blog.status === "published" || !blog.status));
      return publishedBlogs.map(normalizeBlog).filter((b) => b.id);
    } else {
      return [];
    }
  },

  // Fetch blogs by category
  async fetchBlogsByCategory(categoryId: string): Promise<BlogPost[]> {
    const response = await http.get<BlogApiResponse>(
      API_CONFIG.USER_FUNCTIONS.blogs.categories.getBlogsByCategory(categoryId)
    );
    const data = response.data;

    let blogsArray: any[] = [];

    if (Array.isArray(data)) {
      blogsArray = data;
    } else if (data && Array.isArray(data.blogs)) {
      blogsArray = data.blogs;
    } else if (data && Array.isArray(data.data)) {
      blogsArray = data.data;
    }

    if (Array.isArray(blogsArray)) {
      const publishedBlogs = blogsArray.filter((blog: any) => blog && (blog.status ?? "published") !== "archived");
      return publishedBlogs.map(normalizeBlog).filter((b) => b.id);
    }

    return [];
  },

  // Fetch single blog by ID
  async fetchBlogById(blogId: string): Promise<BlogPost | null> {
    try {
      const response = await http.get<BlogApiResponse>(
        API_CONFIG.USER_FUNCTIONS.blogs.getById(blogId)
      );
      const data: any = response.data;

      // Accept multiple response shapes (blog, Blog, blogs[0], Blog[0], data, array, or any object containing a blog-like object)
      let raw: any = null;
      if (Array.isArray(data)) raw = data[0];
      else if (data?.blog) raw = Array.isArray(data.blog) ? data.blog[0] : data.blog;
      else if (data?.Blog) raw = Array.isArray(data.Blog) ? data.Blog[0] : data.Blog;
      else if (Array.isArray(data?.blogs)) raw = data.blogs[0];
      else if (Array.isArray(data?.Blog?.data)) raw = data.Blog.data[0];
      else if (data?.data) raw = Array.isArray(data.data) ? data.data[0] : data.data;
      else raw = data;
      // If still not a usable object, search first object value that looks like a blog
      if (!raw || typeof raw !== 'object') {
        const values = Object.values(data || {});
        raw = values.find((v: any) => v && typeof v === 'object' && (v.blog_id || v.id || v.blogId || v.title || v.content)) || null;
      }

      if (raw) {
        let normalized = normalizeBlog(raw);
        // Ensure we carry through the requested id if backend omitted it
        if (!normalized.id && blogId) {
          normalized.id = String(blogId);
        }
        // If title is weak, try to improve from the list endpoint before returning
        const weakTitle = !normalized.title || normalized.title === "Untitled" || normalized.title === `Blog #${normalized.id}`;
        if (weakTitle) {
          try {
            const all = await this.fetchBlogs();
            const better = all.find((b) => String(b.id) === String(normalized.id));
            if (better && better.title && better.title !== "Untitled") {
              normalized = { ...better, ...normalized, title: better.title };
            }
          } catch {}
        }
        // Accept only if we have a valid id and not archived
        const isValid = Boolean(normalized.id);
        if (isValid && (normalized.status ?? "published") !== "archived") {
          return normalized;
        }
      }
    } catch (e) {
      // ignore and try fallback below
    }

    // Fallback: fetch all blogs and find the one with matching id
    try {
      const all = await this.fetchBlogs();
      const idStr = String(blogId);
      const found = all.find((b) => String(b.id) === idStr);
      if (found) return found;
    } catch {}

    return null;
  },

  // Get image URL helper
  getImageUrl(imagePath?: string): string | null {
    if (!imagePath) return null;
    let p = String(imagePath).replace(/\\/g, "/");
    p = p.replace(/^\/?public\//i, "/");
    if (/^https?:\/\//i.test(p)) return p;
    const path = p.startsWith("/") ? p : `/${p}`;
    const base = API_CONFIG.BASE_URL.replace(/\/$/, "");
    return `${base}${path}`;
  },

  // Generate consistent colors for categories
  getCategoryColor(index: number): string {
    const colors = [
      "bg-red-500",
      "bg-green-500",
      "bg-orange-500",
      "bg-purple-500",
      "bg-yellow-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
      "bg-cyan-500",
      "bg-lime-500",
    ];
    return colors[index % colors.length];
  },

  // Format data helpers
  formatBlogsData: (blogsData: any[]): BlogPost[] => {
    return blogsData.map(normalizeBlog).filter((b) => b.id);
  },

  formatCategoriesData: (categoriesData: any[]): BlogCategory[] => {
    return categoriesData.map(normalizeCategory).filter((c) => c.id && c.name);
  }
};
