"use client";

import { useMemo } from "react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

interface NetWorthChartProps {
  data: { month: string; value: number }[];
  currencySymbol?: string;
}

export function NetWorthChart({ data, currencySymbol = "$" }: NetWorthChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Calculate min and max for chart scaling to make the curve more pronounced
    const values = data.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    // Add a slight buffer to the top and bottom
    const buffer = (max - min) * 0.2 || max * 0.1;
    
    return data;
  }, [data]);

  if (!chartData || chartData.length === 0) return null;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-3 rounded-xl shadow-xl shadow-black/5">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-base font-black text-zinc-900 dark:text-white">
            {currencySymbol}{payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-auto">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '4 4', opacity: 0.5 }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#10b981"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorValue)"
            animationDuration={1500}
            animationEasing="ease-in-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
