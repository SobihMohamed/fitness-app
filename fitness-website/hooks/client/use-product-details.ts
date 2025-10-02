"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { clientProductsApi } from "@/lib/api/client-products";
import { toast } from "sonner";
import type { 
  ClientProduct, 
  ClientCategory, 
  ProductDetailsState, 
  ProductDetailsActions, 
  UseProductDetailsReturn 
} from "@/types/product";

const FAVORITES_KEY = "product_favorites";

export function useProductDetails(productId: string): UseProductDetailsReturn {
  const [state, setState] = useState<ProductDetailsState>({
    product: null,
    category: null,
    relatedProducts: [],
    loading: true,
    quantity: 1,
    isFavorite: false,
    activeImage: null,
  });

  // Load favorites from localStorage
  const loadFavorites = useCallback((): Set<number> => {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return new Set(parsed.filter((n: any) => Number.isFinite(n)).map((n: any) => Number(n)));
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
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(favorites)));
    } catch (e) {
      // ignore
    }
  }, []);

  // Fetch product details
  const fetchProduct = useCallback(async () => {
    if (!productId) return;

    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const [product, categories] = await Promise.all([
        clientProductsApi.fetchProductById(productId),
        clientProductsApi.fetchCategories().catch(() => [])
      ]);

      const category = categories.find(c => c.category_id === product.category_id) || null;
      
      // Load related products
      let relatedProducts: ClientProduct[] = [];
      if (category) {
        try {
          relatedProducts = await clientProductsApi.fetchRelatedProducts(
            category.category_id, 
            product.product_id
          );
        } catch (e) {
          // ignore related products error
        }
      }

      // Check if product is in favorites
      const favorites = loadFavorites();
      const isFavorite = favorites.has(product.product_id);

      // Set active image to main image or first sub image
      const activeImage = product.image_url || 
        (product.sub_images && product.sub_images.length > 0 ? product.sub_images[0] : null);

      setState(prev => ({
        ...prev,
        product,
        category,
        relatedProducts,
        loading: false,
        isFavorite,
        activeImage,
      }));
    } catch (error: any) {
      console.error("Error fetching product details:", error);
      setState(prev => ({
        ...prev,
        product: null,
        loading: false,
      }));
      toast.error("Failed to load product details");
    }
  }, [productId, loadFavorites]);

  // Load product on mount or when productId changes
  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // Actions
  const actions: ProductDetailsActions = useMemo(() => ({
    setProduct: (product: ClientProduct | null) => {
      setState(prev => ({ ...prev, product }));
    },
    setCategory: (category: ClientCategory | null) => {
      setState(prev => ({ ...prev, category }));
    },
    setRelatedProducts: (relatedProducts: ClientProduct[]) => {
      setState(prev => ({ ...prev, relatedProducts }));
    },
    setLoading: (loading: boolean) => {
      setState(prev => ({ ...prev, loading }));
    },
    setQuantity: (quantity: number) => {
      setState(prev => ({ ...prev, quantity: Math.max(1, quantity) }));
    },
    setIsFavorite: (isFavorite: boolean) => {
      setState(prev => ({ ...prev, isFavorite }));
    },
    setActiveImage: (activeImage: string | null) => {
      setState(prev => ({ ...prev, activeImage }));
    },
  }), []);

  // Handle add to cart
  const handleAddToCart = useCallback(() => {
    if (!state.product) return;

    try {
      // Get existing cart from localStorage
      const existingCart = localStorage.getItem("cart");
      let cart: Array<{ product: ClientProduct; quantity: number }> = [];
      
      if (existingCart) {
        const parsed = JSON.parse(existingCart);
        // Ensure cart is always an array
        cart = Array.isArray(parsed) ? parsed : [];
      }

      // Check if product already exists in cart
      const existingItemIndex = cart.findIndex(item => item.product.product_id === state.product!.product_id);
      
      if (existingItemIndex >= 0) {
        // Update quantity
        cart[existingItemIndex].quantity += state.quantity;
      } else {
        // Add new item
        cart.push({
          product: state.product,
          quantity: state.quantity
        });
      }

      // Save to localStorage
      localStorage.setItem("cart", JSON.stringify(cart));
      
      toast.success(`Added ${state.product.name} to cart!`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add item to cart");
    }
  }, [state.product, state.quantity]);

  // Toggle favorite
  const toggleFavorite = useCallback(() => {
    if (!state.product) return;

    const favorites = loadFavorites();
    const productId = state.product.product_id;
    
    if (favorites.has(productId)) {
      favorites.delete(productId);
      toast.success("Removed from favorites");
    } else {
      favorites.add(productId);
      toast.success("Added to favorites");
    }
    
    saveFavorites(favorites);
    actions.setIsFavorite(favorites.has(productId));
  }, [state.product, loadFavorites, saveFavorites, actions]);

  // Handle share
  const handleShare = useCallback(async () => {
    if (!state.product) return;

    const shareData = {
      title: state.product.name,
      text: state.product.description,
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Product link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast.error("Failed to share product");
    }
  }, [state.product]);

  return {
    state,
    actions,
    handleAddToCart,
    toggleFavorite,
    handleShare,
  };
}
