"use client";

import { Badge } from "@/components/ui/badge";
import type { BadgeProps } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type PageHeroClientProps = {
  badge: string;
  title: string;
  highlight?: string;
  description?: string;
  className?: string;
};

type PageHeroTextClientProps = {
  badge: string;
  title: string;
  highlight?: string;
  description?: string;
  containerClassName?: string;
  badgeProps?: BadgeProps;
  titleClassName?: string;
  highlightClassName?: string;
  descriptionClassName?: string;
};

export function PageHeroTextClient({
  badge,
  title,
  highlight,
  description,
  containerClassName,
  badgeProps,
  titleClassName,
  highlightClassName,
  descriptionClassName,
}: PageHeroTextClientProps) {
  return (
    <div className={cn("space-y-0", containerClassName)}>
      <Badge
        {...badgeProps}
        className={cn(
          "bg-primary/10 text-primary hover:bg-primary/20 transition-colors mb-4 px-4 py-1 text-sm font-medium",
          badgeProps?.className,
        )}
      >
        {badge}
      </Badge>
      <h1
        className={cn(
          "text-4xl lg:text-6xl font-bold mb-6 text-foreground",
          titleClassName,
        )}
      >
        {title}{" "}
        {highlight ? (
          <span
            className={cn(
              "text-primary bg-clip-text bg-gradient-to-r from-primary to-primary/80",
              highlightClassName,
            )}
          >
            {highlight}
          </span>
        ) : null}
      </h1>
      {description ? (
        <p
          className={cn(
            "text-xl max-w-3xl mx-auto text-muted leading-relaxed",
            descriptionClassName,
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function PageHeroClient({
  badge,
  title,
  highlight,
  description,
  className,
}: PageHeroClientProps) {
  return (
    <section
      className={cn(
        "py-12 lg:py-20 bg-gradient-to-b from-white to-gray-50",
        className,
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <PageHeroTextClient
          badge={badge}
          title={title}
          highlight={highlight}
          description={description}
        />
      </div>
    </section>
  );
}
