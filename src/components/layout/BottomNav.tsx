"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Wallet, HandCoins, ArrowRightLeft, CalendarClock } from "lucide-react";

const navItems = [
  { name: "Upcomings", href: "/upcoming", icon: CalendarClock },
  { name: "Ledger", href: "/transactions", icon: ArrowRightLeft },
  { name: "Home", href: "/", icon: LayoutDashboard },
  { name: "Wallets", href: "/wallets", icon: Wallet },
  { name: "Loans", href: "/loans", icon: HandCoins },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-safe pointer-events-none">
      {/* iOS App-style Floating Tab Bar */}
      <div className="mx-auto max-w-sm mb-4 pointer-events-auto bg-white/70 dark:bg-[#121214]/70 backdrop-blur-3xl border border-zinc-200/50 dark:border-white/10 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        <div className="flex justify-between items-center h-[72px] px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center w-[60px] h-[60px] rounded-[1.5rem] transition-all duration-300 relative group ${
                  isActive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                {/* Active Indicator Glow */}
                {isActive && (
                  <div className="absolute inset-0 bg-emerald-50 dark:bg-emerald-500/10 rounded-[1.5rem] shadow-[inset_0_0_10px_rgba(16,185,129,0.1)] transition-all duration-500" />
                )}
                
                <div className={`p-1 transition-transform duration-300 z-10 ${isActive ? "-translate-y-1" : "group-hover:-translate-y-0.5"}`}>
                  <item.icon className={`w-[22px] h-[22px] ${isActive ? "stroke-[2.5px]" : "stroke-[2px]"}`} />
                </div>
                
                <span className={`text-[10px] font-bold tracking-wide z-10 transition-all duration-300 ${isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 absolute"}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
