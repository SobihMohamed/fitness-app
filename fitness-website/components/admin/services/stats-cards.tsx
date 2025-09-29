"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Wrench, DollarSign } from "lucide-react";
import { formatNumber } from "@/utils/format";
import type { ServiceStats } from "@/types";

interface StatsCardsProps {
  stats: ServiceStats;
}

export const StatsCards = React.memo<StatsCardsProps>(({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-fr items-stretch">
      <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-indigo-100 hover:shadow-xl transition-all duration-200 h-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-700 mb-1">Total Services</p>
              <p className="text-3xl font-bold text-indigo-900">{stats.totalServices}</p>
            </div>
            <div className="p-3 bg-indigo-200 rounded-full">
              <Wrench className="h-8 w-8 text-indigo-700" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100 hover:shadow-xl transition-all duration-200 h-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700 mb-1">Total Price</p>
              <p className="text-3xl font-bold text-emerald-900">{formatNumber(stats.totalPrice)} EGP</p>
            </div>
            <div className="p-3 bg-emerald-200 rounded-full">
              <DollarSign className="h-8 w-8 text-emerald-700" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

StatsCards.displayName = "StatsCards";
