"use client";

import { useState } from "react";
import { Edit2, Trash2, AlertTriangle, MoreHorizontal, Eye } from "lucide-react";
import { deleteTransaction } from "@/actions/finance";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { EditTransactionForm } from "@/components/forms/EditTransactionForm";
import { Button } from "@/components/ui/button";
import { PremiumSpinner } from "@/components/ui/PremiumSpinner";

interface TransactionRowActionsProps {
  transaction: any;
  wallets: any[];
  categories: any[];
}

export function TransactionRowActions({ transaction, wallets, categories }: TransactionRowActionsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop View Actions */}
      <div className="hidden sm:flex items-center gap-1.5 ml-2 opacity-80 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => setIsViewOpen(true)}
          className="p-2 rounded-xl hover:bg-[#FAF8F3] dark:hover:bg-[#202420] text-[#6C5B4C] dark:text-[#9A9EA4] hover:text-[#987B5E] transition-colors"
          title="View Details"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button 
          onClick={() => setIsEditOpen(true)}
          className="p-2 rounded-xl hover:bg-[#FAF8F3] dark:hover:bg-[#202420] text-[#6C5B4C] dark:text-[#9A9EA4] hover:text-[#987B5E] transition-colors"
          title="Edit Transaction"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogTrigger className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 text-[#6C5B4C] dark:text-[#9A9EA4] hover:text-rose-500 transition-colors disabled:opacity-50" title="Delete Transaction">
            <Trash2 className="w-4 h-4" />
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-[#FDFBF7] dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/10 shadow-2xl p-6 rounded-[2rem]">
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-[#1A1D1A] dark:text-[#EBE8E3] flex items-center gap-2 font-heading">
                <AlertTriangle className="w-5 h-5 text-rose-500" /> Delete Transaction
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-[#6C5B4C] dark:text-[#9A9EA4] font-medium">
                Are you sure you want to delete this transaction? This will automatically reverse any vault balance changes.
              </p>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsDeleteOpen(false)} variant="ghost" className="rounded-xl font-bold text-[#6C5B4C]">Cancel</Button>
              <Button 
                onClick={async () => {
                  setIsDeleting(true);
                  const res = await deleteTransaction(transaction._id);
                  setIsDeleting(false);
                  setIsDeleteOpen(false);
                  if (!res.success) {
                    alert("Failed to delete transaction: " + res.error);
                  }
                }} 
                disabled={isDeleting} 
                className="rounded-xl font-bold bg-rose-500 hover:bg-rose-600 text-white min-w-[100px]"
              >
                {isDeleting ? <PremiumSpinner /> : "Yes, Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Mobile View Action */}
      <div className="flex sm:hidden items-center ml-2">
        <Dialog open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <DialogTrigger className="p-2 text-[#6C5B4C] dark:text-[#9A9EA4]">
            <MoreHorizontal className="w-5 h-5" />
          </DialogTrigger>
          <DialogContent className="w-[90vw] sm:max-w-md bg-[#FDFBF7] dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/10 shadow-2xl p-6 rounded-[2rem]">
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-[#1A1D1A] dark:text-[#EBE8E3] font-heading">Options</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-3 py-4">
               <Button variant="outline" className="h-14 rounded-xl font-bold text-[#213F33] dark:text-[#4E6C5F] border-[#E8E2D8] dark:border-white/10 hover:bg-[#FAF8F3] dark:hover:bg-[#202420]" onClick={() => { setIsMobileMenuOpen(false); setIsViewOpen(true); }}>
                  <Eye className="w-5 h-5 mr-2" /> View Details
               </Button>
               <Button variant="outline" className="h-14 rounded-xl font-bold text-[#987B5E] border-[#E8E2D8] dark:border-white/10 hover:bg-[#FAF8F3] dark:hover:bg-[#202420]" onClick={() => { setIsMobileMenuOpen(false); setIsEditOpen(true); }}>
                  <Edit2 className="w-5 h-5 mr-2" /> Edit Transaction
               </Button>
               <Button variant="outline" className="h-14 rounded-xl font-bold text-rose-500 border-rose-200 hover:bg-rose-50 dark:border-rose-500/20 dark:hover:bg-rose-500/10" onClick={() => { setIsMobileMenuOpen(false); setIsDeleteOpen(true); }}>
                  <Trash2 className="w-5 h-5 mr-2" /> Delete Transaction
               </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-md bg-[#FDFBF7] dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/10 shadow-2xl p-6 rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight text-[#1A1D1A] dark:text-[#EBE8E3] flex items-center gap-2 font-heading">
              <Eye className="w-5 h-5 text-[#987B5E]" /> Transaction Details
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-2">
            <div className="flex justify-between items-center bg-white dark:bg-[#202420] p-4 rounded-xl border border-[#E8E2D8] dark:border-white/5">
              <span className="text-[#6C5B4C] dark:text-[#9A9EA4] text-xs font-bold uppercase tracking-wider">Amount</span>
              <span className={`text-lg font-black font-heading ${transaction.type === 'EXPENSE' ? 'text-[#7A6652] dark:text-[#D4B48A]' : transaction.type === 'INCOME' ? 'text-[#213F33] dark:text-[#4E6C5F]' : 'text-[#987B5E]'}`}>
                {transaction.type === 'EXPENSE' ? '-' : transaction.type === 'INCOME' ? '+' : ''}
                Rs {transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-[#202420] p-4 rounded-xl flex flex-col gap-1 border border-[#E8E2D8] dark:border-white/5">
                <span className="text-[#6C5B4C] dark:text-[#9A9EA4] text-[10px] font-black uppercase tracking-wider">Date</span>
                <span className="text-[#1A1D1A] dark:text-[#EBE8E3] font-bold text-sm">
                  {new Date(transaction.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <div className="bg-white dark:bg-[#202420] p-4 rounded-xl flex flex-col gap-1 border border-[#E8E2D8] dark:border-white/5">
                <span className="text-[#6C5B4C] dark:text-[#9A9EA4] text-[10px] font-black uppercase tracking-wider">Type</span>
                <span className="text-[#1A1D1A] dark:text-[#EBE8E3] font-bold text-sm capitalize">
                  {transaction.type.toLowerCase()}
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#202420] p-4 rounded-xl flex flex-col gap-3 border border-[#E8E2D8] dark:border-white/5">
              {transaction.type !== 'TRANSFER' && transaction.categoryId && (
                <div className="flex justify-between items-center">
                  <span className="text-[#6C5B4C] dark:text-[#9A9EA4] text-[10px] font-black uppercase tracking-wider">Category</span>
                  <span className="text-[#1A1D1A] dark:text-[#EBE8E3] font-bold text-sm flex items-center gap-1.5">
                    {transaction.categoryId.icon} {transaction.categoryId.name}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-[#6C5B4C] dark:text-[#9A9EA4] text-[10px] font-black uppercase tracking-wider">Vault</span>
                <span className="text-[#1A1D1A] dark:text-[#EBE8E3] font-bold text-sm">
                  {transaction.sourceWalletId?.name || "Unknown"}
                </span>
              </div>
              {transaction.type === 'TRANSFER' && transaction.destinationWalletId && (
                <div className="flex justify-between items-center">
                  <span className="text-[#6C5B4C] dark:text-[#9A9EA4] text-[10px] font-black uppercase tracking-wider">To Vault</span>
                  <span className="text-[#1A1D1A] dark:text-[#EBE8E3] font-bold text-sm">
                    {transaction.destinationWalletId.name}
                  </span>
                </div>
              )}
            </div>

            {transaction.description && (
              <div className="bg-white dark:bg-[#202420] p-4 rounded-xl flex flex-col gap-2 border border-[#E8E2D8] dark:border-white/5">
                <span className="text-[#6C5B4C] dark:text-[#9A9EA4] text-[10px] font-black uppercase tracking-wider">Description</span>
                <span className="text-[#1A1D1A] dark:text-[#EBE8E3] text-sm">
                  {transaction.description}
                </span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px] bg-[#FDFBF7] dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/10 rounded-[2rem] p-6 sm:p-10 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight text-[#1A1D1A] dark:text-[#EBE8E3] mb-6 font-heading">Edit Transaction</DialogTitle>
          </DialogHeader>
          <EditTransactionForm 
            transaction={transaction}
            wallets={wallets}
            categories={categories}
            onSuccess={() => setIsEditOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
