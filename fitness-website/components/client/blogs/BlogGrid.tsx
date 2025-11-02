"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import BlogCard from "./BlogCard";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { BlogGridProps } from "@/types";

const BlogGrid = React.memo<BlogGridProps>(({
  blogs,
  loading = false,
  featured = false,
  onCategoryClick
}) => {
  if (loading) {
    return (
      <div className="grid gap-8">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="border-0 shadow-md bg-white">
            <CardHeader className="p-0">
              <Skeleton className="w-full h-48 rounded-t-lg" />
            </CardHeader>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-10 w-32" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <BookOpen className="h-12 w-12 text-blue-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          No Articles Available
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
          No blog articles are currently available. Please check back later or contact support if this issue persists.
        </p>
        <Button
          className="bg-gradient-to-r from-blue-600 text-white"
        >
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-8">
      {blogs.map((blog) => (
        <BlogCard
          key={blog.id}
          blog={blog}
          featured={featured}
          onCategoryClick={onCategoryClick}
        />
      ))}
    </div>
  );
});

BlogGrid.displayName = "BlogGrid";

export default BlogGrid;
