"use client";

import { getHttpClient } from "@/lib/http";
import { API_CONFIG } from "@/config/api";
import type {
  Blog,
  Category,
  BlogApiResponse,
  CategoryApiResponse,
  BlogFormData,
  ApiResponse
} from "@/types";

const http = getHttpClient();

// Blog API functions
export const blogApi = {
  // Fetch all blogs
  async fetchBlogs(): Promise<Blog[]> {
    const response = await http.get<BlogApiResponse>(
      API_CONFIG.ADMIN_FUNCTIONS.blogs.getAll,
      { headers: this.getAuthHeaders() }
    );

    const data = response.data;
    const blogsData = Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.blogs)
        ? data.blogs
        : Array.isArray(data) ? data : [];

    return this.formatBlogsData(blogsData);
  },

  // Search blogs
  async searchBlogs(keyword: string): Promise<Blog[]> {
    const response = await http.post<BlogApiResponse>(
      API_CONFIG.ADMIN_FUNCTIONS.blogs.search,
      { keyword },
      { headers: this.getAuthHeaders() }
    );

    const data = response.data;
    const blogsData = Array.isArray((data as any)?.data)
      ? (data as any).data
      : Array.isArray((data as any)?.blogs)
        ? (data as any).blogs
        : Array.isArray(data) ? (data as any) : [];

    return this.formatBlogsData(blogsData);
  },

  // Add new blog
  async addBlog(formData: BlogFormData): Promise<void> {
    const endpoint = API_CONFIG.ADMIN_FUNCTIONS.blogs.add;

    // Try single multipart submit (preferred)
    try {
      const body = new FormData();
      body.append('title', formData.title);
      body.append('content', formData.content);
      body.append('status', formData.status);
      if ((formData.video_link || '').trim()) {
        body.append('video_link', (formData.video_link || '').trim());
      }
      if (formData.category_id) {
        body.append('category_id', formData.category_id);
      }
      if (formData.main_image instanceof File) {
        body.append('main_image', formData.main_image);
      }

      await http.post(endpoint, body, {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (err: any) {
      // Fallback to legacy two-step flow if backend rejects multipart
      const status = err?.response?.status;
      if (status !== 400 && status !== 415 && status !== 422 && status !== 500) {
        throw err;
      }

      // Step A: send main fields as x-www-form-urlencoded
      const requestBody = new URLSearchParams();
      requestBody.append('title', formData.title);
      requestBody.append('content', formData.content);
      requestBody.append('status', formData.status);
      if ((formData.video_link || '').trim()) {
        requestBody.append('video_link', (formData.video_link || '').trim());
      }
      if (formData.category_id) {
        requestBody.append('category_id', formData.category_id);
      }

      await http.post(endpoint, requestBody.toString(), {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      // Step B: if image selected, send it separately
      if (formData.main_image instanceof File) {
        const imageFormData = new FormData();
        imageFormData.append('main_image', formData.main_image);
        await http.post(
          `${endpoint}?update_image=1`,
          imageFormData,
          {
            headers: {
              ...this.getAuthHeaders(),
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      }
    }
  },

  // Update existing blog
  async updateBlog(blogId: string, formData: BlogFormData): Promise<void> {
    const endpoint = API_CONFIG.ADMIN_FUNCTIONS.blogs.update(blogId);

    // Try single multipart submit (preferred)
    try {
      const body = new FormData();
      body.append('title', formData.title);
      body.append('content', formData.content);
      body.append('status', formData.status);
      if ((formData.video_link || '').trim()) {
        body.append('video_link', (formData.video_link || '').trim());
      }
      if (formData.category_id) {
        body.append('category_id', formData.category_id);
      }
      if (formData.main_image instanceof File) {
        body.append('main_image', formData.main_image);
      }

      await http.post(endpoint, body, {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (err: any) {
      // Fallback to legacy two-step flow if backend rejects multipart
      const status = err?.response?.status;
      if (status !== 400 && status !== 415 && status !== 422 && status !== 500) {
        throw err;
      }

      // Step A: send main fields as x-www-form-urlencoded
      const requestBody = new URLSearchParams();
      requestBody.append('title', formData.title);
      requestBody.append('content', formData.content);
      requestBody.append('status', formData.status);
      if ((formData.video_link || '').trim()) {
        requestBody.append('video_link', (formData.video_link || '').trim());
      }
      if (formData.category_id) {
        requestBody.append('category_id', formData.category_id);
      }

      await http.post(endpoint, requestBody.toString(), {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      // Step B: if image selected, send it separately
      if (formData.main_image instanceof File) {
        const imageFormData = new FormData();
        imageFormData.append('main_image', formData.main_image);
        await http.post(
          `${endpoint}?update_image=1`,
          imageFormData,
          {
            headers: {
              ...this.getAuthHeaders(),
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      }
    }
  },

  // Delete blog
  async deleteBlog(blogId: string): Promise<void> {
    await http.delete(
      API_CONFIG.ADMIN_FUNCTIONS.blogs.delete(blogId),
      { headers: this.getAuthHeaders() }
    );
  },

  // Format raw blog data from API
  formatBlogsData(blogsData: any[]): Blog[] {
    return blogsData
      .filter((blog): blog is Record<string, any> => !!blog)
      .map((blog): Blog => {
        const status = blog.status;
        let blogStatus: 'archived' | 'published' = 'archived';

        if (status === 1 || status === '1' || String(status).toLowerCase() === 'published') {
          blogStatus = 'published';
        }

        return {
          blog_id: String(blog.blog_id || blog.id || ''),
          title: String(blog.title || 'Untitled Blog'),
          video_link: blog.video_link ? String(blog.video_link) : null,
          main_image: (blog.main_image || blog.image_url || blog.image)
            ? String(blog.main_image || blog.image_url || blog.image)
            : null,
          content: String(blog.content || ''),
          created_at: blog.created_at ? new Date(blog.created_at).toISOString() : new Date().toISOString(),
          status: blogStatus,
          admin_id: String(blog.admin_id || ''),
          category_id: blog.category_id || blog.category_Id ? String(blog.category_id || blog.category_Id) : null,
        };
      });
  },

  // Get auth headers (using admin API hook)
  getAuthHeaders(): Record<string, string> {
    // This will be called from component context, so we need to pass headers
    // Will be handled in the component layer
    return {};
  }
};

// Category API functions
export const categoryApi = {
  // Fetch all categories
  async fetchCategories(): Promise<Category[]> {
    const response = await http.get<CategoryApiResponse>(
      API_CONFIG.ADMIN_FUNCTIONS.blogs.categories.getAll,
      {
        headers: this.getAuthHeaders(),
        timeout: 10000
      }
    );

    const data = response.data;
    if (!data) {
      throw new Error('No data received from server');
    }

    const categoriesDataRaw = Array.isArray((data as any)?.data)
      ? (data as any).data
      : Array.isArray((data as any)?.categories)
        ? (data as any).categories
        : [];

    return this.formatCategoriesData(categoriesDataRaw);
  },

  // Add new category
  async addCategory(title: string, description: string = ""): Promise<void> {
    await http.post(
      API_CONFIG.ADMIN_FUNCTIONS.blogs.categories.add,
      { title, description },
      { headers: this.getAuthHeaders() }
    );
  },

  // Update existing category
  async updateCategory(categoryId: string, title: string, description: string = ""): Promise<void> {
    await http.post<CategoryApiResponse>(
      API_CONFIG.ADMIN_FUNCTIONS.blogs.categories.update(categoryId),
      {
        title: title.trim(),
        description: description?.trim() || ''
      },
      {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );
  },

  // Delete category
  async deleteCategory(categoryId: string): Promise<void> {
    const response = await http.delete<ApiResponse<{ deleted: boolean }>>(
      API_CONFIG.ADMIN_FUNCTIONS.blogs.categories.delete(categoryId),
      {
        headers: this.getAuthHeaders(),
        timeout: 10000
      }
    );

    if (!response.data?.data?.deleted) {
      throw new Error('Failed to delete category');
    }
  },

  // Format raw category data from API
  formatCategoriesData(categoriesDataRaw: any[]): Category[] {
    return (categoriesDataRaw as any[])
      .filter(Boolean)
      .map((c: any) => {
        const category: Category = {
          category_id: String(c?.category_id ?? c?.category_Id ?? c?.id ?? c?.ID ?? ''),
          title: String(c?.title ?? c?.name ?? '').trim()
        };
        if (c?.description) {
          category.description = String(c.description).trim();
        }
        return category;
      })
      .filter((c) => c.category_id && c.title);
  },

  // Get auth headers (using admin API hook)
  getAuthHeaders(): Record<string, string> {
    return {};
  }
};
