import React from "react";
import ProductsHeroSection from "@/components/client/products/ProductsHeroSection";
import ProductsClientPage from "@/components/client/products/ProductsClientPage";
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

export default async function ProductsPage() {
  const [productsJson, categoriesJson] = await Promise.all([
    fetchWithTimeout(API_CONFIG.USER_FUNCTIONS.products.getAll),
    fetchWithTimeout(API_CONFIG.USER_FUNCTIONS.categories.getAll),
  ]);

  const initialProducts = (
    Array.isArray(productsJson)
      ? productsJson
      : productsJson?.data || productsJson?.products || []
  )
    .slice(0, 12)
    .map(normalizeProduct);

  const initialCategories = (
    Array.isArray(categoriesJson)
      ? categoriesJson
      : categoriesJson?.data || categoriesJson?.categories || []
  ).map(normalizeCategory);

  return (
    <div className="min-h-screen bg-slate-50">
      <ProductsHeroSection />

      {/* Client-side logic for filtering and grid rendering */}
      <ProductsClientPage
        initialProducts={initialProducts}
        initialCategories={initialCategories}
      />
    </div>
  );
}
