"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";

type StatsCardProps = {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
};

export function StatsCard({ title, value, icon, color = "#6366f1" }: StatsCardProps) {
  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
          </div>
          {icon ? (
            <div className="p-3 rounded-full" style={{ backgroundColor: `${color}22` }}>
              <div style={{ color }}>{icon}</div>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}


