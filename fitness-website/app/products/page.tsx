import React from "react";
import ProductsHeroSection from "@/components/client/products/ProductsHeroSection";
import ProductsClientPage from "@/components/client/products/ProductsClientPage";
import { API_CONFIG } from "@/config/api";
import { normalizeProduct, normalizeCategory } from "@/lib/api/normalizers";

export const dynamic = "force-dynamic";

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export default async function ProductsPage() {
  const [productsRes, categoriesRes] = await Promise.all([
    fetch(API_CONFIG.USER_FUNCTIONS.products.getAll, {
      cache: "no-store",
    }),
    fetch(API_CONFIG.USER_FUNCTIONS.categories.getAll, {
      cache: "no-store",
    }),
  ]);

  const [productsJson, categoriesJson] = await Promise.all([
    safeJson(productsRes),
    safeJson(categoriesRes),
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <ProductsHeroSection />

      {/* Client-side logic for filtering and grid rendering */}
      <ProductsClientPage
        initialProducts={initialProducts}
        initialCategories={initialCategories}
      />
    </div>
  );
}
