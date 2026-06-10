"use client";

import { useState, useMemo } from "react";
import { ArrowDownLeft, ArrowUpRight, PieChart } from "lucide-react";
import * as motion from "framer-motion/client";
import { motion as clientMotion, Variants } from "framer-motion";
import { CategoryManagement } from "@/components/categories/CategoryManagement";
import { CategoryDonutChart } from "@/components/categories/CategoryDonutChart";

type Period = "Day" | "Month" | "Year" | "All Time";

export function CategoriesClient({ categoriesData, currentSymbol }: { categoriesData: any[], currentSymbol: string }) {
  const [period, setPeriod] = useState<Period>("Month");

  const categories = useMemo(() => {
    return categoriesData.map(cat => {
      let amount = 0;
      let count = 0;
      if (period === "Day") { amount = cat.dayAmount; count = cat.dayCount; }
      else if (period === "Month") { amount = cat.monthAmount; count = cat.monthCount; }
      else if (period === "Year") { amount = cat.yearAmount; count = cat.yearCount; }
      else { amount = cat.allAmount; count = cat.allCount; }
      
      return { ...cat, totalAmount: amount, count };
    });
  }, [categoriesData, period]);

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <>
      <motion.div variants={itemVariants} className="flex justify-end mb-6">
        {/* Period Selector Toggle */}
        <div className="flex bg-white dark:bg-[#121214] p-1 rounded-[1rem] shadow-sm border border-zinc-200/50 dark:border-white/5">
          {(["Day", "Month", "Year", "All Time"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="relative px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-bold rounded-[0.75rem] transition-colors z-10"
            >
              {period === p && (
                <clientMotion.div
                  layoutId="category-period-indicator"
                  className="absolute inset-0 bg-zinc-100 dark:bg-[#27272a] shadow-sm rounded-[0.75rem]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className={`relative z-10 ${period === p ? "text-zinc-900 dark:text-white" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}>
                {p}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Visual Insights */}
      {categories.length > 0 && (
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          
          {/* Income Chart */}
          <div className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/5 p-6 rounded-[2rem] shadow-sm flex flex-col items-center">
            <div className="flex items-center justify-between w-full mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shadow-inner">
                  <ArrowDownLeft className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="font-black text-zinc-900 dark:text-white text-xl tracking-tight">Income Breakdown</h3>
              </div>
            </div>
            <div className="w-full flex-1 min-h-[350px]">
              <CategoryDonutChart categories={categories} type="INCOME" currencySymbol={currentSymbol} />
            </div>
          </div>

          {/* Expense Chart */}
          <div className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/5 p-6 rounded-[2rem] shadow-sm flex flex-col items-center">
            <div className="flex items-center justify-between w-full mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center shadow-inner">
                  <ArrowUpRight className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                </div>
                <h3 className="font-black text-zinc-900 dark:text-white text-xl tracking-tight">Expense Breakdown</h3>
              </div>
            </div>
            <div className="w-full flex-1 min-h-[350px]">
              <CategoryDonutChart categories={categories} type="EXPENSE" currencySymbol={currentSymbol} />
            </div>
          </div>

        </motion.div>
      )}

      {/* Management List */}
      <motion.section variants={itemVariants} className="pt-8">
        <h3 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white mb-6 flex items-center gap-3">
          <div className="p-2.5 bg-zinc-100 dark:bg-white/5 rounded-xl shadow-inner border border-zinc-200/50 dark:border-white/5">
            <PieChart className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </div>
          Manage Categories
        </h3>
        
        <CategoryManagement categories={categories} currencySymbol={currentSymbol} />
      </motion.section>
    </>
  );
}
