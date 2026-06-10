"use client";

import { useState } from "react";
import { deleteUpcomingPayment, markUpcomingPaymentAsPaid } from "@/actions/upcoming";
import { Trash2, CheckCircle, AlertTriangle } from "lucide-react";
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
import { PremiumSpinner } from "@/components/ui/PremiumSpinner";

export function PaymentQuickActions({ paymentId, paymentName }: { paymentId: string, paymentName: string }) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [paidOpen, setPaidOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <>
      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogTrigger className="w-11 h-11 rounded-xl flex items-center justify-center text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-200 dark:hover:border-rose-500/20" title="Delete">
          <Trash2 className="w-4 h-4" />
        </DialogTrigger>
        <DialogContent className="sm:max-w-md bg-white dark:bg-[#121214] border-zinc-100 dark:border-zinc-800/60 shadow-2xl p-6 rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" /> Delete Payment
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
              Are you sure you want to delete <span className="font-bold text-zinc-900 dark:text-white">{paymentName}</span>? 
              This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setDeleteOpen(false)} variant="ghost" className="rounded-xl font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white">Cancel</Button>
            <Button 
              onClick={async () => {
                setLoading(true);
                await deleteUpcomingPayment(paymentId);
                setLoading(false);
                setDeleteOpen(false);
              }} 
              disabled={loading} 
              className="rounded-xl font-bold bg-rose-500 hover:bg-rose-600 text-white min-w-[100px]"
            >
              {loading ? <PremiumSpinner /> : "Yes, Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark as Paid Dialog */}
      <Dialog open={paidOpen} onOpenChange={setPaidOpen}>
        <DialogTrigger className="px-6 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-sm shadow-[0_5px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_20px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 active:scale-95 flex items-center gap-2 transition-all border border-transparent">
          <CheckCircle className="w-4 h-4" /> Mark as Paid
        </DialogTrigger>
        <DialogContent className="sm:max-w-md bg-white dark:bg-[#121214] border-zinc-100 dark:border-zinc-800/60 shadow-2xl p-6 rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" /> Mark as Paid
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
              Are you sure you want to mark <span className="font-bold text-zinc-900 dark:text-white">{paymentName}</span> as paid?
              This will update its status and record it in your history.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setPaidOpen(false)} variant="ghost" className="rounded-xl font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white">Cancel</Button>
            <Button 
              onClick={async () => {
                setLoading(true);
                await markUpcomingPaymentAsPaid(paymentId);
                setLoading(false);
                setPaidOpen(false);
              }} 
              disabled={loading} 
              className="rounded-xl font-bold bg-emerald-500 hover:bg-emerald-600 text-white min-w-[100px]"
            >
              {loading ? <PremiumSpinner /> : "Yes, Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
