"use client";
import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";

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
  Edit3,
  Trash2,
  Save,
  Users,
  Shield,
  Eye,
  EyeOff,
  Mail,
  Phone,
  Calendar,
  MapPin,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import Loading from "@/app/loading";
import { useLoading } from "@/hooks/use-loading";

const API_BASE = "http://localhost:8000";

type UserType = {
  user_id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  country?: string;
  user_type: string;
  created_at: string;
  is_active?: string;
};

type AdminType = {
  admin_id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  created_at: string;
  is_active?: string;
};

export default function UsersManagementWrapper() {
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("adminAuth");
    if (!token) {
      router.push("/admin/login");
    } else {
      setIsChecking(false);
    }
  }, [router]);
  if (isChecking) return <Loading variant="admin" size="lg" message="Loading users and administrators..." icon="users" className="h-[80vh]" />;
  return <UsersManagement />;
}

function UsersManagement() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [admins, setAdmins] = useState<AdminType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UserType | AdminType | null>(
    null
  );
  const [editingType, setEditingType] = useState<"user" | "admin" | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    country: "",
    password: "",
    user_type: "admin",
    role: "admin",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "user" | "admin";
    id: string;
    name: string;
  } | null>(null);
  const [selectedType, setSelectedType] = useState("admins");
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);

  // Enhanced loading states
  const { setLoading, isLoading, isAnyLoading, withLoading } = useLoading();

  // Add initial loading state
  const [initialLoading, setInitialLoading] = useState(true);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("adminAuth");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  // Enhanced toast helpers
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

  const parseResponse = async (response: Response) => {
    const text = await response.text();
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
      return {
        status: response.ok ? "success" : "error",
        message: text.trim() || (response.ok ? "Success" : "An error occurred"),
      };
    }
  };

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

  const checkPhoneExists = (phone: string, excludeId?: string): boolean => {
    const allPhones = [
      ...users.map((u) => ({ phone: u.phone, id: u.user_id })),
      ...admins.map((a) => ({ phone: a.phone, id: a.admin_id })),
    ];
    return allPhones.some(
      (item) => item.phone === phone && (!excludeId || item.id !== excludeId)
    );
  };

  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([fetchUsers(), fetchAdmins()]);
      } finally {
        setInitialLoading(false);
      }
    };

    initializeData();
  }, []);

  const fetchUsers = async () => {
    return withLoading("users", async () => {
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
    });
  };

  const fetchAdmins = async () => {
    return withLoading("admins", async () => {
      try {
        const res = await fetch(`${API_BASE}/ManageAdmins/getAllAdmins`, {
          headers: getAuthHeaders(),
        });
        const data = await parseResponse(res);
        if (res.ok) {
          setAdmins(data.users || data.data || data.admins || []);
        } else {
          showErrorToast(data.message || "Failed to load admins");
        }
      } catch (err) {
        showErrorToast("Network error while loading admins");
      }
    });
  };

  const filteredData = () => {
    const allData = [
      ...users.map((u) => ({ ...u, type: "user" as const })),
      ...admins.map((a) => ({ ...a, type: "admin" as const })),
    ];
    return allData.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType =
        (selectedType === "users" && item.type === "user") ||
        (selectedType === "admins" && item.type === "admin");
      return matchesSearch && matchesType;
    });
  };

  const totalPages = Math.ceil(filteredData().length / itemsPerPage);
  const paginatedData = filteredData().slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      showErrorToast("Password is required for new accounts");
      return;
    }

    const excludeId = editingItem
      ? editingType === "user"
        ? (editingItem as UserType).user_id
        : (editingItem as AdminType).admin_id
      : undefined;

    if (checkEmailExists(formData.email, excludeId)) {
      showErrorToast("An account with this email already exists");
      return;
    }

    if (formData.phone && checkPhoneExists(formData.phone, excludeId)) {
      showErrorToast("An account with this phone number already exists");
      return;
    }

    await withLoading("submit", async () => {
      try {
        let endpoint: string;
        let method: string;
        let requestBody: any = {};

        if (editingItem) {
          if (editingType === "user") {
            endpoint = `${API_BASE}/ManageUsers/updateUser/${
              (editingItem as UserType).user_id
            }`;
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
          } else {
            endpoint = `${API_BASE}/ManageAdmins/updateAdmin/${
              (editingItem as AdminType).admin_id
            }`;
            method = "PUT";
            requestBody = {
              name: formData.name.trim(),
              email: formData.email.trim(),
              phone: formData.phone.trim() || "",
              address: formData.address?.trim() || "",
              country: formData.country.trim(),
              role: formData.role,
              ...(formData.password.trim() && { password: formData.password }),
              is_super_admin: 1,
            };
          }
        } else {
          if (formData.user_type === "admin") {
            endpoint = `${API_BASE}/ManageAdmins/addAdmin`;
            method = "POST";
            requestBody = {
              name: formData.name.trim(),
              email: formData.email.trim(),
              phone: formData.phone.trim() || "",
              address: formData.address?.trim() || "",
              password: formData.password,
              country: formData.country.trim(),
              is_super_admin: 1,
            };
          } else {
            endpoint = `${API_BASE}/ManageUsers/addUser`;
            method = "POST";
            requestBody = {
              name: formData.name.trim(),
              email: formData.email.trim(),
              phone: formData.phone.trim() || "",
              address: formData.address.trim(),
              password: formData.password,
              country: formData.country.trim(),
              user_type: formData.user_type,
            };
          }
        }

        const res = await fetch(endpoint, {
          method,
          headers: getAuthHeaders(),
          body: JSON.stringify(requestBody),
        });

        const data = await parseResponse(res);

        if (res.ok || res.status === 200) {
          const successMessage = editingItem
            ? `${
                editingType === "user" ? "User" : "Admin"
              } updated successfully!`
            : `${
                formData.user_type === "admin" ? "Admin" : "User"
              } added successfully!`;
          showSuccessToast(successMessage);
          await Promise.all([fetchUsers(), fetchAdmins()]);
          resetForm();
        } else {
          showErrorToast(data?.message || "Failed to save");
        }
      } catch (err) {
        showErrorToast("Network error while saving");
      }
    });
  };

  const handleEdit = (item: any) => {
    const isUser = item.type === "user";
    setEditingItem(item);
    setEditingType(isUser ? "user" : "admin");
    setFormData({
      name: item.name || "",
      email: item.email || "",
      phone: item.phone || "",
      address: isUser ? item.address || "" : "",
      country: item.country || "",
      password: "",
      user_type: isUser ? item.user_type || "customer" : "admin",
      role: !isUser ? item.role || "admin" : "admin",
    });
    setIsAddDialogOpen(true);
  };

  const confirmDelete = (item: any) => {
    const isUser = item.type === "user";
    setDeleteTarget({
      type: isUser ? "user" : "admin",
      id: isUser ? item.user_id : item.admin_id,
      name: item.name,
    });
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    await withLoading("delete", async () => {
      try {
        const endpoint =
          deleteTarget.type === "user"
            ? `${API_BASE}/ManageUsers/deleteUser/${deleteTarget.id}`
            : `${API_BASE}/ManageAdmins/deleteAdmin/${deleteTarget.id}`;

        const res = await fetch(endpoint, {
          method: "DELETE",
          headers: getAuthHeaders(),
        });

        const data = await parseResponse(res);

        if (res.ok || res.status === 200) {
          showSuccessToast(
            `${
              deleteTarget.type === "user" ? "User" : "Admin"
            } deleted successfully!`
          );
          await Promise.all([fetchUsers(), fetchAdmins()]);
        } else {
          showErrorToast(data?.message || "Failed to delete");
        }
      } catch (err) {
        showErrorToast("Network error while deleting");
      } finally {
        setShowDeleteConfirm(false);
        setDeleteTarget(null);
      }
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      country: "",
      password: "",
      user_type: "admin",
      role: "admin",
    });
    setEditingItem(null);
    setEditingType(null);
    setIsAddDialogOpen(false);
    setShowPassword(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Show initial loading screen
  if (initialLoading) {
    return (
      <AdminLayout>
        <Loading
          variant="admin"
          size="lg"
          message="Loading users and administrators..."
          icon="users"
          className="h-[80vh]"
        />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 to-white min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-xl">
                <Users className="h-8 w-8 text-indigo-600" />
              </div>
              User Management
            </h1>
            <p className="text-slate-600 mt-3 text-lg">
              Manage your users and administrators with ease
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 text-base"
              disabled={isAnyLoading()}
            >
              <Plus className="h-5 w-5" />
              Add New Admin
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-indigo-100 hover:shadow-xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-indigo-700 mb-1">
                    Total Users
                  </p>
                  <p className="text-3xl font-bold text-indigo-900">
                    {isLoading("users") ? (
                      <Loading variant="inline" size="sm" message="..." />
                    ) : (
                      users.length
                    )}
                  </p>
                </div>
                <div className="p-3 bg-indigo-200 rounded-full">
                  <Users className="h-8 w-8 text-indigo-700" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700 mb-1">
                    Administrators
                  </p>
                  <p className="text-3xl font-bold text-purple-900">
                    {isLoading("admins") ? (
                      <Loading variant="inline" size="sm" message="..." />
                    ) : (
                      admins.length
                    )}
                  </p>
                </div>
                <div className="p-3 bg-purple-200 rounded-full">
                  <Shield className="h-8 w-8 text-purple-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Search className="h-5 w-5 text-indigo-600" />
              Search & Filter Users
            </CardTitle>
            <CardDescription className="text-slate-600">
              Find users by name or email, or filter by account type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <Input
                    placeholder="Search users and admins..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 text-base border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                    disabled={isLoading("users") || isLoading("admins")}
                  />
                </div>
              </div>
              <Select
                value={selectedType}
                onValueChange={(val) => setSelectedType(val)}
                disabled={isLoading("users") || isLoading("admins")}
              >
                <SelectTrigger className="w-full md:w-48 h-12 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="users">Users Only</SelectItem>
                  <SelectItem value="admins">Admins Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(searchTerm || selectedType !== "admins") && (
              <div className="mt-4 flex items-center gap-3">
                <span className="text-sm text-slate-600">
                  Found {filteredData().length} accounts
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedType("admins");
                  }}
                  className="h-7 px-3 text-xs hover:bg-slate-50"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-0">
            {(isLoading("users") || isLoading("admins")) &&
            !isLoading("initial") ? (
              <Loading
                variant="admin"
                message="Loading data..."
                icon="users"
                className="py-16"
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 border-b border-slate-200">
                      <TableHead className="font-semibold text-slate-700">
                        Type
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        Name
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        Email
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        Phone
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        Role/Type
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        Created
                      </TableHead>
                      <TableHead className="w-32 text-center font-semibold text-slate-700">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.map((item) => {
                      const isUser = item.type === "user";
                      const itemId = isUser ? item.user_id : item.admin_id;

                      return (
                        <TableRow
                          key={itemId}
                          className="hover:bg-slate-50 transition-colors duration-150 border-b border-slate-100"
                        >
                          <TableCell>
                            <Badge
                              variant={isUser ? "outline" : "default"}
                              className={`text-xs ${
                                isUser
                                  ? "border-indigo-200 text-indigo-700 bg-indigo-50"
                                  : "bg-purple-100 text-purple-700 border-purple-200"
                              }`}
                            >
                              {isUser ? (
                                <Users className="h-3 w-3 mr-1" />
                              ) : (
                                <Shield className="h-3 w-3 mr-1" />
                              )}
                              {isUser ? "User" : "Admin"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-semibold text-slate-900 mb-1">
                                {item.name}
                              </div>
                              {isUser && (item as UserType).address && (
                                <div className="text-sm text-slate-500 truncate max-w-xs flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {(item as UserType).address}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3 text-slate-400" />
                              <span className="text-sm">{item.email}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-slate-400" />
                              <span className="text-sm">
                                {item.phone || "N/A"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {isUser
                                ? (item as UserType).user_type
                                : (item as AdminType).role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-slate-400" />
                              <span className="text-sm">
                                {formatDate(item.created_at)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(item)}
                                disabled={isAnyLoading()}
                                className="h-9 w-9 p-0 hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-150"
                              >
                                <Edit3 className="h-4 w-4 text-indigo-600" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => confirmDelete(item)}
                                disabled={isAnyLoading()}
                                className="h-9 w-9 p-0 hover:bg-red-50 hover:border-red-200 transition-all duration-150"
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
                  <div className="text-center py-16">
                    <div className="p-4 bg-slate-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                      <Users className="h-10 w-10 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      {searchTerm
                        ? `No ${selectedType} found`
                        : `No ${selectedType} yet`}
                    </h3>
                    <p className="text-slate-500 mb-6 max-w-md mx-auto">
                      {searchTerm
                        ? "Try adjusting your search criteria to find what you're looking for"
                        : `Get started by adding your first ${
                            selectedType === "admins" ? "admin" : "user"
                          }`}
                    </p>
                    {!searchTerm && selectedType === "admins" && (
                      <Button
                        onClick={() => setIsAddDialogOpen(true)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
                        disabled={isAnyLoading()}
                      >
                        <Plus className="h-4 w-4" />
                        Add Your First Admin
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
                        disabled={isAnyLoading()}
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
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Users className="h-5 w-5 text-indigo-600" />
                </div>
                {editingItem ? "Edit Account" : "Add New Account"}
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                {editingItem
                  ? "Update the account information below."
                  : "Fill in the details to add a new user or admin account."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Full Name *
                  </label>
                  <Input
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    disabled={isLoading("submit")}
                    className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    disabled={isLoading("submit")}
                    className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Phone Number
                  </label>
                  <Input
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    disabled={isLoading("submit")}
                    className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                {/* Country */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Country
                  </label>
                  <Input
                    placeholder="Enter country"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    disabled={isLoading("submit")}
                    className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                {/* Role (for admins) */}
                {(formData.user_type === "admin" ||
                  editingType === "admin") && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Admin Role
                    </label>
                    <Select
                      value={formData.role}
                      onValueChange={(val) =>
                        setFormData({ ...formData, role: val })
                      }
                      disabled={isLoading("submit")}
                    >
                      <SelectTrigger className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500">
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
                  <label className="text-sm font-semibold text-slate-700">
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
                      disabled={isLoading("submit")}
                      className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading("submit")}
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
              {/* Address */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Address
                </label>
                <Textarea
                  rows={3}
                  placeholder="Enter address..."
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  disabled={isLoading("submit")}
                  className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <DialogFooter className="flex gap-3 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={isLoading("submit")}
                  className="px-6 bg-transparent"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading("submit")}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-6"
                >
                  {isLoading("submit") ? (
                    <Loading
                      variant="inline"
                      size="sm"
                      message={editingItem ? "Saving..." : "Adding..."}
                    />
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {editingItem ? "Save Changes" : "Add Account"}
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
                Are you sure you want to delete "{deleteTarget?.name}"? This
                action cannot be undone and will remove all associated data.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteTarget(null);
                }}
                disabled={isLoading("delete")}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading("delete")}
                className="flex items-center gap-2"
              >
                {isLoading("delete") ? (
                  <Loading
                    variant="inline"
                    size="sm"
                    message="Deleting..."
                    icon="trash"
                  />
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete
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
