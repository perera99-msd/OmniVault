"use client";

import { useState } from "react";
import { LoanCard } from "@/components/cards/LoanCard";
import { motion, AnimatePresence } from "framer-motion";

export function LoanTabs({ loans }: { loans: any[] }) {
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "HISTORY">("ACTIVE");

  const activeLoans = loans.filter(l => l.status === "PENDING");
  const historyLoans = loans.filter(l => l.status === "SETTLED");

  const displayLoans = activeTab === "ACTIVE" ? activeLoans : historyLoans;

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
    <div className="space-y-8">
      {/* Tabs */}
      <div className="flex gap-8 border-b border-zinc-200 dark:border-zinc-800 pb-px">
        <button
          onClick={() => setActiveTab("ACTIVE")}
          className={`pb-4 text-sm font-bold transition-all relative ${activeTab === "ACTIVE"
              ? "text-zinc-900 dark:text-white"
              : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
        >
          Active Contracts
          {activeTab === "ACTIVE" && (
            <motion.span 
              layoutId="loanTabIndicator"
              className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500 rounded-t-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab("HISTORY")}
          className={`pb-4 text-sm font-bold transition-all relative ${activeTab === "HISTORY"
              ? "text-zinc-900 dark:text-white"
              : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
        >
          Settled History
          {activeTab === "HISTORY" && (
            <motion.span 
              layoutId="loanTabIndicator"
              className="absolute bottom-0 left-0 w-full h-1 bg-zinc-900 dark:bg-white rounded-t-full shadow-[0_0_10px_rgba(255,255,255,0.2)]" 
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
            <div className="text-center py-24 bg-white/50 dark:bg-[#121214]/50 border border-zinc-200 dark:border-white/5 rounded-[2rem] shadow-sm">
              <p className="text-zinc-400 font-bold text-sm">No loan contracts found in this category.</p>
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