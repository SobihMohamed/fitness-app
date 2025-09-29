"use client";

import React from "react";
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
import {
  Edit3,
  Trash2,
  Users,
  Shield,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Plus,
  RefreshCw,
} from "lucide-react";
import { formatDateUTC } from "@/utils/format";
import type { CombinedUserItem, UserType, AdminType } from "@/types";

interface UserTableProps {
  data: CombinedUserItem[];
  filteredCount: number;
  searchTerm: string;
  selectedType: string;
  loading?: boolean;
  onEdit: (item: CombinedUserItem) => void;
  onDelete: (item: CombinedUserItem) => void;
  onAddUser: (type: "user" | "admin") => void;
  submitting?: boolean;
  deleting?: boolean;
}

export const UserTable = React.memo<UserTableProps>(({
  data,
  filteredCount,
  searchTerm,
  selectedType,
  loading = false,
  onEdit,
  onDelete,
  onAddUser,
  submitting = false,
  deleting = false
}) => {
  const formatDate = (dateString: string) => {
    // Handle edge cases and provide fallback
    if (!dateString || dateString.trim() === '') {
      return 'No date';
    }
    
    // Try to format the date
    const formatted = formatDateUTC(dateString);
    
    // If formatDateUTC returns "N/A", it means the date is invalid
    if (formatted === "N/A") {
      // Try to parse and see if we can extract any meaningful info
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        // If it's a valid date, format it manually
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
      return 'Invalid date';
    }
    
    return formatted;
  };

  if (filteredCount === 0) {
    return (
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
            onClick={() => onAddUser("admin")}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
            disabled={submitting || deleting || loading}
          >
            <Plus className="h-4 w-4" />
            Add Your First Admin
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto relative">
      {loading && (
        <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
          <div className="flex items-center gap-2 text-slate-600">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading data…</span>
          </div>
        </div>
      )}
      
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 border-b border-slate-200">
            <TableHead className="font-semibold text-slate-700">Type</TableHead>
            <TableHead className="font-semibold text-slate-700">Name</TableHead>
            <TableHead className="font-semibold text-slate-700">Email</TableHead>
            <TableHead className="font-semibold text-slate-700">Phone</TableHead>
            <TableHead className="font-semibold text-slate-700">Role/Type</TableHead>
            <TableHead className="font-semibold text-slate-700">Created</TableHead>
            <TableHead className="w-32 text-center font-semibold text-slate-700">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => {
            const isUser = item.type === "user";
            const itemId = isUser ? (item as UserType).user_id : (item as AdminType).admin_id;

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
                    <span className="text-sm">{item.phone || "N/A"}</span>
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
                    <span className="text-sm">{formatDate(item.created_at)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(item)}
                      disabled={submitting || deleting}
                      className="h-9 w-9 p-0 hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-150"
                    >
                      <Edit3 className="h-4 w-4 text-indigo-600" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(item)}
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
    </div>
  );
});

UserTable.displayName = "UserTable";
