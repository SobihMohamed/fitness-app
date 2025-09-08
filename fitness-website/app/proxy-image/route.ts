import { NextRequest } from "next/server";
import { API_CONFIG } from "@/config/api";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get("url");
  if (!targetUrl) {
    return new Response("Missing url", { status: 400 });
  }

  try {
    // Validate the URL and restrict proxying to your backend origins only
    const parsed = new URL(targetUrl);
    const allowedOrigins = [API_CONFIG.BASE_URL, API_CONFIG.TARGET_URL];
    const isAllowed = allowedOrigins.some((base) => targetUrl.startsWith(base));
    if (!isAllowed) {
      return new Response("Forbidden", { status: 403 });
    }

    const upstream = await fetch(parsed.toString());
    if (!upstream.ok || !upstream.body) {
      return new Response("Upstream fetch failed", { status: upstream.status || 502 });
    }

    // Pass through content type and length if available
    const headers = new Headers();
    const contentType = upstream.headers.get("content-type") || "application/octet-stream";
    const contentLength = upstream.headers.get("content-length");
    headers.set("content-type", contentType);
    if (contentLength) headers.set("content-length", contentLength);

    // Allow same-origin usage freely
    headers.set("Cache-Control", "private, max-age=60");

    return new Response(upstream.body, {
      status: 200,
      headers,
    });
  } catch (err) {
    return new Response("Invalid url", { status: 400 });
  }
}
