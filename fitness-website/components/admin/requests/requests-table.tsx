"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  BookOpen, 
  DollarSign, 
  ChevronLeft, 
  ChevronRight,
  User,
  Clock,
  AlertCircle
} from "lucide-react";
import { formatDateUTC } from "@/utils/format";
import { useRequestManagement } from "@/hooks/admin/use-request-management";
import { 
  RequestsSearchAndFilter,
  RequestsBulkActions,
  RequestsStatusCounts,
  RequestsConfirmDialog,
  RequestsDetailsDialog
} from "./index";
import type { RequestSection } from "@/types";

interface RequestsTableProps {
  section: RequestSection;
}

// Memoized component to display the username as the user's ID
const UserDisplay = React.memo<{ userId?: string; fallbackName?: string }>(({ userId, fallbackName }) => {
  if (userId) {
    return <span className="font-medium text-slate-900">{userId}</span>;
  }
  if (fallbackName && fallbackName !== "N/A") {
    return <span className="font-medium text-slate-900">{fallbackName}</span>;
  }
  return <span className="text-slate-500">N/A</span>;
});

UserDisplay.displayName = 'UserDisplay';

export const RequestsTable = React.memo<RequestsTableProps>(({ section }) => {
  const {
    loading,
    error,
    actionLoading,
    detailsItem,
    detailsData,
    detailsLoading,
    detailsProduct,
    detailsProductName,
    confirm,
    bulkAction,
    selectedItems,
    page,
    rowsPerPage,
    filters,
    items,
    filtered,
    totalPages,
    paginated,
    statusCounts,
    setPage,
    setFilters,
    setSelectedItems,
    setConfirm,
    setBulkAction,
    setDetailsItem,
    fetchDetails,
    handleAction,
    handleBulkAction,
  } = useRequestManagement(section);

  const handleDetailsClick = async (item: any) => {
    const itemId = item.id || item.request_id || item.order_id;
    setDetailsItem(item);
    await fetchDetails(section, itemId);
  };

  const handleActionClick = async (type: "approve" | "cancel" | "delete", id: string) => {
    await handleAction(type, id, section);
  };

  const handleBulkActionClick = async (action: any) => {
    await handleBulkAction(action, section);
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <div className="p-1.5 bg-indigo-100 rounded-lg">
            {section === "training" ? (
              <CheckCircle className="h-5 w-5 text-indigo-600" />
            ) : section === "courses" ? (
              <BookOpen className="h-5 w-5 text-indigo-600" />
            ) : (
              <DollarSign className="h-5 w-5 text-indigo-600" />
            )}
          </div>
          {section === "training"
            ? "Training Requests"
            : section === "courses"
            ? "Course Requests"
            : "Orders"}
        </CardTitle>
        <CardDescription>
          {section === "training"
            ? "Manage personal training requests from users"
            : section === "courses"
            ? "Manage course enrollment requests"
            : "Manage product and service orders"}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Search and Filter Controls */}
        <RequestsSearchAndFilter
          section={section}
          filters={filters}
          onFiltersChange={setFilters}
          onPageChange={setPage}
          filteredData={filtered}
        />

        {/* Status Counts */}
        <div className="px-6 py-4 border-b bg-slate-50">
          <RequestsStatusCounts
            statusCounts={statusCounts}
            selectedItems={selectedItems}
            onClearSelection={() => setSelectedItems([])}
          />
        </div>

        {/* Bulk Actions Bar */}
        <RequestsBulkActions
          selectedItems={selectedItems}
          onBulkAction={setBulkAction}
          onClearSelection={() => setSelectedItems([])}
        />

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold text-left text-slate-700 w-12">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === paginated.length && paginated.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems(paginated.map(item => item.id || (item as any).request_id || (item as any).order_id));
                      } else {
                        setSelectedItems([]);
                      }
                    }}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="px-4 py-3 font-semibold text-left text-slate-700">
                  # 
                </th>
                <th className="px-4 py-3 font-semibold text-left text-slate-700">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    User ID
                  </div>
                </th>
                <th className="px-4 py-3 font-semibold text-left text-slate-700">
                  Status
                </th>
                <th className="px-4 py-3 font-semibold text-left text-slate-700">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Created
                  </div>
                </th>
                <th className="px-4 py-3 font-semibold text-center text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {(!loading && paginated.length === 0) ? (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <div className="flex flex-col items-center justify-center gap-2">
                      {section === "training" ? (
                        <CheckCircle className="h-8 w-8 text-slate-300" />
                      ) : section === "courses" ? (
                        <BookOpen className="h-8 w-8 text-slate-300" />
                      ) : (
                        <DollarSign className="h-8 w-8 text-slate-300" />
                      )}
                      <h3 className="text-lg font-semibold text-slate-700">
                        {filters.query
                          ? "No matching requests found"
                          : "No requests yet"}
                      </h3>
                      <p className="text-slate-500 max-w-md">
                        {filters.query
                          ? "Try adjusting your search criteria"
                          : `There are no ${section} requests to display at this time.`}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((item: any, idx: number) => {
                  const itemId = item.id || item.request_id || item.order_id;
                  const isSelected = selectedItems.includes(itemId);
                  
                  return (
                    <tr
                      key={itemId || idx}
                      className={`hover:bg-slate-50 transition-colors duration-150 border-b border-slate-100 ${
                        isSelected ? 'bg-indigo-50' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedItems(prev => [...prev, itemId]);
                            } else {
                              setSelectedItems(prev => prev.filter(id => id !== itemId));
                            }
                          }}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-medium">
                        {(page - 1) * rowsPerPage + idx + 1}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        <UserDisplay
                          userId={item.user_id || item.userId || item.user?.user_id}
                          fallbackName={
                            item.user?.name ||
                            item.user_name ||
                            item.trainee_name ||
                            item.customer_name ||
                            "N/A"
                          }
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className={`capitalize ${
                            item.status === 'approved'
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : item.status === 'cancelled'
                              ? 'bg-red-100 text-red-800 hover:bg-red-200'
                              : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          }`}
                        >
                          {item.status || 'pending'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {(() => {
                          const dt = item?.created_at ||
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
                          if (!dt) return "-";
                          return formatDateUTC(dt as any);
                        })()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          {/* Always show details button */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDetailsClick(item)}
                            disabled={!!actionLoading}
                            className="h-9 w-9 p-0 hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-150"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4 text-indigo-600" />
                          </Button>

                          {/* Show action buttons only for pending items */}
                          {item.status === 'pending' && (
                            <>
                              {/* Approve button */}
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={!!actionLoading}
                                onClick={() =>
                                  setConfirm({
                                    type: "approve",
                                    id: itemId,
                                  })
                                }
                                className="h-9 w-9 p-0 hover:bg-green-50 hover:border-green-200 transition-all duration-150"
                                title="Approve Request"
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>

                              {/* Cancel button */}
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={!!actionLoading}
                                onClick={() =>
                                  setConfirm({
                                    type: "cancel",
                                    id: itemId,
                                  })
                                }
                                className="h-9 w-9 p-0 hover:bg-yellow-50 hover:border-yellow-200 transition-all duration-150"
                                title="Cancel Request"
                              >
                                <XCircle className="h-4 w-4 text-yellow-600" />
                              </Button>
                            </>
                          )}

                          {/* Always show delete button */}
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={!!actionLoading}
                            onClick={() =>
                              setConfirm({
                                type: "delete",
                                id: itemId,
                              })
                            }
                            className="h-9 w-9 p-0 hover:bg-red-50 hover:border-red-200 transition-all duration-150"
                            title="Delete Request"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 p-6 border-t bg-slate-50">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className={`w-10 h-10 ${
                page === 1
                  ? "cursor-not-allowed opacity-50"
                  : "hover:bg-slate-100"
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({
              length: Math.min(5, Math.ceil(filtered.length / rowsPerPage)),
            }).map((_, i) => {
              const pageNum = i + 1;
              const isCurrentPage = pageNum === page;
              return (
                <Button
                  key={i}
                  variant={isCurrentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(pageNum)}
                  className={`w-10 h-10 ${
                    isCurrentPage
                      ? "bg-indigo-600 hover:bg-indigo-700"
                      : "hover:bg-slate-100"
                  }`}
                >
                  {pageNum}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className={`w-10 h-10 ${
                page === totalPages
                  ? "cursor-not-allowed opacity-50"
                  : "hover:bg-slate-100"
              }`}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        )}

        {/* Confirmation Dialogs */}
        <RequestsConfirmDialog
          confirm={confirm}
          bulkAction={bulkAction}
          actionLoading={actionLoading}
          onConfirm={() => {
            if (confirm) {
              handleActionClick(confirm.type, confirm.id);
            } else if (bulkAction) {
              handleBulkActionClick(bulkAction);
            }
          }}
          onCancel={() => {
            setConfirm(null);
            setBulkAction(null);
          }}
        />

        {/* Details Dialog */}
        <RequestsDetailsDialog
          section={section}
          detailsItem={detailsItem}
          detailsData={detailsData}
          detailsLoading={detailsLoading}
          detailsProduct={detailsProduct}
          detailsProductName={detailsProductName}
          onClose={() => setDetailsItem(null)}
        />
      </CardContent>
    </Card>
  );
});

RequestsTable.displayName = "RequestsTable";
