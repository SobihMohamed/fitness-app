// import { Skeleton } from "@/components/ui/skeleton"

// export default function BlogLoading() {
//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Hero Section Skeleton */}
//       <div className="bg-white py-16">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center">
//             <Skeleton className="h-12 w-64 mx-auto mb-4" />
//             <Skeleton className="h-6 w-96 mx-auto mb-8" />
//             <div className="flex justify-center space-x-4">
//               <Skeleton className="h-10 w-32" />
//               <Skeleton className="h-10 w-32" />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Search and Filter Skeleton */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="flex flex-col md:flex-row gap-4 mb-8">
//           <Skeleton className="h-12 flex-1" />
//           <Skeleton className="h-12 w-48" />
//         </div>

//         {/* Featured Post Skeleton */}
//         <div className="mb-12">
//           <Skeleton className="h-6 w-32 mb-4" />
//           <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//             <Skeleton className="h-64 w-full" />
//             <div className="p-6">
//               <Skeleton className="h-8 w-3/4 mb-4" />
//               <Skeleton className="h-4 w-full mb-2" />
//               <Skeleton className="h-4 w-2/3 mb-4" />
//               <div className="flex items-center justify-between">
//                 <Skeleton className="h-4 w-32" />
//                 <Skeleton className="h-4 w-24" />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Blog Posts Grid Skeleton */}
//         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
//           {Array.from({ length: 6 }).map((_, i) => (
//             <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
//               <Skeleton className="h-48 w-full" />
//               <div className="p-6">
//                 <Skeleton className="h-6 w-3/4 mb-3" />
//                 <Skeleton className="h-4 w-full mb-2" />
//                 <Skeleton className="h-4 w-2/3 mb-4" />
//                 <div className="flex items-center justify-between">
//                   <Skeleton className="h-4 w-24" />
//                   <Skeleton className="h-4 w-16" />
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   )
// }
import { Skeleton } from "@/components/ui/skeleton"

export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Skeleton */}
      <section className="relative py-24 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Skeleton className="h-8 w-64 mx-auto mb-6" />
          <Skeleton className="h-16 w-96 mx-auto mb-6" />
          <Skeleton className="h-6 w-full max-w-3xl mx-auto mb-8" />
          <div className="flex justify-center gap-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-32" />
          </div>
        </div>
      </section>

      {/* Search and Filters Skeleton */}
      <section className="py-8 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <Skeleton className="h-12 w-full max-w-md" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-28" />
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-6">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-24" />
            ))}
          </div>
        </div>
      </section>

      {/* Content Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-8">
            {/* Featured Post Skeleton */}
            <div className="mb-12">
              <Skeleton className="h-6 w-48 mb-6" />
              <div className="border-0 shadow-2xl rounded-lg overflow-hidden">
                <Skeleton className="h-80 w-full" />
                <div className="p-8 space-y-4">
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-3/4" />
                  <div className="flex flex-wrap gap-2">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-6 w-16" />
                    ))}
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="text-center p-3 bg-gray-50 rounded-lg">
                        <Skeleton className="h-5 w-5 mx-auto mb-1" />
                        <Skeleton className="h-4 w-12 mx-auto mb-1" />
                        <Skeleton className="h-3 w-8 mx-auto" />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-10 w-32" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Regular Posts Skeleton */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border-0 shadow-lg rounded-lg overflow-hidden">
                  <div className="md:flex">
                    <Skeleton className="md:w-1/3 h-64" />
                    <div className="md:w-2/3 p-6 space-y-4">
                      <div className="flex gap-2">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                      <div className="flex flex-wrap gap-1">
                        {[...Array(3)].map((_, j) => (
                          <Skeleton key={j} className="h-5 w-12" />
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <div className="space-y-1">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <Skeleton className="h-3 w-12" />
                          <Skeleton className="h-3 w-8" />
                          <Skeleton className="h-3 w-8" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-3">
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-3 w-12" />
                        </div>
                        <div className="flex gap-2">
                          <Skeleton className="h-8 w-8" />
                          <Skeleton className="h-8 w-8" />
                          <Skeleton className="h-8 w-20" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="space-y-6">
            {/* Newsletter Skeleton */}
            <div className="border-0 shadow-lg rounded-lg p-6 space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-3 w-3/4 mx-auto" />
            </div>

            {/* Popular Articles Skeleton */}
            <div className="border-0 shadow-lg rounded-lg">
              <div className="p-6 pb-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-6 w-32" />
                </div>
              </div>
              <div className="px-6 pb-6 space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex gap-3 p-3">
                    <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Categories Skeleton */}
            <div className="border-0 shadow-lg rounded-lg">
              <div className="p-6 pb-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
              <div className="px-6 pb-6 space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-3 w-3 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
