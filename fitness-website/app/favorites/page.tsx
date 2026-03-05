import React from "react";
import FavoritesClientPage from "@/components/client/products/FavoritesClientPage";
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

export default async function FavoritesPage() {
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
    .slice(0, 24)
    .map(normalizeProduct);

  const initialCategories = (
    Array.isArray(categoriesJson)
      ? categoriesJson
      : categoriesJson?.data || categoriesJson?.categories || []
  ).map(normalizeCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-pink-50 to-red-50">
      <FavoritesClientPage
        initialProducts={initialProducts}
        initialCategories={initialCategories}
      />
    </div>
  );
}
