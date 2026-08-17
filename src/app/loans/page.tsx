import { getLoansPageData } from "@/actions/loans";
import { CreateLoanForm } from "@/components/forms/CreateLoanForm";
import { LoanTabs } from "@/components/loans/LoanTabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, ArrowUpRight, ArrowDownRight, FileText } from "lucide-react";
import * as motion from "framer-motion/client";
import { formatCurrency, convertCurrency } from "@/lib/utils/currency";

export default async function LoansPage() {
  const res = await getLoansPageData();
  if (!res.success || !res.data) return null;

  const { loans } = res.data;
  const baseCurrency = "LKR";

  const activeLoans = loans.filter((l: any) => l.status !== "SETTLED");
  const totalLent = activeLoans.filter((l: any) => l.type === "GIVEN").reduce((acc: number, l: any) => acc + convertCurrency(l.amount, l.currency || "LKR", baseCurrency), 0);
  const totalBorrowed = activeLoans.filter((l: any) => l.type === "RECEIVED").reduce((acc: number, l: any) => acc + convertCurrency(l.amount, l.currency || "LKR", baseCurrency), 0);

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

      {/* Ambient Glow */}
      <div className="absolute top-[20%] right-[-5%] w-[40%] h-[40%] bg-[#987B5E]/10 dark:bg-[#987B5E]/5 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-10%] w-[35%] h-[35%] bg-[#213F33]/10 dark:bg-[#385A4D]/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="relative p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto z-10">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >

          {/* Header */}
          <motion.header variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 pb-6 border-b border-[#E8E2D8] dark:border-white/5">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#181B18] shadow-sm border border-[#E8E2D8] dark:border-white/10 mb-1">
                <FileText className="w-3.5 h-3.5 text-[#987B5E]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#6C5B4C] dark:text-[#9A9EA4]">Credit & Debt Obligations</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#1A1D1A] dark:text-[#EBE8E3] leading-none font-heading">
                Loans & Credit
              </h1>
              <p className="text-[#6C5B4C] dark:text-[#9A9EA4] text-sm md:text-base font-bold tracking-wide">
                Track capital you have lent out and personal liabilities you owe.
              </p>
            </div>

            <Dialog>
              <DialogTrigger className="flex items-center gap-2 btn-tria-primary px-8 py-3.5 rounded-full font-bold text-[14px] shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all duration-300">
                <Plus className="w-4 h-4 stroke-[3px]" /> Record New Loan
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-[#FDFBF7] dark:bg-[#181B18] border-[#E8E2D8] dark:border-white/10 shadow-2xl p-6 sm:p-8 rounded-[2.5rem]">
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-2xl font-black text-center text-[#1A1D1A] dark:text-[#EBE8E3] font-heading">Loan Agreement</DialogTitle>
                </DialogHeader>
                <CreateLoanForm />
              </DialogContent>
            </Dialog>
          </motion.header>

          {/* Aggregated Analytics Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-6">
            {/* LENT (ASSET) CARD */}
            <div className="bg-gradient-to-br from-[#2B493D] via-[#213F33] to-[#121E19] p-4 sm:p-8 rounded-2xl sm:rounded-[2.5rem] shadow-lg relative overflow-hidden group border border-[#987B5E]/30">
              <div className="absolute top-0 right-0 w-24 h-24 sm:w-40 sm:h-40 bg-[#987B5E]/20 rounded-full blur-2xl sm:blur-3xl -mr-6 -mt-6 sm:-mr-10 sm:-mt-10 transition-transform group-hover:scale-150"></div>
              <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-4 relative z-10">
                <div className="p-1 sm:p-2 rounded-lg sm:rounded-xl bg-white/20">
                  <ArrowUpRight className="w-3 h-3 sm:w-5 sm:h-5 text-[#D4B48A]" />
                </div>
                <p className="text-[9px] sm:text-[11px] text-[#D4B48A] font-black uppercase tracking-[0.2em] truncate">Receivable (Owed to you)</p>
              </div>
              <p className="text-xl sm:text-[2.4rem] font-black tracking-tight text-[#FDFBF7] relative z-10 tabular-nums font-heading">
                {formatCurrency(totalLent, baseCurrency)}
              </p>
            </div>

            {/* BORROWED (LIABILITY) CARD */}
            <div className="bg-white dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/5 p-4 sm:p-8 rounded-2xl sm:rounded-[2.5rem] shadow-sm flex flex-col justify-between overflow-hidden relative transition-colors duration-500 group">
              <div className="absolute top-0 right-0 w-24 h-24 sm:w-40 sm:h-40 bg-[#987B5E]/10 rounded-full blur-2xl sm:blur-3xl -mr-6 -mt-6 sm:-mr-10 sm:-mt-10 transition-transform group-hover:scale-150"></div>
              <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-4 relative z-10">
                <div className="p-1 sm:p-2 rounded-lg sm:rounded-xl bg-[#FAF8F3] dark:bg-[#202420] text-[#987B5E]">
                  <ArrowDownRight className="w-3 h-3 sm:w-5 sm:h-5" />
                </div>
                <p className="text-[9px] sm:text-[11px] text-[#6C5B4C] dark:text-[#9A9EA4] font-black uppercase tracking-[0.2em] truncate">Payable (You owe)</p>
              </div>
              <p className="text-xl sm:text-[2.4rem] font-black tracking-tight text-[#1A1D1A] dark:text-[#EBE8E3] relative z-10 tabular-nums font-heading">
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