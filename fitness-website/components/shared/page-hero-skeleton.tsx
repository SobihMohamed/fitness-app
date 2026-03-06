import { cn } from "@/lib/utils";

type PageHeroSkeletonProps = {
  className?: string;
};

export function PageHeroSkeleton({ className }: PageHeroSkeletonProps) {
  return (
    <div className={cn("py-12 lg:py-20 bg-gradient-to-b from-white to-gray-50", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-pulse">
          <div className="h-6 w-32 bg-gray-200 rounded-full mx-auto mb-4" />
          <div className="h-12 w-96 bg-gray-200 rounded-lg mx-auto mb-6" />
          <div className="h-6 w-full max-w-3xl bg-gray-100 rounded-lg mx-auto" />
        </div>
      </div>
    </div>
  );
}
