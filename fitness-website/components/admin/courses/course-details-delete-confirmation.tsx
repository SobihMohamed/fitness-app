"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, Trash2, Loader2 } from "lucide-react";
import type { CourseDetailsDeleteTarget } from "@/types";

interface CourseDetailsDeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  target: CourseDetailsDeleteTarget | null;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export const CourseDetailsDeleteConfirmation = React.memo<CourseDetailsDeleteConfirmationProps>(({
  isOpen,
  onClose,
  target,
  onConfirm,
  isSubmitting
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md border-0 shadow-2xl rounded-xl">
        <div className="bg-gradient-to-r from-red-500 to-red-600 h-1 absolute top-0 left-0 right-0 rounded-t-xl"></div>
        <DialogHeader className="pt-6">
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="h-5 w-5" />
            </div>
            Confirm Deletion
          </DialogTitle>
          <DialogDescription className="text-slate-600 mt-2">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-slate-800">
              "{target?.name}"
            </span>
            ? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="border-slate-300 hover:bg-slate-100 transition-all duration-200"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="gap-2 bg-red-600 hover:bg-red-700 shadow-md hover:shadow-lg transition-all duration-200"
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
  );
});

CourseDetailsDeleteConfirmation.displayName = "CourseDetailsDeleteConfirmation";
