"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
  isLoading?: boolean;
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  iconColor, 
  bgColor, 
  isLoading = false 
}: StatsCardProps) {
  if (isLoading) {
    return (
      <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className={`p-2 ${bgColor} rounded-lg animate-pulse`}>
              <div className="h-6 w-6 bg-gray-300 rounded" />
            </div>
            <div className="ml-4 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-20 animate-pulse" />
              <div className="h-6 bg-gray-300 rounded w-8 animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className={`p-2 ${bgColor} rounded-lg`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">
              {title}
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {value}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
