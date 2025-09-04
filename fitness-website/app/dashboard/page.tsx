"use client";

import type React from "react";

import { useAuth } from "@/contexts/auth-context";
import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  AlertCircle,
  Loader2,
  ShoppingBag,
  Bell,
  CheckCircle,
  Edit3,
  Save,
  X,
  Trash2,
  Clock,
  DollarSign,
  Package,
} from "lucide-react";
import { API_CONFIG } from "@/config/api";
import { formatDateUTC } from "@/utils/format";

// Define interfaces for data structures
interface ProfileData {
  name: string;
  email: string;
  phone?: string;
  user_type?: string;
  address?: string;
  country?: string;
}

interface OrderData {
  _id: string;
  orderNumber?: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface NotificationItem {
  notification_id: string;
  message_title?: string;
  content: string;
  isRead?: boolean;
  created_at?: string;
}

const getStatusColor = (status: string) => {
  const statusLower = status.toLowerCase();
  if (statusLower.includes("completed") || statusLower.includes("delivered")) {
    return "bg-emerald-100 text-emerald-800 border-emerald-200";
  }
  if (statusLower.includes("pending") || statusLower.includes("processing")) {
    return "bg-amber-100 text-amber-800 border-amber-200";
  }
  if (statusLower.includes("cancelled") || statusLower.includes("failed")) {
    return "bg-red-100 text-red-800 border-red-200";
  }
  return "bg-blue-100 text-blue-800 border-blue-200";
};

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const token =
    typeof window !== "undefined" ? sessionStorage.getItem("token") : null;

  // Profile state
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [formData, setFormData] = useState<ProfileData | null>(null);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Orders
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  // Profile edit mode
  const [editMode, setEditMode] = useState(false);

  const unreadNotifications = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const totalOrderValue = useMemo(
    () => orders.reduce((sum, order) => sum + order.totalAmount, 0),
    [orders]
  );

