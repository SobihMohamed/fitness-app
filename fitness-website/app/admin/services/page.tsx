"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Plus, Search, Edit3, Trash2, Loader2, Wrench, Save, AlertCircle, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { AdminLayout } from "@/components/admin/admin-layout"
import { API_CONFIG } from "@/config/api"
import Loading from "@/app/loading"
import { useLoading } from "@/hooks/use-loading"
import { useAdminApi } from "@/hooks/admin/use-admin-api"

type Service = {
  service_id: string
  title: string
  details: string
  duration: string
  price: string | number
  picture: string | null
  created_at?: string
  admin_id?: string
}

type FormState = {
  title: string
  details: string
  duration: string
  price: string
  picture: File | null
}

const BASE = API_CONFIG.BASE_URL

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)
  const [form, setForm] = useState<FormState>({ title: "", details: "", duration: "", price: "", picture: null })
  const [initialLoading, setInitialLoading] = useState(true)

  const { isAnyLoading, withLoading } = useLoading()
  const { getAuthHeaders, parseResponse, showSuccessToast, showErrorToast } = useAdminApi()

  useEffect(() => {
    load()
  }, [])

  // Debounce search to reduce filter work on each keystroke
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250)
    return () => clearTimeout(t)
  }, [search])

  async function load() {
    try {
      await withLoading("services", async () => {
        // Try admin endpoint first
        const adminRes = await fetch(API_CONFIG.ADMIN_FUNCTIONS.AdminServices.getAllServices, {
          headers: getAuthHeaders(),
          cache: 'no-store',
        })
        if (adminRes.status === 404) {
          setServices([])
          return
        }
        if (adminRes.ok) {
          const result = await parseResponse(adminRes)
          const arr = Array.isArray(result) ? result : Array.isArray(result?.data) ? result.data : []
          setServices(
            arr.map((s: any) => ({
              service_id: String(s.service_id),
              title: s.title ?? s.name ?? "",
              details: s.details ?? s.description ?? "",
              duration: s.duration ?? "",
              price: s.price ?? "",
              picture: s.picture ?? s.image_url ?? null,
              created_at: s.created_at,
            })),
          )
          return
        }
        // Fallback to public endpoint
        const res = await fetch(API_CONFIG.USER_SERVICES_API.getAll, { cache: 'no-store' })
        if (res.status === 404) { setServices([]); return }
        const result = await parseResponse(res)
        if (!res.ok) throw new Error(result?.message || "Failed to load services")
        const arr = Array.isArray(result) ? result : Array.isArray(result?.data) ? result.data : []
        setServices(
          arr.map((s: any) => ({
            service_id: String(s.service_id),
            title: s.title ?? s.name ?? "",
            details: s.details ?? s.description ?? "",
            duration: s.duration ?? "",
            price: s.price ?? "",
            picture: s.picture ?? s.image_url ?? null,
            created_at: s.created_at,
          })),
        )
      })
    } catch (e: any) {
      showErrorToast(e.message || "Failed to load services")
    }
  }

  function authHeaders(): Record<string, string> {
    return getAuthHeaders()
  }

  function hasAdminAuth(): boolean {
    return typeof window !== "undefined" && !!localStorage.getItem("adminAuth")
  }

  function openCreate() {
    setEditing(null)
    setForm({ title: "", details: "", duration: "", price: "", picture: null })
    setOpen(true)
  }

  function openEdit(s: Service) {
    setEditing(s)
    setForm({ title: s.title || "", details: s.details || "", duration: s.duration || "", price: String(s.price ?? ""), picture: null })
    setOpen(true)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.duration.trim() || !String(form.price).trim()) {
      showErrorToast("Title, duration, and price are required")
      return
    }
    if (editing && !hasAdminAuth()) {
      showErrorToast("Admin authentication required to update a service")
      return
    }

    const fd = new FormData()
    fd.append("title", form.title)
    fd.append("details", form.details)
    fd.append("duration", form.duration)
    fd.append("price", form.price)
    if (form.picture) fd.append("picture", form.picture)

    try {
      setSaving(true)
      const isEdit = Boolean(editing)
      const url = isEdit
        ? `${API_CONFIG.ADMIN_FUNCTIONS.AdminServices.update}/${editing!.service_id}`
        : API_CONFIG.ADMIN_FUNCTIONS.AdminServices.add
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: authHeaders().Authorization! },
        body: fd,
      })
      const data = await parseResponse(res)
      if (!res.ok) throw new Error(data?.message || (isEdit ? "Update failed" : "Create failed"))
      showSuccessToast(isEdit ? "Service updated successfully!" : "Service created successfully!")
      // Optimistically update local list on edit for immediate UI feedback
      if (isEdit && editing) {
        setServices((prev) =>
          prev.map((it) =>
            it.service_id === editing.service_id
              ? {
                  ...it,
                  title: form.title,
                  details: form.details,
                  duration: form.duration,
                  price: form.price,
                  // Keep existing picture if none uploaded in this edit
                  picture: it.picture,
                }
              : it,
          ),
        )
      }
      setOpen(false)
      await load()
    } catch (e: any) {
      showErrorToast(e.message || "Save failed")
    } finally {
      setSaving(false)
    }
  }

  // Delete confirmation dialog (match Blogs page behavior)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  function requestDelete(id: string) {
    const s = services.find((x) => x.service_id === id)
    const name = s?.title || "this service"
    setDeleteTarget({ id, name })
    setShowDeleteConfirm(true)
  }

  async function onDeleteConfirmed() {
    if (!deleteTarget) return
    try {
      if (!hasAdminAuth()) {
        showErrorToast("Admin authentication required to delete a service")
        return
      }
      setDeleting(true)
      const res = await fetch(API_CONFIG.ADMIN_FUNCTIONS.AdminServices.delete(deleteTarget.id), {
        method: "DELETE",
        headers: authHeaders(),
      })
      const data = await parseResponse(res)
      if (!res.ok) throw new Error(data?.message || "Delete failed")
      showSuccessToast("Service deleted successfully!")
      await load()
    } catch (e: any) {
      showErrorToast(e.message || "Delete failed")
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
      setDeleteTarget(null)
    }
  }

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase()
    if (!q) return services
    return services.filter((s) =>
      [s.title, s.details, s.duration, String(s.price)].some((v) => (v || "").toString().toLowerCase().includes(q)),
    )
  }, [services, debouncedSearch])

  const totalPrice = useMemo(() => {
    return services.reduce((sum, s) => {
      const n = parseFloat(String(s.price))
      return sum + (isNaN(n) ? 0 : n)
    }, 0)
  }, [services])

  // Initial load wrapper to align with Blogs page
  useEffect(() => {
    const init = async () => {
      try { await load() } finally { setInitialLoading(false) }
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (isAnyLoading() || initialLoading) {
    return (
      <AdminLayout>
        <Loading variant="admin" size="lg" message="Loading services..." icon="loader" className="h-[80vh]" />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 to-white min-h-screen">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-xl">
                <Wrench className="h-8 w-8 text-indigo-600" />
              </div>
              Services Management
            </h1>
            <p className="text-slate-600 mt-3 text-lg">Create, edit, and manage your offered services</p>
          </div>
          <Button onClick={openCreate} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 text-base">
            <Plus className="h-5 w-5" />
            Add New Service
          </Button>
        </div>

        {/* Stats Cards (match Blogs style) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-fr items-stretch">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-indigo-100 hover:shadow-xl transition-all duration-200 h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-indigo-700 mb-1">Total Services</p>
                  <p className="text-3xl font-bold text-indigo-900">{services.length}</p>
                </div>
                <div className="p-3 bg-indigo-200 rounded-full">
                  <Wrench className="h-8 w-8 text-indigo-700" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100 hover:shadow-xl transition-all duration-200 h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-700 mb-1">Total Price</p>
                  <p className="text-3xl font-bold text-emerald-900">{totalPrice.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-emerald-200 rounded-full">
                  <DollarSign className="h-8 w-8 text-emerald-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Search className="h-5 w-5 text-indigo-600" />
              Search Services
            </CardTitle>
            <CardDescription className="text-slate-600">Find by title, details, price, or duration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search services..."
                className="pl-12 h-12 text-base border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 border-b border-slate-200">
                      <TableHead className="w-20 font-semibold text-slate-700">Image</TableHead>
                      <TableHead className="min-w-[200px] font-semibold text-slate-700">Title</TableHead>
                      <TableHead className="w-28 font-semibold text-slate-700">Price</TableHead>
                      <TableHead className="w-40 font-semibold text-slate-700">Duration</TableHead>
                      <TableHead className="w-40 font-semibold text-slate-700">Created</TableHead>
                      <TableHead className="w-40 text-right font-semibold text-slate-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((s) => (
                      <TableRow key={s.service_id} className="hover:bg-slate-50 transition-colors duration-150 border-b border-slate-100">
                        <TableCell>
                          <div className="h-14 w-14 overflow-hidden rounded-lg border bg-slate-100 shadow-sm relative">
                            <Image
                              alt={s.title}
                              src={s.picture ? `${BASE}${s.picture}` : "/placeholder.svg?height=56&width=56"}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-slate-900">{s.title}</TableCell>
                        <TableCell className="text-slate-700">{s.price}</TableCell>
                        <TableCell className="text-slate-700">{s.duration}</TableCell>
                        <TableCell className="text-slate-700">{s.created_at ? new Date(s.created_at).toLocaleDateString() : "-"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEdit(s)}
                              className="h-9 w-9 p-0 hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-150"
                            >
                              <Edit3 className="h-4 w-4 text-indigo-600" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => requestDelete(s.service_id)}
                              disabled={deleting}
                              className="h-9 w-9 p-0 hover:bg-red-50 hover:border-red-200 transition-all duration-150"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {filtered.length === 0 && (
                  <div className="text-center py-16">
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      {debouncedSearch ? "No services found" : "No services yet"}
                    </h3>
                    <p className="text-slate-500 mb-6 max-w-md mx-auto">
                      {debouncedSearch
                        ? "Try adjusting your search criteria to find what you're looking for"
                        : "Get started by adding your first service to the platform"}
                    </p>
                    {!debouncedSearch && (
                      <Button onClick={openCreate} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700">
                        <Plus className="h-4 w-4" />
                        Add Your First Service
                      </Button>
                    )}
                  </div>
                )}
              </div>
          </CardContent>
        </Card>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Wrench className="h-5 w-5 text-indigo-600" />
                </div>
                {editing ? "Edit Service" : "Add New Service"}
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                {editing ? "Update the service information below." : "Fill in the details to add a new service to your platform."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Title *</label>
                  <Input
                    placeholder="e.g. Personal Training"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                    className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Price *</label>
                  <Input
                    placeholder="e.g. 99"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                    className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Duration *</label>
                  <Input
                    placeholder="e.g. 60 minutes"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    required
                    className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Image</label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setForm({ ...form, picture: e.target.files?.[0] || null })}
                    className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Details</label>
                <Textarea
                  rows={4}
                  value={form.details}
                  onChange={(e) => setForm({ ...form, details: e.target.value })}
                  placeholder="Describe the service..."
                  className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <DialogFooter className="flex gap-3 pt-6">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="px-6">
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-6">
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {editing ? "Saving..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {editing ? "Save Changes" : "Create Service"}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                Confirm Deletion
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{deleteTarget?.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-3">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} disabled={deleting}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={onDeleteConfirmed} disabled={deleting} className="flex items-center gap-2">
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}
