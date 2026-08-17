"use client";

import { useState } from "react";
import { LogOut, AlertTriangle, ShieldCheck } from "lucide-react";
import { auth } from "@/lib/firebase/config";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { PremiumSpinner } from "@/components/ui/PremiumSpinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface LogoutConfirmDialogProps {
  trigger?: React.ReactNode;
  variant?: "button" | "sidebar";
}

export function LogoutConfirmDialog({ trigger, variant = "button" }: LogoutConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      await fetch("/api/auth/session", { method: "DELETE" });
      setOpen(false);
      window.location.href = "/";
    } catch (err) {
      console.error("Logout error:", err);
      setLoading(false);
    }
  };

  const defaultTrigger = variant === "sidebar" ? (
    <button 
      type="button"
      className="flex items-center gap-3.5 px-4 py-3 w-full rounded-2xl font-bold text-[13px] transition-all duration-300 text-[#53585F] dark:text-[#9A9EA4] hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 border border-transparent group"
    >
      <LogOut className="w-[18px] h-[18px] opacity-70 group-hover:translate-x-0.5 transition-transform" />
      <span className="tracking-wide">Log Out</span>
    </button>
  ) : (
    <button 
      type="button"
      className="w-full flex items-center justify-center gap-2 p-5 rounded-2xl border-2 border-dashed border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 font-bold hover:bg-rose-100 dark:hover:bg-rose-900/20 hover:border-rose-300 dark:hover:border-rose-500/50 transition-all mb-4"
    >
      <LogOut className="w-5 h-5" /> Log Out
    </button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        trigger ? (trigger as any) : defaultTrigger
      } />

      <DialogContent className="sm:max-w-md bg-[#FDFBF7] dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/10 shadow-2xl p-6 sm:p-8 rounded-[2rem]">
        <DialogHeader className="mb-2">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3 shadow-inner border border-rose-200/50 dark:border-rose-500/20">
            <LogOut className="w-6 h-6" />
          </div>
          <DialogTitle className="text-2xl font-black text-[#1A1D1A] dark:text-[#EBE8E3] tracking-tight font-heading">
            Sign Out of Tria?
          </DialogTitle>
        </DialogHeader>

        <div className="py-2 space-y-3">
          <p className="text-sm text-[#6C5B4C] dark:text-[#9A9EA4] font-medium leading-relaxed">
            Are you sure you want to end your active session? You will need your master password or biometric passkey to unlock your vault next time.
          </p>
          <div className="flex items-center gap-2 text-xs font-bold text-[#213F33] dark:text-[#4E6C5F] bg-[#FAF8F3] dark:bg-[#202420] p-3 rounded-xl border border-[#E8E2D8] dark:border-white/5">
            <ShieldCheck className="w-4 h-4 text-[#987B5E]" />
            Your financial data is encrypted and saved securely.
          </div>
        </div>

        <DialogFooter className="mt-4 flex flex-row items-center justify-end gap-3">
          <Button 
            type="button"
            onClick={() => setOpen(false)} 
            variant="ghost" 
            className="rounded-xl font-bold text-[#6C5B4C] hover:bg-[#FAF8F3] dark:hover:bg-[#202420]"
          >
            Cancel
          </Button>
          <Button 
            type="button"
            onClick={handleSignOut} 
            disabled={loading} 
            className="rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white min-w-[120px] shadow-md shadow-rose-600/20"
          >
            {loading ? <PremiumSpinner size="sm" color="white" /> : "Yes, Sign Out"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
