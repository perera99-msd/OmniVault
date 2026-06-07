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
import { createUser } from "@/actions/finance";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Header } from "@/components/layout/Header";

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
      if (currentUser) {
        document.cookie = `firebaseUid=${currentUser.uid}; path=/; max-age=31536000; SameSite=Lax`;
      } else {
        document.cookie = `firebaseUid=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      }
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
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        await createUser({
          firebaseUid: userCredential.user.uid,
          email: userCredential.user.email || email,
          name: userCredential.user.displayName || "User"
        });
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await createUser({
          firebaseUid: userCredential.user.uid,
          email: userCredential.user.email || email,
          name: name
        });
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
      const userCredential = await signInWithPopup(auth, googleProvider);
      await createUser({
        firebaseUid: userCredential.user.uid,
        email: userCredential.user.email || "",
        name: userCredential.user.displayName || "Google User"
      });
    } catch (err: any) {
      setError(err.message.replace("Firebase: ", ""));
    } finally {
      setAuthLoading(false);
    }
  };

  if (loading) {
    return (
      <div suppressHydrationWarning className="min-h-[100svh] flex flex-col items-center justify-center bg-zinc-50 dark:bg-[#09090b] transition-colors duration-500 relative overflow-hidden">
        {/* Ambient Blur */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30vw] h-[30vw] rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />
        
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="flex flex-col items-center gap-6 relative z-10"
        >
          {/* Dual Logo for Dark/Light */}
          <div className="w-20 h-20 relative drop-shadow-xl">
            <Image src="/Logos/Light%20Logo.png" alt="OmniVault Logo" fill className="object-contain dark:hidden" priority />
            <Image src="/Logos/Dark%20Logo.png" alt="OmniVault Logo" fill className="object-contain hidden dark:block" priority />
          </div>
          
          {/* Custom Premium SaaS Spinner */}
          <div className="relative w-12 h-12 flex items-center justify-center">
            <div className="absolute inset-0 border-2 border-zinc-200 dark:border-zinc-800 rounded-full" />
            <div className="absolute inset-0 border-2 border-transparent border-t-emerald-500 rounded-full animate-spin" style={{ animationDuration: "0.8s" }} />
            <div className="absolute inset-2 border-2 border-transparent border-b-emerald-400 rounded-full animate-spin" style={{ animationDuration: "1.2s", animationDirection: "reverse" }} />
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          </div>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div 
        suppressHydrationWarning
        className="min-h-[100svh] w-full flex items-center justify-center p-0 sm:p-4 lg:p-6 relative overflow-hidden bg-[#f5f5f5] dark:bg-[#212121] transition-colors duration-500"
      >
        {/* Ambient Glows */}
        <div className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] rounded-full bg-[#ccffcc]/30 dark:bg-[#003300]/40 blur-[120px] pointer-events-none mix-blend-multiply dark:mix-blend-screen hidden sm:block transition-all duration-700" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40vw] h-[40vw] rounded-full bg-[#d7ccc8]/40 dark:bg-[#424242]/30 blur-[140px] pointer-events-none mix-blend-multiply dark:mix-blend-screen hidden sm:block transition-all duration-700" />

        {/* Master Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-[100svh] sm:h-auto sm:max-w-[1100px] sm:min-h-[600px] bg-[#ffffff] dark:bg-[#424242] rounded-none sm:rounded-[2.5rem] p-0 sm:p-3 shadow-none sm:shadow-[0_40px_100px_rgba(0,51,0,0.08)] dark:sm:shadow-[0_40px_100px_rgba(0,0,0,0.5)] relative z-10 border-none sm:border border-[#ffffff] dark:border-[#616161] flex flex-col md:flex-row overflow-hidden transition-colors duration-500"
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
              <div className="hidden md:flex items-center justify-center w-12 h-12 relative bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/20 shadow-lg">
                <Image src="/Logos/Light%20Logo.png" alt="Logo" fill className="object-contain p-1.5" />
              </div>
              <div className="mb-4 md:mb-0">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <p className="hidden md:block text-[#ccffcc] text-[10px] lg:text-xs font-black tracking-[0.2em] uppercase mb-3 opacity-90 drop-shadow-md">
                    Premium SaaS Platform
                  </p>
                  <h1 className="text-[#ffffff] text-4xl lg:text-5xl font-black tracking-tighter leading-[1.05] drop-shadow-xl">
                    Manage<br className="hidden md:block" /> your wealth.
                  </h1>
                  <p className="hidden md:block text-[#f5f5f5]/80 mt-4 max-w-sm text-xs lg:text-sm font-medium leading-relaxed drop-shadow-md">
                    Experience the next generation of asset tracking. Intelligent, secure, and beautifully designed for professionals.
                  </p>
                </motion.div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE PANEL: Form */}
          <div className="w-full md:w-[55%] lg:w-[55%] bg-[#ffffff] dark:bg-[#424242] px-6 py-8 sm:px-10 sm:py-8 lg:px-16 lg:py-12 flex flex-col justify-start relative rounded-t-[2rem] sm:rounded-[1.5rem] md:rounded-[2rem] -mt-10 sm:-mt-8 md:mt-0 z-30 shadow-[0_-20px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_-20px_40px_rgba(0,0,0,0.5)] md:shadow-none flex-1 overflow-y-auto sm:overflow-visible transition-colors duration-500">
            
            {/* Top Bar: Clean Logo Only */}
            <div className="flex justify-center md:justify-start items-center mb-8 sm:mb-10 sm:absolute sm:top-8 sm:left-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 relative">
                  <Image src="/Logos/Light%20Logo.png" alt="OmniVault Logo" fill className="object-contain dark:hidden" />
                  <Image src="/Logos/Dark%20Logo.png" alt="OmniVault Logo" fill className="object-contain hidden dark:block" />
                </div>
                <span className="font-outfit font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-600 to-emerald-400 dark:from-emerald-400 dark:to-emerald-200 text-2xl tracking-tight">
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
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#8d6e63] dark:text-[#ffffff] tracking-tight mb-2">
                    {isLogin ? "Welcome back" : "Create account"}
                  </h2>
                  <p className="text-[13px] sm:text-[14px] text-[#a1887f] dark:text-[#9e9e9e] font-medium">
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
                          <label className="text-[12px] font-bold text-[#a1887f] dark:text-[#9e9e9e] uppercase tracking-widest ml-1">Full Name</label>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            required={!isLogin}
                            className="w-full h-[48px] bg-[#f5f5f5] dark:bg-[#212121] border border-[#d7ccc8] dark:border-[#616161] text-[#8d6e63] dark:text-[#ffffff] placeholder:text-[#d7ccc8] dark:placeholder:text-[#616161] text-[14px] font-medium rounded-xl px-4 focus:outline-none focus:border-[#009900] dark:focus:border-[#66cc66] transition-colors"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-1.5">
                    <label className="text-[12px] font-bold text-[#a1887f] dark:text-[#9e9e9e] uppercase tracking-widest ml-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="hello@omnivault.com"
                      required
                      className="w-full h-[48px] bg-[#f5f5f5] dark:bg-[#212121] border border-[#d7ccc8] dark:border-[#616161] text-[#8d6e63] dark:text-[#ffffff] placeholder:text-[#d7ccc8] dark:placeholder:text-[#616161] text-[14px] font-medium rounded-xl px-4 focus:outline-none focus:border-[#009900] dark:focus:border-[#66cc66] transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5 relative">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-[12px] font-bold text-[#a1887f] dark:text-[#9e9e9e] uppercase tracking-widest">Password</label>
                      {isLogin && (
                        <button 
                          type="button"
                          onClick={async () => {
                            if (!email) {
                              setError("Please enter your email address first.");
                              return;
                            }
                            setAuthLoading(true);
                            try {
                              const { sendPasswordResetEmail } = await import("firebase/auth");
                              await sendPasswordResetEmail(auth, email);
                              setError("Password reset email sent! Please check your inbox.");
                            } catch (err: any) {
                              setError(err.message.replace("Firebase: ", ""));
                            } finally {
                              setAuthLoading(false);
                            }
                          }}
                          className="text-[11px] text-[#009900] dark:text-[#66cc66] font-bold hover:underline transition-all"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full h-[48px] bg-[#f5f5f5] dark:bg-[#212121] border border-[#d7ccc8] dark:border-[#616161] text-[#8d6e63] dark:text-[#ffffff] placeholder:text-[#d7ccc8] dark:placeholder:text-[#616161] text-[14px] font-medium rounded-xl px-4 focus:outline-none focus:border-[#009900] dark:focus:border-[#66cc66] transition-colors tracking-widest"
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
                          <label className="text-[12px] font-bold text-[#a1887f] dark:text-[#9e9e9e] uppercase tracking-widest ml-1">Confirm Password</label>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            required={!isLogin}
                            className="w-full h-[48px] bg-[#f5f5f5] dark:bg-[#212121] border border-[#d7ccc8] dark:border-[#616161] text-[#8d6e63] dark:text-[#ffffff] placeholder:text-[#d7ccc8] dark:placeholder:text-[#616161] text-[14px] font-medium rounded-xl px-4 focus:outline-none focus:border-[#009900] dark:focus:border-[#66cc66] transition-colors tracking-widest"
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
                      className="w-full h-[48px] bg-gradient-to-r from-[#009900] to-[#006600] text-[#ffffff] font-bold text-[14px] rounded-xl shadow-[0_10px_20px_rgba(0,153,0,0.2)] hover:shadow-[0_10px_25px_rgba(0,153,0,0.3)] hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 group"
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
                    <div className="flex-1 border-t border-[#d7ccc8] dark:border-[#616161]"></div>
                    <span className="px-4 text-[10px] font-black tracking-widest uppercase text-[#a1887f] dark:text-[#9e9e9e]">OR</span>
                    <div className="flex-1 border-t border-[#d7ccc8] dark:border-[#616161]"></div>
                  </div>

                  {/* Google Sign In */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={authLoading}
                    className="w-full h-[48px] bg-[#f5f5f5] dark:bg-[#212121] border border-[#d7ccc8] dark:border-[#616161] hover:bg-[#ffffff] dark:hover:bg-[#424242] text-[#8d6e63] dark:text-[#ffffff] font-bold text-[14px] rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-sm"
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
                        className="w-full h-[48px] bg-[#f5f5f5] dark:bg-[#212121] border border-[#d7ccc8] dark:border-[#616161] hover:bg-[#ffffff] dark:hover:bg-[#424242] text-[#009900] dark:text-[#66cc66] font-bold text-[14px] rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group shadow-sm"
                      >
                        <Fingerprint className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                        Biometric Login
                      </button>
                    </motion.div>
                  )}
                </form>

                {/* Toggle Login/Register Link */}
                <div className="mt-8 text-center">
                  <p className="text-[13px] text-[#a1887f] dark:text-[#9e9e9e] font-bold">
                    {isLogin ? "New to OmniVault? " : "Already have an account? "}
                    <button 
                      onClick={() => { setIsLogin(!isLogin); setError(""); }}
                      className="text-[#009900] dark:text-[#66cc66] font-black hover:text-[#006600] dark:hover:text-[#ccffcc] transition-colors hover:underline"
                    >
                      {isLogin ? "Create an account" : "Sign in"}
                    </button>
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Bottom Footer Links */}
            <div className="mt-auto pt-6 flex justify-center text-[11px] text-[#a1887f] dark:text-[#9e9e9e] font-bold uppercase tracking-widest">
              <div className="flex gap-5">
                <span>© {new Date().getFullYear()} OmniVault</span>
                <a href="#" className="hover:text-[#8d6e63] dark:hover:text-[#ffffff] transition-colors">Contact</a>
                <a href="#" className="hover:text-[#8d6e63] dark:hover:text-[#ffffff] transition-colors">Privacy</a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f5f5f5] dark:bg-[#212121] w-full transition-colors duration-500">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-[280px] pb-24 md:pb-0 min-w-0">
        <Header userName={user.displayName || "OmniVault User"} />
        <main className="flex-1 overflow-x-hidden relative">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}