"use client";

import { Bell, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { LogoText } from "@/components/ui/LogoText";
import { TriaLogo } from "@/components/ui/TriaLogo";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useAppStore } from "@/lib/store/useStore";

interface HeaderProps {
  userName: string;
}

const PAGE_TITLES: Record<string, string> = {
  "/": "Overview",
  "/transactions": "Ledger",
  "/upcoming": "Upcoming Payments",
  "/wallets": "Wallets & Accounts",
  "/categories": "Categories",
  "/loans": "Loans & Debts",
  "/assets": "My Assets",
  "/settings": "Settings",
};

export function Header({ userName }: HeaderProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const userAvatar = useAppStore((state) => state.userAvatar);

  const pageTitle = PAGE_TITLES[pathname] || "Overview";

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="h-[90px] w-full flex items-center justify-between px-6 sm:px-10 bg-[#FDFBF7]/80 dark:bg-[#121412]/80 backdrop-blur-3xl z-30 pt-safe border-b border-[#E8E2D8] dark:border-white/5 sticky top-0 transition-colors duration-500">
      <div className="flex items-center gap-4">
        {/* Mobile Logo */}
        <div className="md:hidden flex items-center gap-2.5">
          <div className="w-10 h-10 relative bg-white dark:bg-[#181B18] rounded-[1rem] p-1.5 border border-[#E8E2D8] dark:border-white/10 shadow-sm flex items-center justify-center">
            <TriaLogo size={24} />
          </div>
          <LogoText className="text-xl" />
        </div>

        {/* Desktop Greeting */}
        <div className="hidden md:block">
          <h1 className="text-[1.75rem] font-black text-[#1A1D1A] dark:text-[#EBE8E3] tracking-tight leading-none font-heading">
            {pageTitle}
          </h1>
          <p className="text-[13px] font-bold text-[#6C5B4C] dark:text-[#9A9EA4] mt-1">
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
            className="w-11 h-11 rounded-[1rem] flex items-center justify-center bg-white dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/10 text-[#6C5B4C] dark:text-[#EBE8E3] hover:text-[#987B5E] dark:hover:text-[#D4B48A] transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 group"
            title="Toggle theme"
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
          className="w-11 h-11 rounded-[1rem] flex items-center justify-center bg-white dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/10 text-[#6C5B4C]/50 dark:text-[#EBE8E3]/40 shadow-sm relative group cursor-not-allowed"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
        </button>
        
        {/* Profile Avatar Button */}
        <Link 
          href="/settings"
          className="group relative rounded-[1rem] transition-transform hover:-translate-y-0.5 active:scale-95"
          title="Profile & Settings"
        >
          <UserAvatar
            avatarId={userAvatar || "sophia"}
            name={userName}
            size="sm"
            className="w-11 h-11 rounded-[1rem] border border-[#E8E2D8] dark:border-white/20 shadow-sm group-hover:shadow-md group-hover:border-[#987B5E]"
          />
        </Link>
      </div>
    </header>
  );
}