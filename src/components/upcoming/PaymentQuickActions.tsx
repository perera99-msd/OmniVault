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
        <DialogTrigger className="w-11 h-11 rounded-xl flex items-center justify-center text-[#6C5B4C] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-200 dark:hover:border-rose-500/20" title="Delete">
          <Trash2 className="w-4 h-4" />
        </DialogTrigger>
        <DialogContent className="sm:max-w-md bg-[#FDFBF7] dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/10 shadow-2xl p-6 rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-[#1A1D1A] dark:text-[#EBE8E3] flex items-center gap-2 font-heading">
              <AlertTriangle className="w-5 h-5 text-rose-500" /> Delete Payment
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-[#6C5B4C] dark:text-[#9A9EA4] font-medium">
              Are you sure you want to delete <span className="font-bold text-[#1A1D1A] dark:text-[#EBE8E3]">{paymentName}</span>? 
              This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setDeleteOpen(false)} variant="ghost" className="rounded-xl font-bold text-[#6C5B4C]">Cancel</Button>
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
        <DialogTrigger className="px-6 py-2.5 rounded-xl btn-tria-primary text-white font-bold text-sm shadow-md hover:-translate-y-0.5 active:scale-95 flex items-center gap-2 transition-all">
          <CheckCircle className="w-4 h-4 text-[#D4B48A]" /> Mark as Paid
        </DialogTrigger>
        <DialogContent className="sm:max-w-md bg-[#FDFBF7] dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/10 shadow-2xl p-6 rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-[#1A1D1A] dark:text-[#EBE8E3] flex items-center gap-2 font-heading">
              <CheckCircle className="w-5 h-5 text-[#213F33] dark:text-[#4E6C5F]" /> Mark as Paid
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-[#6C5B4C] dark:text-[#9A9EA4] font-medium">
              Are you sure you want to mark <span className="font-bold text-[#1A1D1A] dark:text-[#EBE8E3]">{paymentName}</span> as paid?
              This will update its status and record it in your history.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setPaidOpen(false)} variant="ghost" className="rounded-xl font-bold text-[#6C5B4C]">Cancel</Button>
            <Button 
              onClick={async () => {
                setLoading(true);
                await markUpcomingPaymentAsPaid(paymentId);
                setLoading(false);
                setPaidOpen(false);
              }} 
              disabled={loading} 
              className="rounded-xl font-bold btn-tria-primary text-white min-w-[100px]"
            >
              {loading ? <PremiumSpinner /> : "Yes, Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
