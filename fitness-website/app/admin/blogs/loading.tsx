import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { AdminLayout } from "@/components/admin/admin-layout"

export default function BlogsLoading() {
  return (
    <AdminLayout>
      <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 to-white min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <Skeleton className="h-10 w-64" />
            </div>
            <Skeleton className="h-6 w-96" />
          </div>
          <Skeleton className="h-12 w-40" />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-12" />
                  </div>
                  <Skeleton className="h-14 w-14 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Category Management */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-6" />
                <Skeleton className="h-6 w-48" />
              </div>
              <Skeleton className="h-9 w-36" />
            </div>
            <Skeleton className="h-4 w-80" />
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Category Form */}
            <div className="flex gap-3">
              <Skeleton className="flex-1 h-11" />
              <Skeleton className="h-11 w-32" />
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-3 border-2 border-slate-200">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-24" />
                    <div className="flex gap-1">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Search and Filter */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-6 w-48" />
            </div>
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <Skeleton className="flex-1 h-12" />
              <Skeleton className="w-full md:w-48 h-12" />
              <Skeleton className="w-full md:w-48 h-12" />
            </div>
          </CardContent>
        </Card>

        {/* Blogs Table */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              {/* Table Header */}
              <div className="bg-slate-50 border-b border-slate-200 p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
              {/* Table Rows */}
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="border-b border-slate-100 p-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-14 w-14 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-64" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-5 w-20" />
                    <div className="flex gap-2">
                      <Skeleton className="h-9 w-9" />
                      <Skeleton className="h-9 w-9" />
                    </div>
                  </div>
                </div>
              ))}
              {/* Pagination */}
              <div className="flex justify-center gap-2 p-6 border-t bg-slate-50">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-10" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
