"use client";

import { useMemo } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

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
        <div className="bg-[#FDFBF7] dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/10 px-4 py-2.5 rounded-2xl shadow-xl flex flex-col items-center justify-center -mt-14">
          {dataPoint.dateLabel && (
            <span className="text-[10px] font-bold text-[#987B5E] dark:text-[#D4B48A] tracking-wider uppercase mb-0.5">
              {dataPoint.dateLabel}
            </span>
          )}
          <p className="text-sm font-black text-[#1A1D1A] dark:text-[#EBE8E3] tracking-tight flex items-center">
            <span className="text-[#987B5E] mr-0.5">{currencySymbol}</span>
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
            <linearGradient id="colorTriaNetWorth" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#987B5E" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#213F33" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#987B5E', fontSize: 11, fontWeight: 700 }}
            dy={10}
          />
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ stroke: '#987B5E', strokeWidth: 1.5, strokeDasharray: '4 4', opacity: 0.6 }}
            animationDuration={300}
            animationEasing="ease-out"
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#987B5E"
            strokeWidth={3.5}
            fill="url(#colorTriaNetWorth)"
            animationDuration={1500}
            animationEasing="ease-in-out"
            activeDot={{ r: 7, fill: "#FDFBF7", stroke: "#987B5E", strokeWidth: 3.5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
