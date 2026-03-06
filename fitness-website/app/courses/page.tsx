import React from "react";
import CoursesClientPage from "@/components/client/courses/CoursesClientPage";
import CoursesHeroSection from "@/components/client/courses/CoursesHeroSection";
import { API_CONFIG } from "@/config/api";

type Course = Record<string, any>;

// Revalidate every 60 seconds (ISR) instead of force-dynamic for better performance
export const revalidate = 60;

async function fetchWithTimeout(url: string, options: RequestInit = {}) {
  try {
    const res = await fetch(url, {
      ...options,
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error(`Fetch failed for ${url}:`, error);
    return null;
  }
}

export default async function CoursesPage() {
  const coursesJson = await fetchWithTimeout(API_CONFIG.USER_FUNCTIONS.courses.getAll);

  const rawCourses: Course[] = Array.isArray(coursesJson)
    ? coursesJson
    : coursesJson?.data || coursesJson?.courses || [];

  // Only pass initialCourses when we actually got data — an empty array
  // from a failed/auth-required SSR fetch would lock React Query into
  // thinking the cache is already populated and skip the client-side fetch.
  const initialCourses =
    rawCourses.length > 0 ? rawCourses.slice(0, 12) : undefined;

  return (
    <div className="min-h-screen bg-slate-50">
      <CoursesHeroSection />
      {/* Client-side logic for filtering and grid rendering */}
      <CoursesClientPage className="bg-transparent" initialCourses={initialCourses} />
    </div>
  );
}
