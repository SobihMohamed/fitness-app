/**
 * Centralised React Query key factory.
 *
 * Structured keys make cache invalidation predictable:
 *   queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
 *   queryClient.invalidateQueries({ queryKey: queryKeys.products.detail("42") })
 *
 * Pattern: [domain, scope, ...params]
 */
export const queryKeys = {
  // ---- Products ----
  products: {
    all: ["products"] as const,
    list: (params?: Record<string, unknown>) =>
      ["products", "list", params] as const,
    detail: (id: string) => ["products", "detail", id] as const,
    search: (keyword: string) => ["products", "search", keyword] as const,
    byCategory: (categoryId: number) =>
      ["products", "category", categoryId] as const,
    related: (categoryId: number, excludeId?: number) =>
      ["products", "related", categoryId, excludeId] as const,
  },

  // ---- Categories ----
  categories: {
    all: ["categories"] as const,
  },

  // ---- Courses ----
  courses: {
    all: ["courses"] as const,
    list: (params?: Record<string, unknown>) =>
      ["courses", "list", params] as const,
    detail: (id: string) => ["courses", "detail", id] as const,
    search: (keyword: string) => ["courses", "search", keyword] as const,
    subscribed: ["courses", "subscribed"] as const,
    modules: {
      all: ["courses", "modules"] as const,
      detail: (id: string) => ["courses", "modules", id] as const,
    },
    chapters: {
      all: ["courses", "chapters"] as const,
      detail: (id: string) => ["courses", "chapters", id] as const,
    },
  },

  // ---- Services ----
  services: {
    all: ["services"] as const,
    detail: (id: string) => ["services", "detail", id] as const,
    search: (keyword: string) => ["services", "search", keyword] as const,
  },

  // ---- Blogs ----
  blogs: {
    all: ["blogs"] as const,
    detail: (id: string) => ["blogs", "detail", id] as const,
    search: (keyword: string) => ["blogs", "search", keyword] as const,
    byCategory: (categoryId: string) =>
      ["blogs", "category", categoryId] as const,
    categories: ["blogs", "categories"] as const,
  },

  // ---- User / Auth ----
  user: {
    profile: ["user", "profile"] as const,
    orders: ["user", "orders"] as const,
    orderDetail: (id: string) => ["user", "orders", id] as const,
    notifications: ["user", "notifications"] as const,
    trainingRequests: ["user", "training-requests"] as const,
    courseRequests: ["user", "course-requests"] as const,
    subscribedCourses: ["user", "subscribed-courses"] as const,
  },

  // ---- Admin ----
  admin: {
    users: {
      all: ["admin", "users"] as const,
      detail: (id: string) => ["admin", "users", id] as const,
    },
    admins: {
      all: ["admin", "admins"] as const,
    },
    products: {
      all: ["admin", "products"] as const,
      detail: (id: string) => ["admin", "products", id] as const,
    },
    courses: {
      all: ["admin", "courses"] as const,
      detail: (id: string) => ["admin", "courses", id] as const,
    },
    blogs: {
      all: ["admin", "blogs"] as const,
      detail: (id: string) => ["admin", "blogs", id] as const,
    },
    services: {
      all: ["admin", "services"] as const,
      detail: (id: string) => ["admin", "services", id] as const,
    },
    orders: {
      all: ["admin", "orders"] as const,
      detail: (id: string) => ["admin", "orders", id] as const,
    },
    promoCodes: {
      all: ["admin", "promo-codes"] as const,
      detail: (id: string) => ["admin", "promo-codes", id] as const,
    },
    requests: {
      training: ["admin", "requests", "training"] as const,
      courses: ["admin", "requests", "courses"] as const,
    },
    notifications: ["admin", "notifications"] as const,
  },
} as const;
