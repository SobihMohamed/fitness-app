import { API_CONFIG } from "@/config/api"

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
export const getProxyImageUrl = (imagePath: string | null | undefined) => {
  const full = getFullImageUrl(imagePath || "")
  if (!full || full === "/placeholder.svg") return "/placeholder.svg"
  return `/proxy-image?url=${encodeURIComponent(full)}`
}
