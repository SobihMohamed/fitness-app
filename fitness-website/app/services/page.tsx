"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Check, Clock, Calendar, AlertCircle, Loader2, Dumbbell } from "lucide-react"
import { API_CONFIG } from "@/config/api"
import { ProtectedAction } from "@/components/auth/Protected-Route"
import { ServiceBookingModal } from "../forms/service-booking-modal"

const { USER_SERVICES_API } = API_CONFIG

// Define type based on backend
interface Service {
  id: number
  title: string
  description: string
  price: string
  duration: string
  popular?: number | boolean
  features?: string // stored as comma-separated string in DB
  image?: string
  category?: string
}

// Fallback packages (these might also come from API later)
const packages = [
  {
    id: "starter",
    name: "Starter",
    price: "$49",
    period: "/month",
    description: "Perfect for beginners starting their fitness journey",
    features: [
      "Gym access during business hours",
      "Basic equipment usage",
      "Locker room access",
      "Monthly fitness assessment",
      "Mobile app access",
    ],
    popular: false,
    color: "border-gray-200",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$89",
    period: "/month",
    description: "Ideal for serious fitness enthusiasts",
    features: [
      "24/7 gym access",
      "All group classes included",
      "Personal trainer consultation",
      "Nutrition guidance",
      "Guest passes (2/month)",
      "Premium app features",
    ],
    popular: true,
    color: "border-primary",
  },
  {
    id: "elite",
    name: "Elite",
    price: "$149",
    period: "/month",
    description: "Complete fitness solution with premium benefits",
    features: [
      "Everything in Pro",
      "Unlimited personal training",
      "Custom meal planning",
      "Recovery services",
      "Priority booking",
      "Unlimited guest passes",
      "Wellness coaching",
    ],
    popular: false,
    color: "border-secondary",
  },
]

