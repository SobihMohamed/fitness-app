"use client";

import type React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";
import { API_CONFIG } from "@/config/api";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  UserCheck,
  Loader2,
  CheckCircle,
  AlertCircle,
  Package,
  Bell,
  ShoppingBag,
  Calendar,
  TrendingUp,
  Eye,
  Trash2,
  ExternalLink,
  CreditCard,
  Clock,
  Star,
  X,
  Search,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";


interface ProfileData {
  name: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  user_type: string;
}

interface Order {
  id: string;
  total_price: number;
  status: string;
  created_at: string;
  products?: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  type?: string;
}


export default function DashboardPage() {

  const { user, isLoading, isInitialized } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [form, setForm] = useState<ProfileData & { password?: string }>({
    name: "",
    email: "",
    phone: "",
    address: "",
    country: "",
    user_type: "",
    password: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  // Order details modal state
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderDetailsLoading, setOrderDetailsLoading] = useState(false);
  const [orderDetailsError, setOrderDetailsError] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<any | null>(null);
  const [orderIdQuery, setOrderIdQuery] = useState("");

  const baseURL = API_CONFIG.BASE_URL;


  useEffect(() => {
    // Wait for auth to initialize
    if (!isInitialized) return;

    // Redirect if not logged in
    if (!user) {
      router.push("/");
      return;
    }

    loadDashboardData();
  }, [user, router, isInitialized]);

  const loadDashboardData = async () => {
    setLoading(true);
    await Promise.all([
      loadProfile(),
      loadOrders(),
      loadNotifications()
    ]);
    setLoading(false);
  };

  // Load a single order's full details
  const loadOrderDetails = async (orderId: string) => {
    try {
      setOrderDetailsLoading(true);
      setOrderDetailsError(null);
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const headers = { Authorization: `Bearer ${token}` } as const;
      const url = API_CONFIG.USER_FUNCTIONS.orders.getById(String(orderId));

      let response;
      try {
        // Primary attempt: GET /orders/showMyOrder/:id
        response = await axios.get(url, { headers });
      } catch (err: any) {
        const status = err?.response?.status;
        // Fallbacks for some backends that require POST or body
        if (status === 403 || status === 404 || status === 405) {
          try {
            // Try POST to the same URL (some PHP stacks accept both)
            response = await axios.post(url, {}, { headers });
          } catch (err2: any) {
            try {
              // Try POST to /orders/showMyOrder with id in body using common keys
              const base = API_CONFIG.USER_FUNCTIONS.orders.getById("").replace(/\/$/, "");
              const alt = base.endsWith("/") ? `${base}orders/showMyOrder` : `${API_CONFIG.BASE_URL}/orders/showMyOrder`;
              response = await axios.post(
                alt,
                { id: orderId, order_id: orderId },
                { headers }
              );
            } catch (err3: any) {
              // As a last resort, try to construct details from cached orders
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
                // Provide context that this is partial data
                setOrderDetailsError(
                  err3?.response?.data?.message ||
                    err2?.response?.data?.message ||
                    err?.response?.data?.message ||
                    "Showing cached order data. Full order details could not be fetched (possibly unauthorized)."
                );
                return;
              }
              // If no cached order, rethrow to show error below
              throw err3;
            }
          }
        } else {
          throw err;
        }
      }

      // Normalize response shape defensively
      const raw = response?.data?.order || response?.data?.data || response?.data || {};
      const normalized = {
        id: String(raw.id || raw.order_id || orderId),
        status: String(raw.status || raw.status_name || "unknown"),
        total_price: Number(raw.total_price || raw.total || raw.amount || 0),
        created_at: String(raw.created_at || raw.createdAt || raw.date || new Date().toISOString()),
        payment_method: raw.payment_method || raw.paymentMethod || "-",
        shipping_address: raw.shipping_address || raw.address || null,
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
      const msg =
        e?.response?.data?.message ||
        (status === 403
          ? "Unauthorized to view this order."
          : status === 404
          ? "Order not found."
          : "Failed to load order details");
      setOrderDetailsError(msg);
      setOrderDetails(null);
    } finally {
      setOrderDetailsLoading(false);
    }
  };

  const openOrderDetails = (orderId: string) => {
    setOrderModalOpen(true);
    loadOrderDetails(orderId);
  };

  const closeOrderDetails = () => {
    setOrderModalOpen(false);
    setOrderDetails(null);
    setOrderDetailsError(null);
  };

  const loadProfile = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await axios.get(API_CONFIG.USER_FUNCTIONS.user.profile, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let profileData = response.data;
      if (response.data.user) profileData = response.data.user;
      else if (response.data.data) profileData = response.data.data;

      setProfile({
        name: profileData.name || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        address: profileData.address || "",
        country: profileData.country || "",
        user_type: profileData.user_type || "",
      });
      setForm({
        name: profileData.name || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        address: profileData.address || "",
        country: profileData.country || "",
        user_type: profileData.user_type || "",
        password: "",
      });
    } catch (error: any) {
      console.error("Failed to load profile:", error);
      if (user) {
        setProfile({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          address: user.address || "",
          country: user.country || "",
          user_type: user.user_type || "",
        });
        setForm({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          address: user.address || "",
          country: user.country || "",
          user_type: user.user_type || "",
          password: "",
        });
      }
    }
  };

  const startEditing = () => {
    if (profile) {
      setForm({ ...profile, password: "" });
    }
    setIsEditing(true);
  };

  const cancelEditing = () => {
    if (profile) setForm({ ...profile, password: "" });
    setIsEditing(false);
  };

  const handleChange = (field: keyof ProfileData | "password", value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const saveProfile = async () => {
    try {
      setIsSaving(true);
      setMessage(null);
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      // Build payload: include only fields we allow to update; omit empty password
      const payload: any = {
        name: form.name?.trim() ?? "",
        email: form.email?.trim() ?? "",
        phone: form.phone?.trim() ?? "",
        address: form.address?.trim() ?? "",
        country: form.country?.trim() ?? "",
      };
      if (form.password && form.password.trim().length > 0) {
        payload.password = form.password.trim();
      }

      await axios.post(API_CONFIG.USER_FUNCTIONS.user.updateProfile, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage({ type: "success", text: "Profile updated successfully." });
      toast.success("Profile updated successfully.");
      setIsEditing(false);
      await loadProfile();
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      setMessage({
        type: "error",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to update profile",
      });
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update profile"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const loadOrders = async () => {
    try {
      setOrdersLoading(true);
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await axios.get(API_CONFIG.USER_FUNCTIONS.orders.getMyOrders, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const ordersData = response.data.orders || response.data.data || response.data || [];
      const normalized = (Array.isArray(ordersData) ? ordersData : []).map((raw: any) => {
        // Defensive normalization for different backends
        const id = String(raw.id || raw.order_id || raw._id || "");
        const status = String(raw.status || raw.status_name || raw.state || "");
        const createdAt = String(
          raw.created_at ||
            raw.purchase_date ||
            raw.createdAt ||
            raw.date ||
            new Date().toISOString()
        );
        const total = Number(
          raw.total_price ||
            raw.net_total ||
            raw.total ||
            raw.amount ||
            raw.original_total ||
            0
        );
        // Try to unify products/items if provided
        const products = Array.isArray(raw.products || raw.items)
          ? (raw.products || raw.items).map((p: any) => ({
              id: String(p.id || p.product_id || Math.random()),
              name: p.name || p.title || "Product",
              price: Number(p.price || p.unit_price || p.net_price || 0),
              quantity: Number(p.quantity || p.qty || 1),
            }))
          : undefined;
        return {
          id,
          total_price: total,
          status,
          created_at: createdAt,
          products,
        } as Order;
      });
      setOrders(normalized);
    } catch (error: any) {
      console.error("Failed to load orders:", error);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      setNotificationsLoading(true);
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await axios.get(API_CONFIG.USER_FUNCTIONS.notifications.getAll, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const notificationsData = response.data?.notifications || response.data?.data || response.data || [];
      const normalized = (Array.isArray(notificationsData) ? notificationsData : []).map((raw: any) => {
        const readRaw = raw?.is_read ?? raw?.isRead ?? raw?.read ?? raw?.seen;
        const isRead = readRaw === true || readRaw === 1 || readRaw === "1" || readRaw === "true" || readRaw === "yes";
        return {
          id: String(raw?.id ?? raw?.notification_id ?? raw?._id ?? ""),
          title: String(raw?.title ?? raw?.message_title ?? raw?.subject ?? "Notification"),
          message: String(raw?.message ?? raw?.content ?? raw?.body ?? ""),
          is_read: !!isRead,
          created_at: String(raw?.created_at ?? raw?.delivered_at ?? raw?.createdAt ?? new Date().toISOString()),
          type: raw?.type ?? raw?.category ?? undefined,
        } as Notification;
      }).filter((n: Notification) => n.id);

      setNotifications(normalized);
      return normalized;
    } catch (error: any) {
      console.error("Failed to load notifications:", error);
      setNotifications([]);
      return [] as Notification[];
    } finally {
      setNotificationsLoading(false);
    }
  };

  
  const markNotificationAsRead = async (id: string) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      await axios.post(API_CONFIG.USER_FUNCTIONS.notifications.markAsRead(id), {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, is_read: true } : notif
        )
      );
    } catch (error: any) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      // Some backends require notifications to be read before deletion
      const target = notifications.find((n) => n.id === id);
      if (target && !target.is_read) {
        try {
          await markNotificationAsRead(id);
        } catch {}
      }

      const url = API_CONFIG.USER_FUNCTIONS.notifications.delete(id);
      let deleteOk = false;
      try {
        await axios.delete(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        deleteOk = true;
      } catch (err: any) {
        // Give backend a moment; verify if it actually deleted despite 500
        await new Promise((r) => setTimeout(r, 200));
        const latestAfterDelete = await loadNotifications();
        const stillExistsAfterDelete = latestAfterDelete.some((n) => n.id === id);
        if (!stillExistsAfterDelete) {
          deleteOk = true;
        } else {
          // Try POST fallback only if still present
          try {
            await axios.post(url, {}, {
              headers: { Authorization: `Bearer ${token}` },
            });
            deleteOk = true;
          } catch (postErr: any) {
            // Final verification
            await new Promise((r) => setTimeout(r, 200));
            const latestAfterPost = await loadNotifications();
            const stillExistsAfterPost = latestAfterPost.some((n) => n.id === id);
            if (!stillExistsAfterPost) {
              deleteOk = true;
            } else {
              throw postErr;
            }
          }
        }
      }

      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
      setMessage({ type: "success", text: "Notification deleted successfully!" });
      toast.success("Notification deleted successfully!");
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        (error?.response?.status ? `Server error (${error.response.status})` : error?.message) ||
        "Failed to delete notification";
      setMessage({ type: "error", text: msg });
      toast.error(msg);
      console.error("Failed to delete notification:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'delivered':
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  
  if (!isInitialized || isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Welcome back, {profile?.name || user?.name || "User"}! 👋
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            Here's what's happening with your fitness journey
          </p>
        </div>



        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ShoppingBag className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Orders
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {orders.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Bell className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Notifications
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {notifications.filter((n) => !n.is_read).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Active Orders
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {
                      orders.filter(
                        (o) =>
                          o.status?.toLowerCase() === "pending" ||
                          o.status?.toLowerCase() === "processing"
                      ).length
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <User className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Account Type
                  </p>
                  <p className="text-lg font-bold text-gray-900 capitalize">
                    {profile?.user_type || "Member"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-blue-600" />
                    <span>Profile</span>
                  </div>
                  {!isEditing ? (
                    <Button variant="outline" size="sm" onClick={startEditing}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={cancelEditing} disabled={isSaving}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={saveProfile} disabled={isSaving}>
                        {isSaving ? (
                          <span className="flex items-center"><Loader2 className="h-4 w-4 mr-2 animate-spin"/>Saving...</span>
                        ) : (
                          <span>Save</span>
                        )}
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profile ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Name</p>
                      <Input
                        value={form.name}
                        disabled={!isEditing}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Email</p>
                      <Input
                        type="email"
                        value={form.email}
                        disabled={!isEditing}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="Your email"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Password</p>
                      <Input
                        type="password"
                        value={form.password || ""}
                        disabled={!isEditing}
                        onChange={(e) => handleChange("password", e.target.value)}
                        placeholder="Leave empty to keep current password"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Phone</p>
                      <Input
                        value={form.phone}
                        disabled={!isEditing}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        placeholder="Your phone"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Address</p>
                      <Input
                        value={form.address}
                        disabled={!isEditing}
                        onChange={(e) => handleChange("address", e.target.value)}
                        placeholder="Your address"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Country</p>
                      <Input
                        value={form.country}
                        disabled={!isEditing}
                        onChange={(e) => handleChange("country", e.target.value)}
                        placeholder="Your country"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Profile information not available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* My Orders */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-blue-600" />
                    <span>My Orders</span>
                    <Badge variant="secondary" className="ml-1">{orders.length}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Search by Order ID..."
                      className="h-8 w-44 sm:w-56"
                      value={orderIdQuery}
                      onChange={(e) => setOrderIdQuery(e.target.value)}
                    />
                    <Button variant="ghost" size="icon" onClick={loadOrders} title="Refresh orders">
                      <RefreshCw className={`h-4 w-4 ${ordersLoading ? "animate-spin" : ""}`} />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="flex items-center justify-center h-40 text-gray-600">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading orders...
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center text-gray-500 py-10">No orders found</div>
                ) : (
                  <ScrollArea className="h-[500px] pr-2">
                    <div className="space-y-3">
                      {orders
                        .filter((o) => (orderIdQuery ? String(o.id).toLowerCase().includes(orderIdQuery.toLowerCase()) : true))
                        .map((o) => (
                          <div key={o.id} className="p-3 border rounded-md bg-white">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-gray-900">Order #{o.id}</span>
                                  <Badge className={getStatusColor(o.status)}>{o.status || "-"}</Badge>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{formatDate(o.created_at)}</p>
                                <p className="text-sm text-gray-800 mt-1">
                                  Total: <span className="font-semibold">${Number(o.total_price || 0).toFixed(2)}</span>
                                </p>
                                {Array.isArray(o.products) && o.products.length > 0 && (
                                  <div className="mt-2 text-sm text-gray-700">
                                    <span className="text-gray-600">Items:</span>{" "}
                                    {o.products.slice(0, 3).map((p) => p.name).join(", ")}
                                    {o.products.length > 3 ? "…" : ""}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Button size="sm" onClick={() => openOrderDetails(String(o.id))}>
                                  <Eye className="h-4 w-4 mr-2" /> View Details
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white shadow-sm lg:sticky lg:top-8 h-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-yellow-600" />
                  <span>Notifications</span>
                  <Badge variant="secondary" className="ml-1">
                    {notifications.filter((n) => !n.is_read).length} unread
                  </Badge>
                </div>
                <Button variant="ghost" size="icon" onClick={loadNotifications} title="Refresh notifications">
                  <RefreshCw className={`h-4 w-4 ${notificationsLoading ? "animate-spin" : ""}`} />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {notificationsLoading ? (
                <div className="flex items-center justify-center h-40 text-gray-600">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center text-gray-500 py-10">No notifications found</div>
              ) : (
                <ScrollArea className="h-[500px] pr-2">
                  <div className="space-y-3">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 border rounded-md ${!n.is_read ? "bg-yellow-50" : "bg-white"}`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{n.title}</h4>
                            <p className="text-sm text-gray-700 mt-1">{n.message}</p>
                            <p className="text-xs text-gray-500 mt-2">{formatDate(n.created_at)}</p>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteNotification(n.id)}
                              title="Delete notification"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => markNotificationAsRead(n.id)}
                              disabled={n.is_read}
                              title={n.is_read ? "Already read" : "Mark as read"}
                            >
                              <CheckCircle className={`h-4 w-4 ${n.is_read ? "text-gray-300" : "text-green-600"}`} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Details Modal */}
        {orderModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={closeOrderDetails} />
            <div className="relative bg-white w-[95%] max-w-3xl rounded-lg shadow-lg">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Order Details</h3>
                </div>
                <Button variant="ghost" size="icon" onClick={closeOrderDetails}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="p-4">
                {orderDetailsLoading ? (
                  <div className="flex items-center justify-center h-40 text-gray-600">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading order...
                  </div>
                ) : orderDetailsError ? (
                  <Alert variant="destructive">
                    <AlertDescription>{orderDetailsError}</AlertDescription>
                  </Alert>
                ) : orderDetails ? (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge>Order #{orderDetails.id}</Badge>
                      <Badge className={getStatusColor(orderDetails.status)}>{orderDetails.status}</Badge>
                      <span className="text-sm text-gray-600">{formatDate(orderDetails.created_at)}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div className="p-3 rounded-md bg-slate-50">
                        <p className="text-gray-600">Total</p>
                        <p className="text-gray-900 font-semibold text-lg">${Number(orderDetails.total_price || 0).toFixed(2)}</p>
                      </div>
                      <div className="p-3 rounded-md bg-slate-50">
                        <p className="text-gray-600">Payment Method</p>
                        <p className="text-gray-900 font-medium">{orderDetails.payment_method || "-"}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Items</h4>
                      {Array.isArray(orderDetails.items) && orderDetails.items.length > 0 ? (
                        <div className="max-h-72 overflow-auto border rounded-md">
                          <table className="min-w-full text-sm">
                            <thead className="bg-slate-50 text-gray-700">
                              <tr>
                                <th className="text-left px-3 py-2">Product</th>
                                <th className="text-left px-3 py-2">Price</th>
                                <th className="text-left px-3 py-2">Qty</th>
                                <th className="text-left px-3 py-2">Subtotal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {orderDetails.items.map((it: any) => (
                                <tr key={it.id} className="border-t">
                                  <td className="px-3 py-2 text-gray-900">{it.name || `#${it.id}`}</td>
                                  <td className="px-3 py-2">${Number(it.price || 0).toFixed(2)}</td>
                                  <td className="px-3 py-2">{Number(it.quantity || 1)}</td>
                                  <td className="px-3 py-2 font-medium">${(Number(it.price || 0) * Number(it.quantity || 1)).toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">No items found for this order.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-10">No order selected</div>
                )}
              </div>
              <div className="p-4 border-t flex justify-end">
                <Button onClick={closeOrderDetails}>Close</Button>
              </div>
            </div>
          </div>
        )}

     </div>
    </div>
  );
}
