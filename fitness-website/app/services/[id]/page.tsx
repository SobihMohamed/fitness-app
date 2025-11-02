"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ProtectedAction } from "@/components/auth/Protected-Route"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import axios from "axios"
import { API_CONFIG } from "@/config/api"
import { getProxyImageUrl } from "@/lib/images"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, Clock, Loader2, Home, ChevronRight, CheckCircle2 } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import type { ClientService, BookingFormData } from "@/types"
import { cachedServicesApi } from "@/lib/api/cached-services"
import { servicesApi } from "@/lib/api/services"

export default function ServiceDetailsPage() {
  const params = useParams()
  const router = useRouter()

  const [service, setService] = useState<ClientService | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)
  const [requestStatus, setRequestStatus] = useState<"none" | "pending" | "approved" | "cancelled">("none")
  const [justSubmitted, setJustSubmitted] = useState(false)
  const [form, setForm] = useState<BookingFormData>({
    startDate: "",
    goalDescription: "",
    injuryDetails: "",
    diseasesDetails: "",
    age: "",
    trainingPerWeek: "",
    weight: "",
    height: "",
    trainingPlace: "",
  })

  const fetchService = useCallback(async () => {
    if (!params?.id) return
    try {
      setLoading(true)
      setError(null)
      // Use cached API for instant data loading
      const srv = await cachedServicesApi.fetchServiceById(params.id as string)
      if (!srv) throw new Error("Service not found")
      setService(srv)
    } catch (e: any) {
      setError(e?.message || "Failed to load service")
      setService(null)
    } finally {
      setLoading(false)
    }
  }, [params?.id])

  useEffect(() => {
    fetchService()
  }, [fetchService])

  // Fetch my training requests to show current status (pending/approved/cancelled)
  useEffect(() => {
    const fetchMyRequests = async () => {
      setIsCheckingStatus(true)
      try {
        let token: string | null = null
        try {
          token = sessionStorage.getItem("token") || localStorage.getItem("token")
        } catch {}
        if (!token) {
          setRequestStatus("none")
          return
        }
        const res = await fetch(API_CONFIG.USER_FUNCTIONS.requests.training.getMyRequests, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          cache: "no-store",
        })
        if (!res.ok) {
          setRequestStatus("none")
          return
        }
        const data = await res.json()
        const list: any[] = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []

        // Determine request status from latest (no per-service scope, no active window check)
        const latest = list
          .slice()
          .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())[0]

        if (!latest) {
          setRequestStatus("none")
        } else {
          const s = (latest.status || "").toString().toLowerCase()
          if (s.includes("approve")) setRequestStatus("approved")
          else if (s.includes("cancel")) setRequestStatus("cancelled")
          else setRequestStatus("pending")
        }
      } catch {
        setRequestStatus("none")
      } finally {
        setIsCheckingStatus(false)
      }
    }
    fetchMyRequests()
  }, [])

  const priceFormatted = useMemo(() => {
    const p = service?.price ?? 0
    const n = typeof p === "number" ? p : Number(p)
    return `${(isNaN(n) ? 0 : n).toFixed(2)} EGP`
  }, [service?.price])

  const handleFormChange = useCallback(
    (key: keyof BookingFormData, value: string) => {
      setForm((prev) => ({ ...prev, [key]: value }))
    },
    []
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!service) return
      // Prevent submitting if an approved request already exists
      if (requestStatus === "approved") {
        setSubmitError("You already have an approved training request. You cannot submit another one.")
        return
      }
      setSubmitError(null)
      // minimal required fields based on backend table
      if (!form.startDate || !form.goalDescription || !form.age || !form.trainingPerWeek || !form.weight || !form.height || !form.trainingPlace) {
        setSubmitError("Please fill all required fields")
        return
      }
      // get token
      let token: string | null = null
      try {
        token = sessionStorage.getItem("token") || localStorage.getItem("token")
      } catch {}
      if (!token) {
        setSubmitError("You must be logged in to book.")
        return
      }
      setIsSubmitting(true)
      try {
        // derive a default end date (30 days after start) if backend requires end_date
        const start = new Date(form.startDate)
        const end = new Date(start.getTime())
        end.setDate(end.getDate() + 30)
        const endDateStr = `${end.getFullYear()}-${String(end.getMonth()+1).padStart(2,"0")}-${String(end.getDate()).padStart(2,"0")}`

        // Minimal snake_case payload to match likely DB columns and avoid unknown column errors
        const payload = {
          start_date: form.startDate,
          end_date: endDateStr,
          injury_details: form.injuryDetails || "",
          goal_description: form.goalDescription,
          age: parseInt(form.age || "0", 10),
          training_per_week: form.trainingPerWeek,
          diseases_details: form.diseasesDetails || "",
          weight: parseFloat(form.weight || "0"),
          height: parseFloat(form.height || "0"),
          training_place: form.trainingPlace,
        }
        console.log("[Booking] payload=", payload)
        const resp = await axios.post(
          API_CONFIG.USER_FUNCTIONS.requests.training.create,
          payload,
          { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
        )
        if (resp.data?.status === "success") {
          setIsBookingOpen(false)
          setForm({ startDate: "", goalDescription: "", injuryDetails: "", diseasesDetails: "", age: "", trainingPerWeek: "", weight: "", height: "", trainingPlace: "" })
          setRequestStatus("pending")
          setJustSubmitted(true)
        } else {
          setSubmitError(resp.data?.message || "Failed to submit booking")
        }
      } catch (err: any) {
        console.error("[Booking] error resp:", err?.response?.data)
        setSubmitError(err?.response?.data?.message || "Failed to submit booking")
      } finally {
        setIsSubmitting(false)
      }
    },
    [service, form, requestStatus]
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-20">
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-gray-700 text-lg font-medium">Loading service details...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-20 flex items-center justify-center">
        <Card className="shadow-2xl max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Service Not Found</h2>
            <p className="text-gray-600 mb-6">{error || "The service you are looking for does not exist or has been removed."}</p>
            <Button onClick={() => router.push("/services")} className="bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Services
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="inline-flex items-center hover:text-foreground">
                <Home className="w-4 h-4 mr-1" /> Home
              </Link>
            </li>
            <li className="flex items-center">
              <ChevronRight className="w-4 h-4 mx-1" />
              <Link href="/services" className="hover:text-foreground">Services</Link>
            </li>
            <li className="flex items-center">
              <ChevronRight className="w-4 h-4 mx-1" />
              <span className="text-foreground font-medium line-clamp-1">{service.title}</span>
            </li>
          </ol>
        </nav>
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.back()} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={getProxyImageUrl(service.image || undefined) || "/placeholder.svg"}
                  alt={service?.title ? `${service.title} service image` : "Service image"}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <div className="space-y-3">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{service.title}</h1>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="secondary" className="text-base px-3 py-1">
                  {priceFormatted}
                </Badge>
                {service.duration && (
                  <span className="inline-flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-1" /> {service.duration}
                  </span>
                )}
                {/* Request status badge */}
                {requestStatus !== "none" && (
                  <Badge className={
                    requestStatus === "approved" ? "bg-green-600" : requestStatus === "cancelled" ? "bg-red-600" : "bg-amber-500"
                  }>
                    {isCheckingStatus ? "Checking status..." : requestStatus === "approved" ? "Approved" : requestStatus === "cancelled" ? "Cancelled" : "Pending"}
                  </Badge>
                )}
              </div>
            </div>

            {/* Success / Pending alerts */}
            {justSubmitted && (
              <Alert className="border-green-200 bg-green-50">
                <AlertCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Your request has been sent successfully and is now pending review.
                </AlertDescription>
              </Alert>
            )}
            {requestStatus === "pending" && !justSubmitted && (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  You have a pending training request. We will notify you once it is approved.
                </AlertDescription>
              </Alert>
            )}

            {/* Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Professional Guidance</p>
                  <p className="text-sm text-muted-foreground">Work with certified coaches to reach your goals safely and effectively.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Flexible Scheduling</p>
                  <p className="text-sm text-muted-foreground">Choose times that fit your routine, mornings to evenings.</p>
                </div>
              </div>
            </div>

            {service.description && (
              <div>
                <h2 className="text-lg font-semibold mb-2">About this service</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{service.description}</p>
              </div>
            )}

            <div className="pt-2">
              <ProtectedAction onAction={() => {
                if (requestStatus === "approved") return; // block opening
                setIsBookingOpen(true)
              }}>
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90"
                  disabled={requestStatus === "pending" || requestStatus === "approved"}
                >
                  {requestStatus === "approved" ? "Approved" : requestStatus === "pending" ? "Request Pending" : "Book this service"}
                </Button>
              </ProtectedAction>
            </div>
          </div>
        </div>
      </div>

      {/* Mini FAQ */}
      <section className="mt-6 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card border rounded-lg p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-4">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible>
            <AccordionItem value="f1">
              <AccordionTrigger>Do I need to bring any equipment?</AccordionTrigger>
              <AccordionContent>We provide the essentials. If you prefer, you can bring your own training gear.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="f2">
              <AccordionTrigger>Can I reschedule my sessions?</AccordionTrigger>
              <AccordionContent>Yes, you can reschedule with advance notice. Availability may vary by coach.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-muted-foreground mb-3">Have questions about this service?</p>
          <Link href="/contact">
            <Button variant="outline">Contact Us</Button>
          </Link>
        </div>
      </section>

      {/* Booking Modal */}
      <Dialog open={isBookingOpen} onOpenChange={(open) => !isSubmitting && setIsBookingOpen(open)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Book: {service?.title}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input id="startDate" type="date" value={form.startDate} onChange={(e) => handleFormChange("startDate", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Training Place *</Label>
                <Select value={form.trainingPlace} onValueChange={(v) => handleFormChange("trainingPlace", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select place" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gym">Gym</SelectItem>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="goalDescription">Goal Description *</Label>
              <Textarea id="goalDescription" rows={3} value={form.goalDescription} onChange={(e) => handleFormChange("goalDescription", e.target.value)} />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                <Input id="age" type="number" value={form.age} onChange={(e) => handleFormChange("age", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg) *</Label>
                <Input id="weight" type="number" step="0.1" value={form.weight} onChange={(e) => handleFormChange("weight", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm) *</Label>
                <Input id="height" type="number" value={form.height} onChange={(e) => handleFormChange("height", e.target.value)} />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trainingPerWeek">Training per week *</Label>
                <Input id="trainingPerWeek" type="text" placeholder="e.g. 2-3" value={form.trainingPerWeek} onChange={(e) => handleFormChange("trainingPerWeek", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="injuryDetails">Injury Details</Label>
                <Textarea id="injuryDetails" rows={2} value={form.injuryDetails} onChange={(e) => handleFormChange("injuryDetails", e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="diseasesDetails">Diseases Details</Label>
              <Textarea id="diseasesDetails" rows={2} value={form.diseasesDetails} onChange={(e) => handleFormChange("diseasesDetails", e.target.value)} />
            </div>

            {submitError && (
              <div className="text-sm text-red-600">{submitError}</div>
            )}

            <div className="flex items-center justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsBookingOpen(false)} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" className="bg-primary" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Booking"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
