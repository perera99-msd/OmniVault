import { cookies } from "next/headers";
import { getLoansPageData } from "@/actions/loans";
import { CreateLoanForm } from "@/components/forms/CreateLoanForm";
import { LoanTabs } from "@/components/loans/LoanTabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, HandCoins, ArrowUpRight, ArrowDownRight, FileText } from "lucide-react";
import * as motion from "framer-motion/client";
import { formatCurrency, convertCurrency } from "@/lib/utils/currency";

export default async function LoansPage() {
  const cookieStore = await cookies();
  const firebaseUid = cookieStore.get("firebaseUid")?.value;

  if (!firebaseUid) return null;

  const res = await getLoansPageData(firebaseUid);
  if (!res.success || !res.data) return null;

  const { user, loans } = res.data;

  const baseCurrency = "LKR";

  // Stats (Only Active)
  const activeLoans = loans.filter((l: any) => l.status !== "SETTLED");
  const totalLent = activeLoans.filter((l: any) => l.type === "GIVEN").reduce((acc: number, l: any) => acc + convertCurrency(l.amount, l.currency || "LKR", baseCurrency), 0);
  const totalBorrowed = activeLoans.filter((l: any) => l.type === "RECEIVED").reduce((acc: number, l: any) => acc + convertCurrency(l.amount, l.currency || "LKR", baseCurrency), 0);

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

      {/* Ambient Palette Glow */}
      <div className="absolute top-[20%] right-[-5%] w-[40%] h-[40%] bg-emerald-500/10 dark:bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-10%] w-[35%] h-[35%] bg-blue-500/10 dark:bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto z-10">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >

          {/* Header */}
          <motion.header variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 pb-6 border-b border-zinc-200 dark:border-zinc-800">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200/50 dark:border-zinc-800/50 mb-2">
                <FileText className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Contracts</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-900 dark:text-white leading-none">
                Loans
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base font-bold tracking-wide">
                Track capital you have lent out and liabilities you owe.
              </p>
            </div>

            <Dialog>
              <DialogTrigger className="flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-8 py-4 rounded-full font-bold text-[14px] shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all duration-300">
                <Plus className="w-4 h-4 stroke-[3px]" /> Record New Loan
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-white dark:bg-[#121214] border-zinc-100 dark:border-zinc-800/60 shadow-2xl p-6 sm:p-8 rounded-[2rem]">
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-2xl font-bold text-center text-zinc-900 dark:text-white">Loan Details</DialogTitle>
                </DialogHeader>
                <CreateLoanForm />
              </DialogContent>
            </Dialog>
          </motion.header>

          {/* Aggregated Analytics Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-6">
            {/* LENT (ASSET) CARD */}
            <div className="bg-emerald-500 dark:bg-emerald-600 p-4 sm:p-8 rounded-2xl sm:rounded-[2rem] shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 sm:w-40 sm:h-40 bg-white/20 rounded-full blur-2xl sm:blur-3xl -mr-6 -mt-6 sm:-mr-10 sm:-mt-10 transition-transform group-hover:scale-150"></div>
              <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-4 relative z-10">
                <div className="p-1 sm:p-2 rounded-lg sm:rounded-xl bg-white/20">
                  <ArrowUpRight className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
                </div>
                <p className="text-[9px] sm:text-[11px] text-emerald-50 font-bold uppercase tracking-[0.1em] sm:tracking-[0.2em] truncate">Owed To You</p>
              </div>
              <p className="text-xl sm:text-[2.5rem] font-bold tracking-tight text-white relative z-10 tabular-nums">
                {formatCurrency(totalLent, baseCurrency)}
              </p>
            </div>

            {/* BORROWED (LIABILITY) CARD */}
            <div className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/5 p-4 sm:p-8 rounded-2xl sm:rounded-[2rem] shadow-sm flex flex-col justify-between overflow-hidden relative transition-colors duration-500 group">
              <div className="absolute top-0 right-0 w-24 h-24 sm:w-40 sm:h-40 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-2xl sm:blur-3xl -mr-6 -mt-6 sm:-mr-10 sm:-mt-10 transition-transform group-hover:scale-150"></div>
              <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-4 relative z-10">
                <div className="p-1 sm:p-2 rounded-lg sm:rounded-xl bg-blue-50 dark:bg-blue-500/10">
                  <ArrowDownRight className="w-3 h-3 sm:w-5 sm:h-5 text-blue-500" />
                </div>
                <p className="text-[9px] sm:text-[11px] text-zinc-500 font-bold uppercase tracking-[0.1em] sm:tracking-[0.2em] truncate">You Owe</p>
              </div>
              <p className="text-xl sm:text-[2.5rem] font-bold tracking-tight text-zinc-900 dark:text-white relative z-10 tabular-nums">
                {formatCurrency(totalBorrowed, baseCurrency)}
              </p>
            </div>
          </motion.div>

          {/* Tabs & Grid */}
          <motion.div variants={itemVariants}>
            <LoanTabs loans={loans} />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}