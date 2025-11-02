"use client";

import dynamic from "next/dynamic";

// Simplified dynamic imports for heavy chart components
// Using standard Next.js dynamic() pattern to avoid webpack module issues
export const RequestsChartDynamic = dynamic(
  () => import("./requests-chart").then((mod) => mod.RequestsChart),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white shadow-xl rounded-2xl border-0 p-6">
        <div className="h-72 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    ),
  }
);

export const RolesChartDynamic = dynamic(
  () => import("./roles-chart").then((mod) => mod.RolesChart),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white shadow-xl rounded-2xl border-0 p-6">
        <div className="h-72 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    ),
  }
);

export const OrderStatisticsDynamic = dynamic(
  () => import("./order-statistics").then((mod) => mod.OrderStatistics),
  {
    ssr: false,
    loading: () => (
      <div className="bg-gradient-to-br from-white to-gray-50 shadow-xl rounded-2xl border-0 p-6">
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      </div>
    ),
  }
);
