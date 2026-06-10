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
  DialogClose,
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
      <div className="hidden sm:flex items-center gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => setIsViewOpen(true)}
          className="p-2 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-zinc-500 hover:text-emerald-500 transition-colors"
          title="View Details"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button 
          onClick={() => setIsEditOpen(true)}
          className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-blue-500/10 text-zinc-500 hover:text-blue-500 transition-colors"
          title="Edit Transaction"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogTrigger className="p-2 rounded-full hover:bg-rose-50 dark:hover:bg-rose-500/10 text-zinc-500 hover:text-rose-500 transition-colors disabled:opacity-50" title="Delete Transaction">
            <Trash2 className="w-4 h-4" />
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-white dark:bg-[#121214] border-zinc-100 dark:border-zinc-800/60 shadow-2xl p-6 rounded-[2rem]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" /> Delete Transaction
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                Are you sure you want to delete this transaction? This will automatically reverse any wallet balance changes. This action cannot be undone.
              </p>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsDeleteOpen(false)} variant="ghost" className="rounded-xl font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white">Cancel</Button>
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
          <DialogTrigger className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
            <MoreHorizontal className="w-5 h-5" />
          </DialogTrigger>
          <DialogContent className="w-[90vw] sm:max-w-md bg-white dark:bg-[#121214] border-zinc-100 dark:border-zinc-800/60 shadow-2xl p-6 rounded-[2rem]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-white">Options</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-3 py-4">
               <Button variant="outline" className="h-14 rounded-xl font-bold text-emerald-500 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-500/20 dark:hover:bg-emerald-500/10" onClick={() => { setIsMobileMenuOpen(false); setIsViewOpen(true); }}>
                  <Eye className="w-5 h-5 mr-2" /> View Details
               </Button>
               <Button variant="outline" className="h-14 rounded-xl font-bold text-blue-500 border-blue-200 hover:bg-blue-50 dark:border-blue-500/20 dark:hover:bg-blue-500/10" onClick={() => { setIsMobileMenuOpen(false); setIsEditOpen(true); }}>
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
        <DialogContent className="sm:max-w-md bg-white dark:bg-[#121214] border-zinc-100 dark:border-zinc-800/60 shadow-2xl p-6 rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-emerald-500" /> Transaction Details
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-2">
            <div className="flex justify-between items-center bg-zinc-50 dark:bg-[#1a1a1c] p-4 rounded-xl">
              <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Amount</span>
              <span className={`text-lg font-bold ${transaction.type === 'EXPENSE' ? 'text-rose-500' : transaction.type === 'INCOME' ? 'text-emerald-500' : 'text-blue-500'}`}>
                {transaction.type === 'EXPENSE' ? '-' : transaction.type === 'INCOME' ? '+' : ''}
                Rs {transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-50 dark:bg-[#1a1a1c] p-4 rounded-xl flex flex-col gap-1">
                <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Date</span>
                <span className="text-zinc-900 dark:text-white font-medium text-sm">
                  {new Date(transaction.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <div className="bg-zinc-50 dark:bg-[#1a1a1c] p-4 rounded-xl flex flex-col gap-1">
                <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Type</span>
                <span className="text-zinc-900 dark:text-white font-medium text-sm capitalize">
                  {transaction.type.toLowerCase()}
                </span>
              </div>
            </div>

            <div className="bg-zinc-50 dark:bg-[#1a1a1c] p-4 rounded-xl flex flex-col gap-3">
              {transaction.type !== 'TRANSFER' && transaction.categoryId && (
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Category</span>
                  <span className="text-zinc-900 dark:text-white font-medium text-sm flex items-center gap-1.5">
                    {transaction.categoryId.icon} {transaction.categoryId.name}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Wallet</span>
                <span className="text-zinc-900 dark:text-white font-medium text-sm">
                  {transaction.sourceWalletId?.name || "Unknown"}
                </span>
              </div>
              {transaction.type === 'TRANSFER' && transaction.destinationWalletId && (
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">To Wallet</span>
                  <span className="text-zinc-900 dark:text-white font-medium text-sm">
                    {transaction.destinationWalletId.name}
                  </span>
                </div>
              )}
            </div>

            {transaction.description && (
              <div className="bg-zinc-50 dark:bg-[#1a1a1c] p-4 rounded-xl flex flex-col gap-2">
                <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Description</span>
                <span className="text-zinc-900 dark:text-white text-sm">
                  {transaction.description}
                </span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white dark:bg-[#121214] border-zinc-200 dark:border-white/5 rounded-[2rem] p-6 sm:p-10 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6">Edit Transaction</DialogTitle>
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
