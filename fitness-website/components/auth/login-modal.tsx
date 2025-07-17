"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { Eye, EyeOff, Mail, Lock, User, Loader2 } from "lucide-react"
import axios from "axios"

// LoginModal component
// This component provides a modal for users to log in or register.
// It includes form validation, API requests for login and registration,
// and displays success or error messages based on the API response.
interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  // const { login, register } = useAuth()
  const [activeTab, setActiveTab] = useState("login")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";//"http://localhost/fitness-api-php/public"
console.log("API baseURL:", baseURL);



  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })

  // Register form state
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  // Validate email format 
  // This function checks if the email is in a valid format using a regular expression
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  // Validate password length
  // This function checks if the password meets the minimum length requirement
  const validatePassword = (password: string) => {
    return password.length >= 6
  }

  // Handle login
  // This function handles the login process when the user submits the login form.
  // It validates the input data, makes an API request to log in the user,
  // and handles the response to display appropriate messages.
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)


    // Validate login data
    // This function checks if the email is in a valid format
    if (!validateEmail(loginData.email)) {
      setMessage({ type: "error", text: "Please enter a valid email address" })
      setIsLoading(false)
      return
    }
    // Validate password length
    // This function checks if the password meets the minimum length requirement
    if (!validatePassword(loginData.password)) {
      setMessage({ type: "error", text: "Password must be at least 6 characters long" })
      setIsLoading(false)
      return
    }

    // Make API request to login
    // Adjust the API endpoint and request body as per your backend implementation 
    try {
      const response = await axios.post(`${baseURL}/auth/login`,{
        email:loginData.email,
        password:loginData.password
      },{
        headers:{
          "Content-Type": "application/json"
        }
      }
    )
     
    // Handle response
      // Assuming the API returns a status field in the response
      // and a message field for success or error messages
      // Adjust based on your actual API response structure\
      if (response.data.status === "success") {
        setMessage({ type: "success", text: response.data.message })
        setTimeout(() => {
          onClose()
          setLoginData({ email: "", password: "" })
          setMessage(null)
        }, 1500)
      } else {
        setMessage({ type: "error", text: response.data.message })
      }
    } catch (error: any) {
      console.log("Register response:", error.response.data)

      if (error.response && error.response.data) {
        console.log("Register response:", error.response.data)
        setMessage({ type: "error", text: error.response.data.message });
      } else {
        console.log("Register response:", error.response.data)
        setMessage({ type: "error", text: "Unexpected error occurred" });
      }
    } finally {
      setIsLoading(false)
    }
  }
  // Handle registration
  // This function handles the registration process when the user submits the registration form.
  // It validates the input data, makes an API request to register the user,
  // and handles the response to display appropriate messages.
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    // Validate registration data

    if (!registerData.name.trim()) {
      setMessage({ type: "error", text: "Please enter your name" })
      setIsLoading(false)
      return
    }
    // Validate email format
    if (!validateEmail(registerData.email)) {
      setMessage({ type: "error", text: "Please enter a valid email address" })
      setIsLoading(false)
      return
    }
    // Validate password length
    if (!validatePassword(registerData.password)) {
      setMessage({ type: "error", text: "Password must be at least 6 characters long" })
      setIsLoading(false)
      return
    }
    // Check if passwords match
    if (registerData.password !== registerData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" })
      setIsLoading(false)
      return
    }

    // Make API request to register
    // Adjust the API endpoint and request body as per your backend implementation
    
    try {
      const response = await axios.post(`${baseURL}/auth/register`, {
          name: registerData.name,
          email: registerData.email,
          password: registerData.password
        }, {
          headers: {
            "Content-Type": "application/json"
          }
        });
      // Handle response
      // Assuming the API returns a status field in the response
      // and a message field for success or error messages
      // Adjust based on your actual API response structure
      if(response.data.status === "success"){
        console.log(response.data)
        setMessage({ type: "success", text: response.data.message })
        setTimeout(() => {
          onClose()
          setRegisterData({ name: "", email: "", password: "", confirmPassword: "" })
          setMessage(null)
        }, 1500)
      } else {
        setMessage({ type: "error", text: response.data.message })
      }
    }
      // Handle errors
      // This block catches any errors that occur during the API request
      // and sets an error message based on the response
      catch (error: any) {
         if (error.response && error.response.data && error.response.data.message) {
              setMessage({ type: "error", text: error.response.data.message });
  }     else {
              setMessage({ type: "error", text: "Unexpected error occurred" });
  }
}
    finally {
      setIsLoading(false)
    }
} 

