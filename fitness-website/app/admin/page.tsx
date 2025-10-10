"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AdminLayout } from "@/components/admin/admin-layout";

export default function AdminIndexPage() {
  const router = useRouter();

  const handleRedirect = useCallback(() => {
    router.push("/admin/dashboard");
  }, [router]);

  useEffect(() => {
    handleRedirect();
  }, [handleRedirect]);

  // Modern loading UI while redirecting
  return (
    <AdminLayout>
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <p className="text-gray-700 text-lg">Redirecting to dashboard...</p>
        </div>
      </div>
    </AdminLayout>
  );
}