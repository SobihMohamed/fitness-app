"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/app/loading";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AdminLayout } from "@/components/admin/admin-layout";
import {
  Package,
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

export default function AdminDashboardWrapper() {
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
  const token = localStorage.getItem("adminAuth");
  if (!token) {
    router.push("/admin/login");
  } else {
      setIsChecking(false);
  }
}, [router]);

  return (
    <AdminLayout>
    
      {isChecking ? (
        <Loading
          variant="admin"
          size="lg"
          message="Loading users and administrators..."
          icon="users"
          className="h-[80vh]"
        />
      ) : (
        <AdminDashboard />
      )}
    </AdminLayout>
  );
}

const stats = [
  {
    title: "Total Products",
    value: "156",
    change: "+12%",
    trend: "up",
    icon: Package,
    color: "#007BFF",
  },
  {
    title: "Active Users",
    value: "2,847",
    change: "+8%",
    trend: "up",
    icon: Users,
    color: "#32CD32",
  },
  {
    title: "Blog Posts",
    value: "43",
    change: "+3",
    trend: "up",
    icon: FileText,
    color: "#007BFF",
  },
  {
    title: "Revenue",
    value: "$12,847",
    change: "-2%",
    trend: "down",
    icon: DollarSign,
    color: "#32CD32",
  },
];

const recentActivity = [
  {
    action: "New product added",
    item: "Premium Whey Protein",
    time: "2 hours ago",
    type: "product",
  },
  {
    action: "User registered",
    item: "john.doe@email.com",
    time: "4 hours ago",
    type: "user",
  },
  {
    action: "Blog post published",
    item: "10 Best Exercises for Beginners",
    time: "6 hours ago",
    type: "content",
  },
  {
    action: "Product updated",
    item: "Resistance Bands Set",
    time: "8 hours ago",
    type: "product",
  },
  {
    action: "New order received",
    item: "Order #1234",
    time: "10 hours ago",
    type: "order",
  },
];

const topProducts = [
  { name: "Premium Whey Protein", sales: 145, revenue: "$7,105" },
  { name: "Resistance Bands Set", sales: 89, revenue: "$2,667" },
  { name: "Smart Fitness Tracker", sales: 67, revenue: "$13,393" },
  { name: "Yoga Mat Premium", sales: 54, revenue: "$4,320" },
  { name: "Pre-Workout Energy", sales: 43, revenue: "$1,505" },
];

export function AdminDashboard() {
  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">
          Welcome back! Here's what's happening with your fitness platform.
        </p>
      </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <div className="flex items-center mt-2">
                      {stat.trend === "up" ? (
                        <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 mr-1 text-red-500" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          stat.trend === "up"
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {stat.change}
                      </span>
                      <span className="text-sm ml-1 text-gray-500">
                        from last month
                      </span>
                    </div>
                  </div>
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: stat.color, opacity: 0.1 }}
                  >
                    <stat.icon
                      className="h-6 w-6"
                      style={{ color: stat.color }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity & Top Products */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card className="bg-white border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900">Recent Activity</CardTitle>
              <CardDescription className="text-gray-500">
                Latest updates from your platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor:
                          activity.type === "product"
                            ? "#007BFF"
                            : activity.type === "user"
                            ? "#32CD32"
                            : "#6C757D",
                      }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.action}
                      </p>
                      <p className="text-sm text-gray-500">{activity.item}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {activity.time}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card className="bg-white border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900">Top Products</CardTitle>
              <CardDescription className="text-gray-500">
                Best performing products this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                        style={{
                          backgroundColor: index < 3 ? "#007BFF" : "#6C757D",
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
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  );
}
