"use client";

import { getHttpClient } from "@/lib/http";
import { API_CONFIG } from "@/config/api";
import type {
  RequestItem,
  RequestsApiResponse,
  RequestSection,
  SearchFilters,
  RequestDetailsData
} from "@/types";

const http = getHttpClient();

// Requests API functions
export const requestsApi = {
  // Get auth headers for admin API calls
  getAuthHeaders() {
    const token = typeof window !== "undefined" ? localStorage.getItem("adminAuth") : null;
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  },

  // Get API URL based on section
  getApiUrl(section: RequestSection): string {
    switch (section) {
      case "training":
        return API_CONFIG.ADMIN_FUNCTIONS.requests.training.getAll;
      case "courses":
        return API_CONFIG.ADMIN_FUNCTIONS.requests.courses.getAll;
      case "orders":
        return API_CONFIG.ADMIN_FUNCTIONS.orders.getAll;
      default:
        throw new Error(`Unknown section: ${section}`);
    }
  },

  // Get details API URL based on section
  getDetailsUrl(section: RequestSection, id: string): string {
    switch (section) {
      case "training":
        return API_CONFIG.ADMIN_FUNCTIONS.requests.training.getDetails(id);
      case "courses":
        return API_CONFIG.ADMIN_FUNCTIONS.requests.courses.getDetails(id);
      case "orders":
        return API_CONFIG.ADMIN_FUNCTIONS.orders.getById(id);
      default:
        throw new Error(`Unknown section: ${section}`);
    }
  },

  // Get action URL based on section and action type
  getActionUrl(section: RequestSection, action: "approve" | "cancel" | "delete", id: string): string {
    switch (section) {
      case "training":
        switch (action) {
          case "approve":
            return API_CONFIG.ADMIN_FUNCTIONS.requests.training.approve(id);
          case "cancel":
            return API_CONFIG.ADMIN_FUNCTIONS.requests.training.cancel(id);
          case "delete":
            return API_CONFIG.ADMIN_FUNCTIONS.requests.training.delete(id);
        }
        break;
      case "courses":
        switch (action) {
          case "approve":
            return API_CONFIG.ADMIN_FUNCTIONS.requests.courses.approve(id);
          case "cancel":
            return API_CONFIG.ADMIN_FUNCTIONS.requests.courses.cancel(id);
          case "delete":
            return API_CONFIG.ADMIN_FUNCTIONS.requests.courses.delete(id);
        }
        break;
      case "orders":
        switch (action) {
          case "approve":
            return API_CONFIG.ADMIN_FUNCTIONS.orders.approve(id);
          case "cancel":
            return API_CONFIG.ADMIN_FUNCTIONS.orders.cancel(id);
          case "delete":
            return API_CONFIG.ADMIN_FUNCTIONS.orders.delete(id);
        }
        break;
    }
    throw new Error(`Unknown section/action: ${section}/${action}`);
  },

  // Fetch requests with filters
  async fetchRequests(section: RequestSection, params?: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
    sort_by?: string;
    sort_order?: string;
  }): Promise<RequestsApiResponse> {
    const url = this.getApiUrl(section);
    const response = await http.get<RequestsApiResponse>(url, {
      headers: this.getAuthHeaders(),
      params: params || {}
    });

    return response.data;
  },

  // Fetch request details
  async fetchRequestDetails(section: RequestSection, id: string): Promise<RequestDetailsData> {
    const url = this.getDetailsUrl(section, id);
    const response = await http.get(url, {
      headers: this.getAuthHeaders()
    });

    const rawData = response.data ?? {};

    // Helper to pick the first non-null/undefined candidate
    const pick = (...candidates: any[]) => candidates.find((v) => v !== undefined && v !== null);

    // Unwrap common envelopes
    const dataLayer = pick(rawData?.data, rawData?.result, rawData?.payload, rawData);

    // Pull top-level entities if present
    const requestEntity = pick(dataLayer?.request, dataLayer?.Request, dataLayer?.requests, dataLayer?.Requests);
    const courseEntity = pick(dataLayer?.course, dataLayer?.Course);
    const orderEntity = pick(dataLayer?.order, dataLayer?.Order, dataLayer?.orders, dataLayer?.Orders);
    const userEntity = pick(dataLayer?.user, dataLayer?.User, dataLayer?.customer, dataLayer?.Customer, dataLayer?.student, dataLayer?.Student);
    const itemsEntity = pick(
      dataLayer?.order_items,
      dataLayer?.items,
      dataLayer?.OrderItems,
      dataLayer?.details?.items,
      dataLayer?.order?.items
    );

    let normalized: any = dataLayer;

    // Section-specific normalization
    if (section === "courses") {
      // Prefer to merge course + request where possible
      const merged = { ...(courseEntity || {}), ...(requestEntity || {}) };
      normalized = Object.keys(merged).length ? { ...merged, course: courseEntity || merged?.course } : pick(requestEntity, courseEntity, dataLayer);
    } else if (section === "training") {
      normalized = pick(requestEntity, dataLayer);
    } else if (section === "orders") {
      // Flatten order to top level but keep a reference
      const base = pick(orderEntity, dataLayer);
      normalized = base ? { ...base, ...(dataLayer || {}), order: orderEntity || base?.order } : dataLayer;
      if (!normalized.order_items && itemsEntity) normalized.order_items = itemsEntity;
    }

    // Attach user if present and missing
    if (userEntity && !normalized?.user) {
      normalized.user = userEntity;
    }

    // Field name harmonization for training requests
    if (section === "training") {
      normalized.name = pick(
        normalized.name,
        normalized.full_name,
        normalized.user_name,
        normalized.trainee_name,
        normalized.customer_name
      );
      normalized.email = pick(
        normalized.email,
        normalized.user_email,
        normalized.customer_email
      );
      normalized.start_date = pick(
        normalized.start_date,
        normalized.startDate,
        normalized.request_start_date
      );
      normalized.end_date = pick(
        normalized.end_date,
        normalized.endDate,
        normalized.request_end_date
      );
      normalized.training_per_week = pick(
        normalized.training_per_week,
        normalized.trainingPerWeek,
        normalized.sessions_per_week
      );
      normalized.training_place = pick(
        normalized.training_place,
        normalized.trainingPlace,
        normalized.place
      );
    }

    // Field name harmonization for courses
    if (section === "courses") {
      normalized.course_title = pick(
        normalized.course_title,
        normalized.course_name,
        normalized.title,
        normalized.title_en,
        normalized.courseTitle,
        normalized.course_name_en
      );
      normalized.course_price = pick(
        normalized.course_price,
        normalized.price,
        normalized.course?.price,
        normalized.request?.course_price
      );
      normalized.user_name = pick(
        normalized.user_name,
        normalized.student_name,
        normalized.name,
        normalized.user?.name
      );
      normalized.user_email = pick(
        normalized.user_email,
        normalized.email,
        normalized.user?.email
      );
    }

    // Field name harmonization for orders
    if (section === "orders") {
      normalized.total_price = pick(
        normalized.total_price,
        normalized.total,
        normalized.amount,
        normalized.order_total,
        normalized.price,
        normalized.order?.total
      );
      normalized.customer_email = pick(
        normalized.customer_email,
        normalized.order?.customer_email,
        normalized.user?.email,
        normalized.order?.email,
        normalized.email
      );
      normalized.customer_name = pick(
        normalized.customer_name,
        normalized.order?.customer_name,
        normalized.customer_full_name,
        normalized.customer?.full_name,
        normalized.customer?.name,
        normalized.user_name,
        normalized.billing_name,
        normalized.shipping_name,
        normalized.student_name,
        normalized.trainee_name
      );
    }

    // Normalize status and dates across all sections
    const status = this.normalizeStatus(normalized);
    const created = this.extractDate(normalized) || pick(
      normalized.request_date,
      normalized.date
    );

    normalized.status = status;
    if (created && !normalized.created_at) normalized.created_at = created;

    return normalized;
  },

  // Perform action on request (approve, cancel, delete)
  async performAction(
    section: RequestSection,
    action: "approve" | "cancel" | "delete",
    id: string
  ): Promise<void> {
    const url = this.getActionUrl(section, action, id);
    const method = section === "orders" && action === "delete" ? "DELETE" : "PUT";

    // Special handling for course cancellation with fallback URLs
    if (action === "cancel" && section === "courses") {
      await this.handleCourseCancellation(id);
      return;
    }

    if (method === "DELETE") {
      await http.delete(url, { headers: this.getAuthHeaders() });
    } else {
      await http.put(url, {}, { headers: this.getAuthHeaders() });
    }
  },

  // Special handling for course cancellation with multiple URL attempts
  async handleCourseCancellation(id: string): Promise<void> {
    const base = (API_CONFIG?.TARGET_URL || API_CONFIG?.BASE_URL || "").replace(/\/$/, "");
    const idEnc = encodeURIComponent(id);
    const candidates = [
      API_CONFIG.ADMIN_FUNCTIONS.requests.courses.cancel(id),
      `${base}/AdminCoursesRequests/cancelRequest/${idEnc}`,
      `${base}/AdminCoursesRequests/canecl/${idEnc}`,
      `${base}/AdminCoursesRequests/cancel/${idEnc}`,
    ].filter(Boolean) as string[];

    let success: Response | null = null;
    let lastStatus = 0;
    let lastBody = "";

    for (const candidate of candidates) {
      // Attempt 1: PUT
      let attempt = await fetch(candidate, {
        method: "PUT",
        headers: this.getAuthHeaders(),
      });
      
      if (attempt.ok) {
        success = attempt;
        break;
      }
      
      lastStatus = attempt.status;
      try { 
        lastBody = await attempt.text(); 
      } catch {}

      // Attempt 2: If method not allowed, try POST
      if (attempt.status === 405) {
        attempt = await fetch(candidate, {
          method: "POST",
          headers: this.getAuthHeaders(),
          body: JSON.stringify({}),
        });
        
        if (attempt.ok) {
          success = attempt;
          break;
        }
        
        lastStatus = attempt.status;
        try { 
          lastBody = await attempt.text(); 
        } catch {}
      }

      // On 404, try next candidate URL
      if (attempt.status === 404) {
        console.warn("Courses cancel 404 at:", candidate, "— trying next fallback");
        continue;
      }
    }

    if (!success) {
      throw new Error(
        `Failed to cancel course request. Tried ${candidates.length} endpoints. Last status: ${lastStatus}. Body: ${lastBody}`
      );
    }
  },

  // Fetch user by ID for order details
  async fetchUser(userId: string): Promise<any> {
    try {
      const response = await http.get(
        API_CONFIG.ADMIN_FUNCTIONS.users.getById(userId),
        { headers: this.getAuthHeaders() }
      );
      return response.data?.user || response.data?.data || null;
    } catch (error) {
      console.warn("Could not fetch user by ID", userId, error);
      return null;
    }
  },

  // Search user by email for order details
  async searchUserByEmail(email: string): Promise<any> {
    try {
      const response = await http.get(API_CONFIG.ADMIN_FUNCTIONS.users.search, {
        headers: this.getAuthHeaders(),
        params: { query: email },
      });

      const body = response?.data;
      const list = Array.isArray(body?.data)
        ? body.data
        : Array.isArray(body?.users)
        ? body.users
        : Array.isArray(body)
        ? body
        : [];

      const match = list.find((u: any) =>
        (u?.email || '').toLowerCase() === email.toLowerCase()
      ) || list[0];

      return match || null;
    } catch (error) {
      console.warn("Could not search user by email", email, error);
      return null;
    }
  },

  // Fetch product details for orders
  async fetchProduct(productId: string): Promise<any> {
    try {
      // Try user endpoint first (no auth required)
      const response = await http.get(API_CONFIG.USER_FUNCTIONS.products.getById(productId));
      const rawData = response.data ?? {};
      const product = rawData?.product || rawData?.Product || rawData?.data?.product || rawData?.data?.Product || rawData?.data || rawData;
      return product || null;
    } catch (error) {
      console.warn("Could not fetch product via USER_FUNCTIONS, trying ADMIN_FUNCTIONS", productId, error);
      
      try {
        // Fallback to admin endpoint
        const response = await http.get(
          API_CONFIG.ADMIN_FUNCTIONS.products.getById(productId),
          { headers: this.getAuthHeaders() }
        );
        const rawData = response.data ?? {};
        const product = rawData?.product || rawData?.Product || rawData?.data?.product || rawData?.data?.Product || rawData?.data || rawData;
        return product || null;
      } catch (error2) {
        console.warn("Could not fetch product via ADMIN_FUNCTIONS", productId, error2);
        return null;
      }
    }
  },

  // Normalize request data structure
  normalizeRequestData(data: any): RequestItem[] {
    let normalizedItems: any[] = [];
    
    if (Array.isArray(data?.data)) {
      normalizedItems = data.data;
    } else if (Array.isArray(data)) {
      normalizedItems = data;
    } else if (data?.requests) {
      normalizedItems = data.requests;
    } else if (data?.orders) {
      normalizedItems = data.orders;
    } else if (data) {
      normalizedItems = [data];
    }

    // Ensure consistent status field and a stable id across all items
    return normalizedItems.map((item) => {
      const stableId =
        item?.id ??
        item?.request_id ?? item?.requestId ??
        item?.order_id ?? item?.orderId ??
        item?.order?.id ?? item?.request?.id ??
        item?._id ?? item?.uuid ?? item?.reference;
      return {
        ...(item as any),
        id: stableId ?? (item as any).id,
        status: this.normalizeStatus(item),
      } as RequestItem;
    });
  },

  // Normalize status values
  normalizeStatus(item: any): string {
    const s = (item?.status || item?.request_status || item?.order_status || item?.payment_status || "pending").toString().toLowerCase();
    // Treat common success-like statuses as approved
    if (
      s === "approve" ||
      s.includes("approved") ||
      s.includes("success") ||
      s.includes("successful") ||
      s.includes("completed") ||
      s.includes("paid") ||
      s === "1"
    ) {
      return "approved";
    }
    // Treat common cancel/reject statuses as cancelled
    if (
      s === "cancel" ||
      s.includes("cancel") ||
      s.includes("rejected") ||
      s.includes("declined") ||
      s.includes("failed") ||
      s === "0"
    ) {
      return "cancelled";
    }
    return "pending";
  },

  // Extract date from various possible fields
  extractDate(item: any): string | null {
    const dt =
      item?.created_at ||
      item?.createdAt ||
      item?.purchase_date ||
      item?.order_date ||
      item?.request_date ||
      item?.date ||
      item?.created ||
      item?.created_on ||
      item?.createdOn ||
      item?.orderDate ||
      item?.placed_at ||
      item?.placedAt ||
      item?.order?.created_at ||
      item?.order?.createdAt ||
      item?.order?.purchase_date ||
      item?.order?.order_date ||
      item?.order?.date;
    return dt ?? null;
  }
};
