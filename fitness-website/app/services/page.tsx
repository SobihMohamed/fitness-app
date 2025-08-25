
// "use client"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Check, Dumbbell, Users, Clock, Target, Heart, Zap, Calendar } from "lucide-react"
// import { ProtectedAction } from "@/components/auth/Protected-Route"
// import { useState } from "react"
// import { ServiceBookingModal } from "../forms/service-booking-modal"

// const services = [
//   {
//     icon: Dumbbell,
//     title: "Personal Training",
//     description: "One-on-one training sessions with certified personal trainers",
//     features: ["Customized workout plans", "Progress tracking", "Nutrition guidance", "Flexible scheduling"],
//     price: "From $80/session",
//     duration: "60 minutes",
//     popular: false,
//   },
//   {
//     icon: Users,
//     title: "Group Classes",
//     description: "High-energy group fitness classes for all fitness levels",
//     features: ["Variety of class types", "Motivating environment", "Expert instructors", "All equipment provided"],
//     price: "From $25/class",
//     duration: "45-60 minutes",
//     popular: true,
//   },
//   {
//     icon: Target,
//     title: "Nutrition Coaching",
//     description: "Personalized nutrition plans and dietary guidance",
//     features: ["Custom meal plans", "Supplement advice", "Regular check-ins", "Recipe suggestions"],
//     price: "From $120/month",
//     duration: "Ongoing support",
//     popular: false,
//   },
//   {
//     icon: Heart,
//     title: "Wellness Programs",
//     description: "Comprehensive wellness programs for mind and body",
//     features: ["Stress management", "Sleep optimization", "Mental health support", "Lifestyle coaching"],
//     price: "From $150/month",
//     duration: "12-week programs",
//     popular: false,
//   },
//   {
//     icon: Zap,
//     title: "HIIT Training",
//     description: "High-intensity interval training for maximum results",
//     features: ["Fat burning workouts", "Improved endurance", "Time-efficient", "Scalable intensity"],
//     price: "From $35/class",
//     duration: "30-45 minutes",
//     popular: false,
//   },
//   {
//     icon: Clock,
//     title: "24/7 Gym Access",
//     description: "Round-the-clock access to our fully equipped gym",
//     features: ["State-of-the-art equipment", "Cardio and strength zones", "Locker rooms", "Security monitored"],
//     price: "From $49/month",
//     duration: "Unlimited access",
//     popular: false,
//   },
// ]

// const packages = [
//   {
//     name: "Starter",
//     price: "$49",
//     period: "/month",
//     description: "Perfect for beginners starting their fitness journey",
//     features: [
//       "Gym access during business hours",
//       "Basic equipment usage",
//       "Locker room access",
//       "Monthly fitness assessment",
//       "Mobile app access",
//     ],
//     popular: false,
//     color: "border-gray-200",
//   },
//   {
//     name: "Pro",
//     price: "$89",
//     period: "/month",
//     description: "Ideal for serious fitness enthusiasts",
//     features: [
//       "24/7 gym access",
//       "All group classes included",
//       "Personal trainer consultation",
//       "Nutrition guidance",
//       "Guest passes (2/month)",
//       "Premium app features",
//     ],
//     popular: true,
//     color: "border-primary",
//   },
//   {
//     name: "Elite",
//     price: "$149",
//     period: "/month",
//     description: "Complete fitness solution with premium benefits",
//     features: [
//       "Everything in Pro",
//       "Unlimited personal training",
//       "Custom meal planning",
//       "Recovery services",
//       "Priority booking",
//       "Unlimited guest passes",
//       "Wellness coaching",
//     ],
//     popular: false,
//     color: "border-secondary",
//   },
// ]

// const classSchedule = [
//   { time: "6:00 AM", class: "Morning HIIT", instructor: "Sarah J.", duration: "45 min" },
//   { time: "7:30 AM", class: "Yoga Flow", instructor: "David W.", duration: "60 min" },
//   { time: "12:00 PM", class: "Lunch Break Cardio", instructor: "Mike C.", duration: "30 min" },
//   { time: "5:30 PM", class: "Strength Training", instructor: "Emily D.", duration: "60 min" },
//   { time: "7:00 PM", class: "Evening Yoga", instructor: "David W.", duration: "60 min" },
// ]

// export default function ServicesPage() {
//   const [bookingModal, setBookingModal] = useState<{
//     isOpen: boolean
//     serviceName: string
//     servicePrice: string
//   }>({
//     isOpen: false,
//     serviceName: "",
//     servicePrice: "",
//   })

//   const handleServiceBooking = (serviceName: string, servicePrice: string) => {
//     console.log("Opening booking modal for:", serviceName, servicePrice)
//     setBookingModal({
//       isOpen: true,
//       serviceName,
//       servicePrice,
//     })
//   }

