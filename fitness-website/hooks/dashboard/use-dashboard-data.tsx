"use client";

import { useState, useEffect } from "react";
import { API_CONFIG } from "@/config/api";
import { Users, Package, BookOpen, Shield, ShoppingCart } from "lucide-react";
import { getHttpClient } from "@/lib/http";
import { extractArray, toNumber } from "@/lib/data";

// API Response interfaces
interface UsersApiResponse {
  status: string;
  data: any[]; // Adjust based on actual API response
}

interface OrdersApiResponse {
  status: string;
  data: any[]; // Adjust based on actual API response
}

interface TrainingApiResponse {
  status: string;
  data: any[]; // Adjust based on actual API response
}

interface CoursesApiResponse {
  status: string;
  data: any[]; // Adjust based on actual API response
}
interface StatCard {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ComponentType<any>;
  color: string;
}

interface RecentActivity {
  action: string;
  item: string;
  time: string;
  type: string;
}

interface TopProduct {
  name: string;
  sales: number;
  revenue: string;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  userGrowth: number;
}

interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  revenue: number;
}

interface UseDashboardDataReturn {
  loading: boolean;
  stats: StatCard[];
  recentActivity: RecentActivity[];
  topProducts: TopProduct[];
  userStats: UserStats | null;
  orderStats: OrderStats | null;
  error: string | null;
}

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
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const http = getHttpClient();

  useEffect(() => {
    const fetchData = async () => {
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
        ] = await Promise.all([
          http.get(API_CONFIG.ADMIN_FUNCTIONS.adminUsers.getAll).catch(() => ({ data: { data: [] } } as any)),
          http.get(API_CONFIG.ADMIN_FUNCTIONS.AdminManagesOrders.getAllOrders).catch(() => ({ data: { data: [] } } as any)),
          http.get(API_CONFIG.ADMIN_FUNCTIONS.AdminProduct.getAllProducts).catch(() => ({ data: { data: [] } } as any)),
          http.get(API_CONFIG.ADMIN_FUNCTIONS.AdminCourse.getAllCourses).catch(() => ({ data: { data: [] } } as any)),
          http.get(API_CONFIG.ADMIN_FUNCTIONS.superAdminControlleAdmins.getAll).catch(() => ({ data: { data: [] } } as any)),
          http.get(API_CONFIG.ADMIN_FUNCTIONS.AdminManageTrainingRequests.getAllRequests).catch(() => ({ data: { data: [] } } as any)),
          http.get(API_CONFIG.ADMIN_FUNCTIONS.AdminManageCoursesRequests.getAllRequests).catch(() => ({ data: { data: [] } } as any)),
        ]);

        const users = usersRes?.data?.users || extractArray(usersRes?.data);
        const orders = ordersRes?.data?.orders || extractArray(ordersRes?.data);
        const products = productsRes?.data?.products || extractArray(productsRes?.data);
        const courses = coursesRes?.data?.courses || extractArray(coursesRes?.data);
        const admins = adminsRes?.data?.admins || adminsRes?.data?.users || extractArray(adminsRes?.data);
        const trainingRequests = trainingRes?.data?.requests || extractArray(trainingRes?.data);
        const courseRequests = courseReqsRes?.data?.requests || extractArray(courseReqsRes?.data);

        // Process data for stats cards
        const totalUsers = users.length;
        const activeUsers = users.filter((user: any) => user.status === 'active' || user.is_active === '1').length;
        const totalAdmins = admins.length;
        const totalProducts = products.length;
        const totalCourses = courses.length;
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum: number, order: any) => sum + (toNumber(order.total_amount) || toNumber(order.total_price) || 0), 0);

        const newStats: StatCard[] = [
          { title: "Users", value: String(totalUsers), change: "+12%", trend: "up", icon: Users, color: "#007BFF" },
          { title: "Admins", value: String(totalAdmins), change: "+2%", trend: "up", icon: Shield, color: "#6C757D" },
          { title: "Products", value: String(totalProducts), change: "+7%", trend: "up", icon: Package, color: "#6C757D" },
          { title: "Courses", value: String(totalCourses), change: "+4%", trend: "up", icon: BookOpen, color: "#FF8042" },
          { title: "Orders", value: String(totalOrders), change: "+5%", trend: "up", icon: ShoppingCart, color: "#007BFF" },
        ];
        setStats(newStats);

        // Process user stats
        const userStatsData: UserStats = {
          totalUsers,
          activeUsers,
          newUsers: users.filter((user: any) => {
            const createdDate = new Date(user.created_at || user.date || user.createdAt || 0);
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            return createdDate >= oneWeekAgo;
          }).length,
          userGrowth: totalUsers > 0 ? Math.round(((users.filter((u:any)=>{
            const d = new Date(u.created_at || u.date || 0); const w = new Date(); w.setDate(w.getDate()-7); return d >= w;}).length)/ totalUsers) * 100) : 0,
        };

        setUserStats(userStatsData);

        // Process order stats
        const pendingOrders = orders.filter((order: any) => (order.status || order.order_status) === 'pending').length;
        const completedOrders = orders.filter((order: any) => {
          const s = (order.status || order.order_status || '').toLowerCase();
          return s === 'approved' || s === 'completed';
        }).length;

        const orderStatsData: OrderStats = {
          totalOrders,
          pendingOrders,
          completedOrders,
          revenue: totalRevenue,
        };

        setOrderStats(orderStatsData);

        // Recent activity: users and orders
        const activity: RecentActivity[] = [];
        [...users]
          .sort((a: any, b: any) => new Date(b.created_at || b.date || 0).getTime() - new Date(a.created_at || a.date || 0).getTime())
          .slice(0, 3)
          .forEach((user: any) => {
            activity.push({ action: "New user registered", item: user.email || user.name || "Unknown user", time: timeAgo(new Date(user.created_at || user.date || 0)), type: "user" });
          });
        [...orders]
          .sort((a: any, b: any) => new Date(b.created_at || b.purchase_date || 0).getTime() - new Date(a.created_at || a.purchase_date || 0).getTime())
          .slice(0, 3)
          .forEach((order: any) => {
            activity.push({ action: "New order received", item: `Order #${order.order_id || 'N/A'}` , time: timeAgo(new Date(order.created_at || order.purchase_date || 0)), type: "order" });
          });
        // Optionally include latest requests
        trainingRequests.slice(0, 2).forEach((request: any) => {
          activity.push({ action: "New training request", item: request.name || request.trainee_name || "Training request", time: timeAgo(new Date(request.created_at || 0)), type: "training" });
        });
        courseRequests.slice(0, 2).forEach((request: any) => {
          activity.push({ action: "New course request", item: request.name || request.student_name || "Course request", time: timeAgo(new Date(request.created_at || 0)), type: "course" });
        });
        setRecentActivity(activity);

        // Top products from orders
        const productSales: { [productId: string]: { count: number; revenue: number } } = {};
        orders.forEach((order: any) => {
          const productId = order.product_id || order.productId;
          const amount = parseFloat(order.total_amount) || parseFloat(order.total_price) || 0;
          if (productId != null) {
            if (!productSales[productId]) productSales[productId] = { count: 0, revenue: 0 };
            productSales[productId].count += 1;
            productSales[productId].revenue += amount;
          }
        });
        const productIdToName: Record<string, string> = {};
        products.forEach((p: any) => { productIdToName[p.product_id] = p.name; });
        const topProductsData: TopProduct[] = Object.entries(productSales)
          .map(([id, s]) => ({ name: productIdToName[id] || `Product ${id}`, sales: s.count, revenue: `$${s.revenue.toFixed(2)}` }))
          .sort((a, b) => b.sales - a.sales)
          .slice(0, 5);
        setTopProducts(topProductsData);

        // Revenue overview removed to avoid rendering pseudo data; skip computing breakdown

        setError(null);
      } catch (err) {
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  return {
    loading,
    stats,
    recentActivity,
    topProducts,
    userStats,
    orderStats,
    error,
  };
}