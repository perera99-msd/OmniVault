import { getCategoriesPageData } from "@/actions/finance";
import { BaseCurrencySelector } from "@/components/dashboard/BaseCurrencySelector";
import { CURRENCY_SYMBOLS } from "@/lib/utils/currency";
import { PieChart } from "lucide-react";
import * as motion from "framer-motion/client";
import { CategoriesClient } from "@/components/categories/CategoriesClient";

export const dynamic = "force-dynamic";

export default async function CategoriesPage(props: { searchParams: Promise<{ base?: string; filter?: string }> | { base?: string; filter?: string } }) {
  const searchParams = await (props.searchParams instanceof Promise ? props.searchParams : Promise.resolve(props.searchParams));
  const baseCurrency = searchParams?.base || "LKR";
  const currentFilter = searchParams?.filter || "Month";

  const res = await getCategoriesPageData(undefined, baseCurrency, currentFilter);
  if (!res.success || !res.data) return null;

  const categoriesData = res.data;
  const currentSymbol = CURRENCY_SYMBOLS[baseCurrency] || "Rs ";

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#FDFBF7] dark:bg-[#121412] transition-colors duration-500 pb-32 md:pb-12 overflow-hidden selection:bg-[#987B5E]/30">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#987B5E]/10 dark:bg-[#987B5E]/5 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-[#213F33]/10 dark:bg-[#385A4D]/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="relative p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto z-10">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-6 sm:space-y-8"
        >

          {/* Header */}
          <motion.header variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 pb-2 sm:pb-6 relative">
            <div className="absolute top-0 right-0 sm:hidden">
              <BaseCurrencySelector currentBase={baseCurrency} />
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#181B18] shadow-sm border border-[#E8E2D8] dark:border-white/10 mb-1">
                <PieChart className="w-3.5 h-3.5 text-[#987B5E]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#6C5B4C] dark:text-[#9A9EA4]">Capital Allocation</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#1A1D1A] dark:text-[#EBE8E3] leading-none font-heading">
                Categories
              </h1>
              <p className="text-[#6C5B4C] dark:text-[#9A9EA4] text-sm md:text-base font-bold tracking-wide max-w-md">
                Analyze and structure how your income and expenses flow across key sectors.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 w-full sm:w-auto">
              <div className="hidden sm:block">
                <BaseCurrencySelector currentBase={baseCurrency} />
              </div>
            </div>
          </motion.header>

          <CategoriesClient categoriesData={categoriesData} currentSymbol={currentSymbol} initialFilter={currentFilter} />

        </motion.div>
      </div>
    </div>
  );
}
