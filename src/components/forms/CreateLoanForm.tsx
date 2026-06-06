"use client";

import { useState } from "react";
import { createLoan } from "@/actions/loans";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function CreateLoanForm({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("GIVEN");
  const [hasDeadline, setHasDeadline] = useState(true);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    const result = await createLoan({
      userId,
      personName: formData.get("personName"),
      type,
      amount: Number(formData.get("amount")),
      hasDeadline,
      dueDate: formData.get("dueDate"),
      description: formData.get("description"),
    });

    setLoading(false);
    if (result?.success) {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    } else {
      alert("Failed to create loan: " + result?.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Type Toggle */}
      <div className="flex bg-[#f5f5f5] dark:bg-[#212121] p-1.5 rounded-[1.25rem] border border-[#d7ccc8] dark:border-[#616161]">
        <button
          type="button"
          onClick={() => setType("GIVEN")}
          className={`flex-1 py-3 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${type === "GIVEN"
              ? "bg-[#ffffff] dark:bg-[#424242] text-[#009900] dark:text-[#66cc66] shadow-sm border border-[#d7ccc8]/50 dark:border-[#616161]/50"
              : "text-[#a1887f] dark:text-[#9e9e9e] hover:text-[#8d6e63] dark:hover:text-[#ffffff]"
            }`}
        >
          <ArrowUpRight className="w-4 h-4" /> I Lent Money
        </button>
        <button
          type="button"
          onClick={() => setType("RECEIVED")}
          className={`flex-1 py-3 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${type === "RECEIVED"
              ? "bg-[#ffffff] dark:bg-[#424242] text-[#8d6e63] dark:text-[#d7ccc8] shadow-sm border border-[#d7ccc8]/50 dark:border-[#616161]/50"
              : "text-[#a1887f] dark:text-[#9e9e9e] hover:text-[#8d6e63] dark:hover:text-[#ffffff]"
            }`}
        >
          <ArrowDownRight className="w-4 h-4" /> I Borrowed
        </button>
      </div>

      <div className="space-y-5">
        <div>
          <label className="text-[10px] font-black text-[#a1887f] dark:text-[#9e9e9e] uppercase tracking-widest ml-1 mb-1.5 block">Person / Entity Name</label>
          <input name="personName" required placeholder="e.g. John Doe" className="w-full h-14 bg-[#f5f5f5] dark:bg-[#212121] border border-[#d7ccc8] dark:border-[#616161] text-[#8d6e63] dark:text-[#ffffff] placeholder-[#d7ccc8] dark:placeholder-[#616161] text-sm rounded-2xl px-5 focus:outline-none focus:border-[#009900] dark:focus:border-[#66cc66] transition-colors" />
        </div>

        <div>
          <label className="text-[10px] font-black text-[#a1887f] dark:text-[#9e9e9e] uppercase tracking-widest ml-1 mb-1.5 block">Amount</label>
          <input name="amount" type="number" step="0.01" required placeholder="0.00" className="w-full h-14 bg-[#f5f5f5] dark:bg-[#212121] border border-[#d7ccc8] dark:border-[#616161] text-[#8d6e63] dark:text-[#ffffff] placeholder-[#d7ccc8] dark:placeholder-[#616161] rounded-2xl px-5 focus:outline-none focus:border-[#009900] dark:focus:border-[#66cc66] transition-colors font-black text-xl" />
        </div>

        <div className="flex items-center gap-3 ml-2 bg-[#f5f5f5] dark:bg-[#212121] p-4 rounded-2xl border border-[#d7ccc8] dark:border-[#616161]">
          <input type="checkbox" id="deadlineToggle" checked={hasDeadline} onChange={(e) => setHasDeadline(e.target.checked)} className="accent-[#009900] dark:accent-[#66cc66] w-5 h-5" />
          <label htmlFor="deadlineToggle" className="text-sm font-bold text-[#8d6e63] dark:text-[#ffffff] cursor-pointer">Enforce a repayment deadline</label>
        </div>

        <AnimatePresence>
          {hasDeadline && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              <label className="text-[10px] font-black text-[#a1887f] dark:text-[#9e9e9e] uppercase tracking-widest ml-1 mb-1.5 block mt-1">Deadline Date</label>
              <input name="dueDate" type="date" required className="w-full h-14 bg-[#f5f5f5] dark:bg-[#212121] border border-[#d7ccc8] dark:border-[#616161] text-[#8d6e63] dark:text-[#ffffff] rounded-2xl px-5 focus:outline-none focus:border-[#009900] dark:focus:border-[#66cc66] transition-colors font-medium" />
            </motion.div>
          )}
        </AnimatePresence>

        <div>
          <label className="text-[10px] font-black text-[#a1887f] dark:text-[#9e9e9e] uppercase tracking-widest ml-1 mb-1.5 block">Description (Optional)</label>
          <textarea name="description" placeholder="Notes about this loan..." rows={3} className="w-full bg-[#f5f5f5] dark:bg-[#212121] border border-[#d7ccc8] dark:border-[#616161] text-[#8d6e63] dark:text-[#ffffff] placeholder-[#d7ccc8] dark:placeholder-[#616161] text-sm rounded-2xl p-5 focus:outline-none focus:border-[#009900] dark:focus:border-[#66cc66] transition-colors resize-none" />
        </div>
      </div>

      <button type="submit" disabled={loading} className="w-full h-14 bg-gradient-to-r from-[#009900] to-[#006600] text-[#ffffff] font-bold rounded-2xl shadow-[0_10px_25px_rgba(0,153,0,0.3)] hover:shadow-[0_10px_35px_rgba(0,153,0,0.4)] hover:-translate-y-0.5 transition-all active:scale-[0.98] flex justify-center items-center">
        {loading ? <span className="w-5 h-5 border-2 border-[#ffffff]/30 border-t-[#ffffff] rounded-full animate-spin" /> : "Save Contract"}
      </button>
    </form>
  );
}