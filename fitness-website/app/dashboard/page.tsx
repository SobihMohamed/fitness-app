"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import axios from "axios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BookOpen, Clock, Trophy, Target, Play, Download, Star, CheckCircle, Lock, User, Mail, Phone, UserCheck, MapPin, Globe, AlertCircle, Loader2, ShoppingBag } from 'lucide-react'
import { API_CONFIG } from "@/config/api"

// Define interfaces for data structures
interface ProfileData {
  name: string
  email: string
  phone?: string
  user_type: string
  address?: string
  country?: string
}

interface OrderData {
  _id: string
  orderNumber?: string
  userId: string
  products: Array<{
    productId: string
    name: string
    quantity: number
    price: number
  }>
  totalAmount: number
  status: string
  createdAt: string
  updatedAt: string
}

interface CourseData {
  _id: string
  title: string
  description: string
  instructor: string
  category: string
  duration: number
  lessons: number
  progress?: number
  thumbnail?: string
}

interface AchievementData {
  id: number
  title: string
  description: string
  icon: React.ComponentType<any>
  earned: boolean
  earnedDate?: string
  progress?: number
  total?: number
  category: string
}

interface ActivityData {
  id: number
  type: string
  title: string
  course?: string
  description?: string
  instructor?: string
  timestamp: string
  icon: React.ComponentType<any>
}

interface UserStats {
  enrolledCourses: number;
  completedCourses: number;
  learningHours: number;
  currentStreak: number;
  totalAchievements: number;
}

