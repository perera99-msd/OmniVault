"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

interface IncomeExpenseDonutCardProps {
  currencySymbol?: string;
  incomeData: { today: number; month: number; year: number };
  expenseData: { today: number; month: number; year: number };
}

type Period = "Day" | "Month" | "Year";

export function IncomeExpenseDonutCard({
  currencySymbol = "$",
  incomeData,
  expenseData,
}: IncomeExpenseDonutCardProps) {
  const [period, setPeriod] = useState<Period>("Month");

  const incomeAmount = useMemo(() => {
    if (period === "Day") return incomeData.today;
    if (period === "Month") return incomeData.month;
    return incomeData.year;
  }, [period, incomeData]);

  const expenseAmount = useMemo(() => {
    if (period === "Day") return expenseData.today;
    if (period === "Month") return expenseData.month;
    return expenseData.year;
  }, [period, expenseData]);

  const chartData = useMemo(() => {
    // Prevent empty chart breaking
    if (incomeAmount === 0 && expenseAmount === 0) {
      return [{ name: "No Data", value: 1, color: "#3f3f46" }];
    }
    return [
      { name: "Income", value: incomeAmount, color: "#10b981" },
      { name: "Spent", value: expenseAmount, color: "#f43f5e" },
    ];
  }, [incomeAmount, expenseAmount]);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
  };

  const numberVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      if (data.name === "No Data") return null;
      return (
        <div className="bg-white/90 dark:bg-[#121214]/90 backdrop-blur-xl border border-zinc-200/50 dark:border-white/10 px-4 py-2 rounded-xl shadow-lg">
          <p className="text-[11px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1">{data.name}</p>
          <p className="text-lg font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-0.5">
            <span className="text-zinc-400 dark:text-zinc-500 text-sm">{currencySymbol}</span>
            {data.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      variants={cardVariants}
      className="relative flex flex-row h-full bg-white/70 dark:bg-[#121214]/70 backdrop-blur-3xl border border-zinc-200/50 dark:border-white/5 rounded-[2rem] p-5 xl:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-none overflow-hidden group hover:border-zinc-300/50 dark:hover:border-white/10 transition-colors duration-500"
    >
      {/* Floating Toggle */}
      <div className="absolute top-4 right-4 xl:top-6 xl:right-6 z-20 flex bg-zinc-100 dark:bg-[#18181b] p-1 rounded-xl shadow-inner border border-zinc-200/50 dark:border-white/5">
        {(["Day", "Month", "Year"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className="relative px-2 py-1 xl:px-3 text-[9px] xl:text-xs font-bold rounded-lg transition-colors z-10"
          >
            {period === p && (
              <motion.div
                layoutId={`donut-pill-indicator`}
                className="absolute inset-0 bg-white dark:bg-[#27272a] rounded-lg shadow-sm"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className={`relative z-10 ${period === p ? "text-zinc-900 dark:text-white" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}>
              {p}
            </span>
          </button>
        ))}
      </div>

      {/* Background Soft Glows */}
      <div className="absolute top-0 left-0 w-24 h-24 xl:w-32 xl:h-32 bg-emerald-500/10 rounded-full blur-[40px] xl:blur-[60px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-24 h-24 xl:w-32 xl:h-32 bg-rose-500/10 rounded-full blur-[40px] xl:blur-[60px] pointer-events-none" />

      {/* Left Side: Stats */}
      <div className="flex flex-col justify-center gap-6 xl:gap-8 z-10 w-[55%] relative min-w-0">
        {/* Income Stat */}
        <div className="group/stat overflow-hidden">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 xl:w-8 xl:h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.15)] group-hover/stat:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all shrink-0">
              <ArrowDownLeft className="w-4 h-4 xl:w-4 xl:h-4 text-emerald-500" strokeWidth={3} />
            </div>
            <p className="text-[11px] xl:text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.15em] truncate">Income</p>
          </div>
          <div className="flex items-center w-full">
            <span className="text-lg xl:text-xl text-zinc-400 dark:text-zinc-500 font-bold mr-1 self-start mt-0.5 xl:mt-1 shrink-0">{currencySymbol}</span>
            <AnimatePresence mode="popLayout">
              <motion.p
                key={`income-${period}`}
                variants={numberVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="text-3xl sm:text-4xl md:text-[36px] xl:text-[42px] font-black tracking-tight text-emerald-600 dark:text-emerald-400 drop-shadow-sm truncate pr-2 min-w-0"
              >
                {incomeAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Spent Stat */}
        <div className="group/stat overflow-hidden">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 xl:w-8 xl:h-8 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(244,63,94,0.15)] group-hover/stat:shadow-[0_0_20px_rgba(244,63,94,0.3)] transition-all shrink-0">
              <ArrowUpRight className="w-4 h-4 xl:w-4 xl:h-4 text-rose-500" strokeWidth={3} />
            </div>
            <p className="text-[11px] xl:text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.15em] truncate">Spent</p>
          </div>
          <div className="flex items-center w-full">
            <span className="text-lg xl:text-xl text-zinc-400 dark:text-zinc-500 font-bold mr-1 self-start mt-0.5 xl:mt-1 shrink-0">{currencySymbol}</span>
            <AnimatePresence mode="popLayout">
              <motion.p
                key={`spent-${period}`}
                variants={numberVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="text-3xl sm:text-4xl md:text-[36px] xl:text-[42px] font-black tracking-tight text-zinc-900 dark:text-white truncate pr-2 min-w-0"
              >
                {expenseAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Right Side: Donut Chart */}
      <div className="w-[45%] h-[110px] md:h-[130px] xl:h-full flex items-center justify-center relative z-10 mt-10 xl:mt-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius="65%"
              outerRadius="90%"
              paddingAngle={5}
              dataKey="value"
              stroke="none"
              cornerRadius={8}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} className="drop-shadow-sm" />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Text */}
        {incomeAmount === 0 && expenseAmount === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-zinc-400 dark:text-zinc-600 text-[10px] xl:text-xs font-bold uppercase tracking-widest">No Data</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
