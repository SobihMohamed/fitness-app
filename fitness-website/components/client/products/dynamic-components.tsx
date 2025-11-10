// "use client";

// import dynamic from "next/dynamic";
// import { Card, CardContent, CardHeader } from "@/components/ui/card";
// import { Skeleton } from "@/components/ui/skeleton";

// // Dynamic imports with SSR disabled to prevent hydration mismatches
// export const ProductsHeroSectionDynamic = dynamic(
//   () => import("./ProductsHeroSection"),
//   {
//     ssr: false,
//     loading: () => (
//       <div className="py-12 lg:py-20 bg-gradient-to-b from-white to-gray-50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
//           <div className="animate-pulse">
//             <div className="h-6 w-32 bg-gray-200 rounded-full mx-auto mb-4" />
//             <div className="h-12 w-96 bg-gray-200 rounded-lg mx-auto mb-6" />
//             <div className="h-6 w-full max-w-3xl bg-gray-100 rounded-lg mx-auto" />
//           </div>
//         </div>
//       </div>
//     ),
//   }
// );

// export const ProductsFilterSectionDynamic = dynamic(
//   () => import("./ProductsFilterSection"),
//   {
//     ssr: false,
//     loading: () => (
//       <div className="py-8 bg-gray-50 border-y">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="animate-pulse">
//             <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
//               <div className="h-12 w-full max-w-md bg-gray-200 rounded-lg" />
//               <div className="flex gap-4">
//                 <div className="h-12 w-56 bg-gray-200 rounded-lg" />
//                 <div className="h-12 w-56 bg-gray-200 rounded-lg" />
//                 <div className="h-12 w-32 bg-gray-200 rounded-lg" />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     ),
//   }
// );

// export const ProductGridDynamic = dynamic(
//   () => import("./ProductGrid"),
//   {
//     ssr: false,
//     loading: () => (
//       <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
//         {Array(12)
//           .fill(0)
//           .map((_, index) => (
//             <Card key={`skeleton-${index}`} className="border-0 shadow-md bg-white">
//               <CardHeader className="p-0">
//                 <Skeleton className="w-full h-48 rounded-t-lg" />
//               </CardHeader>
//               <CardContent className="p-6">
//                 <Skeleton className="h-6 w-3/4 mb-2" />
//                 <Skeleton className="h-4 w-1/2 mb-4" />
//                 <div className="flex items-center justify-between">
//                   <Skeleton className="h-8 w-16" />
//                   <Skeleton className="h-10 w-32" />
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//       </div>
//     ),
//   }
// );

// // Pagination is now handled inline in page components

//=========================================================

"use client";

import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// ✅ Reusable Skeleton Card for Product Loading
const ProductSkeletonCard = () => (
  <Card className="border-0 shadow-md bg-white">
    <CardHeader className="p-0">
      <Skeleton className="w-full h-48 rounded-t-lg" />
    </CardHeader>
    <CardContent className="p-6">
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-4" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-10 w-32" />
      </div>
    </CardContent>
  </Card>
);

// ✅ Dynamic Imports with Shared Skeleton Loaders
export const ProductsHeroSectionDynamic = dynamic(
  () => import("./ProductsHeroSection"),
  {
    ssr: false,
    loading: () => (
      <section className="py-12 lg:py-20 bg-gradient-to-b from-white to-gray-50 animate-pulse text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-6 w-32 bg-gray-200 rounded-full mx-auto mb-4" />
          <div className="h-12 w-96 bg-gray-200 rounded-lg mx-auto mb-6" />
          <div className="h-6 w-full max-w-3xl bg-gray-100 rounded-lg mx-auto" />
        </div>
      </section>
    ),
  }
);

export const ProductsFilterSectionDynamic = dynamic(
  () => import("./ProductsFilterSection"),
  {
    ssr: false,
    loading: () => (
      <section className="py-8 bg-gray-50 border-y animate-pulse">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="h-12 w-full max-w-md bg-gray-200 rounded-lg" />
            <div className="flex gap-4">
              {["w-56", "w-56", "w-32"].map((w, i) => (
                <div key={i} className={`h-12 ${w} bg-gray-200 rounded-lg`} />
              ))}
            </div>
          </div>
        </div>
      </section>
    ),
  }
);

export const ProductGridDynamic = dynamic(() => import("./ProductGrid"), {
  ssr: false,
  loading: () => (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 animate-pulse">
      {Array.from({ length: 12 }, (_, i) => (
        <ProductSkeletonCard key={i} />
      ))}
    </div>
  ),
});
