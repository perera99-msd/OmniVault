"use client";

import { useState } from "react";
import { settleLoan, deleteLoan, recordPartialLoanPayment } from "@/actions/loans";
import { CheckCircle, Clock, Check, Trash2, TrendingUp, TrendingDown, AlertTriangle, Coins, CalendarClock } from "lucide-react";
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
  const [settleMode, setSettleMode] = useState<"FULL" | "PARTIAL">("FULL");
  const [partialAmount, setPartialAmount] = useState("");
  const isGiven = loan.type === "GIVEN";
  const isSettled = loan.status === "SETTLED";

  const getInitials = (name: string) => name.charAt(0).toUpperCase();
  const isOverdue = loan.dueDate && new Date(loan.dueDate) < new Date() && !isSettled;

  const progressPercent = isSettled ? 100 : (isOverdue ? 100 : 45); 

  const CardWrapper = variants ? motion.div : 'div';

  return (
    <CardWrapper
      variants={variants}
      className={`bg-white dark:bg-[#181B18] border ${isOverdue ? 'border-rose-200 dark:border-rose-500/30' : 'border-[#E8E2D8] dark:border-white/10'} rounded-[2rem] p-7 shadow-sm transition-all duration-500 hover:shadow-md flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1`}
    >
      {/* Animated Progress Track */}
      <div className="absolute bottom-0 left-0 w-full h-1.5 bg-[#FAF8F3] dark:bg-[#202420]">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={`h-full ${isSettled ? 'bg-[#9EA2A8] dark:bg-[#6C7177]' : (isOverdue ? 'bg-rose-500' : (isGiven ? 'bg-[#213F33] dark:bg-[#4E6C5F]' : 'bg-[#987B5E]'))}`}
        />
      </div>

      {/* Header */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-inner ${isGiven ? 'bg-[#213F33]/10 dark:bg-[#385A4D]/20 text-[#213F33] dark:text-[#4E6C5F]' : 'bg-[#987B5E]/10 text-[#987B5E] dark:text-[#D4B48A]'}`}>
            {getInitials(loan.personName)}
          </div>
          <div>
            <h3 className="font-bold text-[#1A1D1A] dark:text-[#EBE8E3] text-base tracking-tight font-heading">{loan.personName}</h3>
            <p className="text-xs font-semibold text-[#6C5B4C] dark:text-[#9A9EA4] flex items-center gap-1 mt-0.5">
              {isGiven ? <TrendingUp className="w-3.5 h-3.5 text-[#213F33] dark:text-[#4E6C5F]" /> : <TrendingDown className="w-3.5 h-3.5 text-[#987B5E]" />}
              {isGiven ? "Capital Lent Out" : "Personal Liability"}
            </p>
          </div>
        </div>

        {isSettled ? (
          <span className="bg-[#FAF8F3] dark:bg-[#202420] text-[#6C5B4C] dark:text-[#9A9EA4] text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1.5 shadow-sm border border-[#E8E2D8] dark:border-white/10">
            <CheckCircle className="w-3.5 h-3.5" /> Settled
          </span>
        ) : isOverdue ? (
          <span className="bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm animate-pulse">
            Overdue
          </span>
        ) : (
          <span className="bg-[#213F33]/10 dark:bg-[#385A4D]/20 text-[#213F33] dark:text-[#4E6C5F] border border-[#213F33]/20 dark:border-[#385A4D]/30 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
            Active
          </span>
        )}
      </div>

      {/* Body */}
      <div className="relative z-10 mb-8">
        <p className={`text-4xl font-black tracking-tighter drop-shadow-sm tabular-nums font-heading ${isGiven ? 'text-[#213F33] dark:text-[#4E6C5F]' : 'text-[#1A1D1A] dark:text-[#EBE8E3]'}`}>
          {formatCurrency(loan.amount, loan.currency || "LKR")}
        </p>
        {loan.description && (
          <p className="text-sm font-medium text-[#6C5B4C] dark:text-[#9A9EA4] mt-4 bg-[#FAF8F3] dark:bg-[#202420] p-3.5 rounded-xl border border-[#E8E2D8] dark:border-white/10 line-clamp-2">
            "{loan.description}"
          </p>
        )}
      </div>

      {/* Footer & Actions */}
      <div className="pt-5 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#6C5B4C] dark:text-[#9A9EA4]">
          {loan.dueDate ? (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${isOverdue ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400' : 'bg-[#FAF8F3] border-[#E8E2D8] text-[#6C5B4C] dark:bg-[#202420] dark:border-white/10 dark:text-[#9A9EA4]'}`}>
              <CalendarClock className="w-3.5 h-3.5 text-[#987B5E]" />
              <span>Due: {new Date(loan.dueDate).toLocaleDateString()}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF8F3] border border-[#E8E2D8] text-[#6C5B4C] dark:bg-[#202420] dark:border-white/10 dark:text-[#9A9EA4]">
              <Clock className="w-3.5 h-3.5 text-[#987B5E]" />
              <span>No Deadline</span>
            </div>
          )}
        </div>

        {!isSettled && (
          <div className="flex items-center gap-2">
            <EditLoanForm loan={loan} />
            
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
              <DialogTrigger className="w-11 h-11 flex items-center justify-center rounded-xl text-[#6C5B4C] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors disabled:opacity-50" title="Delete">
                <Trash2 className="w-5 h-5" />
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-[#FDFBF7] dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/10 shadow-2xl p-6 rounded-[2rem]">
                <DialogHeader>
                  <DialogTitle className="text-xl font-black text-[#1A1D1A] dark:text-[#EBE8E3] flex items-center gap-2 font-heading">
                    <AlertTriangle className="w-5 h-5 text-rose-500" /> Delete Loan Record
                  </DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm text-[#6C5B4C] dark:text-[#9A9EA4] font-medium">
                    Are you sure you want to delete this loan record entirely? This action cannot be undone.
                  </p>
                </div>
                <DialogFooter>
                  <Button onClick={() => setDeleteOpen(false)} variant="ghost" className="rounded-xl font-bold text-[#6C5B4C]">Cancel</Button>
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
              <DialogTrigger className="flex items-center justify-center gap-1.5 text-xs font-bold btn-tria-primary hover:scale-105 px-4 h-11 rounded-xl transition-all shadow-md active:scale-95">
                <Check className="w-3.5 h-3.5 text-[#D4B48A]" />
                Settle
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-[#FDFBF7] dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/10 shadow-2xl p-6 rounded-[2rem]">
                <DialogHeader>
                  <DialogTitle className="text-xl font-black text-[#1A1D1A] dark:text-[#EBE8E3] flex items-center gap-2 font-heading">
                    <CheckCircle className="w-5 h-5 text-[#213F33] dark:text-[#4E6C5F]" /> Settle Loan Options
                  </DialogTitle>
                </DialogHeader>

                <div className="flex p-1 bg-[#FAF8F3] dark:bg-[#202420] rounded-xl my-2 text-xs font-bold border border-[#E8E2D8] dark:border-white/5">
                  <button
                    type="button"
                    onClick={() => setSettleMode("FULL")}
                    className={`flex-1 py-2 rounded-lg transition-all font-bold ${settleMode === "FULL" ? "bg-white dark:bg-[#181B18] text-[#1A1D1A] dark:text-[#EBE8E3] shadow-sm" : "text-[#6C5B4C] dark:text-[#9A9EA4]"}`}
                  >
                    Full Immediate Settlement
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettleMode("PARTIAL")}
                    className={`flex-1 py-2 rounded-lg transition-all font-bold ${settleMode === "PARTIAL" ? "bg-white dark:bg-[#181B18] text-[#1A1D1A] dark:text-[#EBE8E3] shadow-sm" : "text-[#6C5B4C] dark:text-[#9A9EA4]"}`}
                  >
                    Part by Part Payment
                  </button>
                </div>

                {settleMode === "FULL" ? (
                  <>
                    <div className="py-2">
                      <p className="text-sm text-[#6C5B4C] dark:text-[#9A9EA4] font-medium">
                        Are you sure you want to mark this loan as fully settled right now? This will update your records and move the contract to Settled History.
                      </p>
                    </div>
                    <DialogFooter>
                      <Button onClick={() => setSettleOpen(false)} variant="ghost" className="rounded-xl font-bold text-[#6C5B4C]">Cancel</Button>
                      <Button 
                        onClick={async () => {
                          setLoading(true);
                          await settleLoan(loan._id);
                          setLoading(false);
                          setSettleOpen(false);
                        }} 
                        disabled={loading} 
                        className="rounded-xl font-bold btn-tria-primary text-white min-w-[120px]"
                      >
                        {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Yes, Settle Full"}
                      </Button>
                    </DialogFooter>
                  </>
                ) : (
                  <>
                    <div className="py-2 space-y-3">
                      <p className="text-xs text-[#6C5B4C] dark:text-[#9A9EA4] font-medium">
                        Enter the amount paid or received today. The outstanding loan balance will be reduced accordingly.
                      </p>
                      <div className="p-3 bg-white dark:bg-[#202420] rounded-xl border border-[#E8E2D8] dark:border-white/5 space-y-1">
                        <div className="flex justify-between text-xs text-[#6C5B4C] dark:text-[#9A9EA4]">
                          <span>Current Balance:</span>
                          <span className="font-bold text-[#1A1D1A] dark:text-[#EBE8E3] font-heading">{formatCurrency(loan.amount, loan.currency || "LKR")}</span>
                        </div>
                        {parseFloat(partialAmount) > 0 && (
                          <>
                            <div className="flex justify-between text-xs text-[#213F33] dark:text-[#4E6C5F]">
                              <span>Paying Now:</span>
                              <span className="font-bold font-heading">- {formatCurrency(parseFloat(partialAmount), loan.currency || "LKR")}</span>
                            </div>
                            <div className="flex justify-between text-xs pt-1 border-t border-[#E8E2D8] dark:border-white/10 font-black">
                              <span>New Balance:</span>
                              <span className="text-[#1A1D1A] dark:text-[#EBE8E3] font-heading">
                                {formatCurrency(Math.max(0, loan.amount - parseFloat(partialAmount)), loan.currency || "LKR")}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#6C5B4C] dark:text-[#9A9EA4] mb-1">
                          Amount Paid ({loan.currency || "LKR"})
                        </label>
                        <div className="relative">
                          <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#987B5E]" />
                          <input
                            type="number"
                            step="any"
                            placeholder="e.g. 10000"
                            value={partialAmount}
                            onChange={(e) => setPartialAmount(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#202420] border border-[#E8E2D8] dark:border-white/10 text-sm font-bold text-[#1A1D1A] dark:text-[#EBE8E3] outline-none focus:border-[#987B5E]"
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={() => setSettleOpen(false)} variant="ghost" className="rounded-xl font-bold text-[#6C5B4C]">Cancel</Button>
                      <Button 
                        onClick={async () => {
                          const amt = parseFloat(partialAmount);
                          if (!amt || amt <= 0) return;
                          setLoading(true);
                          await recordPartialLoanPayment(loan._id, amt);
                          setLoading(false);
                          setPartialAmount("");
                          setSettleOpen(false);
                        }} 
                        disabled={loading || !parseFloat(partialAmount) || parseFloat(partialAmount) <= 0} 
                        className="rounded-xl font-bold btn-tria-primary text-white min-w-[140px]"
                      >
                        {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Record Partial Pay"}
                      </Button>
                    </DialogFooter>
                  </>
                )}
              </DialogContent>
            </Dialog>

          </div>
        )}
      </div>
    </CardWrapper>
  );
}