import { API_CONFIG } from "@/config/api";

// Normalize backend path (strip leading 'public/' or extra slashes)
export const normalizeImagePath = (p?: string) => {
  if (!p) return "";
  return p.replace(/^\/?public\//i, "/").replace(/\/+/g, "/");
};

// Heuristic: detect placeholder-like values coming from API responses
const isLikelyPlaceholder = (p?: string | null) => {
  if (!p) return true;
  const s = String(p).toLowerCase().trim();
  if (!s) return true;
  // Common placeholder names we saw from backend
  if (s.includes("placeholder")) return true;
  // Empty or dash-only
  if (/^[-_\.]+$/.test(s)) return true;
  return false;
};

// Construct absolute image URL for data/storage/cart usage
export const getFullImageUrl = (imagePath: string | null | undefined) => {
  if (!imagePath) return "/placeholder.svg";
  if (imagePath.startsWith("http")) return imagePath;
  if (isLikelyPlaceholder(imagePath)) return "/placeholder.svg";
  const normalized = normalizeImagePath(imagePath);
  const { TARGET_URL: API_TARGET } = API_CONFIG;
  return `${API_TARGET}${normalized?.startsWith("/") ? "" : "/"}${normalized}`;
};

// Construct image URL for display.
// Previously proxied through /proxy-image route; now returns the direct API URL
// since the backend is on the same machine and Next.js remotePatterns allows it.
export const getProxyImageUrl = (imagePath: string | null | undefined) => {
  return getFullImageUrl(imagePath || "");
};

// Append a cache-buster query param to an image URL (handles both ? and & correctly)
export const withCacheBuster = (
  url: string,
  cacheBuster: number | null | undefined,
) => {
  if (typeof cacheBuster !== "number") return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}v=${cacheBuster}`;
};
