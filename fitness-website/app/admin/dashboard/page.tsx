"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AdminLayout } from "@/components/admin/admin-layout";
import { LoadingSpinner } from "@/components/admin/shared/loading-spinner";
import { ErrorDisplay } from "@/components/admin/shared/error-display";
import { StatsCard } from "@/components/admin/shared/stats-card";
import { PageHeader } from "@/components/admin/shared/page-header";
import {
  Package,
  Users,
  Activity,
  UserCheck,
  ShoppingCart,
  CheckCircle,
  Clock,
  Zap,
  BookOpen,
} from "lucide-react";
import { useDashboardData } from "@/hooks/dashboard/use-dashboard-data";
import { useAdminAuth } from "@/hooks/admin/use-admin-auth";
import {
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";
import Link from "next/link";

export default function AdminDashboardWrapper() {
  const { isLoading, isAuthenticated } = useAdminAuth();

  if (isLoading) {
    return (
      <AdminLayout>
        <LoadingSpinner fullScreen message="Loading dashboard data..." />
      </AdminLayout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <AdminDashboard />;
}

const COLORS = ["#3B82F6", "#10B981", "#FBBF24", "#F97316", "#8B5CF6"];

export function AdminDashboard() {
  const {
    loading,
    stats,
    recentActivity,
    topProducts,
    userStats,
    orderStats,
    error,
  } = useDashboardData();

  const adminCount = parseInt(stats.find((s) => s.title === "Admins")?.value ?? "0", 10);

  // Calculate order status data with protection against negative values
  const orderStatusData = orderStats
    ? [
        { name: "Pending", value: orderStats.pendingOrders },
        { name: "Completed", value: orderStats.completedOrders },
        {
          name: "Cancelled",
          value: Math.max(
            0,
            orderStats.totalOrders -
              orderStats.pendingOrders -
              orderStats.completedOrders
          ),
        },
      ]
    : [
        { name: "Pending", value: 0 },
        { name: "Completed", value: 0 },
        { name: "Cancelled", value: 0 },
      ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorDisplay message={error} onRetry={() => window.location.reload()} />
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <PageHeader
          title="Dashboard"
          description="Welcome back! Here's what's happening with your fitness platform."
        />

        {/* Stats Cards */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
  {/* Render all stats including Admins */}
  {stats.map((stat, index) => (
    <div
      key={index}
      className="transform transition-all hover:scale-[1.03]"
    >
      <StatsCard
        title={stat.title}
        value={stat.title === "Admins" ? adminCount : stat.value}
        icon={<stat.icon className="h-6 w-6" />}
        color={stat.color}
      />
      {stat.title === "Admins" && (
        <div className="mt-1 ml-2">
          <Link href="/admin/users?role=admin" className="text-xs text-indigo-700 underline">Manage Admins</Link>
        </div>
      )}
    </div>
  ))}
</div>

        {/* User Statistics */}
        <Card className="bg-gradient-to-br from-white to-gray-50 shadow-xl rounded-2xl border-0 hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center">
              <Users className="h-5 w-5 mr-2 text-green-500 animate-pulse" />
              User Statistics
            </CardTitle>
            <CardDescription className="text-gray-500">
              Overview of user engagement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  icon: <UserCheck className="h-5 w-5 text-indigo-600 mr-2 animate-bounce" />,
                  label: <span className="font-bold text-indigo-700">Admins</span>,
                  value: <span className="text-xl font-bold text-indigo-700">{adminCount}</span>,
                },
                {
                  icon: <UserCheck className="h-5 w-5 text-green-500 mr-2" />,
                  label: "Total Users",
                  value: userStats?.totalUsers || 0,
                },
                {
                  icon: <CheckCircle className="h-5 w-5 text-blue-500 mr-2" />,
                  label: "Active Users",
                  value: userStats?.activeUsers || 0,
                },
                {
                  icon: <Clock className="h-5 w-5 text-yellow-500 mr-2" />,
                  label: "New Users (7d)",
                  value: userStats?.newUsers || 0,
                },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center">
                    {item.icon}
                    <span className="text-gray-600">{item.label}</span>
                  </div>
                  <span className="font-bold text-lg">{item.value}</span>
                </div>
              ))}
              <div className="pt-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-green-600 h-2.5 rounded-full transition-all"
                    style={{ width: `${userStats?.userGrowth || 0}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-sm text-gray-600">User Growth</span>
                  <span className="text-sm font-bold">
                    {userStats?.userGrowth || 0}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions + Order Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card className="bg-gradient-to-br from-white to-gray-50 shadow-xl rounded-2xl border-0 hover:shadow-2xl transition-all">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                Quick Actions
              </CardTitle>
              <CardDescription className="text-gray-500">
                Common admin tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    href: "/admin/users",
                    color: "from-blue-50 to-blue-100",
                    icon: <UserCheck className="h-5 w-5 text-blue-500 mr-3" />,
                    title: "Manage Users",
                    desc: "View and edit users",
                  },
                  {
                    href: "/admin/users?role=admin",
                    color: "from-indigo-50 to-indigo-100",
                    icon: <UserCheck className="h-5 w-5 text-indigo-600 mr-3" />,
                    title: "Manage Admins",
                    desc: "View and edit admins",
                  },
                  {
                    href: "/admin/request",
                    color: "from-green-50 to-green-100",
                    icon: (
                      <ShoppingCart className="h-5 w-5 text-green-500 mr-3" />
                    ),
                    title: "View Orders",
                    desc: "Manage customer orders",
                  },
                  {
                    href: "/admin/products",
                    color: "from-purple-50 to-purple-100",
                    icon: <Package className="h-5 w-5 text-purple-500 mr-3" />,
                    title: "Manage Products",
                    desc: "Add or update products",
                  },
                  {
                    href: "/admin/courses",
                    color: "from-orange-50 to-orange-100",
                    icon: <BookOpen className="h-5 w-5 text-orange-500 mr-3" />,
                    title: "Manage Courses",
                    desc: "Add or update courses",
                  },
                ].map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.href}
                    className={`w-full flex items-center p-3 bg-gradient-to-r ${item.color} rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition`}
                  >
                    {item.icon}
                    <div>
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Statistics */}
          <Card className="bg-gradient-to-br from-white to-gray-50 shadow-xl rounded-2xl border-0 hover:shadow-2xl transition-all">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2 text-orange-500" />
                Order Statistics
              </CardTitle>
              <CardDescription className="text-gray-500">
                Overview of order performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity + Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card className="bg-gradient-to-br from-white to-gray-50 shadow-xl rounded-2xl border-0 hover:shadow-2xl transition-all">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-blue-500" />
                Recent Activity
              </CardTitle>
              <CardDescription className="text-gray-500">
                Latest actions on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity && recentActivity.length > 0 ? (
                  recentActivity.map((activity: any, index: number) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <Activity className="h-4 w-4 text-blue-500" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {activity.title || activity.name || "Activity"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {activity.description || activity.details || "No details available"}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {activity.time || activity.timestamp || new Date().toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    No recent activity to display
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card className="bg-gradient-to-br from-white to-gray-50 shadow-xl rounded-2xl border-0 hover:shadow-2xl transition-all">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <Package className="h-5 w-5 mr-2 text-blue-500" />
                Top Products
              </CardTitle>
              <CardDescription className="text-gray-500">
                Best performing products this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts && topProducts.length > 0 ? (
                  topProducts.map((product, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                          style={{
                            backgroundColor:
                              index === 0
                                ? "#FFD700"
                                : index === 1
                                ? "#C0C0C0"
                                : index === 2
                                ? "#CD7F32"
                                : "#6C757D",
                          }}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {product.sales} sales
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-green-500">
                        {product.revenue}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    No product data available
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
