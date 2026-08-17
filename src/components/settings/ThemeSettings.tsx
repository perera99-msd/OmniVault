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
    <div className="bg-white dark:bg-[#181B18] p-6 rounded-[2rem] border border-[#E8E2D8] dark:border-white/5 shadow-sm flex flex-col gap-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full pointer-events-none opacity-20 bg-[#987B5E] transition-opacity group-hover:opacity-40" />

      <div>
        <h3 className="text-lg font-black tracking-tight text-[#1A1D1A] dark:text-[#EBE8E3] mb-1 font-heading">Appearance</h3>
        <p className="text-sm text-[#6C5B4C] dark:text-[#9A9EA4] font-medium">Customize the aesthetic experience of Tria.</p>
      </div>

      <div className="grid grid-cols-3 gap-3 relative z-10">
        <button
          onClick={() => setTheme("light")}
          className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
            theme === "light"
              ? "bg-[#FAF8F3] border-[#987B5E] text-[#213F33] shadow-[0_0_15px_rgba(152,123,94,0.2)]"
              : "bg-white dark:bg-[#202420] border-[#E8E2D8] dark:border-white/5 text-[#6C5B4C] hover:border-[#987B5E]/50"
          }`}
        >
          <Sun className={`w-6 h-6 mb-2 ${theme === "light" ? "text-[#987B5E]" : "text-[#9A9EA4]"}`} />
          <span className="text-xs font-black tracking-wider uppercase">Light</span>
        </button>

        <button
          onClick={() => setTheme("dark")}
          className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
            theme === "dark"
              ? "bg-[#202420] border-[#987B5E] text-[#D4B48A] shadow-[0_0_15px_rgba(152,123,94,0.3)]"
              : "bg-white dark:bg-[#202420] border-[#E8E2D8] dark:border-white/5 text-[#9A9EA4] hover:border-[#987B5E]/50"
          }`}
        >
          <Moon className={`w-6 h-6 mb-2 ${theme === "dark" ? "text-[#D4B48A]" : "text-[#9A9EA4]"}`} />
          <span className="text-xs font-black tracking-wider uppercase">Dark</span>
        </button>

        <button
          onClick={() => setTheme("system")}
          className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
            theme === "system"
              ? "bg-[#FAF8F3] dark:bg-[#202420] border-[#987B5E] text-[#987B5E] shadow-[0_0_15px_rgba(152,123,94,0.2)]"
              : "bg-white dark:bg-[#202420] border-[#E8E2D8] dark:border-white/5 text-[#6C5B4C] hover:border-[#987B5E]/50"
          }`}
        >
          <Laptop className={`w-6 h-6 mb-2 ${theme === "system" ? "text-[#987B5E]" : "text-[#9A9EA4]"}`} />
          <span className="text-xs font-black tracking-wider uppercase">System</span>
        </button>
      </div>
    </div>
  );
}
