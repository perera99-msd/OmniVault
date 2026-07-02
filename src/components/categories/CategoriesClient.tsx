"use client";

import { useState, useMemo, useEffect } from "react";
import { ArrowDownLeft, ArrowUpRight, PieChart } from "lucide-react";
import * as motion from "framer-motion/client";
import { motion as clientMotion, Variants } from "framer-motion";
import { CategoryManagement } from "@/components/categories/CategoryManagement";
import { CategoryDonutChart } from "@/components/categories/CategoryDonutChart";
import { CategoriesFilterBar } from "@/components/categories/CategoriesFilterBar";

export function CategoriesClient({
  categoriesData,
  currentSymbol,
  initialFilter = "Month"
}: {
  categoriesData: any[];
  currentSymbol: string;
  initialFilter?: string;
}) {
  const [period, setPeriod] = useState<string>(initialFilter);

  useEffect(() => {
    if (initialFilter) {
      setPeriod(initialFilter);
    }
  }, [initialFilter]);

  const categories = useMemo(() => {
    return categoriesData.map(cat => {
      let amount = 0;
      let count = 0;
      if (period === "Day") { amount = cat.dayAmount || 0; count = cat.dayCount || 0; }
      else if (period === "Month" || period === "THIS_MONTH") { amount = cat.monthAmount || 0; count = cat.monthCount || 0; }
      else if (period === "Last Month") { amount = cat.lastMonthAmount || 0; count = cat.lastMonthCount || 0; }
      else if (period === "Year") { amount = cat.yearAmount || 0; count = cat.yearCount || 0; }
      else if (period === "All Time") { amount = cat.allAmount || 0; count = cat.allCount || 0; }
      else if (period.startsWith("MONTH:") || /^\d{4}-\d{2}$/.test(period)) { amount = cat.customAmount || 0; count = cat.customCount || 0; }
      else { amount = cat.monthAmount || 0; count = cat.monthCount || 0; }
      
      return { ...cat, totalAmount: amount, count };
    });
  }, [categoriesData, period]);

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <>
      <motion.div variants={itemVariants} className="w-full mb-6">
        <CategoriesFilterBar currentFilter={period} onSelect={(p) => setPeriod(p)} />
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
