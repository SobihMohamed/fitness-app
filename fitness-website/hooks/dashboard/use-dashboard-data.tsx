"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { API_CONFIG } from "@/config/api";
import {
  Users,
  Package,
  BookOpen,
  Shield,
  ShoppingCart,
  Badge,
} from "lucide-react";
import { getHttpClient } from "@/lib/http";
import { extractArray, toNumber } from "@/lib/data";
import {
  UseDashboardDataReturn,
  StatCard,
  DashboardUserStats,
  OrderStats,
  RequestPoint,
  RoleCount,
  RecentActivity,
  TopProduct,
} from "@/types";

// Helper function to format time ago
function timeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) {
    return interval + " years ago";
  }

  interval = Math.floor(seconds / 2592000);
  if (interval > 1) {
    return interval + " months ago";
  }

  interval = Math.floor(seconds / 86400);
  if (interval > 1) {
    return interval + " days ago";
  }

  interval = Math.floor(seconds / 3600);
  if (interval > 1) {
    return interval + " hours ago";
  }

  interval = Math.floor(seconds / 60);
  if (interval > 1) {
    return interval + " minutes ago";
  }

  return Math.floor(seconds) + " seconds ago";
}

export function useDashboardData(): UseDashboardDataReturn {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatCard[]>([]);
  const [userStats, setUserStats] = useState<DashboardUserStats | null>(null);
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
  const [requestsOverTime, setRequestsOverTime] = useState<RequestPoint[]>([]);
  const [rolesDistribution, setRolesDistribution] = useState<RoleCount[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const http = useMemo(() => getHttpClient(), []);

  const fetchData = useCallback(async () => {
      try {
        setLoading(true);
        // Fetch all data concurrently via Axios
        const [
          usersRes,
          ordersRes,
          productsRes,
          coursesRes,
          adminsRes,
          trainingRes,
          courseReqsRes,
          servicesRes,
          blogsRes,
        ] = await Promise.all([
          http
            .get(API_CONFIG.ADMIN_FUNCTIONS.users.getAll)
            .catch(() => ({ data: { data: [] } } as any)),
          http
            .get(API_CONFIG.ADMIN_FUNCTIONS.orders.getAll)
            .catch(() => ({ data: { data: [] } } as any)),
          http
            .get(API_CONFIG.ADMIN_FUNCTIONS.products.getAll)
            .catch(() => ({ data: { data: [] } } as any)),
          http
            .get(API_CONFIG.ADMIN_FUNCTIONS.courses.getAll)
            .catch(() => ({ data: { data: [] } } as any)),
          http
            .get(API_CONFIG.ADMIN_FUNCTIONS.admins.getAll)
            .catch(() => ({ data: { data: [] } } as any)),
          http
            .get(API_CONFIG.ADMIN_FUNCTIONS.requests.training.getAll)
            .catch(() => ({ data: { data: [] } } as any)),
          http
            .get(API_CONFIG.ADMIN_FUNCTIONS.requests.courses.getAll)
            .catch(() => ({ data: { data: [] } } as any)),
          http
            .get(API_CONFIG.ADMIN_FUNCTIONS.services.getAll)
            .catch(() => ({ data: { data: [] } } as any)),
          http
            .get(API_CONFIG.ADMIN_FUNCTIONS.blogs.getAll)
            .catch(() => ({ data: { data: [] } } as any)),
        ]);

        const users =
          usersRes?.data?.data ||
          usersRes?.data?.users ||
          extractArray(usersRes?.data);
        const orders =
          ordersRes?.data?.data ||
          ordersRes?.data?.orders ||
          extractArray(ordersRes?.data);
        const products =
          productsRes?.data?.data ||
          productsRes?.data?.products ||
          extractArray(productsRes?.data);
        const courses =
          coursesRes?.data?.data ||
          coursesRes?.data?.courses ||
          extractArray(coursesRes?.data);
        const admins =
          adminsRes?.data?.data ||
          adminsRes?.data?.admins ||
          adminsRes?.data?.users ||
          extractArray(adminsRes?.data);
        const trainingRequests =
          trainingRes?.data?.data ||
          trainingRes?.data?.requests ||
          extractArray(trainingRes?.data);
        const courseRequests =
          courseReqsRes?.data?.data ||
          courseReqsRes?.data?.requests ||
          extractArray(courseReqsRes?.data);
        const services =
          servicesRes?.data?.data ||
          servicesRes?.data?.services ||
          extractArray(servicesRes?.data);
        const blogs =
          blogsRes?.data?.data ||
          blogsRes?.data?.blogs ||
          extractArray(blogsRes?.data);

        // Process data for stats cards
        const totalUsers = users.length;
        const activeUsers = users.filter(
          (user: any) => user.status === "active" || user.is_active === "1"
        ).length;
        const totalAdmins = admins.length;
        const totalProducts = products.length;
        const totalCourses = courses.length;
        const totalOrders = orders.length;
        const totalServices = services.length;
        const totalBlogs = blogs.length;
        const totalRequests =
          (trainingRequests?.length || 0) + (courseRequests?.length || 0);
        const totalRevenue = orders.reduce(
          (sum: number, order: any) =>
            sum +
            (toNumber(order.total_amount) || toNumber(order.total_price) || 0),
          0
        );

        const newStats: StatCard[] = [
          {
            title: "Blogs",
            value: String(totalBlogs),
            change: "+0%",
            trend: "up",
            icon: BookOpen,
            color: "#EF4444",
          },
          {
            title: "Courses",
            value: String(totalCourses),
            change: "+0%",
            trend: "up",
            icon: BookOpen,
            color: "#F59E0B",
          },
          {
            title: "Products",
            value: String(totalProducts),
            change: "+0%",
            trend: "up",
            icon: Package,
            color: "#8B5CF6",
          },
          {
            title: "Requests",
            value: String(totalRequests),
            change: "+0%",
            trend: "up",
            icon: ShoppingCart,
            color: "#10B981",
          },
          {
            title: "Services",
            value: String(totalServices),
            change: "+0%",
            trend: "up",
            icon: Badge,
            color: "#06B6D4",
          },
          {
            title: "Users",
            value: String(totalUsers),
            change: "+0%",
            trend: "up",
            icon: Users,
            color: "#3B82F6",
          },
          {
            title: "Admins",
            value: String(totalAdmins),
            change: "+0%",
            trend: "up",
            icon: Shield,
            color: "#8B5CF9",
          },
        ];
        setStats(newStats);

        // Process user stats
        const userStatsData: DashboardUserStats = {
          totalUsers,
          activeUsers,
          newUsers: users.filter((user: any) => {
            const createdDate = new Date(
              user.created_at || user.date || user.createdAt || 0
            );
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            return createdDate >= oneWeekAgo;
          }).length,
          userGrowth:
            totalUsers > 0
              ? Math.round(
                  (users.filter((u: any) => {
                    const d = new Date(u.created_at || u.date || 0);
                    const w = new Date();
                    w.setDate(w.getDate() - 7);
                    return d >= w;
                  }).length /
                    totalUsers) *
                    100
                )
              : 0,
        };

        setUserStats(userStatsData);

        // Process order stats with better status handling
        // Debug: Log order statuses to understand the data
        console.log("[Dashboard] Order statuses found:", 
          [...new Set(orders.map((order: any) => order.status || order.order_status || "unknown"))]
        );
        
        const pendingOrders = orders.filter((order: any) => {
          const s = (order.status || order.order_status || "").toLowerCase();
          return s === "pending" || s === "processing";
        }).length;
        
        const completedOrders = orders.filter((order: any) => {
          const s = (order.status || order.order_status || "").toLowerCase();
          return s === "approved" || s === "approve" || s === "completed" || s === "delivered" || s === "success";
        }).length;
        
        const cancelledOrders = orders.filter((order: any) => {
          const s = (order.status || order.order_status || "").toLowerCase();
          return s === "cancelled" || s === "canceled" || s === "cancel" || s === "rejected" || s === "failed";
        }).length;

        // Debug: Log calculated order stats
        console.log("[Dashboard] Order stats calculated:", {
          totalOrders,
          pendingOrders,
          completedOrders,
          cancelledOrders,
          revenue: totalRevenue,
        });

        const orderStatsData: OrderStats = {
          totalOrders,
          pendingOrders,
          completedOrders,
          cancelledOrders,
          revenue: totalRevenue,
        };

        setOrderStats(orderStatsData);

        // Recent activity: users and orders
        const activity: RecentActivity[] = [];
        [...users]
          .sort(
            (a: any, b: any) =>
              new Date(b.created_at || b.date || 0).getTime() -
              new Date(a.created_at || a.date || 0).getTime()
          )
          .slice(0, 3)
          .forEach((user: any) => {
            activity.push({
              action: "New user registered",
              item: user.email || user.name || "Unknown user",
              time: timeAgo(new Date(user.created_at || user.date || 0)),
              type: "user",
            });
          });
        [...orders]
          .sort(
            (a: any, b: any) =>
              new Date(b.created_at || b.purchase_date || 0).getTime() -
              new Date(a.created_at || a.purchase_date || 0).getTime()
          )
          .slice(0, 3)
          .forEach((order: any) => {
            activity.push({
              action: "New order received",
              item: `Order #${order.order_id || "N/A"}`,
              time: timeAgo(
                new Date(order.created_at || order.purchase_date || 0)
              ),
              type: "order",
            });
          });
        // Optionally include latest requests
        trainingRequests.slice(0, 2).forEach((request: any) => {
          activity.push({
            action: "New training request",
            item: request.name || request.trainee_name || "Training request",
            time: timeAgo(new Date(request.created_at || 0)),
            type: "training",
          });
        });
        courseRequests.slice(0, 2).forEach((request: any) => {
          activity.push({
            action: "New course request",
            item: request.name || request.student_name || "Course request",
            time: timeAgo(new Date(request.created_at || 0)),
            type: "course",
          });
        });

        // Top products from orders
        const productSales: {
          [productId: string]: { count: number; revenue: number };
        } = {};
        orders.forEach((order: any) => {
          const productId = order.product_id || order.productId;
          const amount =
            parseFloat(order.total_amount) ||
            parseFloat(order.total_price) ||
            0;
          if (productId != null) {
            if (!productSales[productId])
              productSales[productId] = { count: 0, revenue: 0 };
            productSales[productId].count += 1;
            productSales[productId].revenue += amount;
          }
        });
        const productIdToName: Record<string, string> = {};
        products.forEach((p: any) => {
          productIdToName[p.product_id] = p.name;
        });
        const topProductsData: TopProduct[] = Object.entries(productSales)
          .map(([id, s]) => ({
            name: productIdToName[id] || `Product ${id}`,
            sales: s.count,
            revenue: `$${s.revenue.toFixed(2)}`,
          }))
          .sort((a, b) => b.sales - a.sales)
          .slice(0, 5);

        // Requests over time (training + course requests)
        const requestMap: Record<string, number> = {};
        const pushReq = (d: any) => {
          const dt = new Date(d || Date.now());
          const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(
            2,
            "0"
          )}-${String(dt.getDate()).padStart(2, "0")}`;
          requestMap[key] = (requestMap[key] || 0) + 1;
        };
        (trainingRequests || []).forEach((r: any) =>
          pushReq(r.created_at || r.date)
        );
        (courseRequests || []).forEach((r: any) =>
          pushReq(r.created_at || r.date)
        );
        const reqSeries: RequestPoint[] = Object.keys(requestMap)
          .sort()
          .slice(-12)
          .map((k) => ({ date: k, count: requestMap[k] }));
        setRequestsOverTime(reqSeries);

        // Roles distribution
        const rolesMap: Record<string, number> = {};
        (users || []).forEach((u: any) => {
          let role = (
            u.role ||
            u.user_type ||
            u.type ||
            (u.is_admin ? "admin" : "user") ||
            "user"
          )
            .toString()
            .toLowerCase();
          if (role === "administrator") role = "admin";
          const label = role.charAt(0).toUpperCase() + role.slice(1);
          rolesMap[label] = (rolesMap[label] || 0) + 1;
        });
        const rolesData: RoleCount[] = Object.entries(rolesMap).map(
          ([role, count]) => ({ role, count })
        );
        setRolesDistribution(rolesData);

        // Revenue overview removed to avoid rendering pseudo data; skip computing breakdown

        setError(null);
      } catch (err) {
        console.error("[Dashboard] fetch error:", err);
        // Do not block the dashboard; show empty defaults
        setStats([
          {
            title: "Users",
            value: "0",
            change: "+0%",
            trend: "up",
            icon: Users,
            color: "#007BFF",
          },
          {
            title: "Admins",
            value: "0",
            change: "+0%",
            trend: "up",
            icon: Shield,
            color: "#6C757D",
          },
          {
            title: "Products",
            value: "0",
            change: "+0%",
            trend: "up",
            icon: Package,
            color: "#6C757D",
          },
          {
            title: "Courses",
            value: "0",
            change: "+0%",
            trend: "up",
            icon: BookOpen,
            color: "#FF8042",
          },
          {
            title: "Orders",
            value: "0",
            change: "+0%",
            trend: "up",
            icon: ShoppingCart,
            color: "#007BFF",
          },
        ]);
        setUserStats({
          totalUsers: 0,
          activeUsers: 0,
          newUsers: 0,
          userGrowth: 0,
        });
        setOrderStats({
          totalOrders: 0,
          pendingOrders: 0,
          completedOrders: 0,
          cancelledOrders: 0,
          revenue: 0,
        });
        setRequestsOverTime([]);
        setRolesDistribution([]);
        setError(null);
      } finally {
        setLoading(false);
      }
    }, [http]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    loading,
    stats,
    userStats,
    orderStats,
    requestsOverTime,
    rolesDistribution,
    error,
  };
}
