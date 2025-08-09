"use client"
import React, { useEffect, useState, useMemo } from "react";
import { API_CONFIG } from "@/config/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  Eye,
  CheckCircle,
  XCircle,
  Trash2,
  Filter,
  X,
  AlertCircle,
  BookOpen,
  DollarSign,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAdminApi } from "@/hooks/admin/use-admin-api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

const { TRAINING_API, COURSES_API, ORDERS_API, USERS_API } = API_CONFIG;

// Custom hook to fetch user data by ID
function useUser(userId: string | null) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { getAuthHeaders } = useAdminApi();

  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await fetch(USERS_API.getById(userId), {
          headers: getAuthHeaders(),
        });

        if (!res.ok) return;

        const data = await res.json();
        setUser(data.user || data.data || null);
      } catch (e) {
        console.error("Error fetching user:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  return { user, loading };
}

// Component to display user name with fallback to ID or placeholder
const UserDisplay = ({ userId, fallbackName }: { userId?: string; fallbackName?: string }) => {
  // If we have a user ID, fetch the actual user data
  const { user, loading } = useUser(userId || null);

  // If we successfully fetched user data, display the name
  if (user && user.name) {
    return <span>{user.name}</span>;
  }

  // If we're loading user data, show a loading indicator
  if (loading) {
    return <span className="text-slate-500">Loading...</span>;
  }

  // If we have a fallback name, display it
  if (fallbackName && fallbackName !== "N/A") {
    return <span>{fallbackName}</span>;
  }

  // If we have a user ID but couldn't fetch the name, display the ID
  if (userId) {
    return <span className="text-slate-500 text-xs">ID: {userId.substring(0, 8)}...</span>;
  }

  // Fallback to "N/A" if nothing else is available
  return <span className="text-slate-500">N/A</span>;
};

function useApiGet(url: string | null) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getAuthHeaders } = useAdminApi();

  useEffect(() => {
    if (!url) return;
    setLoading(true);
    setError(null);
    const token = typeof window !== "undefined" ? localStorage.getItem("adminAuth") : null;
    if (!token) {
      setError("Missing adminAuth token. Please log in as admin.");
      setLoading(false);
      return;
    }
    fetch(url, { headers: getAuthHeaders() })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        try {
          return await res.json();
        } catch (e) {
          throw new Error("Invalid server response. Please contact support.");
        }
      })
      .then(setData)
      .catch((e) => {
        console.error(e);
        setError(
          e instanceof Error
            ? e.message
            : "Network or server error. Please check your backend and try again."
        );
      })
      .finally(() => setLoading(false));
  }, [url]);

  return { data, loading, error, setData };
}

