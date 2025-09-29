"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import BlogCard from "./BlogCard";
import { CardSkeleton } from "@/components/common/LoadingSkeletons";
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
          <CardSkeleton key={i} />
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
