"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, type ComponentProps } from "react";
import { cachedProductsApi } from "@/lib/api/cached-client";

interface PrefetchLinkProps extends ComponentProps<typeof Link> {
  prefetchData?: {
    type: 'product' | 'course' | 'blog' | 'service';
    id: string;
  };
}

/**
 * Enhanced Link component with aggressive prefetching
 * - Prefetches route on hover (earlier than Next.js default)
 * - Optionally prefetches data for instant page loads
 */
export function PrefetchLink({ 
  prefetchData, 
  onMouseEnter,
  children,
  ...props 
}: PrefetchLinkProps) {
  const router = useRouter();
  const prefetchedRef = useRef(false);

  // Always prefetch the route immediately
  useEffect(() => {
    if (props.href && !prefetchedRef.current) {
      router.prefetch(props.href.toString());
      prefetchedRef.current = true;
    }
  }, [props.href, router]);

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Call original onMouseEnter if provided
    onMouseEnter?.(e);

    // Prefetch data on hover for instant loading
    if (prefetchData && !prefetchedRef.current) {
      switch (prefetchData.type) {
        case 'product':
          cachedProductsApi.prefetchProductDetail(prefetchData.id).catch(() => {});
          break;
        // Add other types as needed
      }
      prefetchedRef.current = true;
    }
  };

  return (
    <Link 
      {...props} 
      prefetch={true}
      onMouseEnter={handleMouseEnter}
    >
      {children}
    </Link>
  );
}
