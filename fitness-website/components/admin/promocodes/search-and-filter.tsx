"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface SearchAndFilterProps {
  search: string;
  onSearchChange: (search: string) => void;
  placeholder?: string;
}

const SearchAndFilter = React.memo(({ 
  search, 
  onSearchChange, 
  placeholder = "Search promo codes or percentage..." 
}: SearchAndFilterProps) => {
  const handleClear = React.useCallback(() => {
    onSearchChange("");
  }, [onSearchChange]);

  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="pl-9 pr-9"
        />
        {search && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-slate-100"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
});

SearchAndFilter.displayName = "SearchAndFilter";

export { SearchAndFilter };