//   const handlePackageSelection = (packageName: string, packagePrice: string) => {
//     console.log("Opening booking modal for package:", packageName, packagePrice)
//     setBookingModal({
//       isOpen: true,
//       serviceName: packageName,
//       servicePrice: packagePrice,
//     })
//   }

//   const closeBookingModal = () => {
//     console.log("Closing booking modal")
//     setBookingModal({
//       isOpen: false,
//       serviceName: "",
//       servicePrice: "",
//     })
//   }

//   console.log("Current booking modal state:", bookingModal)

//   return (
//     <div className="min-h-screen bg-background">
//       {/* Hero Section */}
//       <section className="py-20 lg:py-32 bg-white">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
//           <Badge className="bg-secondary text-secondary-foreground mb-4">Our Services</Badge>
//           <h1 className="text-4xl lg:text-5xl font-bold mb-6 text-foreground">
//             Comprehensive Fitness
//             <span className="text-primary"> Solutions</span>
//           </h1>
//           <p className="text-xl max-w-3xl mx-auto text-muted">
//             From personal training to group classes, we offer a complete range of fitness services designed to help you
//             achieve your goals and maintain a healthy lifestyle.
//           </p>
//         </div>
//       </section>

//       {/* Services Grid */}
//       <section className="py-20 bg-background">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
//             {services.map((service, index) => (
//               <Card
//                 key={index}
//                 className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${service.popular ? "ring-2 ring-primary" : ""}`}
//               >
//                 <CardHeader className="p-0">
//                   <div className="relative overflow-hidden rounded-t-lg">
//                     <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
//                       <service.icon className="h-16 w-16 text-primary" />
//                     </div>
//                     {service.popular && (
//                       <div className="absolute top-4 right-4">
//                         <Badge className="bg-secondary text-secondary-foreground">Most Popular</Badge>
//                       </div>
//                     )}
//                   </div>
//                 </CardHeader>
//                 <CardContent className="p-6">
//                   <CardTitle className="text-xl mb-2 text-foreground">{service.title}</CardTitle>
//                   <CardDescription className="mb-4 text-muted">{service.description}</CardDescription>
//                   <div className="flex items-center gap-4 mb-4 text-sm text-muted">
//                     <div className="flex items-center">
//                       <Clock className="h-4 w-4 mr-1" />
//                       {service.duration}
//                     </div>
//                   </div>
//                   <ul className="space-y-2 mb-6">
//                     {service.features.map((feature, featureIndex) => (
//                       <li key={featureIndex} className="flex items-center">
//                         <Check className="h-4 w-4 mr-2 text-secondary" />
//                         <span className="text-sm text-muted">{feature}</span>
//                       </li>
//                     ))}
//                   </ul>
//                   <div className="flex items-center justify-between">
//                     <span className="text-lg font-bold text-primary">{service.price}</span>
//                     <ProtectedAction onAction={() => handleServiceBooking(service.title, service.price)}>
//                       <Button className="bg-primary hover:bg-primary/90">Book Now</Button>
//                     </ProtectedAction>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Class Schedule */}
//       <section className="py-20 bg-white">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-16">
//             <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-foreground">Today's Class Schedule</h2>
//             <p className="text-xl max-w-2xl mx-auto text-muted">Join our expert-led group classes throughout the day</p>
//           </div>

//           <Card className="border-0 shadow-lg max-w-4xl mx-auto">
//             <CardContent className="p-8">
//               <div className="space-y-4">
//                 {classSchedule.map((item, index) => (
//                   <div
//                     key={index}
//                     className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
//                   >
//                     <div className="flex items-center space-x-4">
//                       <div className="flex items-center space-x-2">
//                         <Calendar className="h-5 w-5 text-primary" />
//                         <span className="font-semibold text-foreground">{item.time}</span>
//                       </div>
//                       <div>
//                         <h4 className="font-medium text-foreground">{item.class}</h4>
//                         <p className="text-sm text-muted">with {item.instructor}</p>
//                       </div>
//                     </div>
//                     <div className="text-right">
//                       <Badge variant="outline">{item.duration}</Badge>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//               <div className="mt-8 text-center">
//                 <Button className="bg-primary hover:bg-primary/90">View Full Schedule</Button>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </section>

//       {/* Membership Packages */}
//       <section className="py-20 bg-background">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-16">
//             <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-foreground">Membership Packages</h2>
//             <p className="text-xl max-w-2xl mx-auto text-muted">
//               Choose the perfect plan that fits your fitness goals and lifestyle
//             </p>
//           </div>

//           <div className="grid md:grid-cols-3 gap-8">
//             {packages.map((pkg, index) => (
//               <Card
//                 key={index}
//                 className={`relative border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${pkg.popular ? "ring-2 ring-primary scale-105" : ""}`}
//               >
//                 {pkg.popular && (
//                   <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
//                     <Badge className="bg-secondary text-secondary-foreground">Most Popular</Badge>
//                   </div>
//                 )}
//                 <CardContent className="p-8">
//                   <div className="text-center mb-8">
//                     <h3 className="text-2xl font-bold mb-2 text-foreground">{pkg.name}</h3>
//                     <div className="mb-4">
//                       <span className="text-4xl font-bold text-primary">{pkg.price}</span>
//                       <span className="text-muted">{pkg.period}</span>
//                     </div>
//                     <p className="text-muted">{pkg.description}</p>
//                   </div>

