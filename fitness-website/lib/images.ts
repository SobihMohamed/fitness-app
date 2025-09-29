import { API_CONFIG } from "@/config/api"

// Normalize backend path (strip leading 'public/' or extra slashes)
export const normalizeImagePath = (p?: string) => {
  if (!p) return ""
  return p.replace(/^\/?public\//i, "/").replace(/\/+/g, "/")
}

// Heuristic: detect placeholder-like values coming from API responses
const isLikelyPlaceholder = (p?: string | null) => {
  if (!p) return true
  const s = String(p).toLowerCase().trim()
  if (!s) return true
  // Common placeholder names we saw from backend
  if (s.includes("placeholder")) return true
  // Empty or dash-only
  if (/^[-_\.]+$/.test(s)) return true
  return false
}

// Construct absolute image URL for data/storage/cart usage
export const getFullImageUrl = (imagePath: string | null | undefined) => {
  if (!imagePath) return "/placeholder.svg"
  if (imagePath.startsWith("http")) return imagePath
  if (isLikelyPlaceholder(imagePath)) return "/placeholder.svg"
  const normalized = normalizeImagePath(imagePath)
  const { TARGET_URL: API_TARGET } = API_CONFIG
  return `${API_TARGET}${normalized?.startsWith("/") ? "" : "/"}${normalized}`
}

// Construct proxied URL for display to avoid external domain issues
export const getProxyImageUrl = (imagePath: string | null | undefined) => {
  const full = getFullImageUrl(imagePath || "")
  if (!full || full === "/placeholder.svg") return "/placeholder.svg"
  // Allow bypassing proxy entirely in development or troubleshooting
  if (process.env.NEXT_PUBLIC_BYPASS_IMAGE_PROXY === 'true') {
    return full
  }

  // Mirror proxy allow-list logic: only proxy when host matches API targets
  try {
    const url = new URL(full)
    const allowedHosts = [API_CONFIG.BASE_URL, API_CONFIG.TARGET_URL]
      .filter(Boolean)
      .map((u) => { try { return new URL(u as string).hostname } catch { return null } })
      .filter((h): h is string => !!h)
    const isAllowed = allowedHosts.includes(url.hostname)
    return isAllowed ? `/proxy-image?url=${encodeURIComponent(full)}` : full
  } catch {
    return full
  }
}
