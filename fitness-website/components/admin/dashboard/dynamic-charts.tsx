"use client";

import dynamic from "next/dynamic";
import { RequestsChartProps, RolesChartProps, OrderStatisticsProps } from "@/types";

// Dynamic imports for heavy chart components to prevent hydration mismatches
export const DynamicRequestsChart = dynamic(
  () => import("./requests-chart").then((mod) => ({ default: mod.RequestsChart })),
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

export const DynamicRolesChart = dynamic(
  () => import("./roles-chart").then((mod) => ({ default: mod.RolesChart })),
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

export const DynamicOrderStatistics = dynamic(
  () => import("./order-statistics").then((mod) => ({ default: mod.OrderStatistics })),
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

// Type the dynamic components
export const RequestsChartDynamic = DynamicRequestsChart as React.ComponentType<RequestsChartProps>;
export const RolesChartDynamic = DynamicRolesChart as React.ComponentType<RolesChartProps>;
export const OrderStatisticsDynamic = DynamicOrderStatistics as React.ComponentType<OrderStatisticsProps>;
