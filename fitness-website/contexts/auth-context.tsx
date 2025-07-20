
"use client"

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react"
import axios from "axios"
// ────────────────────────────────────────────────────────────────
// 0) Base URL for your API

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

// ────────────────────────────────────────────────────────────────
// 1) Shape of user data (returned from your API)
// ────────────────────────────────────────────────────────────────
interface User {
  avatar: string
  id: string
  name: string
  email: string
  role: "user" | "admin"
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
    // confirmPassword: string,
    phone: string,
    address: string,
    country: string,
    user_type: string
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
      if (storedUser ) {
        setUser(JSON.parse(storedUser))
      }
    } catch (error) {
     
      sessionStorage.removeItem("user")
      sessionStorage.removeItem("token")
      console.error("Error initializing auth from sessionStorage:", error)
    } finally {
      
      setIsInitialized(true)
    }
  }

  initializeAuth()
}, [])

  // ────────────────────────────────────────────────────────────────
  // LOGIN
  // ────────────────────────────────────────────────────────────────
  const login = async (email: string, password: string) => {
    try {
      console.log(`Logging in with email: ${email} and password: ${password}`);

      const res = await axios.post(
        `${baseURL}/auth/login`,
        { email, password },
        { 
          // withCredentials: true,  // Important for session handling
          headers: { "Content-Type": "application/json" }
         } 
        )
        console.log(res)
      if (res.data.status === "success") {
        setUser(res.data.user) // Set user in context
        sessionStorage.setItem("user", JSON.stringify(res.data.user))
        sessionStorage.setItem("token", res.data.token) // Store token if needed
        return { success: true, message: res.data.message }
      }
      console.log("Login successful:", res.data.message)
      console.log("Login failed:", res.data.message)
      return { success: false, message: res.data.message }
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || "Login failed." }
    }
  }

  // ────────────────────────────────────────────────────────────────
  // REGISTER
  // ────────────────────────────────────────────────────────────────
  // Note: confirmPassword is commented out as it is not used in the current implementation
   const register = async (
    name: string,
    email: string,
    password: string,
    // confirmPassword: string,
    phone: string,
    address: string,
    country: string,
    user_type: string, 
  ) => {
    try {
      const res = await axios.post(`${baseURL}/auth/register`, {
        name,
        email,
        password,
        // confirmPassword,
        phone,
        address,
        country,
        user_type,
      })

      if (res.data.status === "success") {
        // Optionally auto-login after registration
        if (res.data.user) {
          setUser(res.data.user)
          // sessionStorage.setItem("user", JSON.stringify(res.data.user))
          // sessionStorage.setItem("token", res.data.token)
        }
        return { success: true, message: res.data.message || "Registration successful!" }
      }

      return { success: false, message: res.data.message || "Registration failed" }
    } catch (err: any) {
      console.error("Registration error:", err)
      return {
        success: false,
        message: err.response?.data?.message || "Registration failed. Please try again.",
      }
    }
  }

  // ────────────────────────────────────────────────────────────────
  // FORGET PASSWORD (send OTP)
  // ────────────────────────────────────────────────────────────────
  const forgetPassword = async (email: string) => {
    try {
      const res = await axios.post(
        `${baseURL}/auth/forgetPassword`,
        { email },
        // { withCredentials: true }
      )
      return res.data.status === "success"
        ? { success: true, message: res.data.message }
        : { success: false, message: res.data.message }
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to send OTP.",
      }
    }
  }

  // ────────────────────────────────────────────────────────────────
  // VERIFY OTP & RESET PASSWORD
  // ────────────────────────────────────────────────────────────────
  const verifyOtp = async (email: string, otp: string, newPassword: string) => {
    try {
      const res = await axios.post(
        `${baseURL}/auth/verifyOtpAndUpdatePassword`,
        { email, otp, newPassword },
        // { withCredentials: true }
      )
      return res.data.status === "success"
        ? { success: true, message: res.data.message }
        : { success: false, message: res.data.message }
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || "OTP verification failed.",
      }
    }
  }

  // ────────────────────────────────────────────────────────────────
  // LOGOUT
  // ────────────────────────────────────────────────────────────────
   const logout = async () => {
    setIsLoading(true)
    try {
      await axios.post("/auth/logout")
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setUser(null)
      sessionStorage.removeItem("user")
      sessionStorage.removeItem("token")
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, forgetPassword, verifyOtp, logout,isInitialized }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ────────────────────────────────────────────────────────────────
// Custom hook to consume the AuthContext
// ────────────────────────────────────────────────────────────────
export  function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
