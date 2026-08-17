"use client";

import { cn } from "@/lib/utils";

interface LogoTextProps {
  className?: string;
  showSubtitle?: boolean;
  subtitleClassName?: string;
}

export function LogoText({ className, showSubtitle = true, subtitleClassName }: LogoTextProps) {
  return (
    <div className="flex flex-col leading-none">
      <span className={cn("font-black tracking-tight flex items-center font-heading text-[#1A1D1A] dark:text-[#EBE8E3]", className)}>
        <span>Tria</span>
      </span>
      {showSubtitle && (
        <span className={cn("text-[9px] font-black tracking-[0.25em] text-[#987B5E] dark:text-[#987B5E] uppercase mt-0.5", subtitleClassName)}>
          Finance
        </span>
      )}
    </div>
  );
}
