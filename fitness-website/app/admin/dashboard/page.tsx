"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
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
    loading,
  } = useDashboardData();

  // Avoid hydration mismatch with Recharts by rendering charts only after mount
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const adminCount = useMemo(() => {
    return parseInt(stats.find((s) => s.title === "Admins")?.value ?? "0", 10);
  }, [stats]);

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

  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  if (error) {
    return <ErrorDisplay message={error} onRetry={handleRetry} />;
  }

  return (
    <AdminLayout>
      <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen">
        {/* Header */}
        <PageHeader
          title="Dashboard"
          description="Welcome back! Here's what's happening with your fitness platform."
        />

        {/* Stats Cards */}
        <DashboardStatsCards stats={stats} adminCount={adminCount} />

        {/* User Statistics */}
        <UserStatistics userStats={userStats} adminCount={adminCount} />

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RequestsChartDynamic
            requestsOverTime={requestsOverTime}
            isMounted={isMounted}
          />
          <RolesChartDynamic
            rolesDistribution={rolesDistribution}
            isMounted={isMounted}
          />
        </div>

        {/* Quick Actions + Order Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <QuickActions />
          <OrderStatisticsDynamic
            orderStatusData={orderStatusData}
            isMounted={isMounted}
          />
        </div>
      </div>
    </AdminLayout>
  );
}
