"use client";

import {
  Loader2,
  Users,
  Shield,
  Plus,
  Edit3,
  Trash2,
  Dumbbell,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "workout" | "admin" | "inline";
  icon?: "loader" | "users" | "shield" | "plus" | "edit" | "trash" | "dumbbell";
  className?: string;
}

const iconMap = {
  loader: Loader2,
  users: Users,
  shield: Shield,
  plus: Plus,
  edit: Edit3,
  trash: Trash2,
  dumbbell: Dumbbell,
};

export default function Loading({
  message = "Loading...",
  size = "md",
  variant = "default",
  icon = "loader",
  className,
}: LoadingProps) {
  const IconComponent = iconMap[icon];

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <IconComponent
          className={cn(sizeClasses[size], "animate-spin text-indigo-600")}
        />
        <span className={cn(textSizeClasses[size], "text-slate-600")}>
          {message}
        </span>
      </div>
    );
  }

  if (variant === "workout") {
    return (
      <div
        className={cn(
          "min-h-screen flex flex-col items-center justify-center bg-black text-purple-400 gap-4",
          className
        )}
      >
        <div className="relative">
          <div className="absolute inset-0 rounded-full border-4 border-purple-400 animate-spin border-t-transparent h-16 w-16"></div>
          <div className="flex items-center justify-center p-4 bg-black rounded-full">
            <IconComponent className="h-8 w-8 text-purple-400" />
          </div>
        </div>
        <p className="font-bold text-purple-400 text-lg">{message}</p>
        <p className="text-sm text-gray-400 italic">Warming up your gains...</p>
      </div>
    );
  }

  if (variant === "admin") {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center p-8 gap-4",
          className
        )}
      >
        <div className="relative">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-200 animate-spin border-t-indigo-600 h-12 w-12"></div>
          <div className="flex items-center justify-center p-3 bg-indigo-50 rounded-full">
            <IconComponent className="h-6 w-6 text-indigo-600" />
          </div>
        </div>
        <p className="font-semibold text-slate-700 text-center">{message}</p>
      </div>
    );
  }

  // Default variant
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        className
      )}
    >
      <IconComponent
        className={cn(sizeClasses[size], "animate-spin text-indigo-600")}
      />
      <p className={cn("text-slate-600 text-center", textSizeClasses[size])}>
        {message}
      </p>
    </div>
  );
}
