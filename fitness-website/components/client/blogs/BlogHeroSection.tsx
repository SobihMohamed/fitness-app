"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";
import type { BlogHeroSectionProps } from "@/types";
import { clientBlogApi } from "@/lib/api/client-blogs";

const BlogHeroSection = React.memo<BlogHeroSectionProps>(({ 
  featuredPost, 
  onCategoryClick 
}) => {
  const [imageOk, setImageOk] = React.useState(true);
  const imageSrc = React.useMemo(
    () => (featuredPost ? clientBlogApi.getImageUrl(featuredPost.featuredImage) : null),
    [featuredPost?.featuredImage]
  );
  return (
    <>
      {/* Hero Section */}
      <section className="py-12 lg:py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors mb-4 px-4 py-1 text-sm font-medium">
            Latest Insights
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-foreground">
            Fitness{" "}
            <span className="text-primary bg-clip-text bg-gradient-to-r from-primary to-primary/80">
              Blog
            </span>
          </h1>
          <p className="text-xl max-w-3xl mx-auto text-muted leading-relaxed">
            Discover expert insights, industry trends, and practical guides to help you stay ahead
          </p>
        </div>
      </section>

      {/* Featured Post Section */}
      {featuredPost && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Featured Article
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-primary mx-auto rounded-full"></div>
            </div>
            <Card className="overflow-hidden group bg-white border border-gray-100 hover:border-gray-200 rounded-2xl transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1">
              <div className="relative">
                <div className="h-64 bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center overflow-hidden relative">
                  {imageSrc && imageOk ? (
                    <img
                      src={imageSrc}
                      alt={featuredPost.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        setImageOk(false);
                        try {
                          (e.currentTarget as HTMLImageElement).src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
                        } catch {}
                      }}
                    />
                  ) : (
                    <div className="text-center">
                      <BookOpen className="h-16 w-16 text-primary mx-auto mb-3" />
                      <p className="text-gray-600 font-medium">
                        Featured Article
                      </p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
                </div>
                <CardContent className="p-8">
                  <div className="mb-4">
                    <Badge className="bg-primary text-white border-0 px-4 py-2 text-sm font-medium">
                      {featuredPost.categoryName || "General"}
                    </Badge>
                  </div>
                  <h3 className="text-3xl font-bold mb-4 text-gray-900 group-hover:text-blue-700 transition-colors duration-300 leading-tight">
                    {featuredPost.title}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <span className="font-medium">
                        {featuredPost.createdAt && !isNaN(new Date(featuredPost.createdAt).getTime())
                          ? new Date(featuredPost.createdAt).toLocaleDateString()
                          : 'Recently'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Link
                      href={`/blog/${featuredPost.id}`}
                      className="flex-1"
                    >
                      <Button
                        size="lg"
                        className="w-full font-medium py-3 group shadow-sm hover:shadow-md transition-all duration-300 bg-primary text-white"
                      >
                        Read Full Article
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    {featuredPost.videoUrl && (
                      <Link href={`/blog/${featuredPost.id}?watch=1#video`}>
                        <Button
                          variant="outline"
                          size="lg"
                          className="border-gray-200 text-blue-700  font-medium py-3 px-6 group bg-white"
                        >
                          Watch Video
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </div>
            </Card>
          </div>
        </div>
      )}
    </>
  );
});

BlogHeroSection.displayName = "BlogHeroSection";

export default BlogHeroSection;

