import React from "react";
import { cn } from "@/lib/utils";

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  backgroundColor?: "white" | "gray" | "gradient";
  padding?: "sm" | "md" | "lg";
  id?: string;
}

// Consistent section wrapper with common styling patterns
export const SectionWrapper = React.memo<SectionWrapperProps>(({ 
  children, 
  className,
  backgroundColor = "gray",
  padding = "lg",
  id
}) => {
  const getBackgroundStyles = () => {
    switch (backgroundColor) {
      case "white":
        return { backgroundColor: "#FFFFFF" };
      case "gray":
        return { backgroundColor: "#F8F9FA" };
      case "gradient":
        return { 
          background: "linear-gradient(135deg, #007BFF 0%, #32CD32 100%)" 
        };
      default:
        return { backgroundColor: "#F8F9FA" };
    }
  };

  const getPaddingClass = () => {
    switch (padding) {
      case "sm":
        return "py-12";
      case "md":
        return "py-16";
      case "lg":
        return "py-20";
      default:
        return "py-20";
    }
  };

  return (
    <section 
      id={id}
      className={cn(getPaddingClass(), className)}
      style={getBackgroundStyles()}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
});

SectionWrapper.displayName = "SectionWrapper";

// Section header component for consistent title/description styling
interface SectionHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

export const SectionHeader = React.memo<SectionHeaderProps>(({ 
  title, 
  description, 
  className 
}) => (
  <div className={cn("text-center mb-16", className)}>
    <h2 
      className="text-3xl lg:text-4xl font-bold mb-4" 
      style={{ color: "#212529" }}
    >
      {title}
    </h2>
    {description && (
      <p 
        className="text-xl max-w-2xl mx-auto" 
        style={{ color: "#6C757D" }}
      >
        {description}
      </p>
    )}
  </div>
));

SectionHeader.displayName = "SectionHeader";
