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
import { ShoppingCart } from "lucide-react";
import { OrderStatisticsProps } from "@/types";

const COLORS = ["#3B82F6", "#10B981", "#FBBF24", "#F97316", "#8B5CF6"];

export const OrderStatistics = React.memo<OrderStatisticsProps>(({ 
  orderStatusData, 
  isMounted 
}) => {
  // Check if we have any meaningful data
  const hasData = orderStatusData.some(item => item.value > 0);
  
  return (
    <Card className="bg-gradient-to-br from-white to-gray-50 shadow-xl rounded-2xl border-0 hover:shadow-2xl transition-all">
      <CardHeader>
        <CardTitle className="text-gray-900 flex items-center">
          <ShoppingCart className="h-5 w-5 mr-2 text-orange-500" />
          Order Statistics
        </CardTitle>
        <CardDescription className="text-gray-500">
          Overview of order performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {isMounted ? (
            hasData ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={orderStatusData.filter(item => item.value > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent, value }) => {
                      const pct = (percent || 0) * 100;
                      // Skip labels for zero or very small slices to avoid overlap
                      if (!value || pct < 5) return "";
                      return `${name}: ${pct.toFixed(0)}%`;
                    }}
                  >
                    {orderStatusData.filter(item => item.value > 0).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <ShoppingCart className="h-12 w-12 mb-2 opacity-50" />
                <p className="text-sm">No order data available</p>
                <p className="text-xs mt-1">Orders will appear here once created</p>
              </div>
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
              Loading chart…
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

OrderStatistics.displayName = "OrderStatistics";
