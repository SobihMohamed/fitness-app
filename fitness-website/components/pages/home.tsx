"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Star, Users, Award, TrendingUp, ArrowRight, Heart, ShoppingCart, BookOpen, Settings } from "lucide-react"
import { ProtectedAction } from "../auth/Protected-Route"
import { useCart } from "@/contexts/cart-context"

// Sample data for featured products and courses
// In a real application, this data would come from an API or database
const featuredProducts = [
  {
    id: 1,
    name: "Premium Whey Protein",
    price: 49.99,
    image: "/images/whey-protein.jpg",
    rating: 4.8,
    reviews: 124,
  },
  {
    id: 2,
    name: "Resistance Bands Set",
    price: 29.99,
    image: "/images/resistance-bands-gym.jpg",
    rating: 4.9,
    reviews: 89,
  },
  {
    id: 3,
    name: "Smart Fitness Tracker",
    price: 199.99,
    image: "/images/smart-watch.jpg",
    rating: 4.7,
    reviews: 256,
  },
]

// Sample data for featured courses
// In a real application, this data would come from an API or database
const featuredCourses = [
  {
    id: 1,
    title: "Complete Strength Training",
    instructor: "Mike Johnson",
    students: 1250,
    rating: 4.9,
    price: 89,
    image: "/images/strength-masterclass.jpg",
    category: "Strength Training",
  },
  {
    id: 2,
    title: "Advanced HIIT Workouts",
    instructor: "Sarah Davis",
    students: 890,
    rating: 4.8,
    price: 79,
    image: "/images/hiit-advanced.jpg",
    category: "Cardio",
  },
  {
    id: 3,
    title: "Yoga for Flexibility",
    instructor: "Emma Wilson",
    students: 2100,
    rating: 4.9,
    price: 69,
    image: "/images/yoga-mindfulness.jpg",
    category: "Yoga",
  },
]

// Statistics data for the stats section
// In a real application, this data would come from an API or database
const stats = [
  { icon: Users, label: "Active Members", value: "50K+" },
  { icon: Award, label: "Certified Trainers", value: "200+" },
  { icon: TrendingUp, label: "Success Stories", value: "10K+" },
  { icon: Star, label: "Average Rating", value: "4.9" },
]

