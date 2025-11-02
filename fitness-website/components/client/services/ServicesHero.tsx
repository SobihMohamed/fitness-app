"use client"

import { memo } from "react"
import { Badge } from "@/components/ui/badge"

export const ServicesHero = memo(function ServicesHero() {
  return (
    <section className="py-12 lg:py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Badge className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors mb-4 px-4 py-1 text-sm font-medium">
          Our Services
        </Badge>
        <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-foreground">
          Comprehensive Fitness{" "}
          <span className="text-primary bg-clip-text bg-gradient-to-r from-primary to-primary/80">
            Solutions
          </span>
        </h1>
        <p className="text-xl max-w-3xl mx-auto text-muted leading-relaxed">
          Personal training, group classes, wellness coaching, and more—everything you need to stay consistent and see results.
        </p>
      </div>
    </section>
  )
})
