"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Package, Users, FileText, DollarSign, TrendingUp, TrendingDown } from "lucide-react"

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
]

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
]

const topProducts = [
  { name: "Premium Whey Protein", sales: 145, revenue: "$7,105" },
  { name: "Resistance Bands Set", sales: 89, revenue: "$2,667" },
  { name: "Smart Fitness Tracker", sales: 67, revenue: "$13,393" },
  { name: "Yoga Mat Premium", sales: 54, revenue: "$4,320" },
  { name: "Pre-Workout Energy", sales: 43, revenue: "$1,505" },
]

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "#212529" }}>
            Dashboard
          </h1>
          <p style={{ color: "#6C757D" }}>Welcome back! Here's what's happening with your fitness platform.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: "#6C757D" }}>
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold" style={{ color: "#212529" }}>
                      {stat.value}
                    </p>
                    <div className="flex items-center mt-2">
                      {stat.trend === "up" ? (
                        <TrendingUp className="h-4 w-4 mr-1" style={{ color: "#32CD32" }} />
                      ) : (
                        <TrendingDown className="h-4 w-4 mr-1" style={{ color: "#dc3545" }} />
                      )}
                      <span
                        className="text-sm font-medium"
                        style={{ color: stat.trend === "up" ? "#32CD32" : "#dc3545" }}
                      >
                        {stat.change}
                      </span>
                      <span className="text-sm ml-1" style={{ color: "#6C757D" }}>
                        from last month
                      </span>
                    </div>
                  </div>
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: stat.color, opacity: 0.1 }}
                  >
                    <stat.icon className="h-6 w-6" style={{ color: stat.color }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card className="bg-white border-0 shadow-lg">
            <CardHeader>
              <CardTitle style={{ color: "#212529" }}>Recent Activity</CardTitle>
              <CardDescription style={{ color: "#6C757D" }}>Latest updates from your platform</CardDescription>
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
                              : activity.type === "content"
                                ? "#007BFF"
                                : "#32CD32",
                      }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: "#212529" }}>
                        {activity.action}
                      </p>
                      <p className="text-sm" style={{ color: "#6C757D" }}>
                        {activity.item}
                      </p>
                    </div>
                    <span className="text-xs" style={{ color: "#6C757D" }}>
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
              <CardTitle style={{ color: "#212529" }}>Top Products</CardTitle>
              <CardDescription style={{ color: "#6C757D" }}>Best performing products this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                        style={{ backgroundColor: index < 3 ? "#007BFF" : "#6C757D" }}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: "#212529" }}>
                          {product.name}
                        </p>
                        <p className="text-xs" style={{ color: "#6C757D" }}>
                          {product.sales} sales
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-medium" style={{ color: "#32CD32" }}>
                      {product.revenue}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
