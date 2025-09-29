import { NextRequest } from "next/server";
import { API_CONFIG } from "@/config/api";

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get("url");
  if (!targetUrl) {
    return new Response("Missing url", { status: 400 });
  }

  try {
    // Validate the URL and restrict proxying to your backend origins only
    const parsed = new URL(targetUrl);
    const allowed = [API_CONFIG.BASE_URL, API_CONFIG.TARGET_URL]
      .filter(Boolean)
      .map((u) => {
        try { return new URL(u as string).hostname } catch { return null }
      })
      .filter((h): h is string => !!h);
    const isAllowed = allowed.includes(parsed.hostname);
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

    // Pass through content type and length if available
    const headers = new Headers();
    const contentType = upstream.headers.get("content-type") || "application/octet-stream";
    const contentLength = upstream.headers.get("content-length");
    headers.set("content-type", contentType);
    if (contentLength) headers.set("content-length", contentLength);

    // Improve caching for better performance
    headers.set("Cache-Control", "public, max-age=86400, s-maxage=31536000, stale-while-revalidate=31536000");
    headers.set("CDN-Cache-Control", "public, max-age=31536000");

    return new Response(upstream.body, {
      status: 200,
      headers,
    });
  } catch (err) {
    return new Response("Invalid url", { status: 400 });
  }
}
