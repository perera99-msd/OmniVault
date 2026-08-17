"use client";

import { useState } from "react";
import { Landmark, CreditCard, Banknote, Settings2, Trash2, Cpu, Wifi, AlertTriangle } from "lucide-react";
import { updateWalletName, deleteWallet } from "@/actions/finance";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { CURRENCY_SYMBOLS } from "@/lib/utils/currency";
import { PremiumSpinner } from "@/components/ui/PremiumSpinner";
import { TriaLogo } from "@/components/ui/TriaLogo";

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

  // Tria Heritage Wealth Card Themes
  const typeStyles = {
    BANK: {
      bg: "bg-gradient-to-br from-[#213F33] via-[#1E352B] to-[#121E19]", // Heirloom Green & Jade
      text: "text-[#FDFBF7]",
      subtext: "text-[#D4B48A]",
      icon: <Landmark className="w-5 h-5 text-[#D4B48A] drop-shadow-md" />,
      border: "border border-[#987B5E]/30",
      shadow: "shadow-[0_12px_40px_-10px_rgba(33,63,51,0.5)]",
      chip: "text-[#D4B48A]"
    },
    CASH: {
      bg: "bg-gradient-to-br from-[#6C5B4C] via-[#56483C] to-[#2D241C]", // Walnut Leather & Aged Gold
      text: "text-[#FDFBF7]",
      subtext: "text-[#D4B48A]",
      icon: <Banknote className="w-5 h-5 text-[#D4B48A] drop-shadow-md" />,
      border: "border border-[#987B5E]/30",
      shadow: "shadow-[0_12px_40px_-10px_rgba(108,91,76,0.5)]",
      chip: "text-[#D4B48A]"
    },
    DIGITAL: {
      bg: "bg-gradient-to-br from-[#2C2F33] via-[#1C201C] to-[#121412]", // Night Sky & Steel Titanium
      text: "text-[#FDFBF7]",
      subtext: "text-[#9A9EA4]",
      icon: <CreditCard className="w-5 h-5 text-[#9A9EA4] drop-shadow-md" />,
      border: "border border-white/10",
      shadow: "shadow-[0_12px_40px_-10px_rgba(0,0,0,0.7)]",
      chip: "text-[#C4C7CC]"
    },
  };

  const normalizedType = (wallet.type || "BANK").toUpperCase();
  const style = typeStyles[normalizedType as keyof typeof typeStyles] || typeStyles.BANK;

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
    setIsEditing(false);
  };

  return (
    <>
      <motion.div 
        whileHover={{ scale: 1.02, rotateY: 2, rotateX: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={`relative w-full aspect-[1.6/1] min-h-[210px] rounded-[1.8rem] p-5 sm:p-6 flex flex-col justify-between overflow-hidden group cursor-pointer ${style.bg} ${style.border} ${style.shadow}`}
        style={{ transformPerspective: 1000 }}
      >
        {/* Soft Noise Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
        
        {/* Shimmer Effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/15 to-white/0 opacity-0 group-hover:opacity-100 -translate-x-[100%] group-hover:translate-x-[100%] transition-all duration-[1.5s] ease-in-out pointer-events-none" />

        {/* Card Header */}
        <div className="flex justify-between items-start relative z-10">
          <div className="flex flex-col gap-1.5">
            <span className={`text-[9px] font-black tracking-[0.25em] uppercase ${style.subtext}`}>
              {wallet.type} • TRIA VAULT
            </span>
            <div className="flex items-center gap-3 mt-0.5">
              {/* EMV Chip */}
              <div className={`w-8 h-6 rounded-md border border-current flex items-center justify-center opacity-90 shadow-inner ${style.chip}`}>
                <Cpu className="w-4 h-4 opacity-90" strokeWidth={1.5} />
              </div>
              {/* NFC Wave */}
              <Wifi className={`w-4 h-4 rotate-90 opacity-60 ${style.text}`} />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="opacity-80">
              <TriaLogo size={22} variant="dark" />
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
              className="p-2 rounded-full bg-black/20 hover:bg-white/20 backdrop-blur-md transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 translate-y-0 sm:translate-y-1 sm:group-hover:translate-y-0 border border-white/10"
              title="Wallet settings"
            >
              <Settings2 className={`w-3.5 h-3.5 ${style.text}`} />
            </button>
          </div>
        </div>

        {/* Card Balance (Middle) */}
        <div className="relative z-10 flex-1 flex flex-col justify-center mt-3 mb-1">
          <div className={`font-black tracking-tight flex items-baseline ${style.text} drop-shadow-md font-heading`}>
            <span className="text-[1.2rem] leading-none opacity-80 mr-1.5 font-sans">{symbol}</span>
            <span className="text-[2.4rem] leading-none">{whole}</span>
            <span className="text-lg opacity-80 font-sans">.{fraction}</span>
          </div>
        </div>

        {/* Card Footer */}
        <div className={`flex justify-between items-end relative z-10 ${style.text}`}>
          <div className="flex flex-col">
            <span className={`text-[8.5px] font-black tracking-[0.2em] uppercase ${style.subtext} mb-0.5`}>Account Name</span>
            <span className="text-[13.5px] font-bold tracking-wide drop-shadow-sm uppercase">{wallet.name}</span>
          </div>
          <div className="flex items-center gap-2 opacity-90 drop-shadow-sm">
            {style.icon}
          </div>
        </div>
      </motion.div>

      {/* Editing/Delete Modal */}
      <Dialog open={isEditing} onOpenChange={(open) => {
        setIsEditing(open);
        if (!open) setTimeout(() => setIsDeleting(false), 200);
      }}>
        <DialogContent className="sm:max-w-md bg-[#FDFBF7] dark:bg-[#181B18] border-[#E8E2D8] dark:border-white/10 rounded-[2rem] shadow-2xl p-6">
          {!isDeleting ? (
            <>
              <DialogHeader className="mb-4">
                <DialogTitle className="text-[#1A1D1A] dark:text-[#EBE8E3] font-black text-2xl tracking-tight font-heading">Edit Vault</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#6C5B4C] dark:text-[#9A9EA4]">Vault Name</label>
                  <input 
                    type="text" 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full h-14 bg-white dark:bg-[#202420] border border-[#E8E2D8] dark:border-white/10 rounded-xl px-4 text-[#1A1D1A] dark:text-[#EBE8E3] font-medium focus:outline-none focus:border-[#987B5E] transition-all"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setIsDeleting(true)}
                    className="w-14 h-14 flex items-center justify-center bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold rounded-xl border border-rose-200 dark:border-rose-500/20 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors shrink-0"
                    title="Delete Vault"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={handleUpdate}
                    disabled={isSubmitting || newName === wallet.name || newName.trim() === ""}
                    className="flex-1 h-14 btn-tria-primary rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center"
                  >
                    {isSubmitting ? <PremiumSpinner /> : "Save Changes"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <DialogHeader className="mb-2">
                <DialogTitle className="text-xl font-bold text-[#1A1D1A] dark:text-[#EBE8E3] flex items-center gap-2 font-heading">
                  <AlertTriangle className="w-5 h-5 text-rose-500" /> Delete Vault
                </DialogTitle>
              </DialogHeader>
              <div className="py-2">
                <p className="text-sm text-[#6C5B4C] dark:text-[#9A9EA4] font-medium">
                  Are you sure you want to delete <span className="font-bold text-[#1A1D1A] dark:text-[#EBE8E3]">{wallet.name}</span>? 
                  This action cannot be undone and will permanently remove all associated transactions.
                </p>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  onClick={() => setIsDeleting(false)}
                  disabled={isSubmitting}
                  className="px-4 h-12 bg-transparent text-[#6C5B4C] dark:text-[#9A9EA4] font-bold rounded-xl hover:text-[#1A1D1A] dark:hover:text-white transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="px-6 h-12 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-colors disabled:opacity-50 min-w-[100px] flex items-center justify-center shadow-md"
                >
                  {isSubmitting ? <PremiumSpinner /> : "Yes, Delete"}
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}