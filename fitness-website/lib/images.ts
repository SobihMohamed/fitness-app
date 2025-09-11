import { API_CONFIG } from "@/config/api"

// Image quality and size constants for optimization
const DEFAULT_QUALITY = 80
const DEFAULT_WIDTH = 800
const DEFAULT_HEIGHT = 600
const THUMBNAIL_WIDTH = 300
const THUMBNAIL_HEIGHT = 200

// Normalize backend path (strip leading 'public/' or extra slashes)
export const normalizeImagePath = (p?: string) => {
  if (!p) return ""
  return p.replace(/^\/?public\//i, "/").replace(/\/+/g, "/")
}

// Construct absolute image URL for data/storage/cart usage
export const getFullImageUrl = (imagePath: string | null | undefined) => {
  if (!imagePath) return "/placeholder.svg"
  if (imagePath.startsWith("http")) return imagePath
  const normalized = normalizeImagePath(imagePath)
  const { TARGET_URL: API_TARGET } = API_CONFIG
  return `${API_TARGET}${normalized.startsWith("/") ? "" : "/"}${normalized}`
}

// Construct proxied URL for display to avoid external domain issues
// Now with optional width, height and quality parameters for optimization
export const getProxyImageUrl = (
  imagePath: string | null | undefined,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    thumbnail?: boolean;
  }
) => {
  const full = getFullImageUrl(imagePath || "")
  if (!full || full === "/placeholder.svg") return "/placeholder.svg"
  
  // Set default options if not provided
  const width = options?.thumbnail ? THUMBNAIL_WIDTH : (options?.width || DEFAULT_WIDTH)
  const height = options?.thumbnail ? THUMBNAIL_HEIGHT : (options?.height || DEFAULT_HEIGHT)
  const quality = options?.quality || DEFAULT_QUALITY
  
  // Add width, height and quality parameters for better optimization
  return `/proxy-image?url=${encodeURIComponent(full)}&width=${width}&height=${height}&quality=${quality}`
}

// Helper function to determine if an image should be lazy loaded
export const shouldLazyLoad = (priority: boolean, isAboveFold: boolean): boolean => {
  // Images that are priority or above the fold should not be lazy loaded
  return !priority && !isAboveFold
}
