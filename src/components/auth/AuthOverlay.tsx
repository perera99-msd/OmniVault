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
import { LogoText } from "@/components/ui/LogoText";

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
  const [successMessage, setSuccessMessage] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  const [isProcessingAuth, setIsProcessingAuth] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

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
    setSuccessMessage("");

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setAuthLoading(true);
    try {
      if (isLogin) {
        setIsProcessingAuth(true);
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        document.cookie = `firebaseUid=${userCredential.user.uid}; path=/; max-age=31536000; SameSite=Lax`;
        await createUser({
          firebaseUid: userCredential.user.uid,
          email: userCredential.user.email || email,
          name: userCredential.user.displayName || "User"
        });
        window.location.href = "/";
      } else {
        setIsRegistering(true);
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await createUser({
          firebaseUid: userCredential.user.uid,
          email: userCredential.user.email || email,
          name: name
        });
        await auth.signOut();
        setIsRegistering(false);
        setSuccessMessage("Account created successfully! Please sign in.");
        setIsLogin(true);
        setPassword("");
        setConfirmPassword("");
        setAuthLoading(false);
      }
    } catch (err: any) {
      setIsRegistering(false);
      setIsProcessingAuth(false);
      setAuthLoading(false);
      setError(err.message.replace("Firebase: ", ""));
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setSuccessMessage("");
    setAuthLoading(true);
    try {
      setIsProcessingAuth(true);
      const userCredential = await signInWithPopup(auth, googleProvider);
      document.cookie = `firebaseUid=${userCredential.user.uid}; path=/; max-age=31536000; SameSite=Lax`;
      await createUser({
        firebaseUid: userCredential.user.uid,
        email: userCredential.user.email || "",
        name: userCredential.user.displayName || "Google User"
      });
      window.location.href = "/";
    } catch (err: any) {
      setIsProcessingAuth(false);
      setAuthLoading(false);
      setError(err.message.replace("Firebase: ", ""));
    }
  };

  if (loading || isProcessingAuth) {
    return (
      <div suppressHydrationWarning className="min-h-[100svh] flex flex-col items-center justify-center bg-zinc-50 dark:bg-[#050505] transition-colors duration-500 relative overflow-hidden">
        {/* Massive Ambient Aura */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] rounded-full bg-emerald-500/20 dark:bg-emerald-500/10 blur-[120px] pointer-events-none" 
        />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center gap-6 relative z-10"
        >
          {/* Pulsing Logo Container */}
          <motion.div 
            animate={{ scale: [1, 1.05, 1], filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="w-24 h-24 sm:w-32 sm:h-32 relative drop-shadow-2xl"
          >
            <Image src="/Logos/Light%20Logo.png" alt="OmniVault Logo" fill className="object-contain dark:hidden" priority />
            <Image src="/Logos/Dark%20Logo.png" alt="OmniVault Logo" fill className="object-contain hidden dark:block" priority />
          </motion.div>
          
          <LogoText className="text-3xl sm:text-4xl drop-shadow-md" />
          
          {/* Subtle loading bar */}
          <div className="w-32 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full mt-4 overflow-hidden relative">
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-emerald-500 to-transparent rounded-full"
            />
          </div>
        </motion.div>
      </div>
    );
  }

  if (!user || isRegistering) {
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
          <div className="w-full md:w-[55%] lg:w-[55%] bg-white dark:bg-[#121214] px-6 py-8 sm:px-10 sm:py-8 lg:px-16 lg:py-12 flex flex-col justify-start relative rounded-t-[2rem] sm:rounded-[1.5rem] md:rounded-[2rem] -mt-10 sm:-mt-8 md:mt-0 z-30 shadow-none flex-1 overflow-y-auto sm:overflow-visible transition-colors duration-500">
            
            {/* Top Bar: Clean Logo Only */}
            <div className="flex justify-center md:justify-start items-center mb-8 sm:mb-10 sm:absolute sm:top-8 sm:left-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 relative drop-shadow-md">
                  <Image src="/Logos/Light%20Logo.png" alt="OmniVault Logo" fill className="object-contain dark:hidden" />
                  <Image src="/Logos/Dark%20Logo.png" alt="OmniVault Logo" fill className="object-contain hidden dark:block" />
                </div>
                <LogoText className="text-2xl" />
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
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-2">
                    {isLogin ? "Welcome back" : "Create account"}
                  </h2>
                  <p className="text-[13px] sm:text-[14px] text-zinc-500 dark:text-zinc-400 font-medium">
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
                          <label className="text-[12px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest ml-1">Full Name</label>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            required={!isLogin}
                            className="w-full h-[48px] bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 text-[14px] font-medium rounded-xl px-4 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-1.5">
                    <label className="text-[12px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest ml-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="hello@omnivault.com"
                      required
                      className="w-full h-[48px] bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 text-[14px] font-medium rounded-xl px-4 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5 relative">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-[12px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Password</label>
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
                          className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline transition-all"
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
                      className="w-full h-[48px] bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 text-[14px] font-medium rounded-xl px-4 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all tracking-widest"
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
                          <label className="text-[12px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest ml-1">Confirm Password</label>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            required={!isLogin}
                            className="w-full h-[48px] bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 text-[14px] font-medium rounded-xl px-4 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all tracking-widest"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Error / Success Messages */}
                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-xs text-white bg-red-500/90 border border-red-500 rounded-xl px-3 py-2.5 font-medium text-center mt-2 shadow-sm"
                      >
                        {error}
                      </motion.p>
                    )}
                    {successMessage && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-xs text-white bg-emerald-500/90 border border-emerald-500 rounded-xl px-3 py-2.5 font-medium text-center mt-2 shadow-sm"
                      >
                        {successMessage}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* Main Action Button */}
                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full h-[48px] bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-[14px] rounded-xl shadow-[0_10px_30px_-10px_rgba(16,185,129,0.5)] transition-all duration-300 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 group"
                    >
                      {authLoading ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
                    <div className="flex-1 border-t border-zinc-200 dark:border-white/10"></div>
                    <span className="px-4 text-[10px] font-black tracking-widest uppercase text-zinc-400 dark:text-zinc-500">OR</span>
                    <div className="flex-1 border-t border-zinc-200 dark:border-white/10"></div>
                  </div>

                  {/* Google Sign In */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={authLoading}
                    className="w-full h-[48px] bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-[#27272a] text-zinc-900 dark:text-white font-bold text-[14px] rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-sm"
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
                        className="w-full h-[48px] bg-white dark:bg-[#18181b] border border-emerald-500/30 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-bold text-[14px] rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group shadow-sm"
                      >
                        <Fingerprint className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                        Biometric Login
                      </button>
                    </motion.div>
                  )}
                </form>

                {/* Toggle Login/Register Link */}
                <div className="mt-8 text-center">
                  <p className="text-[13px] text-zinc-500 dark:text-zinc-400 font-bold">
                    {isLogin ? "New to OmniVault? " : "Already have an account? "}
                    <button 
                      onClick={() => { setIsLogin(!isLogin); setError(""); setSuccessMessage(""); }}
                      className="text-emerald-600 dark:text-emerald-400 font-black hover:text-emerald-500 dark:hover:text-emerald-300 transition-colors hover:underline"
                    >
                      {isLogin ? "Create an account" : "Sign in"}
                    </button>
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Bottom Footer Links */}
            <div className="mt-auto pt-6 flex justify-center text-[11px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest">
              <div className="flex gap-5">
                <span>© {new Date().getFullYear()} OmniVault</span>
                <a href="#" className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">Contact</a>
                <a href="#" className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">Privacy</a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100svh] bg-white dark:bg-[#09090b] w-full transition-colors duration-500">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-[260px] pb-24 md:pb-0 min-w-0">
        <Header userName={user.displayName || "OmniVault User"} />
        <main className="flex-1 overflow-x-hidden relative">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}