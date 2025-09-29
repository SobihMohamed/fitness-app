"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit3, Trash2, BookOpen, ImageIcon, Plus } from "lucide-react";
import { API_CONFIG } from "@/config/api";
import type { Course } from "@/types";

interface CourseTableProps {
  courses: Course[];
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  onEdit: (course: Course) => void;
  onDelete: (courseId: string) => void;
  onPageChange: (page: number) => void;
  onOpenCreate: () => void;
  loading: boolean;
  searchTerm: string;
}

export const CourseTable = React.memo<CourseTableProps>(({
  courses,
  currentPage,
  itemsPerPage,
  totalPages,
  onEdit,
  onDelete,
  onPageChange,
  onOpenCreate,
  loading,
  searchTerm
}) => {
  const formatPrice = (price: string) => {
    const numPrice = Number.parseFloat(price);
    return numPrice === 0 ? "Free" : `${numPrice.toFixed(1)}EGP`;
  };

  if (courses.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-0">
          <div className="text-center py-12">
            <div className="p-4 bg-slate-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <BookOpen className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {searchTerm ? "No courses found" : "No courses yet"}
            </h3>
            <p className="text-slate-500 mb-5 max-w-md mx-auto">
              {searchTerm
                ? "Try adjusting your search criteria to find what you're looking for"
                : "Get started by adding your first course to the platform"}
            </p>
            {!searchTerm && (
              <Button
                onClick={onOpenCreate}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4" />
                Add Your First Course
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-slate-50 border-b border-slate-200">
                <TableHead className="w-16 font-semibold text-slate-700 px-4 py-2.5">
                  ID
                </TableHead>
                <TableHead className="w-2 font-semibold text-slate-700 px-4 py-2.5">
                  Image
                </TableHead>
                <TableHead className="w-2 font-semibold text-slate-700 px-4 py-2.5">
                  Course Title
                </TableHead>
                <TableHead className="w-2 font-semibold text-slate-700 px-4 py-2.5">
                  Price
                </TableHead>
                <TableHead className="w-24 text-center font-semibold text-slate-700 px-4 py-2.5">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course, index) => (
                <TableRow
                  key={course.course_id}
                  className="hover:bg-slate-50 transition-colors duration-150 border-b border-slate-100 align-middle"
                >
                  <TableCell className="font-medium text-slate-600 px-4 py-3">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {course.image_url ? (
                      <img
                        src={`${API_CONFIG.BASE_URL}${course.image_url}`}
                        alt={course.title}
                        className="w-14 h-14 object-cover rounded-lg shadow-sm"
                      />
                    ) : (
                      <div className="w-14 h-14 bg-slate-100 rounded-lg flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-slate-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <p className="font-semibold text-slate-900 mb-1">
                      <Link 
                        href={`/admin/courses/${course.course_id}`} 
                        className="text-indigo-700 hover:text-indigo-900 underline-offset-2 hover:underline"
                      >
                        {course.title}
                      </Link>
                    </p>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge
                      variant={
                        Number.parseFloat(course.price) === 0
                          ? "secondary"
                          : "default"
                      }
                      className={
                        Number.parseFloat(course.price) === 0
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                          : "bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                      }
                    >
                      {formatPrice(course.price)}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center">
                    <div className="inline-flex items-center gap-2">
                      <Link 
                        href={`/admin/courses/${course.course_id}`} 
                        className="h-9 px-3 inline-flex items-center justify-center rounded-md border text-sm hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-150"
                      >
                        Manage
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(course)}
                        disabled={loading}
                        className="h-9 w-9 p-0 hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-150"
                      >
                        <Edit3 className="h-4 w-4 text-indigo-600" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(course.course_id)}
                        disabled={loading}
                        className="h-9 w-9 p-0 hover:bg-red-50 hover:border-red-200 transition-all duration-150"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 p-4 border-t bg-slate-50">
              {Array.from({ length: totalPages }, (_, i) => (
                <Button
                  key={i}
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(i + 1)}
                  disabled={loading}
                  className={`w-10 h-10 ${
                    currentPage === i + 1
                      ? "bg-indigo-600 hover:bg-indigo-700"
                      : "hover:bg-slate-100"
                  }`}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

CourseTable.displayName = "CourseTable";