export default function AdminRequirementsPage() {
  return (
    <AdminLayout>
      <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 to-white min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-xl">
                <CheckCircle className="h-8 w-8 text-indigo-600" />
              </div>
              Search Requests Management
            </h1>
            <p className="text-slate-600 mt-3 text-lg">
              Search and manage all training, course, and order requests in one place.
            </p>
          </div>
        </div>

        <Tabs defaultValue="training" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-100 p-1 rounded-lg">
            <TabsTrigger
              value="training"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-700 font-medium rounded-md"
            >
              Training Requests
            </TabsTrigger>
            <TabsTrigger
              value="courses"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-700 font-medium rounded-md"
            >
              Course Requests
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-700 font-medium rounded-md"
            >
              Orders
            </TabsTrigger>
          </TabsList>
          <TabsContent value="training" className="m-0">
            <RequestsTable section="training" />
          </TabsContent>
          <TabsContent value="courses" className="m-0">
            <RequestsTable section="courses" />
          </TabsContent>
          <TabsContent value="orders" className="m-0">
            <RequestsTable section="orders" />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

function RequestsTable({
  section,
}: {
  section: "training" | "courses" | "orders";
}) {
  const { getAuthHeaders, showSuccessToast, showErrorToast } = useAdminApi();
  const api =
    section === "training"
      ? TRAINING_API
      : section === "courses"
      ? COURSES_API
      : ORDERS_API;
  const { data, loading, error, setData } = useApiGet(api.getAll);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [confirm, setConfirm] = useState<{
    type: "approve" | "cancel" | "delete";
    id: string;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [detailsItem, setDetailsItem] = useState<any>(null);
  const [detailsData, setDetailsData] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Memoized data processing for better performance
  const { items, filtered, totalPages, paginated } = useMemo(() => {
    // Normalize data structure
    const normalizedItems = Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data)
      ? data
      : data?.requests || data?.orders || [];
    
    // Filter items based on search and filter criteria
    const filteredItems = normalizedItems.filter((item: any) => {
      // Search filter - check all string values
      const searchStr = search.toLowerCase();
      const matchesSearch = search
        ? Object.values(item).some((v) =>
            typeof v === 'string' && v.toLowerCase().includes(searchStr)
          )
        : true;
      
      // Status filter
      const itemStatus = item.status || item.request_status || item.order_status || '';
      const matchesFilter = filter && filter !== "all"
        ? itemStatus.toLowerCase() === filter.toLowerCase()
        : true;
      
      return matchesSearch && matchesFilter;
    });
    
    // Calculate pagination
    const total = Math.ceil(filteredItems.length / rowsPerPage);
    const paginatedItems = filteredItems.slice(
      (page - 1) * rowsPerPage,
      page * rowsPerPage
    );
    
    return {
      items: normalizedItems,
      filtered: filteredItems,
      totalPages: total,
      paginated: paginatedItems
    };
  }, [data, search, filter, page, rowsPerPage]);

  async function fetchDetails(id: string) {
    setDetailsLoading(true);
    try {
    const token = typeof window !== "undefined" ? localStorage.getItem("adminAuth") : null;
      if (!token)
        throw new Error("Missing adminAuth token. Please log in as admin.");

      const res = await fetch(api.details(id), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch details");

      const data = await res.json();
      setDetailsData(data.data || data);
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          e instanceof Error
            ? e.message
            : "Network or server error. Please try again.",
      });
    } finally {
      setDetailsLoading(false);
    }
  }

  async function handleAction(
    type: "approve" | "cancel" | "delete",
    id: string
  ) {
    setActionLoading(id + type);
    try {
      // Corrected API endpoint for cancel
      const url =
        type === "cancel"
          ? api.cancel(id)
          : type === "approve"
          ? api.approve(id)
          : api.delete(id);

      // Use HTTP methods per backend routes:
      // - Training/Courses: approve/cancel/delete are PUT
      // - Orders: approve/cancel are PUT, delete is DELETE
      const method = section === "orders" && type === "delete" ? "DELETE" : "PUT";
      const token = typeof window !== "undefined" ? localStorage.getItem("adminAuth") : null;
      if (!token) throw new Error("Missing adminAuth token. Please log in as admin.");
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        const errorBody = await res.text();
        console.error("API Error Response:", errorBody);
        throw new Error(
          `Failed to ${type}. Status: ${res.status}. Body: ${errorBody}`
        );
      }

      // Corrected logic for updating state
      setData((prev: any) => {
        const currentData = Array.isArray(prev?.data)
          ? prev.data
          : prev?.requests || prev?.orders || [];

        // Find the item to update
        const updatedItems = currentData.map((item: any) => {
          const itemId = item.id || item.request_id || item.order_id;
          if (itemId === id) {
            // Update the status of the item locally
            return {
              ...item,
              status: type === "approve" ? "approved" : type === "cancel" ? "cancelled" : item.status,
            };
          }
          return item;
        });

        return { ...prev, data: updatedItems };
      });

      const actionMessages = {
        approve: "Request approved successfully!",
        cancel: "Request cancelled successfully!",
        delete: "Request deleted successfully!",
      };
      showSuccessToast(actionMessages[type]);
    } catch (e) {
      console.error(e);
      showErrorToast(e instanceof Error ? e.message : "Network or server error. Please check your backend and try again.");
    } finally {
      setActionLoading(null);
      setConfirm(null);
    }
  }

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
      <CardContent>
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Search className="h-5 w-5 text-indigo-600" />
              Search & Filter Requests
            </CardTitle>
            <CardDescription className="text-slate-600">
              Find requests by any field or filter by status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <Input
                    placeholder={`Search ${section} requests...`}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-12 h-12 text-base border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  {search && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 text-slate-400 hover:text-slate-600"
                      onClick={() => setSearch("")}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-full md:w-48 h-12 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500">
                  <Filter className="h-4 w-4 mr-2 text-slate-500" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(search || filter !== "all") && (
              <div className="mt-4 flex items-center gap-3">
                <span className="text-sm text-slate-600">
                  Found {filtered.length} {section} requests
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setFilter("all");
                  }}
                  className="h-7 px-3 text-xs hover:bg-slate-50"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 font-semibold text-left text-slate-700">
                  ID
                </th>
                <th className="px-4 py-3 font-semibold text-left text-slate-700">
                  User
                </th>
                <th className="px-4 py-3 font-semibold text-left text-slate-700">
                  Status
                </th>
                <th className="px-4 py-3 font-semibold text-left text-slate-700">
                  Created
                </th>
                <th className="px-4 py-3 font-semibold text-center text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: rowsPerPage }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-4 bg-slate-50" colSpan={5}>
                      <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto" />
                    </td>
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16">
                    <div className="flex flex-col items-center justify-center gap-2">
                      {section === "training" ? (
                        <CheckCircle className="h-8 w-8 text-slate-300" />
                      ) : section === "courses" ? (
                        <BookOpen className="h-8 w-8 text-slate-300" />
                      ) : (
                        <DollarSign className="h-8 w-8 text-slate-300" />
                      )}
                      <h3 className="text-lg font-semibold text-slate-700">
                        {search
                          ? "No matching requests found"
                          : "No requests yet"}
                      </h3>
                      <p className="text-slate-500 max-w-md">
                        {search
                          ? "Try adjusting your search criteria"
                          : `There are no ${section} requests to display at this time.`}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((item: any, idx: number) => (
                  <tr
                    key={item.id || item.request_id || item.order_id || idx}
                    className="hover:bg-slate-50 transition-colors duration-150 border-b border-slate-100"
                  >
                    <td className="px-4 py-3 text-slate-700">
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
                        className={`${
                          (item.status ||
                            item.request_status ||
                            item.order_status) === "approved"
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : (item.status ||
                                item.request_status ||
                                item.order_status) === "cancelled"
                            ? "bg-red-100 text-red-800 hover:bg-red-200"
                            : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                        }`}
                      >
                        {item.status ||
                          item.request_status ||
                          item.order_status ||
                          "pending"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const id =
                              item.id || item.request_id || item.order_id;
                            setDetailsItem(item);
                            fetchDetails(id);
                          }}
                          disabled={!!actionLoading}
                          className="h-9 w-9 p-0 hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-150"
                        >
                          <Eye className="h-4 w-4 text-indigo-600" />
                        </Button>
                        {(item.status ||
                          item.request_status ||
                          item.order_status) !== "approved" && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={!!actionLoading}
                            onClick={() =>
                              setConfirm({
                                type: "approve",
                                id: item.id || item.request_id || item.order_id,
                              })
                            }
                            className="h-9 w-9 p-0 hover:bg-green-50 hover:border-green-200 transition-all duration-150"
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        {(item.status ||
                          item.request_status ||
                          item.order_status) !== "cancelled" && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={!!actionLoading}
                            onClick={() =>
                              setConfirm({
                                type: "cancel",
                                id: item.id || item.request_id || item.order_id,
                              })
                            }
                            className="h-9 w-9 p-0 hover:bg-yellow-50 hover:border-yellow-200 transition-all duration-150"
                          >
                            <XCircle className="h-4 w-4 text-yellow-600" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!!actionLoading}
                          onClick={() =>
                            setConfirm({
                              type: "delete",
                              id: item.id || item.request_id || item.order_id,
                            })
                          }
                          className="h-9 w-9 p-0 hover:bg-red-50 hover:border-red-200 transition-all duration-150"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 p-6 border-t bg-slate-50">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
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
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
        {confirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4 text-slate-900">
                {confirm.type === "delete"
                  ? "Delete Request"
                  : confirm.type === "approve"
                  ? "Approve Request"
                  : "Cancel Request"}
              </h2>
              <p className="mb-6 text-slate-600">
                Are you sure you want to {confirm.type} this request? This
                action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setConfirm(null)}
                  disabled={!!actionLoading}
                  className="px-6 bg-transparent"
                >
                  Cancel
                </Button>
                <Button
                  variant={
                    confirm.type === "delete"
                      ? "destructive"
                      : confirm.type === "approve"
                      ? "default"
                      : "secondary"
                  }
                  disabled={!!actionLoading}
                  onClick={() => {
                    if (confirm) {
                      handleAction(confirm.type, confirm.id);
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Confirm ${confirm.type}`
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        )}

        {/* Details Dialog */}
        <Dialog
          open={!!detailsItem}
          onOpenChange={(open) => !open && setDetailsItem(null)}
        >
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-4 border-b border-slate-200 mb-4">
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-xl">
                  {section === "training" ? (
                    <CheckCircle className="h-6 w-6 text-indigo-600" />
                  ) : section === "courses" ? (
                    <BookOpen className="h-6 w-6 text-indigo-600" />
                  ) : (
                    <DollarSign className="h-6 w-6 text-indigo-600" />
                  )}
                </div>
                <span className="bg-gradient-to-r from-indigo-700 to-indigo-500 bg-clip-text text-transparent">
                  {section === "training"
                    ? "Training"
                    : section === "courses"
                    ? "Course"
                    : "Order"}{" "}
                  Request Details
                </span>
              </DialogTitle>
              <DialogDescription className="text-slate-500 mt-2 text-base">
                Detailed information about this {section} request
              </DialogDescription>
            </DialogHeader>
            <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>

            {detailsLoading ? (
              <div className="flex justify-center p-8">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-100 rounded-full blur-xl opacity-50 animate-pulse"></div>
                    <Loader2 className="h-12 w-12 animate-spin text-indigo-600 relative z-10" />
                  </div>
                  <p className="text-slate-600 font-medium">
                    Loading request details...
                  </p>
                  <p className="text-slate-400 text-sm">
                    This may take a moment
                  </p>
                </div>
              </div>
            ) : detailsData ? (
              <div className="grid gap-6 py-4 px-2">
                {/* training */}
                {section === "training" && (
                  <>
                    <div className="bg-gradient-to-br from-white to-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                      <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2 pb-2 border-b border-slate-200">
                        <div className="p-1.5 bg-indigo-100 rounded-lg">
                          <CheckCircle className="h-4 w-4 text-indigo-600" />
                        </div>
                        <span className="text-lg">Visitor Information</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <DetailItem
                          label="Name"
                          value={detailsData.name || detailsData.user_name}
                        />
                        <DetailItem label="Age" value={detailsData.age} />
                        <DetailItem
                          label="Email"
                          value={detailsData.email || detailsData.user_email}
                        />
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-white to-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                      <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2 pb-2 border-b border-slate-200">
                        <div className="p-1.5 bg-indigo-100 rounded-lg">
                          <CheckCircle className="h-4 w-4 text-indigo-600" />
                        </div>
                        <span className="text-lg">Training Details</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <DetailItem
                          label="Start Date"
                          value={
                            detailsData.start_date
                              ? new Date(
                                  detailsData.start_date
                                ).toLocaleDateString()
                              : null
                          }
                        />
                        <DetailItem
                          label="End Date"
                          value={
                            detailsData.end_date
                              ? new Date(
                                  detailsData.end_date
                                ).toLocaleDateString()
                              : null
                          }
                        />
                        <DetailItem
                          label="Training Per Week"
                          value={detailsData.training_per_week}
                        />
                        <DetailItem
                          label="Training Place"
                          value={detailsData.training_place}
                        />
                        <DetailItem label="Weight" value={detailsData.weight} />
                        <DetailItem label="Height" value={detailsData.height} />
                        <div className="space-y-2 col-span-2">
                          <div className="text-sm text-slate-500">Status</div>
                          <div>
                            <Badge
                              className={`${
                                detailsData.status === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : detailsData.status === "cancelled"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {detailsData.status || "pending"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-white to-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                      <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2 pb-2 border-b border-slate-200">
                        <div className="p-1.5 bg-indigo-100 rounded-lg">
                          <CheckCircle className="h-4 w-4 text-indigo-600" />
                        </div>
                        <span className="text-lg">Health Information</span>
                      </h3>
                      <div className="space-y-4">
                        <TextDetailItem
                          label="Injury Details"
                          value={detailsData.injury_details}
                        />
                        <TextDetailItem
                          label="Diseases Details"
                          value={detailsData.diseases_details}
                        />
                        <TextDetailItem
                          label="Goal Description"
                          value={detailsData.goal_description}
                        />
                      </div>
                    </div>
                  </>
                )}
                {/*courses  */}
                {section === "courses" && (
                  <div className="bg-gradient-to-br from-white to-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2 pb-2 border-b border-slate-200">
                      <div className="p-1.5 bg-indigo-100 rounded-lg">
                        <BookOpen className="h-4 w-4 text-indigo-600" />
                      </div>
                      <span className="text-lg">Course Details</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <DetailItem
                        label="Course Name"
                        value={detailsData.course_name}
                      />
                      <DetailItem
                        label="Course Price"
                        value={`$${detailsData.course_price}`}
                      />
                      <DetailItem
                        label="Student Name"
                        value={detailsData.student_name}
                      />
                      <div className="space-y-2">
                        <div className="text-sm text-slate-500">Status</div>
                        <Badge
                          className={`${
                            detailsData.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : detailsData.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {detailsData.status || "pending"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
                {/*orders  */}
                {section === "orders" && (
                  <div className="bg-gradient-to-br from-white to-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2 pb-2 border-b border-slate-200">
                      <div className="p-1.5 bg-indigo-100 rounded-lg">
                        <DollarSign className="h-4 w-4 text-indigo-600" />
                      </div>
                      <span className="text-lg">Order Details</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <DetailItem
                        label="Customer Name"
                        value={detailsData.customer_name}
                      />
                      <DetailItem
                        label="Total Price"
                        value={`$${detailsData.total_price}`}
                      />
                      <div className="space-y-2">
                        <div className="text-sm text-slate-500">Status</div>
                        <Badge
                          className={`${
                            detailsData.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : detailsData.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {detailsData.status || "pending"}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-6 border-t border-slate-200 pt-4">
                      <h4 className="font-semibold text-slate-800 text-base mb-2">
                        Order Items
                      </h4>
                      <ul className="space-y-2">
                        {detailsData.order_items?.length > 0 ? (
                          detailsData.order_items.map(
                            (item: any, idx: number) => (
                              <li
                                key={idx}
                                className="flex justify-between items-center bg-white p-3 rounded-md border border-slate-200 shadow-sm"
                              >
                                <span className="font-medium text-slate-800">
                                  {item.product_name}
                                </span>
                                <span className="text-sm text-slate-500">
                                  Qty: {item.quantity} | ${item.price} each
                                </span>
                              </li>
                            )
                          )
                        ) : (
                          <li className="text-sm text-slate-500">
                            No items found.
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <AlertCircle className="h-8 w-8 mx-auto mb-3 text-slate-400" />
                <p className="font-medium text-slate-700 mb-1">
                  No details available
                </p>
                <p>The request details could not be loaded</p>
              </div>
            )}
            <div className="flex justify-end pt-4 border-t border-slate-200 mt-4">
              <DialogClose asChild>
                <Button variant="outline" className="px-6 bg-transparent">
                  Close
                </Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

// Helper components to reduce code duplication and improve readability
const DetailItem = ({ label, value }: { label: string; value: any }) => (
  <div className="space-y-2">
    <div className="text-sm text-slate-500">{label}</div>
    <div className="font-medium">{value || "-"}</div>
  </div>
);

const TextDetailItem = ({ label, value }: { label: string; value: any }) => (
  <div className="space-y-2">
    <div className="text-sm text-slate-500">{label}</div>
    <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
      {value || `No ${label.toLowerCase()} provided`}
    </div>
  </div>
);