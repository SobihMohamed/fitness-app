"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Star, Users, Clock, BookOpen, Filter, Search } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const courses = [
  {
    id: 1,
    title: "Complete Strength Training Masterclass",
    instructor: "Mike Johnson",
    duration: "12 weeks",
    lessons: 48,
    students: 1250,
    rating: 4.9,
    price: 89,
    originalPrice: 129,
    image: "/images/strength-masterclass.jpg",
    category: "Strength Training",
    level: "Beginner",
    featured: true,
    description: "Master the fundamentals of strength training with progressive overload techniques.",
  },
  {
    id: 2,
    title: "Advanced HIIT Workouts",
    instructor: "Sarah Davis",
    duration: "8 weeks",
    lessons: 32,
    students: 890,
    rating: 4.8,
    price: 79,
    originalPrice: 99,
    image: "/images/hiit-advanced.jpg",
    category: "Cardio",
    level: "Advanced",
    featured: true,
    description: "High-intensity interval training for maximum fat burn and cardiovascular health.",
  },
  {
    id: 3,
    title: "Yoga for Flexibility & Mindfulness",
    instructor: "Emma Wilson",
    duration: "10 weeks",
    lessons: 40,
    students: 2100,
    rating: 4.9,
    price: 69,
    originalPrice: 89,
    image: "/images/yoga-mindfulness.jpg",
    category: "Yoga",
    level: "Beginner",
    featured: false,
    description: "Improve flexibility, balance, and mental well-being through guided yoga practice.",
  },
  {
    id: 4,
    title: "Nutrition Fundamentals",
    instructor: "Dr. Alex Chen",
    duration: "6 weeks",
    lessons: 24,
    students: 1580,
    rating: 4.7,
    price: 59,
    originalPrice: 79,
    image: "/images/nutrition-science.jpg",
    category: "Nutrition",
    level: "Beginner",
    featured: false,
    description: "Learn the science of nutrition and how to fuel your body for optimal performance.",
  },
  {
    id: 5,
    title: "Bodyweight Training Mastery",
    instructor: "Chris Martinez",
    duration: "10 weeks",
    lessons: 35,
    students: 950,
    rating: 4.8,
    price: 75,
    originalPrice: 95,
    image: "/images/bodyweight-mastery.jpg",
    category: "Bodyweight",
    level: "Intermediate",
    featured: false,
    description: "Build strength and muscle using only your bodyweight with progressive calisthenics.",
  },
  {
    id: 6,
    title: "Powerlifting Fundamentals",
    instructor: "Jessica Brown",
    duration: "14 weeks",
    lessons: 56,
    students: 720,
    rating: 4.9,
    price: 99,
    originalPrice: 139,
    image: "/images/powerlifting-fundamentals.jpg",
    category: "Powerlifting",
    level: "Intermediate",
    featured: true,
    description: "Master the big three lifts: squat, bench press, and deadlift with proper form and technique.",
  },
]

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [showFeatured, setShowFeatured] = useState(false)

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || course.category === selectedCategory
    const matchesLevel = selectedLevel === "all" || course.level === selectedLevel
    const matchesFeatured = !showFeatured || course.featured

    return matchesSearch && matchesCategory && matchesLevel && matchesFeatured
  })

  const categories = ["all", ...Array.from(new Set(courses.map((course) => course.category)))]
  const levels = ["all", ...Array.from(new Set(courses.map((course) => course.level)))]

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8F9FA" }}>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            Expert-Led <span className="text-yellow-400">Fitness Courses</span>
          </h1>
          <p className="text-xl lg:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
            Transform your fitness journey with comprehensive courses designed by certified professionals. Learn at your
            own pace and achieve your goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-gray-900">
              <Play className="mr-2 h-5 w-5" />
              Start Learning Today
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-800 bg-transparent"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Browse Free Previews
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
              <div className="text-gray-600">Expert Courses</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">10K+</div>
              <div className="text-gray-600">Active Students</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">4.9</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-gray-600">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === "all" ? "All Categories" : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level === "all" ? "All Levels" : level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant={showFeatured ? "default" : "outline"}
                onClick={() => setShowFeatured(!showFeatured)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Featured Only
              </Button>
            </div>

            <div className="text-sm text-gray-600">
              {filteredCourses.length} course{filteredCourses.length !== 1 ? "s" : ""} found
            </div>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredCourses.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your filters or search terms.</p>
              <Button
                onClick={() => {
                  setSearchTerm("")
                  setSelectedCategory("all")
                  setSelectedLevel("all")
                  setShowFeatured(false)
                }}
              >
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course) => (
                <Link key={course.id} href={`/courses/${course.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow bg-white cursor-pointer">
                    <div className="relative">
                      <Image
                        src={course.image || "/placeholder.svg"}
                        alt={course.title}
                        width={400}
                        height={250}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <Badge style={{ backgroundColor: "#32CD32", color: "#FFFFFF" }}>{course.category}</Badge>
                        {course.featured && (
                          <Badge className="bg-yellow-500 text-yellow-900">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>
                      <div className="absolute top-3 right-3">
                        <Badge variant="outline" className="bg-white">
                          {course.level}
                        </Badge>
                      </div>
                    </div>
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold" style={{ color: "#007BFF" }}>
                            ${course.price}
                          </span>
                          {course.originalPrice && (
                            <span className="text-lg text-gray-500 line-through">${course.originalPrice}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{course.rating}</span>
                        </div>
                      </div>
                      <CardTitle className="text-xl" style={{ color: "#212529" }}>
                        {course.title}
                      </CardTitle>
                      <CardDescription style={{ color: "#6C757D" }}>by {course.instructor}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4" style={{ color: "#6C757D" }}>
                        {course.description}
                      </p>
                      <div className="flex items-center justify-between text-sm mb-4" style={{ color: "#6C757D" }}>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{course.lessons} lessons</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{course.students.toLocaleString()}</span>
                        </div>
                      </div>
                      <Button className="w-full" style={{ backgroundColor: "#007BFF" }}>
                        <Play className="h-4 w-4 mr-2" />
                        View Course
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">Ready to Start Your Learning Journey?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of students who have already transformed their fitness knowledge and achieved their goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Browse All Courses
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-gray-900 bg-transparent"
            >
              Contact Support
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
