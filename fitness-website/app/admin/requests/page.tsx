"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, BookOpen, DollarSign } from "lucide-react";
import type { RequestSection } from "@/types";

// Dynamic imports with SSR disabled to prevent hydration mismatches
const RequestsHeader = dynamic(
  () => import("@/components/admin/requests").then((mod) => ({ default: mod.RequestsHeader })),
  { ssr: false }
);

const RequestsTable = dynamic(
  () => import("@/components/admin/requests").then((mod) => ({ default: mod.RequestsTable })),
  { ssr: false }
);
 

export default function AdminRequestsPage() {
  const [activeTab, setActiveTab] = useState<RequestSection>("training");
  
  return (
    <AdminLayout>
      <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 to-white min-h-screen">
        {/* Enhanced Header */}
        <RequestsHeader />

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as RequestSection)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-100 p-1 rounded-lg">
            <TabsTrigger
              value="training"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-700 font-medium rounded-md"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Training Requests
            </TabsTrigger>
            <TabsTrigger
              value="courses"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-700 font-medium rounded-md"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Course Requests
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-700 font-medium rounded-md"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Orders
            </TabsTrigger>
          </TabsList>
          {/* Lazy mount only active table to avoid triple data fetching/rendering */}
          {activeTab === "training" && (
            <TabsContent value="training" className="m-0">
              <RequestsTable section="training" />
            </TabsContent>
          )}
          {activeTab === "courses" && (
            <TabsContent value="courses" className="m-0">
              <RequestsTable section="courses" />
            </TabsContent>
          )}
          {activeTab === "orders" && (
            <TabsContent value="orders" className="m-0">
              <RequestsTable section="orders" />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </AdminLayout>
  );
}
