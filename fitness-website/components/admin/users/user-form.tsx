"use client";

import React from "react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Users, Save, Eye, EyeOff } from "lucide-react";
import type { UserFormData, CombinedUserItem } from "@/types";

interface UserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: UserFormData;
  onFormDataChange: (data: UserFormData) => void;
  editingItem: CombinedUserItem | null;
  editingType: "user" | "admin" | null;
  showPassword: boolean;
  onShowPasswordChange: (show: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting?: boolean;
}

export const UserForm = React.memo<UserFormProps>(({
  open,
  onOpenChange,
  formData,
  onFormDataChange,
  editingItem,
  editingType,
  showPassword,
  onShowPasswordChange,
  onSubmit,
  submitting = false
}) => {
  const handleInputChange = (field: keyof UserFormData, value: string) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
        
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Full Name *
              </label>
              <Input
                placeholder="Enter full name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
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
                onChange={(e) => handleInputChange("email", e.target.value)}
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
                onChange={(e) => handleInputChange("phone", e.target.value)}
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
                onChange={(e) => handleInputChange("country", e.target.value)}
                disabled={submitting}
                className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            
            {/* Role (for admins) */}
            {(formData.user_type === "admin" || editingType === "admin") && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Admin Role
                </label>
                <Select
                  value={formData.role}
                  onValueChange={(val) => handleInputChange("role", val)}
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
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  required={!editingItem}
                  disabled={submitting}
                  className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 pr-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => onShowPasswordChange(!showPassword)}
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
              onChange={(e) => handleInputChange("address", e.target.value)}
              disabled={submitting}
              className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          
          <DialogFooter className="flex gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
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
  );
});

UserForm.displayName = "UserForm";