export default function Dashboard() {
  const { user, isLoading, token } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  
  // Profile state management
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [formData, setFormData] = useState<ProfileData | null>(null)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  
  // Orders state management
  const [orders, setOrders] = useState<OrderData[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  
  // Courses state management
  const [courses, setCourses] = useState<CourseData[]>([])
  const [loadingCourses, setLoadingCourses] = useState(false)
  
  // Achievements state management
  const [achievements, setAchievements] = useState<AchievementData[]>([])
  const [loadingAchievements, setLoadingAchievements] = useState(false)
  
  // Activity state management
  const [activity, setActivity] = useState<ActivityData[]>([])
  const [loadingActivity, setLoadingActivity] = useState(false)
  
  // User stats state management
  const [userStats, setUserStats] = useState<UserStats>({
    enrolledCourses: 0,
    completedCourses: 0,
    learningHours: 0,
    currentStreak: 0,
    totalAchievements: 0,
  })
  
  // Loading states for data fetching
  const [loadingStats, setLoadingStats] = useState(false)

  // 🔧 AUTHENTICATION CHECK - Fixed Logic
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])
  
  // Fetch all dashboard data
  useEffect(() => {
    if (user && token) {
      fetchProfileData()
      fetchOrderData()
      fetchCoursesData()
      fetchAchievementsData()
      fetchActivityData()
      fetchUserStats()
    }
  }, [user, token])

  // Function to fetch profile data
  const fetchProfileData = async () => {
    try {
      const response = await axios.get(API_CONFIG.USER_FUNCTIONS.user.profile, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data && response.data.data) {
        setProfile(response.data.data)
        setFormData(response.data.data)
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      // If API fails, use user data from auth context as fallback
      if (user) {
        const fallbackData = {
          name: user.name || "",
          email: user.email || "",
          user_type: user.role || "user",
        }
        setProfile(fallbackData as ProfileData)
        setFormData(fallbackData as ProfileData)
      }
    }
  }

  // Function to fetch order data
  const fetchOrderData = async () => {
    setLoadingOrders(true)
    try {
      const response = await axios.get(API_CONFIG.USER_FUNCTIONS.RequestOreders.showAllUserOrders, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data && response.data.data) {
        setOrders(response.data.data)
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoadingOrders(false)
    }
  }

  // Function to fetch courses data
  const fetchCoursesData = async () => {
    setLoadingCourses(true)
    try {
      const response = await axios.get(API_CONFIG.USER_FUNCTIONS.user.courses, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data && response.data.data) {
        setCourses(response.data.data)
      }
    } catch (error) {
      console.error("Error fetching courses:", error)
    } finally {
      setLoadingCourses(false)
    }
  }

  // Function to fetch achievements data
  const fetchAchievementsData = async () => {
    setLoadingAchievements(true)
    try {
      // In a real implementation, you would fetch from an API
      // For now, we'll use mock data but in a real scenario, this would come from an API
      const achievementsData: AchievementData[] = [
        {
          id: 1,
          title: "First Course Completed",
          description: "Complete your first fitness course",
          icon: Trophy,
          earned: true,
          earnedDate: "2024-01-15",
          category: "Milestone",
        },
        {
          id: 2,
          title: "Week Warrior",
          description: "Complete 7 days of consecutive learning",
          icon: Target,
          earned: true,
          earnedDate: "2024-01-20",
          category: "Streak",
        },
        {
          id: 3,
          title: "Knowledge Seeker",
          description: "Complete 50 lessons across all courses",
          icon: BookOpen,
          earned: false,
          progress: 38,
          total: 50,
          category: "Progress",
        },
        {
          id: 4,
          title: "Perfect Score",
          description: "Score 100% on 5 course quizzes",
          icon: Star,
          earned: false,
          progress: 2,
          total: 5,
          category: "Performance",
        },
      ]
      setAchievements(achievementsData)
    } catch (error) {
      console.error("Error fetching achievements:", error)
    } finally {
      setLoadingAchievements(false)
    }
  }

  // Function to fetch activity data
  const fetchActivityData = async () => {
    setLoadingActivity(true)
    try {
      // In a real implementation, you would fetch from an API
      // For now, we'll use mock data but in a real scenario, this would come from an API
      const activityData: ActivityData[] = [
        {
          id: 1,
          type: "lesson_completed",
          title: "Completed: Advanced Cardio Techniques",
          course: "Complete Fitness Fundamentals",
          timestamp: "2 hours ago",
          icon: CheckCircle,
        },
        {
          id: 2,
          type: "achievement_earned",
          title: "Earned: Week Warrior achievement",
          description: "7 days consecutive learning streak",
          timestamp: "1 day ago",
          icon: Trophy,
        },
        {
          id: 3,
          type: "course_enrolled",
          title: "Enrolled in: Advanced Strength Training",
          instructor: "John Smith",
          timestamp: "3 days ago",
          icon: BookOpen,
        },
        {
          id: 4,
          type: "lesson_completed",
          title: "Completed: Meal Planning Strategies",
          course: "Nutrition for Athletes",
          timestamp: "5 days ago",
          icon: CheckCircle,
        },
      ]
      setActivity(activityData)
    } catch (error) {
      console.error("Error fetching activity:", error)
    } finally {
      setLoadingActivity(false)
    }
  }

  // Function to fetch user stats
  const fetchUserStats = async () => {
    setLoadingStats(true)
    try {
      // In a real implementation, you would fetch from an API
      // For now, we'll use mock data but in a real scenario, this would come from an API
      const mockStats: UserStats = {
        enrolledCourses: 8,
        completedCourses: 3,
        learningHours: 47,
        currentStreak: 12,
        totalAchievements: 15,
      }
      setUserStats(mockStats)
    } catch (error) {
      console.error("Error fetching user stats:", error)
    } finally {
      setLoadingStats(false)
    }
  }

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => (prev ? { ...prev, [name]: value } : null))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData) return

    setUpdating(true)
    setMessage(null)

    try {
      const response = await axios.put(
        API_CONFIG.USER_FUNCTIONS.user.updateProfile,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.data) {
        setProfile(formData)
        setMessage({
          type: "success",
          text: "Profile updated successfully!",
        })
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      setMessage({
        type: "error",
        text: "Failed to update profile. Please try again.",
      })
    } finally {
      setUpdating(false)
    }
  }

  // 🔄 LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // 🚫 NO USER STATE
  if (!user) {
    return null
  }

  // Filter courses that are in progress (not 100% complete)
  const inProgressCourses = courses.filter(course => course.progress && course.progress > 0 && course.progress < 100)
  
  // Filter earned achievements
  const earnedAchievements = achievements.filter(achievement => achievement.earned)
  
  // Filter locked achievements
  const lockedAchievements = achievements.filter(achievement => !achievement.earned)

  // 🎨 MAIN DASHBOARD RENDER
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 📄 HEADER SECTION */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Continue your fitness journey and track your progress
          </p>
        </div>
        
        {/* 🚨 ALERT MESSAGES */}
        {message && (
          <Alert
            className={`mb-6 ${message.type === "error" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}
          >
            {message.type === "error" ? (
              <AlertCircle className="h-4 w-4 text-red-600" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
            <AlertDescription className={message.type === "error" ? "text-red-800" : "text-green-800"}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* 📊 DASHBOARD TABS */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="courses">My Courses</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* 📈 OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userStats.enrolledCourses}</div>
                  <p className="text-xs text-muted-foreground">
                    {userStats.completedCourses} completed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Learning Hours</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userStats.learningHours}</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userStats.currentStreak}</div>
                  <p className="text-xs text-muted-foreground">Days in a row</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Achievements</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userStats.totalAchievements}</div>
                  <p className="text-xs text-muted-foreground">Badges earned</p>
                </CardContent>
              </Card>
            </div>

            {/* Profile Section */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <span>Personal Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Form Fields Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Full Name Field */}
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                        Full Name <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          value={formData?.name || ""}
                          onChange={handleChange}
                          className="pl-10 focus:border-indigo-500 focus:ring-indigo-500"
                          required
                          placeholder="Enter your full name"
                        />
                      </div>
                    </div>

                    {/* Email Field (Read-only) */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData?.email || ""}
                          className="pl-10 bg-gray-50"
                          readOnly
                          disabled
                        />
                      </div>
                      <p className="text-xs text-gray-500">Email cannot be changed</p>
                    </div>

                    {/* Phone Field */}
                    <div className="space-y-2">
<Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                        Phone Number
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData?.phone || ""}
                          onChange={handleChange}
                          className="pl-10 focus:border-indigo-500 focus:ring-indigo-500"
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>
                    
                    {/* Address Field */}
                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                        Address
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="address"
                          name="address"
                          type="text"
                          value={formData?.address || ""}
                          onChange={handleChange}
                          className="pl-10 focus:border-indigo-500 focus:ring-indigo-500"
                          placeholder="Enter your address"
                        />
                      </div>
                    </div>
                    
                    {/* Country Field */}
                    <div className="space-y-2">
                      <Label htmlFor="country" className="text-sm font-medium text-gray-700">
                        Country
                      </Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="country"
                          name="country"
                          type="text"
                          value={formData?.country || ""}
                          onChange={handleChange}
                          className="pl-10 focus:border-indigo-500 focus:ring-indigo-500"
                          placeholder="Enter your country"
                        />
                      </div>
                    </div>
                    
                    {/* User Type Field (Read-only) */}
                    <div className="space-y-2">
                      <Label htmlFor="user_type" className="text-sm font-medium text-gray-700">
                        User Type
                      </Label>
                      <div className="relative">
                        <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="user_type"
                          name="user_type"
                          type="text"
                          value={formData?.user_type || ""}
                          className="pl-10 bg-gray-50"
                          readOnly
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => formData && setFormData(profile)}
                      disabled={updating}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={updating}>
                      {updating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update Profile"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* 📚 MY COURSES TAB */}

          {/* 📚 MY COURSES TAB */}
          <TabsContent value="courses" className="space-y-6">
            {loadingCourses ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                <span className="ml-2 text-gray-600">Loading your courses...</span>
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100 p-8">
                <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Courses Yet</h3>
                <p className="text-gray-500 mb-6">You haven't enrolled in any courses yet. Browse our catalog to find courses that interest you.</p>
                <Button onClick={() => router.push('/courses')}>Browse Courses</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <Card key={course._id} className="overflow-hidden">
                    <div className="aspect-video bg-gray-200 flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-gray-400" />
                    </div>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <Badge variant="secondary" className="text-xs">
                          {course.category}
                        </Badge>
                        <h3 className="font-semibold line-clamp-2">{course.title}</h3>
                        <p className="text-sm text-gray-600">by {course.instructor}</p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>
                            {course.lessons} lessons
                          </span>
                          <span>{course.duration} hours</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Progress</span>
                            <span className="text-sm font-medium">{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} />
                        </div>
                        <div className="flex space-x-2 pt-2">
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => router.push(`/courses/${course._id}`)}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            {course.progress === 100 ? "Review" : "Continue"}
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* 🏆 ACHIEVEMENTS TAB */}
          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Earned Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <span>Earned Achievements</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {achievements
                      .filter((achievement) => achievement.earned)
                      .map((achievement) => (
                        <div
                          key={achievement.id}
                          className="flex items-center space-x-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                        >
                          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                            <achievement.icon className="h-6 w-6 text-yellow-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-yellow-900">{achievement.title}</h4>
                            <p className="text-sm text-yellow-700">{achievement.description}</p>
                            <p className="text-xs text-yellow-600 mt-1">Earned on {achievement.earnedDate}</p>
                          </div>
                          <CheckCircle className="h-5 w-5 text-yellow-600" />
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Locked Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lock className="h-5 w-5 text-gray-400" />
                    <span>Locked Achievements</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {achievements
                      .filter((achievement) => !achievement.earned)
                      .map((achievement) => (
                        <div
                          key={achievement.id}
                          className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            <achievement.icon className="h-6 w-6 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-700">{achievement.title}</h4>
                            <p className="text-sm text-gray-600">{achievement.description}</p>
                            {achievement.progress && (
                              <div className="mt-2">
                                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                  <span>Progress</span>
                                  <span>
                                    {achievement.progress}/{achievement.total}
                                  </span>
                                </div>
                                <Progress value={achievement.total ? (achievement.progress / achievement.total) * 100 : 0} className="h-2" />
                              </div>
                            )}
                          </div>
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Requests Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ShoppingBag className="h-5 w-5 text-indigo-500" />
                  <span>My Order Requests</span>
                </CardTitle>
                <CardDescription>Track your product orders and their status</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingOrders ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                    <span className="ml-2 text-gray-600">Loading orders...</span>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p>You haven't placed any orders yet.</p>
                    <Button variant="outline" className="mt-4" onClick={() => router.push('/products')}>
                      Browse Products
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Order ID
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Products
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                          <tr key={order._id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {order.orderNumber || `#${order._id.substring(0, 8)}`}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {order.products.map(product => product.name).join(", ")}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              ${order.totalAmount.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className={`
                                ${order.status === 'delivered' ? 'bg-green-100 text-green-800 border-green-200' :
                                  order.status === 'processing' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                  order.status === 'cancelled' ? 'bg-red-100 text-red-800 border-red-200' :
                                  'bg-yellow-100 text-yellow-800 border-yellow-200'}
                              `}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <Button variant="outline" size="sm">View Details</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 📊 ACTIVITY TAB */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your learning journey over the past week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <activity.icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900">{activity.title}</h4>
                        {activity.course && <p className="text-sm text-gray-600">Course: {activity.course}</p>}
                        {activity.description && <p className="text-sm text-gray-600">{activity.description}</p>}
                        {activity.instructor && (
                          <p className="text-sm text-gray-600">Instructor: {activity.instructor}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
