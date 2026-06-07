"use client";

import { useState, useEffect, useMemo } from "react";
import { ArrowDownLeft } from "lucide-react";

interface InflowData {
  earnedToday: number;
  earnedThisMonth: number;
  earnedThisYear: number;
}

interface InflowWidgetProps {
  inflowData: InflowData;
}

type Period = "Today" | "This Month" | "This Year";

export function InflowWidget({ inflowData }: InflowWidgetProps) {
  const [period, setPeriod] = useState<Period>("This Month");
  const [timeProgress, setTimeProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const now = new Date();
      let progress = 0;
      if (period === "Today") {
        const minutesPassed = now.getHours() * 60 + now.getMinutes();
        progress = (minutesPassed / 1440) * 100;
      } else if (period === "This Month") {
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        progress = (now.getDate() / daysInMonth) * 100;
      } else if (period === "This Year") {
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now.getTime() - start.getTime();
        progress = (diff / (1000 * 60 * 60 * 24) / 365.25) * 100;
      }
      setTimeProgress(Math.min(100, Math.max(0, progress)));
    };
    updateProgress();
    const interval = setInterval(updateProgress, 60000);
    return () => clearInterval(interval);
  }, [period]);

  const displayAmount = useMemo(() => {
    if (period === "Today") return inflowData.earnedToday;
    if (period === "This Month") return inflowData.earnedThisMonth;
    return inflowData.earnedThisYear;
  }, [period, inflowData]);

  return (
    <div className="bg-white dark:bg-[#161917] border border-zinc-200 dark:border-white/5 rounded-[2.5rem] p-6 sm:p-8 shadow-xl relative overflow-hidden group transition-colors duration-300">
      
      {/* Ambient Fill based on earning */}
      <div 
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#009900]/5 dark:from-[#66cc66]/10 to-transparent transition-all duration-1000 ease-in-out pointer-events-none z-0"
        style={{ width: `${timeProgress}%` }}
      />
      <div 
        className="absolute top-0 bottom-0 w-[2px] bg-[#009900]/20 dark:bg-[#66cc66]/40 transition-all duration-1000 ease-in-out shadow-[0_0_10px_rgba(0,153,0,0.3)] z-0 pointer-events-none"
        style={{ left: `${timeProgress}%` }}
      />

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            <ArrowDownLeft className="w-5 h-5 text-[#009900] dark:text-[#66cc66]" /> Inflow
          </h3>
          <div className="bg-zinc-100 dark:bg-black/30 p-1 rounded-full flex gap-1 border border-zinc-200 dark:border-white/5 backdrop-blur-md">
            {(["Today", "This Month", "This Year"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-full uppercase tracking-wider transition-all duration-300 ${
                  period === p 
                    ? "bg-white dark:bg-white/10 text-zinc-900 dark:text-white shadow-sm" 
                    : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] mb-1">
            Total Earned {period}
          </p>
          <p className="text-4xl sm:text-5xl font-black text-zinc-900 dark:text-white tracking-tighter drop-shadow-sm">
            LKR {displayAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="mt-5 pt-5 border-t border-zinc-100 dark:border-white/5 flex justify-between items-center text-xs font-semibold">
          <p className="text-zinc-500">Timeline Progression:</p>
          <p className="text-[#009900] dark:text-[#66cc66] font-black tracking-wider">{timeProgress.toFixed(0)}%</p>
        </div>
      </div>
    </div>
  );
}
