"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { ConfirmAction, BulkAction } from "@/types";

interface RequestsConfirmDialogProps {
  confirm: ConfirmAction | null;
  bulkAction: BulkAction | null;
  actionLoading: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const RequestsConfirmDialog = React.memo<RequestsConfirmDialogProps>(({
  confirm,
  bulkAction,
  actionLoading,
  onConfirm,
  onCancel
}) => {
  if (!confirm && !bulkAction) return null;

  const isBulk = !!bulkAction;
  const actionType = isBulk ? bulkAction.type : confirm?.type;
  const itemCount = isBulk ? bulkAction.ids.length : 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4 text-slate-900">
          {actionType === "delete"
            ? isBulk ? "Delete Multiple Requests" : "Delete Request"
            : actionType === "approve"
            ? isBulk ? "Approve Multiple Requests" : "Approve Request"
            : isBulk ? "Cancel Multiple Requests" : "Cancel Request"}
        </h2>
        <p className="mb-6 text-slate-600">
          Are you sure you want to {actionType} {isBulk ? `${itemCount} request${itemCount > 1 ? 's' : ''}` : 'this request'}? This
          action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={!!actionLoading}
            className="px-6 bg-transparent"
          >
            Cancel
          </Button>
          <Button
            variant={
              actionType === "delete"
                ? "destructive"
                : actionType === "approve"
                ? "default"
                : "secondary"
            }
            disabled={!!actionLoading}
            onClick={onConfirm}
            className="flex items-center gap-2"
          >
            {actionLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Confirm ${actionType}${isBulk ? ` ${itemCount} items` : ''}`
            )}
          </Button>
        </div>
      </div>
    </div>
  );
});

RequestsConfirmDialog.displayName = "RequestsConfirmDialog";
