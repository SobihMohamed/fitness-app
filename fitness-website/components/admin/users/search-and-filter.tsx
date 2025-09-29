"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

interface SearchAndFilterProps {
  searchTerm: string;
  selectedType: string;
  onSearchChange: (value: string) => void;
  onTypeChange: (type: string) => void;
  onClearFilters: () => void;
  filteredCount: number;
  loading?: boolean;
}

export const SearchAndFilter = React.memo<SearchAndFilterProps>(({
  searchTerm,
  selectedType,
  onSearchChange,
  onTypeChange,
  onClearFilters,
  filteredCount,
  loading = false
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
      <div className="flex flex-col sm:flex-row gap-3 flex-1">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-10 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
            disabled={loading}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-slate-100"
              onClick={() => onSearchChange("")}
              disabled={loading}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Type Filter Buttons */}
        <div className="flex gap-2">
          <Button
            variant={selectedType === "admins" ? "default" : "outline"}
            size="sm"
            onClick={() => onTypeChange("admins")}
            disabled={loading}
            className={`h-10 ${
              selectedType === "admins"
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "hover:bg-slate-50"
            }`}
          >
            Admins
          </Button>
          <Button
            variant={selectedType === "users" ? "default" : "outline"}
            size="sm"
            onClick={() => onTypeChange("users")}
            disabled={loading}
            className={`h-10 ${
              selectedType === "users"
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "hover:bg-slate-50"
            }`}
          >
            Users
          </Button>
          <Button
            variant={selectedType === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => onTypeChange("all")}
            disabled={loading}
            className={`h-10 ${
              selectedType === "all"
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "hover:bg-slate-50"
            }`}
          >
            All
          </Button>
        </div>
      </div>

      {/* Results Count and Clear Filters */}
      <div className="flex items-center gap-3">
        {(searchTerm || selectedType !== "admins") && (
          <>
            <span className="text-sm text-slate-600">
              Found {filteredCount} accounts
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="h-10 px-3 text-xs hover:bg-slate-50"
              disabled={loading}
            >
              Clear Filters
            </Button>
          </>
        )}
      </div>
    </div>
  );
});

SearchAndFilter.displayName = "SearchAndFilter";
