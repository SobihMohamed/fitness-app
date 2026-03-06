import React from "react";
import FavoritesClientPage from "@/components/client/products/FavoritesClientPage";
import { API_CONFIG } from "@/config/api";
import { normalizeProduct, normalizeCategory } from "@/lib/api/normalizers";

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

export default async function FavoritesPage() {
  const [productsJson, categoriesJson] = await Promise.all([
    fetchWithTimeout(API_CONFIG.USER_FUNCTIONS.products.getAll),
    fetchWithTimeout(API_CONFIG.USER_FUNCTIONS.categories.getAll),
  ]);

  const initialProducts = (
    Array.isArray(productsJson)
      ? productsJson
      : productsJson?.data || productsJson?.products || []
  )
    .slice(0, 24)
    .map(normalizeProduct);

  const initialCategories = (
    Array.isArray(categoriesJson)
      ? categoriesJson
      : categoriesJson?.data || categoriesJson?.categories || []
  ).map(normalizeCategory);

  return (
    <div className="min-h-screen bg-slate-50">
      <FavoritesClientPage
        initialProducts={initialProducts}
        initialCategories={initialCategories}
      />
    </div>
  );
}
