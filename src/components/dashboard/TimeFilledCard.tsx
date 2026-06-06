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

  // Framer Motion variants
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
      className="relative flex flex-col bg-white dark:bg-[#121214] border border-zinc-100 dark:border-zinc-800/60 rounded-[2rem] p-6 sm:p-8 shadow-2xl shadow-zinc-200/40 dark:shadow-none overflow-hidden group"
    >
      {/* Soft Background Glow Blob */}
      <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] opacity-20 pointer-events-none transition-colors duration-700 ${isIncome ? 'bg-emerald-500' : 'bg-rose-500'}`} />

      {/* Header */}
      <div className="flex items-start justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${isIncome ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-rose-50 dark:bg-rose-500/10'}`}>
            {isIncome ? <TrendingUp className="w-6 h-6 text-emerald-500 dark:text-emerald-400" /> : <TrendingDown className="w-6 h-6 text-rose-500 dark:text-rose-400" />}
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">{label}</h3>
        </div>

        {/* Floating Minimal Pill Toggle */}
        <div className="flex bg-zinc-50 dark:bg-[#1a1a1c] p-1 rounded-xl shadow-inner border border-zinc-200/50 dark:border-zinc-800/50">
          {(["Day", "Month", "Year"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="relative px-3 py-1.5 text-xs font-bold rounded-lg transition-colors z-10"
            >
              {period === p && (
                <motion.div
                  layoutId={`pill-indicator-${label}`}
                  className="absolute inset-0 bg-white dark:bg-zinc-800 rounded-lg shadow-sm"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className={`relative z-10 ${period === p ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
                {p}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Amount Display with Animated Numbers */}
      <div className="mb-10 relative z-10 min-h-[4rem] flex items-center">
        <span className="text-2xl text-zinc-400 dark:text-zinc-500 font-medium mr-1.5 self-start mt-2">{currencySymbol}</span>
        <AnimatePresence mode="popLayout">
          <motion.p 
            key={period}
            variants={numberVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="text-[3rem] sm:text-[3.5rem] font-black tracking-tighter text-zinc-900 dark:text-white leading-none"
          >
            {displayAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Premium Progress Track */}
      <div className="mt-auto space-y-4 relative z-10">
        <div className="flex justify-between items-center text-xs font-bold tracking-wide uppercase">
          <span className="text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {period} Cycle
          </span>
          <span className="text-zinc-900 dark:text-zinc-300 font-black">{timeProgress.toFixed(1)}%</span>
        </div>
        
        <div className="relative h-3 w-full bg-zinc-100 dark:bg-zinc-800/80 rounded-full overflow-hidden shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${timeProgress}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={`absolute top-0 left-0 h-full rounded-full ${isIncome ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-rose-400 to-rose-500'}`}
          />
        </div>
      </div>
    </motion.div>
  );
}