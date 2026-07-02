"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, ChevronDown, Check } from "lucide-react";
import * as motion from "framer-motion/client";
import { cn } from "@/lib/utils";
import { TransactionMonthPicker } from "@/components/transactions/TransactionMonthPicker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const CATEGORY_FILTER_OPTIONS = [
  { id: "Day", label: "Day" },
  { id: "Month", label: "Month" },
  { id: "Last Month", label: "Last Month" },
  { id: "Year", label: "Year" },
  { id: "All Time", label: "All Time" },
];

interface CategoriesFilterBarProps {
  currentFilter: string;
  onSelect?: (filter: string) => void;
}

export function CategoriesFilterBar({ currentFilter, onSelect }: CategoriesFilterBarProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isCustomMonth = currentFilter.startsWith("MONTH:") || /^\d{4}-\d{2}$/.test(currentFilter);
  const activeQuickFilter = CATEGORY_FILTER_OPTIONS.find((f) => f.id === currentFilter);

  const handleSelect = (id: string) => {
    if (onSelect) onSelect(id);
    router.push(`/categories?filter=${id}`);
    setMobileMenuOpen(false);
  };

  return (
    <div className="w-full">
      {/* ==========================================
          MOBILE VIEW (< 1024px): Sleek 2-Column Grid
         ========================================== */}
      <div className="flex lg:hidden w-full items-center gap-2 bg-white dark:bg-[#121214] p-2 rounded-2xl border border-zinc-200 dark:border-white/5 shadow-sm">
        {/* Left: Quick Timeframe Selector */}
        <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <DialogTrigger
            render={
              <button
                type="button"
                className={cn(
                  "flex-1 flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border",
                  !isCustomMonth && activeQuickFilter
                    ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30"
                    : "bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-300 border-zinc-200/50 dark:border-zinc-700/50"
                )}
              />
            }
          >
            <div className="flex items-center gap-2 truncate">
              <Zap className={cn("w-3.5 h-3.5 shrink-0", !isCustomMonth && activeQuickFilter ? "text-emerald-500" : "text-zinc-400")} />
              <span className="truncate">
                {!isCustomMonth && activeQuickFilter ? activeQuickFilter.label : "Quick Filter"}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 opacity-60 ml-1 shrink-0" />
          </DialogTrigger>

          <DialogContent className="sm:max-w-xs bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/5 shadow-2xl p-5 rounded-[2rem]">
            <DialogHeader className="mb-3">
              <DialogTitle className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-500" /> Timeframe Presets
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 py-1">
              {CATEGORY_FILTER_OPTIONS.map((opt) => {
                const isActive = currentFilter === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelect(opt.id)}
                    className={cn(
                      "px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all text-left",
                      isActive
                        ? "bg-emerald-500 text-white shadow-sm"
                        : "bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    )}
                  >
                    <span>{opt.label}</span>
                    {isActive && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>

        {/* Divider */}
        <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 shrink-0" />

        {/* Right: Custom Month Picker */}
        <div className="flex-1 min-w-0">
          <TransactionMonthPicker currentFilter={currentFilter} basePath="/categories" defaultFilter="Month" />
        </div>
      </div>

      {/* ==========================================
          DESKTOP VIEW (>= 1024px): Full Segmented Bar
         ========================================== */}
      <div className="hidden lg:flex w-full justify-end overflow-x-auto hide-scrollbar pb-2">
        <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/5 rounded-2xl w-max shadow-sm">
          {CATEGORY_FILTER_OPTIONS.map((opt) => {
            const isActive = currentFilter === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelect(opt.id)}
                className={cn(
                  "px-5 py-2 rounded-xl text-[13px] font-bold transition-all duration-300 whitespace-nowrap relative",
                  isActive
                    ? "text-white shadow-md"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeCategoryFilter"
                    className="absolute inset-0 bg-emerald-500 dark:bg-emerald-600 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{opt.label}</span>
              </button>
            );
          })}
          <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-800 mx-0.5 shrink-0" />
          <TransactionMonthPicker currentFilter={currentFilter} basePath="/categories" defaultFilter="Month" />
        </div>
      </div>
    </div>
  );
}
