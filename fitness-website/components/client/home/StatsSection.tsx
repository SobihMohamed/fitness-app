"use client";

import React from "react";
import { SectionWrapper } from "@/components/common";
import type { StatsSectionProps } from "@/types/home";

const StatsSection = React.memo<StatsSectionProps>(({ stats }) => {
  return (
    <SectionWrapper backgroundColor="white" padding="md">
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
    </SectionWrapper>
  );
});

StatsSection.displayName = "StatsSection";

export default StatsSection;
