"use client";

import { useState } from "react";
import { updateCategory, deleteCategory } from "@/actions/finance";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PremiumSpinner } from "@/components/ui/PremiumSpinner";
import { Edit2, Trash2, AlertTriangle, PieChart } from "lucide-react";
import * as motion from "framer-motion/client";

const CATEGORY_ICONS = [
  "✨", "🍔", "🚗", "🛒", "🏠", "💡", "🏥", "🎓", "🎁", "🎮", "💼", "✈️", "📱", "🍽️", "⛽", "🏥", "🐶", "👶", "🎬", "🔧", "💰", "💪", "🌍", "🎫", "👕"
];

export function CategoryManagement({ categories, currencySymbol }: { categories: any[], currencySymbol: string }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("✨");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEdit = async () => {
    if (!editingId || !editName.trim()) return;
    setLoading(true);
    const res = await updateCategory(editingId, editName.trim(), editIcon);
    setLoading(false);
    
    if (res.success) {
      toast.success("Category updated successfully");
      setEditingId(null);
    } else {
      toast.error("Failed to update category", { description: res.error });
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setLoading(true);
    const res = await deleteCategory(deletingId);
    setLoading(false);

    if (res.success) {
      toast.success("Category deleted", { description: "Transactions moved to Uncategorized." });
      setDeletingId(null);
    } else {
      toast.error("Failed to delete category", { description: res.error });
    }
  };

  if (categories.length === 0) {
    return (
      <div className="text-center py-20 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/5 rounded-[2rem] shadow-sm">
        <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <PieChart className="w-10 h-10 text-zinc-300 dark:text-zinc-600" />
        </div>
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">No Categories Found</h3>
        <p className="text-zinc-500 font-medium text-sm max-w-sm mx-auto">
          Start adding transactions and creating categories to see your insights here.
        </p>
      </div>
    );
  }

  // Split into expenses and incomes, sort by totalAmount
  const expenseCategories = categories.filter(c => c.type === "EXPENSE").sort((a, b) => b.totalAmount - a.totalAmount);
  const incomeCategories = categories.filter(c => c.type === "INCOME").sort((a, b) => b.totalAmount - a.totalAmount);

  const renderCategoryCard = (cat: any, i: number) => {
    const isIncome = cat.type === "INCOME";
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.05 }}
        key={cat._id}
        className="group p-5 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/5 rounded-[2rem] shadow-sm flex flex-col justify-between hover:shadow-lg hover:border-zinc-300 dark:hover:border-white/10 transition-all"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-zinc-100 dark:border-white/5" style={{ backgroundColor: `${cat.color}20` }}>
              {cat.icon}
            </div>
            <div>
              <h4 className="font-bold text-zinc-900 dark:text-white text-lg tracking-tight">{cat.name}</h4>
              <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${isIncome ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'}`}>
                {cat.type}
              </span>
            </div>
          </div>
          
          {/* Actions - always visible on mobile, visible on hover on desktop */}
          {!cat._id.startsWith("uncategorized") && (
            <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              <Dialog open={editingId === cat._id} onOpenChange={(open) => {
                if (open) {
                  setEditingId(cat._id);
                  setEditName(cat.name);
                  setEditIcon(cat.icon || "✨");
                } else setEditingId(null);
              }}>
                <DialogTrigger className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-colors">
                  <Edit2 className="w-4 h-4" />
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-white dark:bg-[#121214] border-zinc-100 dark:border-zinc-800/60 shadow-2xl p-6 rounded-[2rem]">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                      <Edit2 className="w-5 h-5 text-blue-500" /> Edit Category
                    </DialogTitle>
                  </DialogHeader>
                  <div className="py-4 space-y-6">
                    <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1 mb-2 block">Choose Icon</label>
                      <div className="flex flex-wrap gap-2">
                        {CATEGORY_ICONS.map(icon => (
                          <button
                            key={icon}
                            onClick={() => setEditIcon(icon)}
                            className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${editIcon === icon ? 'bg-blue-100 dark:bg-blue-500/20 border-2 border-blue-500' : 'bg-zinc-50 dark:bg-white/5 border border-transparent hover:bg-zinc-100 dark:hover:bg-white/10'}`}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Category Name</label>
                      <Input 
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-12 mt-1 rounded-xl bg-zinc-50 dark:bg-white/5 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white px-4 font-bold"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={() => setEditingId(null)} variant="ghost" className="rounded-xl font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white">Cancel</Button>
                    <Button onClick={handleEdit} disabled={loading} className="rounded-xl font-bold bg-blue-500 hover:bg-blue-600 text-white min-w-[100px]">
                      {loading ? <PremiumSpinner /> : "Save Changes"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={deletingId === cat._id} onOpenChange={(open) => open ? setDeletingId(cat._id) : setDeletingId(null)}>
                <DialogTrigger className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors">
                  <Trash2 className="w-4 h-4" />
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-white dark:bg-[#121214] border-zinc-100 dark:border-zinc-800/60 shadow-2xl p-6 rounded-[2rem]">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" /> Delete Category
                    </DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                      Are you sure you want to delete <span className="font-bold text-zinc-900 dark:text-white">{cat.name}</span>? 
                      Any transactions associated with this category will become "Uncategorized", but no financial data will be lost.
                    </p>
                  </div>
                  <DialogFooter>
                    <Button onClick={() => setDeletingId(null)} variant="ghost" className="rounded-xl font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white">Cancel</Button>
                    <Button onClick={handleDelete} disabled={loading} className="rounded-xl font-bold bg-red-500 hover:bg-red-600 text-white min-w-[100px]">
                      {loading ? <PremiumSpinner /> : "Yes, Delete"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 mb-0.5">{cat.count} Transactions</span>
          <p className={`text-2xl font-black tabular-nums tracking-tight ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-900 dark:text-white'}`}>
            {currencySymbol}{cat.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      {/* Expenses */}
      {expenseCategories.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            Expenses
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
            {expenseCategories.map((cat, i) => renderCategoryCard(cat, i))}
          </div>
        </div>
      )}

      {/* Incomes */}
      {incomeCategories.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            Incomes
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
            {incomeCategories.map((cat, i) => renderCategoryCard(cat, i))}
          </div>
        </div>
      )}
    </div>
  );
}
