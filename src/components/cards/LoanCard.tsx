"use client";

import { useState } from "react";
import { settleLoan, deleteLoan } from "@/actions/loans";
import { ArrowUpRight, ArrowDownRight, CalendarClock, CheckCircle, Clock, Check, Trash2, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { EditLoanForm } from "@/components/forms/EditLoanForm";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils/currency";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface LoanCardProps {
  loan: any;
  variants?: any;
}

export function LoanCard({ loan, variants }: LoanCardProps) {
  const [loading, setLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [settleOpen, setSettleOpen] = useState(false);
  const isGiven = loan.type === "GIVEN"; // Lent (Asset) -> Emerald
  const isSettled = loan.status === "SETTLED";

  const getInitials = (name: string) => name.charAt(0).toUpperCase();
  const isOverdue = loan.dueDate && new Date(loan.dueDate) < new Date() && !isSettled;

  // Calculate progress based on dates (mock progress if no start date, we'll assume 50% for visuals unless overdue)
  // Real implementation would use createdAt and dueDate
  const progressPercent = isSettled ? 100 : (isOverdue ? 100 : 45); 

  const CardWrapper = variants ? motion.div : 'div';

  return (
    <CardWrapper
      variants={variants}
      className={`bg-white dark:bg-[#121214] border ${isOverdue ? 'border-rose-200 dark:border-rose-500/30' : 'border-zinc-100 dark:border-zinc-800/60'} rounded-[2rem] p-7 shadow-xl shadow-zinc-200/40 dark:shadow-none transition-all duration-500 hover:shadow-2xl flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1`}
    >
      {/* Animated Glowing Progress Track */}
      <div className="absolute bottom-0 left-0 w-full h-1.5 bg-zinc-100 dark:bg-zinc-800">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={`h-full ${isSettled ? 'bg-zinc-300 dark:bg-zinc-600' : (isOverdue ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)]' : (isGiven ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]'))}`}
        />
      </div>

      {/* Thematic Background Accent Glow */}
      <div className={`absolute -top-10 -right-10 w-40 h-40 blur-[60px] rounded-full pointer-events-none opacity-0 transition-opacity duration-700 group-hover:opacity-30 ${isGiven ? 'bg-emerald-500' : 'bg-blue-500'}`} />

      {/* Header */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-inner ${isGiven ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'}`}>
            {getInitials(loan.personName)}
          </div>
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-white text-base tracking-tight">{loan.personName}</h3>
            <p className="text-xs font-semibold text-zinc-500 flex items-center gap-1 mt-0.5">
              {isGiven ? <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> : <TrendingDown className="w-3.5 h-3.5 text-blue-500" />}
              {isGiven ? "You Lent Money" : "You Borrowed Money"}
            </p>
          </div>
        </div>

        {isSettled ? (
          <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
            <CheckCircle className="w-3.5 h-3.5" /> Settled
          </span>
        ) : isOverdue ? (
          <span className="bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm animate-pulse">
            Overdue
          </span>
        ) : (
          <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
            Active
          </span>
        )}
      </div>

      {/* Body */}
      <div className="relative z-10 mb-8">
        <p className={`text-4xl font-black tracking-tighter drop-shadow-sm tabular-nums ${isGiven ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-900 dark:text-white'}`}>
          {formatCurrency(loan.amount, loan.currency || "LKR")}
        </p>
        {loan.description && (
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-4 bg-zinc-50 dark:bg-zinc-900/50 p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800 line-clamp-2">
            "{loan.description}"
          </p>
        )}
      </div>

      {/* Footer & Actions */}
      <div className="pt-5 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-zinc-400">
          {loan.dueDate ? (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${isOverdue ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400' : 'bg-zinc-50 border-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400'}`}>
              <CalendarClock className="w-3.5 h-3.5" />
              <span>Due: {new Date(loan.dueDate).toLocaleDateString()}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400">
              <Clock className="w-3.5 h-3.5" />
              <span>No Deadline</span>
            </div>
          )}
        </div>

        {!isSettled && (
          <div className="flex items-center gap-2">
            <EditLoanForm loan={loan} />
            
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
              <DialogTrigger className="w-11 h-11 flex items-center justify-center rounded-xl text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors disabled:opacity-50" title="Delete">
                <Trash2 className="w-5 h-5" />
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-white dark:bg-[#121214] border-zinc-100 dark:border-zinc-800/60 shadow-2xl p-6 rounded-[2rem]">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-500" /> Delete Loan Record
                  </DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                    Are you sure you want to delete this loan record entirely? This action cannot be undone.
                  </p>
                </div>
                <DialogFooter>
                  <Button onClick={() => setDeleteOpen(false)} variant="ghost" className="rounded-xl font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white">Cancel</Button>
                  <Button 
                    onClick={async () => {
                      setLoading(true);
                      await deleteLoan(loan._id);
                      setLoading(false);
                      setDeleteOpen(false);
                    }} 
                    disabled={loading} 
                    className="rounded-xl font-bold bg-rose-500 hover:bg-rose-600 text-white min-w-[100px]"
                  >
                    {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Yes, Delete"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={settleOpen} onOpenChange={setSettleOpen}>
              <DialogTrigger className="flex items-center justify-center gap-1.5 text-xs font-bold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:scale-105 px-4 h-11 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95">
                <Check className="w-3.5 h-3.5" />
                Settle
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-white dark:bg-[#121214] border-zinc-100 dark:border-zinc-800/60 shadow-2xl p-6 rounded-[2rem]">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500" /> Settle Loan
                  </DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                    Are you sure you want to mark this loan as fully settled? This will update your records and mark the contract as complete.
                  </p>
                </div>
                <DialogFooter>
                  <Button onClick={() => setSettleOpen(false)} variant="ghost" className="rounded-xl font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white">Cancel</Button>
                  <Button 
                    onClick={async () => {
                      setLoading(true);
                      await settleLoan(loan._id);
                      setLoading(false);
                      setSettleOpen(false);
                    }} 
                    disabled={loading} 
                    className="rounded-xl font-bold bg-emerald-500 hover:bg-emerald-600 text-white min-w-[100px]"
                  >
                    {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Yes, Settle"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

          </div>
        )}
      </div>
    </CardWrapper>
  );
}