"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateCategory, deleteCategory } from "@/actions/finance";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PremiumSpinner } from "@/components/ui/PremiumSpinner";
import { Edit2, Trash2, AlertTriangle, PieChart } from "lucide-react";
import * as motion from "framer-motion/client";

const CATEGORY_ICONS = [
  "✨", "🍔", "🚗", "🛒", "🏠", "💡", "🏥", "🎓", "🎁", "🎮", "💼", "✈️", "📱", "🍽️", "⛽", "🐶", "👶", "🎬", "🔧", "💰", "💪", "🌍", "🎫", "👕"
];

export function CategoryManagement({ categories, currencySymbol }: { categories: any[], currencySymbol: string }) {
  const router = useRouter();
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
      router.refresh();
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
      router.refresh();
    } else {
      toast.error("Failed to delete category", { description: res.error });
    }
  };

  if (categories.length === 0) {
    return (
      <div className="text-center py-20 bg-white dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/10 rounded-[2.5rem] shadow-sm">
        <div className="w-20 h-20 bg-[#FAF8F3] dark:bg-[#202420] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner text-[#987B5E]">
          <PieChart className="w-10 h-10 opacity-70" />
        </div>
        <h3 className="text-xl font-black text-[#1A1D1A] dark:text-[#EBE8E3] mb-2 font-heading">No Categories Found</h3>
        <p className="text-[#6C5B4C] dark:text-[#9A9EA4] font-medium text-sm max-w-sm mx-auto">
          Start adding transactions and creating categories to see your insights here.
        </p>
      </div>
    );
  }

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
        className="group p-5 bg-white dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/10 rounded-[2rem] shadow-sm flex flex-col justify-between hover:shadow-md hover:border-[#987B5E]/30 transition-all"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-[#E8E2D8] dark:border-white/5 bg-[#FAF8F3] dark:bg-[#202420]">
              {cat.icon}
            </div>
            <div>
              <h4 className="font-bold text-[#1A1D1A] dark:text-[#EBE8E3] text-lg tracking-tight font-heading">{cat.name}</h4>
              <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${isIncome ? 'bg-[#213F33]/10 text-[#213F33] dark:text-[#4E6C5F]' : 'bg-[#987B5E]/10 text-[#7A6652] dark:text-[#D4B48A]'}`}>
                {cat.type}
              </span>
            </div>
          </div>
          
          {!cat._id.startsWith("uncategorized") && (
            <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              <Dialog open={editingId === cat._id} onOpenChange={(open) => {
                if (open) {
                  setEditingId(cat._id);
                  setEditName(cat.name);
                  setEditIcon(cat.icon || "✨");
                } else setEditingId(null);
              }}>
                <DialogTrigger className="p-2 text-[#6C5B4C] hover:text-[#987B5E] hover:bg-[#FAF8F3] dark:hover:bg-[#202420] rounded-xl transition-colors">
                  <Edit2 className="w-4 h-4" />
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-[#FDFBF7] dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/10 shadow-2xl p-6 rounded-[2rem]">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-black text-[#1A1D1A] dark:text-[#EBE8E3] flex items-center gap-2 font-heading">
                      <Edit2 className="w-5 h-5 text-[#987B5E]" /> Edit Category
                    </DialogTitle>
                  </DialogHeader>
                  <div className="py-4 space-y-6">
                    <div>
                      <label className="text-[10px] font-black text-[#6C5B4C] dark:text-[#9A9EA4] uppercase tracking-widest ml-1 mb-2 block">Choose Icon</label>
                      <div className="flex flex-wrap gap-2">
                        {CATEGORY_ICONS.map(icon => (
                          <button
                            key={icon}
                            onClick={() => setEditIcon(icon)}
                            className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${editIcon === icon ? 'bg-[#987B5E]/20 border-2 border-[#987B5E]' : 'bg-[#FAF8F3] dark:bg-[#202420] border border-[#E8E2D8] dark:border-white/5 hover:bg-[#EFE9E0] dark:hover:bg-[#272D27]'}`}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-[#6C5B4C] dark:text-[#9A9EA4] uppercase tracking-widest ml-1">Category Name</label>
                      <Input 
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-12 mt-1 rounded-xl bg-white dark:bg-[#202420] border-[#E8E2D8] dark:border-white/10 text-[#1A1D1A] dark:text-[#EBE8E3] px-4 font-bold focus-visible:ring-[#987B5E]/50 focus:border-[#987B5E]"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={() => setEditingId(null)} variant="ghost" className="rounded-xl font-bold text-[#6C5B4C]">Cancel</Button>
                    <Button onClick={handleEdit} disabled={loading} className="rounded-xl font-bold btn-tria-primary text-white min-w-[100px]">
                      {loading ? <PremiumSpinner /> : "Save Changes"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={deletingId === cat._id} onOpenChange={(open) => open ? setDeletingId(cat._id) : setDeletingId(null)}>
                <DialogTrigger className="p-2 text-[#6C5B4C] hover:text-red-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors">
                  <Trash2 className="w-4 h-4" />
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-[#FDFBF7] dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/10 shadow-2xl p-6 rounded-[2rem]">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-black text-[#1A1D1A] dark:text-[#EBE8E3] flex items-center gap-2 font-heading">
                      <AlertTriangle className="w-5 h-5 text-rose-500" /> Delete Category
                    </DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <p className="text-sm text-[#6C5B4C] dark:text-[#9A9EA4] font-medium">
                      Are you sure you want to delete <span className="font-bold text-[#1A1D1A] dark:text-[#EBE8E3]">{cat.name}</span>? 
                      Any transactions associated with this category will become "Uncategorized", but no financial data will be lost.
                    </p>
                  </div>
                  <DialogFooter>
                    <Button onClick={() => setDeletingId(null)} variant="ghost" className="rounded-xl font-bold text-[#6C5B4C]">Cancel</Button>
                    <Button onClick={handleDelete} disabled={loading} className="rounded-xl font-bold bg-rose-500 hover:bg-rose-600 text-white min-w-[100px]">
                      {loading ? <PremiumSpinner /> : "Yes, Delete"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <span className="text-xs font-medium text-[#6C5B4C] dark:text-[#9A9EA4] mb-0.5">{cat.count} Transactions</span>
          <p className={`text-2xl font-black tabular-nums tracking-tight font-heading ${isIncome ? 'text-[#213F33] dark:text-[#4E6C5F]' : 'text-[#1A1D1A] dark:text-[#EBE8E3]'}`}>
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
          <h4 className="text-xl font-black tracking-tight text-[#1A1D1A] dark:text-[#EBE8E3] flex items-center gap-2 font-heading">
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
          <h4 className="text-xl font-black tracking-tight text-[#1A1D1A] dark:text-[#EBE8E3] flex items-center gap-2 font-heading">
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
