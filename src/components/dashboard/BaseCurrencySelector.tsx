"use client";

import { useRouter, useSearchParams } from "next/navigation";
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
    router.push(`/?${params.toString()}`);
    setIsOpen(false);
  };

  const selectedCurrency = CURRENCIES.find((c) => c.code === currentBase) || CURRENCIES[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-50 dark:bg-zinc-900 shadow-sm border border-zinc-200/50 dark:border-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      >
        <span className="relative flex h-2 w-2 mr-1">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          Base: {selectedCurrency.code}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 w-32 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden z-50">
          {CURRENCIES.map((currency) => (
            <button
              key={currency.code}
              onClick={() => handleSelect(currency.code)}
              className={`w-full text-left px-4 py-2.5 text-sm font-bold transition-colors ${
                currentBase === currency.code
                  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-white"
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
