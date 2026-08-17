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

  const isCustomMonth = currentFilter.startsWith("MONTH:") || /^\d{4}-\d{2}$/.test(currentFilter);
  let activeYear = currentYearNow;
  let activeMonthIndex = -1;

  if (isCustomMonth) {
    const clean = currentFilter.replace("MONTH:", "");
    const [yStr, mStr] = clean.split("-");
    activeYear = parseInt(yStr, 10) || currentYearNow;
    activeMonthIndex = (parseInt(mStr, 10) || 1) - 1;
  }

  const [viewYear, setViewYear] = useState<number>(activeYear);

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
                  ? "btn-tria-primary text-[#FDFBF7] dark:text-[#EBE8E3] shadow-md border-transparent"
                  : "bg-[#FAF8F3] sm:bg-transparent dark:bg-[#202420] sm:dark:bg-transparent text-[#6C5B4C] sm:text-[#6C5B4C] hover:text-[#1A1D1A] dark:hover:text-white hover:bg-white dark:hover:bg-[#202420] border-[#E8E2D8] sm:border-transparent dark:border-white/5"
              )}
            />
          }
        >
          <Calendar className="w-3.5 h-3.5 text-[#987B5E] shrink-0" />
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
            className="w-7 h-7 rounded-lg bg-[#FAF8F3] dark:bg-[#202420] hover:bg-rose-50 dark:hover:bg-rose-500/20 text-[#6C5B4C] hover:text-rose-500 flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <DialogContent className="sm:max-w-md bg-[#FDFBF7] dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/10 shadow-2xl p-6 rounded-[2rem]">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-black tracking-tight text-[#1A1D1A] dark:text-[#EBE8E3] flex items-center gap-2.5 font-heading">
            <Calendar className="w-6 h-6 text-[#987B5E]" /> Select Ledger Month
          </DialogTitle>
          <DialogDescription className="text-[#6C5B4C] dark:text-[#9A9EA4] font-medium text-xs sm:text-sm">
            Select any month from past or current years to view ledger history.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Year Controls */}
          <div className="bg-white dark:bg-[#202420] rounded-2xl p-3 border border-[#E8E2D8] dark:border-white/10">
            <div className="flex items-center justify-between mb-2.5">
              <button
                type="button"
                onClick={() => setViewYear((y) => y - 1)}
                className="w-9 h-9 rounded-xl bg-[#FAF8F3] dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/10 flex items-center justify-center text-[#1A1D1A] dark:text-[#EBE8E3] hover:bg-white shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="text-center">
                <span className="text-2xl font-black text-[#1A1D1A] dark:text-[#EBE8E3] tracking-tight font-heading">
                  {viewYear}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewYear((y) => y + 1)}
                className="w-9 h-9 rounded-xl bg-[#FAF8F3] dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/10 flex items-center justify-center text-[#1A1D1A] dark:text-[#EBE8E3] hover:bg-white shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Year Jump Chips */}
            <div className="flex items-center justify-center gap-1.5 flex-wrap pt-1 border-t border-[#E8E2D8] dark:border-white/5">
              {quickYears.map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setViewYear(y)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-bold transition-all",
                    viewYear === y
                      ? "btn-tria-primary font-black shadow-xs"
                      : "text-[#6C5B4C] dark:text-[#9A9EA4] hover:text-[#1A1D1A] dark:hover:text-white hover:bg-[#FAF8F3] dark:hover:bg-[#181B18]"
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
                      ? "btn-tria-primary border-transparent shadow-md scale-[1.02] font-black"
                      : isCurrentCalendarMonth
                        ? "bg-[#213F33]/10 dark:bg-[#385A4D]/20 text-[#213F33] dark:text-[#EBE8E3] border-[#213F33]/30 dark:border-[#385A4D]/40 font-black"
                        : "bg-white dark:bg-[#202420] text-[#1A1D1A] dark:text-[#EBE8E3] border-[#E8E2D8] dark:border-white/10 hover:bg-[#FAF8F3] dark:hover:bg-[#272D27]"
                  )}
                >
                  <span>{mName}</span>
                  {isCurrentCalendarMonth && !isSelected && (
                    <span className="text-[9px] font-black uppercase text-[#987B5E] mt-0.5 tracking-wider">
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
