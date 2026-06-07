"use client";

import { useMemo } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";

interface NetWorthChartProps {
  data: { month: string; value: number }[];
  currencySymbol?: string;
}

export function NetWorthChart({ data, currencySymbol = "$" }: NetWorthChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data;
  }, [data]);

  if (!chartData || chartData.length === 0) return null;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/80 dark:bg-[#121214]/80 backdrop-blur-xl border border-zinc-200/50 dark:border-white/10 p-4 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <p className="text-[11px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-0.5">
            <span className="text-zinc-400 dark:text-zinc-500 text-sm">{currencySymbol}</span>
            {payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 h-[50%] pointer-events-auto">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="50%" stopColor="#10b981" stopOpacity={0.1} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '4 4', opacity: 0.5 }}
            animationDuration={300}
            animationEasing="ease-out"
          />
          <Area
            type="monotoneX"
            dataKey="value"
            stroke="#10b981"
            strokeWidth={3}
            fill="url(#colorValue)"
            animationDuration={1500}
            animationEasing="ease-in-out"
            activeDot={{ r: 6, fill: "#10b981", stroke: "#ffffff", strokeWidth: 2, filter: "url(#glow)" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
