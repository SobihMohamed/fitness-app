"use client";

import React from "react";

type LoadingSpinnerProps = {
  fullScreen?: boolean;
  size?: "sm" | "md" | "lg";
  message?: string;
};

export function LoadingSpinner({ fullScreen, size = "md", message }: LoadingSpinnerProps) {
  const sizeClasses = size === "sm" ? "h-6 w-6" : size === "lg" ? "h-12 w-12" : "h-8 w-8";
  const containerClasses = fullScreen
    ? "flex items-center justify-center h-[60vh]"
    : "flex items-center justify-center py-8";

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center gap-3">
        <div className={`animate-spin rounded-full border-t-2 border-b-2 border-indigo-600 ${sizeClasses}`} />
        {message && <p className="text-slate-600 text-sm">{message}</p>}
      </div>
    </div>
  );
}


