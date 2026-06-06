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

  // Handle Next.js 15+ searchParams as a Promise, or fallback for 14
  const searchParams = await (props.searchParams instanceof Promise ? props.searchParams : Promise.resolve(props.searchParams));
  const baseCurrency = searchParams?.base || "LKR";

  const { success, data, error } = await getUserDashboardData(firebaseUid, baseCurrency);
  if (!success || !data) {
    return (
      <div className="flex h-full items-center justify-center bg-[#f4f6f8] dark:bg-[#09090b]">
        <div className="bg-white dark:bg-[#121214] p-10 rounded-3xl shadow-xl shadow-black/5 border border-zinc-100 dark:border-zinc-800/60 max-w-sm text-center">
          <p className="text-zinc-500 font-medium text-sm">
            {error || "Unable to load dashboard data."}
          </p>
        </div>
      </div>
    );
  }

  // 1. Current Total Net Worth (calculated by backend, so we just display it)
  // Re-calculate simply if needed, or pass it from backend. The backend `getUserDashboardData` 
  // uses convertCurrency, so we can just re-reduce here safely for display using baseCurrency
  const { convertCurrency } = require("@/lib/utils/currency");
  const totalAssets = data.wallets.reduce((sum: number, w: any) => sum + convertCurrency(w.balance, w.currency || "LKR", baseCurrency), 0);

  // Constraints:
  const topWallets = data.wallets.slice(0, 4);
  const upcoming = data.upcomingPayments.slice(0, 3);
  const recentTx = data.recentTransactions.slice(0, 5);

  // Framer Motion Variants for Staggering
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

  const currentSymbol = CURRENCY_SYMBOLS[baseCurrency] || "Rs ";

  return (
    <div className="relative min-h-screen w-full bg-[#f8fafc] dark:bg-[#09090b] transition-colors duration-500 pb-32 md:pb-12 overflow-hidden selection:bg-emerald-500/30">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 dark:bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-emerald-400/10 dark:bg-emerald-900/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto z-10">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >

          {/* ============================================================ */}
          {/* MAIN SAAS BENTO GRID RESTRUCTURED                            */}
          {/* ============================================================ */}
          <div className="space-y-6 xl:space-y-8">
            
            {/* ROW 1: Net Worth + Income/Expenses */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 xl:gap-8">
              
              {/* NET WORTH HERO */}
              <div className="xl:col-span-8">
                <motion.section variants={itemVariants} className="flex flex-col items-center justify-center py-10 md:py-16 text-center relative h-full bg-white dark:bg-[#121214] border border-zinc-100 dark:border-zinc-800/60 rounded-[2rem] shadow-2xl shadow-zinc-200/40 dark:shadow-none overflow-hidden">
                  <div className="mb-6 relative z-10">
                    <BaseCurrencySelector currentBase={baseCurrency} />
                  </div>
                  
                  <h1 className="text-[4rem] sm:text-[5.5rem] font-black text-zinc-900 dark:text-white tracking-tighter leading-none drop-shadow-sm z-10 mb-8 md:mb-12">
                    <span className="text-zinc-300 dark:text-zinc-700 font-medium mr-2">{currentSymbol}</span>
                    {totalAssets.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </h1>

                  {/* Real Area Chart for Net Worth History */}
                  <NetWorthChart data={data.netWorthHistory || []} currencySymbol={currentSymbol} />
                </motion.section>
              </div>

              {/* INCOMES & EXPENSES */}
              <div className="xl:col-span-4 flex flex-col gap-6">
                <motion.div variants={itemVariants} className="h-full flex flex-col gap-6">
                  <TimeFilledCard
                    label="Total Income"
                    variant="income"
                    currencySymbol={currentSymbol}
                    data={{
                      today: data.inflowData?.earnedToday || 0,
                      month: data.inflowData?.earnedThisMonth || 0,
                      year: data.inflowData?.earnedThisYear || 0,
                    }}
                  />
                  <TimeFilledCard
                    label="Total Expenses"
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
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 xl:gap-8">
              
              {/* WALLETS */}
              <div className="xl:col-span-8">
                <motion.section variants={itemVariants} className="bg-white dark:bg-[#121214] border border-zinc-100 dark:border-zinc-800/60 rounded-[2rem] p-6 sm:p-8 shadow-2xl shadow-zinc-200/40 dark:shadow-none h-full">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-2 tracking-tight">
                      <Wallet className="w-5 h-5 text-emerald-500" />
                      Wallets
                    </h2>
                    <Link href="/wallets" className="w-9 h-9 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 flex items-center justify-center transition-colors group">
                      <Plus className="w-5 h-5 text-zinc-500 dark:text-zinc-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
                    </Link>
                  </div>

                  {topWallets.length === 0 ? (
                    <p className="text-zinc-500 text-sm py-4">No vaults configured.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {topWallets.map((w: any) => (
                        <WalletCard key={w._id} wallet={w} />
                      ))}
                    </div>
                  )}
                </motion.section>
              </div>

              {/* UPCOMING PAYMENTS */}
              <div className="xl:col-span-4">
                <motion.section variants={itemVariants} className="bg-white dark:bg-[#121214] border border-zinc-100 dark:border-zinc-800/60 rounded-[2rem] p-6 sm:p-8 shadow-2xl shadow-zinc-200/40 dark:shadow-none h-full">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-2 tracking-tight">
                      <CalendarClock className="w-5 h-5 text-emerald-500" />
                      Upcoming Payments
                    </h2>
                    <Link href="/upcoming" className="text-xs font-bold text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 transition-colors uppercase tracking-widest">
                      All <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                  {upcoming.length === 0 ? (
                    <p className="text-zinc-500 text-sm py-4">No scheduled payments.</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {upcoming.map((pay: any) => {
                        const dueDate = new Date(pay.dueDate);
                        const isOverdue = dueDate < new Date();
                        return (
                          <div key={pay._id} className="group p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/20 border border-zinc-100 dark:border-zinc-800/50 hover:bg-white dark:hover:bg-zinc-800/60 hover:shadow-lg hover:shadow-zinc-200/20 dark:hover:shadow-none transition-all flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                              <p className="text-base font-bold text-zinc-900 dark:text-white">{pay.name}</p>
                              <p className="text-base font-black tracking-tight text-zinc-900 dark:text-white">
                                {formatCurrency(pay.amount, pay.currency || "LKR")}
                              </p>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <div className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${isOverdue ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' : 'bg-zinc-200/50 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'}`}>
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
                <motion.section variants={itemVariants} className="bg-white dark:bg-[#121214] border border-zinc-100 dark:border-zinc-800/60 rounded-[2rem] p-6 sm:p-8 shadow-2xl shadow-zinc-200/40 dark:shadow-none">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-2 tracking-tight">
                      <Activity className="w-5 h-5 text-emerald-500" />
                      Recent Transactions
                    </h2>
                    <Link href="/transactions" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2 rounded-xl">
                      View Ledger
                    </Link>
                  </div>

                  {recentTx.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mb-4">
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
                            className="group flex items-center justify-between p-4 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all border border-transparent hover:border-zinc-100 dark:hover:border-zinc-800/50"
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${isIncome ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'}`}>
                                {isIncome ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                              </div>
                              <div>
                                <p className="text-base font-bold text-zinc-900 dark:text-white">{tx.description || tx.categoryId?.name}</p>
                                <p className="text-xs font-medium text-zinc-500 mt-0.5">{tx.sourceWalletId?.name} • {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                              </div>
                            </div>
                            <p className={`text-base font-black tabular-nums tracking-tight ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-900 dark:text-white'}`}>
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

          </div>
        </motion.div>
      </div>

      {/* 7. THE "+" BUTTON (TransactionFAB) */}
      {data.wallets.length > 0 && (
        <TransactionFAB
          userId={data.user._id.toString()}
          wallets={data.wallets}
          categories={data.categories}
        />
      )}
    </div>
  );
}