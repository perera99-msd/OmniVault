"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface PremiumSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  color?: "emerald" | "tria" | "gold" | "white" | "zinc";
}

export function PremiumSpinner({ size = "md", className, color = "tria" }: PremiumSpinnerProps) {
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
    tria: {
      border: "border-[#E8E2D8] dark:border-white/10",
      top: "border-t-[#987B5E]",
      bottom: "border-b-[#213F33]",
      dot: "bg-[#987B5E]",
    },
    gold: {
      border: "border-[#E8E2D8] dark:border-white/10",
      top: "border-t-[#987B5E]",
      bottom: "border-b-[#D4B48A]",
      dot: "bg-[#987B5E]",
    },
    emerald: {
      border: "border-[#E8E2D8] dark:border-white/10",
      top: "border-t-[#213F33]",
      bottom: "border-b-[#4E6C5F]",
      dot: "bg-[#213F33]",
    },
    white: {
      border: "border-white/20",
      top: "border-t-white",
      bottom: "border-b-white/80",
      dot: "bg-white",
    },
    zinc: {
      border: "border-[#E8E2D8] dark:border-white/10",
      top: "border-t-[#1A1D1A] dark:border-t-white",
      bottom: "border-b-[#6C5B4C] dark:border-b-[#9A9EA4]",
      dot: "bg-[#1A1D1A] dark:bg-white",
    },
  };

  const c = colorClasses[color] || colorClasses.tria;

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
