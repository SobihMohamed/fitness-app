"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Award, Target, Heart } from "lucide-react"

const teamMembers = [
  {
    name: "Sarah Johnson",
    role: "Founder & CEO",
    image: "/placeholder.svg?height=300&width=300",
    bio: "Certified personal trainer with 15+ years of experience in fitness and nutrition.",
  },
  {
    name: "Mike Chen",
    role: "Head Trainer",
    image: "/placeholder.svg?height=300&width=300",
    bio: "Former Olympic athlete specializing in strength training and conditioning.",
  },
  {
    name: "Emily Davis",
    role: "Nutrition Expert",
    image: "/placeholder.svg?height=300&width=300",
    bio: "Registered dietitian helping clients achieve their health goals through proper nutrition.",
  },
  {
    name: "David Wilson",
    role: "Yoga Instructor",
    image: "/placeholder.svg?height=300&width=300",
    bio: "Certified yoga instructor with expertise in mindfulness and flexibility training.",
  },
]

const values = [
  {
    icon: Target,
    title: "Goal-Oriented",
    description: "We help you set and achieve realistic fitness goals with personalized programs.",
  },
  {
    icon: Heart,
    title: "Health First",
    description: "Your health and wellbeing are our top priority in everything we do.",
  },
  {
    icon: Users,
    title: "Community",
    description: "Building a supportive community where everyone can thrive together.",
  },
  {
    icon: Award,
    title: "Excellence",
    description: "Committed to delivering the highest quality fitness programs and services.",
  },
]

export function AboutPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8F9FA" }}>
      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge style={{ backgroundColor: "#32CD32", color: "#FFFFFF" }}>Our Story</Badge>
                <h1 className="text-4xl lg:text-5xl font-bold" style={{ color: "#212529" }}>
                  Transforming Lives Through
                  <span style={{ color: "#007BFF" }}> Fitness</span>
                </h1>
                <p className="text-xl" style={{ color: "#6C757D" }}>
                  Founded in 2018, FitPro has been dedicated to helping individuals achieve their fitness goals through
                  personalized training, expert guidance, and a supportive community.
                </p>
              </div>
            </div>
            <div className="relative">
              <Image
                src="/placeholder.svg?height=500&width=600"
                alt="About Us"
                width={600}
                height={500}
                className="rounded-2xl shadow-lg"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20" style={{ backgroundColor: "#F8F9FA" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <Card className="p-8 bg-white border-0 shadow-lg">
              <CardContent className="p-0">
                <h2 className="text-3xl font-bold mb-6" style={{ color: "#007BFF" }}>
                  Our Mission
                </h2>
                <p className="text-lg leading-relaxed" style={{ color: "#6C757D" }}>
                  To empower individuals to transform their lives through fitness, providing accessible, effective, and
                  enjoyable fitness solutions that promote long-term health and wellness.
                </p>
              </CardContent>
            </Card>

            <Card className="p-8 bg-white border-0 shadow-lg">
              <CardContent className="p-0">
                <h2 className="text-3xl font-bold mb-6" style={{ color: "#32CD32" }}>
                  Our Vision
                </h2>
                <p className="text-lg leading-relaxed" style={{ color: "#6C757D" }}>
                  To become the world's leading fitness platform, creating a global community where everyone has the
                  tools, knowledge, and support to live their healthiest life.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4" style={{ color: "#212529" }}>
              Our Values
            </h2>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: "#6C757D" }}>
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card
                key={index}
                className="text-center p-8 bg-white border-0 shadow-lg hover:shadow-xl transition-shadow"
              >
                <CardContent className="p-0">
                  <div
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
                    style={{ backgroundColor: "#007BFF" }}
                  >
                    <value.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-4" style={{ color: "#212529" }}>
                    {value.title}
                  </h3>
                  <p style={{ color: "#6C757D" }}>{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20" style={{ backgroundColor: "#F8F9FA" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4" style={{ color: "#212529" }}>
              Meet Our Team
            </h2>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: "#6C757D" }}>
              Certified professionals dedicated to your fitness journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="text-center">
                    <Image
                      src={member.image || "/placeholder.svg"}
                      alt={member.name}
                      width={200}
                      height={200}
                      className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                      loading="lazy"
                    />
                    <h3 className="text-xl font-bold mb-2" style={{ color: "#212529" }}>
                      {member.name}
                    </h3>
                    <p className="font-medium mb-4" style={{ color: "#32CD32" }}>
                      {member.role}
                    </p>
                    <p className="text-sm" style={{ color: "#6C757D" }}>
                      {member.bio}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
