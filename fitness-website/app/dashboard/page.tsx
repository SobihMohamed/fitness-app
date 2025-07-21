"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Clock, Trophy, Target, Play, Download, Star, CheckCircle, Lock } from "lucide-react"

// Mock data for dashboard
const mockUserStats = {
  enrolledCourses: 8,
  completedCourses: 3,
  learningHours: 47,
  currentStreak: 12,
  totalAchievements: 15,
}

const mockCourses = [
  {
    id: 1,
    title: "Complete Fitness Fundamentals",
    instructor: "Sarah Johnson",
    progress: 75,
    totalLessons: 24,
    completedLessons: 18,
    nextLesson: "Advanced Cardio Techniques",
    thumbnail: "/placeholder.svg?height=120&width=200",
    category: "Fitness",
    duration: "8 weeks",
  },
  {
    id: 2,
    title: "Nutrition for Athletes",
    instructor: "Dr. Mike Chen",
    progress: 45,
    totalLessons: 16,
    completedLessons: 7,
    nextLesson: "Meal Planning Strategies",
    thumbnail: "/placeholder.svg?height=120&width=200",
    category: "Nutrition",
    duration: "6 weeks",
  },
  {
    id: 3,
    title: "Yoga for Beginners",
    instructor: "Emma Wilson",
    progress: 100,
    totalLessons: 12,
    completedLessons: 12,
    nextLesson: "Course Completed",
    thumbnail: "/placeholder.svg?height=120&width=200",
    category: "Yoga",
    duration: "4 weeks",
  },
]

const mockAchievements = [
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

const mockActivity = [
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

export default function Dashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (user) {
      router.push("/")
    }
  }, [user, router])

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
          <p className="text-gray-600 mt-2">Continue your fitness journey and track your progress</p>
        </div>

        {/* Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="courses">My Courses</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockUserStats.enrolledCourses}</div>
                  <p className="text-xs text-muted-foreground">{mockUserStats.completedCourses} completed</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Learning Hours</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockUserStats.learningHours}</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockUserStats.currentStreak}</div>
                  <p className="text-xs text-muted-foreground">Days in a row</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Achievements</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockUserStats.totalAchievements}</div>
                  <p className="text-xs text-muted-foreground">Badges earned</p>
                </CardContent>
              </Card>
            </div>

            {/* Continue Learning */}
            <Card>
              <CardHeader>
                <CardTitle>Continue Learning</CardTitle>
                <CardDescription>Pick up where you left off</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCourses
                    .filter((course) => course.progress < 100)
                    .slice(0, 2)
                    .map((course) => (
                      <div key={course.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <BookOpen className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{course.title}</h4>
                          <p className="text-sm text-gray-600">Next: {course.nextLesson}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Progress value={course.progress} className="flex-1" />
                            <span className="text-sm text-gray-500">{course.progress}%</span>
                          </div>
                        </div>
                        <Button size="sm">
                          <Play className="h-4 w-4 mr-2" />
                          Continue
                        </Button>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Learning Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Learning Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Overall Completion</span>
                      <span className="text-sm font-medium">62%</span>
                    </div>
                    <Progress value={62} />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-medium">Lessons Completed</div>
                        <div className="text-gray-600">127 of 180</div>
                      </div>
                      <div>
                        <div className="font-medium">Avg. Score</div>
                        <div className="text-gray-600">87%</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockAchievements
                      .filter((achievement) => achievement.earned)
                      .slice(0, 3)
                      .map((achievement) => (
                        <div key={achievement.id} className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                            <achievement.icon className="h-5 w-5 text-yellow-600" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{achievement.title}</div>
                            <div className="text-xs text-gray-500">Earned {achievement.earnedDate}</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* My Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockCourses.map((course) => (
                <Card key={course.id} className="overflow-hidden">
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
                          {course.completedLessons}/{course.totalLessons} lessons
                        </span>
                        <span>{course.duration}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Progress</span>
                          <span className="text-sm font-medium">{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} />
                      </div>
                      <div className="flex space-x-2 pt-2">
                        <Button size="sm" className="flex-1">
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
          </TabsContent>

          {/* Achievements Tab */}
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
                    {mockAchievements
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
                    {mockAchievements
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
                                <Progress value={(achievement.progress / achievement.total) * 100} className="h-2" />
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
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your learning journey over the past week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockActivity.map((activity) => (
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
