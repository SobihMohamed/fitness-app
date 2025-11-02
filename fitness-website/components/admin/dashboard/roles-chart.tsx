"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { RolesChartProps } from "@/types";

const COLORS = ["#3B82F6", "#10B981", "#FBBF24", "#F97316", "#8B5CF6"];

export const RolesChart = React.memo<RolesChartProps>(({ 
  rolesDistribution, 
  isMounted 
}) => {
  return (
    <div>
      <Card className="bg-white shadow-xl rounded-2xl border-0 hover:shadow-2xl transition-all">
        <CardHeader>
          <CardTitle className="text-gray-900">User Roles</CardTitle>
          <CardDescription className="text-gray-500">
            Distribution of user roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={rolesDistribution}
                    dataKey="count"
                    nameKey="role"
                    cx="50%"
                    cy="50%"
                    outerRadius={88}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {rolesDistribution?.map((entry, index) => (
                      <Cell key={`role-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
                Loading chart…
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

RolesChart.displayName = "RolesChart";
