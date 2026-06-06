"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format, subDays } from "date-fns";

interface TransactionChartProps {
  transactions: any[];
}

export function TransactionChart({ transactions }: TransactionChartProps) {
  const data = useMemo(() => {
    // Generate last 7 days array
    const days = Array.from({ length: 7 }).map((_, i) => {
      const date = subDays(new Date(), 6 - i);
      return {
        dateString: format(date, "MMM dd"),
        dateObj: date,
        Income: 0,
        Expense: 0,
      };
    });

    // Aggregate transactions
    transactions.forEach((tx) => {
      if (tx.type === "TRANSFER") return;
      
      const txDate = new Date(tx.date);
      const dayData = days.find((d) => 
        d.dateObj.getDate() === txDate.getDate() && 
        d.dateObj.getMonth() === txDate.getMonth()
      );

      if (dayData) {
        if (tx.type === "INCOME") {
          dayData.Income += tx.amount;
        } else if (tx.type === "EXPENSE") {
          dayData.Expense += tx.amount;
        }
      }
    });

    return days;
  }, [transactions]);

  return (
    <div className="w-full h-[300px] mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 0,
            left: -20,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#8d6e63" opacity={0.2} />
          <XAxis 
            dataKey="dateString" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: "#8d6e63" }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: "#8d6e63" }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip 
            cursor={{ fill: "rgba(141, 110, 99, 0.1)" }}
            contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(10px)" }}
            itemStyle={{ fontWeight: "bold" }}
          />
          <Legend wrapperStyle={{ paddingTop: "20px" }} />
          <Bar dataKey="Income" fill="#009900" radius={[4, 4, 0, 0]} maxBarSize={40} />
          <Bar dataKey="Expense" fill="#d7ccc8" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
