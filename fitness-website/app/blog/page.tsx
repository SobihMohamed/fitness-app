"use client";

import React, { useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Card as SkeletonCard, CardContent as SkeletonCardContent, CardHeader as SkeletonCardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
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
    paginatedBlogs,
    featuredPost,
    categoryStats,
    currentPage,
    pageSize,
    totalPages,
    actions: {
      setSearchTerm,
      setSortBy,
      handleCategorySelect,
      setCurrentPage,
      setPageSize,
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
      <section className="py-16 bg-white">
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
            <>
              <BlogGrid
                blogs={paginatedBlogs}
                loading={loading}
                onCategoryClick={handleCategorySelect}
              />
              
              {filteredBlogs.length > 0 && (
                <UnifiedPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  totalItems={filteredBlogs.length}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={setPageSize}
                  pageSizeOptions={[6, 12, 18, 24]}
                  itemLabel="articles"
                />
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
});

BlogPage.displayName = "BlogPage";

// Unified Pagination Component
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
}

const UnifiedPagination = React.memo<PaginationProps>(({ currentPage, totalPages, pageSize, totalItems, onPageChange, onPageSizeChange, pageSizeOptions = [6, 12, 24, 48], itemLabel = "items" }) => {
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  }, [currentPage, totalPages]);

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  const handlePageSizeChange = useCallback((value: string) => onPageSizeChange(Number(value)), [onPageSizeChange]);

  if (totalPages <= 1 && totalItems <= pageSize) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-6 border-t border-gray-200">
      <div className="text-sm text-gray-600 font-medium">
        Showing <span className="text-gray-900 font-semibold">{startItem}</span> to <span className="text-gray-900 font-semibold">{endItem}</span> of <span className="text-gray-900 font-semibold">{totalItems}</span> {itemLabel}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="border-gray-300 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Prev</span>
        </Button>
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => (
            <React.Fragment key={page === "..." ? `ellipsis-${index}` : page}>
              {page === "..." ? (
                <div className="px-2 py-2"><MoreHorizontal className="w-4 h-4 text-gray-400" /></div>
              ) : (
                <Button variant={currentPage === page ? "default" : "outline"} size="sm" onClick={() => onPageChange(page as number)} className={`min-w-[36px] h-9 transition-all ${currentPage === page ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm" : "border-gray-300 hover:bg-blue-50 hover:border-blue-300"}`}>
                  {page}
                </Button>
              )}
            </React.Fragment>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="border-gray-300 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 transition-colors">
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Show:</span>
        <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
          <SelectTrigger className="w-24 h-9 border-gray-300 hover:border-blue-300 transition-colors">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map(size => (
              <SelectItem key={size} value={size.toString()}>{size}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
});

UnifiedPagination.displayName = "UnifiedPagination";

export default BlogPage;

