"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface CategoryDonutChartProps {
  categories: any[];
  type: "INCOME" | "EXPENSE";
  currencySymbol: string;
}

const COLORS = [
  '#213F33', // Heirloom Green
  '#987B5E', // Aged Gold
  '#6C5B4C', // Walnut Brown
  '#4E6C5F', // Laurel
  '#7A6652', // Saddle Brown
  '#385A4D', // Forest Green
  '#A28876', // Camel
  '#53585F', // Stone Grey
  '#384D47', // Cedar
  '#9B826B', // Cocoa
];

export function CategoryDonutChart({ categories, type, currencySymbol }: CategoryDonutChartProps) {
  const data = categories
    .filter(c => c.type === type && c.totalAmount > 0)
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .map(c => ({ name: c.name, totalAmount: c.totalAmount }));

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#6C5B4C] dark:text-[#9A9EA4] font-medium text-sm">
        <PieChart className="w-8 h-8 mb-2 opacity-50 text-[#987B5E]" />
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
                <Cell key={`cell-${index}`} fill={entry.name === "Uncategorized" ? "#9EA2A8" : COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: any) => [`${currencySymbol}${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Amount']}
              contentStyle={{ borderRadius: '1rem', border: '1px solid #E8E2D8', backgroundColor: '#FDFBF7', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
              itemStyle={{ fontWeight: 'bold', color: '#1A1D1A' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#6C5B4C] dark:text-[#9A9EA4]">
            Total
          </span>
          <span className={`text-lg sm:text-xl font-black tabular-nums tracking-tight font-heading ${type === "INCOME" ? 'text-[#213F33] dark:text-[#4E6C5F]' : 'text-[#1A1D1A] dark:text-[#EBE8E3]'}`}>
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
                style={{ backgroundColor: item.name === "Uncategorized" ? "#9EA2A8" : COLORS[index % COLORS.length] }} 
              />
              <span className="text-sm font-bold text-[#6C5B4C] dark:text-[#9A9EA4] group-hover:text-[#1A1D1A] dark:group-hover:text-white transition-colors truncate max-w-[120px] sm:max-w-[180px]">
                {item.name}
              </span>
            </div>
            <span className="text-sm font-black tabular-nums text-[#1A1D1A] dark:text-[#EBE8E3] shrink-0 font-heading">
              {currencySymbol}{item.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
