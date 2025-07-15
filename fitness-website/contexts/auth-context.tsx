
"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

// Define the User interface with all necessary properties
// It uses localStorage to persist user data across sessions
// for the backend, you would typically use a database and API calls
// Here, we simulate this with localStorage for simplicity
// instead of localstorage, you could use a more secure method like cookies or JWT tokens
interface User {
  id: string
  email: string
  name: string
  role: "user" | "admin"
  enrolledCourses: number[]
  completedLessons: { [courseId: number]: number[] }
  progress: { [courseId: number]: number }
  achievements: string[]
  joinDate: string
  
}

// Define the AuthContextType interface
// This interface includes methods for authentication and course management
//it uses localStorage to persist user data across sessions
// for the backend, you would typically use a database and API calls
//instead of localstorage, you could use a more secure method like cookies or JWT tokens
interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; message: string }>
  isEnrolled: (courseId: number) => boolean
  enrollInCourse: (courseId: number) => void
  getProgress: (courseId: number) => number
  completeLesson: (courseId: number, lessonId: number) => void
  isLessonCompleted: (courseId: number, lessonId: number) => boolean
  updateProfile: (updates: Partial<User>) => void
  isInitialized: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)


  // Load user data from localStorage when the component mounts
  // This simulates fetching user data from a backend service
  // In a real application, you would replace this with an API call to fetch user data
  useEffect(() => {
    const savedUser = localStorage.getItem("fitpro_user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      // Demo accounts
      if (email === "demo@fitpro.com" && password === "demo123") {
        const demoUser: User = {
          id: "demo-user",
          email: "demo@fitpro.com",
          name: "Demo User",
          role: "user",
          enrolledCourses: [1, 2],
          completedLessons: { 1: [1, 2], 2: [1] },
          progress: { 1: 25, 2: 15 },
          achievements: ["First Course", "Quick Learner"],
          joinDate: "2024-01-01",
        }
        setUser(demoUser)
        localStorage.setItem("fitpro_user", JSON.stringify(demoUser))
        return { success: true, message: "Welcome back!" }
      }

      if (email === "admin@fitpro.com" && password === "admin123") {
        const adminUser: User = {
          id: "admin-user",
          email: "admin@fitpro.com",
          name: "Admin User",
          role: "admin",
          enrolledCourses: [],
          completedLessons: {},
          progress: {},
          achievements: ["Admin Access"],
          joinDate: "2024-01-01",
        }
        setUser(adminUser)
        localStorage.setItem("fitpro_user", JSON.stringify(adminUser))
        return { success: true, message: "Admin login successful!" }
      }

      // For any other email/password, create a new user
      const newUser: User = {
        id: Date.now().toString(),
        email,
        name: email.split("@")[0],
        role: "user",
        enrolledCourses: [],
        completedLessons: {},
        progress: {},
        achievements: [],
        joinDate: new Date().toISOString().split("T")[0],
      }
      setUser(newUser)
      localStorage.setItem("fitpro_user", JSON.stringify(newUser))
      return { success: true, message: "Account created and logged in successfully!" }
    } catch (error) {
      return { success: false, message: "Login failed. Please try again." }
    }
  }

  const register = async (
    email: string,
    password: string,
    name: string,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const newUser: User = {
        id: Date.now().toString(),
        email,
        name,
        role: "user",
        enrolledCourses: [],
        completedLessons: {},
        progress: {},
        achievements: ["Welcome Bonus"],
        joinDate: new Date().toISOString().split("T")[0],
      }
      setUser(newUser)
      localStorage.setItem("fitpro_user", JSON.stringify(newUser))
      return { success: true, message: "Account created successfully!" }
    } catch (error) {
      return { success: false, message: "Registration failed. Please try again." }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("fitpro_user")
  }

  const isEnrolled = (courseId: number): boolean => {
    return user?.enrolledCourses.includes(courseId) || false
  }

  const enrollInCourse = (courseId: number) => {
    if (user && !user.enrolledCourses.includes(courseId)) {
      const updatedUser = {
        ...user,
        enrolledCourses: [...user.enrolledCourses, courseId],
        progress: { ...user.progress, [courseId]: 0 },
      }
      setUser(updatedUser)
      localStorage.setItem("fitpro_user", JSON.stringify(updatedUser))
    }
  }

  const getProgress = (courseId: number): number => {
    return user?.progress[courseId] || 0
  }

  const completeLesson = (courseId: number, lessonId: number) => {
    if (user) {
      const courseCompletedLessons = user.completedLessons[courseId] || []
      if (!courseCompletedLessons.includes(lessonId)) {
        const updatedCompletedLessons = {
          ...user.completedLessons,
          [courseId]: [...courseCompletedLessons, lessonId],
        }

        // Calculate new progress (assuming 48 lessons per course for demo)
        const totalLessons = 48
        const completedCount = updatedCompletedLessons[courseId].length
        const newProgress = Math.round((completedCount / totalLessons) * 100)

        const updatedUser = {
          ...user,
          completedLessons: updatedCompletedLessons,
          progress: { ...user.progress, [courseId]: newProgress },
        }
        setUser(updatedUser)
        localStorage.setItem("fitpro_user", JSON.stringify(updatedUser))
      }
    }
  }

  const isLessonCompleted = (courseId: number, lessonId: number): boolean => {
    return user?.completedLessons[courseId]?.includes(lessonId) || false
  }

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      localStorage.setItem("fitpro_user", JSON.stringify(updatedUser))
    }
  }

  const value: AuthContextType = {
    user,
    login,
    logout,
    register,
    isEnrolled,
    enrollInCourse,
    getProgress,
    completeLesson,
    isLessonCompleted,
    updateProfile,
    isInitialized: false,
    isLoading: false, // Assuming loading state is not implemented yet
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
