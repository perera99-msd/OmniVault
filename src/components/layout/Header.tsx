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
    return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
  };

  return (
    <header className="h-[100px] w-full flex items-center justify-between px-6 sm:px-10 bg-white/60 dark:bg-[#09090b]/60 backdrop-blur-2xl z-30 pt-safe border-b border-zinc-200/50 dark:border-zinc-800/50 md:border-none sticky top-0 transition-colors duration-500">
      <div className="flex items-center gap-4">
        {/* Mobile Logo */}
        <div className="md:hidden flex items-center gap-2.5">
          <div className="w-9 h-9 relative bg-zinc-50 dark:bg-zinc-900 rounded-xl p-2 border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm flex items-center justify-center">
            <Image src="/Logos/Light%20Logo.png" alt="Logo" fill className="object-contain p-1.5 dark:hidden" />
            <Image src="/Logos/Dark%20Logo.png" alt="Logo" fill className="object-contain p-1.5 hidden dark:block" />
          </div>
          <span className="font-black text-zinc-900 dark:text-white text-xl tracking-tight">
            OmniVault
          </span>
        </div>

        {/* Desktop Greeting */}
        <div className="hidden md:block">
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            Overview
          </h1>
          <p className="text-[13px] font-bold text-zinc-500 dark:text-zinc-400 mt-0.5">
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
            className="w-[46px] h-[46px] rounded-2xl flex items-center justify-center bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 group"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 group-hover:rotate-45 transition-transform duration-500" />
            ) : (
              <Moon className="w-5 h-5 group-hover:-rotate-12 transition-transform duration-500" />
            )}
          </button>
        )}

        {/* Notification */}
        <button className="w-[46px] h-[46px] rounded-2xl flex items-center justify-center bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 relative group">
          <Bell className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
          <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-[#121214] shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
        </button>
        
        {/* Profile Icon */}
        <Link 
          href="/settings"
          className="w-[46px] h-[46px] rounded-2xl bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 flex items-center justify-center text-white text-sm font-black tracking-wider shadow-lg shadow-emerald-500/20 border border-emerald-400/20 hover:-translate-y-0.5 active:scale-95 transition-all"
          title="Profile & Settings"
        >
          {getInitials(userName)}
        </Link>
      </div>
    </header>
  );
}