  useEffect(() => {
    if (message?.type === "success") {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Auth gate (keep minimal)
  useEffect(() => {
    // If you want to redirect, do it in a higher-order layout. Here we just guard render below.
  }, [user, isLoading]);

  // Fetch minimal dashboard data
  useEffect(() => {
    if (user && token) {
      fetchProfileData();
      fetchOrderData();
      fetchNotifications();
    }
  }, [user, token]);

  const fetchProfileData = useCallback(async () => {
    try {
      const response = await axios.get(API_CONFIG.USER_FUNCTIONS.user.profile, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Normalize possible response shapes
      let profileData: any = response.data;
      if (response?.data?.user) {
        profileData = response.data.user;
      } else if (response?.data?.data) {
        profileData = response.data.data;
      }

      if (profileData) {
        const normalized = {
          name: profileData.name || "",
          email: profileData.email || "",
          phone: profileData.phone || "",
          address: profileData.address || "",
          country: profileData.country || "",
          user_type: profileData.user_type || profileData.role || "",
        };
        setProfile(normalized);
        setFormData(normalized);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      // If API fails, use user data from auth context as fallback
      if (user) {
        const fallbackData = {
          name: user.name || "",
          email: user.email || "",
          user_type: user.role || "user",
        };
        setProfile(fallbackData as ProfileData);
        setFormData(fallbackData as ProfileData);
      }
    }
  }, [token, user]);

  const fetchOrderData = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const response = await axios.get(
        API_CONFIG.USER_FUNCTIONS.RequestOreders.showAllUserOrders,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.data) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoadingOrders(false);
    }
  }, [token]);

  const fetchNotifications = useCallback(async (): Promise<
    NotificationItem[]
  > => {
    setLoadingNotifications(true);
    try {
      const response = await axios.get(
        API_CONFIG.USER_FUNCTIONS.Notifications.getAllNotificationForThisUser,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const raw = response?.data?.data || response?.data?.notifications || [];
      const list: NotificationItem[] = Array.isArray(raw)
        ? raw.map((it: any) => {
            const rawRead = it.is_read ?? it.isRead ?? it.read;
            const isRead =
              rawRead === true ||
              rawRead === 1 ||
              rawRead === "1" ||
              rawRead === "true" ||
              rawRead === "yes";
            return {
              notification_id: it.notification_id ?? it._id ?? it.id ?? "",
              message_title: it.message_title ?? it.title ?? undefined,
              content: it.content ?? it.message ?? "",
              isRead: !!isRead,
              created_at: it.created_at ?? it.createdAt ?? undefined,
            };
          })
        : [];
      setNotifications(list);
      return list;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return [];
    } finally {
      setLoadingNotifications(false);
    }
  }, [token]);

  const markNotificationRead = useCallback(
    async (id: string) => {
      try {
        await axios.put(
          API_CONFIG.USER_FUNCTIONS.Notifications.MarkAsRead(id),
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setNotifications((prev) =>
          prev.map((n) =>
            String(n.notification_id) === String(id)
              ? { ...n, isRead: true }
              : n
          )
        );
      } catch (error: any) {
        const serverMsg =
          error?.response?.data?.message ||
          error?.response?.data ||
          error?.message ||
          "Failed to mark as read";
        console.error("Error marking notification as read:", serverMsg);
        setMessage({ type: "error", text: String(serverMsg) });
      }
    },
    [token]
  );

  const deleteNotification = useCallback(
    async (id: string) => {
      // Optimistic UI: remove immediately
      const prevList = notifications;
      setNotifications((prev) =>
        prev.filter((n) => String(n.notification_id) !== String(id))
      );

      try {
        const url =
          API_CONFIG.USER_FUNCTIONS.Notifications.DeleteNotification(id);
        await axios.delete(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Success: refresh from server to ensure parity
        fetchNotifications();
      } catch (error: any) {
        const serverMsg =
          error?.response?.data?.message ||
          error?.response?.data ||
          error?.message ||
          "Failed to delete notification";
        // Graceful handling: refetch to verify if deletion actually happened
        const latest = await fetchNotifications();
        const stillExists = latest.some(
          (n) => String(n.notification_id) === String(id)
        );
        if (stillExists) {
          // True failure: revert UI and show error
          console.error("Error deleting notification:", serverMsg);
          setMessage({ type: "error", text: String(serverMsg) });
          setNotifications(prevList);
        } else {
          // Server returned error but item is gone; keep UI and avoid noisy error
          console.warn(
            "Delete reported error but item was removed:",
            serverMsg
          );
        }
      }
    },
    [token, notifications, fetchNotifications]
  );

  // Handle form input changes
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => (prev ? { ...prev, [name]: value } : null));
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData) return;

      setUpdating(true);
      setMessage(null);

      try {
        const response = await axios.put(
          API_CONFIG.USER_FUNCTIONS.user.updateProfile,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data) {
          setProfile(formData);
          setMessage({
            type: "success",
            text: "Profile updated successfully!",
          });
          setEditMode(false);
        }
      } catch (error) {
        console.error("Error updating profile:", error);
        setMessage({
          type: "error",
          text: "Failed to update profile. Please try again.",
        });
      } finally {
        setUpdating(false);
      }
    },
    [formData, token]
  );

  // 🚫 NO USER STATE
  if (!user) {
    return null;
  }

  // 🎨 MAIN DASHBOARD RENDER (only Profile, Notifications, Orders)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                Welcome back, {formData?.name?.split(" ")[0] || "User"}
              </h1>
              <p className="text-slate-600 mt-2 text-lg">
                Manage your profile, notifications, and orders
              </p>
            </div>

            <div className="flex gap-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-sm">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-slate-600">Unread</p>
                    <p className="text-xl font-semibold text-slate-900">
                      {unreadNotifications}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-sm text-slate-600">Total Orders</p>
                    <p className="text-xl font-semibold text-slate-900">
                      {totalOrderValue.toFixed(2)} EGP
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {formData && (
            <div className="mt-8 bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Full Name</p>
                    <p className="font-semibold text-slate-900">
                      {formData.name || "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Mail className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="font-semibold text-slate-900">
                      {formData.email || "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <MapPin className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Location</p>
                    <p className="font-semibold text-slate-900">
                      {formData.address || formData.country || "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 🚨 ALERT MESSAGES */}
        {message && (
          <Alert
            className={`mb-8 border-0 shadow-lg ${
              message.type === "error"
                ? "bg-red-50 border-l-4 border-l-red-500"
                : "bg-emerald-50 border-l-4 border-l-emerald-500"
            }`}
          >
            {message.type === "error" ? (
              <AlertCircle className="h-5 w-5 text-red-600" />
            ) : (
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            )}
            <AlertDescription
              className={`font-medium ${
                message.type === "error" ? "text-red-800" : "text-emerald-800"
              }`}
            >
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <span className="text-xl font-semibold">
                      Personal Information
                    </span>
                  </div>
                  {!editMode && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditMode(true)}
                      className="gap-2"
                    >
                      <Edit3 className="h-4 w-4" />
                      Edit
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="name"
                        className="text-sm font-medium text-slate-700"
                      >
                        Full Name *
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="name"
                          name="name"
                          value={formData?.name || ""}
                          onChange={handleChange}
                          required
                          disabled={!editMode}
                          className="pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                          placeholder="Enter your full name"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="text-sm font-medium text-slate-700"
                      >
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData?.email || ""}
                          className="pl-10 bg-slate-50 border-slate-200"
                          readOnly
                          disabled
                        />
                      </div>
                      <p className="text-xs text-slate-500">
                        Email cannot be changed
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="phone"
                        className="text-sm font-medium text-slate-700"
                      >
                        Phone Number
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData?.phone || ""}
                          onChange={handleChange}
                          disabled={!editMode}
                          className="pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="address"
                        className="text-sm font-medium text-slate-700"
                      >
                        Address
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="address"
                          name="address"
                          type="text"
                          value={formData?.address || ""}
                          onChange={handleChange}
                          disabled={!editMode}
                          className="pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                          placeholder="Enter your address"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="country"
                        className="text-sm font-medium text-slate-700"
                      >
                        Country
                      </Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="country"
                          name="country"
                          type="text"
                          value={formData?.country || ""}
                          onChange={handleChange}
                          disabled={!editMode}
                          className="pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                          placeholder="Enter your country"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="user_type"
                        className="text-sm font-medium text-slate-700"
                      >
                        User Type
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="user_type"
                          name="user_type"
                          type="text"
                          value={formData?.user_type || ""}
                          className="pl-10 bg-slate-50 capitalize border-slate-200"
                          readOnly
                          disabled
                        />
                      </div>
                      <p className="text-xs text-slate-500">
                        User type cannot be changed
                      </p>
                    </div>
                  </div>
                  {editMode && (
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setFormData(profile);
                          setEditMode(false);
                        }}
                        disabled={updating}
                        className="gap-2"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={updating}
                        className="gap-2 bg-blue-600 hover:bg-blue-700"
                      >
                        {updating ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Bell className="h-6 w-6 text-indigo-600" />
                    </div>
                    <span className="text-xl font-semibold">Notifications</span>
                  </div>
                  {unreadNotifications > 0 && (
                    <Badge
                      variant="secondary"
                      className="bg-red-100 text-red-800 border-red-200"
                    >
                      {unreadNotifications} new
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingNotifications ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                    <span className="ml-2 text-slate-600">
                      Loading notifications...
                    </span>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No notifications yet</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.notification_id}
                        className={`p-4 rounded-xl border transition-all duration-200 ${
                          n.isRead
                            ? "bg-slate-50 border-slate-200"
                            : "bg-blue-50 border-blue-200 shadow-sm"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p
                                className={`font-medium text-sm ${
                                  n.isRead ? "text-slate-600" : "text-slate-900"
                                }`}
                              >
                                {n.message_title || "Notification"}
                              </p>
                              {!n.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                              )}
                            </div>
                            <p
                              className={`text-sm ${
                                n.isRead ? "text-slate-500" : "text-slate-700"
                              }`}
                            >
                              {n.content}
                            </p>
                            {n.created_at && (
                              <div className="flex items-center gap-1 mt-2">
                                <Clock className="h-3 w-3 text-slate-400" />
                                <span className="text-xs text-slate-400">
                                  {formatDateUTC(n.created_at)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-1">
                            {!n.isRead && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  markNotificationRead(n.notification_id)
                                }
                                className="text-xs px-2 py-1 h-auto"
                              >
                                Mark read
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                deleteNotification(n.notification_id)
                              }
                              className="text-xs px-2 py-1 h-auto text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="mt-8 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <ShoppingBag className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <span className="text-xl font-semibold">Recent Orders</span>
                  <CardDescription className="mt-1">
                    Your latest purchase history
                  </CardDescription>
                </div>
              </div>
              {orders.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Package className="h-4 w-4" />
                  {orders.length} orders
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingOrders ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                <span className="ml-2 text-slate-600">Loading orders...</span>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-lg">No orders found</p>
                <p className="text-slate-400 text-sm">
                  Your orders will appear here once you make a purchase
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">
                        Order
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">
                        Date
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">
                        Total
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr
                        key={order._id}
                        className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="font-medium text-slate-900">
                            {order.orderNumber ||
                              (order._id ? `#${order._id.substring(0, 8)}` : "#—")}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-slate-600">
                          {formatDateUTC(order.createdAt)}
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-semibold text-slate-900">
                            {typeof order.totalAmount === "number" ? order.totalAmount.toFixed(2) : "0.00"} EGP
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <Badge
                            variant="outline"
                            className={`${getStatusColor(
                              order.status
                            )} font-medium`}
                          >
                            {order.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