//----------------------------------------------------
  // Handle tab change
  // Reset form data and message when switching tabs
  // This ensures that when a user switches from login to register or vice versa, the form is reset
  // and any previous messages are cleared
  // This is important for a good user experience, preventing confusion from previous form states
  // and messages persisting when they shouldn't.
  // This function is called when the user clicks on a tab to switch between login and register forms
  // It updates the active tab state and resets the form data and message state.
  // This ensures that the form is always in a clean state when switching tabs.
  // It also clears any previous messages to avoid confusion.
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setMessage(null)
    setLoginData({ email: "", password: "" })
    setRegisterData({ name: "", email: "", password: "", confirmPassword: "" })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to FitPro</DialogTitle>
          <DialogDescription>Sign in to your account or create a new one to get started</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="register">Sign Up</TabsTrigger>
             <TabsTrigger value="forgot-password">Reset Password</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="Enter your email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {message && (
                <Alert
                  className={message.type === "error" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}
                >
                  <AlertDescription className={message.type === "error" ? "text-red-800" : "text-green-800"}>
                    {message.text}
                  </AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
               <Button
                type="button"
                variant="link"
                className="w-full text-sm text-blue-600 hover:underline"
                onClick={() => setActiveTab("forgot-password")}
              >
                Forgot Password?
              </Button>
            </form>

            <div className="text-sm text-gray-600 space-y-2">
              {/* <p>
                <strong>Demo Accounts:</strong>
              </p>
              <p>User: demo@fitpro.com / demo123</p>
              <p>Admin: admin@fitpro.com / admin123</p> */}
            </div>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <form method="POST"  onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="Enter your email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="register-confirm-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {message && (
                <Alert
                  className={message.type === "error" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}
                >
                  <AlertDescription className={message.type === "error" ? "text-red-800" : "text-green-800"}>
                    {message.text}
                  </AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </TabsContent>
            <TabsContent value="forgot-password">
            {/* {resetStep === "email" && (
            )
              onSubmit={handleForgotPasswordRequest} */}
              <form  className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="Enter your registered email"
                      // value={resetEmail}
                      // onChange={(e) => setResetEmail(e.target.value)}
                      className="pl-10"
                      required
                      />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading} style={{ backgroundColor: "#007BFF" }}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    "Send OTP"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="link"
                  className="w-full text-sm text-blue-600 hover:underline"
                  onClick={() => {
                    // setActiveTab("login")
                    // setError("")
                    // setSuccess("")
                    // setResetEmail("")
                  }}
                >
                  Back to Sign In
                </Button>
              </form>
            

            {/* {resetStep === "otp" && (
              onSubmit={handleVerifyOtp} */}
              <form  className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">OTP</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter the OTP sent to your email"
                      // value={otp}
                      // onChange={(e) => setOtp(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading} style={{ backgroundColor: "#007BFF" }}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying OTP...
                    </>
                  ) : (
                    "Verify OTP"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="link"
                  className="w-full text-sm text-blue-600 hover:underline"
                  onClick={() => {
                    // setResetStep("email")
                    // setError("")
                    // setSuccess("")
                    // setOtp("")
                  }}
                >
                  Resend OTP / Change Email
                </Button>
              </form>
            

            {/* {resetStep === "new-password" && (
              //onSubmit={handleResetPassword} */}
              <form  className="space-y-4"> 
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      // value={newPassword}
                      // onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirm-new-password"
                      // type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      // value={confirmNewPassword}
                      // onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                     // onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                     {/* {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )} */}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading} style={{ backgroundColor: "#007BFF" }}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting Password...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </form>
            
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
