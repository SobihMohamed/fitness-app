"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionText, 
  actionHref 
}: EmptyStateProps) {
  return (
    <div className="text-center text-gray-500 py-12">
      <Icon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      {actionText && actionHref && (
        <Link 
          href={actionHref} 
          className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 inline-flex items-center gap-1"
        >
          {actionText} →
        </Link>
      )}
    </div>
  );
}
