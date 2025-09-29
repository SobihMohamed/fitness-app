import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  size?: "sm" | "lg" | "default";
  variant?: "primary" | "secondary" | "outline";
  asChild?: boolean;
  className?: string;
}

// Primary button with consistent styling across the app
export const PrimaryButton = React.memo<PrimaryButtonProps>(({ 
  children, 
  size = "default",
  variant = "primary",
  className,
  asChild,
  ...props 
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return { backgroundColor: "#007BFF" };
      case "secondary":
        return { backgroundColor: "#32CD32" };
      case "outline":
        return { 
          backgroundColor: "transparent", 
          borderColor: "#007BFF", 
          color: "#007BFF" 
        };
      default:
        return { backgroundColor: "#007BFF" };
    }
  };

  return (
    <Button
      asChild={asChild}
      size={size}
      className={cn("transition-all duration-300", className)}
      style={getVariantStyles()}
      {...props}
    >
      {children}
    </Button>
  );
});

PrimaryButton.displayName = "PrimaryButton";
