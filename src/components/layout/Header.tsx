"use client";

import { auth } from "@/lib/firebase/config";
import { signOut } from "firebase/auth";
import { Bell, Sun, Moon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface HeaderProps {
  userName: string;
}

export function Header({ userName }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <header className="h-[90px] w-full flex items-center justify-between px-6 sm:px-10 bg-white/60 dark:bg-[#09090b]/60 backdrop-blur-3xl z-30 pt-safe border-b border-zinc-200/50 dark:border-white/5 sticky top-0 transition-colors duration-500">
      <div className="flex items-center gap-4">
        {/* Mobile Logo */}
        <div className="md:hidden flex items-center gap-2.5">
          <div className="w-10 h-10 relative bg-white dark:bg-[#121214] rounded-[1rem] p-2 border border-zinc-200/80 dark:border-white/10 shadow-sm flex items-center justify-center">
            <Image src="/Logos/Light%20Logo.png" alt="Logo" fill className="object-contain p-1.5 dark:hidden" />
            <Image src="/Logos/Dark%20Logo.png" alt="Logo" fill className="object-contain p-1.5 hidden dark:block" />
          </div>
          <span className="font-black text-zinc-900 dark:text-white text-xl tracking-tight">
            OmniVault
          </span>
        </div>

        {/* Desktop Greeting */}
        <div className="hidden md:block">
          <h1 className="text-[1.75rem] font-black text-zinc-900 dark:text-white tracking-tight leading-none">
            Overview
          </h1>
          <p className="text-[13px] font-bold text-zinc-500 dark:text-zinc-400 mt-1">
            Welcome back, {userName.split(" ")[0]}
          </p>
        </div>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-3 sm:gap-4 ml-auto">
        
        {/* Theme Toggle */}
        {mounted && (
          <button 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-11 h-11 rounded-[1rem] flex items-center justify-center bg-white/50 dark:bg-[#121214]/50 border border-zinc-200/50 dark:border-white/5 text-zinc-500 dark:text-zinc-400 hover:bg-white dark:hover:bg-[#18181b] hover:text-emerald-600 dark:hover:text-emerald-400 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 group"
          >
            {theme === "dark" ? (
               <Sun className="w-5 h-5 group-hover:rotate-45 transition-transform duration-500" />
            ) : (
               <Moon className="w-5 h-5 group-hover:-rotate-12 transition-transform duration-500" />
            )}
          </button>
        )}

        {/* Notification */}
        <button 
          className="w-11 h-11 rounded-[1rem] flex items-center justify-center bg-white/50 dark:bg-[#121214]/50 border border-zinc-200/50 dark:border-white/5 text-zinc-400 dark:text-zinc-500 shadow-sm relative group cursor-not-allowed"
          title="Notifications coming soon"
        >
          <Bell className="w-5 h-5 opacity-50" />
          {/* <span className="absolute top-2.5 right-3 w-2.5 h-2.5 bg-emerald-500 rounded-full border-[2.5px] border-white dark:border-[#09090b] shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span> */}
        </button>
        
        {/* Profile Icon */}
        <Link 
          href="/settings"
          className="w-11 h-11 rounded-[1rem] bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white text-sm font-black tracking-wider shadow-[0_4px_14px_rgba(16,185,129,0.3)] border border-white/20 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] active:scale-95 transition-all"
          title="Profile & Settings"
        >
          {getInitials(userName)}
        </Link>
      </div>
    </header>
  );
}