"use client";

import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { PieChart } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";

interface AssetDonutChartProps {
  data: {
    category: string;
    unmortgagedValue: number;
    totalValue: number;
    count: number;
  }[];
  baseCurrency?: string;
  currencySymbol?: string;
  mode?: "UNMORTGAGED" | "TOTAL";
}

const CATEGORY_LABELS: Record<string, string> = {
  GOLD: "Gold & Jewelry",
  REAL_ESTATE: "Real Estate & Lands",
  BUSINESS: "Business & Shops",
  VEHICLE: "Vehicles",
  OTHER: "Other Assets",
};

const CATEGORY_COLORS: Record<string, string> = {
  GOLD: "#f59e0b", // Amber/Gold
  REAL_ESTATE: "#10b981", // Emerald
  BUSINESS: "#3b82f6", // Blue
  VEHICLE: "#8b5cf6", // Violet
  OTHER: "#ec4899", // Pink
};

export function AssetDonutChart({ data, baseCurrency = "LKR", mode = "UNMORTGAGED" }: AssetDonutChartProps) {
  const chartData = data
    .map((item) => ({
      name: CATEGORY_LABELS[item.category] || item.category,
      category: item.category,
      value: mode === "UNMORTGAGED" ? item.unmortgagedValue : item.totalValue,
      count: item.count,
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-400 dark:text-zinc-600 font-medium text-sm p-8">
        <PieChart className="w-10 h-10 mb-3 opacity-40" />
        <p className="text-center font-bold">No asset wealth logged yet</p>
        <p className="text-xs text-zinc-400 text-center mt-1">Add assets to view portfolio distribution</p>
      </div>
    );
  }

  const total = chartData.reduce((sum, c) => sum + c.value, 0);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="w-full relative flex items-center justify-center h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPie>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius="65%"
              outerRadius="85%"
              paddingAngle={4}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category] || "#71717a"} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const dataItem = payload[0].payload;
                  const percentage = total > 0 ? ((dataItem.value / total) * 100).toFixed(1) : "0";
                  return (
                    <div className="bg-white/95 dark:bg-[#18181b]/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-zinc-200/80 dark:border-white/10">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: CATEGORY_COLORS[dataItem.category] || "#71717a" }}
                        />
                        <p className="font-bold text-xs text-zinc-900 dark:text-white">{dataItem.name}</p>
                      </div>
                      <p className="text-sm font-black text-zinc-900 dark:text-white">
                        {formatCurrency(dataItem.value, baseCurrency)}
                      </p>
                      <p className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 mt-0.5">
                        {percentage}% of {mode === "UNMORTGAGED" ? "unmortgaged wealth" : "portfolio"} ({dataItem.count} {dataItem.count === 1 ? "item" : "items"})
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </RechartsPie>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            {mode === "UNMORTGAGED" ? "Available" : "Portfolio"}
          </span>
          <span className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">
            {formatCurrency(total, baseCurrency)}
          </span>
        </div>
      </div>

      <div className="w-full grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-zinc-100 dark:border-white/5">
        {chartData.map((item) => {
          const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <div key={item.category} className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/40 px-3 py-2 rounded-xl border border-zinc-200/50 dark:border-white/5">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: CATEGORY_COLORS[item.category] || "#71717a" }}
                />
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 truncate">{item.name}</span>
              </div>
              <span className="text-xs font-black text-zinc-900 dark:text-white ml-2 shrink-0">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
