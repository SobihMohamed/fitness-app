"use client"

export default function Loading() {
  const SkeletonCard = (
    <div className="overflow-hidden shadow-lg bg-white rounded-md">
      <div className="p-0">
        <div className="relative aspect-square bg-gray-200 animate-pulse" />
      </div>
      <div className="p-6">
        <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-3" />
        <div className="h-4 w-full bg-gray-100 rounded animate-pulse mb-2" />
        <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse mb-6" />
        <div className="flex items-center justify-between mb-4">
          <div className="h-8 w-1/3 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-1/4 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="h-12 w-full bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background pt-20">
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-4 mx-auto" />
          <div className="h-10 w-80 bg-gray-200 rounded animate-pulse mb-4 mx-auto" />
          <div className="h-5 w-[32rem] max-w-full bg-gray-100 rounded animate-pulse mx-auto" />
        </div>
      </section>
      <section className="py-8 bg-gray-50 border-y">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="h-12 w-full max-w-md bg-gray-200 rounded animate-pulse" />
            <div className="flex gap-4 w-full lg:w-auto">
              <div className="h-12 w-56 bg-gray-200 rounded animate-pulse" />
              <div className="h-12 w-56 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </section>
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array(12)
              .fill(0)
              .map((_, i) => (
                <div key={i}>{SkeletonCard}</div>
              ))}
          </div>
        </div>
      </section>
    </div>
  )
}
