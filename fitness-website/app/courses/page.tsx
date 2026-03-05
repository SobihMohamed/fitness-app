import React from "react";
import CoursesClientPage from "@/components/client/courses/CoursesClientPage";
import CoursesHeroSection from "@/components/client/courses/CoursesHeroSection";
import { API_CONFIG } from "@/config/api";

export const dynamic = "force-dynamic";

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export default async function CoursesPage() {
  const coursesRes = await fetch(API_CONFIG.USER_FUNCTIONS.courses.getAll, {
    cache: "no-store",
  });
  const coursesJson = coursesRes.ok ? await safeJson(coursesRes) : null;
  const rawCourses = Array.isArray(coursesJson)
    ? coursesJson
    : coursesJson?.data || coursesJson?.courses || [];
  // Only pass initialCourses when we actually got data — an empty array
  // from a failed/auth-required SSR fetch would lock React Query into
  // thinking the cache is already populated and skip the client-side fetch.
  const initialCourses =
    rawCourses.length > 0 ? rawCourses.slice(0, 12) : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <CoursesHeroSection />

      {/* Client-side logic for filtering and grid rendering */}
      <CoursesClientPage initialCourses={initialCourses} />
    </div>
  );
}
