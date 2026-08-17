"use client";
import { useState, useEffect, useMemo } from "react";
import { TrendingDown, TrendingUp, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TimeFilledCardProps {
  label: string;
  variant: "expense" | "income";
  currencySymbol?: string;
  data: { today: number; month: number; year: number };
}

type Period = "Day" | "Month" | "Year";

export function TimeFilledCard({ label, variant, data, currencySymbol = "$" }: TimeFilledCardProps) {
  const [period, setPeriod] = useState<Period>("Month");
  const [timeProgress, setTimeProgress] = useState(0);

  const isIncome = variant === "income";

  useEffect(() => {
    const updateProgress = () => {
      const now = new Date();
      let progress = 0;
      if (period === "Day") {
        progress = ((now.getHours() * 60 + now.getMinutes()) / 1440) * 100;
      } else if (period === "Month") {
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        progress = (now.getDate() / daysInMonth) * 100;
      } else {
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now.getTime() - start.getTime();
        const isLeap = (now.getFullYear() % 4 === 0 && now.getFullYear() % 100 !== 0) || now.getFullYear() % 400 === 0;
        progress = (diff / (1000 * 60 * 60 * 24) / (isLeap ? 366 : 365)) * 100;
      }
      setTimeProgress(Math.min(100, Math.max(0, progress)));
    };
    updateProgress();
    const interval = setInterval(updateProgress, 60000);
    return () => clearInterval(interval);
  }, [period]);

  const displayAmount = useMemo(() => {
    if (period === "Day") return data.today;
    if (period === "Month") return data.month;
    return data.year;
  }, [period, data]);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } }
  };

  const numberVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  };

  return (
    <motion.div 
      variants={cardVariants}
      className="relative flex flex-col h-full bg-white/80 dark:bg-[#181B18]/80 backdrop-blur-3xl border border-[#E8E2D8] dark:border-white/10 rounded-3xl p-5 xl:p-8 shadow-sm overflow-hidden group hover:border-[#987B5E]/30 transition-colors duration-500"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4 xl:mb-8 relative z-10">
        <div className="flex items-center gap-2 xl:gap-3">
          <div className={`w-9 h-9 xl:w-11 xl:h-11 rounded-[12px] xl:rounded-[14px] flex items-center justify-center shadow-inner ${isIncome ? 'bg-[#213F33]/10 text-[#213F33] dark:text-[#4E6C5F]' : 'bg-[#987B5E]/10 text-[#7A6652] dark:text-[#D4B48A]'}`}>
            {isIncome ? <TrendingUp className="w-4 h-4 xl:w-5 xl:h-5" /> : <TrendingDown className="w-4 h-4 xl:w-5 xl:h-5" />}
          </div>
          <h3 className="text-base xl:text-[1.1rem] font-black text-[#1A1D1A] dark:text-[#EBE8E3] tracking-tight font-heading">{label}</h3>
        </div>

        {/* Floating Minimal Pill Toggle */}
        <div className="flex bg-[#FAF8F3] dark:bg-[#202420] p-1 rounded-xl shadow-inner border border-[#E8E2D8] dark:border-white/5">
          {(["Day", "Month", "Year"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="relative px-3 py-1 text-xs font-bold rounded-lg transition-colors z-10"
            >
              {period === p && (
                <motion.div
                  layoutId={`pill-indicator-${label}`}
                  className="absolute inset-0 bg-white dark:bg-[#181B18] rounded-lg shadow-sm border border-[#E8E2D8] dark:border-white/10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className={`relative z-10 ${period === p ? 'text-[#1A1D1A] dark:text-[#EBE8E3] font-black' : 'text-[#6C5B4C] dark:text-[#9A9EA4]'}`}>
                {p}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Amount Display with Animated Numbers */}
      <div className="mb-4 xl:mb-6 relative z-10 flex items-center">
        <span className="text-lg xl:text-xl text-[#987B5E] font-medium mr-2 self-start mt-1.5">{currencySymbol}</span>
        <AnimatePresence mode="popLayout">
          <motion.p 
            key={period}
            variants={numberVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="text-3xl xl:text-4xl font-black tracking-tight text-[#1A1D1A] dark:text-[#EBE8E3] font-heading"
          >
            {displayAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Premium Progress Track */}
      <div className="mt-auto space-y-2 relative z-10">
        <div className="flex justify-between items-center text-[10px] font-black tracking-widest uppercase text-[#6C5B4C] dark:text-[#9A9EA4]">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-[#987B5E]" />
            {period} Cycle
          </span>
          <span className="text-[#1A1D1A] dark:text-[#EBE8E3] font-black">{timeProgress.toFixed(1)}%</span>
        </div>
        
        <div className="relative h-1.5 w-full bg-[#FAF8F3] dark:bg-[#202420] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${timeProgress}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={`absolute top-0 left-0 h-full rounded-full ${isIncome ? 'bg-[#213F33] dark:bg-[#4E6C5F]' : 'bg-[#987B5E]'}`}
          />
        </div>
      </div>
    </motion.div>
  );
}