"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react"

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log("Form submitted:", formData)
    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    })
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8F9FA" }}>
      {/* Hero Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge style={{ backgroundColor: "#32CD32", color: "#FFFFFF" }} className="mb-4">
            Get In Touch
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold mb-6" style={{ color: "#212529" }}>
            Contact
            <span style={{ color: "#007BFF" }}> Us</span>
          </h1>
          <p className="text-xl max-w-3xl mx-auto" style={{ color: "#6C757D" }}>
            Have questions about our services or need help getting started? We're here to help you on your fitness
            journey.
          </p>
        </div>
      </section>

      {/* Contact Form and Info */}
      <section className="py-20" style={{ backgroundColor: "#F8F9FA" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl" style={{ color: "#212529" }}>
                  Send us a Message
                </CardTitle>
                <CardDescription style={{ color: "#6C757D" }}>
                  Fill out the form below and we'll get back to you within 24 hours.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" style={{ color: "#212529" }}>
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        required
                        placeholder="Your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" style={{ color: "#212529" }}>
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        required
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone" style={{ color: "#212529" }}>
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject" style={{ color: "#212529" }}>
                        Subject *
                      </Label>
                      <Select value={formData.subject} onValueChange={(value) => handleChange("subject", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="membership">Membership Information</SelectItem>
                          <SelectItem value="personal-training">Personal Training</SelectItem>
                          <SelectItem value="group-classes">Group Classes</SelectItem>
                          <SelectItem value="nutrition">Nutrition Coaching</SelectItem>
                          <SelectItem value="support">Technical Support</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" style={{ color: "#212529" }}>
                      Message *
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      required
                      placeholder="Tell us how we can help you..."
                      rows={6}
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg" style={{ backgroundColor: "#007BFF" }}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
              <Card className="bg-white border-0 shadow-lg">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-6" style={{ color: "#212529" }}>
                    Get in Touch
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: "#007BFF" }}
                      >
                        <MapPin className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1" style={{ color: "#212529" }}>
                          Visit Our Gym
                        </h4>
                        <p style={{ color: "#6C757D" }}>
                          123 Fitness Street
                          <br />
                          Health City, HC 12345
                          <br />
                          United States
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: "#32CD32" }}
                      >
                        <Phone className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1" style={{ color: "#212529" }}>
                          Call Us
                        </h4>
                        <p style={{ color: "#6C757D" }}>
                          Main: +1 (555) 123-4567
                          <br />
                          Support: +1 (555) 123-4568
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: "#007BFF" }}
                      >
                        <Mail className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1" style={{ color: "#212529" }}>
                          Email Us
                        </h4>
                        <p style={{ color: "#6C757D" }}>
                          info@fitpro.com
                          <br />
                          support@fitpro.com
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: "#32CD32" }}
                      >
                        <Clock className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1" style={{ color: "#212529" }}>
                          Operating Hours
                        </h4>
                        <p style={{ color: "#6C757D" }}>
                          Monday - Friday: 5:00 AM - 11:00 PM
                          <br />
                          Saturday - Sunday: 6:00 AM - 10:00 PM
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-lg">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4" style={{ color: "#212529" }}>
                    Quick Response
                  </h3>
                  <p className="mb-4" style={{ color: "#6C757D" }}>
                    Need immediate assistance? Our support team is available during business hours to help with:
                  </p>
                  <ul className="space-y-2" style={{ color: "#6C757D" }}>
                    <li>• Membership questions</li>
                    <li>• Class scheduling</li>
                    <li>• Equipment issues</li>
                    <li>• Account support</li>
                  </ul>
                  <Button
                    className="mt-6 w-full bg-transparent"
                    variant="outline"
                    style={{ borderColor: "#007BFF", color: "#007BFF" }}
                  >
                    Live Chat Support
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
