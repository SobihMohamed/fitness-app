"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  FileText,
  Users,
  LogOut,
  Menu,
  X,
  Badge,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationDropdown } from "@/components/admin/shared/notification-dropdown";
import { API_CONFIG } from "@/config/api";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { icon: FileText, label: "Blogs", href: "/admin/blogs" },
  { icon: FileText, label: "Courses", href: "/admin/courses" },
  { icon: Package, label: "Products", href: "/admin/products" },
  { icon: FileText, label: "Requests", href: "/admin/requests" },
  { icon: Badge, label: "Services", href: "/admin/services" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: Ticket, label: "Promo Codes", href: "/admin/promocode" },
];

interface NotificationData {
  trainingRequests: number;
  courseRequests: number;
  orders: number;
  expiringRequests: number;
}
export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationData>({
    trainingRequests: 0,
    courseRequests: 0,
    orders: 0,
    expiringRequests: 0,
  });
  const router = useRouter();
  const pathname = usePathname();

  const getAuthHeaders = () => {
    const token = localStorage.getItem("adminAuth");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    setIsAuthenticated(false);
    router.push("/admin/login");
  };

  // Validate token by making a test API call
  const validateToken = async () => {
    try {
      const response = await fetch(API_CONFIG.ADMIN_FUNCTIONS.requests.training.getAll, {
        headers: getAuthHeaders(),
        method: 'GET'
      });
      return response.ok;
    } catch (error) {
      console.error("Token validation error:", error);
      return false;
    }
  };

  // Fetch notification counts
  const fetchNotificationCounts = async () => {
    try {
      const [trainingRes, courseRes, ordersRes] = await Promise.all([
        fetch(API_CONFIG.ADMIN_FUNCTIONS.requests.training.getAll, { headers: getAuthHeaders() }),
        fetch(API_CONFIG.ADMIN_FUNCTIONS.requests.courses.getAll, { headers: getAuthHeaders() }),
        fetch(API_CONFIG.ADMIN_FUNCTIONS.orders.getAll, { headers: getAuthHeaders() })
      ]);

      // Check for authentication errors (401 Unauthorized)
      if (trainingRes.status === 401 || courseRes.status === 401 || ordersRes.status === 401) {
        console.warn("Token expired or invalid, logging out");
        handleLogout();
        return;
      }

      // Handle responses
      const trainingData = await trainingRes.json();
      const courseData = await courseRes.json();
      const ordersData = await ordersRes.json();

      // Optionally fetch expiring soon only if explicitly enabled
      let expiringData: { data: any[] } = { data: [] };
      const shouldFetchExpiring = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_FETCH_EXPIRING === 'true';
      if (shouldFetchExpiring && API_CONFIG.ADMIN_FUNCTIONS?.requests?.training?.getExpirationSoon) {
        try {
          const expiringRes = await fetch(API_CONFIG.ADMIN_FUNCTIONS.requests.training.getExpirationSoon, { headers: getAuthHeaders() });
          if (expiringRes.ok) {
            expiringData = await expiringRes.json();
          } else if (expiringRes.status !== 404) {
            console.warn("Expiring requests endpoint error:", expiringRes.status);
          }
        } catch {
          // ignore
        }
      }

      const trainingList: any[] = Array.isArray(trainingData?.data) ? trainingData.data : Array.isArray(trainingData) ? trainingData : [];
      const courseList: any[] = Array.isArray(courseData?.data) ? courseData.data : Array.isArray(courseData) ? courseData : [];
      const ordersList: any[] = Array.isArray(ordersData?.data) ? ordersData.data : Array.isArray(ordersData) ? ordersData : [];

      const isPending = (s: any) => {
        const v = (s ?? "").toString().toLowerCase();
        return v.includes("pending");
      };

      setNotifications({
        trainingRequests: trainingList.filter((req: any) => isPending(req.status) || isPending(req.request_status)).length || 0,
        courseRequests: courseList.filter((req: any) => isPending(req.status) || isPending(req.request_status)).length || 0,
        orders: ordersList.filter((order: any) => isPending(order.status) || isPending(order.order_status)).length || 0,
        expiringRequests: (Array.isArray(expiringData?.data) ? expiringData.data : []).length || 0,
      });
      console.log("Notification data:", {
        trainingRequests: trainingList.filter((req: any) => isPending(req.status) || isPending(req.request_status)).length || 0,
        courseRequests: courseList.filter((req: any) => isPending(req.status) || isPending(req.request_status)).length || 0,
        orders: ordersList.filter((order: any) => isPending(order.status) || isPending(order.order_status)).length || 0,
        expiringRequests: (Array.isArray(expiringData?.data) ? expiringData.data : []).length || 0,
      });
    } catch (error) {
      console.error("Error fetching notification counts:", error);
    }
  };
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("adminAuth");
      if (!token) {
        router.push("/admin/login");
        return;
      }

      // Validate token
      const isValid = await validateToken();
      if (!isValid) {
        console.warn("Token validation failed, logging out");
        handleLogout();
        return;
      }

      setIsAuthenticated(true);
      fetchNotificationCounts();
      setIsLoading(false);
      // Set up periodic refresh for notifications
      const interval = setInterval(fetchNotificationCounts, 60000); // Every 60 seconds for better performance
      return () => clearInterval(interval);
    };

    checkAuth();
  }, [router]);

  const totalRequests = notifications.trainingRequests + notifications.courseRequests + notifications.orders;
  // Always render the layout shell so the segment-wide loader can be shown
  return (
    <div className="min-h-screen bg-gray-50 relative flex flex-col">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        id="admin-sidebar"
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-blue-600">FitPro Admin</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    pathname === item.href
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="relative">
                    {item.label}
                    {item.href === "/admin/requests" && totalRequests > 0 && (
                      <span className="absolute top-1 -right-10 inline-flex items-center justify-center w-5 h-5 text-xs font-bold leading-none text-white bg-red-500 rounded-full shadow-md">
                        {totalRequests}
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="absolute bottom-4 left-4 right-4">
          <Button
            variant="outline"
            className="w-full justify-start bg-transparent"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Top Bar */}
      <header className="bg-white shadow-sm border-b px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen((prev) => !prev)}
              aria-expanded={sidebarOpen}
              aria-controls="admin-sidebar"
              aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">
              Admin Dashboard
            </h1>
          </div>
          <div className="flex items-center space-x-6">
            <div className="relative">
              <NotificationDropdown />
            </div>
            <div className="flex flex-col items-center relative">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-white font-medium">A</span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">
                    Admin User
                  </p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="p-6 flex-1">{children}</main>
    </div>
  );
}

 
