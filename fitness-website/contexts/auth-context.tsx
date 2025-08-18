"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import axios from "axios"
import { API_CONFIG } from "@/config/api"

// ────────────────────────────────────────────────────────────────
// 0) API endpoints
const AUTH_API = API_CONFIG.USER_FUNCTIONS.auth

// ────────────────────────────────────────────────────────────────
// 1) Shape of user data (returned from your API)
// ────────────────────────────────────────────────────────────────
interface User {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  country?: string
  user_type: string
  avatar?: string
  role?: "user" | "admin"
  // add any other fields your API returns
}

// ────────────────────────────────────────────────────────────────
// 2) What the AuthContext provides
// ────────────────────────────────────────────────────────────────
interface AuthContextType {
  user: User | null
  isLoading: boolean
  isInitialized: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  register: (
    name: string,
    email: string,
    password: string,
    phone: string,
    address: string,
    country: string,
    user_type: string,
  ) => Promise<{ success: boolean; message: string }>
  forgetPassword: (email: string) => Promise<{ success: boolean; message: string }>
  verifyOtp: (email: string, otp: string, newPassword: string) => Promise<{ success: boolean; message: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ────────────────────────────────────────────────────────────────
// 3) Provider component
// ────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)

  // On mount, try to load user from sessionStorage or re‑validate session
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = sessionStorage.getItem("user")
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
      } catch (error) {
        sessionStorage.removeItem("user")
        sessionStorage.removeItem("token")
        console.error("Error initializing auth from sessionStorage:", error)
      } finally {
        setIsInitialized(true)
        setIsLoading(false)
      }
    }
    initializeAuth()
  }, [])

  // ────────────────────────────────────────────────────────────────
  // LOGIN
  // ────────────────────────────────────────────────────────────────
  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const res = await axios.post(
        AUTH_API.login,
        { email, password },
        {
          headers: { "Content-Type": "application/json" },
        },
      )

      if (res.data.status === "success") {
        // Normalize user data structure
        const userData = res.data.user || res.data.data || {}
        const normalizedUser = {
          id: userData.user_id || userData.id || "",
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          address: userData.address || "",
          country: userData.country || "",
          user_type: userData.user_type || "user",
          avatar: userData.avatar || "",
        }
        
        setUser(normalizedUser)
        sessionStorage.setItem("user", JSON.stringify(normalizedUser))
        sessionStorage.setItem("token", res.data.token)
        
        return { success: true, message: res.data.message || "Login successful" }
      }
      
      return { success: false, message: res.data.message || "Invalid credentials" }
    } catch (err: any) {
      console.error("Login error:", err)
      return { 
        success: false, 
        message: err.response?.data?.message || "Login failed. Please check your connection and try again." 
      }
    } finally {
      setIsLoading(false)
    }
  }

  // ────────────────────────────────────────────────────────────────
  // REGISTER
  // ────────────────────────────────────────────────────────────────
  const register = async (
    name: string,
    email: string,
    password: string,
    phone: string,
    address: string,
    country: string,
    user_type: string,
  ) => {
    setIsLoading(true)
    try {
      const res = await axios.post(AUTH_API.register, {
        name,
        email,
        password,
        phone,
        address,
        country,
        user_type,
      })

      if (res.data.status === "success") {
        // Auto-login is optional based on API behavior
        if (res.data.user) {
          const userData = res.data.user || {}
          const normalizedUser = {
            id: userData.user_id || userData.id || "",
            name: userData.name || "",
            email: userData.email || "",
            phone: userData.phone || "",
            address: userData.address || "",
            country: userData.country || "",
            user_type: userData.user_type || "user",
            avatar: userData.avatar || "",
          }
          
          setUser(normalizedUser)
          // Only store user data if auto-login is enabled
          // sessionStorage.setItem("user", JSON.stringify(normalizedUser))
          // sessionStorage.setItem("token", res.data.token)
        }
        return { success: true, message: res.data.message || "Registration successful!" }
      }
      return { success: false, message: res.data.message || "Registration failed" }
    } catch (err: any) {
      console.error("Registration error:", err)
      return {
        success: false,
        message: err.response?.data?.message || "Registration failed. Please check your information and try again.",
      }
    } finally {
      setIsLoading(false)
    }
  }

  // ────────────────────────────────────────────────────────────────
  // FORGET PASSWORD (send OTP)
  // ────────────────────────────────────────────────────────────────
  const forgetPassword = async (email: string) => {
    setIsLoading(true)
    try {
      const res = await axios.post(
        AUTH_API.forgetPassword,
        { email },
        { headers: { "Content-Type": "application/json" } }
      )

      return res.data.status === "success"
        ? { success: true, message: res.data.message || "OTP sent successfully. Please check your email." }
        : { success: false, message: res.data.message || "Failed to send OTP." }
    } catch (err: any) {
      console.error("Password reset error:", err)
      return {
        success: false,
        message: err.response?.data?.message || "Failed to send OTP. Please check your email and try again.",
      }
    } finally {
      setIsLoading(false)
    }
  }

  // ────────────────────────────────────────────────────────────────
  // VERIFY OTP & RESET PASSWORD
  // ────────────────────────────────────────────────────────────────
  const verifyOtp = async (email: string, otp: string, newPassword: string) => {
    setIsLoading(true)
    try {
      const res = await axios.post(
        AUTH_API.verifyOtp,
        { email, otp, newPassword },
        { headers: { "Content-Type": "application/json" } }
      )

      return res.data.status === "success"
        ? { success: true, message: res.data.message || "Password reset successful. You can now login with your new password." }
        : { success: false, message: res.data.message || "OTP verification failed." }
    } catch (err: any) {
      console.error("OTP verification error:", err)
      return {
        success: false,
        message: err.response?.data?.message || "OTP verification failed. Please try again.",
      }
    } finally {
      setIsLoading(false)
    }
  }

  // ────────────────────────────────────────────────────────────────
  // LOGOUT
  // ────────────────────────────────────────────────────────────────
  const logout = async () => {
    setIsLoading(true)
    try {
      const token = sessionStorage.getItem("token")
      if (token) {
        await axios.post(
          AUTH_API.logout,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )
      }
    } catch (error) {
      console.error("Logout error:", error)
      // Continue with client-side logout even if server logout fails
    } finally {
      setUser(null)
      sessionStorage.removeItem("user")
      sessionStorage.removeItem("token")
      // Safely remove cart data if localStorage is available
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem("cart")
      }
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, forgetPassword, verifyOtp, logout, isInitialized }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ────────────────────────────────────────────────────────────────
// Custom hook to consume the AuthContext
// ────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
