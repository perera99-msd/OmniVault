"use client";

import { useState, useMemo } from "react";
import {
  Gem,
  ShieldCheck,
  ShieldAlert,
  PieChart,
  Filter,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  History,
  CheckCircle2,
  Calendar,
  Pencil,
  Trash2,
  Check,
  Loader2,
  ChevronDown,
} from "lucide-react";
import * as motion from "framer-motion/client";
import { motion as clientMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/currency";
import { AssetDonutChart } from "@/components/assets/AssetDonutChart";
import { AssetCard } from "@/components/assets/AssetCard";
import { CreateAssetForm } from "@/components/forms/CreateAssetForm";
import { EditAssetForm } from "@/components/forms/EditAssetForm";
import { editMortgagePayment, deleteMortgagePayment } from "@/actions/assets";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const FILTER_ITEMS = [
  { id: "ALL", label: "All Assets" },
  { id: "UNMORTGAGED", label: "Unmortgaged" },
  { id: "MORTGAGED", label: "Mortgaged" },
  { id: "GOLD", label: "Gold & Jewelry" },
  { id: "REAL_ESTATE", label: "Real Estate" },
  { id: "BUSINESS", label: "Business" },
  { id: "VEHICLE", label: "Vehicles" },
];

interface AssetsClientProps {
  assetsData: {
    user: any;
    assets: any[];
    settledArchive?: any[];
    summary: {
      baseCurrency: string;
      totalUnmortgagedWealth: number;
      totalPortfolioValue: number;
      totalMortgageLiabilities: number;
      totalMortgagePaid: number;
    };
    categoryBreakdown: any[];
  };
  currencySymbol: string;
}

export function AssetsClient({ assetsData, currencySymbol }: AssetsClientProps) {
  const { user, assets, settledArchive = [], summary, categoryBreakdown } = assetsData;

  const [filterMode, setFilterMode] = useState<string>("ALL");
  const [chartMode, setChartMode] = useState<"UNMORTGAGED" | "TOTAL">("UNMORTGAGED");
  const [editingAsset, setEditingAsset] = useState<any | null>(null);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Archive payment edit states
  const [editingArchiveKey, setEditingArchiveKey] = useState<string | null>(null);
  const [editAmt, setEditAmt] = useState("");
  const [editInt, setEditInt] = useState("");
  const [editPrinc, setEditPrinc] = useState("");
  const [editDate, setEditDate] = useState("");
  const [isUpdatingArchiveLog, setIsUpdatingArchiveLog] = useState(false);

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      if (filterMode === "UNMORTGAGED") return !asset.isMortgaged;
      if (filterMode === "MORTGAGED") return !!asset.isMortgaged;
      if (["GOLD", "REAL_ESTATE", "BUSINESS", "VEHICLE", "OTHER"].includes(filterMode)) {
        return asset.category === filterMode;
      }
      return true;
    });
  }, [assets, filterMode]);

  const startEditArchiveLog = (p: any, assetId: string, hIdx: number, pIdx: number) => {
    setEditingArchiveKey(`${assetId}-${hIdx}-${pIdx}`);
    setEditAmt(String(p.amount));
    setEditInt(String(p.interestPortion));
    setEditPrinc(String(p.principalPortion));
    setEditDate(new Date(p.date).toISOString().split("T")[0]);
  };

  const handleSaveArchiveLogEdit = async (assetId: string, hIdx: number, pIdx: number) => {
    setIsUpdatingArchiveLog(true);
    await editMortgagePayment(
      assetId,
      pIdx,
      {
        amount: parseFloat(editAmt) || 0,
        interestPortion: parseFloat(editInt) || 0,
        principalPortion: parseFloat(editPrinc) || 0,
        date: editDate,
      },
      true,
      hIdx
    );
    setIsUpdatingArchiveLog(false);
    setEditingArchiveKey(null);
  };

  const handleDeleteArchiveLog = async (assetId: string, hIdx: number, pIdx: number) => {
    if (!confirm("Remove this payment log from archived mortgage?")) return;
    setIsUpdatingArchiveLog(true);
    await deleteMortgagePayment(assetId, pIdx, true, hIdx);
    setIsUpdatingArchiveLog(false);
  };

  return (
    <div className="space-y-8">
      {/* Top Asset Wealth Overview Card */}
      <div className="bg-white dark:bg-[#121214] border border-zinc-200/80 dark:border-white/10 rounded-[2.5rem] p-6 sm:p-8 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: KPIs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs border border-emerald-500/20">
                <Sparkles className="w-3.5 h-3.5" /> Standalone Asset Wealth
              </div>

              {settledArchive.length > 0 && (
                <Dialog open={archiveModalOpen} onOpenChange={setArchiveModalOpen}>
                  <DialogTrigger
                    render={
                      <button
                        type="button"
                        className="px-3.5 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs border border-zinc-300 dark:border-white/10 transition-all flex items-center gap-1.5 shadow-sm"
                      />
                    }
                  >
                    <History className="w-3.5 h-3.5 text-amber-500" /> Settled Mortgages Archive ({settledArchive.length})
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-2xl bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/10 p-6 sm:p-8 rounded-[2rem] shadow-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" /> Settled & Completed Mortgages Archive
                      </DialogTitle>
                    </DialogHeader>

                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                      Historical ledger of all loans you successfully recovered and paid off. You can review or edit past installments anytime.
                    </p>

                    <div className="space-y-4 mt-4 max-h-[65vh] overflow-y-auto custom-scrollbar pr-1">
                      {settledArchive.map((arc: any, aIdx: number) => {
                        const arcCurr = arc.assetCurrency || summary.baseCurrency;
                        return (
                          <div key={arc._id || aIdx} className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-white/10 space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                  {arc.assetCategory} • SETTLED
                                </span>
                                <h4 className="text-base font-bold text-zinc-900 dark:text-white mt-1">
                                  {arc.assetName}
                                </h4>
                                <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                                  Provider: {arc.provider || "Pawn Broker"}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-zinc-400 font-medium">Original Borrowed</p>
                                <p className="text-base font-black text-zinc-900 dark:text-white">
                                  {formatCurrency(arc.mortgageAmount || 0, arcCurr)}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/50 dark:border-white/5 text-xs">
                              <div>
                                <span className="text-zinc-400 text-[10px] uppercase font-bold">Total Interest Paid</span>
                                <p className="font-black text-amber-600 dark:text-amber-400">
                                  {formatCurrency(arc.totalInterestPaid || 0, arcCurr)}
                                </p>
                              </div>
                              <div>
                                <span className="text-zinc-400 text-[10px] uppercase font-bold">Total Principal Cleared</span>
                                <p className="font-black text-emerald-600 dark:text-emerald-400">
                                  {formatCurrency(arc.totalPrincipalPaid || 0, arcCurr)}
                                </p>
                              </div>
                              <div className="col-span-2 sm:col-span-1">
                                <span className="text-zinc-400 text-[10px] uppercase font-bold">Settled On</span>
                                <p className="font-bold text-zinc-700 dark:text-zinc-300">
                                  {arc.settledDate
                                    ? new Date(arc.settledDate).toLocaleDateString()
                                    : arc.lastPaymentDate
                                    ? new Date(arc.lastPaymentDate).toLocaleDateString()
                                    : "Past"}
                                </p>
                              </div>
                            </div>

                            {/* Collapsible/List timeline */}
                            {arc.payments && arc.payments.length > 0 && (
                              <div className="space-y-2 pt-2 border-t border-zinc-200/60 dark:border-white/5">
                                <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                                  Recovery Installment Log ({arc.payments.length})
                                </p>
                                <div className="space-y-2">
                                  {arc.payments.map((p: any, pIdx: number) => {
                                    const key = `${arc.assetId}-${arc.historyIndex}-${pIdx}`;
                                    const isEdit = editingArchiveKey === key;
                                    return (
                                      <div key={pIdx} className="p-3 rounded-xl bg-white dark:bg-zinc-900/80 border border-zinc-200/50 dark:border-white/5 text-xs space-y-1.5">
                                        {isEdit ? (
                                          <div className="space-y-2">
                                            <div className="grid grid-cols-2 gap-2">
                                              <div>
                                                <label className="block text-[10px] font-bold text-zinc-400">Date</label>
                                                <input
                                                  type="date"
                                                  value={editDate}
                                                  onChange={(e) => setEditDate(e.target.value)}
                                                  className="w-full px-2 py-1 rounded bg-zinc-50 dark:bg-zinc-800 border text-xs font-bold"
                                                />
                                              </div>
                                              <div>
                                                <label className="block text-[10px] font-bold text-zinc-400">Paid Amount</label>
                                                <input
                                                  type="number"
                                                  step="any"
                                                  value={editAmt}
                                                  onChange={(e) => setEditAmt(e.target.value)}
                                                  className="w-full px-2 py-1 rounded bg-zinc-50 dark:bg-zinc-800 border text-xs font-bold"
                                                />
                                              </div>
                                              <div>
                                                <label className="block text-[10px] font-bold text-amber-500">Interest</label>
                                                <input
                                                  type="number"
                                                  step="any"
                                                  value={editInt}
                                                  onChange={(e) => setEditInt(e.target.value)}
                                                  className="w-full px-2 py-1 rounded bg-zinc-50 dark:bg-zinc-800 border text-xs font-bold"
                                                />
                                              </div>
                                              <div>
                                                <label className="block text-[10px] font-bold text-emerald-500">Principal</label>
                                                <input
                                                  type="number"
                                                  step="any"
                                                  value={editPrinc}
                                                  onChange={(e) => setEditPrinc(e.target.value)}
                                                  className="w-full px-2 py-1 rounded bg-zinc-50 dark:bg-zinc-800 border text-xs font-bold"
                                                />
                                              </div>
                                            </div>
                                            <div className="flex justify-end gap-2">
                                              <button
                                                type="button"
                                                onClick={() => setEditingArchiveKey(null)}
                                                className="px-2.5 py-1 text-xs text-zinc-400"
                                              >
                                                Cancel
                                              </button>
                                              <button
                                                type="button"
                                                disabled={isUpdatingArchiveLog}
                                                onClick={() => handleSaveArchiveLogEdit(arc.assetId, arc.historyIndex, pIdx)}
                                                className="px-3 py-1 bg-emerald-500 text-white font-bold rounded flex items-center gap-1"
                                              >
                                                {isUpdatingArchiveLog ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Save
                                              </button>
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="flex items-center justify-between font-bold">
                                            <span className="text-zinc-500">
                                              {new Date(p.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                                            </span>
                                            <div className="flex items-center gap-3">
                                              <span className="text-zinc-900 dark:text-white">
                                                Paid {formatCurrency(p.amount, arcCurr)}
                                              </span>
                                              <span className="text-amber-600 dark:text-amber-400 text-[11px]">
                                                (Int: {formatCurrency(p.interestPortion, arcCurr)})
                                              </span>
                                              <span className="text-emerald-600 dark:text-emerald-400 text-[11px]">
                                                (Princ: {formatCurrency(p.principalPortion, arcCurr)})
                                              </span>
                                              <div className="flex items-center gap-1 pl-2 border-l border-zinc-200 dark:border-white/10">
                                                <button
                                                  type="button"
                                                  onClick={() => startEditArchiveLog(p, arc.assetId, arc.historyIndex, pIdx)}
                                                  className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                                                >
                                                  <Pencil className="w-3 h-3" />
                                                </button>
                                                <button
                                                  type="button"
                                                  disabled={isUpdatingArchiveLog}
                                                  onClick={() => handleDeleteArchiveLog(arc.assetId, arc.historyIndex, pIdx)}
                                                  className="text-zinc-400 hover:text-rose-500"
                                                >
                                                  <Trash2 className="w-3 h-3" />
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">
                Total Available Asset Equity (Unmortgaged)
              </p>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-900 dark:text-white leading-none">
                {formatCurrency(summary.totalUnmortgagedWealth, summary.baseCurrency)}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 font-medium">
                Calculated purely from unencumbered items. Does not mix with overview or wallet net worth.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-100 dark:border-white/5">
              <div className="bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-2xl border border-zinc-200/60 dark:border-white/5">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1">
                  <Gem className="w-3.5 h-3.5 text-blue-500" />
                  <span>Total Portfolio Value</span>
                </div>
                <p className="text-xl font-black text-zinc-900 dark:text-white">
                  {formatCurrency(summary.totalPortfolioValue, summary.baseCurrency)}
                </p>
                <p className="text-[10px] text-zinc-400 font-bold mt-0.5">
                  Gross estimated market value
                </p>
              </div>

              <div className="bg-amber-50/60 dark:bg-amber-500/5 p-4 rounded-2xl border border-amber-500/20">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 mb-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                  <span>Outstanding Principal Loans</span>
                </div>
                <p className="text-xl font-black text-amber-900 dark:text-amber-200">
                  {formatCurrency(summary.totalMortgageLiabilities, summary.baseCurrency)}
                </p>
                <p className="text-[10px] text-amber-600/70 dark:text-amber-400/70 font-bold mt-0.5">
                  Remaining principal owed on pawned items
                </p>
              </div>
            </div>
          </div>

          {/* Right: Asset Donut Chart */}
          <div className="lg:col-span-5 flex flex-col items-center bg-zinc-50/50 dark:bg-zinc-900/30 p-5 rounded-[2rem] border border-zinc-200/60 dark:border-white/5 h-full min-h-[340px] justify-between">
            <div className="w-full flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <PieChart className="w-3.5 h-3.5 text-emerald-500" /> Distribution
              </span>

              <div className="flex bg-white dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200/60 dark:border-white/5 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setChartMode("UNMORTGAGED")}
                  className={cn(
                    "px-2.5 py-1 rounded-lg transition-all",
                    chartMode === "UNMORTGAGED"
                      ? "bg-emerald-500 text-white shadow-sm"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                  )}
                >
                  Unmortgaged
                </button>
                <button
                  type="button"
                  onClick={() => setChartMode("TOTAL")}
                  className={cn(
                    "px-2.5 py-1 rounded-lg transition-all",
                    chartMode === "TOTAL"
                      ? "bg-emerald-500 text-white shadow-sm"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                  )}
                >
                  Total Portfolio
                </button>
              </div>
            </div>

            <div className="w-full flex-1 flex items-center justify-center">
              <AssetDonutChart
                data={categoryBreakdown}
                baseCurrency={summary.baseCurrency}
                mode={chartMode}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar & Action Button */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        {/* MOBILE VIEW (< sm): Sleek Filter Dropdown Button + Action */}
        <div className="flex sm:hidden items-center gap-2">
          <Dialog open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
            <DialogTrigger
              render={
                <button
                  type="button"
                  className="flex-1 flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold bg-white dark:bg-[#121214] text-zinc-900 dark:text-white border border-zinc-200/80 dark:border-white/10 shadow-sm"
                />
              }
            >
              <div className="flex items-center gap-2 truncate">
                <Filter className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="truncate">
                  Filter: <strong className="text-emerald-600 dark:text-emerald-400">{FILTER_ITEMS.find(f => f.id === filterMode)?.label || "All Assets"}</strong>
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0 ml-1" />
            </DialogTrigger>

            <DialogContent className="sm:max-w-md bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/10 p-6 rounded-[2rem] shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
                  <Filter className="w-5 h-5 text-emerald-500" /> Filter & Categorize Assets
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-1 gap-2 mt-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
                {FILTER_ITEMS.map((item) => {
                  const isActive = filterMode === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setFilterMode(item.id);
                        setMobileFilterOpen(false);
                      }}
                      className={cn(
                        "flex items-center justify-between p-3.5 rounded-2xl text-xs font-bold transition-all border",
                        isActive
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-black shadow-sm"
                          : "bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 border-zinc-200/50 dark:border-white/5 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      )}
                    >
                      <span>{item.label}</span>
                      {isActive && <Check className="w-4 h-4 text-emerald-500" />}
                    </button>
                  );
                })}
              </div>
            </DialogContent>
          </Dialog>

          <CreateAssetForm firebaseUid={user.firebaseUid} baseCurrency={summary.baseCurrency} />
        </div>

        {/* DESKTOP & TABLET VIEW (>= sm): Horizontal Pill Bar */}
        <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto hide-scrollbar p-1.5 bg-white dark:bg-[#121214] border border-zinc-200/80 dark:border-white/10 rounded-2xl shadow-sm">
          {FILTER_ITEMS.map((item) => {
            const isActive = filterMode === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setFilterMode(item.id)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 whitespace-nowrap relative",
                  isActive
                    ? "text-white shadow-md"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                )}
              >
                {isActive && (
                  <clientMotion.div
                    layoutId="activeAssetFilter"
                    className="absolute inset-0 bg-emerald-500 dark:bg-emerald-600 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="hidden sm:block">
          <CreateAssetForm firebaseUid={user.firebaseUid} baseCurrency={summary.baseCurrency} />
        </div>
      </div>

      {/* Assets Grid */}
      {filteredAssets.length === 0 ? (
        <div className="bg-white dark:bg-[#121214] border border-zinc-200/80 dark:border-white/10 rounded-[2.5rem] p-12 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
            <Gem className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white">No assets found</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm font-medium">
            No assets match the selected filter. Click "Add Asset" above to log physical or valuable items.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map((asset) => (
            <AssetCard
              key={asset._id}
              asset={asset}
              currencySymbol={currencySymbol}
              onEdit={(a) => setEditingAsset(a)}
            />
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <EditAssetForm
        asset={editingAsset}
        open={!!editingAsset}
        onClose={() => setEditingAsset(null)}
        currencySymbol={currencySymbol}
      />
    </div>
  );
}
