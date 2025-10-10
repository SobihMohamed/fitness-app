"use client";

import React, { useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { useProductDetails } from "@/hooks/client/use-product-details";

// Lazy load heavy components for better performance
const ProductDetailsImageGallery = dynamic(
  () => import("@/components/client/products/ProductDetailsImageGallery"),
  { 
    loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />
  }
);

const ProductDetailsInfo = dynamic(
  () => import("@/components/client/products/ProductDetailsInfo"),
  { 
    loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />
  }
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

  // Memoized handlers for better performance
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleProductsRedirect = useCallback(() => {
    router.push("/products");
  }, [router]);

  // Memoized calculations
  const productStats = useMemo(() => ({
    hasImages: state.product?.image_url || state.activeImage,
    isInStock: state.product ? state.product.stock_quantity > 0 : false,
    productName: state.product?.name || '',
    currentQuantity: state.quantity
  }), [state.product, state.activeImage, state.quantity]);

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-20">
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-gray-700 text-lg font-medium">Loading product details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!state.product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-20 flex items-center justify-center">
        <Card className="shadow-2xl max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
            <p className="text-gray-600 mb-6">The product you are looking for does not exist or has been removed.</p>
            <Button onClick={handleProductsRedirect} className="bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="outline" 
          onClick={handleBack} 
          className="mb-6 text-gray-600 hover:text-gray-900 border-gray-200 hover:border-gray-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Button>

        {/* Product Details */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
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
