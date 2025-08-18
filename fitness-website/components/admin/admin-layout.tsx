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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationDropdown } from "@/components/admin/shared/notification-dropdown";
import { API_CONFIG } from "@/config/api";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { icon: Package, label: "Products", href: "/admin/products" },
  { icon: FileText, label: "Courses", href: "/admin/courses" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: FileText, label: "Requests", href: "/admin/requests" },
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
  const [notifications, setNotifications] = useState<NotificationData>({
    trainingRequests: 0,
    courseRequests: 0,
    orders: 0,
    expiringRequests: 0,
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const getAuthHeaders = () => {
    const token = localStorage.getItem("adminAuth");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  // Fetch notification counts
  const fetchNotificationCounts = async () => {
    try {
      const [trainingRes, courseRes, ordersRes, expiringRes] = await Promise.all([
        fetch(API_CONFIG.ADMIN_FUNCTIONS.AdminManageTrainingRequests.getAllRequests, { headers: getAuthHeaders() }),
        fetch(API_CONFIG.ADMIN_FUNCTIONS.AdminManageCoursesRequests.getAllRequests, { headers: getAuthHeaders() }),
        fetch(API_CONFIG.ADMIN_FUNCTIONS.AdminManagesOrders.getAllOrders, { headers: getAuthHeaders() }),
        fetch(API_CONFIG.ADMIN_FUNCTIONS.AdminManageTrainingRequests.getTheTranieesWhoseTrainingRequestEndSoon, { headers: getAuthHeaders() })
      ]);

      // Handle responses, including 404 for expiring requests
      const trainingData = await trainingRes.json();
      const courseData = await courseRes.json();
      const ordersData = await ordersRes.json();
      
      // Handle expiring requests response which may return 404 when none exist
      let expiringData = { data: [] as any[] };
      if (expiringRes.ok) {
        expiringData = await expiringRes.json();
      } else if (expiringRes.status === 404) {
        // Silently treat as zero expiring requests
        expiringData = { data: [] };
      } else {
        // Non-404 errors only: log and continue
        console.warn("Expiring requests endpoint error:", expiringRes.status);
      }

      setNotifications({
        trainingRequests: trainingData.data?.filter((req: any) => req.status === "pending" || req.request_status === "pending").length || 0,
        courseRequests: courseData.data?.filter((req: any) => req.status === "pending" || req.request_status === "pending").length || 0,
        orders: ordersData.data?.filter((order: any) => order.status === "pending" || order.order_status === "pending").length || 0,
        expiringRequests: expiringData.data?.length || 0,
      });
      console.log("Notification data:", {
        trainingRequests: trainingData.data?.filter((req: any) => req.status === "pending" || req.request_status === "pending").length || 0,
        courseRequests: courseData.data?.filter((req: any) => req.status === "pending" || req.request_status === "pending").length || 0,
        orders: ordersData.data?.filter((order: any) => order.status === "pending" || order.order_status === "pending").length || 0,
        expiringRequests: expiringData.data?.length || 0,
      });
    } catch (error) {
      console.error("Error fetching notification counts:", error);
    }
  };
  useEffect(() => {
    const token = localStorage.getItem("adminAuth"); 
    if (!token) {
      router.push("/admin/login");
    } else {
      setIsAuthenticated(true);
      fetchNotificationCounts();
      // Set up periodic refresh for notifications
      const interval = setInterval(fetchNotificationCounts, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    router.push("/admin/login");
  };

  const totalNotifications = notifications.trainingRequests + notifications.courseRequests + notifications.orders + notifications.expiringRequests;
  const totalRequests = notifications.trainingRequests + notifications.courseRequests + notifications.orders;
  if (!isAuthenticated) return null;
  return (
    <div className="min-h-screen bg-gray-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
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

      {/* Main Content */}
      <div className="w-full">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b px-6 py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">
                Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-6">
              {/* Notification Bell */}
              <div className="relative">
                <NotificationDropdown />
              </div>
              
              {/* User Profile with Notification Count */}
              <div className="flex flex-col items-center relative">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-white font-medium">A</span>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-900">Admin User</p>
                    <p className="text-xs text-gray-500">Administrator</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
