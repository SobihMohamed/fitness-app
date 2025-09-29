"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface ActionButtonsProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
  onAddUser: (type: "user" | "admin") => void;
  loading?: boolean;
  submitting?: boolean;
  deleting?: boolean;
}

export const ActionButtons = React.memo<ActionButtonsProps>(({
  selectedType,
  onTypeChange,
  onAddUser,
  loading = false,
  submitting = false,
  deleting = false
}) => {
  const isDisabled = loading || submitting || deleting;

  return (
    <div className="flex items-center gap-3 flex-wrap justify-end">
      {/* Quick toggle between Admins and Users */}
      {selectedType === "admins" ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onTypeChange("users")}
          className="h-9"
          disabled={isDisabled}
        >
          View Users
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onTypeChange("admins")}
          className="h-9"
          disabled={isDisabled}
        >
          View Admins
        </Button>
      )}
      
      {(selectedType === "admins" || selectedType === "all") && (
        <Button
          onClick={() => onAddUser("admin")}
          className="h-9 bg-indigo-600 hover:bg-indigo-700"
          disabled={isDisabled}
        >
          + Add Admin
        </Button>
      )}
      
      {(selectedType === "users" || selectedType === "all") && (
        <Button
          variant="outline"
          onClick={() => onAddUser("user")}
          className="h-9"
          disabled={isDisabled}
        >
          + Add User
        </Button>
      )}
    </div>
  );
});

ActionButtons.displayName = "ActionButtons";
