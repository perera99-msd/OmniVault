"use client";

import { useState } from "react";
import { Edit2, Trash2 } from "lucide-react";
import { deleteTransaction } from "@/actions/finance";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EditTransactionForm } from "@/components/forms/EditTransactionForm";

interface TransactionRowActionsProps {
  transaction: any;
  wallets: any[];
  categories: any[];
}

export function TransactionRowActions({ transaction, wallets, categories }: TransactionRowActionsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (window.confirm("Are you sure you want to delete this transaction? This will reverse the wallet balances accordingly.")) {
      setIsDeleting(true);
      const res = await deleteTransaction(transaction._id);
      setIsDeleting(false);
      if (!res.success) {
        alert("Failed to delete transaction: " + res.error);
      }
    }
  }

  return (
    <>
      <div className="flex items-center gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => setIsEditOpen(true)}
          className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-500 transition-colors"
          title="Edit Transaction"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button 
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 transition-colors disabled:opacity-50"
          title="Delete Transaction"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white/90 dark:bg-[#0a0c0b]/90 backdrop-blur-3xl border-zinc-200 dark:border-white/5 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tighter text-center mb-6">Edit Transaction</DialogTitle>
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
