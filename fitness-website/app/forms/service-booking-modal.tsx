"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  User,
  Target,
  Heart,
  Activity,
  MapPin,
  Phone,
  Mail,
  Dumbbell,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react"
import axios from "axios"
import { API_CONFIG } from "@/config/api"

interface ServiceBookingModalProps {
  isOpen: boolean
  onClose: () => void
  serviceName: string
  servicePrice: string
}

interface FormData {
  // Personal Information
  fullName: string
  age: string
  weight: string
  height: string
  country: string
  contactMethod: string

  // Training Goals & Schedule
  trainingGoal: string
  goalDescription: string
  trainingFrequency: string
  trainingPerWeek: string
  trainingLocation: string
  trainingPlace: string
  homeEquipment: string
  startDate: string
  endDate: string

  // Health & Medical Status
  hasInjuries: boolean
  injuryDetails: string
  takingMedication: boolean
  medicationDetails: string
  experiencesDizziness: boolean
  consultedDoctor: boolean
  medicalDetails: string
  diseasesDetails: string

  // Activity Level & Sports Experience
  currentWorkoutStatus: string
  workoutDescription: string
  jobDescription: string
  experiencesStress: string
  jobType: string
  eatsHealthy: string
  mealsPerDay: string
  sleepHours: string
  additionalInfo: string
  enjoyedExercises: string
}

// Simple toast replacement to avoid import issues
const showToast = {
  success: (message: string) => {
    console.log("✅ Success:", message)
    // You can replace this with your preferred toast library
  },
  error: (message: string) => {
    console.error("❌ Error:", message)
    // You can replace this with your preferred toast library
  },
}

