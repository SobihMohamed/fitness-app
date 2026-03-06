import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const ALLOWED_ENDPOINTS: Record<string, string> = {
  courses: `${API_BASE}/CoursesRequests/getMyRequests`,
  training: `${API_BASE}/TrainingRequests/getMyRequests`,
};

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  if (!type || !ALLOWED_ENDPOINTS[type]) {
    return NextResponse.json(
      { status: "error", message: "Invalid type" },
      { status: 400 },
    );
  }

  const token = req.headers.get("authorization");
  if (!token) {
    return NextResponse.json(
      { status: "error", message: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const upstream = await fetch(ALLOWED_ENDPOINTS[type], {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: token,
      },
      cache: "no-store",
    });

    // Normalize 404 ("no requests found") to 200 with empty array
    if (upstream.status === 404) {
      return NextResponse.json({ status: "success", data: [] });
    }

    const data = await upstream.json();
    return NextResponse.json(data, { status: upstream.status });
  } catch {
    return NextResponse.json(
      { status: "error", message: "Upstream error" },
      { status: 502 },
    );
  }
}
