"use client";

import type React from "react";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/auth-context";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Loader2,
  CheckCircle,
  AlertCircle,
  Phone,
  MapPin,
  Globe,
} from "lucide-react";

// A simple component for social login buttons for better reusability
const SocialLogins = () => (
  <>
    <div className="relative my-4">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-slate-50 px-2 text-muted-foreground">
          OR CONTINUE WITH
        </span>
      </div>
    </div>
    <div className="grid grid-cols-1 gap-2">
      <Button variant="outline" type="button">
        <svg
          className="mr-2 h-4 w-4"
          aria-hidden="true"
          focusable="false"
          data-prefix="fab"
          data-icon="google"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 488 512"
        >
          <path
            fill="currentColor"
            d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 62.3l-66.5 64.6C305.5 114.6 277.9 104 248 104c-83.8 0-152.3 68.5-152.3 152s68.5 152 152.3 152c97.2 0 130.3-72.2 134.6-110.3H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"
          ></path>
        </svg>
        Continue with Google
      </Button>
    </div>
  </>
);

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login, register, forgetPassword, verifyOtp } = useAuth();
  const [activeTab, setActiveTab] = useState("login"); // ✅ الحالة الابتدائية الصحيحة
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [registerStep, setRegisterStep] = useState(1);
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [forgetPasswordLoading, setForgetPasswordLoading] = useState(false);
  const [verifyOtpLoading, setVerifyOtpLoading] = useState(false);
  const [resetStep, setResetStep] = useState<"email" | "otp">("email");
  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const initialRegisterData = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    country: "",
    user_type: "",
  };
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState(initialRegisterData);

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password: string) => password.length >= 8;

  const handleClose = useCallback(() => {
    setMessage(null);
    setLoginData({ email: "", password: "" });
    setRegisterData(initialRegisterData);
    setRegisterStep(1);
    setResetStep("email");
    setResetEmail("");
    setOtp("");
    setNewPassword("");
    setConfirmNewPassword("");
    onClose();
  }, [onClose, initialRegisterData]);

  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setMessage(null);
      if (!validateEmail(loginData.email)) {
        setMessage({ type: "error", text: "Please enter a valid email." });
        return;
      }
      if (!validatePassword(loginData.password)) {
        setMessage({
          type: "error",
          text: "Password must be at least 8 characters.",
        });
        return;
      }
      setLoginLoading(true);
      try {
        const result = await login(loginData.email, loginData.password);
        if (result.success) {
          setMessage({ type: "success", text: result.message });
          setTimeout(() => handleClose(), 1500);
        } else {
          setMessage({ type: "error", text: result.message });
        }
      } catch (error: any) {
        setMessage({ type: "error", text: "An unexpected error occurred." });
      } finally {
        setLoginLoading(false);
      }
    },
    [loginData, login, handleClose]
  );

  const handleRegister = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setMessage(null);
      if (registerData.password !== registerData.confirmPassword) {
        setMessage({ type: "error", text: "Passwords do not match." });
        return;
      }
      setRegisterLoading(true);
      try {
        const response = await register(
          registerData.name,
          registerData.email,
          registerData.password,
          registerData.phone,
          registerData.address,
          registerData.country,
          registerData.user_type
        );
        if (response.success) {
          setMessage({
            type: "success",
            text: "Account created successfully! Redirecting...",
          });
          setTimeout(() => handleClose(), 1500);
        } else {
          setMessage({ type: "error", text: response.message });
        }
      } catch (error: any) {
        setMessage({ type: "error", text: "An unexpected error occurred." });
      } finally {
        setRegisterLoading(false);
      }
    },
    [registerData, register, handleClose]
  );

  const handleRegistrationContinue = () => {
    setMessage(null);
    if (!registerData.name.trim()) {
      setMessage({ type: "error", text: "Please enter your name." });
      return;
    }
    if (!validateEmail(registerData.email)) {
      setMessage({ type: "error", text: "Please enter a valid email." });
      return;
    }
    if (!validatePassword(registerData.password)) {
      setMessage({
        type: "error",
        text: "Password must be at least 8 characters.",
      });
      return;
    }
    if (registerData.password !== registerData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }
    if (!registerData.user_type) {
      setMessage({ type: "error", text: "Please select a user type." });
      return;
    }
    setRegisterStep(2);
  };

  const handleForgetPassword = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setMessage(null);
      if (!validateEmail(resetEmail)) {
        setMessage({ type: "error", text: "Please enter a valid email." });
        return;
      }
      setForgetPasswordLoading(true);
      try {
        const result = await forgetPassword(resetEmail);
        if (result.success) {
          setMessage({ type: "success", text: result.message });
          setResetStep("otp");
        } else {
          setMessage({ type: "error", text: result.message });
        }
      } catch (error: any) {
        setMessage({ type: "error", text: "An unexpected error occurred." });
      } finally {
        setForgetPasswordLoading(false);
      }
    },
    [resetEmail, forgetPassword]
  );

  const handleVerifyOtp = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setMessage(null);
      if (!otp.trim() || otp.length < 6) {
        setMessage({ type: "error", text: "Please enter a valid OTP." });
        return;
      }
      if (!validatePassword(newPassword)) {
        setMessage({
          type: "error",
          text: "New password must be at least 8 characters.",
        });
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setMessage({ type: "error", text: "New passwords do not match." });
        return;
      }
      setVerifyOtpLoading(true);
      try {
        const result = await verifyOtp(resetEmail, otp, newPassword);
        if (result.success) {
          setMessage({ type: "success", text: result.message });
          setTimeout(() => {
            handleClose();
            setActiveTab("login");
          }, 1500);
        } else {
          setMessage({ type: "error", text: result.message });
        }
      } catch (error: any) {
        setMessage({ type: "error", text: "An unexpected error occurred." });
      } finally {
        setVerifyOtpLoading(false);
      }
    },
    [otp, newPassword, confirmNewPassword, resetEmail, verifyOtp, handleClose]
  );

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
    setMessage(null);
    setRegisterStep(1);
    setResetStep("email");
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="md:max-w-md sm:max-w-[90%] max-h-[95vh] overflow-y-auto p-0 bg-slate-50">
        <div className="p-6">
          <DialogHeader className="text-center mb-4">
            <DialogTitle className="text-3xl font-extrabold text-gray-900">
              {activeTab === "login" && "Welcome Back!"}
              {activeTab === "register" && "Create Your Account"}
              {activeTab === "forgot-password" && "Reset Password"}
            </DialogTitle>
            <DialogDescription className="text-gray-500 mt-2">
              {activeTab === "login" &&
                "Sign in to continue your fitness journey."}
              {activeTab === "register" &&
                "Join FitPro and start achieving your goals."}
              {activeTab === "forgot-password" &&
                "Enter your email to receive a reset code."}
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            {/* ✅ FIX: Corrected the values to be consistent */}
            <TabsList className="grid w-full grid-cols-3 bg-slate-200/60 rounded-lg p-1">
              <TabsTrigger
                value="login"
                className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-slate-900 font-semibold text-slate-600 transition-all duration-200"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-slate-900 font-semibold text-slate-600 transition-all duration-200"
              >
                Sign Up
              </TabsTrigger>
              <TabsTrigger
                value="forgot-password"
                className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-slate-900 font-semibold text-slate-600 transition-all duration-200"
              >
                Reset
              </TabsTrigger>
            </TabsList>

            {message && (
              <div className="mt-4">
                <Alert
                  variant={message.type === "error" ? "destructive" : "default"}
                  className={
                    message.type === "success"
                      ? "bg-green-50 border-green-200"
                      : ""
                  }
                >
                  {message.type === "error" ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                  <AlertDescription
                    className={
                      message.type === "success" ? "text-green-800" : ""
                    }
                  >
                    {message.text}
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* ✅ FIX: `value` now matches the trigger value "login" */}
            <TabsContent value="login" className="pt-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={loginData.email}
                      onChange={(e) =>
                        setLoginData({ ...loginData, email: e.target.value })
                      }
                      className="pl-10 h-11"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) =>
                        setLoginData({ ...loginData, password: e.target.value })
                      }
                      className="pl-10 pr-10 h-11"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all duration-300 shadow-lg hover:shadow-xl"
                  disabled={loginLoading}
                >
                  {loginLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Signing
                      In...
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
                <SocialLogins />
              </form>
            </TabsContent>

           
            <TabsContent value="register" className="pt-4">
              <form onSubmit={handleRegister} className="space-y-4">
                {registerStep === 1 && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <Label htmlFor="register-name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="register-name"
                          placeholder="John Doe"
                          value={registerData.name}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              name: e.target.value,
                            })
                          }
                          className="pl-10 h-11"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="register-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="you@example.com"
                          value={registerData.email}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              email: e.target.value,
                            })
                          }
                          className="pl-10 h-11"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="register-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            id="register-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={registerData.password}
                            onChange={(e) =>
                              setRegisterData({
                                ...registerData,
                                password: e.target.value,
                              })
                            }
                            className="pl-10 pr-10 h-11"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                          >
                            <Eye className="h-5 w-5 text-gray-400" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="register-confirm-password">
                          Confirm
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            id="register-confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={registerData.confirmPassword}
                            onChange={(e) =>
                              setRegisterData({
                                ...registerData,
                                confirmPassword: e.target.value,
                              })
                            }
                            className="pl-10 pr-10 h-11"
                            required
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                          >
                            <Eye className="h-5 w-5 text-gray-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="register-user-type">I am a...</Label>
                      <select
                        id="register-user-type"
                        value={registerData.user_type}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            user_type: e.target.value,
                          })
                        }
                        required
                        className="w-full rounded-md border border-gray-300 p-2 h-11 bg-white"
                      >
                        <option value="" disabled>
                          Select user type
                        </option>
                        <option value="Coach">Coach</option>
                        <option value="Trainee">Trainee</option>
                      </select>
                    </div>
                    <Button
                      type="button"
                      onClick={handleRegistrationContinue}
                      className="w-full h-11 text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                    >
                      Continue
                    </Button>
                    <SocialLogins />
                  </div>
                )}
                {registerStep === 2 && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <Label htmlFor="register-phone">
                        Phone Number (Optional)
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="register-phone"
                          type="tel"
                          placeholder="Your phone number"
                          value={registerData.phone}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              phone: e.target.value,
                            })
                          }
                          className="pl-10 h-11"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="register-country">
                        Country (Optional)
                      </Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="register-country"
                          placeholder="Your country"
                          value={registerData.country}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              country: e.target.value,
                            })
                          }
                          className="pl-10 h-11"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="register-address">
                        Address (Optional)
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="register-address"
                          placeholder="Your address"
                          value={registerData.address}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              address: e.target.value,
                            })
                          }
                          className="pl-10 h-11"
                        />
                      </div>
                    </div>
                    <div className="flex gap-4 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-11"
                        onClick={() => setRegisterStep(1)}
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className="w-full h-11 text-base font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                        disabled={registerLoading}
                      >
                        {registerLoading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                            Creating Account...
                          </>
                        ) : (
                          "Create Account"
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </TabsContent>

            <TabsContent value="forgot-password" className="pt-4">
              {resetStep === "email" && (
                <form onSubmit={handleForgetPassword} className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="reset-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="Enter your registered email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="pl-10 h-11"
                        required
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-11 text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                    disabled={forgetPasswordLoading}
                  >
                    {forgetPasswordLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                        Sending Code...
                      </>
                    ) : (
                      "Send Reset Code"
                    )}
                  </Button>
                </form>
              )}
              {resetStep === "otp" && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="otp">Verification Code (OTP)</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter the 6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="h-11 tracking-widest text-center"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="new-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pl-10 h-11"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="confirm-new-password">
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="confirm-new-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="pl-10 h-11"
                        required
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-11 text-base font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                    disabled={verifyOtpLoading}
                  >
                    {verifyOtpLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                        Resetting...
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </Button>
                </form>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
