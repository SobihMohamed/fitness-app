"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type ErrorDisplayProps = {
  message: string;
  onRetry?: () => void;
};

export function ErrorDisplay({ message, onRetry }: ErrorDisplayProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 py-16"
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex items-center gap-2 text-red-600">
        <AlertCircle className="h-5 w-5" />
        <span className="font-medium">{message}</span>
      </div>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="bg-transparent"
          aria-label="Retry action"
        >
          Try again
        </Button>
      )}
    </div>
  );
}


