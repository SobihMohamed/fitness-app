import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Play,
  ArrowRight,
  TrendingUp,
  Dumbbell,
  Flame,
  Zap,
  Trophy,
  Heart,
} from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge style={{ backgroundColor: "#32CD32", color: "#FFFFFF" }}>
                #1 Fitness Platform
              </Badge>
              <h1
                className="text-4xl lg:text-6xl font-bold leading-tight"
                style={{ color: "#212529" }}
              >
                Transform Your
                <span style={{ color: "#007BFF" }}> Body</span>,
                <span style={{ color: "#32CD32" }}> Mind</span> & Life
              </h1>
              <p className="text-xl max-w-lg" style={{ color: "#6C757D" }}>
                Join thousands of fitness enthusiasts on their journey to a
                healthier, stronger, and more confident version of themselves.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/courses">
                <Button
                  size="lg"
                  className="text-lg px-8 bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center"
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/about">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 inline-flex items-center"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </Link>
            </div>

            <div className="flex items-center space-x-8 pt-8">
              <div className="text-center">
                <div
                  className="text-2xl font-bold"
                  style={{ color: "#007BFF" }}
                >
                  50K+
                </div>
                <div className="text-sm" style={{ color: "#6C757D" }}>
                  Happy Members
                </div>
              </div>
              <div className="text-center">
                <div
                  className="text-2xl font-bold"
                  style={{ color: "#32CD32" }}
                >
                  200+
                </div>
                <div className="text-sm" style={{ color: "#6C757D" }}>
                  Expert Trainers
                </div>
              </div>
              <div className="text-center">
                <div
                  className="text-2xl font-bold"
                  style={{ color: "#007BFF" }}
                >
                  4.9★
                </div>
                <div className="text-sm" style={{ color: "#6C757D" }}>
                  User Rating
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative">
              {/* Gym illustration — pure CSS, zero network request, instant LCP */}
              <div
                className="rounded-2xl shadow-2xl w-full overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)",
                  minHeight: 480,
                }}
              >
                {/* Top accent bar */}
                <div
                  className="h-2 w-full"
                  style={{
                    background: "linear-gradient(90deg, #007BFF, #32CD32)",
                  }}
                />

                {/* Main content area */}
                <div
                  className="p-8 flex flex-col items-center justify-center gap-6"
                  style={{ minHeight: 460 }}
                >
                  {/* Central dumbbell hero icon */}
                  <div className="relative flex items-center justify-center">
                    <div
                      className="w-36 h-36 rounded-full flex items-center justify-center"
                      style={{
                        background: "rgba(0,123,255,0.15)",
                        border: "2px solid rgba(0,123,255,0.4)",
                      }}
                    >
                      <div
                        className="w-24 h-24 rounded-full flex items-center justify-center"
                        style={{
                          background: "rgba(0,123,255,0.25)",
                          border: "2px solid rgba(0,123,255,0.6)",
                        }}
                      >
                        <Dumbbell
                          className="h-12 w-12"
                          style={{ color: "#007BFF" }}
                        />
                      </div>
                    </div>
                    {/* Orbiting badges */}
                    <div
                      className="absolute -top-4 -right-4 w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                      style={{ background: "#32CD32" }}
                    >
                      <Flame className="h-5 w-5 text-white" />
                    </div>
                    <div
                      className="absolute -bottom-4 -left-4 w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                      style={{ background: "#007BFF" }}
                    >
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                  </div>

                  {/* Stat pills row */}
                  <div className="flex gap-4 flex-wrap justify-center">
                    {[
                      {
                        icon: <Trophy className="h-4 w-4" />,
                        label: "500+ Programs",
                        color: "#FFC107",
                      },
                      {
                        icon: <Heart className="h-4 w-4" />,
                        label: "Live Coaching",
                        color: "#FF5252",
                      },
                      {
                        icon: <Zap className="h-4 w-4" />,
                        label: "Fast Results",
                        color: "#32CD32",
                      },
                    ].map(({ icon, label, color }) => (
                      <div
                        key={label}
                        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white"
                        style={{
                          background: "rgba(255,255,255,0.1)",
                          border: `1px solid ${color}40`,
                          color,
                        }}
                      >
                        {icon}
                        <span style={{ color: "#fff" }}>{label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Progress bars */}
                  <div className="w-full max-w-xs space-y-3">
                    {[
                      { label: "Strength", pct: 92, color: "#007BFF" },
                      { label: "Endurance", pct: 78, color: "#32CD32" },
                      { label: "Flexibility", pct: 65, color: "#FFC107" },
                    ].map(({ label, pct, color }) => (
                      <div key={label}>
                        <div
                          className="flex justify-between text-xs mb-1"
                          style={{ color: "rgba(255,255,255,0.7)" }}
                        >
                          <span>{label}</span>
                          <span>{pct}%</span>
                        </div>
                        <div
                          className="h-2 rounded-full w-full"
                          style={{ background: "rgba(255,255,255,0.1)" }}
                        >
                          <div
                            className="h-2 rounded-full"
                            style={{ width: `${pct}%`, background: color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Tagline */}
                  <p
                    className="text-center text-sm font-medium"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    Your personal fitness journey starts here
                  </p>
                </div>
              </div>

              {/* Floating card */}
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#32CD32" }}
                  >
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold" style={{ color: "#212529" }}>
                      Progress Tracking
                    </div>
                    <div className="text-sm" style={{ color: "#6C757D" }}>
                      Real-time analytics
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
