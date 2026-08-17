"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Check, Zap } from "lucide-react";
import * as motion from "framer-motion/client";
import { cn } from "@/lib/utils";
import { TransactionMonthPicker } from "./TransactionMonthPicker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const FILTER_OPTIONS = [
  { id: "TODAY", label: "Today" },
  { id: "THIS_WEEK", label: "This Week" },
  { id: "THIS_MONTH", label: "This Month" },
  { id: "Q1", label: "Q1" },
  { id: "Q2", label: "Q2" },
  { id: "Q3", label: "Q3" },
  { id: "Q4", label: "Q4" },
  { id: "FULL_YEAR", label: "Full Year" },
];

interface TransactionsFilterBarProps {
  currentFilter: string;
}

export function TransactionsFilterBar({ currentFilter }: TransactionsFilterBarProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isCustomMonth = currentFilter.startsWith("MONTH:") || /^\d{4}-\d{2}$/.test(currentFilter);
  const activeQuickFilter = FILTER_OPTIONS.find((f) => f.id === currentFilter);

  const handleQuickSelect = (id: string) => {
    router.push(`/transactions?filter=${id}`);
    setMobileMenuOpen(false);
  };

  return (
    <div className="w-full">
      {/* MOBILE VIEW (< 1024px) */}
      <div className="flex lg:hidden w-full items-center gap-2 bg-white dark:bg-[#181B18] p-2 rounded-2xl border border-[#E8E2D8] dark:border-white/10 shadow-sm">
        <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <DialogTrigger
            render={
              <button
                type="button"
                className={cn(
                  "flex-1 flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border",
                  !isCustomMonth && activeQuickFilter
                    ? "bg-[#213F33]/10 dark:bg-[#385A4D]/20 text-[#213F33] dark:text-[#EBE8E3] border-[#213F33]/30 dark:border-[#385A4D]/40 font-black"
                    : "bg-[#FAF8F3] dark:bg-[#202420] text-[#6C5B4C] dark:text-[#9A9EA4] border-[#E8E2D8] dark:border-white/5"
                )}
              />
            }
          >
            <div className="flex items-center gap-2 truncate">
              <Zap className={cn("w-3.5 h-3.5 shrink-0", !isCustomMonth && activeQuickFilter ? "text-[#987B5E] dark:text-[#D4B48A]" : "text-[#9A9EA4]")} />
              <span className="truncate">
                {!isCustomMonth && activeQuickFilter ? activeQuickFilter.label : "Quick Filter"}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 opacity-60 ml-1 shrink-0" />
          </DialogTrigger>

          <DialogContent className="sm:max-w-xs bg-[#FDFBF7] dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/10 shadow-2xl p-5 rounded-[2rem]">
            <DialogHeader className="mb-3">
              <DialogTitle className="text-lg font-black tracking-tight text-[#1A1D1A] dark:text-[#EBE8E3] flex items-center gap-2 font-heading">
                <Zap className="w-5 h-5 text-[#987B5E]" /> Quick Timeframes
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-2 py-1">
              {FILTER_OPTIONS.map((opt) => {
                const isActive = currentFilter === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleQuickSelect(opt.id)}
                    className={cn(
                      "px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all text-left",
                      isActive
                        ? "btn-tria-primary font-black"
                        : "bg-[#FAF8F3] dark:bg-[#202420] text-[#6C5B4C] dark:text-[#9A9EA4] hover:bg-[#EFE9E0] dark:hover:bg-[#272D27]"
                    )}
                  >
                    <span>{opt.label}</span>
                    {isActive && <Check className="w-3.5 h-3.5 text-[#D4B48A]" />}
                  </button>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>

        <div className="h-6 w-px bg-[#E8E2D8] dark:border-white/10 shrink-0" />

        <div className="flex-1 min-w-0">
          <TransactionMonthPicker currentFilter={currentFilter} />
        </div>
      </div>

      {/* DESKTOP VIEW (>= 1024px) */}
      <div className="hidden lg:flex w-full overflow-x-auto hide-scrollbar pb-2">
        <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/10 rounded-2xl w-max shadow-sm">
          {FILTER_OPTIONS.map((opt) => {
            const isActive = currentFilter === opt.id;
            return (
              <Link
                key={opt.id}
                href={`/transactions?filter=${opt.id}`}
                className={cn(
                  "px-5 py-2 rounded-xl text-[13px] font-black transition-all duration-300 whitespace-nowrap relative",
                  isActive
                    ? "text-[#FDFBF7] dark:text-[#EBE8E3] shadow-md"
                    : "text-[#6C5B4C] hover:text-[#1A1D1A] dark:text-[#9A9EA4] dark:hover:text-white hover:bg-[#FAF8F3] dark:hover:bg-[#202420]"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTransactionFilter"
                    className="absolute inset-0 bg-gradient-to-r from-[#2B493D] to-[#213F33] dark:from-[#4E6C5F] dark:to-[#385A4D] rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{opt.label}</span>
              </Link>
            );
          })}
          <div className="h-5 w-px bg-[#E8E2D8] dark:border-white/10 mx-0.5 shrink-0" />
          <TransactionMonthPicker currentFilter={currentFilter} />
        </div>
      </div>
    </div>
  );
}
