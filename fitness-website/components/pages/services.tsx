"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Dumbbell, Users, Clock, Target, Heart, Zap } from "lucide-react"

const services = [
  {
    icon: Dumbbell,
    title: "Personal Training",
    description: "One-on-one training sessions with certified personal trainers",
    features: ["Customized workout plans", "Progress tracking", "Nutrition guidance", "Flexible scheduling"],
    price: "From $80/session",
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    icon: Users,
    title: "Group Classes",
    description: "High-energy group fitness classes for all fitness levels",
    features: ["Variety of class types", "Motivating environment", "Expert instructors", "All equipment provided"],
    price: "From $25/class",
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    icon: Target,
    title: "Nutrition Coaching",
    description: "Personalized nutrition plans and dietary guidance",
    features: ["Custom meal plans", "Supplement advice", "Regular check-ins", "Recipe suggestions"],
    price: "From $120/month",
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    icon: Heart,
    title: "Wellness Programs",
    description: "Comprehensive wellness programs for mind and body",
    features: ["Stress management", "Sleep optimization", "Mental health support", "Lifestyle coaching"],
    price: "From $150/month",
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    icon: Zap,
    title: "HIIT Training",
    description: "High-intensity interval training for maximum results",
    features: ["Fat burning workouts", "Improved endurance", "Time-efficient", "Scalable intensity"],
    price: "From $35/class",
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    icon: Clock,
    title: "24/7 Gym Access",
    description: "Round-the-clock access to our fully equipped gym",
    features: ["State-of-the-art equipment", "Cardio and strength zones", "Locker rooms", "Security monitored"],
    price: "From $49/month",
    image: "/placeholder.svg?height=300&width=400",
  },
]

const packages = [
  {
    name: "Starter",
    price: "$49",
    period: "/month",
    description: "Perfect for beginners starting their fitness journey",
    features: [
      "Gym access during business hours",
      "Basic equipment usage",
      "Locker room access",
      "Monthly fitness assessment",
    ],
    popular: false,
  },
  {
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
    ],
    popular: true,
  },
  {
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
    ],
    popular: false,
  },
]

export function ServicesPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8F9FA" }}>
      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge style={{ backgroundColor: "#32CD32", color: "#FFFFFF" }} className="mb-4">
            Our Services
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold mb-6" style={{ color: "#212529" }}>
            Comprehensive Fitness
            <span style={{ color: "#007BFF" }}> Solutions</span>
          </h1>
          <p className="text-xl max-w-3xl mx-auto" style={{ color: "#6C757D" }}>
            From personal training to group classes, we offer a complete range of fitness services designed to help you
            achieve your goals and maintain a healthy lifestyle.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20" style={{ backgroundColor: "#F8F9FA" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <Image
                      src={service.image || "/placeholder.svg"}
                      alt={service.title}
                      width={400}
                      height={300}
                      className="w-full h-48 object-cover"
                      loading="lazy"
                    />
                    <div className="absolute top-4 left-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: "#007BFF" }}
                      >
                        <service.icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <CardTitle className="text-xl mb-2" style={{ color: "#212529" }}>
                    {service.title}
                  </CardTitle>
                  <CardDescription className="mb-4" style={{ color: "#6C757D" }}>
                    {service.description}
                  </CardDescription>
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <Check className="h-4 w-4 mr-2" style={{ color: "#32CD32" }} />
                        <span className="text-sm" style={{ color: "#6C757D" }}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold" style={{ color: "#007BFF" }}>
                      {service.price}
                    </span>
                    <Button style={{ backgroundColor: "#007BFF" }} className="hover:opacity-90">
                      Learn More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Membership Packages */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4" style={{ color: "#212529" }}>
              Membership Packages
            </h2>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: "#6C757D" }}>
              Choose the perfect plan that fits your fitness goals and lifestyle
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <Card
                key={index}
                className={`relative bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
                  pkg.popular ? "ring-2" : ""
                }`}
                style={pkg.popular ? { borderColor: "#007BFF" } : {}}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge style={{ backgroundColor: "#32CD32", color: "#FFFFFF" }}>Most Popular</Badge>
                  </div>
                )}
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold mb-2" style={{ color: "#212529" }}>
                      {pkg.name}
                    </h3>
                    <div className="mb-4">
                      <span className="text-4xl font-bold" style={{ color: "#007BFF" }}>
                        {pkg.price}
                      </span>
                      <span style={{ color: "#6C757D" }}>{pkg.period}</span>
                    </div>
                    <p style={{ color: "#6C757D" }}>{pkg.description}</p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {pkg.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <Check className="h-4 w-4 mr-3" style={{ color: "#32CD32" }} />
                        <span style={{ color: "#6C757D" }}>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    style={{
                      backgroundColor: pkg.popular ? "#007BFF" : "#32CD32",
                    }}
                  >
                    Choose Plan
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
