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
  { name: "My Assets", href: "/assets", icon: Gem, color: "text-[#2B493D] bg-[#213F33]/10 dark:text-[#4E6C5F] dark:bg-[#385A4D]/20" },
  { name: "Categories", href: "/categories", icon: PieChart, color: "text-[#987B5E] bg-[#987B5E]/10 dark:text-[#D4B48A] dark:bg-[#987B5E]/20" },
  { name: "Loans", href: "/loans", icon: HandCoins, color: "text-[#7A6652] bg-[#7A6652]/10 dark:text-[#C5A880] dark:bg-[#7A6652]/20" },
  { name: "Settings", href: "/settings", icon: Settings, color: "text-[#53585F] bg-[#53585F]/10 dark:text-[#9A9EA4] dark:bg-[#2C2F33]" },
];

export function BottomNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-safe pointer-events-none">
      {/* Tria Floating Tab Bar */}
      <div className="mx-auto max-w-sm mb-4 pointer-events-auto bg-[#FDFBF7]/90 dark:bg-[#181B18]/90 backdrop-blur-3xl border border-[#E8E2D8] dark:border-white/10 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div className="flex justify-between items-center h-[72px] px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center w-[60px] h-[60px] rounded-[1.5rem] transition-all duration-300 relative group ${
                  isActive
                    ? "text-[#213F33] dark:text-[#EBE8E3]"
                    : "text-[#6C5B4C]/60 dark:text-[#9A9EA4]/60 hover:text-[#1A1D1A] dark:hover:text-white"
                }`}
              >
                {/* Active Indicator Pill */}
                {isActive && (
                  <div className="absolute inset-0 bg-[#213F33]/10 dark:bg-[#385A4D]/20 rounded-[1.5rem] shadow-[inset_0_0_10px_rgba(152,123,94,0.15)] transition-all duration-500" />
                )}
                
                <div className={`p-1 transition-transform duration-300 z-10 ${isActive ? "-translate-y-1" : "group-hover:-translate-y-0.5"}`}>
                  <item.icon className={`w-[22px] h-[22px] ${isActive ? "stroke-[2.5px] text-[#987B5E] dark:text-[#D4B48A]" : "stroke-[2px]"}`} />
                </div>
                
                <span className={`text-[10px] font-bold tracking-wide z-10 transition-all duration-300 ${isActive ? "opacity-100 translate-y-0 font-black text-[#213F33] dark:text-[#EBE8E3]" : "opacity-0 translate-y-2 absolute"}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="flex flex-col items-center justify-center w-[60px] h-[60px] rounded-[1.5rem] transition-all duration-300 relative group text-[#6C5B4C]/60 dark:text-[#9A9EA4]/60 hover:text-[#1A1D1A] dark:hover:text-white">
              <div className="p-1 transition-transform duration-300 z-10 group-hover:-translate-y-0.5">
                <Menu className="w-[22px] h-[22px] stroke-[2px]" />
              </div>
              <span className="text-[10px] font-bold tracking-wide z-10 transition-all duration-300 opacity-0 translate-y-2 absolute">
                More
              </span>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-[2rem] bg-[#FDFBF7] dark:bg-[#181B18] border-t border-[#E8E2D8] dark:border-white/10 px-6 py-8">
              <SheetHeader className="mb-6 text-left">
                <SheetTitle className="text-2xl font-black text-[#1A1D1A] dark:text-[#EBE8E3] font-heading">More Options</SheetTitle>
              </SheetHeader>
              <div className="grid grid-cols-1 gap-3">
                {menuItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-4 p-4 rounded-[1.5rem] bg-white dark:bg-[#202420] hover:bg-[#FAF8F3] dark:hover:bg-[#252B25] transition-colors border border-[#E8E2D8] dark:border-white/5"
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.color}`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <span className="text-lg font-bold text-[#1A1D1A] dark:text-[#EBE8E3] tracking-tight">{item.name}</span>
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
