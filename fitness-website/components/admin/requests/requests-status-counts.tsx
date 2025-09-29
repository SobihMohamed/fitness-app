"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import type { StatusCounts } from "@/types";

interface RequestsStatusCountsProps {
  statusCounts: StatusCounts;
  selectedItems: string[];
  onClearSelection: () => void;
}

export const RequestsStatusCounts = React.memo<RequestsStatusCountsProps>(({
  statusCounts,
  selectedItems,
  onClearSelection
}) => {
  return (
    <div className="flex items-center gap-4 flex-wrap">
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-600">Results:</span>
        <span className="px-2 py-1 rounded-full bg-yellow-50 text-yellow-700 text-xs font-medium">
          Pending: {statusCounts.pending}
        </span>
        <span className="px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium">
          Approved: {statusCounts.approved}
        </span>
        <span className="px-2 py-1 rounded-full bg-red-50 text-red-700 text-xs font-medium">
          Cancelled: {statusCounts.cancelled}
        </span>
      </div>
      
      {selectedItems.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">
            {selectedItems.length} selected
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onClearSelection}
          >
            Clear Selection
          </Button>
        </div>
      )}
    </div>
  );
});

RequestsStatusCounts.displayName = "RequestsStatusCounts";
