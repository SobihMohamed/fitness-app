"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { toast } from "react-hot-toast";
import {
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Save,
  X,
  BookOpen,
  Video,
  Upload,
  Eye,
  Calendar,
  DollarSign,
  FileText,
  Link,
  Loader2,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  ExternalLink,
} from "lucide-react";

const API_BASE = "http://localhost:8000";

type Course = {
  course_id: string;
  title: string;
  price: string;
  image_url?: string;
  content: string;
  link?: string;
  description: string;
  created_at: string;
  admin_id: string;
};

export default function CoursesManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");
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
    content: "",
    link: "",
    description: "",
  });

  // Toast helpers
  const showSuccessToast = (message: string) => {
    toast.success(message, {
      duration: 4000,
      position: "top-right",
    });
  };

  const showErrorToast = (message: string) => {
    toast.error(message, {
      duration: 5000,
      position: "top-right",
    });
  };

  // Auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  };

  // Parse API response
  const parseResponse = async (res: Response) => {
    try {
      const text = await res.text();
      if (!text.trim()) return {};
      return JSON.parse(text);
    } catch (error) {
      console.warn("Failed to parse response as JSON:", error);
      return {};
    }
  };

  // Fetch courses
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/AdminCourses/getAll`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      console.log("Fetch Courses Response Status:", res.status);
      const data = await parseResponse(res);
      console.log("Fetch Courses Response Data:", data);

      if (res.ok && data) {
        const coursesArray = Array.isArray(data) ? data : data.courses || [];
        setCourses(coursesArray);
        console.log("Courses loaded:", coursesArray.length);
      } else {
        console.error("Failed to fetch courses:", data);
        showErrorToast("Failed to load courses");
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      showErrorToast("Network error while loading courses");
    } finally {
      setLoading(false);
    }
  };

  // Upload image
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("folder", "Courses");

    const response = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      headers: {
        Authorization: getAuthHeaders().Authorization,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    const data = await parseResponse(response);
    return data.image_url || data.url || data.path || "";
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

    if (!formData.content.trim()) {
      showErrorToast("Content is required");
      return;
    }

    try {
      setIsSubmitting(true);

      let imageUrl = formData.image_url;
      
      // Upload image if selected
      if (imageFile) {
        try {
          imageUrl = await uploadImage(imageFile);
          console.log("Image uploaded:", imageUrl);
        } catch (error) {
          console.error("Image upload failed:", error);
          showErrorToast("Failed to upload image");
          return;
        }
      }

      const requestBody = {
        title: formData.title.trim(),
        price: formData.price.trim(),
        image_url: imageUrl,
        content: formData.content.trim(),
        link: formData.link.trim(),
        description: formData.description.trim(),
      };

      console.log("Course request body:", requestBody);

      const endpoint = editingCourse
        ? `AdminCourses/updateCourse`
        : `AdminCourses/addCourse`;
      
      const method = editingCourse ? "POST" : "POST";

      // Add course ID for update
      if (editingCourse) {
        requestBody.course_id = editingCourse.course_id;
      }

      const res = await fetch(`${API_BASE}/${endpoint}`, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(requestBody),
      });

      console.log("API Response Status:", res.status, res.statusText);
      const data = await parseResponse(res);
      console.log("Parsed Response Data:", data);

      if (res.ok || res.status === 200) {
        const successMessage = editingCourse
          ? "Course updated successfully!"
          : "Course added successfully!";

        console.log("Showing success toast:", successMessage);
        setTimeout(() => showSuccessToast(successMessage), 100);

        await fetchCourses();
        setCurrentPage(1);
        setSearchTerm("");
        setPriceFilter("all");
        resetForm();
      } else {
        const errorMessage =
          data?.message ||
          data?.error ||
          `Failed to save. Server returned ${res.status}`;
        console.log("Showing error toast:", errorMessage);
        setTimeout(() => showErrorToast(errorMessage), 100);
      }
    } catch (err) {
      console.error("Network error:", err);
      showErrorToast(
        `Network error while saving: ${
          err instanceof Error ? err.message : "Please check your connection."
        }`
      );
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
      content: course.content || "",
      link: course.link || "",
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
      const res = await fetch(
        `${API_BASE}/AdminCourses/deleteCourse`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
          body: JSON.stringify({ course_id: deleteTarget.id }),
        }
      );

      const data = await parseResponse(res);
      console.log("Delete Response Status:", res.status, res.statusText);
      console.log("Delete Response Data:", data);

      if (res.ok || res.status === 200) {
        const successMessage = "Course deleted successfully!";
        console.log("Showing delete success toast:", successMessage);
        setTimeout(() => showSuccessToast(successMessage), 100);
        await fetchCourses();
      } else {
        const errorMessage =
          data?.message ||
          data?.error ||
          `Failed to delete. Server returned ${res.status}`;
        console.log("Showing delete error toast:", errorMessage);
        setTimeout(() => showErrorToast(errorMessage), 100);
      }
    } catch (err) {
      showErrorToast("Network error while deleting");
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
      content: "",
      link: "",
      description: "",
    });
    setEditingCourse(null);
    setIsAddDialogOpen(false);
    setImageFile(null);
    setImagePreview("");
  };

  // Filter courses
  const filteredCourses = () => {
    let filtered = courses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesPrice = true;
      if (priceFilter === "free") {
        matchesPrice = parseFloat(course.price) === 0;
      } else if (priceFilter === "paid") {
        matchesPrice = parseFloat(course.price) > 0;
      } else if (priceFilter === "low") {
        matchesPrice = parseFloat(course.price) <= 50;
      } else if (priceFilter === "high") {
        matchesPrice = parseFloat(course.price) > 50;
      }

      return matchesSearch && matchesPrice;
    });

    return filtered;
  };

  const totalPages = Math.ceil(filteredCourses().length / itemsPerPage);
  const paginatedCourses = filteredCourses().slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return numPrice === 0 ? "Free" : `$${numPrice.toFixed(2)}`;
  };

  // Load courses on mount
  useEffect(() => {
    fetchCourses();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-600">Loading courses...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-blue-600" />
              Courses Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your fitness courses, pricing, and content
            </p>
          </div>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add New Course
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Courses</p>
                  <p className="text-3xl font-bold text-gray-900">{courses.length}</p>
                </div>
                <BookOpen className="h-12 w-12 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Free Courses</p>
                  <p className="text-3xl font-bold text-green-600">
                    {courses.filter((c) => parseFloat(c.price) === 0).length}
                  </p>
                </div>
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Paid Courses</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {courses.filter((c) => parseFloat(c.price) > 0).length}
                  </p>
                </div>
                <DollarSign className="h-12 w-12 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Price</p>
                  <p className="text-3xl font-bold text-purple-600">
                    $
                    {courses.length > 0
                      ? (
                          courses.reduce((sum, c) => sum + parseFloat(c.price), 0) /
                          courses.length
                        ).toFixed(0)
                      : "0"}
                  </p>
                </div>
                <Video className="h-12 w-12 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filter Courses
            </CardTitle>
            <CardDescription>
              Find courses by title, description, or filter by price range
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search courses by title or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  <SelectItem value="free">Free Courses</SelectItem>
                  <SelectItem value="paid">Paid Courses</SelectItem>
                  <SelectItem value="low">Under $50</SelectItem>
                  <SelectItem value="high">Over $50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(searchTerm || priceFilter !== "all") && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Found {filteredCourses().length} courses
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setPriceFilter("all");
                  }}
                  className="h-6 px-2 text-xs"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Courses Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-16">#</TableHead>
                    <TableHead className="w-20">Image</TableHead>
                    <TableHead className="min-w-[200px]">Course Title</TableHead>
                    <TableHead className="w-24">Price</TableHead>
                    <TableHead className="min-w-[300px]">Description</TableHead>
                    <TableHead className="w-20">Link</TableHead>
                    <TableHead className="w-32">Created</TableHead>
                    <TableHead className="w-32 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCourses.map((course, index) => (
                    <TableRow key={course.course_id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </TableCell>
                      <TableCell>
                        {course.image_url ? (
                          <img
                            src={course.image_url}
                            alt={course.title}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{course.title}</p>
                          <p className="text-sm text-gray-500">ID: {course.course_id}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={parseFloat(course.price) === 0 ? "secondary" : "default"}
                          className={
                            parseFloat(course.price) === 0
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }
                        >
                          {formatPrice(course.price)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-gray-600 max-w-xs truncate">
                          {course.description}
                        </p>
                      </TableCell>
                      <TableCell>
                        {course.link ? (
                          <a
                            href={course.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="h-3 w-3" />
                          {formatDate(course.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(course)}
                            disabled={isSubmitting}
                            className="h-8 w-8 p-0 hover:bg-blue-50 hover:border-blue-200"
                          >
                            <Edit3 className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => confirmDelete(course)}
                            disabled={isSubmitting}
                            className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-200"
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
              {filteredCourses().length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm || priceFilter !== "all"
                      ? "No courses found"
                      : "No courses yet"}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || priceFilter !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : "Get started by adding your first course"}
                  </p>
                  {!searchTerm && priceFilter === "all" && (
                    <Button
                      onClick={() => setIsAddDialogOpen(true)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Your First Course
                    </Button>
                  )}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 p-4 border-t bg-gray-50">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <Button
                      key={i}
                      variant={currentPage === i + 1 ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(i + 1)}
                      className="w-10 h-10"
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
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {editingCourse ? "Edit Course" : "Add New Course"}
              </DialogTitle>
              <DialogDescription>
                {editingCourse
                  ? "Update the course information below."
                  : "Fill in the details to add a new course to your platform."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Course Title */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
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
                  />
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
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
                  />
                </div>

                {/* Link */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Course Link (Optional)
                  </label>
                  <Input
                    type="url"
                    placeholder="https://example.com/course"
                    value={formData.link}
                    onChange={(e) =>
                      setFormData({ ...formData, link: e.target.value })
                    }
                    disabled={isSubmitting}
                  />
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Course Image
                  </label>
                  <div className="space-y-3">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      disabled={isSubmitting}
                    />
                    {imagePreview && (
                      <div className="relative w-32 h-32">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover rounded border"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 p-0"
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
                <label className="text-sm font-medium text-gray-700">
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
                  rows={3}
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Course Content *
                </label>
                <Textarea
                  placeholder="Enter the detailed course content"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  required
                  disabled={isSubmitting}
                  rows={6}
                />
              </div>

              <DialogFooter className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
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
                Are you sure you want to delete the course "{deleteTarget?.name}"?
                This action cannot be undone.
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