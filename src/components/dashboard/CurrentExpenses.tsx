"use client";
import { useState, useEffect, useMemo } from "react";
import { Activity } from "lucide-react";

export function CurrentExpenses({ expenses }: { expenses: { today: number; month: number; year: number } }) {
    const [period, setPeriod] = useState<"Day" | "Month" | "Year">("Month");
    const [timeProgress, setTimeProgress] = useState(0);

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
                progress = (diff / (1000 * 60 * 60 * 24) / 365.25) * 100;
            }
            setTimeProgress(Math.min(100, Math.max(0, progress)));
        };
        updateProgress();
        const interval = setInterval(updateProgress, 60000);
        return () => clearInterval(interval);
    }, [period]);

    const displayAmount = useMemo(() => {
        if (period === "Day") return expenses.today;
        if (period === "Month") return expenses.month;
        return expenses.year;
    }, [period, expenses]);

    return (
        <div className="relative overflow-hidden rounded-[2rem] bg-[#ffffff]/60 dark:bg-[#424242]/40 backdrop-blur-2xl border border-[#d7ccc8]/50 dark:border-[#616161]/50 shadow-xl p-6 transition-colors duration-500">
            {/* Background Lumini Fill */}
            <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-500/10 to-transparent transition-all duration-1000 ease-out z-0"
                style={{ width: `${timeProgress}%` }}
            />
            <div
                className="absolute top-0 bottom-0 w-[2px] bg-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.5)] z-0 transition-all duration-1000"
                style={{ left: `${timeProgress}%` }}
            />

            <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
                            <Activity className="w-4 h-4 text-red-500" />
                        </div>
                        <h3 className="font-extrabold text-[#8d6e63] dark:text-[#ffffff]">Live Expenses</h3>
                    </div>

                    <div className="flex bg-[#f5f5f5] dark:bg-[#212121] p-1 rounded-full border border-[#d7ccc8] dark:border-[#616161]">
                        {(["Day", "Month", "Year"] as const).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full transition-all ${period === p
                                        ? "bg-[#ffffff] dark:bg-[#424242] text-[#003300] dark:text-[#ffffff] shadow-sm"
                                        : "text-[#a1887f] dark:text-[#9e9e9e] hover:text-[#8d6e63]"
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <p className="text-[3rem] font-black tracking-tighter text-[#003300] dark:text-[#ffffff] leading-none drop-shadow-sm">
                        <span className="text-xl opacity-50 mr-1">$</span>
                        {displayAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                </div>

                <div className="mt-6 flex justify-between items-end">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#a1887f] dark:text-[#9e9e9e]">Time Elapsed</p>
                        <p className="text-sm font-bold text-[#8d6e63] dark:text-[#d7ccc8]">{timeProgress.toFixed(0)}% of {period}</p>
                    </div>
                    <p className="text-[10px] font-bold text-[#a1887f] dark:text-[#616161] max-w-[120px] text-right leading-tight">
                        Filling according to current {period.toLowerCase()} time.
                    </p>
                </div>
            </div>
        </div>
    );
}