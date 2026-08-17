"use client";

import { useState } from "react";
import { LoanCard } from "@/components/cards/LoanCard";
import { motion, AnimatePresence } from "framer-motion";

export function LoanTabs({ loans }: { loans: any[] }) {
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "HISTORY">("ACTIVE");

  const activeLoans = loans.filter(l => l.status !== "SETTLED");
  const historyLoans = loans.filter(l => l.status === "SETTLED");

  const displayLoans = activeTab === "ACTIVE" ? activeLoans : historyLoans;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } }
  };

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="flex gap-8 border-b border-[#E8E2D8] dark:border-white/5 pb-px">
        <button
          onClick={() => setActiveTab("ACTIVE")}
          className={`pb-4 text-sm font-black tracking-tight transition-all relative font-heading ${activeTab === "ACTIVE"
              ? "text-[#1A1D1A] dark:text-[#EBE8E3]"
              : "text-[#6C5B4C] dark:text-[#9A9EA4] hover:text-[#1A1D1A] dark:hover:text-white"
            }`}
        >
          Active Contracts
          {activeTab === "ACTIVE" && (
            <motion.span 
              layoutId="loanTabIndicator"
              className="absolute bottom-0 left-0 w-full h-1 bg-[#987B5E] rounded-t-full shadow-[0_0_10px_rgba(152,123,94,0.5)]" 
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab("HISTORY")}
          className={`pb-4 text-sm font-black tracking-tight transition-all relative font-heading ${activeTab === "HISTORY"
              ? "text-[#1A1D1A] dark:text-[#EBE8E3]"
              : "text-[#6C5B4C] dark:text-[#9A9EA4] hover:text-[#1A1D1A] dark:hover:text-white"
            }`}
        >
          Settled History
          {activeTab === "HISTORY" && (
            <motion.span 
              layoutId="loanTabIndicator"
              className="absolute bottom-0 left-0 w-full h-1 bg-[#213F33] dark:bg-[#4E6C5F] rounded-t-full shadow-[0_0_10px_rgba(33,63,51,0.5)]" 
            />
          )}
        </button>
      </div>

      {/* Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {displayLoans.length === 0 ? (
            <div className="text-center py-24 bg-white/50 dark:bg-[#181B18]/50 border border-[#E8E2D8] dark:border-white/5 rounded-[2.5rem] shadow-sm">
              <p className="text-[#6C5B4C] dark:text-[#9A9EA4] font-bold text-sm">No loan contracts found in this category.</p>
            </div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {displayLoans.map((loan) => (
                <LoanCard key={loan._id} loan={loan} variants={itemVariants} />
              ))}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}