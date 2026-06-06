"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Wallet, HandCoins, Settings, LogOut, ArrowRightLeft, CalendarClock } from "lucide-react";
import Image from "next/image";
import { auth } from "@/lib/firebase/config";
import { signOut } from "firebase/auth";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Transactions", href: "/transactions", icon: ArrowRightLeft },
  { name: "Upcomings", href: "/upcoming", icon: CalendarClock },
  { name: "Wallets", href: "/wallets", icon: Wallet },
  { name: "Loans", href: "/loans", icon: HandCoins },
];

export function Sidebar() {
  const pathname = usePathname();

  const handleSignOut = () => {
    signOut(auth);
  };

  return (
    <aside className="hidden md:flex flex-col w-[280px] h-screen fixed left-0 top-0 border-r border-zinc-200/80 dark:border-zinc-800/60 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-3xl z-40 transition-colors duration-500 shadow-2xl shadow-zinc-200/20 dark:shadow-none">
      
      {/* Brand Header */}
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 relative bg-zinc-50 dark:bg-zinc-900 rounded-xl p-2 border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm flex items-center justify-center">
          <Image src="/Logos/Light%20Logo.png" alt="OmniVault Logo" fill className="object-contain p-1.5 dark:hidden" />
          <Image src="/Logos/Dark%20Logo.png" alt="OmniVault Logo" fill className="object-contain p-1.5 hidden dark:block" />
        </div>
        <span className="font-black text-zinc-900 dark:text-white text-2xl tracking-tight">
          OmniVault
        </span>
      </div>

      <div className="px-8 pb-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-600 mb-2">Main Menu</p>
      </div>

      <nav className="flex-1 px-6 space-y-2 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 relative overflow-hidden group ${
                isActive
                  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-[inset_3px_0_0_#10b981]"
                  : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              {/* Subtle hover glow */}
              {!isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-100/0 to-transparent opacity-0 group-hover:opacity-100 dark:from-zinc-800/0 transition-opacity" />
              )}
              
              <item.icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? "text-emerald-500 dark:text-emerald-400 scale-110" : "opacity-80 group-hover:scale-110 group-hover:text-zinc-900 dark:group-hover:text-white"}`} />
              <span className="tracking-wide z-10">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Section */}
      <div className="p-6 mt-auto">
        <div className="mb-4 px-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-600 mb-2">System</p>
        </div>
        
        <div className="space-y-2">
          <Link 
            href="/settings"
            className="flex items-center gap-4 px-4 py-3.5 w-full rounded-2xl font-bold text-sm transition-all duration-300 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-white group"
          >
            <Settings className="w-5 h-5 opacity-80 group-hover:scale-110 transition-transform" />
            <span className="tracking-wide">Settings</span>
          </Link>
          
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-4 px-4 py-3.5 w-full rounded-2xl font-bold text-sm transition-all duration-300 text-zinc-500 dark:text-zinc-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 group"
          >
            <LogOut className="w-5 h-5 opacity-80 group-hover:scale-110 transition-transform" />
            <span className="tracking-wide">Log Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}