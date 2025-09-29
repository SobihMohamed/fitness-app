"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  UserCheck,
  Package,
  BookOpen,
  ShoppingCart,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { QuickActionsProps } from "@/types";

const quickActionsData = [
  {
    href: "/admin/users",
    color: "from-blue-50 to-blue-100",
    icon: <UserCheck className="h-5 w-5 text-blue-500 mr-3" />,
    title: "Manage Users",
    desc: "View and edit users",
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
  {
    href: "/admin/blogs",
    color: "from-red-50 to-red-100",
    title: "Manage Blogs",
    desc: "Add or update blog posts",
    icon: <BookOpen className="h-5 w-5 text-red-500 mr-3" />,
  },
  {
    href: "/admin/requests",
    color: "from-green-50 to-green-100",
    title: "Manage Requests",
    desc: "Training & course requests",
    icon: <ShoppingCart className="h-5 w-5 text-green-600 mr-3" />,
  },
  {
    href: "/admin/services",
    color: "from-teal-50 to-teal-100",
    icon: <Zap className="h-5 w-5 text-teal-500 mr-3" />,
    title: "Manage Services",
    desc: "Add or update services",
  },
];

export const QuickActions = React.memo<QuickActionsProps>(() => {
  return (
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
          {quickActionsData.map((item, idx) => (
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
  );
});

QuickActions.displayName = "QuickActions";
