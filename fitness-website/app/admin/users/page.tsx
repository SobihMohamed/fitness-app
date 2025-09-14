"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
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
import { useAdminApi } from "@/hooks/admin/use-admin-api";
import { getHttpClient } from "@/lib/http";
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
import { API_CONFIG } from "@/config/api";
import { formatDateUTC } from "@/utils/format";
 

const { BASE_URL: API_BASE } = API_CONFIG;

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

export default function UsersManagement() {
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

  // Loading states
  const [initialLoading, setInitialLoading] = useState(true);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [fetchingAdmins, setFetchingAdmins] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { getAuthHeaders, parseResponse, showSuccessToast, showErrorToast } = useAdminApi();
  const http = getHttpClient();

  // Show a page-level loader during the very first data fetch to provide feedback

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
    try {
      setFetchingUsers(true);
      const { data } = await http.get(`${API_BASE}/ManageUsers/getAllUsers`);
      setUsers(data.data || data.users || []);
    } catch (err: any) {
      showErrorToast(err?.message || "Failed to load users");
    } finally {
      setFetchingUsers(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      setFetchingAdmins(true);
      const { data } = await http.get(`${API_BASE}/ManageAdmins/getAllAdmins`);
      setAdmins(data.users || data.data || data.admins || []);
    } catch (err: any) {
      showErrorToast(err?.message || "Failed to load admins");
    } finally {
      setFetchingAdmins(false);
    }
  };

  // Memoized filtered data calculation for better performance
  const { filteredDataMemo, totalPages, paginatedData } = React.useMemo(() => {
    // Combine users and admins with type information
    const allData = [
      ...users.map((u) => ({ ...u, type: "user" as const })),
      ...admins.map((a) => ({ ...a, type: "admin" as const })),
    ];
    
    // Filter data based on search term and selected type
    const filtered = allData.filter((item) => {
      // Search filter - check name and email
      const matchesSearch = searchTerm
        ? item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.email.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      
      // Type filter - show users, admins, or both
      const matchesType = selectedType === "all" ||
        (selectedType === "users" && item.type === "user") ||
        (selectedType === "admins" && item.type === "admin");
      
      return matchesSearch && matchesType;
    });
    
    // Calculate pagination
    const total = Math.ceil(filtered.length / itemsPerPage);
    const paginated = filtered.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
    
    return {
      filteredDataMemo: filtered,
      totalPages: total,
      paginatedData: paginated
    };
  }, [users, admins, searchTerm, selectedType, currentPage, itemsPerPage]);

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

    try {
      setSubmitting(true);
        let endpoint: string;
        let method: "POST" | "PUT";
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

        const res = await (method === "POST"
          ? http.post(endpoint, requestBody)
          : http.put(endpoint, requestBody));

        const successMessage = editingItem
          ? `${editingType === "user" ? "User" : "Admin"} updated successfully!`
          : `${formData.user_type === "admin" ? "Admin" : "User"} added successfully!`;
        showSuccessToast(successMessage);
        await Promise.all([fetchUsers(), fetchAdmins()]);
        resetForm();
      } catch (err: any) {
        showErrorToast(err?.message || "Failed to save");
      } finally {
        setSubmitting(false);
      }
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

    try {
      setDeleting(true);
        const endpoint =
          deleteTarget.type === "user"
            ? `${API_BASE}/ManageUsers/deleteUser/${deleteTarget.id}`
            : `${API_BASE}/ManageAdmins/deleteAdmin/${deleteTarget.id}`;

        await http.delete(endpoint);

        showSuccessToast(
          `${deleteTarget.type === "user" ? "User" : "Admin"} deleted successfully!`
        );
        await Promise.all([fetchUsers(), fetchAdmins()]);
    } catch (err: any) {
      showErrorToast(err?.message || "Failed to delete");
    } finally {
      setDeleting(false);
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
      user_type: "admin",
      role: "admin",
    });
    setEditingItem(null);
    setEditingType(null);
    setIsAddDialogOpen(false);
    setShowPassword(false);
  };

  const formatDate = (dateString: string) => {
    return formatDateUTC(dateString);
  };

  

  // Render an initial full-screen spinner while fetching data for the first time.
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
                <Users className="h-8 w-8 text-indigo-600" />
              </div>
              User Management
            </h1>
          </div>
          {(searchTerm || selectedType !== "admins") && (
            <div className="mt-4 flex items-center gap-3">
              <span className="text-sm text-slate-600">
                Found {filteredDataMemo.length} accounts
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedType("admins");
                }}
                className="h-7 px-3 text-xs hover:bg-slate-50"
                disabled={fetchingUsers || fetchingAdmins}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>

        {/* Users Table */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-0">
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
                                disabled={submitting || deleting}
                                className="h-9 w-9 p-0 hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-150"
                              >
                                <Edit3 className="h-4 w-4 text-indigo-600" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => confirmDelete(item)}
                                disabled={deleting}
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
                {filteredDataMemo.length === 0 && (
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
                        disabled={submitting || deleting || fetchingUsers || fetchingAdmins}
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
                        disabled={submitting || deleting}
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
                    disabled={submitting}
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
                    disabled={submitting}
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
                    disabled={submitting}
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
                    disabled={submitting}
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
                      disabled={submitting}
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
                      disabled={submitting}
                      className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={submitting}
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
                  disabled={submitting}
                  className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <DialogFooter className="flex gap-3 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={submitting}
                  className="px-6 bg-transparent"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-6"
                >
                  <Save className="h-4 w-4" />
                  {editingItem ? "Save Changes" : "Add Account"}
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
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
