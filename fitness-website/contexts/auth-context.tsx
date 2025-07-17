
"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";//"http://localhost/fitness-api-php/public"


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
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load user data from localStorage when the component mounts
  // This simulates fetching user data from a backend service
  // In a real application, you would replace this with an API call to fetch user data
  useEffect(() => {
    const savedUser = localStorage.getItem("fitpro_user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    } 
  setIsInitialized(true)
  setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    
    
    try {
      const response = await axios.post(`${baseURL}/auth/login`, 
        { 
          email, 
          password 

        },  
        {
      headers: { "Content-Type": "application/json" },
      withCredentials: true  //sobieh answer this question  why we did this?
    }
        // Include credentials for cookie-based auth}
       )
      
        if (response.data.status === "success") {
      const userData = response.data.user;
      setUser(userData);
      localStorage.setItem("fitpro_user", JSON.stringify(userData));
      return { success: true, message: response.data.message };
    } else {
      return { success: false, message: response.data.message || "Login failed." };
    }
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Login error." };
  }
};


  // Register a new user
  // This function handles user registration by sending a POST request to the server
  const register = async (
    email: string,
    password: string,
    name: string,
    // address: string ,
    // phone: any
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await axios.post(`${baseURL}/auth/register`, 
        { 
          email, 
          password, 
          name 
        }, 
        {
      headers: { "Content-Type": "application/json" },
      withCredentials: true  
       })

       if (response.data.status === "success") {
      return { success: true, message: response.data.message };
    } else {
      return { success: false, message: response.data.message || "Registration failed." };
    }
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Registration error." };
  }
};
  

  // Logout the user
  const logout = async () => {
  try {
    await axios.post(`${baseURL}/auth/logout`);
  } catch (error) {
    console.error("Logout failed", error);
  } finally {
    setUser(null);
    localStorage.removeItem("fitpro_user");
  }
};




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
    login,//tmam
    logout,
    register,
    isEnrolled,
    enrollInCourse,
    getProgress,
    completeLesson,
    isLessonCompleted,
    updateProfile,
    isInitialized,
    isLoading 
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
