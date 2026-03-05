import { Suspense } from "react";
import HomeView from "./home/HomeView";
import HomeDataSections from "@/components/client/home/HomeDataSections";
import { Skeleton } from "@/components/ui/skeleton";
import { API_CONFIG } from "@/config/api";
import {
  normalizeHomeProduct,
  normalizeHomeCourse,
} from "@/lib/api/normalizers";

export const revalidate = 60;

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

// Async sub-component: fetches data independently so it doesn't block the
// initial HTML delivery (hero image preload ships in the first bytes).
async function FeaturedSections() {
  let featuredProducts: ReturnType<typeof normalizeHomeProduct>[] = [];
  let featuredCourses: ReturnType<typeof normalizeHomeCourse>[] = [];

  try {
    const [productsRes, coursesRes] = await Promise.all([
      fetch(API_CONFIG.USER_FUNCTIONS.products.getAll, {
        next: { revalidate: 60 },
      }).catch(() => null),
      fetch(API_CONFIG.USER_FUNCTIONS.courses.getAll, {
        next: { revalidate: 60 },
      }).catch(() => null),
    ]);

    if (productsRes?.ok) {
      const json = await safeJson(productsRes);
      featuredProducts = (
        Array.isArray(json) ? json : json?.data || json?.products || []
      )
        .slice(0, 6)
        .map(normalizeHomeProduct);
    }

    if (coursesRes?.ok) {
      const json = await safeJson(coursesRes);
      featuredCourses = (
        Array.isArray(json) ? json : json?.data || json?.courses || []
      )
        .slice(0, 6)
        .map(normalizeHomeCourse);
    }
  } catch {
    // Gracefully handle build-time errors when API is unavailable
  }

  return (
    <HomeDataSections
      initialFeaturedProducts={featuredProducts}
      initialFeaturedCourses={featuredCourses}
    />
  );
}

function FeaturedSectionsFallback() {
  return (
    <>
      <div className="py-20 bg-gray-50">
        <Skeleton className="h-96 max-w-7xl mx-auto" />
      </div>
      <div className="py-20 bg-white">
        <Skeleton className="h-96 max-w-7xl mx-auto" />
      </div>
    </>
  );
}

// Non-async: renders the static shell (including hero image preload) immediately.
export default function Home() {
  return (
    <HomeView
      dataSlot={
        <Suspense fallback={<FeaturedSectionsFallback />}>
          <FeaturedSections />
        </Suspense>
      }
    />
  );
}
