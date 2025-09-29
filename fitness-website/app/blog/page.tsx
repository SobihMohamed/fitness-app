"use client";

import React, { useCallback } from "react";
import dynamic from "next/dynamic";
import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/common/LoadingSkeletons";
import type { BlogPageProps } from "@/types";
import { useBlogsData } from "@/hooks/client/use-blogs-data";

// Dynamic imports to prevent hydration mismatches
const BlogHeroSection = dynamic(
  () => import("@/components/client/blogs/BlogHeroSection"),
  { 
    ssr: false,
    loading: () => <div className="h-96 bg-gradient-to-b from-white to-gray-50 animate-pulse" />
  }
);

const BlogFilterSection = dynamic(
  () => import("@/components/client/blogs/BlogFilterSection"),
  { 
    ssr: false,
    loading: () => <div className="h-32 bg-gray-50 animate-pulse" />
  }
);

const BlogGrid = dynamic(
  () => import("@/components/client/blogs/BlogGrid"),
  { 
    ssr: false,
    loading: () => (
      <div className="grid gap-8">
        {[...Array(3)].map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    )
  }
);

const BlogPage = React.memo<BlogPageProps>(() => {
  const {
    blogs,
    categories,
    loading,
    error,
    selectedCategory,
    searchTerm,
    sortBy,
    filteredBlogs,
    featuredPost,
    categoryStats,
    actions: {
      setSearchTerm,
      setSortBy,
      handleCategorySelect,
      refresh
    }
  } = useBlogsData();

  // Handle category selection by ID (for backward compatibility)
  const handleCategorySelectById = useCallback((categoryId: string, categoryName: string) => {
    handleCategorySelect(categoryId);
  }, [handleCategorySelect]);
  
  // Refresh blog data
  const handleRefresh = useCallback(async () => {
    try {
      await refresh();
    } catch (error) {
      console.error('Error refreshing blog data:', error);
    }
  }, [refresh]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Hero Skeleton */}
        <section className="relative py-20 bg-gradient-to-br from-muted/30 via-background to-muted/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="h-12 w-64 mx-auto mb-6 bg-gray-200 animate-pulse rounded" />
            <div className="h-16 w-96 mx-auto mb-6 bg-gray-200 animate-pulse rounded" />
            <div className="h-6 w-full max-w-3xl mx-auto mb-8 bg-gray-200 animate-pulse rounded" />
          </div>
        </section>

        {/* Search and Filters Skeleton */}
        <section className="py-8 bg-card/50 border-b border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <div className="h-12 w-full max-w-md bg-gray-200 animate-pulse rounded" />
              </div>
              <div className="flex gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 w-20 bg-gray-200 animate-pulse rounded" />
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-9 w-24 bg-gray-200 animate-pulse rounded" />
              ))}
            </div>
          </div>
        </section>

        {/* Content Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-5xl mx-auto space-y-8">
            {[...Array(3)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Unable to Load Blog Content</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <div className="space-y-3">
              <Button onClick={() => window.location.reload()} className="px-6">
                Retry Loading
              </Button>
              <p className="text-sm text-muted-foreground">
                Please check your internet connection or try again later
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {featuredPost && (
        <BlogHeroSection
          featuredPost={featuredPost}
          onCategoryClick={handleCategorySelect}
        />
      )}

      {/* Filter Section */}
      <BlogFilterSection
        selectedCategory={selectedCategory}
        searchTerm={searchTerm}
        sortBy={sortBy}
        categories={categoryStats}
        onCategoryChange={handleCategorySelect}
        onSearchChange={setSearchTerm}
        onSortChange={setSortBy}
        loading={loading}
      />

      {/* Blog Posts Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">
              {selectedCategory
                ? `Articles in ${selectedCategory}`
                : 'Latest Articles'}
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-blue-400 mx-auto rounded-full mb-4"></div>
            <p className="text-muted-foreground">
              {filteredBlogs.length} article{filteredBlogs.length !== 1 ? 's' : ''} found
            </p>
          </div>
          
          {filteredBlogs.length === 0 && !loading ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">
                {searchTerm || selectedCategory 
                  ? "No matching articles found" 
                  : "No articles available"}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
                {searchTerm || selectedCategory
                  ? "Try adjusting your search or filter criteria."
                  : "Check back later for new articles."}
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  handleCategorySelect("");
                  handleRefresh();
                }}
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                {searchTerm || selectedCategory ? "Clear Filters" : "Refresh"}
              </Button>
            </div>
          ) : (
            <BlogGrid
              blogs={filteredBlogs}
              loading={loading}
              onCategoryClick={handleCategorySelect}
            />
          )}
        </div>
      </section>
    </div>
  );
});

BlogPage.displayName = "BlogPage";

export default BlogPage;

