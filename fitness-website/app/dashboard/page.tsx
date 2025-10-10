"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { 
  ShoppingBag, 
  Bell, 
  TrendingUp, 
  BookOpen, 
  Users, 
  GraduationCap,
  Loader2,
  X,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDashboardData } from "@/hooks/dashboard/use-user-dashboard-data";
import axios from "axios";
import { API_CONFIG } from "@/config/api";
import { toast } from "sonner";

// Lazy load heavy components for better performance
const StatsCard = dynamic(() => import("@/components/dashboard/StatsCard").then(m => ({ default: m.StatsCard })), {
  loading: () => <div className="h-24 bg-gray-100 animate-pulse rounded-lg" />
});
const ProfileSection = dynamic(() => import("@/components/dashboard/ProfileSection").then(m => ({ default: m.ProfileSection })), {
  loading: () => <div className="h-48 bg-gray-100 animate-pulse rounded-lg" />
});
const OrdersSection = dynamic(() => import("@/components/dashboard/OrdersSection").then(m => ({ default: m.OrdersSection })), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
});
const CoursesSection = dynamic(() => import("@/components/dashboard/CoursesSection").then(m => ({ default: m.CoursesSection })), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
});
const NotificationsSection = dynamic(() => import("@/components/dashboard/NotificationsSection").then(m => ({ default: m.NotificationsSection })), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />
});
const StatsSkeleton = dynamic(() => import("@/components/dashboard/LoadingSkeleton").then(m => ({ default: m.StatsSkeleton })), {
  loading: () => <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-lg" />
    ))}
  </div>
});

// Order details modal state
interface OrderDetails {
  id: string;
  status: string;
  total_price: number;
  created_at: string;
  payment_method: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}

