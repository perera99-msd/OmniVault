"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const FULL_MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

interface TransactionMonthPickerProps {
  currentFilter: string;
  basePath?: string;
  defaultFilter?: string;
}

export function TransactionMonthPicker({
  currentFilter,
  basePath = "/transactions",
  defaultFilter = "THIS_MONTH",
}: TransactionMonthPickerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const now = new Date();
  const currentYearNow = now.getFullYear();

  // Parse active custom month if selected
  const isCustomMonth = currentFilter.startsWith("MONTH:") || /^\d{4}-\d{2}$/.test(currentFilter);
  let activeYear = currentYearNow;
  let activeMonthIndex = -1; // 0-11

  if (isCustomMonth) {
    const clean = currentFilter.replace("MONTH:", "");
    const [yStr, mStr] = clean.split("-");
    activeYear = parseInt(yStr, 10) || currentYearNow;
    activeMonthIndex = (parseInt(mStr, 10) || 1) - 1;
  }

  // State for navigating years inside picker
  const [viewYear, setViewYear] = useState<number>(activeYear);

  // When opening modal, synchronize viewYear to activeYear
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setViewYear(activeYear);
    }
    setOpen(newOpen);
  };

  const handleSelectMonth = (monthIndex: number) => {
    const mStr = String(monthIndex + 1).padStart(2, "0");
    router.push(`${basePath}?filter=MONTH:${viewYear}-${mStr}`);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    router.push(`${basePath}?filter=${defaultFilter}`);
  };

  const quickYears = [currentYearNow, currentYearNow - 1, currentYearNow - 2, currentYearNow - 3, currentYearNow - 4];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <div className="flex items-center gap-1">
        <DialogTrigger
          render={
            <button
              type="button"
              className={cn(
                "w-full sm:w-auto px-3.5 sm:px-5 py-2.5 sm:py-2 rounded-xl text-xs sm:text-[13px] font-bold transition-all duration-300 whitespace-nowrap flex items-center justify-center gap-2 border sm:border-transparent",
                isCustomMonth
                  ? "bg-emerald-500 dark:bg-emerald-600 text-white shadow-md hover:bg-emerald-600 border-emerald-400"
                  : "bg-zinc-50 sm:bg-transparent dark:bg-zinc-800/60 sm:dark:bg-transparent text-zinc-600 sm:text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 sm:hover:bg-zinc-50 dark:hover:bg-zinc-800/80 border-zinc-200/50 sm:border-transparent dark:border-zinc-700/50"
              )}
            />
          }
        >
          <Calendar className="w-3.5 h-3.5 shrink-0" />
          <span>
            {isCustomMonth && activeMonthIndex >= 0
              ? `${FULL_MONTH_NAMES[activeMonthIndex]} ${activeYear}`
              : "Select Month"}
          </span>
        </DialogTrigger>

        {isCustomMonth && (
          <button
            type="button"
            onClick={handleClear}
            title="Reset to This Month"
            className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-500/20 text-zinc-400 hover:text-rose-500 flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <DialogContent className="sm:max-w-md bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/5 shadow-2xl p-6 rounded-[2rem]">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-emerald-500" /> Select Ledger Month
          </DialogTitle>
          <DialogDescription className="text-zinc-500 font-medium text-xs sm:text-sm">
            Select any month from past or current years to view ledger history.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Year Controls */}
          <div className="bg-zinc-50 dark:bg-white/5 rounded-2xl p-3 border border-zinc-200/60 dark:border-white/5">
            <div className="flex items-center justify-between mb-2.5">
              <button
                type="button"
                onClick={() => setViewYear((y) => y - 1)}
                className="w-9 h-9 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="text-center">
                <span className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                  {viewYear}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewYear((y) => y + 1)}
                className="w-9 h-9 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Year Jump Chips */}
            <div className="flex items-center justify-center gap-1.5 flex-wrap pt-1 border-t border-zinc-200/50 dark:border-zinc-800/50">
              {quickYears.map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setViewYear(y)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-bold transition-all",
                    viewYear === y
                      ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xs"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-800"
                  )}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>

          {/* 12 Months Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            {MONTH_NAMES.map((mName, idx) => {
              const isSelected = isCustomMonth && viewYear === activeYear && idx === activeMonthIndex;
              const isCurrentCalendarMonth = viewYear === currentYearNow && idx === now.getMonth();

              return (
                <button
                  key={mName}
                  type="button"
                  onClick={() => handleSelectMonth(idx)}
                  className={cn(
                    "py-3.5 px-3 rounded-2xl font-bold text-sm transition-all duration-200 flex flex-col items-center justify-center relative border",
                    isSelected
                      ? "bg-emerald-500 dark:bg-emerald-600 text-white border-emerald-400 shadow-md scale-[1.02]"
                      : isCurrentCalendarMonth
                        ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 hover:border-emerald-400"
                        : "bg-zinc-50 dark:bg-[#18181b] text-zinc-700 dark:text-zinc-300 border-zinc-200/60 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700"
                  )}
                >
                  <span>{mName}</span>
                  {isCurrentCalendarMonth && !isSelected && (
                    <span className="text-[9px] font-black uppercase text-emerald-500 mt-0.5 tracking-wider">
                      Current
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
