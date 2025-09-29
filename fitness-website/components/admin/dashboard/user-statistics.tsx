"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, UserCheck } from "lucide-react";
import { UserStatisticsProps } from "@/types";

export const UserStatistics = React.memo<UserStatisticsProps>(({ 
  userStats, 
  adminCount 
}) => {
  return (
    <Card className="bg-gradient-to-br from-white to-gray-50 shadow-xl rounded-2xl border-0 hover:shadow-2xl transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-gray-900 flex items-center">
          <Users className="h-5 w-5 mr-2 text-green-500 animate-pulse" />
          User Statistics
        </CardTitle>
        <CardDescription className="text-gray-500">
          Overview of user engagement
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[
            {
              icon: <UserCheck className="h-5 w-5 text-indigo-600 mr-2 animate-bounce" />,
              label: <span className="font-bold text-indigo-700">Admins</span>,
              value: <span className="text-xl font-bold text-indigo-700">{adminCount}</span>,
            },
            {
              icon: <UserCheck className="h-5 w-5 text-green-500 mr-2" />,
              label: "Total Users",
              value: userStats?.totalUsers || 0,
            },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center">
                {item.icon}
                <span className="text-gray-600">{item.label}</span>
              </div>
              <span className="font-bold text-lg">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

UserStatistics.displayName = "UserStatistics";
