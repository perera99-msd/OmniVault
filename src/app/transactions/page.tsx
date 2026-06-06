import { cookies } from "next/headers";
import { getTransactionsHistory } from "@/actions/finance";
import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, ArrowRightLeft, Calendar, Search, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import * as motion from "framer-motion/client";
import { formatCurrency, convertCurrency } from "@/lib/utils/currency";

import { TransactionRowActions } from "./TransactionRowActions";
import { TransactionFAB } from "@/components/ui/TransactionFAB";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const cookieStore = await cookies();
  const firebaseUid = cookieStore.get("firebaseUid")?.value;

  if (!firebaseUid) return null;

  const resolvedParams = await searchParams;
  const currentFilter = resolvedParams.filter || "THIS_MONTH";

  const res = await getTransactionsHistory(firebaseUid, currentFilter);
  if (!res.success || !res.data) return null;

  const { user, transactions, wallets, categories } = res.data;

  const filterOptions = [
    { id: "TODAY", label: "Today" },
    { id: "THIS_WEEK", label: "This Week" },
    { id: "THIS_MONTH", label: "This Month" },
    { id: "Q1", label: "Q1" },
    { id: "Q2", label: "Q2" },
    { id: "Q3", label: "Q3" },
    { id: "Q4", label: "Q4" },
    { id: "FULL_YEAR", label: "Full Year" },
  ];

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "INCOME":
        return <ArrowDownLeft className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case "EXPENSE":
        return <ArrowUpRight className="w-5 h-5 text-rose-600 dark:text-rose-400" />;
      case "TRANSFER":
        return <ArrowRightLeft className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      default:
        return <Activity className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "INCOME":
        return "text-emerald-600 dark:text-emerald-400";
      case "EXPENSE":
        return "text-rose-600 dark:text-rose-400";
      case "TRANSFER":
        return "text-blue-600 dark:text-blue-400";
      default:
        return "text-zinc-900 dark:text-white";
    }
  };

  const baseCurrency = "LKR";
  const totalIncome = transactions.filter((t: any) => t.type === "INCOME").reduce((acc: number, t: any) => acc + convertCurrency(t.amount, t.currency || t.sourceWalletId?.currency || "LKR", baseCurrency), 0);
  const totalExpense = transactions.filter((t: any) => t.type === "EXPENSE").reduce((acc: number, t: any) => acc + convertCurrency(t.amount, t.currency || t.sourceWalletId?.currency || "LKR", baseCurrency), 0);
  const netFlow = totalIncome - totalExpense;

  // Framer Motion Variants
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
      
      {/* Background Ambient Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 dark:bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-emerald-400/10 dark:bg-emerald-900/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto z-10">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >

          {/* Header & Summary Section */}
          <motion.header variants={itemVariants} className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8 pb-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200/50 dark:border-zinc-800/50 mb-2">
                <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Ledger</span>
              </div>
              <h1 className="text-[3.5rem] md:text-[4.5rem] font-black tracking-tighter text-zinc-900 dark:text-white leading-none">
                Transactions
              </h1>
            </div>

            {/* Premium Summary Cards */}
            <div className="flex gap-4 w-full xl:w-auto overflow-x-auto hide-scrollbar pb-2 xl:pb-0">
              {/* Income Card */}
              <div className="bg-white dark:bg-[#121214] border border-zinc-100 dark:border-zinc-800/60 rounded-[1.5rem] p-5 shadow-xl shadow-zinc-200/40 dark:shadow-none min-w-[160px] flex-shrink-0 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
                <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Total In</p>
                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1 tabular-nums">
                  <ArrowDownLeft className="w-4 h-4" />
                  {formatCurrency(totalIncome, baseCurrency)}
                </p>
              </div>
              
              {/* Expense Card */}
              <div className="bg-white dark:bg-[#121214] border border-zinc-100 dark:border-zinc-800/60 rounded-[1.5rem] p-5 shadow-xl shadow-zinc-200/40 dark:shadow-none min-w-[160px] flex-shrink-0 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
                <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Total Out</p>
                <p className="text-xl font-black text-rose-600 dark:text-rose-400 flex items-center gap-1 tabular-nums">
                  <ArrowUpRight className="w-4 h-4" />
                  {formatCurrency(totalExpense, baseCurrency)}
                </p>
              </div>

              {/* Net Flow Card */}
              <div className="bg-zinc-900 dark:bg-zinc-50 border border-zinc-800 dark:border-zinc-200 rounded-[1.5rem] p-5 shadow-2xl min-w-[160px] flex-shrink-0 relative overflow-hidden group">
                <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Net Flow</p>
                <p className={cn("text-xl font-black flex items-center gap-1 tabular-nums", netFlow >= 0 ? "text-white dark:text-zinc-900" : "text-rose-400 dark:text-rose-500")}>
                  {netFlow >= 0 ? "+" : ""}{formatCurrency(netFlow, baseCurrency)}
                </p>
              </div>
            </div>
          </motion.header>

          {/* Filters (SaaS Pill Design) */}
          <motion.section variants={itemVariants} className="w-full overflow-x-auto hide-scrollbar pb-2">
            <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-[#121214] border border-zinc-100 dark:border-zinc-800/60 rounded-2xl w-max shadow-sm">
              {filterOptions.map((opt) => {
                const isActive = currentFilter === opt.id;
                return (
                  <Link 
                    key={opt.id}
                    href={`/transactions?filter=${opt.id}`}
                    className={cn(
                      "px-5 py-2 rounded-xl text-[13px] font-bold transition-all duration-300 whitespace-nowrap relative",
                      isActive 
                        ? "text-white shadow-md" 
                        : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeFilter"
                        className="absolute inset-0 bg-emerald-500 dark:bg-emerald-600 rounded-xl"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-10">{opt.label}</span>
                  </Link>
                )
              })}
            </div>
          </motion.section>

          {/* Transactions List */}
          <motion.section variants={itemVariants} className="bg-white dark:bg-[#121214] border border-zinc-100 dark:border-zinc-800/60 rounded-[2rem] p-4 sm:p-8 shadow-2xl shadow-zinc-200/40 dark:shadow-none">
            {transactions.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <Search className="w-10 h-10 text-zinc-300 dark:text-zinc-600" />
                </div>
                <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-2">No Records Found</h3>
                <p className="text-zinc-500 font-medium max-w-xs">
                  There are no financial movements matching this time period.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {transactions.map((t: any) => {
                  const currency = t.sourceWalletId?.currency || "USD";
                  const isTransfer = t.type === "TRANSFER";
                  const isIncome = t.type === "INCOME";

                  return (
                    <div key={t._id} className="group p-4 sm:p-5 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/20 border border-zinc-100 dark:border-zinc-800/50 hover:bg-white dark:hover:bg-zinc-800/60 hover:shadow-xl hover:shadow-zinc-200/30 dark:hover:shadow-none hover:-translate-y-0.5 transition-all flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-[1.2rem] flex items-center justify-center shrink-0 shadow-inner ${isIncome ? 'bg-emerald-50 dark:bg-emerald-500/10' : isTransfer ? 'bg-blue-50 dark:bg-blue-500/10' : 'bg-zinc-100 dark:bg-zinc-800'}`}>
                          {getTransactionIcon(t.type)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-zinc-900 dark:text-white text-lg tracking-tight">
                            {t.description || (isTransfer ? "Wallet Transfer" : t.categoryId?.name || t.type)}
                          </span>
                          <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 mt-1">
                            <span className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 rounded-md shadow-sm">
                              {new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span>•</span>
                            <span className="truncate max-w-[100px] sm:max-w-[150px]">{t.sourceWalletId?.name || 'Unknown'}</span>
                            {isTransfer && t.destinationWalletId && (
                              <>
                                <ArrowRightLeft className="w-3 h-3 mx-0.5 opacity-50" />
                                <span className="truncate max-w-[100px] sm:max-w-[150px]">{t.destinationWalletId.name}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 sm:gap-6">
                        <div className="flex flex-col items-end">
                          <span className={cn("font-black text-xl tabular-nums tracking-tight", getTransactionColor(t.type))}>
                            {t.type === "EXPENSE" ? "-" : t.type === "INCOME" ? "+" : ""}
                            {formatCurrency(t.amount, currency)}
                          </span>
                          {t.categoryId && (
                            <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-1">
                              {t.categoryId.name}
                            </span>
                          )}
                        </div>
                        <TransactionRowActions transaction={t} wallets={wallets} categories={categories} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.section>
        </motion.div>
      </div>

      {wallets.length > 0 && (
        <TransactionFAB userId={user._id.toString()} wallets={wallets} categories={categories} />
      )}
    </div>
  );
}