// Fallback class schedule (this might also come from API later)
const classSchedule = [
  { id: "1", time: "6:00 AM", class: "Morning HIIT", instructor: "Sarah J.", duration: "45 min" },
  { id: "2", time: "7:30 AM", class: "Yoga Flow", instructor: "David W.", duration: "60 min" },
  { id: "3", time: "12:00 PM", class: "Lunch Break Cardio", instructor: "Mike C.", duration: "30 min" },
  { id: "4", time: "5:30 PM", class: "Strength Training", instructor: "Emily D.", duration: "60 min" },
  { id: "5", time: "7:00 PM", class: "Evening Yoga", instructor: "David W.", duration: "60 min" },
]

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [bookingModal, setBookingModal] = useState<{
    isOpen: boolean
    serviceName: string
    servicePrice: string
  }>({
    isOpen: false,
    serviceName: "",
    servicePrice: "",
  })

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log("Fetching services from:", USER_SERVICES_API.getAll)

        const res = await fetch(USER_SERVICES_API.getAll)
        if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch services`)

        const data = await res.json()
        console.log("Fetched services response:", data)

        // Handle different API response formats
        let servicesData: Service[] = []

        if (Array.isArray(data)) {
          servicesData = data
        } else if (data && data.data && Array.isArray(data.data)) {
          servicesData = data.data
        } else if (data && data.services && Array.isArray(data.services)) {
          servicesData = data.services
        } else if (data && typeof data === "object") {
          // If it's an object, try to find an array property
          const possibleArrays = Object.values(data).filter(Array.isArray)
          if (possibleArrays.length > 0) {
            servicesData = possibleArrays[0] as Service[]
          }
        }

        console.log("Processed services data:", servicesData)
        setServices(servicesData || [])
      } catch (err: any) {
        console.error("Error fetching services:", err)
        setError(err.message || "Failed to load services")
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  const handleServiceBooking = (serviceName: string, servicePrice: string) => {
    console.log("Opening booking modal for:", serviceName, servicePrice)
    setBookingModal({
      isOpen: true,
      serviceName,
      servicePrice,
    })
  }

  const handlePackageSelection = (packageName: string, packagePrice: string) => {
    console.log("Opening booking modal for package:", packageName, packagePrice)
    setBookingModal({
      isOpen: true,
      serviceName: packageName,
      servicePrice: packagePrice,
    })
  }

  const closeBookingModal = () => {
    console.log("Closing booking modal")
    setBookingModal({
      isOpen: false,
      serviceName: "",
      servicePrice: "",
    })
  }

  const retryFetch = () => {
    setError(null)
    const fetchServices = async () => {
      try {
        setLoading(true)
        const res = await fetch(USER_SERVICES_API.getAll)
        if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch services`)

        const data = await res.json()
        let servicesData: Service[] = []

        if (Array.isArray(data)) {
          servicesData = data
        } else if (data && data.data && Array.isArray(data.data)) {
          servicesData = data.data
        } else if (data && data.services && Array.isArray(data.services)) {
          servicesData = data.services
        }

        setServices(servicesData || [])
      } catch (err: any) {
        setError(err.message || "Failed to load services")
      } finally {
        setLoading(false)
      }
    }
    fetchServices()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-secondary text-secondary-foreground mb-4">Our Services</Badge>
          <h1 className="text-4xl lg:text-5xl font-bold mb-6 text-foreground">
            Comprehensive Fitness
            <span className="text-primary"> Solutions</span>
          </h1>
          <p className="text-xl max-w-3xl mx-auto text-muted-foreground">
            From personal training to group classes, we offer a complete range of fitness services designed to help you
            achieve your goals and maintain a healthy lifestyle.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Loading State */}
          {loading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="border-0 shadow-lg">
                  <CardHeader className="p-0">
                    <Skeleton className="w-full h-48 rounded-t-lg" />
                  </CardHeader>
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <div className="space-y-2 mb-6">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-10 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-12">
              <Alert className="max-w-md mx-auto">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">Failed to load services</p>
                    <p className="text-sm">{error}</p>
                    <Button onClick={retryFetch} size="sm" className="mt-2">
                      <Loader2 className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Services Grid - Dynamic Data */}
          {!loading && !error && services.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => {
                // Convert features string into array if needed
                const featureList = service.features
                  ? service.features
                      .split(",")
                      .map((f) => f.trim())
                      .filter(Boolean)
                  : []

                // Check if service is popular (handle both number and boolean)
                const isPopular = service.popular === true || service.popular === 1

                return (
                  <Card
                    key={service.id}
                    className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
                      isPopular ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    <CardHeader className="p-0">
                      <div className="relative overflow-hidden rounded-t-lg">
                        {service.image ? (
                          <img
                            src={service.image || "/placeholder.svg"}
                            alt={service.title}
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                            <Dumbbell className="h-16 w-16 text-primary" />
                          </div>
                        )}
                        {isPopular && (
                          <div className="absolute top-4 right-4">
                            <Badge className="bg-secondary text-secondary-foreground">Most Popular</Badge>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <CardTitle className="text-xl mb-2 text-foreground">{service.title}</CardTitle>
                      <CardDescription className="mb-4 text-muted-foreground">{service.description}</CardDescription>

                      <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {service.duration}
                        </div>
                      </div>

                      {featureList.length > 0 && (
                        <ul className="space-y-2 mb-6">
                          {featureList.map((feature, index) => (
                            <li key={index} className="flex items-center">
                              <Check className="h-4 w-4 mr-2 text-secondary" />
                              <span className="text-sm text-muted-foreground">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary">{service.price} EGP</span>
                        <ProtectedAction onAction={() => handleServiceBooking(service.title, service.price)}>
                          <Button className="bg-primary hover:bg-primary/90">Book Now</Button>
                        </ProtectedAction>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && services.length === 0 && (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <Dumbbell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Services Available</h3>
                <p className="text-muted-foreground mb-4">
                  We're currently updating our services. Please check back later.
                </p>
                <Button onClick={retryFetch}>Refresh</Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Class Schedule */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-foreground">Today's Class Schedule</h2>
            <p className="text-xl max-w-2xl mx-auto text-muted-foreground">
              Join our expert-led group classes throughout the day
            </p>
          </div>

          <Card className="border-0 shadow-lg max-w-4xl mx-auto">
            <CardContent className="p-8">
              <div className="space-y-4">
                {classSchedule.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        <span className="font-semibold text-foreground">{item.time}</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{item.class}</h4>
                        <p className="text-sm text-muted-foreground">with {item.instructor}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{item.duration}</Badge>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 text-center">
                <Button className="bg-primary hover:bg-primary/90">View Full Schedule</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Membership Packages */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-foreground">Membership Packages</h2>
            <p className="text-xl max-w-2xl mx-auto text-muted-foreground">
              Choose the perfect plan that fits your fitness goals and lifestyle
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <Card
                key={pkg.id || index}
                className={`relative border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
                  pkg.popular ? "ring-2 ring-primary scale-105" : ""
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-secondary text-secondary-foreground">Most Popular</Badge>
                  </div>
                )}
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold mb-2 text-foreground">{pkg.name}</h3>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-primary">{pkg.price} EGP</span>
                      <span className="text-muted-foreground">{pkg.period}</span>
                    </div>
                    <p className="text-muted-foreground">{pkg.description}</p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {pkg.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <Check className="h-4 w-4 mr-3 text-secondary" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <ProtectedAction
                    onAction={() => handlePackageSelection(`${pkg.name} Membership`, `${pkg.price}${pkg.period}`)}
                  >
                    <Button
                      className={`w-full ${
                        pkg.popular ? "bg-primary hover:bg-primary/90" : "bg-secondary hover:bg-secondary/90"
                      }`}
                    >
                      Choose Plan
                    </Button>
                  </ProtectedAction>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of members who have transformed their lives with our comprehensive fitness services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-foreground hover:bg-gray-100">
              Start Free Trial
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-foreground bg-transparent"
            >
              Schedule Consultation
            </Button>
          </div>
        </div>
      </section>

      {/* Service Booking Modal */}
      <ServiceBookingModal
        isOpen={bookingModal.isOpen}
        onClose={closeBookingModal}
        serviceName={bookingModal.serviceName}
        servicePrice={bookingModal.servicePrice}
      />
    </div>
  )
}
