"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Search, Calendar, Download } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { SearchFilters, RequestSection } from "@/types";

interface RequestsSearchAndFilterProps {
  section: RequestSection;
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters | ((prev: SearchFilters) => SearchFilters)) => void;
  onPageChange: (page: number) => void;
  filteredData: any[];
  onExportCSV?: (data: any[]) => void;
}

// CSV Export utility function
const generateCSV = (data: any[], section: RequestSection) => {
  if (!data || data.length === 0) return '';
  
  const headers = [
    'ID',
    'User ID', 
    'Name',
    'Email',
    'Status',
    'Created Date',
    'Type'
  ];
  
  const extractDate = (item: any): string | null => {
    const dt =
      item?.created_at ||
      item?.createdAt ||
      item?.purchase_date ||
      item?.order_date ||
      item?.request_date ||
      item?.date ||
      item?.created ||
      item?.created_on ||
      item?.createdOn ||
      item?.orderDate ||
      item?.placed_at ||
      item?.placedAt ||
      item?.order?.created_at ||
      item?.order?.createdAt ||
      item?.order?.purchase_date ||
      item?.order?.order_date ||
      item?.order?.date;
    return dt ?? null;
  };

  const formatDateUTC = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };
  
  const rows = data.map(item => [
    item.id || item.request_id || item.order_id || '',
    item.user_id || '',
    item.name || item.user_name || item.customer_name || '',
    item.email || item.user_email || item.customer_email || '',
    item.status || 'pending',
    extractDate(item) ? formatDateUTC(extractDate(item) as any) : '',
    item.course_name ? 'Course' : item.training_per_week ? 'Training' : 'Order'
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  return csvContent;
};

export const RequestsSearchAndFilter = React.memo<RequestsSearchAndFilterProps>(({
  section,
  filters,
  onFiltersChange,
  onPageChange,
  filteredData,
  onExportCSV
}) => {
  const handleExportCSV = () => {
    if (onExportCSV) {
      onExportCSV(filteredData);
    } else {
      const csvContent = generateCSV(filteredData, section);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${section}_requests_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast("Export Complete", {
        description: `Exported ${filteredData.length} ${section} requests to CSV`,
      });
    }
  };

  const clearFilters = () => {
    onFiltersChange({
      query: "",
      status: "all",
      dateFrom: null,
      dateTo: null,
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
    onPageChange(1);
  };

  return (
    <div className="p-6 border-b bg-gradient-to-r from-slate-50 to-white">
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={filters.query}
                onChange={(e) => {
                  onFiltersChange(prev => ({ ...prev, query: e.target.value }));
                  onPageChange(1);
                }}
                placeholder={`Search ${section} by name, email, ID, or any field...`}
                className="pl-10 pr-4 py-2 h-10 border-slate-200 focus:border-indigo-300 focus:ring-indigo-200"
              />
            </div>
          </div>
          
          {/* Quick Filters */}
          <div className="flex flex-wrap gap-3">
            <Select
              value={filters.status}
              onValueChange={(value) => {
                onFiltersChange(prev => ({ ...prev, status: value }));
                onPageChange(1);
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.sortBy}
              onValueChange={(value: any) => {
                onFiltersChange(prev => ({ ...prev, sortBy: value }));
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Date Created</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="user_id">User ID</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onFiltersChange(prev => ({ 
                  ...prev, 
                  sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' 
                }));
              }}
              className="flex items-center gap-2"
            >
              {filters.sortOrder === 'asc' ? '↑' : '↓'}
              {filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-500" />
            <span className="text-sm text-slate-600">Date Range:</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-40 justify-start text-left font-normal",
                    !filters.dateFrom && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {filters.dateFrom ? format(filters.dateFrom, "MMM dd") : "From"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={filters.dateFrom || undefined}
                  onSelect={(date) => {
                    onFiltersChange(prev => ({ ...prev, dateFrom: date || null }));
                    onPageChange(1);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <span className="text-slate-400">to</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-40 justify-start text-left font-normal",
                    !filters.dateTo && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {filters.dateTo ? format(filters.dateTo, "MMM dd") : "To"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={filters.dateTo || undefined}
                  onSelect={(date) => {
                    onFiltersChange(prev => ({ ...prev, dateTo: date || null }));
                    onPageChange(1);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-slate-500 hover:text-slate-700"
          >
            Clear Filters
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>
    </div>
  );
});

RequestsSearchAndFilter.displayName = "RequestsSearchAndFilter";