export function ServiceBookingModal({ isOpen, onClose, serviceName, servicePrice }: ServiceBookingModalProps) {
  const [formData, setFormData] = useState<FormData>({
    // Personal Information
    fullName: "",
    age: "",
    weight: "",
    height: "",
    country: "",
    contactMethod: "",

    // Training Goals & Schedule
    trainingGoal: "",
    goalDescription: "",
    trainingFrequency: "",
    trainingPerWeek: "",
    trainingLocation: "",
    trainingPlace: "",
    homeEquipment: "",
    startDate: "",
    endDate: "",

    // Health & Medical Status
    hasInjuries: false,
    injuryDetails: "",
    takingMedication: false,
    medicationDetails: "",
    experiencesDizziness: false,
    consultedDoctor: false,
    medicalDetails: "",
    diseasesDetails: "",

    // Activity Level & Sports Experience
    currentWorkoutStatus: "",
    workoutDescription: "",
    jobDescription: "",
    experiencesStress: "",
    jobType: "",
    eatsHealthy: "",
    mealsPerDay: "",
    sleepHours: "",
    additionalInfo: "",
    enjoyedExercises: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Required fields validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required"
      showToast.error("Please fill in your full name")
    }
    if (!formData.age.trim()) {
      newErrors.age = "Age is required"
      showToast.error("Please fill in your age")
    }
    if (!formData.weight.trim()) {
      newErrors.weight = "Weight is required"
      showToast.error("Please fill in your weight")
    }
    if (!formData.height.trim()) {
      newErrors.height = "Height is required"
      showToast.error("Please fill in your height")
    }
    if (!formData.country.trim()) {
      newErrors.country = "Country is required"
      showToast.error("Please fill in your country")
    }
    if (!formData.contactMethod) {
      newErrors.contactMethod = "Contact method is required"
      showToast.error("Please select a contact method")
    }
    if (!formData.trainingGoal.trim()) {
      newErrors.trainingGoal = "Training goal is required"
      showToast.error("Please describe your training goals")
    }
    if (!formData.trainingFrequency) {
      newErrors.trainingFrequency = "Training frequency is required"
      showToast.error("Please specify training frequency")
    }
    if (!formData.trainingLocation) {
      newErrors.trainingLocation = "Training location is required"
      showToast.error("Please select training location")
    }
    if (!formData.startDate) {
      newErrors.startDate = "Start date is required"
      showToast.error("Please specify start date")
    }
    if (!formData.endDate) {
      newErrors.endDate = "End date is required"
      showToast.error("Please specify end date")
    }

    // Conditional validation
    if (formData.trainingLocation === "home" && !formData.homeEquipment.trim()) {
      newErrors.homeEquipment = "Please specify available equipment for home training"
      showToast.error("Please specify available equipment for home training")
    }

    if (formData.hasInjuries && !formData.injuryDetails.trim()) {
      newErrors.injuryDetails = "Please provide injury details"
      showToast.error("Please provide injury details")
    }

    if (formData.takingMedication && !formData.medicationDetails.trim()) {
      newErrors.medicationDetails = "Please provide medication details"
      showToast.error("Please provide medication details")
    }

    if (
      (formData.hasInjuries ||
        formData.takingMedication ||
        formData.experiencesDizziness ||
        formData.consultedDoctor) &&
      !formData.medicalDetails.trim()
    ) {
      newErrors.medicalDetails = "Please provide relevant medical details"
      showToast.error("Please provide relevant medical details")
    }

    // Date validation
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate)
      const endDate = new Date(formData.endDate)
      if (startDate >= endDate) {
        newErrors.endDate = "End date must be after start date"
        showToast.error("End date must be after start date")
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Get token with proper error handling
      let token: string | null = null
      try {
        token = sessionStorage.getItem("token") || localStorage.getItem("token")
      } catch (error) {
        console.error("Error accessing storage:", error)
        showToast.error("Authentication error. Please log in again.")
        setIsSubmitting(false)
        return
      }

      if (!token) {
        showToast.error("Authentication required")
        setIsSubmitting(false)
        return
      }

      // Prepare data for submission using your actual API structure
      const submissionData = {
        // Service Information
        serviceName,
        servicePrice,

        // Personal Information
        fullName: formData.fullName,
        age: Number.parseInt(formData.age as string, 10),
        weight: Number.parseFloat(formData.weight as string),
        height: Number.parseFloat(formData.height as string),
        country: formData.country,
        contactMethod: formData.contactMethod,

        // Training Goals & Schedule
        trainingGoal: formData.trainingGoal,
        goalDescription: formData.goalDescription,
        trainingFrequency: formData.trainingFrequency,
        trainingPerWeek: Number.parseInt(formData.trainingPerWeek || formData.trainingFrequency, 10),
        trainingLocation: formData.trainingLocation,
        trainingPlace: formData.trainingPlace || formData.trainingLocation,
        homeEquipment: formData.homeEquipment,
        startDate: formData.startDate,
        endDate: formData.endDate,

        // Health & Medical Status
        hasInjuries: formData.hasInjuries,
        injuryDetails: formData.injuryDetails,
        takingMedication: formData.takingMedication,
        medicationDetails: formData.medicationDetails,
        experiencesDizziness: formData.experiencesDizziness,
        consultedDoctor: formData.consultedDoctor,
        medicalDetails: formData.medicalDetails,
        diseasesDetails: formData.diseasesDetails,

        // Activity Level & Sports Experience
        currentWorkoutStatus: formData.currentWorkoutStatus,
        workoutDescription: formData.workoutDescription,
        jobDescription: formData.jobDescription,
        experiencesStress: formData.experiencesStress,
        jobType: formData.jobType,
        eatsHealthy: formData.eatsHealthy,
        mealsPerDay: formData.mealsPerDay,
        sleepHours: formData.sleepHours,
        additionalInfo: formData.additionalInfo,
        enjoyedExercises: formData.enjoyedExercises,

        submittedAt: new Date().toISOString(),
      }

      console.log("Submitting service booking:", submissionData)

      // Use your actual API endpoint for training requests
      const response = await axios.post(
        API_CONFIG.USER_FUNCTIONS.RequestForTraining.createRequestToAdmin,
        submissionData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      )

      console.log("Service booking response:", response.data)

      if (response.data && response.data.status === "success") {
        showToast.success("Service booking submitted successfully")
        setSubmitStatus("success")

        // Reset form
        setFormData({
          fullName: "",
          age: "",
          weight: "",
          height: "",
          country: "",
          contactMethod: "",
          trainingGoal: "",
          goalDescription: "",
          trainingFrequency: "",
          trainingPerWeek: "",
          trainingLocation: "",
          trainingPlace: "",
          homeEquipment: "",
          startDate: "",
          endDate: "",
          hasInjuries: false,
          injuryDetails: "",
          takingMedication: false,
          medicationDetails: "",
          experiencesDizziness: false,
          consultedDoctor: false,
          medicalDetails: "",
          diseasesDetails: "",
          currentWorkoutStatus: "",
          workoutDescription: "",
          jobDescription: "",
          experiencesStress: "",
          jobType: "",
          eatsHealthy: "",
          mealsPerDay: "",
          sleepHours: "",
          additionalInfo: "",
          enjoyedExercises: "",
        })

        // Close modal after 3 seconds
        setTimeout(() => {
          handleClose()
        }, 3000)
      } else {
        setSubmitStatus("error")
        showToast.error(`Failed to submit booking: ${response.data?.message || "Unknown error"}`)
      }
    } catch (error: any) {
      console.error("Error submitting service booking:", error)
      setSubmitStatus("error")

      if (error.response) {
        showToast.error(`Failed to submit booking: ${error.response.data?.message || "Unknown error"}`)
      } else if (error.request) {
        showToast.error("Network error. Please check your connection.")
      } else {
        showToast.error("Failed to submit service booking")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
      setSubmitStatus("idle")
      setErrors({})
    }
  }

  const hasHealthIssues =
    formData.hasInjuries || formData.takingMedication || formData.experiencesDizziness || formData.consultedDoctor

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Service Booking Form</DialogTitle>
        </DialogHeader>

        {/* Success State */}
        {submitStatus === "success" && (
          <div className="p-6">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <div className="space-y-2">
                  <p className="font-medium">Service booking submitted successfully!</p>
                  <p className="text-sm">
                    We've received your booking request for {serviceName}. Our team will contact you within 24 hours to
                    confirm your booking and discuss the next steps.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Error State */}
        {submitStatus === "error" && (
          <div className="p-6 space-y-4">
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <div className="space-y-2">
                  <p className="font-medium">Service booking submission failed</p>
                  <p className="text-sm">Please try again or contact us directly if the problem persists.</p>
                </div>
              </AlertDescription>
            </Alert>
            <Button onClick={() => setSubmitStatus("idle")} className="w-full">
              Try Again
            </Button>
          </div>
        )}

        {/* Form State */}
        {submitStatus === "idle" && (
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary to-secondary text-white">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Target className="h-6 w-6" />
                  Service Booking Form
                </CardTitle>
                <div className="text-white/90">
                  <p className="text-lg font-medium">{serviceName}</p>
                  <Badge variant="secondary" className="text-lg px-3 py-1 mt-2">
                    {servicePrice}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Personal Information Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 border-b pb-2">
                      <span className="inline-block w-8 h-8 bg-primary/10 rounded-full mr-2 flex items-center justify-center">
                        <span className="text-primary font-bold">1</span>
                      </span>
                      <User className="h-5 w-5 text-primary" />
                      <h3 className="text-xl font-semibold text-foreground">Personal Information</h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-sm font-medium">
                          Full Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="fullName"
                          value={formData.fullName}
                          onChange={(e) => handleInputChange("fullName", e.target.value)}
                          placeholder="Enter your full name"
                          className={errors.fullName ? "border-red-500" : ""}
                        />
                        {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="age" className="text-sm font-medium">
                          Age <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="age"
                          type="number"
                          value={formData.age}
                          onChange={(e) => handleInputChange("age", e.target.value)}
                          placeholder="Enter your age"
                          min="16"
                          max="100"
                          className={errors.age ? "border-red-500" : ""}
                        />
                        {errors.age && <p className="text-sm text-red-500">{errors.age}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="weight" className="text-sm font-medium">
                          Weight (kg) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="weight"
                          type="number"
                          step="0.1"
                          value={formData.weight}
                          onChange={(e) => handleInputChange("weight", e.target.value)}
                          placeholder="Enter your weight"
                          className={errors.weight ? "border-red-500" : ""}
                        />
                        {errors.weight && <p className="text-sm text-red-500">{errors.weight}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="height" className="text-sm font-medium">
                          Height (cm) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="height"
                          type="number"
                          value={formData.height}
                          onChange={(e) => handleInputChange("height", e.target.value)}
                          placeholder="Enter your height"
                          min="100"
                          max="250"
                          className={errors.height ? "border-red-500" : ""}
                        />
                        {errors.height && <p className="text-sm text-red-500">{errors.height}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="country" className="text-sm font-medium">
                          Country <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="country"
                          value={formData.country}
                          onChange={(e) => handleInputChange("country", e.target.value)}
                          placeholder="Enter your country"
                          className={errors.country ? "border-red-500" : ""}
                        />
                        {errors.country && <p className="text-sm text-red-500">{errors.country}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Preferred Contact Method <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.contactMethod}
                          onValueChange={(value) => handleInputChange("contactMethod", value)}
                        >
                          <SelectTrigger className={errors.contactMethod ? "border-red-500" : ""}>
                            <SelectValue placeholder="Select contact method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="whatsapp">
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                WhatsApp
                              </div>
                            </SelectItem>
                            <SelectItem value="email">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                Email
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.contactMethod && <p className="text-sm text-red-500">{errors.contactMethod}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Training Goals & Schedule Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 border-b pb-2">
                      <span className="inline-block w-8 h-8 bg-primary/10 rounded-full mr-2 flex items-center justify-center">
                        <span className="text-primary font-bold">2</span>
                      </span>
                      <Target className="h-5 w-5 text-primary" />
                      <h3 className="text-xl font-semibold text-foreground">Training Goals & Schedule</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="trainingGoal" className="text-sm font-medium">
                          What is your goal from training? <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="trainingGoal"
                          value={formData.trainingGoal}
                          onChange={(e) => handleInputChange("trainingGoal", e.target.value)}
                          placeholder="Describe your fitness goals in detail..."
                          rows={3}
                          className={errors.trainingGoal ? "border-red-500" : ""}
                        />
                        {errors.trainingGoal && <p className="text-sm text-red-500">{errors.trainingGoal}</p>}
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            How many times per week can you train? <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={formData.trainingFrequency}
                            onValueChange={(value) => handleInputChange("trainingFrequency", value)}
                          >
                            <SelectTrigger className={errors.trainingFrequency ? "border-red-500" : ""}>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1-2">1-2 times per week</SelectItem>
                              <SelectItem value="3-4">3-4 times per week</SelectItem>
                              <SelectItem value="5-6">5-6 times per week</SelectItem>
                              <SelectItem value="daily">Daily</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.trainingFrequency && (
                            <p className="text-sm text-red-500">{errors.trainingFrequency}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Training Location <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={formData.trainingLocation}
                            onValueChange={(value) => handleInputChange("trainingLocation", value)}
                          >
                            <SelectTrigger className={errors.trainingLocation ? "border-red-500" : ""}>
                              <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="gym">
                                <div className="flex items-center gap-2">
                                  <Dumbbell className="h-4 w-4" />
                                  Gym
                                </div>
                              </SelectItem>
                              <SelectItem value="home">
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  Home
                                </div>
                              </SelectItem>
                              <SelectItem value="both">Both Gym and Home</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.trainingLocation && <p className="text-sm text-red-500">{errors.trainingLocation}</p>}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="startDate" className="text-sm font-medium">
                            Training Start Date <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="startDate"
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => handleInputChange("startDate", e.target.value)}
                            className={errors.startDate ? "border-red-500" : ""}
                          />
                          {errors.startDate && <p className="text-sm text-red-500">{errors.startDate}</p>}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="endDate" className="text-sm font-medium">
                            Training End Date <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="endDate"
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => handleInputChange("endDate", e.target.value)}
                            className={errors.endDate ? "border-red-500" : ""}
                          />
                          {errors.endDate && <p className="text-sm text-red-500">{errors.endDate}</p>}
                        </div>
                      </div>

                      {(formData.trainingLocation === "home" || formData.trainingLocation === "both") && (
                        <div className="space-y-2">
                          <Label htmlFor="homeEquipment" className="text-sm font-medium">
                            What equipment do you have available at home? <span className="text-red-500">*</span>
                          </Label>
                          <Textarea
                            id="homeEquipment"
                            value={formData.homeEquipment}
                            onChange={(e) => handleInputChange("homeEquipment", e.target.value)}
                            placeholder="List all available equipment (dumbbells, resistance bands, yoga mat, etc.)"
                            rows={2}
                            className={errors.homeEquipment ? "border-red-500" : ""}
                          />
                          {errors.homeEquipment && <p className="text-sm text-red-500">{errors.homeEquipment}</p>}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Health and Medical Status Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 border-b pb-2">
                      <span className="inline-block w-8 h-8 bg-primary/10 rounded-full mr-2 flex items-center justify-center">
                        <span className="text-primary font-bold">3</span>
                      </span>
                      <Heart className="h-5 w-5 text-primary" />
                      <h3 className="text-xl font-semibold text-foreground">Health and Medical Status</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="hasInjuries"
                          checked={formData.hasInjuries}
                          onCheckedChange={(checked) => handleInputChange("hasInjuries", checked as boolean)}
                        />
                        <Label htmlFor="hasInjuries" className="text-sm">
                          Do you have any current or past injuries or health issues?
                        </Label>
                      </div>

                      {formData.hasInjuries && (
                        <div className="ml-6 space-y-2">
                          <Label htmlFor="injuryDetails" className="text-sm font-medium">
                            Please provide details <span className="text-red-500">*</span>
                          </Label>
                          <Textarea
                            id="injuryDetails"
                            value={formData.injuryDetails}
                            onChange={(e) => handleInputChange("injuryDetails", e.target.value)}
                            placeholder="Describe your injuries or health issues..."
                            rows={2}
                            className={errors.injuryDetails ? "border-red-500" : ""}
                          />
                          {errors.injuryDetails && <p className="text-sm text-red-500">{errors.injuryDetails}</p>}
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="takingMedication"
                          checked={formData.takingMedication}
                          onCheckedChange={(checked) => handleInputChange("takingMedication", checked as boolean)}
                        />
                        <Label htmlFor="takingMedication" className="text-sm">
                          Are you currently taking any medication regularly?
                        </Label>
                      </div>

                      {formData.takingMedication && (
                        <div className="ml-6 space-y-2">
                          <Label htmlFor="medicationDetails" className="text-sm font-medium">
                            Please provide details <span className="text-red-500">*</span>
                          </Label>
                          <Textarea
                            id="medicationDetails"
                            value={formData.medicationDetails}
                            onChange={(e) => handleInputChange("medicationDetails", e.target.value)}
                            placeholder="List medications and dosages..."
                            rows={2}
                            className={errors.medicationDetails ? "border-red-500" : ""}
                          />
                          {errors.medicationDetails && (
                            <p className="text-sm text-red-500">{errors.medicationDetails}</p>
                          )}
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="experiencesDizziness"
                          checked={formData.experiencesDizziness}
                          onCheckedChange={(checked) => handleInputChange("experiencesDizziness", checked as boolean)}
                        />
                        <Label htmlFor="experiencesDizziness" className="text-sm">
                          Have you ever experienced dizziness or fainting during exercise?
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="consultedDoctor"
                          checked={formData.consultedDoctor}
                          onCheckedChange={(checked) => handleInputChange("consultedDoctor", checked as boolean)}
                        />
                        <Label htmlFor="consultedDoctor" className="text-sm">
                          Have you consulted a doctor about any of the above?
                        </Label>
                      </div>

                      {hasHealthIssues && (
                        <Alert className="border-orange-200 bg-orange-50">
                          <AlertDescription>
                            <div className="space-y-2">
                              <p className="font-medium text-orange-800">
                                👉 If you answered yes to any of the questions above, please provide all relevant
                                details here:
                              </p>
                              <Textarea
                                value={formData.medicalDetails}
                                onChange={(e) => handleInputChange("medicalDetails", e.target.value)}
                                placeholder="Provide comprehensive details about your medical history, injuries, medications, and any doctor consultations..."
                                rows={4}
                                className={`bg-white ${errors.medicalDetails ? "border-red-500" : ""}`}
                              />
                              {errors.medicalDetails && <p className="text-sm text-red-500">{errors.medicalDetails}</p>}
                            </div>
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="diseasesDetails" className="text-sm font-medium">
                          Medical Conditions <span className="text-slate-500 font-normal">(optional)</span>
                        </Label>
                        <Textarea
                          id="diseasesDetails"
                          value={formData.diseasesDetails}
                          onChange={(e) => handleInputChange("diseasesDetails", e.target.value)}
                          placeholder="Please describe any medical conditions or diseases"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Activity Level & Sports Experience Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 border-b pb-2">
                      <span className="inline-block w-8 h-8 bg-primary/10 rounded-full mr-2 flex items-center justify-center">
                        <span className="text-primary font-bold">4</span>
                      </span>
                      <Activity className="h-5 w-5 text-primary" />
                      <h3 className="text-xl font-semibold text-foreground">Activity Level & Sports Experience</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Are you currently working out, used to work out, or is this your first time?
                        </Label>
                        <Select
                          value={formData.currentWorkoutStatus}
                          onValueChange={(value) => handleInputChange("currentWorkoutStatus", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select your workout status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="currently">Currently working out</SelectItem>
                            <SelectItem value="used-to">Used to work out</SelectItem>
                            <SelectItem value="first-time">This is my first time</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {(formData.currentWorkoutStatus === "currently" ||
                        formData.currentWorkoutStatus === "used-to") && (
                        <div className="space-y-2">
                          <Label htmlFor="workoutDescription" className="text-sm font-medium">
                            Describe your workouts and how many times per week:
                          </Label>
                          <Textarea
                            id="workoutDescription"
                            value={formData.workoutDescription}
                            onChange={(e) => handleInputChange("workoutDescription", e.target.value)}
                            placeholder="Describe your current or past workout routine..."
                            rows={3}
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="jobDescription" className="text-sm font-medium">
                          Describe your job and lifestyle:
                        </Label>
                        <Textarea
                          id="jobDescription"
                          value={formData.jobDescription}
                          onChange={(e) => handleInputChange("jobDescription", e.target.value)}
                          placeholder="Describe your daily work and lifestyle..."
                          rows={2}
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Do you experience stress?</Label>
                          <Select
                            value={formData.experiencesStress}
                            onValueChange={(value) => handleInputChange("experiencesStress", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select stress level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low stress</SelectItem>
                              <SelectItem value="moderate">Moderate stress</SelectItem>
                              <SelectItem value="high">High stress</SelectItem>
                              <SelectItem value="very-high">Very high stress</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Is your job desk-based or physically active?</Label>
                          <Select
                            value={formData.jobType}
                            onValueChange={(value) => handleInputChange("jobType", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select job type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="desk-based">Desk-based</SelectItem>
                              <SelectItem value="physically-active">Physically active</SelectItem>
                              <SelectItem value="mixed">Mixed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Do you eat healthy meals? How many meals per day?
                          </Label>
                          <Input
                            value={formData.eatsHealthy}
                            onChange={(e) => handleInputChange("eatsHealthy", e.target.value)}
                            placeholder="e.g., Yes, 3 healthy meals per day"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium">How many hours do you sleep daily?</Label>
                          <Input
                            value={formData.sleepHours}
                            onChange={(e) => handleInputChange("sleepHours", e.target.value)}
                            placeholder="e.g., 7-8 hours"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="enjoyedExercises" className="text-sm font-medium">
                          What types of exercises do you enjoy?
                        </Label>
                        <Textarea
                          id="enjoyedExercises"
                          value={formData.enjoyedExercises}
                          onChange={(e) => handleInputChange("enjoyedExercises", e.target.value)}
                          placeholder="List exercises you enjoy (running, weightlifting, yoga, etc.)"
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="additionalInfo" className="text-sm font-medium">
                          Any additional information you'd like to share to help us create a suitable program for you?
                        </Label>
                        <Textarea
                          id="additionalInfo"
                          value={formData.additionalInfo}
                          onChange={(e) => handleInputChange("additionalInfo", e.target.value)}
                          placeholder="Share any additional information that might help us design your program..."
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      className="flex-1 bg-transparent"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Submitting...
                        </div>
                      ) : (
                        "Submit Booking Request"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
