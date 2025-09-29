"use client";

import React, { useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchAndFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filteredCount: number;
}

export const SearchAndFilter = React.memo<SearchAndFilterProps>(({
  searchTerm,
  onSearchChange,
  filteredCount,
}) => {
  const handleClearSearch = useCallback(() => {
    onSearchChange("");
  }, [onSearchChange]);

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-6 px-8 pt-6">
        <CardTitle className="flex items-center gap-3 text-slate-800">
          <Search className="h-5 w-5 text-indigo-600" />
          Search Products
        </CardTitle>
        <CardDescription className="text-slate-600 mt-2">
          Find products by name or description
        </CardDescription>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <Input
              placeholder="Search products by name or description..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-12 h-12 text-base border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>
        {searchTerm && (
          <div className="mt-4 flex items-center gap-3">
            <span className="text-sm text-slate-600">
              Found {filteredCount} products
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearSearch}
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