// Features data for the features section
// In a real application, this data would come from an API or database
const features = [
  {
    icon: ShoppingCart,
    title: "E-Commerce Store",
    description: "Premium fitness products, supplements, and equipment with secure checkout.",
    href: "/products",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    icon: BookOpen,
    title: "Online Courses",
    description: "Expert-led fitness courses and training programs for all levels.",
    href: "/courses",
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    icon: Heart,
    title: "Wellness Blog",
    description: "Latest fitness tips, nutrition advice, and success stories.",
    href: "/blog",
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  {
    icon: Settings,
    title: "Admin Dashboard",
    description: "Complete management system for products, users, and content.",
    href: "/admin/login",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
]

export function HomePage() {
  const [isVisible, setIsVisible] = useState(false)
    useEffect(() => {
      setIsVisible(true)
    const token = sessionStorage.getItem("token");
    const user = sessionStorage.getItem("user");
    
    if (token && user) {
      console.log("User logged in:", JSON.parse(user));
    } else {
      console.log("No user logged in");
    }
  }, [])


  // Function to handle course enrollment
  // This is a placeholder function. In a real application, you would integrate this with your payment system.
  // It could redirect to a payment page or open a payment modal.
   const handleCourseEnrollment = (course: any) => {
    alert(`Enrolling in "${course.title}" for $${course.price}... (This would integrate with your payment system)`)
  }

  // Function to handle adding a product to the cart
  // This is a placeholder function. In a real application, you would integrate this with your cart system.
  // It could add the product to the cart context or redirect to a cart page.
   const handleHomeAddToCart = (course: any) => {
    alert(`Enrolling in "${course.title}" for $${course.price}... (This would integrate with your payment system)`)
  }


  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8F9FA" }}>
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div
              className={`space-y-8 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
            >
              <div className="space-y-4">
                <Badge style={{ backgroundColor: "#32CD32", color: "#FFFFFF" }}>#1 Fitness Platform</Badge>
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight" style={{ color: "#212529" }}>
                  Transform Your
                  <span style={{ color: "#007BFF" }}> Body</span>,<span style={{ color: "#32CD32" }}> Mind</span> & Life
                </h1>
                <p className="text-xl max-w-lg" style={{ color: "#6C757D" }}>
                  Join thousands of fitness enthusiasts on their journey to a healthier, stronger, and more confident
                  version of themselves.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="text-lg px-8" style={{ backgroundColor: "#007BFF" }}>
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent">
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </div>

              <div className="flex items-center space-x-8 pt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: "#007BFF" }}>
                    50K+
                  </div>
                  <div className="text-sm" style={{ color: "#6C757D" }}>
                    Happy Members
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: "#32CD32" }}>
                    200+
                  </div>
                  <div className="text-sm" style={{ color: "#6C757D" }}>
                    Expert Trainers
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: "#007BFF" }}>
                    4.9★
                  </div>
                  <div className="text-sm" style={{ color: "#6C757D" }}>
                    User Rating
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`relative transition-all duration-1000 delay-300 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}`}
            >
              <div className="relative">
                <Image
                  src="/images/home-hero-fitness.jpg"
                  alt="Fitness Hero"
                  width={500}
                  height={600}
                  className="rounded-2xl shadow-2xl"
                  loading="eager"
                />
                <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: "#32CD32" }}
                    >
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold" style={{ color: "#212529" }}>
                        Progress Tracking
                      </div>
                      <div className="text-sm" style={{ color: "#6C757D" }}>
                        Real-time analytics
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20" style={{ backgroundColor: "#F8F9FA" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4" style={{ color: "#212529" }}>
              Complete Fitness Platform
            </h2>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: "#6C757D" }}>
              Everything you need in one powerful platform - from shopping to learning to managing
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="transition-all duration-300 border-0 shadow-md bg-white">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className={`flex items-center justify-center w-16 h-16 rounded-full ${feature.bgColor}`}>
                      <feature.icon className={`h-8 w-8 ${feature.color}`} />
                    </div>
                  </div>
                  <CardTitle className="text-xl" style={{ color: "#212529" }}>
                    {feature.title}
                  </CardTitle>
                  <CardDescription style={{ color: "#6C757D" }}>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button
                    
                    variant="outline"
                    className="inline-flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-300 bg-transparent"
                    style={{ borderColor: "#007BFF", color: "#007BFF" }}
                  >
                    <Link href={feature.href} className="inline-flex items-center gap-2">
                      Explore
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                  style={{ backgroundColor: "#E3F2FD" }}
                >
                  <stat.icon className="h-8 w-8" style={{ color: "#007BFF" }} />
                </div>
                <div className="text-3xl font-bold mb-2" style={{ color: "#212529" }}>
                  {stat.value}
                </div>
                <div style={{ color: "#6C757D" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20" style={{ backgroundColor: "#F8F9FA" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4" style={{ color: "#212529" }}>
              Featured Courses
            </h2>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: "#6C757D" }}>
              Expert-led fitness courses and training programs designed for all skill levels
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCourses.map((course) => (
              <Card
                key={course.id}
                className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white"
              >
                <CardHeader className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <Image
                      src={course.image || "/placeholder.svg"}
                      alt={course.title}
                      width={300}
                      height={200}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge style={{ backgroundColor: "#32CD32", color: "#FFFFFF" }}>{course.category}</Badge>
                    </div>
                    <div className="absolute top-4 right-4">
                      <Badge variant="outline" className="bg-white">
                        {course.rating} ★
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <CardTitle className="text-xl mb-2" style={{ color: "#212529" }}>
                    {course.title}
                  </CardTitle>
                  <CardDescription className="mb-4" style={{ color: "#6C757D" }}>
                    by {course.instructor} • {course.students.toLocaleString()} students
                  </CardDescription>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold" style={{ color: "#007BFF" }}>
                      ${course.price}
                    </span>
                  <ProtectedAction onAction={() => handleCourseEnrollment(course)}>
                    
                    <Button style={{ backgroundColor: "#007BFF" }}>
                      <Play className="h-4 w-4 mr-2" />
                      Enroll Now
                    </Button>
                  </ProtectedAction>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" size="lg" >
              <Link href="/courses" className="inline-flex items-center gap-2">
                View All Courses
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4" style={{ color: "#212529" }}>
              Featured Products
            </h2>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: "#6C757D" }}>
              Premium fitness equipment and supplements to support your fitness journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <Card
                key={product.id}
                className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white"
              >
                <CardHeader className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      width={300}
                      height={300}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge style={{ backgroundColor: "#32CD32", color: "#FFFFFF" }}>{product.rating} ★</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <CardTitle className="text-xl mb-2" style={{ color: "#212529" }}>
                    {product.name}
                  </CardTitle>
                  <CardDescription className="mb-4" style={{ color: "#6C757D" }}>
                    {product.reviews} reviews
                  </CardDescription>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold" style={{ color: "#007BFF" }}>
                      ${product.price}
                    </span>

                  
                  <ProtectedAction onAction={() => handleHomeAddToCart(product)}>

                    <Button style={{ backgroundColor: "#007BFF" }}>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </ProtectedAction>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              <Link href="/products" className="inline-flex items-center gap-2">
                View All Products
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-20"
        style={{
          background: `linear-gradient(135deg, #007BFF 0%, #32CD32 100%)`,
        }}
      >
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">Ready to Start Your Fitness Journey?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of members who have already transformed their lives. Get started today with our comprehensive
            fitness programs and expert-led courses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 bg-white text-black hover:bg-gray-100">
              Start Free Trial
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 text-white border-white hover:bg-white hover:text-black bg-transparent"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

