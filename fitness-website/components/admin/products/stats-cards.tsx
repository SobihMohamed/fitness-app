"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Package, CheckCircle, Tag } from "lucide-react";

interface StatsCardsProps {
  totalProducts: number;
  inStockProducts: number;
  totalCategories: number;
}

export const StatsCards = React.memo<StatsCardsProps>(({
  totalProducts,
  inStockProducts,
  totalCategories,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-indigo-100 hover:shadow-xl transition-all duration-200">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-700 mb-1">
                Total Products
              </p>
              <p className="text-3xl font-bold text-indigo-900">
                {totalProducts}
              </p>
            </div>
            <div className="p-3 bg-indigo-200 rounded-full">
              <Package className="h-8 w-8 text-indigo-700" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-all duration-200">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 mb-1">
                In Stock
              </p>
              <p className="text-3xl font-bold text-blue-900">
                {inStockProducts}
              </p>
            </div>
            <div className="p-3 bg-blue-200 rounded-full">
              <CheckCircle className="h-8 w-8 text-blue-700" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-all duration-200">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700 mb-1">
                Categories
              </p>
              <p className="text-3xl font-bold text-purple-900">
                {totalCategories}
              </p>
            </div>
            <div className="p-3 bg-purple-200 rounded-full">
              <Tag className="h-8 w-8 text-purple-700" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

StatsCards.displayName = "StatsCards";
