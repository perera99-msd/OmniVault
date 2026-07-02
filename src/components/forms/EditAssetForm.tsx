"use client";

import { useState, useEffect } from "react";
import { ShieldAlert, Sparkles, Loader2, Check } from "lucide-react";
import { updateAsset } from "@/actions/assets";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const CATEGORIES = [
  { id: "GOLD", label: "Gold & Jewelry" },
  { id: "REAL_ESTATE", label: "Real Estate & Lands" },
  { id: "BUSINESS", label: "Business & Shops" },
  { id: "VEHICLE", label: "Vehicles" },
  { id: "OTHER", label: "Other Assets" },
];

export function EditAssetForm({
  asset,
  open,
  onClose,
  currencySymbol,
}: {
  asset: any | null;
  open: boolean;
  onClose: () => void;
  currencySymbol: string;
}) {
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
  const [currentPrincipal, setCurrentPrincipal] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [validPeriodMonths, setValidPeriodMonths] = useState("12");
  const [interestRate, setInterestRate] = useState("2.4");
  const [rateType, setRateType] = useState<"MONTHLY" | "YEARLY">("MONTHLY");

  useEffect(() => {
    if (asset) {
      setName(asset.name || "");
      setCategory(asset.category || "GOLD");
      setInitialValue(String(asset.initialValue ?? 0));
      setCurrentValue(String(asset.currentValue ?? 0));
      setLocation(asset.location || "");
      setDescription(asset.description || "");
      const mortgaged = !!asset.isMortgaged;
      setIsMortgaged(mortgaged);

      if (mortgaged && asset.mortgageDetails) {
        setProvider(asset.mortgageDetails.provider || "");
        setMortgageAmount(String(asset.mortgageDetails.mortgageAmount ?? 0));
        const cPrinc = asset.mortgageDetails.currentPrincipal !== undefined
          ? asset.mortgageDetails.currentPrincipal
          : (asset.mortgageDetails.mortgageAmount ?? 0);
        setCurrentPrincipal(String(cPrinc));

        const st = asset.mortgageDetails.startDate
          ? new Date(asset.mortgageDetails.startDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0];
        setStartDate(st);
        setValidPeriodMonths(String(asset.mortgageDetails.validPeriodMonths ?? 12));
        setInterestRate(String(asset.mortgageDetails.interestRate ?? asset.mortgageDetails.interestRateMonthly ?? 2.4));
        setRateType(asset.mortgageDetails.rateType || "MONTHLY");
      } else {
        setProvider("");
        setMortgageAmount("");
        setCurrentPrincipal("");
        setStartDate(new Date().toISOString().split("T")[0]);
        setValidPeriodMonths("12");
        setInterestRate("2.4");
        setRateType("MONTHLY");
      }
    }
  }, [asset]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asset) return;
    setLoading(true);
    setError(null);

    const initVal = parseFloat(initialValue) || 0;
    const currVal = parseFloat(currentValue) || initVal;

    const res = await updateAsset(asset._id, {
      name,
      category,
      initialValue: initVal,
      currentValue: currVal,
      location,
      description,
      isMortgaged,
      mortgageDetails: isMortgaged
        ? {
            provider,
            mortgageAmount: parseFloat(mortgageAmount) || 0,
            currentPrincipal: parseFloat(currentPrincipal) || parseFloat(mortgageAmount) || 0,
            startDate,
            validPeriodMonths: parseInt(validPeriodMonths, 10) || 12,
            interestRate: parseFloat(interestRate) || 0,
            rateType,
          }
        : undefined,
    });

    setLoading(false);
    if (res.success) {
      onClose();
    } else {
      setError(res.error || "Failed to update asset");
    }
  };

  if (!asset) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto custom-scrollbar bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/10 p-6 sm:p-8 rounded-[2rem] shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-emerald-500" /> Edit Asset
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
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                Asset Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 22K Gold Ring (2.7g)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                Location / Custodian
              </label>
              <input
                type="text"
                placeholder="e.g. Safe at Home / Maharage"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                Acquired / Bought Value ({asset.currency || "LKR"}) *
              </label>
              <input
                type="number"
                step="any"
                required
                placeholder="e.g. 50000"
                value={initialValue}
                onChange={(e) => setInitialValue(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                Current Market Value ({asset.currency || "LKR"}) *
              </label>
              <input
                type="number"
                step="any"
                required
                placeholder="e.g. 110000"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-200 dark:border-white/5">
            <label className="flex items-center gap-3 cursor-pointer p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-500/5 border border-amber-500/20 hover:border-amber-500/40 transition-all">
              <input
                type="checkbox"
                checked={isMortgaged}
                onChange={(e) => setIsMortgaged(e.target.checked)}
                className="w-5 h-5 rounded text-amber-500 focus:ring-amber-500"
              />
              <div className="flex-1">
                <p className="font-black text-sm text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-500" /> Item is Mortgaged / Pawned as Loan Collateral
                </p>
                <p className="text-xs text-amber-700/80 dark:text-amber-400/80 font-medium">
                  Track pawn broker, loan principal, and monthly interest accumulation.
                </p>
              </div>
            </label>
          </div>

          {isMortgaged && (
            <div className="bg-amber-50/80 dark:bg-amber-500/10 p-5 rounded-2xl border border-amber-500/30 space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-amber-800 dark:text-amber-300">
                Mortgage / Pawn Agreement Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-1">
                    Broker / Provider Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Maharage Gold Loans"
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-amber-300 dark:border-amber-500/30 text-zinc-900 dark:text-white font-bold text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-1">
                    Original Principal ({asset.currency || "LKR"})
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 70000"
                    value={mortgageAmount}
                    onChange={(e) => setMortgageAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-amber-300 dark:border-amber-500/30 text-zinc-900 dark:text-white font-bold text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-1">
                    Outstanding Principal ({asset.currency || "LKR"})
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 61680"
                    value={currentPrincipal}
                    onChange={(e) => setCurrentPrincipal(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-amber-300 dark:border-amber-500/30 text-zinc-900 dark:text-white font-bold text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-amber-300 dark:border-amber-500/30 text-zinc-900 dark:text-white font-bold text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-1">
                    Valid Period (Months)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 12"
                    value={validPeriodMonths}
                    onChange={(e) => setValidPeriodMonths(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-amber-300 dark:border-amber-500/30 text-zinc-900 dark:text-white font-bold text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-1">
                    Rate Calculation Basis
                  </label>
                  <select
                    value={rateType}
                    onChange={(e) => setRateType(e.target.value as "MONTHLY" | "YEARLY")}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-amber-300 dark:border-amber-500/30 text-zinc-900 dark:text-white font-bold text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="MONTHLY">Monthly Interest Rate (%)</option>
                    <option value="YEARLY">Yearly Interest Rate (%)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-1">
                    Interest Rate ({rateType === "MONTHLY" ? "% / month" : "% / year"})
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder={rateType === "MONTHLY" ? "e.g. 2.4" : "e.g. 28.8"}
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-amber-300 dark:border-amber-500/30 text-zinc-900 dark:text-white font-bold text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
              Notes & Description
            </label>
            <textarea
              rows={2}
              placeholder="Any extra details, specs..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl font-black text-xs bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
