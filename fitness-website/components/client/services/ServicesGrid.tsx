import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Dumbbell, ArrowRight } from "lucide-react";
import { getProxyImageUrl } from "@/lib/images";
import type { ClientService } from "@/types";

interface ServicesGridProps {
  services: ClientService[];
}

export default function ServicesGrid({ services }: ServicesGridProps) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {services.map((service, index) => {
        const key = service.id || `service-${index}`;
        const isPopular = !!service.popular;
        const n =
          typeof service.price === "number"
            ? service.price
            : Number(service.price);
        const priceText = `${(isNaN(n) ? 0 : n).toFixed(2)} EGP`;

        const features = Array.isArray(service.features)
          ? service.features.slice(0, 3)
          : [];
        return (
          <Card
            key={key}
            className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl group border-muted bg-card flex flex-col ${
              isPopular ? "border-primary ring-1 ring-primary" : ""
            }`}
          >
            {isPopular && (
              <div className="absolute top-4 right-4 z-10">
                <Badge
                  variant="default"
                  className="bg-primary text-primary-foreground"
                >
                  Most Popular
                </Badge>
              </div>
            )}
            <div className="h-48 relative overflow-hidden bg-muted">
              {service.image ? (
                <Image
                  src={getProxyImageUrl(service.image)}
                  alt={service.title}
                  fill
                  unoptimized
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-secondary">
                  <Dumbbell className="h-12 w-12 text-muted-foreground/30" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                <Badge
                  variant="secondary"
                  className="backdrop-blur-md bg-background/50"
                >
                  {service.category}
                </Badge>
              </div>
            </div>
            <CardHeader>
              <CardTitle
                className="text-xl group-hover:text-primary transition-colors text-foreground line-clamp-2 break-all"
                title={service.title}
              >
                {service.title}
              </CardTitle>
              <CardDescription
                className="line-clamp-2 text-muted-foreground break-all"
                title={service.description}
              >
                {service.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 flex flex-col">
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="w-4 h-4 mr-2 text-primary flex-shrink-0" />
                <span className="truncate" title={service.duration}>
                  {service.duration}
                </span>
              </div>
              <ul className="space-y-2 mb-4 flex-1">
                {features.map((feature, i) => (
                  <li
                    key={i}
                    className="flex items-center text-sm text-muted-foreground"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="pt-4 mt-auto border-t border-border flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">
                    Starting from
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {priceText}
                  </div>
                </div>
                <Button
                  asChild
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Link href={`/services/${service.id}`}>
                    View Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
