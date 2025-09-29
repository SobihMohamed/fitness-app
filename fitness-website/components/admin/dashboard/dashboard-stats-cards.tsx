"use client";

import React from "react";
import Link from "next/link";
import { StatsCard } from "@/components/admin/shared/stats-card";
import { DashboardStatsCardsProps } from "@/types";

export const DashboardStatsCards = React.memo<DashboardStatsCardsProps>(({ 
  stats, 
  adminCount 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="transform transition-all hover:scale-[1.03]"
        >
          <StatsCard
            title={stat.title}
            value={stat.title === "Admins" ? adminCount : stat.value}
            icon={<stat.icon className="h-6 w-6" />}
            color={stat.color}
          />
          {stat.title === "Admins" && (
            <div className="mt-1 ml-2">
              <Link 
                href="/admin/users?role=admin" 
                className="text-xs text-indigo-700 underline"
              >
                Manage Admins
              </Link>
            </div>
          )}
        </div>
      ))}
    </div>
  );
});

DashboardStatsCards.displayName = "DashboardStatsCards";
