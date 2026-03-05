"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  useProductDetail,
  useCategories,
  useRelatedProducts,
} from "@/hooks/queries";
import { toast } from "sonner";
import { useCart } from "@/contexts/cart-context";
import { getFullImageUrl } from "@/lib/images";
import type {
  ClientProduct,
  ClientCategory,
  ProductDetailsState,
  ProductDetailsActions,
  UseProductDetailsReturn,
} from "@/types/product";

const FAVORITES_KEY = "product_favorites";

export function useProductDetails(productId: string): UseProductDetailsReturn {
  const { addItem } = useCart();

  // React Query handles fetching + caching
  const {
    data: product,
    isLoading: productLoading,
    error: productError,
  } = useProductDetail(productId);
  const { data: categories = [] } = useCategories();

  const category = useMemo(
    () =>
      product
        ? (categories.find((c) => c.category_id === product.category_id) ??
          null)
        : null,
    [product, categories],
  );

  const { data: relatedProducts = [] } = useRelatedProducts(
    category?.category_id ?? 0,
    product?.product_id,
  );

  // Load favorites from localStorage
  const loadFavorites = useCallback((): Set<number> => {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return new Set(
            parsed
              .filter((n: any) => Number.isFinite(n))
              .map((n: any) => Number(n)),
          );
        }
      }
    } catch (e) {
      // ignore
    }
    return new Set();
  }, []);

  // Save favorites to localStorage
  const saveFavorites = useCallback((favorites: Set<number>) => {
    try {
      localStorage.setItem(
        FAVORITES_KEY,
        JSON.stringify(Array.from(favorites)),
      );
    } catch (e) {
      // ignore
    }
  }, []);

  // Local UI state (quantity, favorite, active image)
  const [quantity, setLocalQuantity] = useState(1);
  const [isFavorite, setLocalFavorite] = useState(false);
  const [activeImage, setLocalActiveImage] = useState<string | null>(null);

  // Sync favourite + image when product data arrives
  useEffect(() => {
    if (product) {
      const favs = loadFavorites();
      setLocalFavorite(favs.has(product.product_id));
      setLocalActiveImage(
        product.image_url ||
          (product.sub_images && product.sub_images.length > 0
            ? product.sub_images[0]
            : null),
      );
    }
  }, [product, loadFavorites]);

  // Show error toast on failure
  useEffect(() => {
    if (productError) toast.error("Failed to load product details");
  }, [productError]);

  const loading = productLoading;

  const state: ProductDetailsState = useMemo(
    () => ({
      product: product ?? null,
      category,
      relatedProducts,
      loading,
      quantity,
      isFavorite,
      activeImage,
    }),
    [
      product,
      category,
      relatedProducts,
      loading,
      quantity,
      isFavorite,
      activeImage,
    ],
  );

  // Actions — use local setters for UI-only fields; data fields are read-only from the query
  const actions: ProductDetailsActions = useMemo(
    () => ({
      setProduct: () => {}, // managed by React Query
      setCategory: () => {}, // derived
      setRelatedProducts: () => {}, // managed by React Query
      setLoading: () => {}, // managed by React Query
      setQuantity: (q: number) => setLocalQuantity(Math.max(1, q)),
      setIsFavorite: (v: boolean) => setLocalFavorite(v),
      setActiveImage: (img: string | null) => setLocalActiveImage(img),
    }),
    [],
  );

  // Handle add to cart
  const handleAddToCart = useCallback(() => {
    if (!product) return;

    for (let i = 0; i < Math.max(1, quantity); i++) {
      addItem({
        id: product.product_id.toString(),
        name: product.name,
        price: product.price,
        image: getFullImageUrl(product.image_url || ""),
        stock: product.stock_quantity,
        category: category?.name,
      });
    }
  }, [addItem, product, quantity, category?.name]);

  // Toggle favorite
  const toggleFavorite = useCallback(() => {
    if (!product) return;

    const favorites = loadFavorites();
    const pid = product.product_id;

    if (favorites.has(pid)) {
      favorites.delete(pid);
      toast.success("Removed from favorites");
    } else {
      favorites.add(pid);
      toast.success("Added to favorites");
    }

    saveFavorites(favorites);
    setLocalFavorite(favorites.has(pid));
  }, [product, loadFavorites, saveFavorites]);

  // Handle share
  const handleShare = useCallback(async () => {
    if (!product) return;

    const shareData = {
      title: product.name,
      text: product.description,
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Product link copied to clipboard!");
      }
    } catch (error) {
      toast.error("Failed to share product");
    }
  }, [product]);

  return {
    state,
    actions,
    handleAddToCart,
    toggleFavorite,
    handleShare,
  };
}
