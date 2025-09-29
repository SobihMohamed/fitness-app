"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Users, Award, Target, Heart, Trophy, Zap } from "lucide-react"

const teamMembers = [
  {
    name: "Sarah Johnson",
    role: "Founder & CEO",
    bio: "Certified personal trainer with 15+ years of experience in fitness and nutrition. Former Olympic athlete.",
    specialties: ["Leadership", "Nutrition", "Olympic Training"],
  },
  {
    name: "Mike Chen",
    role: "Head Trainer",
    bio: "Former Olympic athlete specializing in strength training and conditioning. Masters in Exercise Science.",
    specialties: ["Strength Training", "Conditioning", "Sports Performance"],
  },
  {
    name: "Emily Davis",
    role: "Nutrition Expert",
    bio: "Registered dietitian helping clients achieve their health goals through proper nutrition and lifestyle changes.",
    specialties: ["Nutrition Planning", "Weight Management", "Wellness Coaching"],
  },
  {
    name: "David Wilson",
    role: "Yoga & Mindfulness",
    bio: "Certified yoga instructor with expertise in mindfulness and flexibility training. 500-hour RYT certified.",
    specialties: ["Yoga", "Mindfulness", "Flexibility", "Meditation"],
  },
]

const values = [
  {
    icon: Target,
    title: "Goal-Oriented",
    description:
      "We help you set and achieve realistic fitness goals with personalized programs tailored to your needs.",
  },
  {
    icon: Heart,
    title: "Health First",
    description:
      "Your health and wellbeing are our top priority in everything we do, ensuring safe and effective training.",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "Building a supportive community where everyone can thrive together and celebrate each other's success.",
  },
  {
    icon: Award,
    title: "Excellence",
    description: "Committed to delivering the highest quality fitness programs and services with proven results.",
  },
]

const milestones = [
  {
    year: "2018",
    title: "FitPro Founded",
    description: "Started with a vision to make fitness accessible to everyone",
    icon: Trophy,
  },
  {
    year: "2019",
    title: "First 1,000 Members",
    description: "Reached our first major milestone with incredible community support",
    icon: Users,
  },
  {
    year: "2021",
    title: "Online Platform Launch",
    description: "Expanded to digital with comprehensive online training programs",
    icon: Zap,
  },
  {
    year: "2024",
    title: "50,000+ Members",
    description: "Now serving a global community of fitness enthusiasts",
    icon: Award,
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div className="space-y-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="space-y-4">
                <Badge className="bg-secondary text-secondary-foreground">Our Story</Badge>
                <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
                  Transforming Lives Through
                  <span className="text-primary"> Fitness</span>
                </h1>
                <p className="text-xl text-muted">
                  Founded in 2018, FitPro has been dedicated to helping individuals achieve their fitness goals through
                  personalized training, expert guidance, and a supportive community that celebrates every victory.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-primary hover:bg-primary/90">Join Our Community</Button>
                <Button variant="outline">Meet Our Team</Button>
              </div>
            </motion.div>
            <motion.div className="relative" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
              <div className="w-full h-96 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <Users className="h-24 w-24 text-primary mx-auto mb-4" />
                  <p className="text-lg font-semibold text-foreground">50,000+ Happy Members</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <Card className="p-8 border-0 shadow-lg">
              <CardContent className="p-0">
                <div className="flex items-center mb-6">
                  <Target className="h-8 w-8 text-primary mr-3" />
                  <h2 className="text-3xl font-bold text-foreground">Our Mission</h2>
                </div>
                <p className="text-lg leading-relaxed text-muted">
                  To empower individuals to transform their lives through fitness, providing accessible, effective, and
                  enjoyable fitness solutions that promote long-term health and wellness for people of all backgrounds
                  and fitness levels.
                </p>
              </CardContent>
            </Card>

            <Card className="p-8 border-0 shadow-lg">
              <CardContent className="p-0">
                <div className="flex items-center mb-6">
                  <Heart className="h-8 w-8 text-secondary mr-3" />
                  <h2 className="text-3xl font-bold text-foreground">Our Vision</h2>
                </div>
                <p className="text-lg leading-relaxed text-muted">
                  To become the world's leading fitness platform, creating a global community where everyone has the
                  tools, knowledge, and support to live their healthiest life and achieve their personal best.
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
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-foreground">Our Core Values</h2>
            <p className="text-xl max-w-2xl mx-auto text-muted">The principles that guide everything we do</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center p-8 border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-0">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 bg-primary/10">
                    <value.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-foreground">{value.title}</h3>
                  <p className="text-muted">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-foreground">Our Journey</h2>
            <p className="text-xl max-w-2xl mx-auto text-muted">Key milestones in our mission to transform lives</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {milestones.map((milestone, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                      <milestone.icon className="h-6 w-6 text-primary" />
                    </div>
                    <Badge className="bg-secondary text-secondary-foreground">{milestone.year}</Badge>
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-foreground">{milestone.title}</h3>
                  <p className="text-sm text-muted">{milestone.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-foreground">Meet Our Expert Team</h2>
            <p className="text-xl max-w-2xl mx-auto text-muted">
              Certified professionals dedicated to your fitness journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 mx-auto mb-4 flex items-center justify-center">
                      <Users className="h-12 w-12 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-foreground">{member.name}</h3>
                    <p className="font-medium mb-4 text-secondary">{member.role}</p>
                    <p className="text-sm text-muted mb-4">{member.bio}</p>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {member.specialties.map((specialty, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-white">Our Impact</h2>
            <p className="text-xl text-white/90">Numbers that speak to our commitment</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { number: "50K+", label: "Active Members" },
              { number: "200+", label: "Certified Trainers" },
              { number: "10K+", label: "Success Stories" },
              { number: "4.9", label: "Average Rating" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-white/90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-foreground">Ready to Join Our Community?</h2>
          <p className="text-xl text-muted mb-8">
            Become part of a supportive community that's committed to helping you achieve your fitness goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Start Your Journey
            </Button>
            <Button size="lg" variant="outline">
              Contact Our Team
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
