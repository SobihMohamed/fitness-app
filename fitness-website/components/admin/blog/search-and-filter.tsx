"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
// Replaced Radix Select for this page to avoid nested update loop
import { Badge } from "@/components/ui/badge";
import { Search, FileText, CheckCircle, FolderOpen, X } from "lucide-react";
import type { SearchAndFilterProps } from "@/types";

export const SearchAndFilter = React.memo(({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  filteredBlogsCount,
  onClearFilters,
  loading
}: SearchAndFilterProps) => {
  const hasActiveFilters = searchTerm || selectedStatus !== "all";

  return (
    <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden bg-white">
      <CardHeader className="pb-4 bg-gradient-to-r from-indigo-50 to-white border-b border-slate-100">
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Search className="h-5 w-5 text-indigo-600" />
          </div>
          Search & Filter Blogs
        </CardTitle>
        <CardDescription className="text-slate-600 mt-1">
          Find blogs by title, content, status or category
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <Input
                placeholder="Search by title, author or content..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-12 h-11 text-base border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:gap-5">
            <div className="relative">
              <div className="flex items-center">
                <FileText className="h-4 w-4 text-slate-400 mr-2" />
                <select
                  id="status-filter"
                  value={selectedStatus}
                  onChange={(e) => onStatusChange(e.target.value as "all" | "archived" | "published")}
                  className="w-full h-11 border border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm bg-white px-3"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-indigo-50 text-indigo-700 border-indigo-100 px-3 py-1"
            >
              <FileText className="h-3.5 w-3.5 mr-1" />
              {filteredBlogsCount}{" "}
              {filteredBlogsCount === 1 ? "blog" : "blogs"}
            </Badge>
            {selectedStatus !== "all" && (
              <Badge
                variant="outline"
                className="bg-emerald-50 text-emerald-700 border-emerald-100 px-3 py-1"
              >
                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                {selectedStatus === "published" ? "Published" : "Archived"}
              </Badge>
            )}
            {searchTerm && (
              <Badge
                variant="outline"
                className="bg-amber-50 text-amber-700 border-amber-100 px-3 py-1"
              >
                <Search className="h-3.5 w-3.5 mr-1" />
                Search: "
                {searchTerm.length > 15
                  ? searchTerm.substring(0, 15) + "..."
                  : searchTerm}
                "
              </Badge>
            )}
          </div>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="h-9 px-3 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-lg transition-all duration-200"
            >
              <X className="h-4 w-4 mr-2" />
              Clear All Filters
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

SearchAndFilter.displayName = "SearchAndFilter";
