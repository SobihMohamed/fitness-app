"use client";

import React from "react";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

export interface RatingStarsProps {
  rating?: number | null;
  size?: "sm" | "md" | "lg";
  showNumber?: boolean;
  className?: string;
}

const SIZE_MAP = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

const RatingStars: React.FC<RatingStarsProps> = ({ rating, size = "md", showNumber = true, className = "" }) => {
  if (!rating || rating <= 0) return null;
  const safe = Math.min(5, Math.max(0, Number(rating)));
  const full = Math.floor(safe);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[...Array(5)].map((_, i) => (
        <StarIconSolid
          key={i}
          className={`${SIZE_MAP[size]} ${i < full ? "text-yellow-400" : "text-gray-200"}`}
        />
      ))}
      {showNumber && (
        <span className="text-sm text-gray-600 ml-2">({safe.toFixed(1)})</span>
      )}
    </div>
  );
};

export default React.memo(RatingStars);
