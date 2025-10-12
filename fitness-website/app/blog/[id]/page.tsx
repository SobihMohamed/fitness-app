"use client";

import React, { useCallback, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowLeft, BookOpen, AlertCircle, Play, Loader2 } from "lucide-react";
import Link from "next/link";
import { useBlogDetails } from "@/hooks/client/use-blog-details";

const BlogPostPage = React.memo(() => {
  const router = useRouter();
  const routeParams = useParams();
  const query = useSearchParams();
  const blogId = (routeParams?.id as string) || "";
  const shouldAutoWatch = query.get("watch") === "1";
  
  const {
    blog,
    relatedBlogs,
    loading,
    error,
    showVideoModal,
    watchRequested,
    getCategoryName,
    getImageUrl,
    formatDate,
    renderVideo,
    setShowVideoModal,
    setWatchRequested,
  } = useBlogDetails(blogId, shouldAutoWatch);

  // Memoized handlers for better performance
  const onWatchClick = useCallback(() => {
    setWatchRequested(true);
    setShowVideoModal(true);
  }, [setWatchRequested, setShowVideoModal]);

  const handleBackClick = useCallback(() => {
    router.push("/blog");
  }, [router]);

  const handleCloseModal = useCallback(() => {
    setShowVideoModal(false);
  }, [setShowVideoModal]);

  // Memoized calculations
  const blogStats = useMemo(() => ({
    hasVideo: !!blog?.videoUrl,
    hasContent: !!blog?.content,
    hasRelated: relatedBlogs.length > 0,
    categoryName: blog ? getCategoryName(blog.categoryId) : '',
    formattedDate: blog ? formatDate(blog.createdAt) : ''
  }), [blog, relatedBlogs, getCategoryName, formatDate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-20">
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-gray-700 text-lg font-medium">Loading blog post...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-20 flex items-center justify-center">
        <Card className="shadow-2xl max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Blog Post Not Found
            </h2>
            <p className="text-gray-600 mb-4">
              {error || "The blog post you're looking for doesn't exist."}
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => router.back()} variant="outline" className="border-gray-200 text-blue-700 hover:bg-gray-50">
                Go Back
              </Button>
              <Link href="/blog">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">Browse All Blogs</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/blog")}
          className="px-0 text-blue-700 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to articles
        </Button>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="overflow-hidden bg-white border border-gray-100 rounded-2xl shadow-xl">
          <div className="relative h-[400px] bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
            {blog.featuredImage ? (
              <img
                src={getImageUrl(blog.featuredImage) || ""}
                alt={blog.title}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  try {
                    (e.currentTarget as HTMLImageElement).src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
                  } catch {}
                }}
              />
            ) : (
              <div className="text-center">
                <BookOpen className="h-20 w-20 text-primary mx-auto mb-4" />
                <p className="text-gray-600 font-medium text-lg">
                  Featured Article
                </p>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/0 to-transparent" />
            <div className="absolute top-6 left-6">
              <Badge className="bg-primary text-white border-0 px-4 py-2 text-sm font-medium">
                {getCategoryName(blog.categoryId)}
              </Badge>
            </div>
          </div>
          <CardContent className="p-8">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {blog.title}
            </h1>
            <div className="flex items-center gap-4 text-gray-600 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <span className="font-medium text-lg">
                {blogStats.formattedDate}
              </span>
            </div>
            {blog.excerpt && (
              <p className="text-lg text-gray-600 mb-8 leading-relaxed font-medium">
                {blog.excerpt}
              </p>
            )}
            {blogStats.hasVideo && (
              <Button
                className="font-medium py-3 px-6 group bg-blue-600 hover:bg-blue-700 text-white"
                onClick={onWatchClick}
              >
                <Play className="mr-2 h-4 w-4" />
                Watch Video
              </Button>
            )}
            {/* Blog Content */}
            {blog.content && (
              <div
                className="mt-10 text-gray-800 leading-7 space-y-4"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Video Modal */}
      {showVideoModal && blog?.videoUrl && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden">
            <div className="aspect-video w-full bg-blue-50">
              <iframe
                className="w-full h-full rounded-lg"
                src={renderVideo(blog.videoUrl, true)}
                title="Blog video"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            <div className="p-4 flex justify-end">
              <Button
                variant="outline"
                onClick={handleCloseModal}
                className="border-gray-200 text-blue-700 hover:bg-gray-50"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {relatedBlogs.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-3">
              Related Articles
            </h3>
            <div className="w-24 h-1 bg-gradient-to-r from-primary mx-auto rounded-full"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {relatedBlogs.map((p) => (
              <Card
                key={p.id}
                className="overflow-hidden group bg-white border border-gray-100 hover:border-gray-200 rounded-2xl transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1"
              >
                <div className="h-48 bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center overflow-hidden relative">
                  {p.featuredImage ? (
                    <img
                      src={getImageUrl(p.featuredImage) || ""}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        try {
                          (e.currentTarget as HTMLImageElement).src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
                        } catch {}
                      }}
                    />
                  ) : (
                    <BookOpen className="h-12 w-12 text-primary" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent" />
                </div>
                <CardContent className="p-6">
                  <div className="mb-3">
                    <Badge
                      variant="outline"
                      className="text-xs border-primary/20 text-primary bg-primary/10"
                    >
                      {getCategoryName(p.categoryId)}
                    </Badge>
                  </div>
                  <h4 className="font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-700 transition-colors">
                    {p.title}
                  </h4>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {p.excerpt}
                  </p>
                  <Link
                    href={`/blog/${p.id}`}
                    className="text-blue-700 hover:text-blue-800 font-medium transition-colors"
                  >
                    Read More →
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

BlogPostPage.displayName = "BlogPostPage";

export default BlogPostPage;
