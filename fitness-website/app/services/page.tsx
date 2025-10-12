"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Check, Clock, AlertCircle, Loader2, Dumbbell } from "lucide-react"
import { GridSkeleton } from "@/components/common/LoadingSkeletons"
import { Pagination } from "@/components/common"
import type { ClientService } from "@/types"
import { servicesApi } from "@/lib/api/services"

// Lazy load heavy components for better performance
const ServicesHero = dynamic(
  () => import("@/components/client/services/ServicesHero").then(m => m.ServicesHero), 
  { 
    loading: () => <div className="h-96 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 animate-pulse rounded-lg" />
  }
)
const ServicesGrid = dynamic(
  () => import("@/components/client/services/ServicesGrid").then(m => m.ServicesGrid), 
  { 
    loading: () => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-80 bg-gray-100 animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }
)

export default function ServicesPage() {
  const [services, setServices] = useState<ClientService[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(6)

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const list = await servicesApi.fetchPublicServices()
      setServices(list)
    } catch (err: any) {
      setError(err.message || "Failed to load services")
      setServices([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  const retryFetch = useCallback(() => {
    setError(null)
    fetchServices()
  }, [fetchServices])

  // Memoized calculations for better performance
  const hasServices = useMemo(() => !loading && !error && services.length > 0, [loading, error, services.length])
  const paged = useMemo(() => {
    const start = (page - 1) * pageSize
    return services.slice(start, start + pageSize)
  }, [services, page, pageSize])

  const serviceStats = useMemo(() => ({
    totalServices: services?.length || 0,
    currentPage: page,
    totalPages: Math.ceil(services.length / pageSize)
  }), [services, page, pageSize])

  // Show loading state with modern design
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-gray-700 text-lg font-medium">Loading services...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <ServicesHero />

      {/* Plans */}
      <section
        id="plans"
        className="py-10"
        aria-labelledby="plans-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2
              id="plans-heading"
              className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent"
            >
              Plans & Pricing
            </h2>
            <p className="text-gray-600 text-lg">
              Simple, transparent pricing. Cancel anytime.
            </p>
          </div>
        </div>
      </section>
      {/* Services Grid */}
      <section
        id="services"
        className="pb-10 bg-background"
        aria-labelledby="services-list"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="services-list" className="sr-only">
            Available Services
          </h2>
          {/* Loading State */}
          {loading && <GridSkeleton count={6} />}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-12">
              <Card className="max-w-md mx-auto shadow-2xl">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load Services</h2>
                  <p className="text-gray-600 mb-6">{error}</p>
                  <Button onClick={retryFetch} className="px-6 bg-blue-600 hover:bg-blue-700">
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Services Grid - Dynamic Data */}
          {hasServices && <ServicesGrid services={paged} />}
          {hasServices && (
            <Pagination
              total={services.length}
              page={page}
              pageSize={pageSize}
              onPageChange={(p) => setPage(p)}
            />
          )}

          {/* Empty State */}
          {!loading && !error && services.length === 0 && (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                {/* Simple icon removed to reduce bundle */}
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No Services Available
                </h3>
                <p className="text-muted-foreground mb-4">
                  We're currently updating our services. Please check back
                  later.
                </p>
                <Button onClick={retryFetch}>Refresh</Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section
        id="why-us"
        className="py-16 bg-white"
        aria-labelledby="why-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="why-heading" className="sr-only">
            Why Choose Us
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border bg-card shadow-sm">
              <div className="text-primary mb-3">
                <Check className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">
                Certified Coaches
              </h3>
              <p className="text-muted-foreground">
                Train with experienced, certified professionals who tailor
                programs to your goals and fitness level.
              </p>
            </div>
            <div className="p-6 rounded-xl border bg-card shadow-sm">
              <div className="text-primary mb-3">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">
                Flexible Scheduling
              </h3>
              <p className="text-muted-foreground">
                Choose times that work for you with morning, afternoon, and
                evening availability.
              </p>
            </div>
            <div className="p-6 rounded-xl border bg-card shadow-sm">
              <div className="text-primary mb-3">
                <Dumbbell className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">
                Modern Facilities
              </h3>
              <p className="text-muted-foreground">
                Access clean, well-equipped spaces designed to support strength,
                cardio, and recovery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section
        id="faqs"
        className="py-20 bg-background"
        aria-labelledby="faqs-heading"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2
              id="faqs-heading"
              className="text-3xl font-bold text-foreground"
            >
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground">
              Everything you need to know about our services and memberships.
            </p>
          </div>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How do I book a service?</AccordionTrigger>
              <AccordionContent>
                Visit any service card and click “View Details & Book”. You’ll
                be asked to provide a few details and select a start date.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>
                Can I book while I have an active subscription?
              </AccordionTrigger>
              <AccordionContent>
                To avoid overlapping subscriptions, new bookings are disabled
                until your current subscription period ends.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>
                What payment methods do you accept?
              </AccordionTrigger>
              <AccordionContent>
                We support major cards and local payment options at the front
                desk. Online payments are coming soon.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Call To Action */}
      <section
        className="py-16 bg-gradient-to-br from-primary/10 to-secondary/10"
        aria-labelledby="cta-heading"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2
            id="cta-heading"
            className="text-3xl font-bold text-foreground mb-3"
          >
            Ready to start your journey?
          </h2>
          <p className="text-muted-foreground mb-6">
            Choose a plan that fits you or explore our services to find the
            perfect match.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="#plans">
              <Button className="bg-primary hover:bg-primary/90">
                See Plans
              </Button>
            </Link>
            <Link href="/services">
              <Button variant="outline">Browse Services</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
