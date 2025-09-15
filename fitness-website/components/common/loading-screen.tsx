"use client";

import React from "react";

type LoadingScreenProps = {
  message?: string;
  className?: string;
};

export function LoadingScreen({ message = "Loading…", className = "" }: LoadingScreenProps) {
  return (
    <div className={`min-h-screen bg-gray-50 flex items-center justify-center p-6 ${className}`}>
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4" />
        <p className="text-gray-700">{message}</p>
      </div>
    </div>
  );
}