//                   <ul className="space-y-3 mb-8">
//                     {pkg.features.map((feature, featureIndex) => (
//                       <li key={featureIndex} className="flex items-center">
//                         <Check className="h-4 w-4 mr-3 text-secondary" />
//                         <span className="text-muted">{feature}</span>
//                       </li>
//                     ))}
//                   </ul>

//                   <ProtectedAction
//                     onAction={() => handlePackageSelection(`${pkg.name} Membership`, `${pkg.price}${pkg.period}`)}
//                   >
//                     <Button
//                       className={`w-full ${pkg.popular ? "bg-primary hover:bg-primary/90" : "bg-secondary hover:bg-secondary/90"}`}
//                     >
//                       Choose Plan
//                     </Button>
//                   </ProtectedAction>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section className="py-20 bg-gradient-to-r from-primary to-secondary">
//         <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
//           <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">Ready to Get Started?</h2>
//           <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
//             Join thousands of members who have transformed their lives with our comprehensive fitness services.
//           </p>
//           <div className="flex flex-col sm:flex-row gap-4 justify-center">
//             <Button size="lg" className="bg-white text-foreground hover:bg-gray-100">
//               Start Free Trial
//             </Button>
//             <Button
//               size="lg"
//               variant="outline"
//               className="text-white border-white hover:bg-white hover:text-foreground bg-transparent"
//             >
//               Schedule Consultation
//             </Button>
//           </div>
//         </div>
//       </section>

//       {/* Service Booking Modal */}
//       <ServiceBookingModal
//         isOpen={bookingModal.isOpen}
//         onClose={closeBookingModal}
//         serviceName={bookingModal.serviceName}
//         servicePrice={bookingModal.servicePrice}
//       />
//     </div>
//   )
// }
"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Clock } from "lucide-react"
import { ProtectedAction } from "@/components/auth/Protected-Route"
import { ServiceBookingModal } from "../forms/service-booking-modal"
import {API_CONFIG} from "@/config/api"   // 👈 adjust path if needed

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
}

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
        const res = await fetch(USER_SERVICES_API.getAll)
        if (!res.ok) throw new Error("Failed to fetch services")
        const data = await res.json()
        console.log("Fetched services:", data) // 👈 check what backend returns

        if (Array.isArray(data)) {
          setServices(data)
        } else {
          console.error("Expected array but got:", data)
          setServices([])
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchServices()
  }, [])

  const handleServiceBooking = (serviceName: string, servicePrice: string) => {
    setBookingModal({
      isOpen: true,
      serviceName,
      servicePrice,
    })
  }

  const closeBookingModal = () => {
    setBookingModal({
      isOpen: false,
      serviceName: "",
      servicePrice: "",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-secondary text-secondary-foreground mb-4">Our Services</Badge>
          <h1 className="text-4xl lg:text-5xl font-bold mb-6 text-foreground">
            Comprehensive Fitness <span className="text-primary">Solutions</span>
          </h1>
          <p className="text-xl max-w-3xl mx-auto text-muted">
            From personal training to group classes, we offer a complete range of fitness services designed to help you
            achieve your goals and maintain a healthy lifestyle.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading && <p>Loading services...</p>}
          {error && <p className="text-red-500">{error}</p>}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => {
              // convert features string into array if needed
              const featureList = service.features
                ? service.features.split(",").map((f) => f.trim())
                : []

              return (
                <Card
                  key={service.id}
                  className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
                    service.popular ? "ring-2 ring-primary" : ""
                  }`}
                >
                  <CardHeader className="p-0">
                    <div className="relative overflow-hidden rounded-t-lg">
                      <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                        <span className="text-4xl">💪</span>
                      </div>
                      {service.popular ? (
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-secondary text-secondary-foreground">Most Popular</Badge>
                        </div>
                      ) : null}
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <CardTitle className="text-xl mb-2 text-foreground">{service.title}</CardTitle>
                    <CardDescription className="mb-4 text-muted">{service.description}</CardDescription>

                    <div className="flex items-center gap-4 mb-4 text-sm text-muted">
                      <Clock className="h-4 w-4 mr-1" />
                      {service.duration}
                    </div>

                    <ul className="space-y-2 mb-6">
                      {featureList.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <Check className="h-4 w-4 mr-2 text-secondary" />
                          <span className="text-sm text-muted">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">{service.price}</span>
                      <ProtectedAction onAction={() => handleServiceBooking(service.title, service.price)}>
                        <Button className="bg-primary hover:bg-primary/90">Book Now</Button>
                      </ProtectedAction>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
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
