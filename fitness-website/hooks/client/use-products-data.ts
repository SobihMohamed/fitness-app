"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useProducts, useCategories } from "@/hooks/queries";
import type { ClientProduct, ClientCategory } from "@/types";

// Local filter state used only inside this hook
interface ProductFilterState {
  searchTerm: string;
  category: string; // category_id as string ("" means all)
  sortBy: string; // "name-asc" | "name-desc" | "price-asc" | "price-desc"
  showFavoritesOnly: boolean;
  page: number;
  pageSize: number;
}

interface UseProductsDataReturnShape {
  products: ClientProduct[];
  categories: ClientCategory[];
  loading: boolean;
  favorites: Set<number>;
  filter: ProductFilterState;
  filteredProducts: ClientProduct[];
  paginatedProducts: ClientProduct[];
  totalPages: number;
  actions: {
    updateFilter: (patch: Partial<ProductFilterState>) => void;
    toggleFavorite: (productId: number) => void;
    refresh: () => Promise<void>;
  };
}

const FAVORITES_KEY = "product_favorites";

export function useProductsData(
  initialProducts?: ClientProduct[],
  initialCategories?: ClientCategory[],
  options?: { initialShowFavoritesOnly?: boolean },
): UseProductsDataReturnShape {
  // React Query replaces manual useState + useEffect for data fetching
  const {
    data: products = [],
    isLoading: loadingProducts,
    refetch: refetchProducts,
  } = useProducts(initialProducts);
  const { data: categories = [], isLoading: loadingCategories } =
    useCategories(initialCategories);

  const loading = loadingProducts || loadingCategories;

  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [filter, setFilter] = useState<ProductFilterState>({
    searchTerm: "",
    category: "",
    sortBy: "",
    showFavoritesOnly: options?.initialShowFavoritesOnly ?? false,
    page: 1,
    pageSize: 6,
  });

  // Load favorites from localStorage once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const cleaned = parsed
            .filter((n: any) => Number.isFinite(n))
            .map((n: any) => Number(n));
          setFavorites(new Set<number>(cleaned));
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist favorites
  useEffect(() => {
    try {
      localStorage.setItem(
        FAVORITES_KEY,
        JSON.stringify(Array.from(favorites)),
      );
    } catch {
      // ignore
    }
  }, [favorites]);

  const updateFilter = useCallback((patch: Partial<ProductFilterState>) => {
    setFilter((prev) => ({
      ...prev,
      ...patch,
      page: patch.page !== undefined ? patch.page : 1,
    }));
  }, []);

  const toggleFavorite = useCallback((productId: number) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  }, []);

  const refresh = useCallback(async () => {
    await refetchProducts();
  }, [refetchProducts]);

  // Derived: filtered products
  const filteredProducts = useMemo(() => {
    let list = products.slice();

    if (filter.showFavoritesOnly) {
      list = list.filter((p) => favorites.has(p.product_id));
    }

    if (filter.searchTerm.trim()) {
      const q = filter.searchTerm.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) || String(p.product_id).includes(q),
      );
    }

    if (filter.category) {
      const cid = Number.parseInt(filter.category, 10);
      if (Number.isFinite(cid)) {
        list = list.filter((p) => p.category_id === cid);
      }
    }

    switch (filter.sortBy) {
      case "name-asc":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        list.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "price-asc":
        list.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price-desc":
        list.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
    }

    return list;
  }, [products, favorites, filter]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredProducts.length / filter.pageSize)),
    [filteredProducts.length, filter.pageSize],
  );

  const paginatedProducts = useMemo(() => {
    const start = (filter.page - 1) * filter.pageSize;
    return filteredProducts.slice(start, start + filter.pageSize);
  }, [filteredProducts, filter.page, filter.pageSize]);

  const actions = useMemo(
    () => ({ updateFilter, toggleFavorite, refresh }),
    [updateFilter, toggleFavorite, refresh],
  );

  return {
    products,
    categories,
    loading,
    favorites,
    filter,
    filteredProducts,
    paginatedProducts,
    totalPages,
    actions,
  };
}
