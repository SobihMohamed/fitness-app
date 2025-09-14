"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  Plus,
  Edit3,
  Trash2,
  Loader2,
  BookOpen,
  Save,
  AlertCircle,
  ChevronLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { AdminLayout } from "@/components/admin/admin-layout"
import { API_CONFIG } from "@/config/api"
import { useAdminApi } from "@/hooks/admin/use-admin-api"
import { formatDateTimeDDMMYYYYHHmm } from "@/utils/format"
import { getHttpClient } from "@/lib/http"

const BASE = API_CONFIG.BASE_URL

type Course = {
  course_id: string
  title: string
  description: string
  price?: string
  image_url?: string | null
  created_at?: string
}

type Module = {
  module_id: string
  title: string
  description: string
  order_number?: number | string
  course_id: string
  created_at?: string
}

type Chapter = {
  chapter_id: string
  title: string
  description: string
  video_link?: string
  order_number?: number | string
  module_id: string
  created_at?: string
}

type ModuleForm = { title: string; description: string; order_number: string }

type ChapterForm = { title: string; description: string; video_link: string; order_number: string }

export default function CourseDetailsPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const courseId = params?.id ? String(params.id) : ""

  const [course, setCourse] = useState<Course | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [chaptersByModule, setChaptersByModule] = useState<Record<string, Chapter[]>>({})

  const [modOpen, setModOpen] = useState(false)
  const [editingModule, setEditingModule] = useState<Module | null>(null)
  const [modForm, setModForm] = useState<ModuleForm>({ title: "", description: "", order_number: "" })
  const [chapOpen, setChapOpen] = useState(false)
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null)
  const [currentModuleForChapter, setCurrentModuleForChapter] = useState<Module | null>(null)
  const [chapForm, setChapForm] = useState<ChapterForm>({ title: "", description: "", video_link: "", order_number: "" })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ kind: "module" | "chapter"; id: string; name: string } | null>(null)

  const [initialLoading, setInitialLoading] = useState(true)
  const { getAuthHeaders, parseResponse, showSuccessToast, showErrorToast } = useAdminApi()
  const http = getHttpClient()

  useEffect(() => {
    if (!courseId) return
    const init = async () => {
      try {
        await Promise.all([loadCourse(), loadModulesAndChapters()])
      } catch (e: any) {
        showErrorToast(e?.message || "Failed to load course details")
      } finally {
        setInitialLoading(false)
      }
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId])

  async function loadCourse() {
    const { data } = await http.get(
      API_CONFIG.ADMIN_FUNCTIONS.courses.getById(courseId),
      { headers: getAuthHeaders(), params: { _: Date.now() } }
    )
    const c = (data as any)?.Course || (Array.isArray((data as any)?.data) ? (data as any).data?.[0] : (data as any).data) || data
    setCourse({
      course_id: String(c.course_id),
      title: c.title || "",
      description: c.description || "",
      price: String(c.price ?? ""),
      image_url: c.image_url || null,
      created_at: c.created_at,
    })
  }

  async function loadModulesAndChapters() {
    // Load all modules then filter by course
    const { data: modData } = await http.get(
      API_CONFIG.ADMIN_FUNCTIONS.courses.modules.getAll,
      { headers: getAuthHeaders(), params: { _: Date.now() } }
    )
    const allMods = Array.isArray(modData) ? modData : Array.isArray((modData as any)?.data) ? (modData as any).data : []
    const mods = allMods
      .filter((m: any) => String(m.course_id) === courseId)
      .map((m: any) => ({
        module_id: String(m.module_id),
        title: m.title || "",
        description: m.description || "",
        order_number: m.order_number ?? m.order ?? "",
        course_id: String(m.course_id ?? ""),
        created_at: m.created_at,
      }))
    setModules(mods)

    // Load all chapters and group by module
    const { data: chapData } = await http.get(
      API_CONFIG.ADMIN_FUNCTIONS.courses.chapters.getAll,
      { headers: getAuthHeaders(), params: { _: Date.now() } }
    )
    const allChaps = Array.isArray(chapData) ? chapData : Array.isArray((chapData as any)?.data) ? (chapData as any).data : []
    const byMod: Record<string, Chapter[]> = {}
    allChaps.forEach((c: any) => {
      const mid = String(c.module_id ?? "")
      if (!mid) return
      const ch: Chapter = {
        chapter_id: String(c.chapter_id),
        title: c.title || "",
        description: c.description || "",
        video_link: c.video_link || c.link || "",
        order_number: c.order_number ?? c.order ?? "",
        module_id: mid,
        created_at: c.created_at,
      }
      if (!byMod[mid]) byMod[mid] = []
      byMod[mid].push(ch)
    })
    setChaptersByModule(byMod)
  }

  // Module CRUD
  function openCreateModule() {
    setEditingModule(null)
    setModForm({ title: "", description: "", order_number: "" })
    setModOpen(true)
  }
  function openEditModule(m: Module) {
    setEditingModule(m)
    setModForm({ title: m.title || "", description: m.description || "", order_number: String(m.order_number ?? "") })
    setModOpen(true)
  }
  async function onSubmitModule(e: React.FormEvent) {
    e.preventDefault()
    if (!modForm.title.trim()) return showErrorToast("Module title is required")
    const payload = {
      title: modForm.title.trim(),
      description: modForm.description.trim(),
      order_number: modForm.order_number ? Number(modForm.order_number) : undefined,
      course_id: courseId,
    }
    try {
      setSaving(true)
      const isEdit = Boolean(editingModule)
      const url = isEdit
        ? API_CONFIG.ADMIN_FUNCTIONS.courses.modules.update(editingModule!.module_id)
        : API_CONFIG.ADMIN_FUNCTIONS.courses.modules.add
      await http.post(url, payload, { headers: getAuthHeaders(true) })
      showSuccessToast(isEdit ? "Module updated" : "Module created")
      setModOpen(false)
      await loadModulesAndChapters()
    } catch (e: any) {
      showErrorToast(e?.message || "Save failed")
    } finally {
      setSaving(false)
    }
  }
  function requestDeleteModule(m: Module) {
    setDeleteTarget({ kind: "module", id: m.module_id, name: m.title })
    setShowDeleteConfirm(true)
  }

  // Chapter CRUD
  function openCreateChapter(m: Module) {
    setEditingChapter(null)
    setCurrentModuleForChapter(m)
    setChapForm({ title: "", description: "", video_link: "", order_number: "" })
    setChapOpen(true)
  }
  function openEditChapter(m: Module, c: Chapter) {
    setCurrentModuleForChapter(m)
    setEditingChapter(c)
    setChapForm({
      title: c.title || "",
      description: c.description || "",
      video_link: c.video_link || "",
      order_number: String(c.order_number ?? ""),
    })
    setChapOpen(true)
  }
  async function onSubmitChapter(e: React.FormEvent) {
    e.preventDefault()
    if (!chapForm.title.trim() || !currentModuleForChapter) return showErrorToast("Title is required")
    const payload = {
      title: chapForm.title.trim(),
      description: chapForm.description.trim(),
      video_link: chapForm.video_link.trim(),
      order_number: chapForm.order_number ? Number(chapForm.order_number) : undefined,
      module_id: currentModuleForChapter.module_id,
    }
    try {
      setSaving(true)
      const isEdit = Boolean(editingChapter)
      const url = isEdit
        ? API_CONFIG.ADMIN_FUNCTIONS.courses.chapters.update(editingChapter!.chapter_id)
        : API_CONFIG.ADMIN_FUNCTIONS.courses.chapters.add
      await http.post(url, payload, { headers: getAuthHeaders(true) })
      showSuccessToast(isEdit ? "Chapter updated" : "Chapter created")
      // Optimistic update for immediate UI feedback
      if (!isEdit && currentModuleForChapter) {
        const tempId = `temp-${Date.now()}`
        const newChapter: Chapter = {
          chapter_id: tempId,
          title: payload.title,
          description: payload.description || "",
          video_link: payload.video_link || "",
          order_number: payload.order_number ?? "",
          module_id: currentModuleForChapter.module_id,
          created_at: new Date().toISOString(),
        }
        setChaptersByModule((prev) => {
          const copy = { ...prev }
          const list = copy[currentModuleForChapter.module_id] ? [...copy[currentModuleForChapter.module_id]] : []
          list.push(newChapter)
          copy[currentModuleForChapter.module_id] = list
          return copy
        })
      }
      if (isEdit && currentModuleForChapter && editingChapter) {
        setChaptersByModule((prev) => {
          const copy = { ...prev }
          const list = copy[currentModuleForChapter.module_id] ? [...copy[currentModuleForChapter.module_id]] : []
          copy[currentModuleForChapter.module_id] = list.map((c) =>
            c.chapter_id === editingChapter.chapter_id
              ? { ...c, title: payload.title, description: payload.description || "", video_link: payload.video_link || "", order_number: payload.order_number ?? "" }
              : c,
          )
          return copy
        })
      }
      setChapOpen(false)
      // Prefer a lighter refresh of just chapters after add/edit
      const { data: chapData } = await http.get(
        API_CONFIG.ADMIN_FUNCTIONS.courses.chapters.getAll,
        { headers: getAuthHeaders(), params: { _: Date.now() } }
      )
      const allChaps = Array.isArray(chapData) ? chapData : Array.isArray((chapData as any)?.data) ? (chapData as any).data : []
      const byMod: Record<string, Chapter[]> = {}
      allChaps.forEach((c: any) => {
        const mid = String(c.module_id ?? '')
        if (!mid) return
        const ch: Chapter = {
          chapter_id: String(c.chapter_id),
          title: c.title || '',
          description: c.description || '',
          video_link: c.video_link || c.link || '',
          order_number: c.order_number ?? c.order ?? '',
          module_id: mid,
          created_at: c.created_at,
        }
        if (!byMod[mid]) byMod[mid] = []
        byMod[mid].push(ch)
      })
      setChaptersByModule(byMod)
    } catch (e: any) {
      showErrorToast(e?.message || "Save failed")
    } finally {
      setSaving(false)
    }
  }
  function requestDeleteChapter(c: Chapter) {
    setDeleteTarget({ kind: "chapter", id: c.chapter_id, name: c.title })
    setShowDeleteConfirm(true)
  }

  async function onDeleteConfirmed() {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      const url =
        deleteTarget.kind === "module"
          ? API_CONFIG.ADMIN_FUNCTIONS.courses.modules.delete(deleteTarget.id)
          : API_CONFIG.ADMIN_FUNCTIONS.courses.chapters.delete(deleteTarget.id)
      await http.delete(url, { headers: getAuthHeaders() })
      showSuccessToast("Deleted successfully")
      await loadModulesAndChapters()
    } catch (e: any) {
      showErrorToast(e?.message || "Delete failed")
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
      setDeleteTarget(null)
    }
  }

  // Loading state is managed by the component's state

  return (
    <AdminLayout>
      <div className="space-y-6 sm:space-y-8 p-4 sm:p-8 bg-gradient-to-br from-slate-50 to-white min-h-screen">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={() => router.push("/admin/courses")}
          className="gap-2 hover:bg-indigo-600 hover:border-indigo-200 transition-all duration-200"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Courses
        </Button>
      </div>
      </div>
      {/* Course Header Section */}
      <Card className="border-0 shadow-xl bg-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2"></div>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <BookOpen className="h-8 w-8 text-indigo-600" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold text-slate-800">
                  {course?.title || "Course Details"}
                </CardTitle>
                <CardDescription className="text-slate-600 mt-2">
                  Manage modules and chapters associated with this course
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
            <h3 className="text-sm font-medium text-slate-500 mb-2">
              Description
            </h3>
            <p className="text-slate-700">
              {course?.description ||
                "No description provided for this course."}
            </p>
          </div>
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <span className="text-slate-500 block">Created</span>
              <span className="font-medium">
                {course?.created_at
                  ? formatDateTimeDDMMYYYYHHmm(course.created_at)
                  : "-"}
              </span>
            </div>
            {course?.price && (
              <div>
                <span className="text-slate-500 block">Price</span>
                <span className="font-medium">{course.price}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modules Accordion */}
      <Card className="border-0 shadow-lg bg-white rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-1"></div>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <CardTitle className="text-slate-800 flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              Modules
            </CardTitle>
            <CardDescription className="text-slate-600 mt-1">Course → Modules → Chapters</CardDescription>
          </div>
          <Button onClick={openCreateModule} className="bg-indigo-600 hover:bg-indigo-700 gap-2 transition-all duration-200 shadow-md hover:shadow-lg w-full sm:w-auto">
            <Plus className="h-4 w-4" /> Add Module
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <Accordion type="multiple" className="w-full space-y-4">
            {modules.map((m) => (
              <AccordionItem key={m.module_id} value={m.module_id} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
                <AccordionTrigger className="px-6 py-4 bg-white hover:bg-slate-50">
                  <div className="flex flex-col items-start text-left w-full">
                    <div className="font-semibold text-slate-900 text-lg">{m.title}</div>
                    <div className="text-sm text-slate-600 line-clamp-2 mt-1">{m.description}</div>
                    <div className="text-xs text-slate-500 mt-2 flex gap-6">
                      <span className="flex items-center gap-1">
                        <span className="inline-block w-2 h-2 rounded-full bg-blue-400"></span>
                        Order: {String(m.order_number ?? "-")}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="inline-block w-2 h-2 rounded-full bg-indigo-400"></span>
                        Created: {m.created_at ? formatDateTimeDDMMYYYYHHmm(m.created_at) : "-"}
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="bg-slate-50 border-t border-slate-200">
                  <div className="flex flex-col sm:flex-row justify-end gap-2 px-4 sm:px-6 py-3 bg-white border-b border-slate-200">
                    <Button variant="outline" size="sm" onClick={() => openEditModule(m)} className="h-9 w-full sm:w-auto px-3 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200">
                      <Edit3 className="h-4 w-4 text-blue-600 mr-1" /> Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => requestDeleteModule(m)} className="h-9 w-full sm:w-auto px-3 hover:bg-red-50 hover:text-red-700 transition-colors duration-200">
                      <Trash2 className="h-4 w-4 text-red-600 mr-1" /> Delete
                    </Button>
                    <Button size="sm" onClick={() => openCreateChapter(m)} className="bg-blue-600 hover:bg-blue-700 h-9 w-full sm:w-auto transition-all duration-200 shadow-sm hover:shadow">
                      <Plus className="h-4 w-4 mr-1" /> Add Chapter
                    </Button>
                  </div>
                  <div className="overflow-x-auto mt-3 px-2 sm:px-4 pb-4">
                    <Table className="border border-slate-200 rounded-lg overflow-hidden">
                      <TableHeader>
                        <TableRow className="bg-slate-50 border-b border-slate-200">
                          <TableHead className="min-w-[150px] sm:min-w-[220px] font-semibold text-slate-700">Title</TableHead>
                          <TableHead className="hidden md:table-cell min-w-[260px] font-semibold text-slate-700">Description</TableHead>
                          <TableHead className="w-20 sm:w-40 font-semibold text-slate-700">Video</TableHead>
                          <TableHead className="w-16 sm:table-cell font-semibold text-slate-700">Order</TableHead>
                          <TableHead className="hidden sm:table-cell w-48 font-semibold text-slate-700">Created</TableHead>
                          <TableHead className="w-20 sm:w-28 text-right font-semibold text-slate-700">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(chaptersByModule[m.module_id] || []).map(
                          (c, idx) => (
                            <TableRow
                              key={c.chapter_id}
                              className={`hover:bg-slate-50 transition-colors duration-150 ${
                                idx % 2 === 0 ? "bg-white" : "bg-slate-50"
                              }`}
                            >
                              <TableCell className="font-medium text-slate-900 truncate max-w-[120px] sm:max-w-none">
                                {c.title}
                              </TableCell>
                              <TableCell className="hidden md:table-cell text-slate-700 truncate max-w-xl">
                                {c.description}
                              </TableCell>
                              <TableCell>
                                {c.video_link ? (
                                  <a
                                    href={c.video_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1 transition-colors duration-200"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="14"
                                      height="14"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                      <polyline points="15 3 21 3 21 9"></polyline>
                                      <line x1="10" y1="14" x2="21" y2="3"></line>
                                    </svg>
                                    <span className="hidden sm:inline">View</span>
                                  </a>
                                ) : (
                                  <span className="text-slate-400 italic text-xs sm:text-sm">No link</span>
                                )}
                              </TableCell>
                                <TableCell>
                                  <span className="inline-flex items-center justify-center px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                    {String(c.order_number ?? "-")}
                                  </span>
                                </TableCell>
                                <TableCell className="hidden sm:table-cell text-xs text-slate-600">
                                  {c.created_at
                                    ? formatDateTimeDDMMYYYYHHmm(c.created_at)
                                    : "-"}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-1 sm:gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openEditChapter(m, c)}
                                      className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-full hover:bg-blue-100 hover:border-blue-300 transition-colors duration-200"
                                    >
                                      <Edit3 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-600" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => requestDeleteChapter(c)}
                                      className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-full hover:bg-red-100 hover:border-red-300 transition-colors duration-200"
                                    >
                                      <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-red-600" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )
                          )}
                          {(!chaptersByModule[m.module_id] ||
                            chaptersByModule[m.module_id].length === 0) && (
                            <TableRow>
                              <TableCell
                                colSpan={6}
                                className="text-center py-6 sm:py-8"
                              >
                                <div className="flex flex-col items-center justify-center text-slate-500">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="mb-2 text-slate-400 sm:w-24 sm:h-24"
                                  >
                                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                  </svg>
                                  <p className="text-sm sm:text-base">
                                    No chapters yet
                                  </p>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openCreateChapter(m)}
                                    className="mt-2 text-blue-600 border-blue-200 hover:bg-blue-50 text-xs sm:text-sm"
                                  >
                                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />{" "}
                                    Add your first chapter
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
              {modules.length === 0 && (
                <div className="text-center text-slate-500 py-10">
                  No modules yet. Click "Add Module" to create one.
                </div>
              )}
            </Accordion>
          </CardContent>
        </Card>

        {/* Module Dialog */}
        <Dialog open={modOpen} onOpenChange={setModOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl rounded-xl">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-1 absolute top-0 left-0 right-0 rounded-t-xl"></div>
            <DialogHeader className="pt-6">
              <DialogTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                {editingModule ? (
                  <>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Edit3 className="h-5 w-5 text-blue-600" />
                    </div>
                    Edit Module
                  </>
                ) : (
                  <>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Plus className="h-5 w-5 text-blue-600" />
                    </div>
                    Add Module
                  </>
                )}
              </DialogTitle>
              <DialogDescription className="text-slate-600 mt-1">
                {editingModule
                  ? "Update the module details."
                  : "Create a new module for this course."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={onSubmitModule} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={modForm.title}
                    onChange={(e) =>
                      setModForm({ ...modForm, title: e.target.value })
                    }
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                    placeholder="Enter module title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Order Number
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={modForm.order_number}
                    onChange={(e) =>
                      setModForm({ ...modForm, order_number: e.target.value })
                    }
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                    placeholder="Enter order number"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Description
                  </label>
                  <Textarea
                    rows={4}
                    value={modForm.description}
                    onChange={(e) =>
                      setModForm({ ...modForm, description: e.target.value })
                    }
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 resize-none"
                    placeholder="Enter module description"
                  />
                </div>
              </div>
              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModOpen(false)}
                  className="border-slate-300 hover:bg-slate-100 transition-all duration-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {editingModule ? "Save Changes" : "Create Module"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Chapter Dialog */}
        <Dialog open={chapOpen} onOpenChange={setChapOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl rounded-xl">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-1 absolute top-0 left-0 right-0 rounded-t-xl"></div>
            <DialogHeader className="pt-6">
              <DialogTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                {editingChapter ? (
                  <>
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Edit3 className="h-5 w-5 text-indigo-600" />
                    </div>
                    Edit Chapter
                  </>
                ) : (
                  <>
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Plus className="h-5 w-5 text-indigo-600" />
                    </div>
                    Add Chapter
                  </>
                )}
              </DialogTitle>
              <DialogDescription className="text-slate-600 mt-1">
                {editingChapter
                  ? "Update the chapter details."
                  : "Create a new chapter for this module."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={onSubmitChapter} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={chapForm.title}
                    onChange={(e) =>
                      setChapForm({ ...chapForm, title: e.target.value })
                    }
                    className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200"
                    placeholder="Enter chapter title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Order Number
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={chapForm.order_number}
                    onChange={(e) =>
                      setChapForm({ ...chapForm, order_number: e.target.value })
                    }
                    className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200"
                    placeholder="Enter order number"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Video Link
                  </label>
                  <Input
                    type="url"
                    value={chapForm.video_link}
                    onChange={(e) =>
                      setChapForm({ ...chapForm, video_link: e.target.value })
                    }
                    className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Description
                  </label>
                  <Textarea
                    rows={4}
                    value={chapForm.description}
                    onChange={(e) =>
                      setChapForm({ ...chapForm, description: e.target.value })
                    }
                    className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200 resize-none"
                    placeholder="Enter chapter description"
                  />
                </div>
              </div>
              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setChapOpen(false)}
                  className="border-slate-300 hover:bg-slate-100 transition-all duration-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {editingChapter ? "Save Changes" : "Create Chapter"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent className="max-w-md border-0 shadow-2xl rounded-xl">
            <div className="bg-gradient-to-r from-red-500 to-red-600 h-1 absolute top-0 left-0 right-0 rounded-t-xl"></div>
            <DialogHeader className="pt-6">
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-5 w-5" />
                </div>
                Confirm Deletion
              </DialogTitle>
              <DialogDescription className="text-slate-600 mt-2">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-slate-800">
                  "{deleteTarget?.name}"
                </span>
                ? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="border-slate-300 hover:bg-slate-100 transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={onDeleteConfirmed}
                disabled={deleting}
                className="gap-2 bg-red-600 hover:bg-red-700 shadow-md hover:shadow-lg transition-all duration-200"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </AdminLayout>
  )
}
