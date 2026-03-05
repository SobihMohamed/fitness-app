"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { AuthProvider } from "@/contexts/auth-context";
import { CartProvider } from "@/contexts/cart-context";

// Lazy load Toaster to avoid blocking initial render
const Toaster = dynamic(
  () => import("@/components/ui/sonner").then((m) => m.Toaster),
  { ssr: false },
);

// Lazy load React Query DevTools — keeps the ~50KB devtools out of the main bundle
const DevTools = dynamic(
  () =>
    import("@tanstack/react-query-devtools").then((m) => m.ReactQueryDevtools),
  { ssr: false },
);

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster richColors />
      <AuthProvider>
        <CartProvider>{children}</CartProvider>
      </AuthProvider>
      {process.env.NODE_ENV === "development" && <DevTools />}
    </QueryClientProvider>
  );
}
