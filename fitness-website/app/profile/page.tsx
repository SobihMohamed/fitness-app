"use client"

import type React from "react"
import { useEffect, useState } from "react"
import axios from "axios"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { User, Mail, Phone, MapPin, Globe, UserCheck, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

// ────────────────────────────────────────────────────────────────
// 📋 TYPE DEFINITIONS
// ────────────────────────────────────────────────────────────────
interface ProfileData {
  name: string
  email: string
  phone: string
  address: string
  country: string
  user_type: string
}

// ────────────────────────────────────────────────────────────────
// 🏠 MAIN PROFILE COMPONENT
// ────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  // ────────────────────────────────────────────────────────────────
  // 🔧 HOOKS & STATE MANAGEMENT
  // ────────────────────────────────────────────────────────────────
  const { user, isLoading, isInitialized } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

  // ────────────────────────────────────────────────────────────────
  // 📡 DATA FETCHING LOGIC
  // ────────────────────────────────────────────────────────────────
  useEffect(() => {
    // Wait for auth to initialize
    if (!isInitialized) return

    // Redirect if not logged in
    if (!user) {
      router.push("/")
      return
    }

    // Load profile data function
    const loadProfile = async () => {
      try {
        const token = sessionStorage.getItem("token")

        if (!token) {
          throw new Error("No authentication token found")
        }

        const response = await axios.get(`${baseURL}/user/getProfile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        // Handle different possible response structures
        let profileData = response.data

        // If the response has a nested structure, extract the user data
        if (response.data.user) {
          profileData = response.data.user
        } else if (response.data.data) {
          profileData = response.data.data
        }

        // Set the profile data from the API response
        const newProfile = {
          name: profileData.name || "",
          email: profileData.email || "",
          phone: profileData.phone || "",
          address: profileData.address || "",
          country: profileData.country || "",
          user_type: profileData.user_type || "",
        }

        setProfile(newProfile)
      } catch (error: any) {
        console.error("Failed to load profile from API:", error)

        // If API fails, use user data from auth context as fallback
        if (user) {
          const fallbackProfile = {
            name: user.name || "",
            email: user.email || "",
            phone: user.phone || "",
            address: user.address || "",
            country: user.country || "",
            user_type: user.user_type || "",
          }

          setProfile(fallbackProfile)
          setMessage({
            type: "error",
            text: "Failed to load profile from server, showing cached data",
          })
        } else {
          setMessage({
            type: "error",
            text: "Failed to load profile data",
          })
        }
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user, router, baseURL, isInitialized])

  // ────────────────────────────────────────────────────────────────
  // 🎯 EVENT HANDLERS
  // ────────────────────────────────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!profile) return

    const updatedProfile = { ...profile, [e.target.name]: e.target.value }
    setProfile(updatedProfile)

    // Clear any existing messages when user starts editing
    if (message) setMessage(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setUpdating(true)
    setMessage(null)

    try {
      const token = sessionStorage.getItem("token")

      if (!token) {
        throw new Error("No authentication token found")
      }

      // Prepare data for update (exclude email and user_type as they're read-only)
      const updateData = {
        name: profile.name,
        phone: profile.phone,
        address: profile.address,
        country: profile.country,
      }

      await axios.post(`${baseURL}/user/updateProfile`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      setMessage({ type: "success", text: "Profile updated successfully!" })
    } catch (error: any) {
      console.error("Error updating profile:", error)
      const errorMessage = error.response?.data?.message || "Error updating profile. Please try again."
      setMessage({ type: "error", text: errorMessage })
    } finally {
      setUpdating(false)
    }
  }

  // ────────────────────────────────────────────────────────────────
  // 🔄 LOADING STATES
  // ────────────────────────────────────────────────────────────────
  if (!isInitialized || isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading profile...</span>
        </div>
      </div>
    )
  }

  // ────────────────────────────────────────────────────────────────
  // ❌ ERROR STATE
  // ────────────────────────────────────────────────────────────────
  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Profile Not Found</h2>
              <p className="text-gray-600 mb-4">Unable to load your profile data.</p>
              <Button onClick={() => router.push("/dashboard")} variant="outline">
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ────────────────────────────────────────────────────────────────
  // 🎨 MAIN RENDER
  // ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ────────────────────────────────────────────────────────────────
            📄 PAGE HEADER
            ──────────────────────────────────────────────────────────────── */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
        </div>

        {/* ────────────────────────────────────────────────────────────────
            🚨 ALERT MESSAGES
            ──────────────────────────────────────────────────────────────── */}
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

        {/* ────────────────────────────────────────────────────────────────
            📝 PROFILE FORM
            ──────────────────────────────────────────────────────────────── */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-600" />
              <span>Personal Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ────────────────────────────────────────────────────────────────
                  📋 FORM FIELDS GRID
                  ──────────────────────────────────────────────────────────────── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Full Name *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={profile.name}
                      onChange={handleChange}
                      className="pl-10"
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
                      value={profile.email}
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
                      value={profile.phone}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="Enter your phone number"
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
                      value={profile.user_type}
                      className="pl-10 bg-gray-50 capitalize"
                      readOnly
                      disabled
                    />
                  </div>
                  <p className="text-xs text-gray-500">User type cannot be changed</p>
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
                      value={profile.address}
                      onChange={handleChange}
                      className="pl-10"
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
                      value={profile.country}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="Enter your country"
                    />
                  </div>
                </div>
              </div>

              {/* ────────────────────────────────────────────────────────────────
                  🎯 ACTION BUTTONS
                  ──────────────────────────────────────────────────────────────── */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updating} className="bg-blue-600 hover:bg-blue-700">
                  {updating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
