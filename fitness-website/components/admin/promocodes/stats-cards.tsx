"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket, TrendingUp, Calendar, Clock } from "lucide-react";
import type { PromoCode } from "@/types";

interface StatsCardsProps {
  promoCodes: PromoCode[];
  loading?: boolean;
}

const StatsCards = React.memo(({ promoCodes, loading }: StatsCardsProps) => {
  const stats = React.useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    
    const total = promoCodes.length;
    const active = promoCodes.filter(p => 
      p.start_date <= today && p.end_date >= today
    ).length;
    const expired = promoCodes.filter(p => 
      p.end_date < today
    ).length;
    const upcoming = promoCodes.filter(p => 
      p.start_date > today
    ).length;

    return [
      {
        title: "Total Codes",
        value: total,
        icon: Ticket,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      },
      {
        title: "Active",
        value: active,
        icon: TrendingUp,
        color: "text-green-600",
        bgColor: "bg-green-50",
      },
      {
        title: "Expired",
        value: expired,
        icon: Calendar,
        color: "text-red-600",
        bgColor: "bg-red-50",
      },
      {
        title: "Upcoming",
        value: upcoming,
        icon: Clock,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
      },
    ];
  }, [promoCodes]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </CardTitle>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {stat.value}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {stat.title === "Total Codes" && "All promo codes"}
                {stat.title === "Active" && "Currently valid"}
                {stat.title === "Expired" && "Past end date"}
                {stat.title === "Upcoming" && "Future start date"}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
});

StatsCards.displayName = "StatsCards";

export { StatsCards };
