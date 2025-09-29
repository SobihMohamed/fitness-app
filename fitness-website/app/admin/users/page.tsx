"use client";

import React, { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { useUserManagement } from "@/hooks/admin/use-user-management";
import type { 
  UserFormData, 
  CombinedUserItem, 
  UserDeleteTarget,
  UserType,
  AdminType
} from "@/types";

// Dynamic imports for heavy components to prevent hydration mismatches
import dynamic from "next/dynamic";

const StatsCards = dynamic(
  () => import("@/components/admin/users/stats-cards").then(mod => ({ default: mod.StatsCards })),
  { ssr: false }
);

const SearchAndFilter = dynamic(
  () => import("@/components/admin/users/search-and-filter").then(mod => ({ default: mod.SearchAndFilter })),
  { ssr: false }
);

const UserTable = dynamic(
  () => import("@/components/admin/users/user-table").then(mod => ({ default: mod.UserTable })),
  { ssr: false }
);

const ActionButtons = dynamic(
  () => import("@/components/admin/users/action-buttons").then(mod => ({ default: mod.ActionButtons })),
  { ssr: false }
);

const UserForm = dynamic(
  () => import("@/components/admin/users/user-form").then(mod => ({ default: mod.UserForm })),
  { ssr: false }
);

const DeleteConfirmation = dynamic(
  () => import("@/components/admin/users/delete-confirmation").then(mod => ({ default: mod.DeleteConfirmation })),
  { ssr: false }
);

const Pagination = dynamic(
  () => import("@/components/admin/users/pagination").then(mod => ({ default: mod.Pagination })),
  { ssr: false }
);

export default function UsersManagement() {
  // Use the centralized user management hook
  const {
    users,
    admins,
    loading,
    searchTerm,
    selectedType,
    currentPage,
    setSearchTerm,
    setSelectedType,
    setCurrentPage,
    addUser,
    updateUser,
    deleteUser,
    checkEmailExists,
    checkPhoneExists,
    filteredData,
    paginatedData,
    totalPages,
    stats,
  } = useUserManagement();

  // Local UI state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CombinedUserItem | null>(null);
  const [editingType, setEditingType] = useState<"user" | "admin" | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
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
  const [deleteTarget, setDeleteTarget] = useState<UserDeleteTarget | null>(null);

  // Validation helper functions
  const validateForm = useCallback((): string | null => {
    if (!formData.name.trim()) {
      return "Name is required";
    }
    if (!formData.email.trim()) {
      return "Email is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return "Please enter a valid email address";
    }
    if (!editingItem && !formData.password.trim()) {
      return "Password is required for new accounts";
    }

    const excludeId = editingItem
      ? editingType === "user"
        ? (editingItem as UserType).user_id
        : (editingItem as AdminType).admin_id
      : undefined;

    if (checkEmailExists(formData.email, excludeId)) {
      return "An account with this email already exists";
    }

    if (formData.phone && checkPhoneExists(formData.phone, excludeId)) {
      return "An account with this phone number already exists";
    }

    return null;
  }, [formData, editingItem, editingType, checkEmailExists, checkPhoneExists]);

  // Form submission handler
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      return;
    }

    try {
      if (editingItem) {
        const userId = editingType === "user" 
          ? (editingItem as UserType).user_id 
          : (editingItem as AdminType).admin_id;
        await updateUser(userId, formData, editingType!);
      } else {
        await addUser(formData);
      }
      resetForm();
    } catch (error) {
      // Error handling is done in the hook
    }
  }, [formData, editingItem, editingType, validateForm, updateUser, addUser]);

  // Event handlers
  const handleEdit = useCallback((item: CombinedUserItem) => {
    const isUser = item.type === "user";
    setEditingItem(item);
    setEditingType(isUser ? "user" : "admin");
    setFormData({
      name: item.name || "",
      email: item.email || "",
      phone: item.phone || "",
      address: isUser ? (item as UserType).address || "" : "",
      country: item.country || "",
      password: "",
      user_type: isUser ? (item as UserType).user_type || "customer" : "admin",
      role: !isUser ? (item as AdminType).role || "admin" : "admin",
    });
    setIsAddDialogOpen(true);
  }, []);

  const confirmDelete = useCallback((item: CombinedUserItem) => {
    const isUser = item.type === "user";
    setDeleteTarget({
      type: isUser ? "user" : "admin",
      id: isUser ? (item as UserType).user_id : (item as AdminType).admin_id,
      name: item.name,
    });
    setShowDeleteConfirm(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;

    try {
      await deleteUser(deleteTarget.id, deleteTarget.type);
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    } catch (error) {
      // Error handling is done in the hook
    }
  }, [deleteTarget, deleteUser]);

  const resetForm = useCallback(() => {
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
  }, []);

  // Open add dialog preset for type
  const openAdd = useCallback((type: "admin" | "user") => {
    setEditingItem(null);
    setEditingType(type);
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      country: "",
      password: "",
      user_type: type,
      role: type === "admin" ? "admin" : "admin",
    });
    setIsAddDialogOpen(true);
  }, []);

  // Clear filters handler
  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedType("admins");
  }, [setSearchTerm, setSelectedType]);

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
          <ActionButtons
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            onAddUser={openAdd}
            loading={loading.users || loading.admins}
            submitting={loading.submitting}
            deleting={loading.deleting}
          />
        </div>

        {/* Stats Cards */}
        <StatsCards stats={stats} loading={loading.initial} />

        {/* Search and Filter */}
        <SearchAndFilter
          searchTerm={searchTerm}
          selectedType={selectedType}
          onSearchChange={setSearchTerm}
          onTypeChange={setSelectedType}
          onClearFilters={handleClearFilters}
          filteredCount={filteredData.length}
          loading={loading.users || loading.admins}
        />

        {/* Users Table */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-0">
            <UserTable
              data={paginatedData}
              filteredCount={filteredData.length}
              searchTerm={searchTerm}
              selectedType={selectedType}
              loading={loading.users || loading.admins}
              onEdit={handleEdit}
              onDelete={confirmDelete}
              onAddUser={openAdd}
              submitting={loading.submitting}
              deleting={loading.deleting}
            />
            
            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              disabled={loading.submitting || loading.deleting}
            />
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <UserForm
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          formData={formData}
          onFormDataChange={setFormData}
          editingItem={editingItem}
          editingType={editingType}
          showPassword={showPassword}
          onShowPasswordChange={setShowPassword}
          onSubmit={handleSubmit}
          submitting={loading.submitting}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmation
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
          deleteTarget={deleteTarget}
          onConfirm={handleDelete}
          deleting={loading.deleting}
        />
      </div>
    </AdminLayout>
  );
}
