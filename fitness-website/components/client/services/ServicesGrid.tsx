"use client"

import { memo, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Dumbbell } from "lucide-react"
import { getProxyImageUrl } from "@/lib/images"
import type { ClientService } from "@/types"

interface ServicesGridProps {
  services: ClientService[]
}

export const ServicesGrid = memo(function ServicesGrid({ services }: ServicesGridProps) {
  const list = useMemo(() => services, [services])

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {list.map((service, index) => {
        const isPopular = !!service.popular
        const n = typeof service.price === "number" ? service.price : Number(service.price)
        const priceText = `${(isNaN(n) ? 0 : n).toFixed(2)} EGP`

        const features = Array.isArray(service.features) ? service.features.slice(0, 3) : []
        return (
          <Card
            key={service.id}
            className={`group relative overflow-hidden border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300 ${isPopular ? "ring-2 ring-primary/80" : ""}`}
          >
            <CardHeader className="p-0">
              <div className="relative overflow-hidden rounded-t-lg">
                {service.image ? (
                  <Image
                    src={getProxyImageUrl(service.image || undefined) || "/placeholder.svg"}
                    alt={service?.title ? `${service.title} service image` : "Service image"}
                    width={800}
                    height={400}
                    className="w-full h-48 object-cover transform transition-transform duration-300 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={index < 3}
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                    <Dumbbell className="h-16 w-16 text-primary" />
                  </div>
                )}
                {isPopular && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-secondary text-secondary-foreground">Most Popular</Badge>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <CardTitle className="text-xl mb-2 text-foreground line-clamp-2">{service.title}</CardTitle>
                <Badge variant="secondary" className="shrink-0">{priceText}</Badge>
              </div>
              <CardDescription className="mb-4 text-muted-foreground line-clamp-3">
                {service.description}
              </CardDescription>
              <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground flex-wrap">
                {service.category && (
                  <Badge variant="outline" className="border-dashed">
                    {service.category}
                  </Badge>
                )}
                {features.map((f, idx) => (
                  <span key={idx} className="px-2 py-1 rounded-md bg-muted text-foreground/80">
                    {f}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
                {service.duration && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {service.duration}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <Link href={`/services/${service.id}`} className="w-full">
                  <Button className="w-full bg-primary hover:bg-primary/90 group-hover:translate-y-[-1px] transition-transform">
                    View Details & Book
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
})
