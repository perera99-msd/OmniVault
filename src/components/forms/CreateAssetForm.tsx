"use client";

import { useState } from "react";
import { Plus, ShieldAlert, Sparkles, Loader2, Check } from "lucide-react";
import { createAsset } from "@/actions/assets";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const CATEGORIES = [
  { id: "GOLD", label: "Gold & Jewelry" },
  { id: "REAL_ESTATE", label: "Real Estate & Lands" },
  { id: "BUSINESS", label: "Business & Shops" },
  { id: "VEHICLE", label: "Vehicles" },
  { id: "OTHER", label: "Other Assets" },
];

export function CreateAssetForm({ firebaseUid, baseCurrency }: { firebaseUid: string; baseCurrency: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("GOLD");
  const [initialValue, setInitialValue] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [isMortgaged, setIsMortgaged] = useState(false);

  // Mortgage details
  const [provider, setProvider] = useState("");
  const [mortgageAmount, setMortgageAmount] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [validPeriodMonths, setValidPeriodMonths] = useState("12");
  const [interestRate, setInterestRate] = useState("2.4");
  const [rateType, setRateType] = useState<"MONTHLY" | "YEARLY">("MONTHLY");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const initVal = parseFloat(initialValue) || 0;
    const currVal = parseFloat(currentValue) || initVal;

    const res = await createAsset({
      firebaseUid,
      name,
      category,
      initialValue: initVal,
      currentValue: currVal,
      currency: baseCurrency,
      location,
      description,
      isMortgaged,
      mortgageDetails: isMortgaged
        ? {
            provider,
            mortgageAmount: parseFloat(mortgageAmount) || 0,
            startDate,
            validPeriodMonths: parseInt(validPeriodMonths, 10) || 12,
            interestRate: parseFloat(interestRate) || 0,
            rateType,
          }
        : undefined,
    });

    setLoading(false);
    if (res.success) {
      setOpen(false);
      setName("");
      setInitialValue("");
      setCurrentValue("");
      setLocation("");
      setDescription("");
      setIsMortgaged(false);
      setProvider("");
      setMortgageAmount("");
    } else {
      setError(res.error || "Failed to create asset");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button
            type="button"
            className="px-5 py-3 rounded-2xl btn-tria-primary font-black text-sm shadow-md transition-all flex items-center gap-2"
          />
        }
      >
        <Plus className="w-4 h-4" /> Add Asset
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto custom-scrollbar bg-[#FDFBF7] dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/10 p-6 sm:p-8 rounded-[2rem] shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tight text-[#1A1D1A] dark:text-[#EBE8E3] flex items-center gap-2.5 font-heading">
            <Sparkles className="w-6 h-6 text-[#987B5E]" /> Log New Asset
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold mt-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-black uppercase tracking-wider text-[#6C5B4C] dark:text-[#9A9EA4] mb-1.5">
                Asset Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 22K Gold Ring (2.7g)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#202420] border border-[#E8E2D8] dark:border-white/10 text-[#1A1D1A] dark:text-[#EBE8E3] font-bold text-sm focus:outline-none focus:border-[#987B5E]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-[#6C5B4C] dark:text-[#9A9EA4] mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#202420] border border-[#E8E2D8] dark:border-white/10 text-[#1A1D1A] dark:text-[#EBE8E3] font-bold text-sm focus:outline-none focus:border-[#987B5E]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-[#6C5B4C] dark:text-[#9A9EA4] mb-1.5">
                Location / Custodian
              </label>
              <input
                type="text"
                placeholder="e.g. Safe at Home / Maharage"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#202420] border border-[#E8E2D8] dark:border-white/10 text-[#1A1D1A] dark:text-[#EBE8E3] font-bold text-sm focus:outline-none focus:border-[#987B5E]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-[#6C5B4C] dark:text-[#9A9EA4] mb-1.5">
                Acquired Value ({baseCurrency}) *
              </label>
              <input
                type="number"
                step="any"
                required
                placeholder="e.g. 50000"
                value={initialValue}
                onChange={(e) => setInitialValue(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#202420] border border-[#E8E2D8] dark:border-white/10 text-[#1A1D1A] dark:text-[#EBE8E3] font-bold text-sm focus:outline-none focus:border-[#987B5E]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-[#6C5B4C] dark:text-[#9A9EA4] mb-1.5">
                Current Market Value ({baseCurrency}) *
              </label>
              <input
                type="number"
                step="any"
                required
                placeholder="e.g. 110000"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#202420] border border-[#E8E2D8] dark:border-white/10 text-[#1A1D1A] dark:text-[#EBE8E3] font-bold text-sm focus:outline-none focus:border-[#987B5E]"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-[#E8E2D8] dark:border-white/5">
            <label className="flex items-center gap-3 cursor-pointer p-3.5 rounded-2xl bg-[#FAF8F3] dark:bg-[#202420] border border-[#E8E2D8] dark:border-white/10 hover:border-[#987B5E]/40 transition-all">
              <input
                type="checkbox"
                checked={isMortgaged}
                onChange={(e) => setIsMortgaged(e.target.checked)}
                className="w-5 h-5 rounded text-[#987B5E] focus:ring-[#987B5E]"
              />
              <div className="flex-1">
                <p className="font-black text-sm text-[#1A1D1A] dark:text-[#EBE8E3] flex items-center gap-1.5 font-heading">
                  <ShieldAlert className="w-4 h-4 text-[#987B5E]" /> Item is Mortgaged / Pawned as Collateral
                </p>
                <p className="text-xs text-[#6C5B4C] dark:text-[#9A9EA4] font-medium">
                  Track pawn broker, loan principal, and monthly interest accumulation.
                </p>
              </div>
            </label>
          </div>

          {isMortgaged && (
            <div className="bg-white dark:bg-[#202420] p-5 rounded-2xl border border-[#987B5E]/30 space-y-4">
              <h4 className="font-black text-xs uppercase tracking-wider text-[#987B5E]">
                Mortgage / Pawn Agreement Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-[#6C5B4C] dark:text-[#9A9EA4] mb-1">
                    Broker / Provider Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Maharage Gold Loans"
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F3] dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/10 text-[#1A1D1A] dark:text-[#EBE8E3] font-bold text-xs focus:outline-none focus:border-[#987B5E]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-[#6C5B4C] dark:text-[#9A9EA4] mb-1">
                    Mortgage Principal ({baseCurrency})
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 70000"
                    value={mortgageAmount}
                    onChange={(e) => setMortgageAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F3] dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/10 text-[#1A1D1A] dark:text-[#EBE8E3] font-bold text-xs focus:outline-none focus:border-[#987B5E]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-[#6C5B4C] dark:text-[#9A9EA4] mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F3] dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/10 text-[#1A1D1A] dark:text-[#EBE8E3] font-bold text-xs focus:outline-none focus:border-[#987B5E]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-[#6C5B4C] dark:text-[#9A9EA4] mb-1">
                    Valid Period (Months)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 12"
                    value={validPeriodMonths}
                    onChange={(e) => setValidPeriodMonths(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F3] dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/10 text-[#1A1D1A] dark:text-[#EBE8E3] font-bold text-xs focus:outline-none focus:border-[#987B5E]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-[#6C5B4C] dark:text-[#9A9EA4] mb-1">
                    Rate Calculation Basis
                  </label>
                  <select
                    value={rateType}
                    onChange={(e) => setRateType(e.target.value as "MONTHLY" | "YEARLY")}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F3] dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/10 text-[#1A1D1A] dark:text-[#EBE8E3] font-bold text-xs focus:outline-none focus:border-[#987B5E]"
                  >
                    <option value="MONTHLY">Monthly Interest Rate (%)</option>
                    <option value="YEARLY">Yearly Interest Rate (%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-[#6C5B4C] dark:text-[#9A9EA4] mb-1">
                    Interest Rate ({rateType === "MONTHLY" ? "% / month" : "% / year"})
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder={rateType === "MONTHLY" ? "e.g. 2.4" : "e.g. 28.8"}
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F3] dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/10 text-[#1A1D1A] dark:text-[#EBE8E3] font-bold text-xs focus:outline-none focus:border-[#987B5E]"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-[#6C5B4C] dark:text-[#9A9EA4] mb-1.5">
              Notes & Description
            </label>
            <textarea
              rows={2}
              placeholder="Any extra details, weight, specs..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#202420] border border-[#E8E2D8] dark:border-white/10 text-[#1A1D1A] dark:text-[#EBE8E3] font-bold text-sm focus:outline-none focus:border-[#987B5E] resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E2D8] dark:border-white/5">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-[#6C5B4C] dark:text-[#9A9EA4] hover:bg-[#FAF8F3] dark:hover:bg-[#202420] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl font-black text-xs btn-tria-primary shadow-md transition-all flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Save Asset
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
