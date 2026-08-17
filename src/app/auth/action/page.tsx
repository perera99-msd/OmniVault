"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { TriaLogo } from "@/components/ui/TriaLogo";
import { LogoText } from "@/components/ui/LogoText";

function AuthActionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const mode = searchParams.get("mode");
  const oobCode = searchParams.get("oobCode");
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (mode === "resetPassword" && oobCode) {
      verifyPasswordResetCode(auth, oobCode)
        .then((email) => {
          setEmail(email);
          setVerifying(false);
        })
        .catch(() => {
          setError("Invalid or expired password reset link.");
          setVerifying(false);
        });
    } else {
      setError("Invalid request.");
      setVerifying(false);
    }
  }, [mode, oobCode]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      await confirmPasswordReset(auth, oobCode!, newPassword);
      setSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (err: any) {
      setError(err.message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="flex flex-col items-center gap-6 relative z-10">
        <div className="w-20 h-20 relative flex items-center justify-center animate-pulse">
          <TriaLogo size={64} />
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center text-center w-full max-w-sm"
      >
        <div className="w-16 h-16 bg-[#213F33]/10 dark:bg-[#385A4D]/20 rounded-full flex items-center justify-center mb-6 text-[#213F33] dark:text-[#4E6C5F]">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-[#1A1D1A] dark:text-[#EBE8E3] mb-2 font-heading">Password Updated</h2>
        <p className="text-sm text-[#6C5B4C] dark:text-[#9A9EA4] font-medium">Your vault password has been successfully reset. Redirecting to login...</p>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-sm flex flex-col items-center">
      <div className="flex items-center gap-3 mb-8">
        <TriaLogo size={36} />
        <LogoText className="text-2xl" />
      </div>

      <div className="text-center w-full mb-8">
        <h2 className="text-2xl font-black text-[#1A1D1A] dark:text-[#EBE8E3] mb-2 tracking-tight font-heading">Reset Password</h2>
        <p className="text-[13px] text-[#6C5B4C] dark:text-[#9A9EA4] font-medium px-4">
          Create a new password for <span className="text-[#987B5E] dark:text-[#D4B48A] font-bold">{email}</span>
        </p>
      </div>

      <form onSubmit={handleResetPassword} className="w-full space-y-5">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-[#6C5B4C] dark:text-[#9A9EA4] uppercase tracking-widest ml-1">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full h-12 bg-white dark:bg-[#202420] border border-[#E8E2D8] dark:border-white/10 text-[#1A1D1A] dark:text-[#EBE8E3] rounded-xl px-4 focus:outline-none focus:border-[#987B5E] transition-all font-medium tracking-widest"
            placeholder="••••••••"
          />
        </div>
        
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-[#6C5B4C] dark:text-[#9A9EA4] uppercase tracking-widest ml-1">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full h-12 bg-white dark:bg-[#202420] border border-[#E8E2D8] dark:border-white/10 text-[#1A1D1A] dark:text-[#EBE8E3] rounded-xl px-4 focus:outline-none focus:border-[#987B5E] transition-all font-medium tracking-widest"
            placeholder="••••••••"
          />
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <p className="text-xs font-bold text-rose-600 dark:text-rose-400 leading-tight">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="submit"
          disabled={loading || !!error.includes("Invalid")}
          className="w-full h-12 btn-tria-primary font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md disabled:opacity-50 mt-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Reset Password <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function AuthActionPage() {
  return (
    <div className="min-h-[100svh] w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#FDFBF7] dark:bg-[#121412] transition-colors duration-500">
      <div className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] rounded-full bg-[#987B5E]/10 dark:bg-[#987B5E]/5 blur-[140px] pointer-events-none hidden sm:block transition-all duration-700" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[40vw] h-[40vw] rounded-full bg-[#213F33]/10 dark:bg-[#385A4D]/10 blur-[150px] pointer-events-none hidden sm:block transition-all duration-700" />

      <div className="w-full max-w-md bg-[#FDFBF7] dark:bg-[#181B18] p-8 sm:p-12 rounded-[2.5rem] shadow-2xl border border-[#E8E2D8] dark:border-white/10 relative z-10 flex flex-col items-center">
        <Suspense fallback={
          <div className="w-10 h-10 border-2 border-[#987B5E]/30 border-t-[#987B5E] rounded-full animate-spin" />
        }>
          <AuthActionContent />
        </Suspense>
      </div>
    </div>
  );
}
