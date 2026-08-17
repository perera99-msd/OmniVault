import { getTransactionsHistory } from "@/actions/finance";
import { ArrowDownLeft, ArrowUpRight, ArrowRightLeft, Calendar, Search, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import * as motion from "framer-motion/client";
import { formatCurrency, convertCurrency } from "@/lib/utils/currency";

import { TransactionRowActions } from "./TransactionRowActions";
import { TransactionFAB } from "@/components/ui/TransactionFAB";
import { TransactionsFilterBar } from "@/components/transactions/TransactionsFilterBar";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const resolvedParams = await searchParams;
  const currentFilter = resolvedParams.filter || "THIS_MONTH";

  const res = await getTransactionsHistory(undefined, currentFilter);
  if (!res.success || !res.data) return null;

  const { user, transactions, wallets, categories } = res.data;

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "INCOME":
        return <ArrowDownLeft className="w-5 h-5 text-[#213F33] dark:text-[#4E6C5F]" />;
      case "EXPENSE":
        return <ArrowUpRight className="w-5 h-5 text-[#7A6652] dark:text-[#D4B48A]" />;
      case "TRANSFER":
        return <ArrowRightLeft className="w-5 h-5 text-[#987B5E] dark:text-[#D4B48A]" />;
      default:
        return <Activity className="w-5 h-5 text-[#6C5B4C] dark:text-[#9A9EA4]" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "INCOME":
        return "text-[#213F33] dark:text-[#4E6C5F]";
      case "EXPENSE":
        return "text-[#7A6652] dark:text-[#D4B48A]";
      case "TRANSFER":
        return "text-[#987B5E] dark:text-[#D4B48A]";
      default:
        return "text-[#1A1D1A] dark:text-[#EBE8E3]";
    }
  };

  const baseCurrency = (user as any)?.baseCurrency || "LKR";
  const totalIncome = transactions.filter((t: any) => t.type === "INCOME").reduce((acc: number, t: any) => acc + convertCurrency(t.amount, t.currency || t.sourceWalletId?.currency || "LKR", baseCurrency), 0);
  const totalExpense = transactions.filter((t: any) => t.type === "EXPENSE").reduce((acc: number, t: any) => acc + convertCurrency(t.amount, t.currency || t.sourceWalletId?.currency || "LKR", baseCurrency), 0);
  const netFlow = totalIncome - totalExpense;

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
          className="space-y-8"
        >

          {/* Header & Summary Section */}
          <motion.header variants={itemVariants} className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8 pb-4">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#181B18] shadow-sm border border-[#E8E2D8] dark:border-white/10 mb-1">
                <Calendar className="w-3.5 h-3.5 text-[#987B5E]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#6C5B4C] dark:text-[#9A9EA4]">Financial Ledger</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#1A1D1A] dark:text-[#EBE8E3] leading-none font-heading">
                Transactions
              </h1>
            </div>

            {/* Premium Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 w-full xl:w-auto pb-2 xl:pb-0">
              {/* Income Card */}
              <div className="order-2 sm:order-1 col-span-1 bg-white dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/5 rounded-2xl p-4 sm:p-5 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 bg-[#213F33]/10 rounded-full blur-xl sm:blur-2xl -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>
                <p className="text-[10px] sm:text-[11px] font-black text-[#6C5B4C] dark:text-[#9A9EA4] uppercase tracking-widest mb-1.5 truncate">Total Inflow</p>
                <p className="text-lg sm:text-xl font-black text-[#213F33] dark:text-[#4E6C5F] flex items-center gap-0.5 sm:gap-1 tabular-nums font-heading">
                  <ArrowDownLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 font-sans" />
                  <span className="truncate">{formatCurrency(totalIncome, baseCurrency)}</span>
                </p>
              </div>
              
              {/* Expense Card */}
              <div className="order-3 sm:order-2 col-span-1 bg-white dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/5 rounded-2xl p-4 sm:p-5 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 bg-[#7A6652]/10 rounded-full blur-xl sm:blur-2xl -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>
                <p className="text-[10px] sm:text-[11px] font-black text-[#6C5B4C] dark:text-[#9A9EA4] uppercase tracking-widest mb-1.5 truncate">Total Outflow</p>
                <p className="text-lg sm:text-xl font-black text-[#7A6652] dark:text-[#D4B48A] flex items-center gap-0.5 sm:gap-1 tabular-nums font-heading">
                  <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 font-sans" />
                  <span className="truncate">{formatCurrency(totalExpense, baseCurrency)}</span>
                </p>
              </div>

              {/* Net Flow Card */}
              <div className="order-1 sm:order-3 col-span-2 sm:col-span-1 bg-white dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/5 rounded-2xl p-4 sm:p-5 shadow-sm relative overflow-hidden group">
                <p className="text-[10px] sm:text-[11px] font-black text-[#6C5B4C] dark:text-[#9A9EA4] uppercase tracking-widest mb-1.5 truncate">Net Capital Flow</p>
                <p className={cn("text-2xl font-black flex items-center gap-0.5 sm:gap-1 tabular-nums font-heading", netFlow >= 0 ? "text-[#1A1D1A] dark:text-[#EBE8E3]" : "text-rose-600 dark:text-rose-400")}>
                  <span className="truncate">{netFlow >= 0 ? "+" : ""}{formatCurrency(netFlow, baseCurrency)}</span>
                </p>
              </div>
            </div>
          </motion.header>

          {/* Responsive Filters */}
          <motion.section variants={itemVariants} className="w-full pb-2">
            <TransactionsFilterBar currentFilter={currentFilter} />
          </motion.section>

          {/* Transactions List */}
          <motion.section variants={itemVariants} className="bg-white dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/5 rounded-[2.5rem] p-4 sm:p-8 shadow-sm">
            {transactions.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-[#FAF8F3] dark:bg-[#202420] rounded-full flex items-center justify-center mb-6 shadow-inner text-[#987B5E]">
                  <Search className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-[#1A1D1A] dark:text-[#EBE8E3] mb-2 font-heading">No Records Found</h3>
                <p className="text-[#6C5B4C] dark:text-[#9A9EA4] font-medium max-w-xs">
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
                    <div key={t._id} className="group p-3 sm:p-5 rounded-2xl bg-[#FAF8F3]/70 dark:bg-[#202420]/70 border border-[#E8E2D8]/60 dark:border-white/5 hover:bg-white dark:hover:bg-[#252B25] hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-between gap-2 sm:gap-3">
                      <div className="flex items-center gap-3 sm:gap-5 min-w-0 flex-1">
                        <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-[1.2rem] flex items-center justify-center shrink-0 shadow-inner ${isIncome ? 'bg-[#213F33]/10 dark:bg-[#385A4D]/20' : isTransfer ? 'bg-[#987B5E]/10 dark:bg-[#987B5E]/20' : 'bg-[#FAF8F3] dark:bg-[#181B18]'}`}>
                          {getTransactionIcon(t.type)}
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="font-bold text-[#1A1D1A] dark:text-[#EBE8E3] text-sm sm:text-base tracking-tight truncate">
                            {t.description || (isTransfer ? "Vault Transfer" : t.categoryId?.name || t.type)}
                          </span>
                          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold text-[#6C5B4C] dark:text-[#9A9EA4] mt-0.5 sm:mt-1 truncate">
                            <span className="bg-white dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/10 px-1.5 sm:px-2 py-0.5 rounded-md shadow-sm shrink-0">
                              {new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' })}
                            </span>
                            <span className="shrink-0 hidden sm:inline">•</span>
                            <span className="truncate uppercase text-[#987B5E] dark:text-[#D4B48A]">{t.sourceWalletId?.name || 'Vault'}</span>
                            {isTransfer && t.destinationWalletId && (
                              <>
                                <ArrowRightLeft className="w-2.5 h-2.5 sm:w-3 sm:h-3 mx-0.5 opacity-50 shrink-0" />
                                <span className="truncate uppercase text-[#987B5E] dark:text-[#D4B48A]">{t.destinationWalletId.name}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 sm:gap-6 shrink-0">
                        <div className="flex flex-col items-end max-w-[110px] sm:max-w-[160px]">
                          <span className={cn("font-black text-sm sm:text-lg tabular-nums tracking-tight truncate w-full text-right font-heading", getTransactionColor(t.type))}>
                            {t.type === "EXPENSE" ? "-" : t.type === "INCOME" ? "+" : ""}
                            {formatCurrency(t.amount, currency)}
                          </span>
                          {t.categoryId && (
                            <span className="text-[8px] sm:text-[9.5px] font-black text-[#987B5E] dark:text-[#D4B48A] uppercase tracking-widest mt-0.5 truncate w-full text-right">
                              {t.categoryId.name}
                            </span>
                          )}
                        </div>
                        <div>
                          <TransactionRowActions transaction={t} wallets={wallets} categories={categories} />
                        </div>
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
        <TransactionFAB wallets={wallets} categories={categories} />
      )}
    </div>
  );
}
