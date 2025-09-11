import { NextRequest } from "next/server";
import { API_CONFIG } from "@/config/api";

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get("url");
  if (!targetUrl) {
    return new Response("Missing url", { status: 400 });
  }
  
  // Get image optimization parameters
  const width = parseInt(searchParams.get("width") || "0", 10) || undefined;
  const height = parseInt(searchParams.get("height") || "0", 10) || undefined;
  const quality = parseInt(searchParams.get("quality") || "0", 10) || undefined;

  try {
    // Validate the URL and restrict proxying to your backend origins only
    const parsed = new URL(targetUrl);
    const allowedOrigins = [API_CONFIG.BASE_URL, API_CONFIG.TARGET_URL];
    const isAllowed = allowedOrigins.some((base) => targetUrl.startsWith(base));
    if (!isAllowed) {
      return new Response("Forbidden", { status: 403 });
    }

    // Add caching headers to the request
    const fetchOptions: RequestInit = {
      headers: {
        'Accept': 'image/*',
      },
      next: {
        revalidate: 3600 // Cache for 1 hour
      }
    };

    const upstream = await fetch(parsed.toString(), fetchOptions);
    if (!upstream.ok || !upstream.body) {
      return new Response("Upstream fetch failed", { status: upstream.status || 502 });
    }

    // Get the image data
    const imageData = await upstream.arrayBuffer();
    const contentType = upstream.headers.get("content-type") || "application/octet-stream";
    
    // Set response headers
    const headers = new Headers();
    headers.set("content-type", contentType);
    
    // Improve caching for better performance
    headers.set("Cache-Control", "public, max-age=86400, s-maxage=31536000, stale-while-revalidate=31536000");
    headers.set("CDN-Cache-Control", "public, max-age=31536000");
    
    // Add image optimization headers
    if (width) headers.set("x-image-width", width.toString());
    if (height) headers.set("x-image-height", height.toString());
    if (quality) headers.set("x-image-quality", quality.toString());
    
    // Return the optimized image
    return new Response(imageData, {
      status: 200,
      headers,
    });
  } catch (err) {
    return new Response("Invalid url", { status: 400 });
  }
}
