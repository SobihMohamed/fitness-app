import type { ProductsHeroSectionProps } from "@/types";
import { PageHero } from "@/components/shared/page-hero";

export default function ProductsHeroSection({
  className = "",
}: ProductsHeroSectionProps) {
  return (
    <PageHero
      className={className}
      badge="Our Collection"
      title="Premium Fitness"
      highlight="Products"
      description="Discover our curated collection of high-quality fitness equipment and supplements designed to help you achieve your goals and maintain a healthy lifestyle."
    />
  );
}
