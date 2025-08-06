"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  FileText,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  AlertTriangle,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { icon: Package, label: "Products", href: "/admin/products" },
  { icon: FileText, label: "Content", href: "/admin/content" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
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
        fetch("http://localhost:8000/AdminTrainingRequests/getAll", { headers: getAuthHeaders() }),
        fetch("http://localhost:8000/AdminCoursesRequests/getAll", { headers: getAuthHeaders() }),
        fetch("http://localhost:8000/AdminOrders/getAll", { headers: getAuthHeaders() }),
        fetch("http://localhost:8000/AdminTrainingRequests/getExpirationSoon", { headers: getAuthHeaders() })
      ]);

      const [trainingData, courseData, ordersData, expiringData] = await Promise.all([
        trainingRes.json(),
        courseRes.json(),
        ordersRes.json(),
        expiringRes.json()
      ]);

      setNotifications({
        trainingRequests: trainingData.data?.filter((req: any) => req.status === "pending").length || 0,
        courseRequests: courseData.data?.filter((req: any) => req.status === "pending").length || 0,
        orders: ordersData.data?.filter((order: any) => order.status === "pending").length || 0,
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
                  <span>{item.label}</span>
                  {item.href === "/admin/settings" && totalNotifications > 0 && (
                    <Badge className="bg-red-500 text-white ml-auto">
                      {totalNotifications}
                    </Badge>
                  )}
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
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search..."
                  className="pl-10 w-64 bg-gray-50 border-gray-200"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Enhanced Notifications */}
              <Popover open={showNotifications} onOpenChange={setShowNotifications}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {totalNotifications > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs bg-red-500 text-white animate-pulse">
                        {totalNotifications}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={fetchNotificationCounts}
                          className="h-8 w-8 p-0"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        {notifications.expiringRequests > 0 && (
                          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                            <div className="flex items-center gap-3">
                              <AlertTriangle className="h-5 w-5 text-red-600" />
                              <div>
                                <p className="font-medium text-red-900">Expiring Soon</p>
                                <p className="text-sm text-red-700">{notifications.expiringRequests} training requests</p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                router.push("/admin/settings?tab=training-requests")
                                setShowNotifications(false)
                              }}
                            >
                              View
                            </Button>
                          </div>
                        )}
                        
                        {notifications.trainingRequests > 0 && (
                          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Users className="h-5 w-5 text-blue-600" />
                              <div>
                                <p className="font-medium text-blue-900">Training Requests</p>
                                <p className="text-sm text-blue-700">{notifications.trainingRequests} pending</p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                router.push("/admin/settings?tab=training-requests")
                                setShowNotifications(false)
                              }}
                            >
                              View
                            </Button>
                          </div>
                        )}
                        
                        {notifications.courseRequests > 0 && (
                          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <BookOpen className="h-5 w-5 text-purple-600" />
                              <div>
                                <p className="font-medium text-purple-900">Course Requests</p>
                                <p className="text-sm text-purple-700">{notifications.courseRequests} pending</p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                router.push("/admin/settings?tab=course-requests")
                                setShowNotifications(false)
                              }}
                            >
                              View
                            </Button>
                          </div>
                        )}
                        
                        {notifications.orders > 0 && (
                          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <ShoppingCart className="h-5 w-5 text-green-600" />
                              <div>
                                <p className="font-medium text-green-900">New Orders</p>
                                <p className="text-sm text-green-700">{notifications.orders} pending</p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                router.push("/admin/settings?tab=orders")
                                setShowNotifications(false)
                              }}
                            >
                              View
                            </Button>
                          </div>
                        )}
                        
                        {totalNotifications === 0 && (
                          <div className="text-center py-6">
                            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                            <p className="text-gray-600">All caught up!</p>
                            <p className="text-sm text-gray-500">No pending notifications</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </PopoverContent>
              </Popover>
              
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs bg-green-500">
                  3
                </Badge>
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">A</span>
                </div>
                <span className="text-sm font-medium text-gray-700 hidden md:block">
                  Admin User
                </span>
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
