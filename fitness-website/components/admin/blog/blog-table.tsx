"use client";

import React, { useMemo, useState, useEffect } from "react";
import NextImage from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Edit3, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { getProxyImageUrl } from "@/lib/images";
import { formatDateUTC } from "@/utils/format";
import type { BlogTableProps } from "@/types";

export const BlogTable = React.memo(({
  blogs,
  categories,
  categoryTitleById,
  currentPage,
  itemsPerPage,
  totalPages,
  onEdit,
  onDelete,
  onPageChange,
  loading
}: BlogTableProps) => {
  // Memoize category title mapping
  const categoryTitleByIdMemo = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach((c) => {
      map[String(c.id)] = c.name;
    });
    return map;
  }, [categories]);

  // Memoize paginated blogs
  const paginatedBlogs = useMemo(() => {
    return blogs.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [blogs, currentPage, itemsPerPage]);

  // Memoize page numbers for pagination
  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 4) pages.push(-1); // Ellipsis

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (i > 1 && i < totalPages) pages.push(i);
      }

      if (currentPage < totalPages - 3) pages.push(-2); // Ellipsis
      if (totalPages > 1) pages.push(totalPages);
    }
    return pages;
  }, [currentPage, totalPages]);

  if (loading) {
    return (
      <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden bg-white">
        <CardHeader className="pb-4 bg-gradient-to-r from-indigo-50 to-white border-b border-slate-100">
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <FileText className="h-5 w-5 text-indigo-600" />
            </div>
            Blog Posts
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="flex items-center justify-center h-64">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden bg-white">
      <CardHeader className="pb-4 bg-gradient-to-r from-indigo-50 to-white border-b border-slate-100">
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <FileText className="h-5 w-5 text-indigo-600" />
          </div>
          Blog Posts
        </CardTitle>
        <CardDescription className="text-slate-600 mt-1">
          Manage your blog content and publications
        </CardDescription>
        <div className="mt-4 text-sm text-slate-500">
          {blogs.length > 0 && (
            <p>
              Showing {blogs.length}{" "}
              {blogs.length === 1 ? "blog" : "blogs"}
            </p>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 border-b border-slate-200">
                <TableHead className="font-semibold text-slate-700 py-4">
                  Blog Title
                </TableHead>
                <TableHead className="font-semibold text-slate-700 py-4">
                  Author
                </TableHead>
                <TableHead className="font-semibold text-slate-700 py-4">
                  Category
                </TableHead>
                <TableHead className="font-semibold text-slate-700 py-4 w-32 whitespace-nowrap">
                  Date
                </TableHead>
                <TableHead className="font-semibold text-slate-700 py-4 w-28">
                  Status
                </TableHead>
                <TableHead className="w-28 text-center font-semibold text-slate-700 py-4">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedBlogs.map((blog) => (
                <TableRow
                  key={blog.blog_id}
                  className="hover:bg-slate-50 transition-colors duration-150 border-b border-slate-100"
                >
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-16 rounded-md overflow-hidden border border-slate-200 bg-white shadow-sm flex-shrink-0">
                        <NextImage
                          src={
                            blog.main_image
                              ? getProxyImageUrl(String(blog.main_image))
                              : "/placeholder.svg"
                          }
                          alt={blog.title}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900 line-clamp-2">
                          {blog.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                          {blog.content
                            ? `${blog.content.slice(0, 60)}${
                                blog.content.length > 60 ? "..." : ""
                              }`
                            : ""}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-sm text-slate-700">
                    Admin
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge
                      variant="outline"
                      className="bg-slate-50 text-slate-700 border-slate-200"
                    >
                      {blog.category_id &&
                      categoryTitleByIdMemo[String(blog.category_id)]
                        ? categoryTitleByIdMemo[String(blog.category_id)]
                        : "Uncategorized"}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 text-sm text-slate-700 whitespace-nowrap w-32">
                    {formatDateUTC(blog.created_at)}
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge
                      variant={
                        blog.status === "published"
                          ? "default"
                          : "secondary"
                      }
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        blog.status === "published"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {blog.status === "published"
                        ? "Published"
                        : "Archived"}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 w-28">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(blog)}
                        className="h-9 w-9 p-0 rounded-lg hover:bg-blue-50 hover:border-blue-200"
                        aria-label="Edit blog"
                      >
                        <Edit3 className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(blog.blog_id)}
                        className="h-9 w-9 p-0 rounded-lg hover:bg-red-50 hover:border-red-200"
                        aria-label="Delete blog"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Empty states */}
          {blogs.length === 0 && (
            <div className="text-center py-16 px-4">
              <div className="p-5 bg-indigo-50 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <FileText className="h-12 w-12 text-indigo-300" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-3">
                No blogs available. Create your first blog now!
              </h3>
              <Button
                onClick={() => {/* Will be handled by parent */}}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-6 py-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
              >
                <FileText className="h-5 w-5" />
                Add Blog
              </Button>
            </div>
          )}
          {blogs.length > 0 && paginatedBlogs.length === 0 && (
            <div className="text-center py-12 px-4">
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                No blogs match your filters
              </h3>
              <p className="text-slate-500 mb-6">
                Try adjusting your search or filter criteria.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {/* Will be handled by parent */}}
                className="rounded-lg"
              >
                Clear Filters
              </Button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && paginatedBlogs.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-6 px-6 border-t bg-gradient-to-r from-white to-slate-50">
              <div className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-medium text-slate-700">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium text-slate-700">
                  {Math.min(
                    currentPage * itemsPerPage,
                    blogs.length
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium text-slate-700">
                  {blogs.length}
                </span>{" "}
                blogs
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="h-9 px-3 rounded-lg shadow-sm hover:shadow transition-all duration-200 border-slate-200"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <div className="flex items-center gap-1">
                  {pageNumbers.map((page, index) => {
                    if (page === -1 || page === -2) {
                      return (
                        <span key={`ellipsis-${index}`} className="text-slate-400 px-1">
                          ...
                        </span>
                      );
                    }
                    return (
                      <Button
                        key={page}
                        variant={
                          currentPage === page ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => onPageChange(page)}
                        className={`h-9 w-9 p-0 rounded-lg shadow-sm hover:shadow transition-all duration-200 ${
                          currentPage === page
                            ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                            : "hover:bg-slate-50 border-slate-200"
                        }`}
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="h-9 px-3 rounded-lg shadow-sm hover:shadow transition-all duration-200 border-slate-200"
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

BlogTable.displayName = "BlogTable";
