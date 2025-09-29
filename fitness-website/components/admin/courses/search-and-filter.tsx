"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchAndFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filteredCoursesCount: number;
  onClearFilters: () => void;
  loading: boolean;
}

export const SearchAndFilter = React.memo<SearchAndFilterProps>(({
  searchTerm,
  onSearchChange,
  filteredCoursesCount,
  onClearFilters,
  loading
}) => {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <Search className="h-5 w-5 text-indigo-600" />
          Search Courses
        </CardTitle>
        <CardDescription className="text-slate-600">
          Find courses by title or description
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
          <Input
            placeholder="Search courses by title or description..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            disabled={loading}
            className="pl-12 h-11 text-base border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        {searchTerm && (
          <div className="mt-3 flex items-center gap-3">
            <span className="text-sm text-slate-600">
              Found {filteredCoursesCount} courses
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              disabled={loading}
              className="h-7 px-3 text-xs hover:bg-slate-50"
            >
              Clear Search
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

SearchAndFilter.displayName = "SearchAndFilter";
