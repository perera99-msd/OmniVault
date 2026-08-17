"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const CURRENCIES = [
  { code: "LKR", label: "LKR (Rs)" },
  { code: "USD", label: "USD ($)" },
  { code: "EUR", label: "EUR (€)" },
];

export function BaseCurrencySelector({ currentBase }: { currentBase: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (code: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("base", code);
    router.push(`${pathname}?${params.toString()}`);
    setIsOpen(false);
  };

  const selectedCurrency = CURRENCIES.find((c) => c.code === currentBase) || CURRENCIES[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-[#181B18] shadow-sm border border-[#E8E2D8] dark:border-white/10 hover:bg-[#FAF8F3] dark:hover:bg-[#202420] transition-colors"
      >
        <span className="relative flex h-2 w-2 mr-1">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#987B5E] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#987B5E]"></span>
        </span>
        <span className="text-[10px] font-black uppercase tracking-widest text-[#6C5B4C] dark:text-[#9A9EA4]">
          Base: {selectedCurrency.code}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-[#987B5E] transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 w-32 bg-[#FDFBF7] dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
          {CURRENCIES.map((currency) => (
            <button
              key={currency.code}
              onClick={() => handleSelect(currency.code)}
              className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors ${
                currentBase === currency.code
                  ? "bg-[#213F33]/10 dark:bg-[#385A4D]/20 text-[#213F33] dark:text-[#EBE8E3] font-black"
                  : "text-[#6C5B4C] dark:text-[#9A9EA4] hover:bg-[#FAF8F3] dark:hover:bg-[#202420] hover:text-[#1A1D1A] dark:hover:text-white"
              }`}
            >
              {currency.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
