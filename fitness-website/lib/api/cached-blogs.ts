"use client";

import { dataCache } from "@/lib/cache";
import axios from "axios";
import { API_CONFIG } from "@/config/api";
import { clientBlogApi } from "@/lib/api/client-blogs";

/**
 * Cached Blogs API Client
 */

const CACHE_CONFIG = {
  blogs: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 60 * 60 * 1000, // 1 hour
  },
  blogDetail: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  },
};

export const cachedBlogsApi = {
  async fetchBlogs(): Promise<any[]> {
    // Delegate to clientBlogApi to ensure normalization of fields (id, createdAt, featuredImage, etc.)
    return dataCache.get(
      'blogs:v2:all',
      async () => {
        try {
          const blogs = await clientBlogApi.fetchBlogs();
          return blogs || [];
        } catch {
          // Fallback to raw fetch and normalize
          const response = await axios.get(API_CONFIG.USER_FUNCTIONS.blogs.getAll);
          const raw = response.data?.data || response.data || [];
          return Array.isArray(raw) ? clientBlogApi.formatBlogsData(raw) : [];
        }
      },
      CACHE_CONFIG.blogs
    );
  },

  async fetchBlogById(blogId: string): Promise<any> {
    // Use clientBlogApi to handle various response shapes and normalization
    return dataCache.get(
      `blog:v2:${blogId}`,
      async () => {
        try {
          const blog = await clientBlogApi.fetchBlogById(blogId);
          return blog;
        } catch {
          const response = await axios.get(API_CONFIG.USER_FUNCTIONS.blogs.getById(blogId));
          const raw = response.data?.data || response.data;
          // Try to normalize single object or array
          if (Array.isArray(raw)) {
            const arr = clientBlogApi.formatBlogsData(raw);
            return arr.find(b => String(b.id) === String(blogId)) || arr[0] || null;
          }
          return raw;
        }
      },
      CACHE_CONFIG.blogDetail
    );
  },

  async prefetchBlogs(): Promise<void> {
    await dataCache.prefetch('blogs:v2:all', async () => {
      try {
        const blogs = await clientBlogApi.fetchBlogs();
        return blogs || [];
      } catch {
        const response = await axios.get(API_CONFIG.USER_FUNCTIONS.blogs.getAll);
        const raw = response.data?.data || response.data || [];
        return Array.isArray(raw) ? clientBlogApi.formatBlogsData(raw) : [];
      }
    });
  },

  async prefetchBlogDetail(blogId: string): Promise<void> {
    await dataCache.prefetch(`blog:v2:${blogId}`, async () => {
      try {
        const blog = await clientBlogApi.fetchBlogById(blogId);
        return blog;
      } catch {
        const response = await axios.get(API_CONFIG.USER_FUNCTIONS.blogs.getById(blogId));
        const raw = response.data?.data || response.data;
        return raw;
      }
    });
  },
};

// Prefetch on mount - defer to avoid blocking initial render (optimized from 300ms to 600ms)
if (typeof window !== 'undefined') {
  setTimeout(() => cachedBlogsApi.prefetchBlogs().catch(() => {}), 600);
}
