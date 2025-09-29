"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useProductDetails } from "@/hooks/client/use-product-details";
import { CardSkeleton } from "@/components/common/LoadingSkeletons";

// Dynamic imports to prevent hydration mismatches
const ProductDetailsImageGallery = dynamic(
  () => import("@/components/client/products/ProductDetailsImageGallery"),
  { ssr: false }
);

const ProductDetailsInfo = dynamic(
  () => import("@/components/client/products/ProductDetailsInfo"),
  { ssr: false }
);

const SingleProductPage = React.memo(() => {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  
  const {
    state,
    actions,
    handleAddToCart,
    toggleFavorite,
    handleShare,
  } = useProductDetails(productId);

  // Handle back navigation
  const handleBack = React.useCallback(() => {
    router.back();
  }, [router]);

  if (state.loading) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="animate-pulse">
            <div className="flex flex-col lg:flex-row gap-10">
              <div className="lg:w-1/2">
                <div className="aspect-square bg-gray-200 rounded-xl shadow-sm" />
                <div className="grid grid-cols-4 gap-4 mt-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-square bg-gray-100 rounded-lg shadow-sm" />
                  ))}
                </div>
              </div>
              <div className="lg:w-1/2 space-y-6">
                <div className="h-10 bg-gray-200 rounded-lg w-3/4" />
                <div className="h-6 bg-gray-100 rounded-lg w-1/4" />
                <div className="h-24 bg-gray-100 rounded-lg w-full" />
                <div className="h-12 bg-gray-200 rounded-lg w-1/3" />
                <div className="h-10 bg-gray-100 rounded-lg w-full" />
                <div className="h-12 bg-gray-200 rounded-lg w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!state.product) {
    return (
      <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
        <div className="text-center bg-white p-12 rounded-xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <p className="mt-4 text-muted-foreground">The product you are looking for does not exist or has been removed.</p>
          <Button onClick={() => router.push("/products")} className="mt-6 bg-primary hover:bg-primary/90 transition-all">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="outline" 
          onClick={handleBack} 
          className="mb-6 text-muted-foreground hover:text-foreground border-gray-200 hover:border-gray-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Button>

        {/* Product Details */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <ProductDetailsImageGallery
            product={state.product}
            activeImage={state.activeImage}
            onImageChange={actions.setActiveImage}
          />
          
          <ProductDetailsInfo
            product={state.product}
            quantity={state.quantity}
            isFavorite={state.isFavorite}
            onQuantityChange={actions.setQuantity}
            onAddToCart={handleAddToCart}
            onToggleFavorite={toggleFavorite}
            onShare={handleShare}
          />
        </div>
      </div>
    </div>
  );
});

SingleProductPage.displayName = "SingleProductPage";

export default SingleProductPage;
