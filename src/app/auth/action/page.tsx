"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

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
        .catch((err) => {
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
        <div className="w-20 h-20 relative drop-shadow-xl animate-pulse">
          <Image src="/Logos/Light%20Logo.png" alt="OmniVault Logo" fill className="object-contain dark:hidden" priority />
          <Image src="/Logos/Dark%20Logo.png" alt="OmniVault Logo" fill className="object-contain hidden dark:block" priority />
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
        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-2">Password Updated</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Your password has been successfully reset. Redirecting to login...</p>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-sm flex flex-col items-center">
      <div className="w-16 h-16 relative drop-shadow-xl mb-8">
        <Image src="/Logos/Light%20Logo.png" alt="OmniVault Logo" fill className="object-contain dark:hidden" priority />
        <Image src="/Logos/Dark%20Logo.png" alt="OmniVault Logo" fill className="object-contain hidden dark:block" priority />
      </div>

      <div className="text-center w-full mb-8">
        <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-2 tracking-tight">Reset Password</h2>
        <p className="text-[13px] text-zinc-500 dark:text-zinc-400 font-medium px-4">
          Create a new password for <span className="text-emerald-600 dark:text-emerald-400 font-bold">{email}</span>
        </p>
      </div>

      <form onSubmit={handleResetPassword} className="w-full space-y-5">
        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest ml-1">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full h-12 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium tracking-widest"
            placeholder="••••••••"
          />
        </div>
        
        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest ml-1">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full h-12 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium tracking-widest"
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
          className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:hover:scale-100 mt-2"
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
    <div className="min-h-[100svh] w-full flex items-center justify-center p-4 relative overflow-hidden bg-zinc-50 dark:bg-[#09090b] transition-colors duration-500">
      {/* Ambient Glows */}
      <div className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 blur-[120px] pointer-events-none mix-blend-multiply dark:mix-blend-screen hidden sm:block transition-all duration-700" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[40vw] h-[40vw] rounded-full bg-orange-500/10 dark:bg-orange-500/10 blur-[140px] pointer-events-none mix-blend-multiply dark:mix-blend-screen hidden sm:block transition-all duration-700" />

      <div className="w-full max-w-md bg-white dark:bg-[#18181b] p-8 sm:p-12 rounded-[2.5rem] shadow-2xl shadow-zinc-200/50 dark:shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-zinc-100 dark:border-white/5 relative z-10 flex flex-col items-center">
        <Suspense fallback={
          <div className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        }>
          <AuthActionContent />
        </Suspense>
      </div>
    </div>
  );
}
