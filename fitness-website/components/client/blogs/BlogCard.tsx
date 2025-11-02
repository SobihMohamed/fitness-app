"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";
import type { BlogCardProps } from "@/types";
import { clientBlogApi } from "@/lib/api/client-blogs";

const BlogCard = React.memo<BlogCardProps>(({ 
  blog,
  categoryName,
  featured = false,
  onCategoryClick
}) => {
  const displayCategoryName = categoryName || blog.categoryName || "General";
  const [imageOk, setImageOk] = React.useState(true);
  const imageSrc = React.useMemo(() => clientBlogApi.getImageUrl(blog.featuredImage) || null, [blog.featuredImage]);
  const safeDate = React.useMemo(() => {
    const val = blog.createdAt as any;
    if (!val) return 'Recently';
    const tryFmt = (s: string) => {
      const d = new Date(s);
      return isNaN(d.getTime()) ? null : d.toLocaleDateString();
    };
    // direct
    let out = tryFmt(String(val));
    if (out) return out;
    // try space to T (e.g., '2024-11-02 15:10:00')
    out = tryFmt(String(val).replace(' ', 'T'));
    if (out) return out;
    return 'Recently';
  }, [blog.createdAt]);

  return (
    <Card
      className={`overflow-hidden group bg-white border border-gray-100 hover:border-gray-200 rounded-2xl transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1 ${
        featured ? "mb-16" : ""
      }`}
    >
      <div className={featured ? "relative" : "md:flex"}>
        <div className={featured ? "h-64" : "md:w-2/5"}>
          <div className={`${featured ? "h-64" : "h-48 md:h-52"} bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center relative overflow-hidden`}>
            {imageSrc && imageOk ? (
              <img
                src={imageSrc}
                alt={blog.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  // prevent infinite error loops by switching to a 1x1 transparent data URI
                  setImageOk(false);
                  try {
                    (e.currentTarget as HTMLImageElement).src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
                  } catch {}
                }}
              />
            ) : (
              <BookOpen className={`${featured ? "h-16 w-16" : "h-12 w-12"} text-primary`} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent" />
          </div>
        </div>
        <div className={featured ? "absolute top-6 left-6" : "md:w-3/5 p-6"}>
          {featured && (
            <Badge className="bg-primary text-white border-0 px-4 py-2 text-sm font-medium">
              {displayCategoryName}
            </Badge>
          )}
        </div>
        {!featured && (
          <div className="md:w-3/5 p-6">
            <div className="mb-4">
              <Badge className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 text-sm font-medium">
                {displayCategoryName}
              </Badge>
            </div>

            <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-blue-700 transition-colors duration-200 line-clamp-2 leading-tight">
              {blog.title}
            </h3>

            <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
              {blog.excerpt}
            </p>

            <div className="flex items-center gap-3 text-gray-600 mb-6">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <span className="font-medium">
                {safeDate}
              </span>
            </div>

            <div className="flex gap-3">
              <Link href={`/blog/${blog.id}`} className="flex-1">
                <Button
                  variant="outline"
                  className="w-full border-gray-200 text-blue-700  font-medium py-2 group bg-white"
                >
                  Read Article
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              {blog.videoUrl && (
                <Link href={`/blog/${blog.id}?watch=1#video`}>
                  <Button className="font-medium py-2 px-6 group bg-primary text-white">
                    Watch
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
});

BlogCard.displayName = "BlogCard";

export default BlogCard;

