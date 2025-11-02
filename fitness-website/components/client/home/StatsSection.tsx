"use client";

import React from "react";
import type { StatsSectionProps } from "@/types/home";

const StatsSection = React.memo<StatsSectionProps>(({ stats }) => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                style={{ backgroundColor: "#E3F2FD" }}
              >
                <stat.icon className="h-8 w-8" style={{ color: "#007BFF" }} />
              </div>
              <div className="text-3xl font-bold mb-2" style={{ color: "#212529" }}>
                {stat.value}
              </div>
              <div style={{ color: "#6C757D" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

StatsSection.displayName = "StatsSection";

export default StatsSection;
