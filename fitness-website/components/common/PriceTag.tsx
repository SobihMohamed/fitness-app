"use client";

import React from "react";

export interface PriceTagProps {
  price?: number | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_MAP = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl",
};

const PriceTag: React.FC<PriceTagProps> = ({ price, size = "md", className = "" }) => {
  const cls = `${SIZE_MAP[size]} font-bold ${className}`;
  if (!price || price <= 0) {
    return <span className={`${cls} text-green-600`}>Free</span>;
  }
  return <span className={`${cls} text-gray-900`}>${price}</span>;
};

export default React.memo(PriceTag);
