"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin/admin-layout";

export default function AdminIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/admin/dashboard");
  }, [router]);

  // Minimal UI while redirecting (no loading spinner)
  return (
    <AdminLayout>
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-gray-600">Redirecting to dashboard...</p>
      </div>
    </AdminLayout>
  );
}