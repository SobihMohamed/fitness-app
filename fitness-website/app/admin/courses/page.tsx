"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminLayout } from "@/components/admin/admin-layout";
import { useAdminApi } from "@/hooks/admin/use-admin-api";
import { getHttpClient } from "@/lib/http";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Save,
  X,
  BookOpen,
  DollarSign,
  Loader2,
  ImageIcon,
  AlertCircle,
  ExternalLink,
  TrendingUp,
} from "lucide-react";

import { API_CONFIG } from "@/config/api";
 

const { BASE_URL: API_BASE } = API_CONFIG;

type Course = {
  course_id: string;
  title: string;
  price: string;
  image_url?: string;
  content_link?: string;
  description: string;
};

export default function CoursesManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  // local loading flags only
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    image_url: "",
    description: "",
  });

  const { getAuthHeaders, parseResponse, showSuccessToast, showErrorToast } = useAdminApi();
  const http = getHttpClient();

 

  // Fetch courses
  const fetchCourses = async () => {
    try {
      const { data } = await http.get(`${API_BASE}/AdminCourses/getAll`, {
        headers: getAuthHeaders(),
      });
      const coursesArray = Array.isArray(data) ? data : data?.data || [];
      setCourses(coursesArray);
    } catch (error: any) {
      if (error?.status === 404) { setCourses([]); return; }
      showErrorToast(error?.message || "Network error while loading courses");
    }
  };

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showErrorToast("Image size should be less than 5MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showErrorToast("Course title is required");
      return;
    }
    if (!formData.price.trim()) {
      showErrorToast("Price is required");
      return;
    }
    if (!formData.description.trim()) {
      showErrorToast("Description is required");
      return;
    }
    try {
      setIsSubmitting(true);
      const requestFormData = new FormData();
      requestFormData.append("title", formData.title.trim());
      requestFormData.append("price", formData.price.trim());
      requestFormData.append("image_url", formData.image_url.trim());
      requestFormData.append("description", formData.description.trim());

      if (imageFile) {
        requestFormData.append("image_url", imageFile);
      }

      const endpoint = editingCourse
        ? `${API_BASE}/AdminCourses/updateCourse/${editingCourse.course_id}`
        : `${API_BASE}/AdminCourses/addCourse`;

      await http.post(endpoint, requestFormData, {
        headers: { Authorization: getAuthHeaders().Authorization },
      });

      const successMessage = editingCourse
        ? "Course updated successfully!"
        : "Course added successfully!";
      showSuccessToast(successMessage);
      await fetchCourses();
      setCurrentPage(1);
      setSearchTerm("");
      resetForm();
    } catch (err: any) {
      showErrorToast(err?.message || "Network error while saving");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit
  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title || "",
      price: course.price || "",
      image_url: course.image_url || "",
      description: course.description || "",
    });
    setImagePreview(course.image_url || "");
    setImageFile(null);
    setIsAddDialogOpen(true);
  };

  // Confirm delete
  const confirmDelete = (course: Course) => {
    setDeleteTarget({
      id: course.course_id,
      name: course.title,
    });
    setShowDeleteConfirm(true);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsSubmitting(true);
      await http.delete(`${API_BASE}/AdminCourses/deleteCourse/${deleteTarget.id}`, {
        headers: getAuthHeaders(),
      });
      showSuccessToast("Course deleted successfully!");
      await fetchCourses();
    } catch (err: any) {
      showErrorToast(err?.message || "Network error while deleting");
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      price: "",
      image_url: "",
      description: "",
    });
    setEditingCourse(null);
    setIsAddDialogOpen(false);
    setImageFile(null);
    setImagePreview("");
  };

  // Open create course dialog with a clean form (prevents stale edit data)
  const openCreateCourse = () => {
    setEditingCourse(null);
    setFormData({ title: "", price: "", image_url: "", description: "" });
    setImageFile(null);
    setImagePreview("");
    setIsAddDialogOpen(true);
  };

  // Debounce search to reduce work as user types
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchTerm(searchTerm), 250);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Filter courses (memoized)
  const filteredCourses = useMemo(() => {
    const st = debouncedSearchTerm.toLowerCase();
    if (!st) return courses;
    return courses.filter((course) => {
      const title = course.title?.toLowerCase() || "";
      const desc = course.description?.toLowerCase() || "";
      return title.includes(st) || desc.includes(st);
    });
  }, [courses, debouncedSearchTerm]);

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = currentPage * itemsPerPage;
    return filteredCourses.slice(start, end);
  }, [filteredCourses, currentPage, itemsPerPage]);

  const formatPrice = (price: string) => {
    const numPrice = Number.parseFloat(price);
    return numPrice === 0 ? "Free" : `${numPrice.toFixed(1)}EGP`;
  };

  // Load courses on mount
  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem("adminAuth");
        if (!token) {
          showErrorToast("Please login as admin to access this page");
          window.location.href = "/admin/login";
          return;
        }
        await fetchCourses();
      } finally {
        setInitialLoading(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // initialLoading handled by AdminLayout overlay only
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  initialLoading;

  

  return (
    <AdminLayout>
      <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 to-white min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-xl">
                <BookOpen className="h-8 w-8 text-indigo-600" />
              </div>
              Courses Management
            </h1>
            <p className="text-slate-600 mt-3 text-lg">
              Manage your fitness courses, pricing, and content with ease
            </p>
          </div>
          <Button
            onClick={openCreateCourse}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 text-base"
          >
            <Plus className="h-5 w-5" />
            Add New Course
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-indigo-100 hover:shadow-xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-indigo-700 mb-1">
                    Total Courses
                  </p>
                  <p className="text-3xl font-bold text-indigo-900">
                    {courses.length}
                  </p>
                </div>
                <div className="p-3 bg-indigo-200 rounded-full">
                  <BookOpen className="h-8 w-8 text-indigo-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 mb-1">
                    Premium Courses
                  </p>
                  <p className="text-3xl font-bold text-blue-900">
                    {
                      courses.filter((c) => Number.parseFloat(c.price) > 0)
                        .length
                    }
                  </p>
                </div>
                <div className="p-3 bg-blue-200 rounded-full">
                  <DollarSign className="h-8 w-8 text-blue-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700 mb-1">
                    Avg Price
                  </p>
                  <p className="text-3xl font-bold text-purple-900">
                    {courses.length > 0
                      ? (
                          courses.reduce(
                            (sum, c) => sum + Number.parseFloat(c.price),
                            0
                          ) / courses.length
                        ).toFixed(0)
                      : "0"}
                     <span> EGP</span>
                  </p>
                </div>
                <div className="p-3 bg-purple-200 rounded-full">
                  <TrendingUp className="h-8 w-8 text-purple-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Search className="h-5 w-5 text-indigo-600" />
              Search Courses
            </CardTitle>
            <CardDescription className="text-slate-600">
              Find courses by title or description
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <Input
                placeholder="Search courses by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-base border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            {searchTerm && (
              <div className="mt-4 flex items-center gap-3">
                <span className="text-sm text-slate-600">
                  Found {filteredCourses.length} courses
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchTerm("")}
                  className="h-7 px-3 text-xs hover:bg-slate-50"
                >
                  Clear Search
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Courses Table */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
              <TableRow className="bg-slate-50 border-b border-slate-200">
                    <TableHead className="w-16 font-semibold text-slate-700 px-6 py-3">
                      ID
                    </TableHead>
                    <TableHead className="w-24 font-semibold text-slate-700 px-6 py-3">
                      Image
                    </TableHead>
                    <TableHead className="min-w-[240px] font-semibold text-slate-700 px-6 py-3">
                      Course Title
                    </TableHead>
                    <TableHead className="w-28 font-semibold text-slate-700 px-6 py-3">
                      Price
                    </TableHead>
                    <TableHead className="min-w-[300px] font-semibold text-slate-700 px-6 py-3">
                      Description
                    </TableHead>
                    <TableHead className="w-40 text-center font-semibold text-slate-700 px-6 py-3">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCourses.map((course, index) => (
                    <TableRow
                      key={course.course_id}
                      className="hover:bg-slate-50 transition-colors duration-150 border-b border-slate-100 align-middle"
                    >
                      <TableCell className="font-medium text-slate-600 px-6 py-4">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        {course.image_url ? (
                          <img
                            src={`${API_BASE}${course.image_url}`}
                            alt={course.title}
                            className="w-14 h-14 object-cover rounded-lg shadow-sm"
                          />
                        ) : (
                          <div className="w-14 h-14 bg-slate-100 rounded-lg flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-slate-400" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-slate-900 mb-1">
                            <Link href={`/admin/courses/${course.course_id}`} className="text-indigo-700 hover:text-indigo-900 underline-offset-2 hover:underline">
                              {course.title}
                            </Link>
                          </p>
                        </div>
                      </TableCell>

                      <TableCell className="px-6 py-4">
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
                      <TableCell className="px-6 py-4">
                        <p className="text-sm text-slate-600 max-w-xs truncate">
                          {course.description}
                        </p>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-2">
                          <Link href={`/admin/courses/${course.course_id}`} className="h-9 px-3 inline-flex items-center justify-center rounded-md border text-sm hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-150">
                            Manage
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(course)}
                            disabled={isSubmitting}
                            className="h-9 w-9 p-0 hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-150"
                          >
                            <Edit3 className="h-4 w-4 text-indigo-600" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => confirmDelete(course)}
                            disabled={isSubmitting}
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

              {/* No results */}
              {filteredCourses.length === 0 && (
                <div className="text-center py-16">
                  <div className="p-4 bg-slate-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                    <BookOpen className="h-10 w-10 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    {searchTerm ? "No courses found" : "No courses yet"}
                  </h3>
                  <p className="text-slate-500 mb-6 max-w-md mx-auto">
                    {searchTerm
                      ? "Try adjusting your search criteria to find what you're looking for"
                      : "Get started by adding your first course to the platform"}
                  </p>
                  {!searchTerm && (
                    <Button
                      onClick={() => setIsAddDialogOpen(true)}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Plus className="h-4 w-4" />
                      Add Your First Course
                    </Button>
                  )}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 p-6 border-t bg-slate-50">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <Button
                      key={i}
                      variant={currentPage === i + 1 ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(i + 1)}
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

        {/* Add/Edit Dialog */}
        <Dialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) {
              // When dialog closes (via ESC, overlay click, or cancel), clear any editing state and form data
              setEditingCourse(null);
              setFormData({ title: "", price: "", image_url: "", description: "" });
              setImageFile(null);
              setImagePreview("");
            }
          }}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <BookOpen className="h-5 w-5 text-indigo-600" />
                </div>
                {editingCourse ? "Edit Course" : "Add New Course"}
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                {editingCourse
                  ? "Update the course information below."
                  : "Fill in the details to add a new course to your platform."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Course Title */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Course Title *
                  </label>
                  <Input
                    placeholder="Enter course title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                    disabled={isSubmitting}
                    className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Price *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    required
                    disabled={isSubmitting}
                    className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                

                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Course Image
                  </label>
                  <div className="space-y-3">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      disabled={isSubmitting}
                      className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    {imagePreview && (
                      <div className="relative w-32 h-32">
                        <img
                          src={
                            imagePreview.startsWith("/uploads")
                              ? `${API_BASE}${imagePreview}`
                              : imagePreview
                          }
                          alt="Preview"
                          className="w-full h-full object-cover rounded-lg border shadow-sm"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-white shadow-md"
                          onClick={() => {
                            setImagePreview("");
                            setImageFile(null);
                            setFormData({ ...formData, image_url: "" });
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Course Description *
                </label>
                <Textarea
                  placeholder="Enter a brief description of the course"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                  disabled={isSubmitting}
                  rows={4}
                  className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <DialogFooter className="flex gap-3 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={isSubmitting}
                  className="px-6 bg-transparent"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-6"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {editingCourse ? "Updating..." : "Adding..."}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {editingCourse ? "Update Course" : "Add Course"}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                Confirm Deletion
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the course "{deleteTarget?.name}
                "? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete Course
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
