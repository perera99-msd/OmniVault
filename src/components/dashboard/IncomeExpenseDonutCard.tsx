"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ArrowDownLeft, ArrowUpRight, ChevronDown } from "lucide-react";

interface IncomeExpenseDonutCardProps {
  currencySymbol?: string;
  incomeData: {
    today: number;
    lastWeek?: number;
    month: number;
    lastMonth?: number;
    last3Months?: number;
    year: number;
  };
  expenseData: {
    today: number;
    lastWeek?: number;
    month: number;
    lastMonth?: number;
    last3Months?: number;
    year: number;
  };
}

type Period = "Day" | "Last Wk" | "Month" | "Last Mo" | "3M" | "Year";

const PERIOD_OPTIONS: { label: string; value: Period }[] = [
  { label: "Day", value: "Day" },
  { label: "Last Wk", value: "Last Wk" },
  { label: "Month", value: "Month" },
  { label: "Last Mo", value: "Last Mo" },
  { label: "3M", value: "3M" },
  { label: "Year", value: "Year" },
];

export function IncomeExpenseDonutCard({
  currencySymbol = "$",
  incomeData,
  expenseData,
}: IncomeExpenseDonutCardProps) {
  const [period, setPeriod] = useState<Period>("Month");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const incomeAmount = useMemo(() => {
    if (period === "Day") return incomeData.today;
    if (period === "Last Wk") return incomeData.lastWeek ?? 0;
    if (period === "Month") return incomeData.month;
    if (period === "Last Mo") return incomeData.lastMonth ?? 0;
    if (period === "3M") return incomeData.last3Months ?? 0;
    return incomeData.year;
  }, [period, incomeData]);

  const expenseAmount = useMemo(() => {
    if (period === "Day") return expenseData.today;
    if (period === "Last Wk") return expenseData.lastWeek ?? 0;
    if (period === "Month") return expenseData.month;
    if (period === "Last Mo") return expenseData.lastMonth ?? 0;
    if (period === "3M") return expenseData.last3Months ?? 0;
    return expenseData.year;
  }, [period, expenseData]);

  const chartData = useMemo(() => {
    if (incomeAmount === 0 && expenseAmount === 0) {
      return [{ name: "No Data", value: 1, color: "#9A9EA4" }];
    }
    return [
      { name: "Income", value: incomeAmount, color: "#213F33" },
      { name: "Spent", value: expenseAmount, color: "#7A6652" },
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
        <div className="bg-[#FDFBF7] dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/10 px-4 py-2 rounded-xl shadow-lg">
          <p className="text-[10px] font-black text-[#987B5E] uppercase tracking-widest mb-0.5">{data.name}</p>
          <p className="text-base font-black text-[#1A1D1A] dark:text-[#EBE8E3] tracking-tight flex items-center gap-0.5">
            <span className="text-[#987B5E] text-sm">{currencySymbol}</span>
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
      className="relative flex flex-col h-full bg-white dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/5 rounded-[2.5rem] p-5 xl:p-8 shadow-sm overflow-visible xl:overflow-hidden group hover:border-[#987B5E]/30 transition-colors duration-500 justify-between"
    >
      {/* Background Subtle Glows */}
      <div className="absolute top-0 left-0 w-28 h-28 bg-[#213F33]/10 dark:bg-[#385A4D]/10 rounded-full blur-[50px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-28 h-28 bg-[#987B5E]/10 rounded-full blur-[50px] pointer-events-none" />

      {/* Mobile Header Row */}
      <div className="flex xl:hidden items-center justify-between w-full mb-3 relative z-30">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#987B5E] dark:text-[#D4B48A]">Cash Flow</span>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FAF8F3] dark:bg-[#202420] shadow-sm border border-[#E8E2D8] dark:border-white/10 hover:bg-[#EFE9E0] transition-all active:scale-95"
          >
            <span className="text-[10px] font-black uppercase tracking-wider text-[#1A1D1A] dark:text-[#EBE8E3]">
              {PERIOD_OPTIONS.find((o) => o.value === period)?.label || period}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-[#6C5B4C] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-36 bg-[#FDFBF7] dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 p-1.5 flex flex-col gap-0.5"
              >
                {PERIOD_OPTIONS.map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => {
                      setPeriod(value);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                      period === value
                        ? "bg-[#213F33]/10 text-[#213F33] dark:text-[#EBE8E3] font-black"
                        : "text-[#6C5B4C] dark:text-[#9A9EA4] hover:bg-[#FAF8F3] dark:hover:bg-[#202420]"
                    }`}
                  >
                    <span>{label}</span>
                    {period === value && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#987B5E]" />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Desktop Floating Segmented Toggle */}
      <div className="hidden xl:flex absolute top-6 right-6 z-20 bg-[#FAF8F3] dark:bg-[#202420] p-1 rounded-xl shadow-inner border border-[#E8E2D8] dark:border-white/5 items-center gap-0.5">
        {PERIOD_OPTIONS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setPeriod(value)}
            className="relative px-2.5 py-1 text-[10.5px] font-black rounded-lg transition-colors z-10"
          >
            {period === value && (
              <motion.div
                layoutId={`donut-pill-indicator`}
                className="absolute inset-0 bg-white dark:bg-[#272D27] rounded-lg shadow-sm border border-[#E8E2D8] dark:border-white/5"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className={`relative z-10 ${period === value ? "text-[#1A1D1A] dark:text-[#EBE8E3]" : "text-[#6C5B4C] hover:text-[#1A1D1A] dark:text-[#9A9EA4] dark:hover:text-white"}`}>
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* Main Content Row */}
      <div className="flex flex-row items-center justify-between w-full h-full relative z-10">
        {/* Left Side: Stats */}
        <div className="flex flex-col justify-center gap-5 xl:gap-8 w-[55%] min-w-0">
          {/* Income Stat */}
          <div className="group/stat overflow-hidden">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 xl:w-8 xl:h-8 rounded-full bg-[#213F33]/10 border border-[#213F33]/20 flex items-center justify-center text-[#213F33] dark:text-[#4E6C5F] shrink-0">
                <ArrowDownLeft className="w-4 h-4" strokeWidth={3} />
              </div>
              <p className="text-[10px] xl:text-[11px] font-black text-[#6C5B4C] dark:text-[#9A9EA4] uppercase tracking-[0.2em] truncate">Income</p>
            </div>
            <div className="flex items-center w-full">
              <span className="text-lg xl:text-xl text-[#987B5E] font-bold mr-1 self-start mt-0.5 shrink-0">{currencySymbol}</span>
              <AnimatePresence mode="popLayout">
                <motion.p
                  key={`income-${period}`}
                  variants={numberVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="text-3xl sm:text-4xl md:text-[34px] xl:text-[40px] font-black tracking-tight text-[#213F33] dark:text-[#4E6C5F] drop-shadow-sm truncate pr-2 min-w-0 font-heading"
                >
                  {incomeAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          {/* Spent Stat */}
          <div className="group/stat overflow-hidden">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 xl:w-8 xl:h-8 rounded-full bg-[#7A6652]/10 border border-[#7A6652]/20 flex items-center justify-center text-[#7A6652] dark:text-[#D4B48A] shrink-0">
                <ArrowUpRight className="w-4 h-4" strokeWidth={3} />
              </div>
              <p className="text-[10px] xl:text-[11px] font-black text-[#6C5B4C] dark:text-[#9A9EA4] uppercase tracking-[0.2em] truncate">Expenses</p>
            </div>
            <div className="flex items-center w-full">
              <span className="text-lg xl:text-xl text-[#987B5E] font-bold mr-1 self-start mt-0.5 shrink-0">{currencySymbol}</span>
              <AnimatePresence mode="popLayout">
                <motion.p
                  key={`spent-${period}`}
                  variants={numberVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="text-3xl sm:text-4xl md:text-[34px] xl:text-[40px] font-black tracking-tight text-[#1A1D1A] dark:text-[#EBE8E3] truncate pr-2 min-w-0 font-heading"
                >
                  {expenseAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Side: Donut Chart */}
        <div className="w-[45%] h-[120px] md:h-[140px] xl:h-full flex items-center justify-center relative">
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
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center Text */}
          {incomeAmount === 0 && expenseAmount === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="text-[#9A9EA4] text-[10px] font-bold uppercase tracking-widest">No Data</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
