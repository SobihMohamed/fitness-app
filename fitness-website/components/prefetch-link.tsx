"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, type ComponentProps } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import * as fetchers from "@/lib/api/fetchers";

interface PrefetchLinkProps extends ComponentProps<typeof Link> {
  prefetchData?: {
    type: "product" | "course" | "blog" | "service";
    id: string;
  };
}

/**
 * Enhanced Link component with aggressive prefetching.
 * On hover it warms the React Query cache for the target entity.
 */
export function PrefetchLink({
  prefetchData,
  onMouseEnter,
  children,
  ...props
}: PrefetchLinkProps) {
  const router = useRouter();
  const qc = useQueryClient();
  const routePrefetchedRef = useRef(false);
  const dataPrefetchedRef = useRef(false);

  // Prefetch the route immediately
  useEffect(() => {
    if (props.href && !routePrefetchedRef.current) {
      router.prefetch(props.href.toString());
      routePrefetchedRef.current = true;
    }
  }, [props.href, router]);

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      onMouseEnter?.(e);

      if (prefetchData && !dataPrefetchedRef.current) {
        const { type, id } = prefetchData;
        switch (type) {
          case "product":
            qc.prefetchQuery({
              queryKey: queryKeys.products.detail(id),
              queryFn: () => fetchers.fetchProductById(id),
            });
            break;
          case "course":
            qc.prefetchQuery({
              queryKey: queryKeys.courses.detail(id),
              queryFn: () => fetchers.fetchCourseById(id),
            });
            break;
          case "blog":
            qc.prefetchQuery({
              queryKey: queryKeys.blogs.detail(id),
              queryFn: () => fetchers.fetchBlogById(id),
            });
            break;
          case "service":
            qc.prefetchQuery({
              queryKey: queryKeys.services.detail(id),
              queryFn: () => fetchers.fetchServiceById(id),
            });
            break;
        }
        dataPrefetchedRef.current = true;
      }
    },
    [onMouseEnter, prefetchData, qc],
  );

  return (
    <Link {...props} prefetch={true} onMouseEnter={handleMouseEnter}>
      {children}
    </Link>
  );
}
