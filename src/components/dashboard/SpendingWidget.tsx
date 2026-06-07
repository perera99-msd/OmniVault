"use client";

import { useMemo } from "react";
import { ArrowUpRight, ArrowDownRight, TrendingUp, Activity } from "lucide-react";

type Transaction = {
  id: string;
  type: string;
  amount: number;
  date: Date;
};

type Wallet = {
  id: string;
  name: string;
  balance: number;
};

interface SpendingWidgetProps {
  income: number;
  expense: number;
}

export function SpendingWidget({ income, expense }: SpendingWidgetProps) {
  // Calculate a mock savings target percentage for visual flair
  const savingsRate = income > 0 
    ? ((income - expense) / income) * 100 
    : 0;
  
  const percentageStr = savingsRate > 0 ? `+${savingsRate.toFixed(1)}%` : `${savingsRate.toFixed(1)}%`;

  return (
    <div className="bg-[#ffffff] dark:bg-[#424242] rounded-[2rem] p-6 sm:p-8 border border-[#d7ccc8] dark:border-[#616161] shadow-[0_20px_40px_rgba(0,0,0,0.03)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.2)] transition-colors duration-500">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        
        {/* Left Side: Stats */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#f5f5f5] dark:bg-[#212121] flex items-center justify-center border border-[#d7ccc8] dark:border-[#616161]">
              <Activity className="w-5 h-5 text-[#003300] dark:text-[#ffffff]" />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-[#a1887f] dark:text-[#9e9e9e]">Monthly Performance</p>
              <h3 className="text-[#003300] dark:text-[#ffffff] font-black text-xl">Overview</h3>
            </div>
          </div>

          <div className="space-y-4">
            {/* Income Row */}
            <div className="bg-[#f5f5f5] dark:bg-[#212121] rounded-[1.5rem] p-4 flex items-center justify-between border border-[#d7ccc8]/50 dark:border-[#616161]/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#009900]/10 flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5 text-[#009900] dark:text-[#66cc66]" />
                </div>
                <div>
                  <p className="text-[12px] font-bold text-[#a1887f] dark:text-[#9e9e9e]">Total Income</p>
                  <p className="text-[#003300] dark:text-[#ffffff] font-black text-lg">${income.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Expense Row */}
            <div className="bg-[#f5f5f5] dark:bg-[#212121] rounded-[1.5rem] p-4 flex items-center justify-between border border-[#d7ccc8]/50 dark:border-[#616161]/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                  <ArrowDownRight className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-[12px] font-bold text-[#a1887f] dark:text-[#9e9e9e]">Total Expense</p>
                  <p className="text-[#003300] dark:text-[#ffffff] font-black text-lg">${expense.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Ring Chart & Savings Rate */}
        <div className="flex flex-col items-center justify-center relative">
          
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
            {/* SVG Ring Chart */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Background Ring */}
              <circle 
                cx="50" cy="50" r="40" 
                fill="transparent" 
                stroke="currentColor" 
                className="text-[#f5f5f5] dark:text-[#212121]"
                strokeWidth="12" 
                strokeLinecap="round"
              />
              
              {/* Income Ring (Fiscal Forest) */}
              <circle 
                cx="50" cy="50" r="40" 
                fill="transparent" 
                stroke="currentColor" 
                className="text-[#009900] dark:text-[#66cc66]"
                strokeWidth="12" 
                strokeDasharray="251.2" 
                strokeDashoffset={251.2 - (251.2 * 1)} // Assuming 100% is income
                strokeLinecap="round"
                style={{ filter: "drop-shadow(0 0 4px rgba(0,153,0,0.5))" }}
              />

              {/* Expense Ring Overlap */}
              <circle 
                cx="50" cy="50" r="40" 
                fill="transparent" 
                stroke="currentColor" 
                className="text-red-500"
                strokeWidth="12" 
                strokeDasharray="251.2" 
                strokeDashoffset={251.2 - (251.2 * (income > 0 ? (expense / income) : 0))}
                strokeLinecap="round"
                style={{ filter: "drop-shadow(0 0 4px rgba(239,68,68,0.5))" }}
              />
            </svg>

            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <TrendingUp className={`w-6 h-6 mb-1 ${savingsRate > 0 ? "text-[#009900] dark:text-[#66cc66]" : "text-red-500"}`} />
              <span className="text-3xl font-black text-[#003300] dark:text-[#ffffff] tracking-tighter">
                {percentageStr}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#a1887f] dark:text-[#9e9e9e] mt-1">
                Savings Rate
              </span>
            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
}
