"use client";

import { useEffect, useState, useMemo } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { ErrorDisplay } from "@/components/admin/shared/error-display";
import { PageHeader } from "@/components/admin/shared/page-header";
import { useDashboardData } from "@/hooks/dashboard/use-dashboard-data";
import {
  DashboardStatsCards,
  UserStatistics,
  QuickActions,
  RequestsChartDynamic,
  RolesChartDynamic,
  OrderStatisticsDynamic,
} from "@/components/admin/dashboard";
import { OrderStatusData } from "@/types";

export default function AdminDashboardPage() {
  const {
    stats,
    userStats,
    orderStats,
    requestsOverTime,
    rolesDistribution,
    error,
    // loading is handled inside the components or useDashboardData if configured
  } = useDashboardData();

  // Hydration safety for charts
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const adminCount = useMemo(
    () => parseInt(stats.find((s) => s.title === "Admins")?.value ?? "0", 10),
    [stats]
  );

  const orderStatusData = useMemo((): OrderStatusData[] => {
    if (!orderStats) {
      return [
        { name: "Pending", value: 0 },
        { name: "Completed", value: 0 },
        { name: "Cancelled", value: 0 },
      ];
    }
    return [
      { name: "Pending", value: orderStats.pendingOrders },
      { name: "Completed", value: orderStats.completedOrders },
      { name: "Cancelled", value: orderStats.cancelledOrders },
    ];
  }, [orderStats]);

  if (error) {
    return <ErrorDisplay message={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <AdminLayout>
      <div className="space-y-8 p-6 lg:p-8 bg-slate-50 min-h-screen">
        <PageHeader
          title="Dashboard"
          description="Welcome back! Here's what's happening with your fitness platform."
        />

        <DashboardStatsCards stats={stats} adminCount={adminCount} />

        <UserStatistics userStats={userStats} adminCount={adminCount} />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          <RequestsChartDynamic requestsOverTime={requestsOverTime} isMounted={isMounted} />
          <RolesChartDynamic rolesDistribution={rolesDistribution} isMounted={isMounted} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          <QuickActions />
          <OrderStatisticsDynamic orderStatusData={orderStatusData} isMounted={isMounted} />
        </div>
      </div>
    </AdminLayout>
  );
}