export default function DashboardPage() {
  const { user, isLoading, isInitialized } = useAuth();
  const router = useRouter();
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderDetailsLoading, setOrderDetailsLoading] = useState(false);
  const [orderDetailsError, setOrderDetailsError] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);

  // Use custom hook for dashboard data
  const {
    profile,
    orders = [],
    notifications = [],
    subscribedCourses = [],
    trainingRequests = [],
    courseRequests = [],
    loading,
    actions = {}
  } = useDashboardData(user);

  useEffect(() => {
    // Wait for auth to initialize
    if (!isInitialized) return;

    // Redirect if not logged in
    if (!user) {
      router.push("/");
      return;
    }
  }, [user, router, isInitialized]);

  // Memoized utility functions for better performance
  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'delivered':
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }, []);

  // Load order details for modal
  const loadOrderDetails = useCallback(async (orderId: string) => {
    try {
      setOrderDetailsLoading(true);
      setOrderDetailsError(null);
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const headers = { Authorization: `Bearer ${token}` } as const;
      const url = API_CONFIG.USER_FUNCTIONS.orders.getById(String(orderId));

      let response;
      try {
        response = await axios.get(url, { headers });
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 403 || status === 404 || status === 405) {
          try {
            response = await axios.post(url, {}, { headers });
          } catch (err2: any) {
            const cached = orders.find((o) => String(o.id) === String(orderId));
            if (cached) {
              setOrderDetails({
                id: String(cached.id),
                status: cached.status || "unknown",
                total_price: Number(cached.total_price || 0),
                created_at: String(cached.created_at || new Date().toISOString()),
                payment_method: "-",
                items: Array.isArray(cached.products)
                  ? cached.products.map((p: any) => ({
                      id: String(p.id || p.product_id || Math.random()),
                      name: p.name || p.title || "Item",
                      price: Number(p.price || p.unit_price || 0),
                      quantity: Number(p.quantity || p.qty || 1),
                    }))
                  : [],
              });
              setOrderDetailsError("Showing cached order data. Full details unavailable.");
              return;
            }
            throw err2;
          }
        } else {
          throw err;
        }
      }

      const raw = response?.data?.order || response?.data?.data || response?.data || {};
      const normalized = {
        id: String(raw.id || raw.order_id || orderId),
        status: String(raw.status || raw.status_name || "unknown"),
        total_price: Number(raw.total_price || raw.total || raw.amount || 0),
        created_at: String(raw.created_at || raw.createdAt || raw.date || new Date().toISOString()),
        payment_method: raw.payment_method || raw.paymentMethod || "-",
        items: Array.isArray(raw.products || raw.items)
          ? (raw.products || raw.items).map((p: any) => ({
              id: String(p.id || p.product_id || Math.random()),
              name: p.name || p.title || "Item",
              price: Number(p.price || p.unit_price || 0),
              quantity: Number(p.quantity || p.qty || 1),
            }))
          : [],
      };

      setOrderDetails(normalized);
    } catch (e: any) {
      console.error("Failed to load order details:", e);
      const status = e?.response?.status;
      const msg = e?.response?.data?.message || 
        (status === 403 ? "Unauthorized to view this order." :
         status === 404 ? "Order not found." : 
         "Failed to load order details");
      setOrderDetailsError(msg);
      setOrderDetails(null);
    } finally {
      setOrderDetailsLoading(false);
    }
  }, [orders]);

  const openOrderDetails = (orderId: string) => {
    setOrderModalOpen(true);
    loadOrderDetails(orderId);
  };

  const closeOrderDetails = () => {
    setOrderModalOpen(false);
    setOrderDetails(null);
    setOrderDetailsError(null);
  };

  // Show loading state
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-gray-700 text-lg font-medium">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  // Memoized calculations for better performance
  const isAnyLoading = useMemo(() => 
    Object.values(loading || {}).some(Boolean), 
    [loading]
  );
  
  const hasValidData = useMemo(() => 
    orders && notifications && subscribedCourses && trainingRequests && courseRequests,
    [orders, notifications, subscribedCourses, trainingRequests, courseRequests]
  );

  // Memoized stats calculations
  const statsData = useMemo(() => ({
    totalOrders: orders?.length || 0,
    unreadNotifications: notifications?.filter((n) => !n.is_read)?.length || 0,
    activeOrders: orders?.filter((o) => 
      o.status?.toLowerCase() === "pending" || 
      o.status?.toLowerCase() === "processing"
    )?.length || 0,
    totalCourses: subscribedCourses?.length || 0,
    trainingRequestsCount: trainingRequests?.length || 0,
    courseRequestsCount: courseRequests?.length || 0
  }), [orders, notifications, subscribedCourses, trainingRequests, courseRequests]);
  
  // Safe action handlers with fallbacks
  const safeActions = {
    updateProfile: (actions as any)?.updateProfile || (async () => {
      console.log("updateProfile action not available");
    }),
    loadOrders: (actions as any)?.loadOrders || (async () => {
      console.log("loadOrders action not available");
    }),
    loadSubscribedCourses: (actions as any)?.loadSubscribedCourses || (async () => {
      console.log("loadSubscribedCourses action not available");
    }),
    loadNotifications: (actions as any)?.loadNotifications || (async () => {
      console.log("loadNotifications action not available");
    }),
    markNotificationAsRead: (actions as any)?.markNotificationAsRead || (async () => {
      console.log("markNotificationAsRead action not available");
    }),
    deleteNotification: (actions as any)?.deleteNotification || (async () => {
      console.log("deleteNotification action not available");
    }),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-3">
            Welcome back, {profile?.name || user?.name || "User"}! 👋
          </h1>
          <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto">
            Track your fitness journey, manage your orders, and stay updated with your progress
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8">
          {isAnyLoading || !hasValidData ? (
            <StatsSkeleton />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              <StatsCard
                title="Total Orders"
                value={statsData.totalOrders}
                icon={ShoppingBag}
                iconColor="text-blue-600"
                bgColor="bg-blue-100"
              />
              <StatsCard
                title="Notifications"
                value={statsData.unreadNotifications}
                icon={Bell}
                iconColor="text-yellow-600"
                bgColor="bg-yellow-100"
              />
              <StatsCard
                title="Active Orders"
                value={statsData.activeOrders}
                icon={TrendingUp}
                iconColor="text-green-600"
                bgColor="bg-green-100"
              />
              <StatsCard
                title="My Courses"
                value={statsData.totalCourses}
                icon={BookOpen}
                iconColor="text-indigo-600"
                bgColor="bg-indigo-100"
              />
              <StatsCard
                title="Training Requests"
                value={statsData.trainingRequestsCount}
                icon={Users}
                iconColor="text-orange-600"
                bgColor="bg-orange-100"
              />
              <StatsCard
                title="Course Requests"
                value={statsData.courseRequestsCount}
                icon={GraduationCap}
                iconColor="text-purple-600"
                bgColor="bg-purple-100"
              />
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Section */}
            <ProfileSection
              profile={profile}
              isLoading={loading?.profile || false}
              onSave={safeActions.updateProfile}
            />

            {/* Orders Section */}
            <OrdersSection
              orders={orders}
              isLoading={loading?.orders || false}
              onRefresh={safeActions.loadOrders}
              onViewDetails={openOrderDetails}
            />

            {/* Courses Section */}
            <CoursesSection
              courses={subscribedCourses}
              isLoading={loading?.courses || false}
              onRefresh={safeActions.loadSubscribedCourses}
            />
          </div>

          {/* Right Column - Notifications */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <NotificationsSection
                notifications={notifications}
                isLoading={loading?.notifications || false}
                onRefresh={safeActions.loadNotifications}
                onMarkAsRead={safeActions.markNotificationAsRead}
                onDelete={safeActions.deleteNotification}
              />
            </div>
          </div>
        </div>

        {/* Order Details Modal */}
        {orderModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeOrderDetails} />
            <div className="relative bg-white w-full max-w-4xl rounded-xl shadow-2xl max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="h-6 w-6 text-blue-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Order Details</h3>
                </div>
                <Button variant="ghost" size="icon" onClick={closeOrderDetails}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <ScrollArea className="max-h-[70vh]">
                <div className="p-6">
                  {orderDetailsLoading ? (
                    <div className="flex items-center justify-center h-40 text-gray-600">
                      <Loader2 className="h-6 w-6 animate-spin mr-3" /> 
                      Loading order details...
                    </div>
                  ) : orderDetailsError ? (
                    <Alert variant="destructive">
                      <AlertDescription>{orderDetailsError}</AlertDescription>
                    </Alert>
                  ) : orderDetails ? (
                    <div className="space-y-6">
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge variant="outline" className="text-lg px-3 py-1">
                          Order #{orderDetails.id}
                        </Badge>
                        <Badge className={`${getStatusColor(orderDetails.status)} border text-sm px-3 py-1`}>
                          {orderDetails.status}
                        </Badge>
                        <span className="text-sm text-gray-600">{formatDate(orderDetails.created_at)}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                          <p className="text-sm font-medium text-gray-600 mb-1">Total Amount</p>
                          <p className="text-2xl font-bold text-green-700">
                            ${Number(orderDetails.total_price || 0).toFixed(2)}
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                          <p className="text-sm font-medium text-gray-600 mb-1">Payment Method</p>
                          <p className="text-lg font-semibold text-blue-700">
                            {orderDetails.payment_method || "Not specified"}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4 text-lg">Order Items</h4>
                        {Array.isArray(orderDetails.items) && orderDetails.items.length > 0 ? (
                          <div className="border rounded-lg overflow-hidden">
                            <table className="min-w-full">
                              <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                                <tr>
                                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Product</th>
                                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Price</th>
                                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Qty</th>
                                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Subtotal</th>
                                </tr>
                              </thead>
                              <tbody>
                                {orderDetails.items.map((item: any, index: number) => (
                                  <tr key={item.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                    <td className="px-4 py-3 text-gray-900 font-medium">
                                      {item.name || `Item #${item.id}`}
                                    </td>
                                    <td className="px-4 py-3 text-gray-700">
                                      ${Number(item.price || 0).toFixed(2)}
                                    </td>
                                    <td className="px-4 py-3 text-gray-700">
                                      {Number(item.quantity || 1)}
                                    </td>
                                    <td className="px-4 py-3 font-semibold text-gray-900">
                                      ${(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p>No items found for this order</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-10">No order selected</div>
                  )}
                </div>
              </ScrollArea>
              
              <div className="p-6 border-t bg-gray-50 flex justify-end">
                <Button onClick={closeOrderDetails} className="px-6">
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
