"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface PremiumSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  color?: "emerald" | "white" | "zinc";
}

export function PremiumSpinner({ size = "md", className, color = "emerald" }: PremiumSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4 border-[1.5px]",
    md: "w-6 h-6 border-2",
    lg: "w-12 h-12 border-2",
  };

  const innerSizeClasses = {
    sm: "w-1 h-1",
    md: "w-1.5 h-1.5",
    lg: "w-2 h-2",
  };

  const colorClasses = {
    emerald: {
      border: "border-zinc-200 dark:border-zinc-800",
      top: "border-t-emerald-500",
      bottom: "border-b-emerald-400",
      dot: "bg-emerald-500",
    },
    white: {
      border: "border-white/20",
      top: "border-t-white",
      bottom: "border-b-white/80",
      dot: "bg-white",
    },
    zinc: {
      border: "border-zinc-200 dark:border-zinc-800",
      top: "border-t-zinc-900 dark:border-t-white",
      bottom: "border-b-zinc-500 dark:border-b-zinc-400",
      dot: "bg-zinc-900 dark:bg-white",
    },
  };

  const c = colorClasses[color];

  return (
    <div className={cn("relative flex items-center justify-center", sizeClasses[size], className)}>
      <div className={cn("absolute inset-0 rounded-full", c.border, sizeClasses[size])} />
      <div 
        className={cn("absolute inset-0 border-transparent rounded-full animate-spin", c.top, sizeClasses[size])} 
        style={{ animationDuration: "0.8s" }} 
      />
      <div 
        className={cn("absolute rounded-full animate-spin border-transparent", c.bottom)} 
        style={{ 
          top: "15%", left: "15%", right: "15%", bottom: "15%", 
          borderWidth: size === "sm" ? "1.5px" : "2px",
          animationDuration: "1.2s", 
          animationDirection: "reverse" 
        }} 
      />
      <div className={cn("rounded-full animate-pulse", innerSizeClasses[size], c.dot)} />
    </div>
  );
}
