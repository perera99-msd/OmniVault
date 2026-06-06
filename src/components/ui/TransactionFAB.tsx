"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DailyTransactionForm } from "@/components/forms/DailyTransactionForm";
import { motion } from "framer-motion";

interface TransactionFABProps {
  userId: string;
  wallets: any[];
  categories: any[];
}

export function TransactionFAB({ userId, wallets, categories }: TransactionFABProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="fixed bottom-24 md:bottom-8 left-1/2 md:left-auto md:right-8 -translate-x-1/2 md:translate-x-0 z-50 rounded-full outline-none">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-[0_0_40px_rgba(16,185,129,0.4)] group border border-emerald-300/30 cursor-pointer"
        >
          {/* Pulsing rings */}
          <span className="absolute w-full h-full rounded-full border border-emerald-400/50 animate-ping opacity-20" style={{ animationDuration: '3s' }} />
          <span className="absolute w-full h-full rounded-full border border-emerald-400/30 animate-ping opacity-10" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
          
          <Plus className="w-8 h-8 stroke-[2.5px] drop-shadow-md group-hover:rotate-90 transition-transform duration-500" />
        </motion.div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-[#121214]/95 backdrop-blur-3xl border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 rounded-[2rem]">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-black text-center text-zinc-900 dark:text-white tracking-tight">New Transaction</DialogTitle>
        </DialogHeader>
        <DailyTransactionForm userId={userId} wallets={wallets} categories={categories} />
      </DialogContent>
    </Dialog>
  );
}
