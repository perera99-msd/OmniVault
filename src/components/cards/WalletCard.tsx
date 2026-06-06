"use client";

import { useState } from "react";
import { Wallet as WalletIcon, Landmark, CreditCard, Wifi, Settings2, Trash2 } from "lucide-react";
import { updateWalletName, deleteWallet } from "@/actions/finance";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { formatCurrency, CURRENCY_SYMBOLS } from "@/lib/utils/currency";

type Wallet = {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency?: string;
};

export function WalletCard({ wallet }: { wallet: Wallet }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(wallet.name);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Deep Premium SaaS Card Themes
  const typeStyles = {
    BANK: {
      bg: "bg-gradient-to-br from-[#1c1c1e] to-[#09090b] dark:from-[#18181b] dark:to-[#000000]",
      text: "text-white",
      subtext: "text-zinc-400",
      icon: <Landmark className="w-5 h-5 text-white" />,
      border: "border border-white/5",
      shadow: "shadow-2xl shadow-black/50",
      accent: "bg-white/10"
    },
    CASH: {
      bg: "bg-gradient-to-br from-[#1f2937] to-[#111827]",
      text: "text-white",
      subtext: "text-zinc-400",
      icon: <WalletIcon className="w-5 h-5 text-white" />,
      border: "border border-white/5",
      shadow: "shadow-2xl shadow-black/40",
      accent: "bg-white/10"
    },
    DIGITAL: {
      bg: "bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#022c22]", // Rich Emerald
      text: "text-white",
      subtext: "text-emerald-200/70",
      icon: <CreditCard className="w-5 h-5 text-white" />,
      border: "border border-emerald-500/20",
      shadow: "shadow-2xl shadow-emerald-900/40",
      accent: "bg-white/20"
    },
  };

  const style = typeStyles[wallet.type as keyof typeof typeStyles] || typeStyles.BANK;

  // Format balance nicely
  const nativeCurrency = wallet.currency || "LKR";
  const symbol = CURRENCY_SYMBOLS[nativeCurrency] || "Rs ";
  
  const formattedBalance = wallet.balance.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const [whole, fraction] = formattedBalance.split(".");

  const handleUpdate = async () => {
    if (newName.trim() === "" || newName === wallet.name) {
      setIsEditing(false);
      return;
    }
    setIsSubmitting(true);
    await updateWalletName(wallet.id, newName);
    setIsSubmitting(false);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    await deleteWallet(wallet.id);
    setIsSubmitting(false);
    setIsDeleting(false);
  };

  return (
    <>
      <motion.div 
        whileHover={{ scale: 1.02, rotateY: 2, rotateX: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={`relative w-full aspect-[1.6/1] rounded-[1.5rem] p-6 flex flex-col justify-between overflow-hidden group cursor-pointer ${style.bg} ${style.border} ${style.shadow}`}
        style={{ transformPerspective: 1000 }}
      >
        {/* Soft Noise Texture Overlay for physical card feel */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
        
        {/* Holographic Shimmer Effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 -translate-x-[100%] group-hover:translate-x-[100%] transition-all duration-[1.5s] ease-in-out pointer-events-none" />

        {/* Card Header */}
        <div className="flex justify-between items-start relative z-10">
          <div className="flex flex-col gap-1.5">
            <span className={`text-[11px] font-black tracking-[0.2em] uppercase ${style.subtext}`}>
              {wallet.type}
            </span>
            <div className="flex items-center gap-2">
              <Wifi className={`w-5 h-5 rotate-90 ${style.text} opacity-70`} />
              <div className={`w-8 h-5 rounded-md backdrop-blur-md border border-white/20 ${style.accent}`} />
            </div>
          </div>
          
          <button 
            onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
            className={`p-2.5 rounded-full bg-white/5 hover:bg-white/20 backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0`}
          >
            <Settings2 className={`w-4 h-4 ${style.text}`} />
          </button>
        </div>

        {/* Card Balance (Middle) */}
        <div className="relative z-10 mt-auto mb-4">
          <h3 className={`text-xs font-bold uppercase tracking-wider ${style.subtext} mb-1`}>Balance</h3>
          <div className={`font-black tracking-tighter flex items-baseline ${style.text}`}>
            <span className="text-[1.5rem] leading-none opacity-80 mr-1">{symbol}</span>
            <span className="text-[2.5rem] leading-none">{whole}</span>
            <span className="text-xl opacity-80">.{fraction}</span>
          </div>
        </div>

        {/* Card Footer (Name & Brand) */}
        <div className={`flex justify-between items-end relative z-10 ${style.text}`}>
          <div className="flex flex-col">
            <span className={`text-[10px] font-bold tracking-widest uppercase ${style.subtext} mb-0.5`}>Card Holder</span>
            <span className="text-[13px] font-bold tracking-wide">{wallet.name}</span>
          </div>
          <div className="flex items-center gap-1.5 opacity-90">
            {style.icon}
            <span className="font-black tracking-tighter text-sm">Vault</span>
          </div>
        </div>
      </motion.div>

      {/* Editing/Delete Modal */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-[#121214] border-zinc-200 dark:border-zinc-800 rounded-[2rem] shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-zinc-900 dark:text-white font-black text-2xl tracking-tight">Edit Wallet</DialogTitle>
          </DialogHeader>
          
          {!isDeleting ? (
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Wallet Name</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full h-12 bg-zinc-50 dark:bg-[#1a1a1c] border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 text-zinc-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setIsDeleting(true)}
                  className="flex-1 h-12 flex items-center justify-center gap-2 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold rounded-xl border border-rose-200 dark:border-rose-500/20 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
                <button 
                  onClick={handleUpdate}
                  disabled={isSubmitting || newName === wallet.name || newName.trim() === ""}
                  className="flex-1 h-12 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 py-4">
              <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl">
                <p className="text-rose-600 dark:text-rose-400 font-bold text-sm text-center">
                  Are you absolutely sure you want to delete this wallet? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsDeleting(false)}
                  disabled={isSubmitting}
                  className="flex-1 h-12 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="flex-1 h-12 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-colors disabled:opacity-50 shadow-[0_4px_15px_rgba(225,29,72,0.3)]"
                >
                  {isSubmitting ? "Deleting..." : "Yes, Delete"}
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}