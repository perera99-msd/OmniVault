"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Wallet, HandCoins, ArrowRightLeft, CalendarClock, Menu, PieChart, Settings, Gem } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";

const navItems = [
  { name: "Upcomings", href: "/upcoming", icon: CalendarClock },
  { name: "Ledger", href: "/transactions", icon: ArrowRightLeft },
  { name: "Home", href: "/", icon: LayoutDashboard },
  { name: "Wallets", href: "/wallets", icon: Wallet },
];

const menuItems = [
  { name: "My Assets", href: "/assets", icon: Gem, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" },
  { name: "Categories", href: "/categories", icon: PieChart, color: "text-purple-500 bg-purple-50 dark:bg-purple-500/10" },
  { name: "Loans", href: "/loans", icon: HandCoins, color: "text-amber-500 bg-amber-50 dark:bg-amber-500/10" },
  { name: "Settings", href: "/settings", icon: Settings, color: "text-zinc-500 bg-zinc-100 dark:bg-zinc-800" },
];

export function BottomNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

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

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className={`flex flex-col items-center justify-center w-[60px] h-[60px] rounded-[1.5rem] transition-all duration-300 relative group text-zinc-400 hover:text-zinc-900 dark:hover:text-white`}>
              <div className={`p-1 transition-transform duration-300 z-10 group-hover:-translate-y-0.5`}>
                <Menu className={`w-[22px] h-[22px] stroke-[2px]`} />
              </div>
              <span className={`text-[10px] font-bold tracking-wide z-10 transition-all duration-300 opacity-0 translate-y-2 absolute`}>
                More
              </span>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-[2rem] bg-white dark:bg-[#121214] border-t border-zinc-200 dark:border-white/10 px-6 py-8">
              <SheetHeader className="mb-6 text-left">
                <SheetTitle className="text-2xl font-black text-zinc-900 dark:text-white">More Options</SheetTitle>
              </SheetHeader>
              <div className="grid grid-cols-1 gap-3">
                {menuItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-4 p-4 rounded-[1.5rem] bg-zinc-50 dark:bg-[#18181b] hover:bg-zinc-100 dark:hover:bg-[#27272a] transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-white/5"
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.color}`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <span className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">{item.name}</span>
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>

        </div>
      </div>
    </nav>
  );
}
