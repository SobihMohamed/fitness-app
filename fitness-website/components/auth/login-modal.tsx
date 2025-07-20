
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
import { Eye, EyeOff, Mail, Lock, User, Loader2, CheckCircle, AlertCircle } from "lucide-react"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

// ==========================
// Component: LoginModal
// ==========================
export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login, register, forgetPassword, verifyOtp } = useAuth()
  const [activeTab, setActiveTab] = useState("login")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Individual loading states for each operation
  const [loginLoading, setLoginLoading] = useState(false)
  const [registerLoading, setRegisterLoading] = useState(false)
  const [forgetPasswordLoading, setForgetPasswordLoading] = useState(false)
  const [verifyOtpLoading, setVerifyOtpLoading] = useState(false)

  // Password reset flow state
  const [resetStep, setResetStep] = useState<"email" | "otp">("email")
  const [resetEmail, setResetEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")

  const initialRegisterData = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    country: "",
    user_type: "",
  }

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })

  const [registerData, setRegisterData] = useState(initialRegisterData)
  console.log("Register Data before:", registerData);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const validatePassword = (password: string) => {
    return password.length >= 6
  }

  // ==========================
  // Handler: Login
  // ==========================
  // This function handles user login with email and password
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!validateEmail(loginData.email)) {
      setMessage({ type: "error", text: "Please enter a valid email address" })
      return
    }

    if (!validatePassword(loginData.password)) {
      setMessage({ type: "error", text: "Password must be at least 6 characters long" })
      return
    }

    setLoginLoading(true)
    try {
      const result = await login(loginData.email, loginData.password)

      if (result.success) {
        setMessage({ type: "success", text: result.message })
        setTimeout(() => {
          onClose()
          setLoginData({ email: "", password: "" })
          setMessage(null)
        }, 1500)
      } else {
        setMessage({ type: "error", text: result.message })
      }
    } catch (error: any) {
      console.error("Login error:", error)
      setMessage({ type: "error", text: "An unexpected error occurred" })
    } finally {
      setLoginLoading(false)
    }
  }

  // ==========================
  // Handler: Register
  // ==========================
  // This function registers a new user with the provided data
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    console.log("Register Data:", registerData);
    
    if (!registerData.name.trim()) {
      setMessage({ type: "error", text: "Please enter your name" })
      return
    }

    if (!validateEmail(registerData.email)) {
      setMessage({ type: "error", text: "Please enter a valid email address" })
      return
    }

    if (!validatePassword(registerData.password)) {
      setMessage({ type: "error", text: "Password must be at least 6 characters long" })
      return
    }

    if (registerData.password !== registerData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" })
      return
    }

    if (!registerData.user_type) {
      setMessage({ type: "error", text: "Please select a user type" })
      return
    }

    setRegisterLoading(true)
    try {
      const response = await register(
        registerData.name,
        registerData.email,
        registerData.password,
        // registerData.confirmPassword,
        registerData.phone,
        registerData.address,
        registerData.country,
        registerData.user_type,
      )
      console.log("Register Response after :", response);

      if (response.success) {
        setMessage({ type: "success", text: response.message })
        setTimeout(() => {
          onClose()
          setRegisterData(initialRegisterData)
          setMessage(null)
        }, 1500)
      } else {
        setMessage({ type: "error", text: response.message })
      }
    } catch (error: any) {
      console.error("Registration error:", error)
      setMessage({ type: "error", text: "An unexpected error occurred" })
    } finally {
      setRegisterLoading(false)
    }


  }

  // ==========================
  // Handler: Forget Password
  // ==========================
  // This function sends an OTP to the user's email for password reset

  const handleForgetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!validateEmail(resetEmail)) {
      setMessage({ type: "error", text: "Please enter a valid email address" })
      return
    }

    setForgetPasswordLoading(true)
    try {
      const result = await forgetPassword(resetEmail)
      if (result.success) {
        setMessage({ type: "success", text: result.message })
        setResetStep("otp")
      } else {
        setMessage({ type: "error", text: result.message })
      }
    } catch (error: any) {
      console.error("Forget password error:", error)
      setMessage({ type: "error", text: "An unexpected error occurred" })
    } finally {
      setForgetPasswordLoading(false)
    }
  }

  // ==========================
  // Handler: Verify OTP
  // ==========================
  // This function verifies the OTP and resets the password
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!otp.trim()) {
      setMessage({ type: "error", text: "Please enter the OTP" })
      return
    }

    if (!validatePassword(newPassword)) {
      setMessage({ type: "error", text: "New password must be at least 6 characters long" })
      return
    }

    if (newPassword !== confirmNewPassword) {
      setMessage({ type: "error", text: "New passwords do not match" })
      return
    }

    setVerifyOtpLoading(true)
    try {
      const result = await verifyOtp(resetEmail, otp, newPassword)
      if (result.success) {
        setMessage({ type: "success", text: result.message })
        setTimeout(() => {
          handleClose()
          setActiveTab("login")
        }, 1500)
      } else {
        setMessage({ type: "error", text: result.message })
      }
    } catch (error: any) {
      console.error("OTP verification error:", error)
      setMessage({ type: "error", text: "An unexpected error occurred" })
    } finally {
      setVerifyOtpLoading(false)
    }
  }

  // ==========================
  // Handler: Tab Change
  // ==========================
  // This function resets the form data and message when switching tabs
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setMessage(null)
    setLoginData({ email: "", password: "" })
    setRegisterData(initialRegisterData)
    setResetStep("email")
    setResetEmail("")
    setOtp("")
    setNewPassword("")
    setConfirmNewPassword("")
  }

    // ==========================
  // Handler: Close Dialog
  // ==========================
  // This function resets all form data and message when closing the dialog
  const handleClose = () => {
    setMessage(null)
    setLoginData({ email: "", password: "" })
    setRegisterData(initialRegisterData)
    setResetStep("email")
    setResetEmail("")
    setOtp("")
    setNewPassword("")
    setConfirmNewPassword("")
    onClose()
  }
 
  // ==========================
  //jsx section 
  // ==========================

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="md:max-w-xl">
        <DialogHeader>
          <DialogTitle>Welcome to FitPro</DialogTitle>
          <DialogDescription>Sign in to your account or create a new one to get started</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="register">Sign Up</TabsTrigger>
            <TabsTrigger value="forgot-password">Reset Password</TabsTrigger>
          </TabsList>

          {message && (
            <Alert className={message.type === "error" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
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

              <Button type="submit" className="w-full" disabled={loginLoading}>
                {loginLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
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
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <form onSubmit={handleRegister} className="space-y-4">
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
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-phone">Phone</Label>
                <Input
                  id="register-phone"
                  type="text"
                  placeholder="Enter your phone"
                  value={registerData.phone}
                  onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-address">Address</Label>
                <Input
                  id="register-address"
                  type="text"
                  placeholder="Enter your address"
                  value={registerData.address}
                  onChange={(e) => setRegisterData({ ...registerData, address: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-country">Country</Label>
                <Input
                  id="register-country"
                  type="text"
                  placeholder="Enter your country"
                  value={registerData.country}
                  onChange={(e) => setRegisterData({ ...registerData, country: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-user-type">User Type</Label>
                <select
                  id="register-user-type"
                  value={registerData.user_type}
                  onChange={(e) => setRegisterData({ ...registerData, user_type: e.target.value })}
                  required
                  className="w-full rounded-md border border-gray-300 p-2"
                >
                  <option value="">Select user type</option>
                  <option value="Coach">Coach</option>
                  <option value="Trainee">Trainee</option>
                </select>
              </div>

              <Button type="submit" className="w-full" disabled={registerLoading}>
                {registerLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="forgot-password">
            {resetStep === "email" && (
              <form onSubmit={handleForgetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="Enter your registered email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={forgetPasswordLoading}>
                  {forgetPasswordLoading ? (
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
                  onClick={() => setActiveTab("login")}
                >
                  Back to Sign In
                </Button>
              </form>
            )}

            {resetStep === "otp" && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">OTP</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter the OTP sent to your email"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
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
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={verifyOtpLoading}>
                  {verifyOtpLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting Password...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>

                <Button
                  type="button"
                  variant="link"
                  className="w-full text-sm text-blue-600 hover:underline"
                  onClick={() => setResetStep("email")}
                >
                  Change Email
                </Button>
              </form>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
