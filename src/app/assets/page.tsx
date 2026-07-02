import { cookies } from "next/headers";
import { getAssetsPageData } from "@/actions/assets";
import { BaseCurrencySelector } from "@/components/dashboard/BaseCurrencySelector";
import { CURRENCY_SYMBOLS } from "@/lib/utils/currency";
import { Gem } from "lucide-react";
import * as motion from "framer-motion/client";
import { AssetsClient } from "@/components/assets/AssetsClient";

export default async function AssetsPage(props: { searchParams: Promise<{ base?: string }> | { base?: string } }) {
  const cookieStore = await cookies();
  const firebaseUid = cookieStore.get("firebaseUid")?.value;

  if (!firebaseUid) return null;

  const searchParams = await (props.searchParams instanceof Promise ? props.searchParams : Promise.resolve(props.searchParams));
  const baseCurrency = searchParams?.base || "LKR";

  const res = await getAssetsPageData(firebaseUid, baseCurrency);
  if (!res.success || !res.data) return null;

  const assetsData = res.data;
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
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#f8fafc] dark:bg-[#09090b] transition-colors duration-500 pb-32 md:pb-12 overflow-hidden selection:bg-emerald-500/30">
      
      {/* Ambient Background Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 dark:bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[35%] h-[35%] bg-amber-500/10 dark:bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />

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
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200/50 dark:border-zinc-800/50 mb-2">
                <Gem className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Wealth Repository</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-900 dark:text-white leading-none">
                My Assets
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base font-bold tracking-wide max-w-xl">
                Monitor and manage physical holdings, real estate, jewelry, and pawn agreements separately from daily cash flow.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 w-full sm:w-auto">
              <div className="hidden sm:block">
                <BaseCurrencySelector currentBase={baseCurrency} />
              </div>
            </div>
          </motion.header>

          <motion.div variants={itemVariants}>
            <AssetsClient assetsData={assetsData} currencySymbol={currentSymbol} />
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}
