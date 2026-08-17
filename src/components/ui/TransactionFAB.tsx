"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DailyTransactionForm } from "@/components/forms/DailyTransactionForm";
import { motion } from "framer-motion";

interface TransactionFABProps {
  wallets: any[];
  categories: any[];
}

export function TransactionFAB({ wallets, categories }: TransactionFABProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="fixed bottom-24 md:bottom-8 left-1/2 md:left-auto md:right-8 -translate-x-1/2 md:translate-x-0 z-50 rounded-full outline-none">
        <motion.div 
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2B493D] via-[#213F33] to-[#121E19] flex items-center justify-center text-[#FDFBF7] shadow-[0_10px_35px_rgba(33,63,51,0.55)] group border border-[#987B5E]/40 cursor-pointer"
        >
          {/* Pulsing rings */}
          <span className="absolute w-full h-full rounded-full border border-[#987B5E]/50 animate-ping opacity-25" style={{ animationDuration: '3s' }} />
          <span className="absolute w-full h-full rounded-full border border-[#213F33]/40 animate-ping opacity-15" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
          
          <Plus className="w-8 h-8 stroke-[2.5px] text-[#D4B48A] drop-shadow-md group-hover:rotate-90 transition-transform duration-500" />
        </motion.div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md w-[95vw] max-h-[90vh] overflow-y-auto bg-[#FDFBF7] dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] p-6 sm:p-8 rounded-[2.5rem] gap-0">
        <DialogHeader className="mb-6 flex flex-row items-center justify-center relative">
          <DialogTitle className="text-2xl font-black text-center text-[#1A1D1A] dark:text-[#EBE8E3] tracking-tight font-heading">Record Transaction</DialogTitle>
        </DialogHeader>
        <DailyTransactionForm wallets={wallets} categories={categories} />
      </DialogContent>
    </Dialog>
  );
}
