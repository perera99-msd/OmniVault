import { getUserDashboardData } from "@/actions/finance";
import { WalletCard } from "@/components/cards/WalletCard";
import { TimeFilledCard } from "@/components/dashboard/TimeFilledCard";
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
            <div className="xl:col-span-8 h-[360px] xl:h-[420px]">
              <motion.section variants={itemVariants} className="flex flex-col items-center justify-start pt-16 text-center relative h-full bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/5 rounded-[2rem] shadow-sm overflow-hidden group transition-colors duration-500">
                <div className="absolute top-6 left-6 z-20">
                  <BaseCurrencySelector currentBase={baseCurrency} />
                </div>
                
                <div className="relative z-10">
                  <p className="text-[12px] font-semibold tracking-widest uppercase text-zinc-500 mb-3">Total Net Worth</p>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-zinc-900 dark:text-white tracking-tight leading-none flex items-start justify-center gap-1.5">
                    <span className="text-zinc-400 font-medium text-2xl sm:text-3xl mt-1.5">{currentSymbol}</span>
                    {totalAssets.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </h1>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-[55%] pointer-events-auto">
                  <NetWorthChart data={data.netWorthHistory || []} currencySymbol={currentSymbol} />
                </div>
              </motion.section>
            </div>

            {/* INCOMES & EXPENSES */}
            <div className="xl:col-span-4 flex flex-col gap-5 xl:gap-6 h-[360px] xl:h-[420px]">
              <motion.div variants={itemVariants} className="flex-1 min-h-0">
                <TimeFilledCard
                  label="Income"
                  variant="income"
                  currencySymbol={currentSymbol}
                  data={{
                    today: data.inflowData?.earnedToday || 0,
                    month: data.inflowData?.earnedThisMonth || 0,
                    year: data.inflowData?.earnedThisYear || 0,
                  }}
                />
              </motion.div>
              <motion.div variants={itemVariants} className="flex-1 min-h-0">
                <TimeFilledCard
                  label="Expenses"
                  variant="expense"
                  currencySymbol={currentSymbol}
                  data={{
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {topWallets.map((w: any) => (
                      <WalletCard key={w._id} wallet={w} />
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
                  <Link href="/upcoming" className="text-[11px] font-bold text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 transition-colors uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg">
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
                        <div key={pay._id} className="group/item p-4 sm:p-5 rounded-[1.5rem] bg-zinc-50/80 dark:bg-[#18181b]/80 border border-zinc-200/50 dark:border-white/5 hover:bg-white dark:hover:bg-[#27272a]/50 hover:shadow-lg hover:shadow-zinc-200/20 dark:hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 transition-all flex flex-col gap-3">
                          <div className="flex justify-between items-start">
                            <p className="text-base font-bold text-zinc-900 dark:text-white">{pay.name}</p>
                            <p className="text-base font-black tracking-tight text-zinc-900 dark:text-white">
                              {formatCurrency(pay.amount, pay.currency || "LKR")}
                            </p>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <div className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${isOverdue ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' : 'bg-zinc-200/50 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                              {isOverdue ? "Overdue " : "Due "}
                              {dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </div>
                            <button className="text-[11px] font-bold px-4 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors tracking-wide">
                              Pay Now
                            </button>
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
              <motion.section variants={itemVariants} className="bg-white/70 dark:bg-[#121214]/70 backdrop-blur-3xl border border-zinc-200/50 dark:border-white/5 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] group hover:border-zinc-300/50 dark:hover:border-white/10 transition-colors duration-500">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-[1.35rem] font-black text-zinc-900 dark:text-white flex items-center gap-2 tracking-tight">
                    <Activity className="w-[22px] h-[22px] text-emerald-500" />
                    Recent Activity
                  </h2>
                  <Link href="/transactions" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors bg-emerald-50 dark:bg-emerald-500/10 px-5 py-2.5 rounded-xl shadow-sm">
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
                          className="group/tx flex items-center justify-between p-4 sm:p-5 rounded-[1.5rem] bg-zinc-50/50 dark:bg-[#18181b]/50 hover:bg-white dark:hover:bg-[#27272a]/50 transition-all border border-transparent hover:border-zinc-200/50 dark:hover:border-white/5 hover:shadow-md hover:shadow-black/5 dark:hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:-translate-y-0.5"
                        >
                          <div className="flex items-center gap-5">
                            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shadow-inner ${isIncome ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-zinc-100 dark:bg-[#27272a] text-zinc-600 dark:text-zinc-300'}`}>
                              {isIncome ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                            </div>
                            <div>
                              <p className="text-base sm:text-[1.1rem] font-bold text-zinc-900 dark:text-white tracking-tight">{tx.description || tx.categoryId?.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[11px] font-bold tracking-widest uppercase text-zinc-400">{tx.sourceWalletId?.name}</span>
                                <span className="text-zinc-300 dark:text-zinc-700">•</span>
                                <span className="text-xs font-medium text-zinc-400">{new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                              </div>
                            </div>
                          </div>
                          <p className={`text-[1.15rem] sm:text-[1.3rem] font-black tabular-nums tracking-tight ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-900 dark:text-white'}`}>
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