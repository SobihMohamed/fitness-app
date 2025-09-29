import { NextRequest } from "next/server";
import { API_CONFIG } from "@/config/api";

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get("url");
  if (!targetUrl) return new Response("Missing url", { status: 400 });

  try {
    const parsed = new URL(targetUrl);
    const allowed = [API_CONFIG.BASE_URL, API_CONFIG.TARGET_URL]
      .filter(Boolean)
      .map((u) => { try { return new URL(u as string).hostname } catch { return null } })
      .filter((h): h is string => !!h);

    if (!allowed.includes(parsed.hostname)) {
      return new Response("Forbidden", { status: 403 });
    }

    const token = req.headers.get('authorization');

    const upstream = await fetch(parsed.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...(token ? { 'Authorization': token } : {}),
      },
      // Do not include credentials to avoid cross-origin cookies
      // We rely on bearer token when present
      next: { revalidate: 30 },
    });

    const text = await upstream.text();
    const headers = new Headers();
    headers.set('content-type', upstream.headers.get('content-type') || 'application/json');
    headers.set('Cache-Control', 'public, max-age=30, s-maxage=60');

    return new Response(text, { status: upstream.status, headers });
  } catch (e) {
    return new Response("Invalid url", { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get("url");
  if (!targetUrl) return new Response("Missing url", { status: 400 });

  try {
    const parsed = new URL(targetUrl);
    const allowed = [API_CONFIG.BASE_URL, API_CONFIG.TARGET_URL]
      .filter(Boolean)
      .map((u) => { try { return new URL(u as string).hostname } catch { return null } })
      .filter((h): h is string => !!h);

    if (!allowed.includes(parsed.hostname)) {
      return new Response("Forbidden", { status: 403 });
    }

    const token = req.headers.get('authorization');
    const body = await req.text();

    const upstream = await fetch(parsed.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': req.headers.get('content-type') || 'application/json',
        'Accept': 'application/json',
        ...(token ? { 'Authorization': token } : {}),
      },
      body,
      next: { revalidate: 0 },
    });

    const text = await upstream.text();
    const headers = new Headers();
    headers.set('content-type', upstream.headers.get('content-type') || 'application/json');
    return new Response(text, { status: upstream.status, headers });
  } catch (e) {
    return new Response("Invalid url", { status: 400 });
  }
}
