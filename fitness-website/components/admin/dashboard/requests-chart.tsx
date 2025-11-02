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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { RequestsChartProps } from "@/types";

export const RequestsChart = React.memo<RequestsChartProps>(({ 
  requestsOverTime, 
  isMounted 
}) => {
  return (
    <div>
      <Card className="bg-white shadow-xl rounded-2xl border-0 hover:shadow-2xl transition-all">
        <CardHeader>
          <CardTitle className="text-gray-900">Requests Over Time</CardTitle>
          <CardDescription className="text-gray-500">
            Training and course requests (last 12 days)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={requestsOverTime} margin={{ left: 8, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#3B82F6" 
                    strokeWidth={2} 
                    dot={false} 
                    name="Requests" 
                  />
                </LineChart>
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

RequestsChart.displayName = "RequestsChart";
