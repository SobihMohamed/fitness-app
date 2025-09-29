"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface RequestsHeaderProps {
  onExport?: () => void;
}

export const RequestsHeader = React.memo<RequestsHeaderProps>(({ onExport }) => {
  const handleExport = () => {
    if (onExport) {
      onExport();
    } else {
      toast({
        title: "Export Started",
        description: "Preparing data for export...",
      });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
      <div className="flex-1">
        <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3 mb-3">
          <div className="p-2 bg-indigo-100 rounded-xl">
            <CheckCircle className="h-8 w-8 text-indigo-600" />
          </div>
          Advanced Requests Management
        </h1>
        <p className="text-slate-600 text-lg">
          Search, filter, and manage all training, course, and order requests with advanced tools.
        </p>
      </div>
    </div>
  );
});

RequestsHeader.displayName = "RequestsHeader";
