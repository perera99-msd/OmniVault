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
  Plus,
} from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import * as motion from "framer-motion/client";
import { CURRENCY_SYMBOLS, formatCurrency } from "@/lib/utils/currency";

export default async function DashboardPage(props: { searchParams: Promise<{ base?: string }> | { base?: string } }) {
  const cookieStore = await cookies();
  const firebaseUid = cookieStore.get("firebaseUid")?.value;
  if (!firebaseUid) redirect("/");

  const searchParams = await (props.searchParams instanceof Promise ? props.searchParams : Promise.resolve(props.searchParams));
  const baseCurrency = searchParams?.base || "LKR";

  const { success, data, error } = await getUserDashboardData(firebaseUid, baseCurrency);
  if (!success || !data) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="bg-white dark:bg-[#121214] p-10 rounded-3xl shadow-xl border border-zinc-100 dark:border-white/5 max-w-sm text-center">
          <p className="text-zinc-500 font-medium text-sm">
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
    hidden: { opacity: 0, y: 40, filter: "blur(4px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring" as const, stiffness: 300, damping: 28 } }
  };

  const currentSymbol = CURRENCY_SYMBOLS[baseCurrency] || "Rs ";

  return (
    <div className="relative min-h-screen w-full transition-colors duration-500 pb-32 md:pb-12 overflow-hidden selection:bg-emerald-500/30">
      <div className="relative p-4 sm:p-6 lg:p-8 max-w-[1500px] mx-auto z-10">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-6 xl:space-y-8"
        >

          {/* ============================================================ */}
          {/* MODERN SAAS BENTO GRID                                       */}
          {/* ============================================================ */}
          
          {/* ROW 1: Net Worth + Income/Expenses */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 xl:gap-6">
            
            {/* NET WORTH HERO */}
            <div className="xl:col-span-8 h-[240px] sm:h-[320px] xl:h-[420px] z-20">
              <motion.section variants={itemVariants} className="flex flex-col items-center justify-start pt-6 sm:pt-8 xl:pt-12 text-center relative h-full bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/5 rounded-[2rem] shadow-sm overflow-visible group transition-colors duration-500">
                
                <div className="relative z-20 flex flex-col items-center">
                  <p className="text-[10px] xl:text-[12px] font-bold tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500 mb-2 sm:mb-3">Total Net Worth</p>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-zinc-900 dark:text-white tracking-tight leading-none flex items-start justify-center gap-1.5 mb-2">
                    <span className="text-zinc-400 font-medium text-2xl sm:text-3xl mt-1 sm:mt-1.5">{currentSymbol}</span>
                    {totalAssets.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </h1>
                  
                  <p className="text-[11px] sm:text-[13px] font-bold text-zinc-400 dark:text-zinc-500 mb-4 sm:mb-6 tracking-wide">
                    {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  
                  <div className="z-30">
                    <BaseCurrencySelector currentBase={baseCurrency} />
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-[140px] sm:h-[180px] xl:h-[55%] pointer-events-auto rounded-b-[2rem] overflow-hidden">
                  <NetWorthChart data={data.netWorthHistory || []} currencySymbol={currentSymbol} />
                </div>
              </motion.section>
            </div>

            {/* INCOMES & EXPENSES */}
            <div className="xl:col-span-4 h-auto xl:h-[420px]">
              <motion.div variants={itemVariants} className="h-full">
                <IncomeExpenseDonutCard
                  currencySymbol={currentSymbol}
                  incomeData={{
                    today: data.inflowData?.earnedToday || 0,
                    month: data.inflowData?.earnedThisMonth || 0,
                    year: data.inflowData?.earnedThisYear || 0,
                  }}
                  expenseData={{
                    today: data.spendingData?.spentToday || 0,
                    month: data.spendingData?.spentThisMonth || 0,
                    year: data.spendingData?.spentThisYear || 0,
                  }}
                />
              </motion.div>
            </div>

          </div>

          {/* ROW 2: Wallets + Upcoming Payments */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 xl:gap-6">
            
            {/* WALLETS */}
            <div className="xl:col-span-8">
              <motion.section variants={itemVariants} className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/5 rounded-[2rem] p-6 sm:p-8 shadow-sm h-full transition-colors duration-500">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2 tracking-tight">
                    <Wallet className="w-5 h-5 text-emerald-500" />
                    Vaults
                  </h2>
                  <Link href="/wallets" className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 flex items-center justify-center transition-colors">
                    <Plus className="w-5 h-5 text-zinc-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400" />
                  </Link>
                </div>

                {topWallets.length === 0 ? (
                  <p className="text-zinc-500 text-sm py-4">No vaults configured.</p>
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
              <motion.section variants={itemVariants} className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/5 rounded-[2rem] p-6 sm:p-8 shadow-sm h-full transition-colors duration-500">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2 tracking-tight">
                    <CalendarClock className="w-5 h-5 text-emerald-500" />
                    Upcoming
                  </h2>
                  <Link href="/upcoming" className="text-[11px] font-bold text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 transition-colors uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800/50 px-3 py-1.5 rounded-lg border border-transparent hover:border-emerald-500/20">
                    All <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {upcoming.length === 0 ? (
                  <p className="text-zinc-500 text-sm py-4">No scheduled payments.</p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {upcoming.map((pay: any) => {
                      const dueDate = new Date(pay.dueDate);
                      const isOverdue = dueDate < new Date();
                      return (
                        <div key={pay._id} className="group/item p-4 sm:p-5 rounded-[1.5rem] bg-zinc-50/80 dark:bg-[#18181b]/80 border border-zinc-200/50 dark:border-white/5 hover:bg-white dark:hover:bg-[#27272a]/80 hover:shadow-xl hover:shadow-zinc-200/40 dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)] hover:-translate-y-1 transition-all duration-300 flex flex-col gap-3">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#1f1f22] border border-zinc-100 dark:border-white/5 flex items-center justify-center shadow-sm">
                                <CalendarClock className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
                              </div>
                              <p className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">{pay.name}</p>
                            </div>
                            <p className="text-base font-black tracking-tight text-zinc-900 dark:text-white mt-2">
                              {formatCurrency(pay.amount, pay.currency || "LKR")}
                            </p>
                          </div>
                          <div className="flex justify-between items-center mt-2 pl-1">
                            <div className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] border ${isOverdue ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.1)]' : 'bg-zinc-100 border-zinc-200 text-zinc-500 dark:bg-zinc-800/50 dark:border-white/5 dark:text-zinc-400'}`}>
                              {isOverdue ? "Overdue " : "Due "}
                              {dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </div>
                            <Link href="/upcoming" className="text-[11px] font-bold px-4 py-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border dark:border-emerald-500/20 dark:hover:bg-emerald-500/20 transition-colors tracking-widest uppercase shadow-md shadow-emerald-500/20">
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

          {/* ROW 3: Recent Transactions */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 xl:gap-8">
            <div className="xl:col-span-12">
              <motion.section variants={itemVariants} className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/5 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-sm transition-colors duration-500">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-[1.35rem] font-black text-zinc-900 dark:text-white flex items-center gap-2 tracking-tight">
                    <Activity className="w-[22px] h-[22px] text-emerald-500" />
                    Recent Activity
                  </h2>
                  <Link href="/transactions" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 px-5 py-2.5 rounded-xl shadow-sm border border-emerald-500/10">
                    View Ledger
                  </Link>
                </div>

                {recentTx.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl flex items-center justify-center mb-4">
                      <Activity className="w-8 h-8 text-zinc-300 dark:text-zinc-600" />
                    </div>
                    <p className="text-zinc-500 font-medium">No recent transactions to display.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {recentTx.map((tx: any) => {
                      const isIncome = tx.type === "INCOME";
                      return (
                        <div
                          key={tx._id}
                          className="group/tx flex items-center justify-between p-4 sm:p-5 rounded-[1.5rem] bg-zinc-50/80 dark:bg-[#18181b]/80 hover:bg-white dark:hover:bg-[#27272a]/80 transition-all duration-300 border border-transparent hover:border-zinc-200/50 dark:hover:border-white/5 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:-translate-y-1"
                        >
                          <div className="flex items-center gap-4 sm:gap-5">
                            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shadow-sm border ${isIncome ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-white border-zinc-100 dark:bg-[#1f1f22] dark:border-white/5 text-zinc-600 dark:text-zinc-400'}`}>
                              {isIncome ? <ArrowDownLeft className="w-6 h-6" strokeWidth={2.5} /> : <ArrowUpRight className="w-6 h-6" strokeWidth={2.5} />}
                            </div>
                            <div>
                              <p className="text-base sm:text-[1.15rem] font-bold text-zinc-900 dark:text-white tracking-tight">{tx.description || tx.categoryId?.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[11px] font-bold tracking-widest uppercase text-zinc-400 dark:text-zinc-500">{tx.sourceWalletId?.name}</span>
                                <span className="text-zinc-300 dark:text-zinc-700">•</span>
                                <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">{new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                              </div>
                            </div>
                          </div>
                          <p className={`text-[1.15rem] sm:text-[1.35rem] font-black tabular-nums tracking-tight drop-shadow-sm ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-900 dark:text-white'}`}>
                            {isIncome ? "+" : "-"}{formatCurrency(tx.amount, tx.currency || tx.sourceWalletId?.currency || "LKR")}
                          </p>
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

      {/* THE "+" BUTTON (TransactionFAB) */}
      {data.wallets.length > 0 && (
        <TransactionFAB
          wallets={data.wallets}
          categories={data.categories}
        />
      )}
    </div>
  );
}