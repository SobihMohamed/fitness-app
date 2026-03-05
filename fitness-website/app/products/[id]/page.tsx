import React from "react";
import ProductDetailsClientPage from "@/components/client/products/ProductDetailsClientPage";

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ProductDetailsClientPage productId={id} />;
}
