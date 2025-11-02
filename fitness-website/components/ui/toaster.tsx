"use client"

import React from "react"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"

export function Toaster(props: React.ComponentProps<typeof SonnerToaster>) {
  return <SonnerToaster {...props} />
}
