"use client";

import React, { useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/common/LoadingSkeletons";
import type { BlogPageProps } from "@/types";
import { useBlogsData } from "@/hooks/client/use-blogs-data";

// Lazy load heavy components for better performance
const BlogHeroSection = dynamic(
  () => import("@/components/client/blogs/BlogHeroSection"),
  { 
    loading: () => <div className="h-96 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 animate-pulse rounded-lg" />
  }
);

const BlogFilterSection = dynamic(
  () => import("@/components/client/blogs/BlogFilterSection"),
  { 
    loading: () => <div className="h-32 bg-gray-100 animate-pulse rounded-lg" />
  }
);

const BlogGrid = dynamic(
  () => import("@/components/client/blogs/BlogGrid"),
  { 
    loading: () => (
      <div className="grid gap-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-lg" />
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

  // Memoized handlers for better performance
  const handleCategorySelectById = useCallback((categoryId: string, categoryName: string) => {
    handleCategorySelect(categoryId);
  }, [handleCategorySelect]);
  
  const handleRefresh = useCallback(async () => {
    try {
      await refresh();
    } catch (error) {
      console.error('Error refreshing blog data:', error);
    }
  }, [refresh]);

  // Memoized calculations for better performance
  const hasValidData = useMemo(() => 
    blogs && categories && !loading,
    [blogs, categories, loading]
  );

  const blogStats = useMemo(() => ({
    totalBlogs: blogs?.length || 0,
    totalCategories: categories?.length || 0,
    filteredCount: filteredBlogs?.length || 0
  }), [blogs, categories, filteredBlogs]);

  // Show loading state with modern design
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-gray-700 text-lg font-medium">Loading blog content...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardContent className="p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Blog Content</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <Button onClick={handleRefresh} className="px-6 bg-blue-600 hover:bg-blue-700">
                Retry Loading
              </Button>
              <p className="text-sm text-gray-500">
                Please check your internet connection or try again later
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
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

