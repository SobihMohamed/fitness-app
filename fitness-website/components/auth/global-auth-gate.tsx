"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"
import { ProtectedRoute } from "@/components/auth/Protected-Route"

/**
 * GlobalAuthGate
 * Wraps the entire app and enforces auth protection for all routes
 * except those explicitly whitelisted as public.
 *
 * Adjust PUBLIC_ROUTES as needed to allow access without login.
 */
const PUBLIC_ROUTES: RegExp[] = [
  /^\/$/,                 // Home
  /^\/about(?:\/.*)?$/,
  /^\/blog(?:\/.*)?$/,
  /^\/contact(?:\/.*)?$/,
  /^\/auth(?:\/.*)?$/,    // Any auth-specific routes
  /^\/cart$/,             // let users view cart before login
]

export default function GlobalAuthGate({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/"

  const isPublic = PUBLIC_ROUTES.some((re) => re.test(pathname))

  if (isPublic) return <>{children}</>

  return <ProtectedRoute>{children}</ProtectedRoute>
}
