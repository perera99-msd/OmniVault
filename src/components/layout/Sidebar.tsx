"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Wallet, HandCoins, Settings, LogOut, ArrowRightLeft, CalendarClock } from "lucide-react";
import Image from "next/image";
import { auth } from "@/lib/firebase/config";
import { signOut } from "firebase/auth";

import { LogoText } from "@/components/ui/LogoText";

const navItems = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Ledger", href: "/transactions", icon: ArrowRightLeft },
  { name: "Upcoming", href: "/upcoming", icon: CalendarClock },
  { name: "Wallets", href: "/wallets", icon: Wallet },
  { name: "Loans", href: "/loans", icon: HandCoins },
];

export function Sidebar() {
  const pathname = usePathname();

  const handleSignOut = () => {
    signOut(auth);
  };

  return (
    <aside className="hidden md:flex flex-col w-[260px] h-screen fixed left-0 top-0 border-r border-zinc-200/50 dark:border-white/5 bg-[#fcfcfc]/90 dark:bg-[#09090b]/90 backdrop-blur-3xl z-40 transition-colors duration-500 shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-none">
      
      {/* Brand Header */}
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 relative bg-white dark:bg-[#121214] rounded-xl p-2 border border-zinc-200/80 dark:border-white/10 shadow-sm flex items-center justify-center">
          <Image src="/Logos/Light%20Logo.png" alt="OmniVault Logo" fill className="object-contain p-1.5 dark:hidden" />
          <Image src="/Logos/Dark%20Logo.png" alt="OmniVault Logo" fill className="object-contain p-1.5 hidden dark:block" />
        </div>
        <LogoText className="text-[1.35rem]" />
      </div>

      <div className="px-8 pb-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Menu</p>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-[13px] transition-all duration-300 relative overflow-hidden group ${
                isActive
                  ? "bg-white dark:bg-white/5 text-emerald-600 dark:text-emerald-400 shadow-sm border border-zinc-200/50 dark:border-white/5"
                  : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white border border-transparent"
              }`}
            >
              <item.icon className={`w-[18px] h-[18px] transition-transform duration-300 ${isActive ? "text-emerald-500 dark:text-emerald-400" : "opacity-70 group-hover:text-zinc-900 dark:group-hover:text-white"}`} />
              <span className="tracking-wide z-10">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Section */}
      <div className="p-4 mt-auto mb-4 border-t border-zinc-200/50 dark:border-white/5">
        <div className="space-y-1.5 pt-2">
          <Link 
            href="/settings"
            className="flex items-center gap-3.5 px-4 py-3 w-full rounded-2xl font-bold text-[13px] transition-all duration-300 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white border border-transparent group"
          >
            <Settings className="w-[18px] h-[18px] opacity-70 group-hover:rotate-45 transition-transform duration-500" />
            <span className="tracking-wide">Settings</span>
          </Link>
          
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3.5 px-4 py-3 w-full rounded-2xl font-bold text-[13px] transition-all duration-300 text-zinc-500 dark:text-zinc-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 border border-transparent group"
          >
            <LogOut className="w-[18px] h-[18px] opacity-70 transition-transform" />
            <span className="tracking-wide">Log Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}