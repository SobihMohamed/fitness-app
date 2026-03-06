import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeroText } from "@/components/shared/page-hero";
import { Users, Award, Target, Heart, Trophy, Zap } from "lucide-react";
import Link from "next/link";

// --- Static Data (Extracted to prevent re-creation on render) ---
const ABOUT_STATS = {
  memberCount: "50,000+",
  trainerCount: "200+",
  successStories: "10,000+",
  programsLaunched: "120+",
  foundedYear: "2018",
};

const TEAM_MEMBERS = [
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
];

const VALUES = [
  {
    icon: Target,
    title: "Goal-Oriented",
    description: "We help you set and achieve realistic fitness goals with personalized programs tailored to your needs.",
  },
  {
    icon: Heart,
    title: "Health First",
    description: "Your health and wellbeing are our top priority in everything we do, ensuring safe and effective training.",
  },
  {
    icon: Users,
    title: "Community",
    description: "Building a supportive community where everyone can thrive together and celebrate each other's success.",
  },
  {
    icon: Award,
    title: "Excellence",
    description: "Committed to delivering the highest quality fitness programs and services with proven results.",
  },
];

const MILESTONES = [
  {
    year: "2018",
    title: "FitOrigin Founded",
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
];

const STATS_DATA = [
  { number: ABOUT_STATS.memberCount, label: "Active Members" },
  { number: ABOUT_STATS.trainerCount, label: "Certified Trainers" },
  { number: ABOUT_STATS.successStories, label: "Success Stories" },
  { number: ABOUT_STATS.programsLaunched, label: "Programs Launched" },
];

// --- Reusable Shared Components (DRY) ---
const SectionHeader = ({ title, subtitle, isDark = false }: { title: string; subtitle: string; isDark?: boolean }) => (
  <header className="text-center mb-16 space-y-4">
    <h2 className={`text-3xl lg:text-4xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h2>
    <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-white/90' : 'text-slate-600'}`}>{subtitle}</p>
  </header>
);

const FeatureCard = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
  <Card className="text-center p-8 border-transparent shadow-sm hover:shadow-xl transition-all duration-300 bg-white group">
    <CardContent className="p-0 flex flex-col items-center">
      <div className="w-16 h-16 rounded-2xl mb-6 bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold mb-3 text-slate-900">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </CardContent>
  </Card>
);

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-white">
        <div className="absolute inset-0 bg-blue-50/50 -skew-y-3 origin-top-left -z-10" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="space-y-8">
              <PageHeroText
                badge="Our Story"
                title="Transforming Lives Through"
                highlight="Fitness"
                description={`Founded in ${ABOUT_STATS.foundedYear}, FitOrigin empowers individuals to achieve their goals through personalized training, expert guidance, and a global, supportive community.`}
                containerClassName="text-left"
                badgeProps={{
                  variant: "secondary",
                  className:
                    "bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors uppercase tracking-wider py-1 px-3",
                }}
                titleClassName="text-4xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight"
                highlightClassName="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"
                descriptionClassName="mx-0 max-w-none text-lg md:text-xl text-slate-600 leading-relaxed"
              />
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 text-base">Join Our Community</Button>
                <Button size="lg" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50 text-base">Meet Our Team</Button>
              </div>
            </div>
            {/* Visual Element replacing skeleton-like div */}
            <div className="relative group perspective-1000">
              {/* Note: In a real app, use next/image here with priority={true} for LCP */}
              <div className="w-full aspect-square md:aspect-[4/3] bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-900/20 transition-transform duration-500 group-hover:-translate-y-2">
                <div className="text-center text-white space-y-4">
                  <span className="p-4 bg-white/20 rounded-full inline-block backdrop-blur-sm">
                    <Users className="w-16 h-16 md:w-20 md:h-20" />
                  </span>
                  <p className="text-2xl font-bold tracking-tight">{ABOUT_STATS.memberCount} Happy Members</p>
                </div>
              </div>
              <div className="absolute -inset-4 bg-blue-500/20 blur-3xl rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 lg:py-24 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {[
              { icon: Target, title: "Our Mission", text: "To empower individuals to transform their lives through fitness, providing accessible, effective, and enjoyable fitness solutions that promote long-term health and wellness for people of all backgrounds and fitness levels." },
              { icon: Heart, title: "Our Vision", text: "To become the world's leading fitness platform, creating a global community where everyone has the tools, knowledge, and support to live their healthiest life and achieve their personal best." }
            ].map((item, idx) => (
              <Card key={idx} className="p-8 lg:p-10 border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white rounded-2xl">
                <CardContent className="p-0">
                  <div className="flex items-center mb-6 gap-4">
                    <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                      <item.icon className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">{item.title}</h2>
                  </div>
                  <p className="text-lg leading-relaxed text-slate-600">{item.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-20 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Our Core Values" subtitle="The absolute principles that guide our training, community, and platform." />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {VALUES.map((value, idx) => <FeatureCard key={idx} {...value} />)}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 lg:py-24 bg-slate-50 border-y border-slate-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Our Journey" subtitle="Key milestones in our mission to bring world-class fitness to everyone." />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {MILESTONES.map((milestone, idx) => (
              <Card key={idx} className="border-slate-200 shadow-sm hover:-translate-y-1 transition-transform bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <milestone.icon className="w-6 h-6" />
                    </div>
                    <Badge variant="outline" className="border-indigo-200 text-indigo-700 bg-indigo-50 font-bold tracking-wide">
                      {milestone.year}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-slate-900">{milestone.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{milestone.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Meet Our Expert Team" subtitle="Elite, certified professionals dedicated to accelerating your fitness journey." />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {TEAM_MEMBERS.map((member, idx) => (
              <Card key={idx} className="border-transparent shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 bg-slate-50/50 group">
                <CardContent className="p-6 md:p-8 text-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 mx-auto mb-6 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 ring-4 ring-white shadow-inner">
                    <Users className="w-10 h-10 text-blue-600/70" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{member.name}</h3>
                  <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-4">{member.role}</p>
                  <p className="text-sm text-slate-600 mb-6 leading-relaxed line-clamp-3">{member.bio}</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {member.specialties.map((specialty, id) => (
                      <Badge key={id} variant="secondary" className="bg-white border-slate-200 text-slate-600 text-[10px] font-medium tracking-wide">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Global Impact & CTA */}
      <section className="bg-slate-900 mt-auto">
        {/* Stats Sub-section */}
        <div className="border-b border-slate-800">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 divide-x-0 md:divide-x divide-slate-800/50">
              {STATS_DATA.map((stat, idx) => (
                <div key={idx} className="text-center px-4 space-y-2">
                  <div className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                    {stat.number}
                  </div>
                  <div className="text-sm lg:text-base font-medium text-slate-400 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Sub-section */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
            Ready to Forge Your Best Self?
          </h2>
          <p className="text-lg lg:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of others transforming their lives. Get access to elite coaching, premium programs, and an unstoppable community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="h-14 px-8 bg-blue-600 hover:bg-blue-500 text-white text-lg rounded-xl shadow-lg shadow-blue-900/40 transition-all font-semibold w-full sm:w-auto">
              <Link href="/courses">Start Your Journey Now</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-8 border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white text-lg rounded-xl transition-all font-semibold w-full sm:w-auto backdrop-blur-sm">
              <Link href="/contact">Talk to an Expert</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

