"use client";

import { useMemo } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, CartesianGrid } from "recharts";

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

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 px-4 py-2.5 rounded-2xl shadow-xl flex flex-col items-center justify-center -mt-14">
          {dataPoint.dateLabel && (
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 tracking-wider uppercase mb-0.5">
              {dataPoint.dateLabel}
            </span>
          )}
          <p className="text-sm font-black text-zinc-900 dark:text-white tracking-tight flex items-center">
            <span className="text-zinc-500 mr-0.5">{currencySymbol}</span>
            {payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full pointer-events-auto z-50 [&_.recharts-wrapper]:outline-none [&_.recharts-surface]:outline-none [&_*]:outline-none focus:outline-none">
      <ResponsiveContainer width="100%" height="100%" style={{ outline: 'none' }}>
        <AreaChart
          data={chartData}
          margin={{ top: 50, right: 20, left: 20, bottom: 15 }}
          style={{ outline: 'none' }}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#71717a" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#71717a" stopOpacity={0} />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#a1a1aa', fontSize: 11, fontWeight: 700 }}
            dy={10}
          />
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ stroke: '#a1a1aa', strokeWidth: 1.5, strokeDasharray: '4 4', opacity: 0.5 }}
            animationDuration={300}
            animationEasing="ease-out"
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="currentColor"
            className="text-zinc-800 dark:text-zinc-200"
            strokeWidth={4}
            fill="url(#colorValue)"
            animationDuration={1500}
            animationEasing="ease-in-out"
            activeDot={{ r: 7, fill: "#ffffff", stroke: "currentColor", strokeWidth: 3, className: "text-zinc-800 dark:text-zinc-200 drop-shadow-md" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
