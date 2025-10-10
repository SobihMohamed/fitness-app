"use client";

interface LoadingSkeletonProps {
  height?: string;
  className?: string;
}

export function LoadingSkeleton({ height = "h-40", className = "" }: LoadingSkeletonProps) {
  return (
    <div className={`flex items-center justify-center ${height} text-gray-600 ${className}`}>
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce"></div>
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 border rounded-lg animate-pulse">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              <div className="h-3 bg-gray-300 rounded w-2/3"></div>
            </div>
            <div className="h-8 bg-gray-300 rounded w-20"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
          <div className="flex items-center">
            <div className="p-2 bg-gray-300 rounded-lg">
              <div className="h-6 w-6 bg-gray-400 rounded" />
            </div>
            <div className="ml-4 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-20" />
              <div className="h-6 bg-gray-300 rounded w-8" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
