"use client";

import React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowLeft, BookOpen, AlertCircle, Play } from "lucide-react";
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

  const onWatchClick = () => {
    setWatchRequested(true);
    setShowVideoModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="h-8 w-32 mb-6 bg-gray-200 animate-pulse rounded" />
          <div className="h-12 w-3/4 mb-4 bg-gray-200 animate-pulse rounded" />
          <div className="h-6 w-1/2 mb-8 bg-gray-200 animate-pulse rounded" />
          <div className="h-64 w-full mb-8 bg-gray-200 animate-pulse rounded-lg" />
          <div className="h-6 w-2/3 mb-2 bg-gray-200 animate-pulse rounded" />
          <div className="h-6 w-1/2 bg-gray-200 animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
        <Card className="shadow-xl max-w-md mx-auto border border-gray-100 rounded-2xl">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Blog Post Not Found
            </h2>
            <p className="text-muted-foreground mb-4">
              {error || "The blog post you're looking for doesn't exist."}
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => router.back()} variant="outline" className="border-gray-200 text-blue-700 hover:bg-gray-50">
                Go Back
              </Button>
              <Link href="/blog">
                <Button className="bg-primary text-white">Browse All Blogs</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
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
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <span className="font-medium text-lg">
                {formatDate(blog.createdAt)}
              </span>
            </div>
            {blog.excerpt && (
              <p className="text-lg text-gray-600 mb-8 leading-relaxed font-medium">
                {blog.excerpt}
              </p>
            )}
            {blog.videoUrl && (
              <Button
                className="font-medium py-3 px-6 group bg-primary text-white"
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

      {/* Inline Video removed: video opens only in modal when clicking Watch */}

      <AnimatePresence>
        {showVideoModal && blog?.videoUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowVideoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="bg-white border border-gray-100 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="aspect-video w-full bg-primary/5">
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
                  onClick={() => setShowVideoModal(false)}
                  className="border-gray-200 text-blue-700 hover:bg-gray-50"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
