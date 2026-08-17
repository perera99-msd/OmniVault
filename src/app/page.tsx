import { getUserDashboardData } from "@/actions/finance";
import { WalletCard } from "@/components/cards/WalletCard";
import { IncomeExpenseDonutCard } from "@/components/dashboard/IncomeExpenseDonutCard";
import { NetWorthChart } from "@/components/dashboard/NetWorthChart";
import { BaseCurrencySelector } from "@/components/dashboard/BaseCurrencySelector";
import { TransactionFAB } from "@/components/ui/TransactionFAB";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  CalendarClock,
  ArrowRight,
  Activity,
  ArrowRightLeft,
  Plus,
} from "lucide-react";
import Link from "next/link";
import * as motion from "framer-motion/client";
import { CURRENCY_SYMBOLS, formatCurrency } from "@/lib/utils/currency";

export default async function DashboardPage(props: { searchParams: Promise<{ base?: string }> | { base?: string } }) {
  const searchParams = await (props.searchParams instanceof Promise ? props.searchParams : Promise.resolve(props.searchParams));
  const baseCurrency = searchParams?.base || "LKR";

  const { success, data, error } = await getUserDashboardData(undefined, baseCurrency);
  if (!success || !data) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="bg-white dark:bg-[#181B18] p-10 rounded-3xl shadow-xl border border-[#E8E2D8] dark:border-white/5 max-w-sm text-center">
          <p className="text-[#6C5B4C] dark:text-[#9A9EA4] font-medium text-sm">
            {error || "Unable to load dashboard data."}
          </p>
        </div>
      </div>
    );
  }

  const { convertCurrency } = require("@/lib/utils/currency");
  const totalAssets = data.wallets.reduce((sum: number, w: any) => sum + convertCurrency(w.balance, w.currency || "LKR", baseCurrency), 0);

  const topWallets = data.wallets.slice(0, 4);
  const upcoming = data.upcomingPayments.slice(0, 3);
  const recentTx = data.recentTransactions.slice(0, 5);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } }
  };

  const currentSymbol = CURRENCY_SYMBOLS[baseCurrency] || "Rs ";

  return (
    <div className="relative min-h-screen w-full transition-colors duration-500 pb-32 md:pb-12 overflow-hidden selection:bg-[#987B5E]/30">
      <div className="relative p-4 sm:p-6 lg:p-8 max-w-[1500px] mx-auto z-10">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-6 xl:space-y-8"
        >

          {/* ============================================================ */}
          {/* TRIA LUXURY BENTO GRID                                       */}
          {/* ============================================================ */}
          
          {/* ROW 1: Net Worth + Incomes & Expenses */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 xl:gap-6">
            
            {/* NET WORTH HERO */}
            <div className="xl:col-span-8 h-[250px] sm:h-[330px] xl:h-[430px] z-20">
              <motion.section variants={itemVariants} className="flex flex-col items-center justify-start pt-6 sm:pt-8 xl:pt-12 text-center relative h-full bg-white dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/5 rounded-[2.5rem] shadow-sm overflow-visible group transition-colors duration-500">
                
                <div className="relative z-20 flex flex-col items-center">
                  <p className="text-[10px] xl:text-[11px] font-black tracking-[0.25em] uppercase text-[#987B5E] dark:text-[#D4B48A] mb-2 sm:mb-3">
                    Consolidated Wealth
                  </p>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#1A1D1A] dark:text-[#EBE8E3] tracking-tight leading-none flex items-start justify-center gap-1.5 mb-2 font-heading">
                    <span className="text-[#987B5E] font-medium text-2xl sm:text-3xl mt-1 sm:mt-1.5">{currentSymbol}</span>
                    {totalAssets.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </h1>
                  
                  <p className="text-[11px] sm:text-[12px] font-bold text-[#6C5B4C] dark:text-[#9A9EA4] mb-4 sm:mb-6 tracking-wide">
                    {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                  
                  <div className="z-30">
                    <BaseCurrencySelector currentBase={baseCurrency} />
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-[140px] sm:h-[180px] xl:h-[55%] pointer-events-auto rounded-b-[2.5rem] overflow-hidden">
                  <NetWorthChart data={data.netWorthHistory || []} currencySymbol={currentSymbol} />
                </div>
              </motion.section>
            </div>

            {/* INCOMES & EXPENSES */}
            <div className="xl:col-span-4 h-auto xl:h-[430px]">
              <motion.div variants={itemVariants} className="h-full">
                <IncomeExpenseDonutCard
                  currencySymbol={currentSymbol}
                  incomeData={{
                    today: data.inflowData?.earnedToday || 0,
                    lastWeek: data.inflowData?.earnedLastWeek || 0,
                    month: data.inflowData?.earnedThisMonth || 0,
                    lastMonth: data.inflowData?.earnedLastMonth || 0,
                    last3Months: data.inflowData?.earnedLast3Months || 0,
                    year: data.inflowData?.earnedThisYear || 0,
                  }}
                  expenseData={{
                    today: data.spendingData?.spentToday || 0,
                    lastWeek: data.spendingData?.spentLastWeek || 0,
                    month: data.spendingData?.spentThisMonth || 0,
                    lastMonth: data.spendingData?.spentLastMonth || 0,
                    last3Months: data.spendingData?.spentLast3Months || 0,
                    year: data.spendingData?.spentThisYear || 0,
                  }}
                />
              </motion.div>
            </div>

          </div>

          {/* ROW 2: Wallets + Upcoming Payments */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 xl:gap-6">
            
            {/* WALLETS / VAULTS */}
            <div className="xl:col-span-8">
              <motion.section variants={itemVariants} className="bg-white dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/5 rounded-[2.5rem] p-6 sm:p-8 shadow-sm h-full transition-colors duration-500">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black text-[#1A1D1A] dark:text-[#EBE8E3] flex items-center gap-2.5 tracking-tight font-heading">
                    <Wallet className="w-5 h-5 text-[#987B5E]" />
                    Vaults & Accounts
                  </h2>
                  <Link href="/wallets" className="w-9 h-9 rounded-xl bg-[#FAF8F3] dark:bg-[#202420] hover:bg-[#213F33]/10 dark:hover:bg-[#385A4D]/20 flex items-center justify-center transition-colors border border-[#E8E2D8] dark:border-white/5">
                    <Plus className="w-5 h-5 text-[#6C5B4C] dark:text-[#9A9EA4] hover:text-[#213F33] dark:hover:text-white" />
                  </Link>
                </div>

                {topWallets.length === 0 ? (
                  <p className="text-[#6C5B4C] dark:text-[#9A9EA4] text-sm py-4">No vaults configured.</p>
                ) : (
                  <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-2 -mx-6 px-6 sm:grid sm:grid-cols-2 sm:overflow-visible sm:snap-none sm:pb-0 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {topWallets.map((w: any) => (
                      <div key={w._id} className="w-[85%] min-w-[85%] shrink-0 sm:w-auto sm:min-w-0 sm:shrink snap-center">
                        <WalletCard wallet={w} />
                      </div>
                    ))}
                  </div>
                )}
              </motion.section>
            </div>

            {/* UPCOMING PAYMENTS */}
            <div className="xl:col-span-4">
              <motion.section variants={itemVariants} className="bg-white dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/5 rounded-[2.5rem] p-6 sm:p-8 shadow-sm h-full transition-colors duration-500">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black text-[#1A1D1A] dark:text-[#EBE8E3] flex items-center gap-2.5 tracking-tight font-heading">
                    <CalendarClock className="w-5 h-5 text-[#987B5E]" />
                    Upcoming
                  </h2>
                  <Link href="/upcoming" className="text-[10px] font-black text-[#6C5B4C] dark:text-[#9A9EA4] hover:text-[#213F33] dark:hover:text-white flex items-center gap-1 transition-colors uppercase tracking-widest bg-[#FAF8F3] dark:bg-[#202420] px-3 py-1.5 rounded-lg border border-[#E8E2D8] dark:border-white/5">
                    All <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {upcoming.length === 0 ? (
                  <p className="text-[#6C5B4C] dark:text-[#9A9EA4] text-sm py-4">No scheduled payments.</p>
                ) : (
                  <div className="flex flex-col gap-3.5">
                    {upcoming.map((pay: any) => {
                      const dueDate = new Date(pay.dueDate);
                      const isOverdue = dueDate < new Date();
                      return (
                        <div key={pay._id} className="group/item p-4 sm:p-5 rounded-[1.5rem] bg-[#FAF8F3]/90 dark:bg-[#202420]/90 border border-[#E8E2D8] dark:border-white/5 hover:bg-white dark:hover:bg-[#252B25] hover:shadow-lg transition-all duration-300 flex flex-col gap-2.5">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/5 flex items-center justify-center shadow-sm text-[#987B5E]">
                                <CalendarClock className="w-5 h-5" />
                              </div>
                              <p className="text-base font-bold text-[#1A1D1A] dark:text-[#EBE8E3] tracking-tight">{pay.name}</p>
                            </div>
                            <p className="text-base font-black tracking-tight text-[#1A1D1A] dark:text-[#EBE8E3]">
                              {formatCurrency(pay.amount, pay.currency || "LKR")}
                            </p>
                          </div>
                          <div className="flex justify-between items-center mt-1 pl-1">
                            <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] border ${isOverdue ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400' : 'bg-white dark:bg-[#181B18] border-[#E8E2D8] dark:border-white/10 text-[#6C5B4C] dark:text-[#9A9EA4]'}`}>
                              {isOverdue ? "Overdue " : "Due "}
                              {dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </div>
                            <Link href="/upcoming" className="text-[10px] font-black px-3.5 py-1.5 rounded-xl btn-tria-primary uppercase tracking-wider">
                              View
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.section>
            </div>

          </div>

          {/* ROW 3: Recent Activity Ledger */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 xl:gap-8">
            <div className="xl:col-span-12">
              <motion.section variants={itemVariants} className="bg-white dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/5 rounded-[2.5rem] p-6 sm:p-8 shadow-sm transition-colors duration-500">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-[1.35rem] font-black text-[#1A1D1A] dark:text-[#EBE8E3] flex items-center gap-2.5 tracking-tight font-heading">
                    <Activity className="w-[22px] h-[22px] text-[#987B5E]" />
                    Recent Activity
                  </h2>
                  <Link href="/transactions" className="text-xs font-black text-[#213F33] dark:text-[#EBE8E3] hover:text-[#987B5E] dark:hover:text-[#D4B48A] transition-colors bg-[#FAF8F3] dark:bg-[#202420] hover:bg-[#EFE9E0] dark:hover:bg-[#272D27] px-4 py-2 rounded-xl border border-[#E8E2D8] dark:border-white/10">
                    Full Ledger
                  </Link>
                </div>

                {recentTx.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-[#FAF8F3] dark:bg-[#202420] rounded-2xl flex items-center justify-center mb-4 text-[#987B5E]">
                      <Activity className="w-8 h-8 opacity-60" />
                    </div>
                    <p className="text-[#6C5B4C] dark:text-[#9A9EA4] font-medium">No recent transactions recorded.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {recentTx.map((tx: any) => {
                      const isIncome = tx.type === "INCOME";
                      const isTransfer = tx.type === "TRANSFER";
                      return (
                        <div
                          key={tx._id}
                          className="group/tx flex items-center justify-between p-4 sm:p-5 rounded-[1.5rem] bg-[#FAF8F3]/80 dark:bg-[#202420]/80 hover:bg-white dark:hover:bg-[#252B25] transition-all duration-300 border border-[#E8E2D8]/50 dark:border-white/5 hover:shadow-md hover:-translate-y-0.5"
                        >
                          <div className="flex items-center gap-4 sm:gap-5">
                            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shadow-sm border ${isIncome ? 'bg-[#213F33]/10 border-[#213F33]/20 text-[#213F33] dark:bg-[#385A4D]/20 dark:border-[#385A4D]/30 dark:text-[#4E6C5F]' : isTransfer ? 'bg-[#987B5E]/10 border-[#987B5E]/20 text-[#987B5E] dark:bg-[#987B5E]/20 dark:border-[#987B5E]/30 dark:text-[#D4B48A]' : 'bg-rose-50 border-rose-100 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400'}`}>
                              {isIncome ? <ArrowDownLeft className="w-6 h-6" strokeWidth={2.5} /> : isTransfer ? <ArrowRightLeft className="w-6 h-6" strokeWidth={2.5} /> : <ArrowUpRight className="w-6 h-6" strokeWidth={2.5} />}
                            </div>
                            <div>
                              <p className="text-base sm:text-[1.1rem] font-bold text-[#1A1D1A] dark:text-[#EBE8E3] tracking-tight">
                                {tx.description || (isTransfer ? "Vault Transfer" : tx.categoryId?.name)}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-black tracking-widest uppercase text-[#987B5E] dark:text-[#D4B48A]">{tx.sourceWalletId?.name}</span>
                                {isTransfer && tx.destinationWalletId && (
                                  <>
                                    <ArrowRightLeft className="w-3 h-3 text-[#6C5B4C] dark:text-[#9A9EA4]" />
                                    <span className="text-[10px] font-black tracking-widest uppercase text-[#987B5E] dark:text-[#D4B48A]">{tx.destinationWalletId.name}</span>
                                  </>
                                )}
                                <span className="text-[#E8E2D8] dark:text-zinc-700">•</span>
                                <span className="text-xs font-medium text-[#6C5B4C] dark:text-[#9A9EA4]">{new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <p className={`text-[1.15rem] sm:text-[1.3rem] font-black tabular-nums tracking-tight ${isIncome ? 'text-[#213F33] dark:text-[#4E6C5F]' : isTransfer ? 'text-[#987B5E] dark:text-[#D4B48A]' : 'text-rose-700 dark:text-rose-400'}`}>
                              {isIncome ? "+" : isTransfer ? "" : "-"}{formatCurrency(tx.amount, tx.currency || tx.sourceWalletId?.currency || "LKR")}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.section>
            </div>
          </div>

        </motion.div>
      </div>

      {/* Tria FAB */}
      {data.wallets.length > 0 && (
        <TransactionFAB
          wallets={data.wallets}
          categories={data.categories}
        />
      )}
    </div>
  );
}