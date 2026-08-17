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
  GOLD: "#987B5E", // Aged Gold
  REAL_ESTATE: "#213F33", // Heirloom Green
  BUSINESS: "#6C5B4C", // Walnut Brown
  VEHICLE: "#4E6C5F", // Laurel
  OTHER: "#53585F", // Stone Grey
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
      <div className="flex flex-col items-center justify-center h-full text-[#6C5B4C] dark:text-[#9A9EA4] font-medium text-sm p-8">
        <PieChart className="w-10 h-10 mb-3 opacity-40 text-[#987B5E]" />
        <p className="text-center font-bold">No asset wealth logged yet</p>
        <p className="text-xs text-[#6C5B4C] dark:text-[#9A9EA4] text-center mt-1">Add assets to view portfolio distribution</p>
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
                <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category] || "#987B5E"} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const dataItem = payload[0].payload;
                  const percentage = total > 0 ? ((dataItem.value / total) * 100).toFixed(1) : "0";
                  return (
                    <div className="bg-[#FDFBF7]/95 dark:bg-[#181B18]/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-[#E8E2D8] dark:border-white/10">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: CATEGORY_COLORS[dataItem.category] || "#987B5E" }}
                        />
                        <p className="font-bold text-xs text-[#1A1D1A] dark:text-[#EBE8E3]">{dataItem.name}</p>
                      </div>
                      <p className="text-sm font-black text-[#1A1D1A] dark:text-[#EBE8E3] font-heading">
                        {formatCurrency(dataItem.value, baseCurrency)}
                      </p>
                      <p className="text-[11px] font-bold text-[#6C5B4C] dark:text-[#9A9EA4] mt-0.5">
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
          <span className="text-[10px] font-black uppercase tracking-widest text-[#6C5B4C] dark:text-[#9A9EA4]">
            {mode === "UNMORTGAGED" ? "Available" : "Portfolio"}
          </span>
          <span className="text-lg font-black text-[#1A1D1A] dark:text-[#EBE8E3] tracking-tight font-heading">
            {formatCurrency(total, baseCurrency)}
          </span>
        </div>
      </div>

      <div className="w-full grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-[#E8E2D8] dark:border-white/5">
        {chartData.map((item) => {
          const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <div key={item.category} className="flex items-center justify-between bg-white dark:bg-[#181B18] px-3 py-2 rounded-xl border border-[#E8E2D8] dark:border-white/5">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: CATEGORY_COLORS[item.category] || "#987B5E" }}
                />
                <span className="text-xs font-bold text-[#1A1D1A] dark:text-[#EBE8E3] truncate">{item.name}</span>
              </div>
              <span className="text-xs font-black text-[#1A1D1A] dark:text-[#EBE8E3] ml-2 shrink-0 font-heading">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
