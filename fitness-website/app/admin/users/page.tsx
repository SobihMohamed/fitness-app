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
  Users,
  User,
  Shield,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Loader2,
  AlertTriangle,
  Eye,
  EyeOff,
  Mail,
  Phone,
  Calendar,
  MapPin,
} from "lucide-react";

const API_BASE = "http://localhost:8000";

type User = {
  user_id: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  address: string;
  country?: string; 
  user_type: string;
  created_at: string;
  is_active?: string; 
};

type Admin = {
  admin_id: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  role: string;
  user_type?: string;
  created_at: string;
  is_active?: string; 
};

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  // Log users and admins state after updates
  useEffect(() => {
    console.log("Current users state:", users);
  }, [users]);
  useEffect(() => {
    console.log("Current admins state:", admins);
  }, [admins]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<User | Admin | null>(null);
  const [editingType, setEditingType] = useState<"user" | "admin" | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    country: "", // Added country field
    password: "",
    user_type: "customer",
    role: "admin", // Only used for admins
  });
  const [showPassword, setShowPassword] = useState(false);

  // Confirmation dialog states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "user" | "admin";
    id: string;
    name: string;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const getAuthHeaders = () => {
    const token = localStorage.getItem("adminAuth");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  // Enhanced toast functions with better styling
  const showSuccessToast = (message: string) => {
    toast.success(message, {
      duration: 3000,
      style: {
        background: "linear-gradient(135deg, #10b981, #059669)",
        color: "#fff",
        fontWeight: "600",
        borderRadius: "12px",
        padding: "16px 20px",
        boxShadow: "0 10px 25px rgba(16, 185, 129, 0.3)",
      },
      iconTheme: {
        primary: "#fff",
        secondary: "#10b981",
      },
    });
  };

  const showErrorToast = (message: string) => {
    toast.error(message, {
      duration: 4000,
      style: {
        background: "linear-gradient(135deg, #ef4444, #dc2626)",
        color: "#fff",
        fontWeight: "600",
        borderRadius: "12px",
        padding: "16px 20px",
        boxShadow: "0 10px 25px rgba(239, 68, 68, 0.3)",
      },
      iconTheme: {
        primary: "#fff",
        secondary: "#ef4444",
      },
    });
  };

  // Flexible response parser for backend
  const parseResponse = async (response: Response) => {
    const text = await response.text();

    // Handle empty response
    if (!text || text.trim() === "") {
      return {
        status: response.ok ? "success" : "error",
        message: response.ok
          ? "Operation completed successfully"
          : "Operation failed",
      };
    }

    try {
      return JSON.parse(text);
    } catch {
      // If not JSON, treat as plain text message
      return {
        status: response.ok ? "success" : "error",
        message: text.trim() || (response.ok ? "Success" : "An error occurred"),
      };
    }
  };

  // Check if email already exists
  const checkEmailExists = (email: string, excludeId?: string): boolean => {
    const allEmails = [
      ...users.map((u) => ({ email: u.email, id: u.user_id })),
      ...admins.map((a) => ({ email: a.email, id: a.admin_id })),
    ];
    return allEmails.some(
      (item) =>
        item.email.toLowerCase() === email.toLowerCase() &&
        (!excludeId || item.id !== excludeId)
    );
  };

  // Phone uniqueness check
  const checkPhoneExists = (phone: string, excludeId?: string): boolean => {
    const allPhones = [
      ...users.map((u) => ({ phone: u.phone, id: u.user_id })),
      ...admins.map((a) => ({ phone: a.phone, id: a.admin_id })),
    ];
    return allPhones.some(
      (item) =>
        item.phone === phone &&
        (!excludeId || item.id !== excludeId)
    );
  };

  // Fetch users and admins
  useEffect(() => {
    fetchUsers();
    fetchAdmins();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/ManageUsers/getAllUsers`, {
        headers: getAuthHeaders(),
      });
      const data = await parseResponse(res);
      if (res.ok) {
        setUsers(data.data || data.users || []);
      } else {
        showErrorToast(data.message || "Failed to load users");
      }
    } catch (err) {
      showErrorToast("Network error while loading users");
    }
  };

  const fetchAdmins = async () => {
    try {
      const res = await fetch(`${API_BASE}/ManageAdmins/getAllAdmins`, {
        headers: getAuthHeaders(),
      });
      const data = await parseResponse(res);
      if (res.ok) {
        // Backend returns 'users' field for admins endpoint
        setAdmins(data.users || data.data || data.admins || []);
      } else {
        showErrorToast(data.message || "Failed to load admins");
      }
    } catch (err) {
      showErrorToast("Network error while loading admins");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Debug: Log form data at start
    console.log("=== FORM SUBMIT DEBUG ===");
    console.log("Current formData:", formData);
    console.log("editingItem:", editingItem);
    console.log("editingType:", editingType);
    console.log("isAddOperation:", !editingItem);

    // Validation
    if (!formData.name.trim()) {
      showErrorToast("Name is required");
      return;
    }
    if (!formData.email.trim()) {
      showErrorToast("Email is required");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showErrorToast("Please enter a valid email address");
      return;
    }
    if (!editingItem && !formData.password.trim()) {
      showErrorToast("Password is required for new users/admins");
      return;
    }

    // Check for duplicate email and phone
    const excludeId = editingItem
      ? editingType === "user"
        ? (editingItem as User).user_id
        : (editingItem as Admin).admin_id
      : undefined;
    if (!formData.phone.trim()) {
      showErrorToast("Phone number is required");
      return;
    }
    if (checkEmailExists(formData.email, excludeId)) {
      showErrorToast("An account with this email already exists");
      return;
    }
    if (checkPhoneExists(formData.phone, excludeId)) {
      showErrorToast("An account with this phone number already exists");
      return;
    }

    try {
      setIsSubmitting(true);

      let endpoint: string | undefined = undefined;
      let method: string | undefined = undefined;
      let requestBody: any = {};

      if (editingItem) {
        // Update existing user/admin
        if (editingType === "user") {
          endpoint = `ManageUsers/updateUser/${(editingItem as User).user_id}`;
          method = "PUT";
          requestBody = {
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            address: formData.address.trim(),
            country: formData.country.trim(), 
            user_type: formData.user_type,
            ...(formData.password.trim() && { password: formData.password }),
          };
        } else if (editingType === "admin") {
          endpoint = `admin/updateAdmin/${(editingItem as Admin).admin_id}`;
          method = "PUT";
          requestBody = {
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            role: formData.role,
            country: formData.country.trim(), 
            ...(formData.password.trim() && { password: formData.password }),
          };
        }
      } else {
        // Add new user/admin
        if (formData.user_type === "coach") {
          endpoint = "admin/addAdmin";
          method = "POST";
          requestBody = {
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim() || "",
            password: formData.password,
            role: formData.role || "admin",
            country: formData.country.trim(),
            user_type: "coach",
          };
        } else if (formData.user_type === "trainee") {
          endpoint = "ManageUsers/addUser";
          method = "POST";
          requestBody = {
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim() || "",
            address: formData.address.trim() || "",
            country: formData.country.trim() || "",
            password: formData.password,
            user_type: "trainee"
            // Do NOT send 'role' for users
          };
        }

        // Additional validation for add operations
        if (!requestBody.name || !requestBody.email || !requestBody.password) {
          showErrorToast(
            "Name, email, and password are required for new accounts"
          );
          setIsSubmitting(false);
          return;
        }

        // Ensure we don't send empty data object (backend validation issue)
        if (!requestBody || Object.keys(requestBody).length === 0) {
          showErrorToast(
            "Invalid form data. Please fill in all required fields."
          );
          setIsSubmitting(false);
          return;
        }

        // Remove any undefined or null values that could cause backend validation issues
        Object.keys(requestBody).forEach((key) => {
          if (requestBody[key] === undefined || requestBody[key] === null) {
            requestBody[key] = "";
          }
        });

        // Log the request body for debugging
        console.log("Final request body for add operation:", requestBody);
        console.log(
          "Request body is valid:",
          Object.keys(requestBody).length > 0
        );
      }

      if (!endpoint) {
        showErrorToast("Unexpected error: No API endpoint determined.");
        setIsSubmitting(false);
        return;
      }
      console.log("API Request:", {
        url: `${API_BASE}/${endpoint}`,
        method,
        headers: getAuthHeaders(),
        body: requestBody,
      });

      const res = await fetch(`${API_BASE}/${endpoint}`, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(requestBody),
      });

      console.log("API Response Status:", res.status, res.statusText);
      const data = await parseResponse(res);
      console.log("Parsed Response Data:", data);

      // Handle response - backend has missing return statements, so we need to be flexible
      if (res.ok || res.status === 200) {
        const successMessage = editingItem
          ? `${editingType === "user" ? "User " : "Admin"} updated successfully!`
          : `${
              formData.user_type === "admin" ? "Admin" : "User "
            } added successfully!`;

        console.log("Showing success toast:", successMessage);
        // Ensure toast appears with slight delay to handle any timing issues
        setTimeout(() => showSuccessToast(successMessage), 100);

        // Refresh data
        await fetchUsers();
        await fetchAdmins();
        setCurrentPage(1);
        setSearchTerm("");
        setSelectedType("all");
        resetForm();
      } else {
        const errorMessage =
          data?.message ||
          data?.error ||
          `Failed to save. Server returned ${res.status}`;
        console.log("Showing error toast:", errorMessage);
        // Ensure toast appears with slight delay to handle any timing issues
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

  const handleEdit = (item: User | Admin, type: "user" | "admin") => {
    setEditingItem(item);
    setEditingType(type);
    setFormData({
      name: item.name || "",
      email: item.email || "",
      phone: item.phone || "",
      address: type === "user" ? (item as User).address || "" : "",
      country: type === "user" ? (item as User).country || "" : "", 
      password: "",
      user_type:
        type === "user" ? (item as User).user_type || "customer" : "admin",
      role: type === "admin" ? (item as Admin).role || "admin" : "admin",
    });
    setIsAddDialogOpen(true);
  };

  const confirmDelete = (item: User | Admin, type: "user" | "admin") => {
    setDeleteTarget({
      type: type === "user" ? "user" : "admin",
      id: type === "user" ? (item as User).user_id : (item as Admin).admin_id,
      name: item.name,
    });
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setIsSubmitting(true);
      const endpoint =
        deleteTarget.type === "user"
          ? `ManageUsers/deleteUser/${deleteTarget.id}`
          : `admin/deleteAdmin/${deleteTarget.id}`;

      const res = await fetch(`${API_BASE}/${endpoint}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const data = await parseResponse(res);
      console.log("Delete Response Status:", res.status, res.statusText);
      console.log("Delete Response Data:", data);

      // Handle delete response - backend has missing return statements
      if (res.ok || res.status === 200) {
        const successMessage = `${
          deleteTarget.type === "user" ? "User " : "Admin"
        } deleted successfully!`;
        console.log("Showing delete success toast:", successMessage);
        // Ensure toast appears with slight delay to handle any timing issues
        setTimeout(() => showSuccessToast(successMessage), 100);
        await fetchUsers();
        await fetchAdmins();
      } else {
        const errorMessage =
          data?.message ||
          data?.error ||
          `Failed to delete. Server returned ${res.status}`;
        console.log("Showing delete error toast:", errorMessage);
        // Ensure toast appears with slight delay to handle any timing issues
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

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      country: "", 
      password: "",
      user_type: "customer",
      role: "admin",
    });
    setEditingItem(null);
    setEditingType(null);
    setIsAddDialogOpen(false);
    setShowPassword(false);
  };

  const filteredData = () => {
    let data: (User  | Admin)[] = [];
    if (selectedType === "all") {
      data = [...users, ...admins];
    } else if (selectedType === "users") {
      data = users;
    } else if (selectedType === "admins") {
      data = admins;
    }
    if (searchTerm) {
      data = data.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return data;
  };

  const totalPages = Math.ceil(filteredData().length / itemsPerPage);
  const paginatedData = filteredData().slice(
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

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <div className="text-lg text-gray-600">
              Loading users and admins...
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  console.log("filteredData:", filteredData());
  console.log("paginatedData:", paginatedData);

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              User Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your users and administrators
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-sm">
              {users.length} Users
            </Badge>
            <Badge variant="outline" className="text-sm">
              {admins.length} Admins
            </Badge>
          </div>
        </div>

        {/* Management Section */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-blue-600" />
                <CardTitle className="text-xl">
                  User & Admin Management
                </CardTitle>
              </div>
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Plus className="h-4 w-4" />
                Add New
              </Button>
            </div>
            <CardDescription>
              Manage user accounts and administrator access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search and Filter Bar */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users or admins..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={selectedType}
                onValueChange={(val) => setSelectedType(val)}
              >
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users & Admins</SelectItem>
                  <SelectItem value="users">Users Only</SelectItem>
                  <SelectItem value="admins">Admins Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role/Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-32">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((item) => {
                    const isUser  = "user_id" in item;
                    return (
                      <TableRow
                        key={isUser  ? item.user_id : item.admin_id}
                        className="hover:bg-gray-50"
                      >
                        <TableCell>
                          <Badge
                            variant={isUser  ? "outline" : "default"}
                            className={`text-xs ${
                              isUser 
                                ? "border-blue-200 text-blue-700 bg-blue-50"
                                : "bg-indigo-100 text-indigo-700 border-indigo-200"
                            }`}
                          >
                            {isUser  ? (
                              <User  className="h-3 w-3 mr-1" />
                            ) : (
                              <Shield className="h-3 w-3 mr-1" />
                            )}
                            {isUser  ? "User " : "Admin"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-gray-900">
                            {item.name}
                          </div>
                          {isUser  && (item as User).address && (
                            <div className="text-sm text-gray-500 truncate max-w-xs flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {(item as User).address}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-gray-400" />
                            <span className="text-sm">{item.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <span className="text-sm">
                              {item.phone || "N/A"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {isUser 
                              ? (item as User).user_type
                              : (item as Admin).role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              item.is_active === "1" ? "default" : "secondary"
                            }
                            className={`text-xs ${
                              item.is_active === "1"
                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                : "bg-red-100 text-red-800 hover:bg-red-200"
                            }`}
                          >
                            {item.is_active === "1" ? (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <AlertCircle className="h-3 w-3 mr-1" />
                            )}
                            {item.is_active === "1" ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <span className="text-sm">
                              {formatDate(item.created_at)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleEdit(item, isUser  ? "user" : "admin")
                              }
                              disabled={isSubmitting}
                              className="h-8 w-8 p-0"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                confirmDelete(item, isUser  ? "user" : "admin")
                              }
                              disabled={isSubmitting}
                              className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-200"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* No results */}
              {filteredData().length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm || selectedType !== "all"
                      ? "No users or admins found"
                      : "No users or admins yet"}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || selectedType !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : "Get started by adding your first user or admin"}
                  </p>
                  {!searchTerm && selectedType === "all" && (
                    <Button
                      onClick={() => setIsAddDialogOpen(true)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Your First User
                    </Button>
                  )}
                </div>
              )}

              {/* Pagination Controls */}
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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {editingItem ? "Edit User/Admin" : "Add New User/Admin"}
              </DialogTitle>
              <DialogDescription>
                {editingItem
                  ? "Update the user or admin information below."
                  : "Fill in the details to add a new user or admin to your system."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Username */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Username *
                  </label>
                  <Input
                    placeholder="Enter username"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    disabled={isSubmitting}
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Email *
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    disabled={isSubmitting}
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <Input
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    disabled={isSubmitting}
                  />
                </div>

                {/* Country */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Country
                  </label>
                  <Input
                    placeholder="Enter country"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    disabled={isSubmitting}
                  />
                </div>

                {/* User Type (only for new users) */}
                {!editingItem && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Type *
                    </label>
                    <Select
                      value={formData.user_type}
                      onValueChange={(val) =>
                        setFormData({ ...formData, user_type: val })
                      }
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="coach">Coach</SelectItem>
                        <SelectItem value="trainee">Trainee</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Role (for admins) */}
                {(formData.user_type === "admin" ||
                  editingType === "admin") && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Role
                    </label>
                    <Select
                      value={formData.role}
                      onValueChange={(val) =>
                        setFormData({ ...formData, role: val })
                      }
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {editingItem
                      ? "New Password (leave blank to keep current)"
                      : "Password *"}
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder={
                        editingItem ? "Enter new password" : "Enter password"
                      }
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required={!editingItem}
                      disabled={isSubmitting}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Address (only for users) */}
              {formData.user_type !== "admin" && editingType !== "admin" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <Textarea
                    rows={2}
                    placeholder="Enter address..."
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    disabled={isSubmitting}
                  />
                </div>
              )}

              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {isSubmitting
                    ? editingItem
                      ? "Saving..."
                      : "Adding..."
                    : editingItem
                    ? "Save Changes"
                    : "Add User/Admin"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Confirm Deletion
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Are you sure you want to delete "{deleteTarget?.name}"? This
                action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteTarget(null);
                }}
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
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
