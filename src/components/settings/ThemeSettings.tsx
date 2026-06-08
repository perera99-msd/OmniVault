"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Laptop } from "lucide-react";

export function ThemeSettings() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="bg-white dark:bg-[#121214] p-6 rounded-[2rem] border border-zinc-200 dark:border-white/5 shadow-sm flex flex-col gap-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full pointer-events-none opacity-20 bg-[#009900] transition-opacity group-hover:opacity-40" />

      <div>
        <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white mb-1">Appearance</h3>
        <p className="text-sm text-zinc-500 font-medium">Customize the look and feel of OmniVault.</p>
      </div>

      <div className="grid grid-cols-3 gap-3 relative z-10">
        <button
          onClick={() => setTheme("light")}
          className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
            theme === "light"
              ? "bg-zinc-100 dark:bg-white/5 border-[#009900] text-[#009900] shadow-[0_0_15px_rgba(0,153,0,0.15)]"
              : "bg-white dark:bg-[#121212] border-zinc-200 dark:border-white/5 text-zinc-500 hover:border-zinc-300 dark:hover:border-white/10"
          }`}
        >
          <Sun className={`w-6 h-6 mb-2 ${theme === "light" ? "text-[#009900]" : "text-zinc-400"}`} />
          <span className="text-xs font-bold tracking-wider uppercase">Light</span>
        </button>

        <button
          onClick={() => setTheme("dark")}
          className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
            theme === "dark"
              ? "bg-zinc-100 dark:bg-white/5 border-[#009900] text-[#009900] shadow-[0_0_15px_rgba(0,153,0,0.15)]"
              : "bg-white dark:bg-[#121212] border-zinc-200 dark:border-white/5 text-zinc-500 hover:border-zinc-300 dark:hover:border-white/10"
          }`}
        >
          <Moon className={`w-6 h-6 mb-2 ${theme === "dark" ? "text-[#009900]" : "text-zinc-400"}`} />
          <span className="text-xs font-bold tracking-wider uppercase">Dark</span>
        </button>

        <button
          onClick={() => setTheme("system")}
          className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
            theme === "system"
              ? "bg-zinc-100 dark:bg-white/5 border-[#009900] text-[#009900] shadow-[0_0_15px_rgba(0,153,0,0.15)]"
              : "bg-white dark:bg-[#121212] border-zinc-200 dark:border-white/5 text-zinc-500 hover:border-zinc-300 dark:hover:border-white/10"
          }`}
        >
          <Laptop className={`w-6 h-6 mb-2 ${theme === "system" ? "text-[#009900]" : "text-zinc-400"}`} />
          <span className="text-xs font-bold tracking-wider uppercase">System</span>
        </button>
      </div>
    </div>
  );
}
