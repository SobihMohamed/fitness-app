"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Eye, Edit3 } from "lucide-react";
import type { StatsCardsProps } from "@/types";

export const StatsCards = React.memo(({ blogs }: StatsCardsProps) => {
  const totalBlogs = blogs.length;
  const publishedBlogs = blogs.filter((b) => b.status === "published").length;
  const archivedBlogs = blogs.filter((b) => b.status === "archived").length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
      <Card className="border-0 shadow-md hover:shadow-lg bg-gradient-to-br from-indigo-50 to-indigo-100 transition-all duration-300 rounded-xl overflow-hidden">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-700 mb-2">
                Total Blogs
              </p>
              <p className="text-4xl font-bold text-indigo-900">
                {totalBlogs}
              </p>
            </div>
            <div className="p-4 bg-white bg-opacity-50 rounded-full shadow-sm">
              <FileText className="h-8 w-8 text-indigo-700" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md hover:shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100 transition-all duration-300 rounded-xl overflow-hidden">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700 mb-2">
                Published
              </p>
              <p className="text-4xl font-bold text-emerald-900">
                {publishedBlogs}
              </p>
            </div>
            <div className="p-4 bg-white bg-opacity-50 rounded-full shadow-sm">
              <Eye className="h-8 w-8 text-emerald-700" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md hover:shadow-lg bg-gradient-to-br from-amber-50 to-amber-100 transition-all duration-300 rounded-xl overflow-hidden">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-700 mb-2">
                Archived
              </p>
              <p className="text-4xl font-bold text-amber-900">
                {archivedBlogs}
              </p>
            </div>
            <div className="p-4 bg-white bg-opacity-50 rounded-full shadow-sm">
              <Edit3 className="h-8 w-8 text-amber-700" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

StatsCards.displayName = "StatsCards";
