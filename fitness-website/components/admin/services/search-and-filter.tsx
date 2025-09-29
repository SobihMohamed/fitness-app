"use client";

import React, { useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface SearchAndFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export const SearchAndFilter = React.memo<SearchAndFilterProps>(({ 
  searchTerm, 
  onSearchChange 
}) => {
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  }, [onSearchChange]);

  const handleClearSearch = useCallback(() => {
    onSearchChange("");
  }, [onSearchChange]);

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <Search className="h-5 w-5 text-indigo-600" />
          Search Services
        </CardTitle>
        <CardDescription className="text-slate-600">
          Find by title, details, price, or duration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
          <Input
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search services..."
            className="pl-12 pr-12 h-12 text-base border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

SearchAndFilter.displayName = "SearchAndFilter";
