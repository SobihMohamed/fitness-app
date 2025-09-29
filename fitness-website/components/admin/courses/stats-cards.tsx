"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, DollarSign, TrendingUp } from "lucide-react";
import type { Course } from "@/types";

interface StatsCardsProps {
  courses: Course[];
}

export const StatsCards = React.memo<StatsCardsProps>(({ courses }) => {
  const totalCourses = courses.length;
  const premiumCourses = courses.filter((c) => Number.parseFloat(c.price) > 0).length;
  const avgPrice = totalCourses > 0
    ? (courses.reduce((sum, c) => sum + Number.parseFloat(c.price), 0) / totalCourses).toFixed(0)
    : "0";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-indigo-100 hover:shadow-xl transition-all duration-200">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-700 mb-1">
                Total Courses
              </p>
              <p className="text-3xl font-bold text-indigo-900">
                {totalCourses}
              </p>
            </div>
            <div className="p-3 bg-indigo-200 rounded-full">
              <BookOpen className="h-8 w-8 text-indigo-700" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-all duration-200">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 mb-1">
                Premium Courses
              </p>
              <p className="text-3xl font-bold text-blue-900">
                {premiumCourses}
              </p>
            </div>
            <div className="p-3 bg-blue-200 rounded-full">
              <DollarSign className="h-8 w-8 text-blue-700" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-all duration-200">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700 mb-1">
                Avg Price
              </p>
              <p className="text-3xl font-bold text-purple-900">
                {avgPrice}
                <span> EGP</span>
              </p>
            </div>
            <div className="p-3 bg-purple-200 rounded-full">
              <TrendingUp className="h-8 w-8 text-purple-700" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

StatsCards.displayName = "StatsCards";
