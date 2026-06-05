"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { auth } from "@/lib/firebase/config";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import { Fingerprint, ArrowRight } from "lucide-react";

const googleProvider = new GoogleAuthProvider();

export function AuthOverlay({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    if (typeof window !== "undefined") {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true;
      setIsPWA(isStandalone);
    }

    return () => unsubscribe();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setAuthLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message.replace("Firebase: ", ""));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setAuthLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setError(err.message.replace("Firebase: ", ""));
    } finally {
      setAuthLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4], scale: [0.95, 1, 0.95] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 relative">
            <Image src="/Logos/Main%20Logo.png" alt="OmniVault Logo" fill className="object-contain" priority />
          </div>
          <div className="h-1 w-24 bg-[#d7ccc8] rounded-full overflow-hidden relative">
            <motion.div
              className="absolute left-0 top-0 bottom-0 bg-[#009900] rounded-full"
              animate={{ left: ["-100%", "100%"] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
              style={{ width: "50%" }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div 
        className="min-h-[100svh] w-full flex items-center justify-center p-0 sm:p-4 lg:p-6 relative overflow-hidden"
        style={{ 
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
          background: "linear-gradient(135deg, #f5f5f5 0%, #eef7ee 50%, #d7ccc8 100%)"
        }}
      >
        {/* Soft Ambient Background Highlights */}
        <div className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] rounded-full bg-[#ccffcc]/40 blur-[120px] pointer-events-none mix-blend-multiply hidden sm:block" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40vw] h-[40vw] rounded-full bg-[#66cc66]/10 blur-[140px] pointer-events-none mix-blend-multiply hidden sm:block" />

        {/* Master Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-[100svh] sm:h-auto sm:max-w-[1100px] sm:min-h-[600px] bg-[#ffffff] rounded-none sm:rounded-[2.5rem] p-0 sm:p-3 shadow-none sm:shadow-[0_40px_100px_rgba(0,51,0,0.08)] relative z-10 border-none sm:border border-[#ffffff] flex flex-col md:flex-row overflow-hidden sm:overflow-visible"
        >
          {/* LEFT SIDE PANEL */}
          <div className="flex w-full h-[180px] sm:h-[260px] md:h-auto md:w-[45%] lg:w-[45%] relative rounded-none sm:rounded-[1.5rem] md:rounded-[2rem] overflow-hidden group bg-[#003300] shrink-0">
            <img 
              src="/Backgrounds/Main%20Image.png" 
              alt="Wealth Management AI" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 z-0"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#003300]/95 via-[#003300]/40 to-transparent z-10" />

            {/* Inner Content overlaying the image (Hidden entirely on mobile for space) */}
            <div className="absolute inset-0 p-6 md:p-10 lg:p-12 flex-col justify-end md:justify-between z-20 hidden md:flex">
              <div className="hidden md:block w-10 h-10 relative bg-white/10 backdrop-blur-md rounded-xl p-2 border border-white/20">
                <Image src="/Logos/Main%20Logo.png" alt="Logo" fill className="object-contain p-1.5" />
              </div>
              <div className="mb-4 md:mb-0">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <p className="hidden md:block text-[#ccffcc] text-[10px] lg:text-xs font-bold tracking-[0.2em] uppercase mb-3 opacity-90">
                    Premium SaaS Platform
                  </p>
                  <h1 className="text-[#ffffff] text-4xl lg:text-5xl font-black tracking-tighter leading-[1.05] drop-shadow-xl">
                    Manage<br className="hidden md:block" /> your wealth.
                  </h1>
                  <p className="hidden md:block text-[#f5f5f5]/80 mt-4 max-w-sm text-xs lg:text-sm font-medium leading-relaxed">
                    Experience the next generation of asset tracking. Intelligent, secure, and beautifully designed for professionals.
                  </p>
                </motion.div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE PANEL: Form */}
          <div className="w-full md:w-[55%] lg:w-[55%] bg-[#ffffff] px-6 py-8 sm:px-10 sm:py-8 lg:px-16 lg:py-12 flex flex-col justify-start relative rounded-t-[2rem] sm:rounded-[1.5rem] md:rounded-[2rem] -mt-10 sm:-mt-8 md:mt-0 z-30 shadow-[0_-20px_40px_rgba(0,0,0,0.12)] md:shadow-none flex-1 overflow-y-auto sm:overflow-visible">
            
            {/* Top Bar: Clean Logo Only */}
            <div className="flex justify-center md:justify-start items-center mb-8 sm:mb-10 sm:absolute sm:top-8 sm:left-10">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 relative">
                  <Image src="/Logos/Main%20Logo.png" alt="OmniVault Logo" fill className="object-contain" />
                </div>
                <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-[#003300] to-[#009900] text-xl tracking-tight">
                  OmniVault
                </span>
              </div>
            </div>

            {/* Form Area */}
            <div className="w-full max-w-[360px] mx-auto md:mt-10 flex flex-col flex-1">
              <motion.div
                key={isLogin ? "login" : "register"}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="flex-1 flex flex-col"
              >
                <div className="mb-6 text-center md:text-left">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#003300] tracking-tight mb-2">
                    {isLogin ? "Welcome back" : "Create account"}
                  </h2>
                  <p className="text-[13px] sm:text-[14px] text-[#a1887f] font-medium">
                    {isLogin ? "Enter your credentials to access your vault." : "Start managing your wealth today."}
                  </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {!isLogin && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="space-y-1.5">
                          <label className="text-[12px] font-semibold text-[#8d6e63]">Full Name</label>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            required={!isLogin}
                            className="w-full h-[48px] bg-[#ffffff] border border-[#d7ccc8]/80 text-[#003300] placeholder:text-[#a1887f]/60 text-[14px] font-medium rounded-xl px-4 focus:outline-none focus:border-[#009900] focus:ring-1 focus:ring-[#009900] shadow-sm transition-all"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-1.5">
                    <label className="text-[12px] font-semibold text-[#8d6e63]">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="hello@omnivault.com"
                      required
                      className="w-full h-[48px] bg-[#ffffff] border border-[#d7ccc8]/80 text-[#003300] placeholder:text-[#a1887f]/60 text-[14px] font-medium rounded-xl px-4 focus:outline-none focus:border-[#009900] focus:ring-1 focus:ring-[#009900] shadow-sm transition-all"
                    />
                  </div>

                  <div className="space-y-1.5 relative">
                    <div className="flex justify-between items-center">
                      <label className="text-[12px] font-semibold text-[#8d6e63]">Password</label>
                      {isLogin && (
                        <a href="#" className="text-[12px] text-[#009900] font-semibold hover:text-[#006600] transition-colors">
                          Forgot password?
                        </a>
                      )}
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full h-[48px] bg-[#ffffff] border border-[#d7ccc8]/80 text-[#003300] placeholder:text-[#a1887f]/60 text-[14px] font-medium rounded-xl px-4 focus:outline-none focus:border-[#009900] focus:ring-1 focus:ring-[#009900] shadow-sm transition-all tracking-widest"
                    />
                  </div>

                  <AnimatePresence mode="popLayout">
                    {!isLogin && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="space-y-1.5">
                          <label className="text-[12px] font-semibold text-[#8d6e63]">Confirm Password</label>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            required={!isLogin}
                            className="w-full h-[48px] bg-[#ffffff] border border-[#d7ccc8]/80 text-[#003300] placeholder:text-[#a1887f]/60 text-[14px] font-medium rounded-xl px-4 focus:outline-none focus:border-[#009900] focus:ring-1 focus:ring-[#009900] shadow-sm transition-all tracking-widest"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Error Message */}
                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-xs text-[#ffffff] bg-[#8d6e63] border border-[#a1887f] rounded-xl px-3 py-2.5 font-medium text-center mt-2"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* Main Action Button */}
                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full h-[48px] bg-[#009900] hover:bg-[#006600] text-[#ffffff] font-semibold text-[14px] rounded-xl shadow-[0_4px_14px_rgba(0,153,0,0.25)] hover:shadow-[0_6px_20px_rgba(0,153,0,0.3)] hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 group"
                    >
                      {authLoading ? (
                        <span className="w-4 h-4 border-2 border-[#ffffff]/30 border-t-[#ffffff] rounded-full animate-spin" />
                      ) : (
                        <>
                          {isLogin ? "Sign In" : "Create Account"} 
                          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="flex items-center my-4">
                    <div className="flex-1 border-t border-[#d7ccc8]/40"></div>
                    <span className="px-4 text-[10px] font-bold tracking-widest uppercase text-[#a1887f]/80">OR</span>
                    <div className="flex-1 border-t border-[#d7ccc8]/40"></div>
                  </div>

                  {/* Google Sign In */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={authLoading}
                    className="w-full h-[48px] bg-[#ffffff] border border-[#d7ccc8]/80 hover:bg-[#f5f5f5] text-[#8d6e63] font-semibold text-[14px] rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-sm"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                  </button>

                  {/* PWA Biometric Only */}
                  {isPWA && isLogin && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="pt-1"
                    >
                      <button
                        type="button"
                        className="w-full h-[48px] bg-[#ffffff] border border-[#d7ccc8]/80 hover:bg-[#f5f5f5] text-[#009900] font-semibold text-[14px] rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group shadow-sm"
                      >
                        <Fingerprint className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                        Biometric Login
                      </button>
                    </motion.div>
                  )}
                </form>

                {/* Toggle Login/Register Link */}
                <div className="mt-8 text-center">
                  <p className="text-[13px] text-[#a1887f] font-medium">
                    {isLogin ? "New to OmniVault? " : "Already have an account? "}
                    <button 
                      onClick={() => { setIsLogin(!isLogin); setError(""); }}
                      className="text-[#009900] font-bold hover:text-[#006600] transition-colors hover:underline"
                    >
                      {isLogin ? "Create an account" : "Sign in"}
                    </button>
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Bottom Footer Links */}
            <div className="mt-auto pt-6 flex justify-center text-[11px] text-[#a1887f] font-medium">
              <div className="flex gap-5">
                <span>© {new Date().getFullYear()} OmniVault</span>
                <a href="#" className="hover:text-[#8d6e63] transition-colors">Contact</a>
                <a href="#" className="hover:text-[#8d6e63] transition-colors">Privacy</a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}