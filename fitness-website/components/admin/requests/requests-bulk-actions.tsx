"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Trash2 } from "lucide-react";
import type { BulkAction } from "@/types";

interface RequestsBulkActionsProps {
  selectedItems: string[];
  onBulkAction: (action: BulkAction) => void;
  onClearSelection: () => void;
}

export const RequestsBulkActions = React.memo<RequestsBulkActionsProps>(({
  selectedItems,
  onBulkAction,
  onClearSelection
}) => {
  if (selectedItems.length === 0) return null;

  return (
    <div className="bg-indigo-50 border-b border-indigo-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-indigo-700">
            {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onBulkAction({ type: 'approve', ids: selectedItems })}
              className="text-green-700 border-green-300 hover:bg-green-50"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Approve All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onBulkAction({ type: 'cancel', ids: selectedItems })}
              className="text-yellow-700 border-yellow-300 hover:bg-yellow-50"
            >
              <XCircle className="h-4 w-4 mr-1" />
              Cancel All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onBulkAction({ type: 'delete', ids: selectedItems })}
              className="text-red-700 border-red-300 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete All
            </Button>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="text-indigo-600 hover:text-indigo-800"
        >
          Clear Selection
        </Button>
      </div>
    </div>
  );
});

RequestsBulkActions.displayName = "RequestsBulkActions";
