"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Wallet, HandCoins, ArrowRightLeft, CalendarClock } from "lucide-react";

const navItems = [
  { name: "Upcomings", href: "/upcoming", icon: CalendarClock },
  { name: "Transactions", href: "/transactions", icon: ArrowRightLeft },
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Wallets", href: "/wallets", icon: Wallet },
  { name: "Loans", href: "/loans", icon: HandCoins },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[88px] bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-2xl border-t border-zinc-200/80 dark:border-zinc-800/60 z-50 px-6 pb-safe transition-colors duration-500 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-none">
      <div className="flex justify-between items-center h-full max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 relative ${
                isActive
                  ? "text-emerald-500 dark:text-emerald-400"
                  : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              {/* Active Indicator Glow */}
              {isActive && (
                <div className="absolute top-0 w-8 h-1 bg-emerald-500 dark:bg-emerald-400 rounded-b-full shadow-[0_2px_10px_rgba(16,185,129,0.5)]" />
              )}
              
              <div className={`p-2.5 rounded-2xl transition-all duration-300 ${isActive ? "bg-emerald-50 dark:bg-emerald-500/10 transform -translate-y-1" : ""}`}>
                <item.icon className={`w-6 h-6 ${isActive ? "stroke-[2.5px]" : "stroke-[2px]"}`} />
              </div>
              
              <span className={`text-[9px] mt-0.5 font-black uppercase tracking-wider ${isActive ? "opacity-100" : "opacity-0 h-0 overflow-hidden"} transition-all duration-300`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
