"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";

interface TriaLogoProps {
  className?: string;
  size?: number;
  variant?: "auto" | "light" | "dark";
}

export function TriaLogo({ className, size = 36, variant = "auto" }: TriaLogoProps) {
  return (
    <div 
      className={cn("relative inline-flex items-center justify-center shrink-0 select-none", className)}
      style={{ width: size, height: size }}
    >
      {/* Light Mode 3D Metallic Emblem */}
      {(variant === "light" || variant === "auto") && (
        <img
          src="/Logos/tria-logo-light.png"
          alt="Tria Logo"
          width={size}
          height={size}
          className={cn(
            "w-full h-full object-contain drop-shadow-sm transition-opacity duration-300",
            variant === "auto" && "dark:hidden"
          )}
        />
      )}

      {/* Dark Mode 3D Metallic Emblem */}
      {(variant === "dark" || variant === "auto") && (
        <img
          src="/Logos/tria-logo-dark.png"
          alt="Tria Logo"
          width={size}
          height={size}
          className={cn(
            "w-full h-full object-contain drop-shadow-md transition-opacity duration-300",
            variant === "auto" ? "hidden dark:block" : "block"
          )}
        />
      )}
    </div>
  );
}
