"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";
import type { DeleteConfirmationProps } from "@/types/blog";

export const DeleteConfirmation = React.memo(({
  isOpen,
  onClose,
  target,
  onConfirm,
  isSubmitting
}: DeleteConfirmationProps) => {
  if (!target) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-xl shadow-lg max-w-md">
        <DialogHeader className="pb-4 border-b border-slate-100">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
            <AlertTriangle className="h-5 w-5 text-amber-500" /> Confirm
            Deletion
          </DialogTitle>
          <div className="text-slate-600 mt-2 space-y-2">
            <div>
              Are you sure you want to delete{" "}
              <span className="font-medium text-slate-800">
                "{target.name}"
              </span>
              ?
            </div>
            <div className="text-red-600 font-medium">
              This action cannot be undone.
              {target.type === "blog" &&
                " The associated image will also be removed."}
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="pt-4 border-t border-slate-100 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border-slate-200 hover:bg-slate-50 transition-colors duration-200"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
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
  );
});

DeleteConfirmation.displayName = "DeleteConfirmation";
