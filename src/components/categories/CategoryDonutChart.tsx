"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface CategoryDonutChartProps {
  categories: any[];
  type: "INCOME" | "EXPENSE";
  currencySymbol: string;
}

const COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f97316', // orange
  '#eab308', // yellow
  '#10b981', // emerald
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#6366f1', // indigo
  '#f43f5e', // rose
];

export function CategoryDonutChart({ categories, type, currencySymbol }: CategoryDonutChartProps) {
  const data = categories
    .filter(c => c.type === type && c.totalAmount > 0)
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .map(c => ({ name: c.name, totalAmount: c.totalAmount })); // Mapping for recharts Legend

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-400 dark:text-zinc-600 font-medium text-sm">
        <PieChart className="w-8 h-8 mb-2 opacity-50" />
        No data for {type.toLowerCase()}s
      </div>
    );
  }

  const total = data.reduce((sum, c) => sum + c.totalAmount, 0);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full flex-1 relative flex items-center justify-center min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="65%"
              outerRadius="85%"
              paddingAngle={2}
              dataKey="totalAmount"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.name === "Uncategorized" ? "#71717a" : COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: any) => [`${currencySymbol}${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Amount']}
              contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
              itemStyle={{ fontWeight: 'bold' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Total
          </span>
          <span className={`text-lg sm:text-xl font-black tabular-nums tracking-tight ${type === "INCOME" ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-900 dark:text-white'}`}>
            {currencySymbol}{total >= 1000 ? (total / 1000).toFixed(1) + 'k' : total.toFixed(0)}
          </span>
        </div>
      </div>

      {/* Custom Legend */}
      <div className="mt-4 flex flex-col gap-2 max-h-[120px] overflow-y-auto custom-scrollbar pr-2">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center justify-between group">
            <div className="flex items-center gap-2.5">
              <div 
                className="w-3 h-3 rounded-full shadow-sm shrink-0" 
                style={{ backgroundColor: item.name === "Uncategorized" ? "#71717a" : COLORS[index % COLORS.length] }} 
              />
              <span className="text-sm font-bold text-zinc-600 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors truncate max-w-[120px] sm:max-w-[180px]">
                {item.name}
              </span>
            </div>
            <span className="text-sm font-black tabular-nums text-zinc-900 dark:text-white shrink-0">
              {currencySymbol}{item.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
