"use client";

import { useState, useMemo } from "react";
import {
  Gem,
  ShieldCheck,
  ShieldAlert,
  PieChart,
  Filter,
  Sparkles,
  History,
  CheckCircle2,
  Pencil,
  Trash2,
  Check,
  Loader2,
  ChevronDown,
} from "lucide-react";
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
      <div className="bg-white dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/10 rounded-[2.5rem] p-6 sm:p-8 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: KPIs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#987B5E]/10 text-[#987B5E] dark:text-[#D4B48A] font-bold text-xs border border-[#987B5E]/20">
                <Sparkles className="w-3.5 h-3.5" /> Standalone Asset Holdings
              </div>

              {settledArchive.length > 0 && (
                <Dialog open={archiveModalOpen} onOpenChange={setArchiveModalOpen}>
                  <DialogTrigger
                    render={
                      <button
                        type="button"
                        className="px-3.5 py-1.5 rounded-full bg-[#FAF8F3] hover:bg-white dark:bg-[#202420] dark:hover:bg-[#272D27] text-[#1A1D1A] dark:text-[#EBE8E3] font-bold text-xs border border-[#E8E2D8] dark:border-white/10 transition-all flex items-center gap-1.5 shadow-sm"
                      />
                    }
                  >
                    <History className="w-3.5 h-3.5 text-[#987B5E]" /> Settled Mortgages Archive ({settledArchive.length})
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-2xl bg-[#FDFBF7] dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/10 p-6 sm:p-8 rounded-[2rem] shadow-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-black tracking-tight text-[#1A1D1A] dark:text-[#EBE8E3] flex items-center gap-2 font-heading">
                        <CheckCircle2 className="w-6 h-6 text-[#213F33] dark:text-[#4E6C5F]" /> Settled Mortgages Archive
                      </DialogTitle>
                    </DialogHeader>

                    <p className="text-xs text-[#6C5B4C] dark:text-[#9A9EA4] font-medium">
                      Historical ledger of all loans you successfully recovered and paid off.
                    </p>

                    <div className="space-y-4 mt-4 max-h-[65vh] overflow-y-auto custom-scrollbar pr-1">
                      {settledArchive.map((arc: any, aIdx: number) => {
                        const arcCurr = arc.assetCurrency || summary.baseCurrency;
                        return (
                          <div key={arc._id || aIdx} className="p-5 rounded-2xl bg-white dark:bg-[#202420] border border-[#E8E2D8] dark:border-white/10 space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#213F33]/10 text-[#213F33] dark:text-[#4E6C5F] border border-[#213F33]/20">
                                  {arc.assetCategory} • SETTLED
                                </span>
                                <h4 className="text-base font-bold text-[#1A1D1A] dark:text-[#EBE8E3] mt-1 font-heading">
                                  {arc.assetName}
                                </h4>
                                <p className="text-xs font-bold text-[#987B5E]">
                                  Provider: {arc.provider || "Pawn Broker"}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-[#6C5B4C] dark:text-[#9A9EA4] font-medium">Original Borrowed</p>
                                <p className="text-base font-black text-[#1A1D1A] dark:text-[#EBE8E3] font-heading">
                                  {formatCurrency(arc.mortgageAmount || 0, arcCurr)}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-[#FAF8F3] dark:bg-[#181B18] rounded-xl border border-[#E8E2D8] dark:border-white/5 text-xs">
                              <div>
                                <span className="text-[#6C5B4C] dark:text-[#9A9EA4] text-[10px] uppercase font-bold">Total Interest Paid</span>
                                <p className="font-black text-[#987B5E] dark:text-[#D4B48A]">
                                  {formatCurrency(arc.totalInterestPaid || 0, arcCurr)}
                                </p>
                              </div>
                              <div>
                                <span className="text-[#6C5B4C] dark:text-[#9A9EA4] text-[10px] uppercase font-bold">Total Principal Cleared</span>
                                <p className="font-black text-[#213F33] dark:text-[#4E6C5F]">
                                  {formatCurrency(arc.totalPrincipalPaid || 0, arcCurr)}
                                </p>
                              </div>
                              <div className="col-span-2 sm:col-span-1">
                                <span className="text-[#6C5B4C] dark:text-[#9A9EA4] text-[10px] uppercase font-bold">Settled On</span>
                                <p className="font-bold text-[#1A1D1A] dark:text-[#EBE8E3]">
                                  {arc.settledDate
                                    ? new Date(arc.settledDate).toLocaleDateString()
                                    : arc.lastPaymentDate
                                    ? new Date(arc.lastPaymentDate).toLocaleDateString()
                                    : "Past"}
                                </p>
                              </div>
                            </div>

                            {arc.payments && arc.payments.length > 0 && (
                              <div className="space-y-2 pt-2 border-t border-[#E8E2D8] dark:border-white/5">
                                <p className="text-[11px] font-bold text-[#6C5B4C] dark:text-[#9A9EA4] uppercase tracking-wider">
                                  Recovery Installment Log ({arc.payments.length})
                                </p>
                                <div className="space-y-2">
                                  {arc.payments.map((p: any, pIdx: number) => {
                                    const key = `${arc.assetId}-${arc.historyIndex}-${pIdx}`;
                                    const isEdit = editingArchiveKey === key;
                                    return (
                                      <div key={pIdx} className="p-3 rounded-xl bg-white dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/5 text-xs space-y-1.5">
                                        {isEdit ? (
                                          <div className="space-y-2">
                                            <div className="grid grid-cols-2 gap-2">
                                              <div>
                                                <label className="block text-[10px] font-bold text-[#6C5B4C]">Date</label>
                                                <input
                                                  type="date"
                                                  value={editDate}
                                                  onChange={(e) => setEditDate(e.target.value)}
                                                  className="w-full px-2 py-1 rounded bg-[#FAF8F3] dark:bg-[#202420] border text-xs font-bold"
                                                />
                                              </div>
                                              <div>
                                                <label className="block text-[10px] font-bold text-[#6C5B4C]">Paid Amount</label>
                                                <input
                                                  type="number"
                                                  step="any"
                                                  value={editAmt}
                                                  onChange={(e) => setEditAmt(e.target.value)}
                                                  className="w-full px-2 py-1 rounded bg-[#FAF8F3] dark:bg-[#202420] border text-xs font-bold"
                                                />
                                              </div>
                                              <div>
                                                <label className="block text-[10px] font-bold text-[#987B5E]">Interest</label>
                                                <input
                                                  type="number"
                                                  step="any"
                                                  value={editInt}
                                                  onChange={(e) => setEditInt(e.target.value)}
                                                  className="w-full px-2 py-1 rounded bg-[#FAF8F3] dark:bg-[#202420] border text-xs font-bold"
                                                />
                                              </div>
                                              <div>
                                                <label className="block text-[10px] font-bold text-[#213F33] dark:text-[#4E6C5F]">Principal</label>
                                                <input
                                                  type="number"
                                                  step="any"
                                                  value={editPrinc}
                                                  onChange={(e) => setEditPrinc(e.target.value)}
                                                  className="w-full px-2 py-1 rounded bg-[#FAF8F3] dark:bg-[#202420] border text-xs font-bold"
                                                />
                                              </div>
                                            </div>
                                            <div className="flex justify-end gap-2">
                                              <button
                                                type="button"
                                                onClick={() => setEditingArchiveKey(null)}
                                                className="px-2.5 py-1 text-xs text-[#6C5B4C]"
                                              >
                                                Cancel
                                              </button>
                                              <button
                                                type="button"
                                                disabled={isUpdatingArchiveLog}
                                                onClick={() => handleSaveArchiveLogEdit(arc.assetId, arc.historyIndex, pIdx)}
                                                className="px-3 py-1 btn-tria-primary text-white font-bold rounded flex items-center gap-1"
                                              >
                                                {isUpdatingArchiveLog ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Save
                                              </button>
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="flex items-center justify-between font-bold">
                                            <span className="text-[#6C5B4C] dark:text-[#9A9EA4]">
                                              {new Date(p.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                                            </span>
                                            <div className="flex items-center gap-3">
                                              <span className="text-[#1A1D1A] dark:text-[#EBE8E3]">
                                                Paid {formatCurrency(p.amount, arcCurr)}
                                              </span>
                                              <span className="text-[#987B5E] text-[11px]">
                                                (Int: {formatCurrency(p.interestPortion, arcCurr)})
                                              </span>
                                              <span className="text-[#213F33] dark:text-[#4E6C5F] text-[11px]">
                                                (Princ: {formatCurrency(p.principalPortion, arcCurr)})
                                              </span>
                                              <div className="flex items-center gap-1 pl-2 border-l border-[#E8E2D8] dark:border-white/10">
                                                <button
                                                  type="button"
                                                  onClick={() => startEditArchiveLog(p, arc.assetId, arc.historyIndex, pIdx)}
                                                  className="text-[#6C5B4C] hover:text-[#1A1D1A] dark:hover:text-white"
                                                >
                                                  <Pencil className="w-3 h-3" />
                                                </button>
                                                <button
                                                  type="button"
                                                  disabled={isUpdatingArchiveLog}
                                                  onClick={() => handleDeleteArchiveLog(arc.assetId, arc.historyIndex, pIdx)}
                                                  className="text-[#6C5B4C] hover:text-rose-500"
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
              <p className="text-xs font-black uppercase tracking-widest text-[#6C5B4C] dark:text-[#9A9EA4] mb-1">
                Total Available Asset Equity (Unmortgaged)
              </p>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#1A1D1A] dark:text-[#EBE8E3] leading-none font-heading">
                {formatCurrency(summary.totalUnmortgagedWealth, summary.baseCurrency)}
              </h2>
              <p className="text-xs text-[#6C5B4C] dark:text-[#9A9EA4] mt-2 font-medium">
                Calculated purely from unencumbered items. Does not mix with overview or wallet net worth.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#E8E2D8] dark:border-white/5">
              <div className="bg-[#FAF8F3] dark:bg-[#202420] p-4 rounded-2xl border border-[#E8E2D8] dark:border-white/5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#6C5B4C] dark:text-[#9A9EA4] mb-1">
                  <Gem className="w-3.5 h-3.5 text-[#987B5E]" />
                  <span>Total Portfolio Value</span>
                </div>
                <p className="text-xl font-black text-[#1A1D1A] dark:text-[#EBE8E3] font-heading">
                  {formatCurrency(summary.totalPortfolioValue, summary.baseCurrency)}
                </p>
                <p className="text-[10px] text-[#6C5B4C] dark:text-[#9A9EA4] font-bold mt-0.5">
                  Gross estimated market value
                </p>
              </div>

              <div className="bg-[#FAF8F3] dark:bg-[#202420] p-4 rounded-2xl border border-[#987B5E]/30">
                <div className="flex items-center gap-2 text-xs font-bold text-[#987B5E] mb-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#987B5E]" />
                  <span>Outstanding Principal Loans</span>
                </div>
                <p className="text-xl font-black text-[#7A6652] dark:text-[#D4B48A] font-heading">
                  {formatCurrency(summary.totalMortgageLiabilities, summary.baseCurrency)}
                </p>
                <p className="text-[10px] text-[#6C5B4C] dark:text-[#9A9EA4] font-bold mt-0.5">
                  Remaining principal owed on pawned items
                </p>
              </div>
            </div>
          </div>

          {/* Right: Asset Donut Chart */}
          <div className="lg:col-span-5 flex flex-col items-center bg-[#FAF8F3] dark:bg-[#202420] p-5 rounded-[2rem] border border-[#E8E2D8] dark:border-white/5 h-full min-h-[340px] justify-between">
            <div className="w-full flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6C5B4C] dark:text-[#9A9EA4] flex items-center gap-1.5">
                <PieChart className="w-3.5 h-3.5 text-[#987B5E]" /> Distribution
              </span>

              <div className="flex bg-white dark:bg-[#181B18] p-1 rounded-xl border border-[#E8E2D8] dark:border-white/10 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setChartMode("UNMORTGAGED")}
                  className={cn(
                    "px-2.5 py-1 rounded-lg transition-all font-black",
                    chartMode === "UNMORTGAGED"
                      ? "btn-tria-primary text-[#FDFBF7] dark:text-[#EBE8E3] shadow-sm"
                      : "text-[#6C5B4C] hover:text-[#1A1D1A] dark:text-[#9A9EA4] dark:hover:text-white"
                  )}
                >
                  Unmortgaged
                </button>
                <button
                  type="button"
                  onClick={() => setChartMode("TOTAL")}
                  className={cn(
                    "px-2.5 py-1 rounded-lg transition-all font-black",
                    chartMode === "TOTAL"
                      ? "btn-tria-primary text-[#FDFBF7] dark:text-[#EBE8E3] shadow-sm"
                      : "text-[#6C5B4C] hover:text-[#1A1D1A] dark:text-[#9A9EA4] dark:hover:text-white"
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
        {/* MOBILE VIEW (< sm) */}
        <div className="flex sm:hidden items-center gap-2">
          <Dialog open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
            <DialogTrigger
              render={
                <button
                  type="button"
                  className="flex-1 flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold bg-white dark:bg-[#181B18] text-[#1A1D1A] dark:text-[#EBE8E3] border border-[#E8E2D8] dark:border-white/10 shadow-sm"
                />
              }
            >
              <div className="flex items-center gap-2 truncate">
                <Filter className="w-4 h-4 text-[#987B5E] shrink-0" />
                <span className="truncate">
                  Filter: <strong className="text-[#213F33] dark:text-[#D4B48A]">{FILTER_ITEMS.find(f => f.id === filterMode)?.label || "All Assets"}</strong>
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-[#9A9EA4] shrink-0 ml-1" />
            </DialogTrigger>

            <DialogContent className="sm:max-w-md bg-[#FDFBF7] dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/10 p-6 rounded-[2rem] shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-black tracking-tight text-[#1A1D1A] dark:text-[#EBE8E3] flex items-center gap-2 font-heading">
                  <Filter className="w-5 h-5 text-[#987B5E]" /> Filter & Categorize Assets
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
                          ? "bg-[#213F33]/10 text-[#213F33] dark:text-[#EBE8E3] border-[#213F33]/30 dark:border-[#385A4D]/40 font-black shadow-sm"
                          : "bg-[#FAF8F3] dark:bg-[#202420] text-[#6C5B4C] dark:text-[#9A9EA4] border-[#E8E2D8] dark:border-white/5 hover:bg-[#EFE9E0] dark:hover:bg-[#272D27]"
                      )}
                    >
                      <span>{item.label}</span>
                      {isActive && <Check className="w-4 h-4 text-[#D4B48A]" />}
                    </button>
                  );
                })}
              </div>
            </DialogContent>
          </Dialog>

          <CreateAssetForm firebaseUid={user.firebaseUid} baseCurrency={summary.baseCurrency} />
        </div>

        {/* DESKTOP & TABLET VIEW (>= sm) */}
        <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto hide-scrollbar p-1.5 bg-white dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/10 rounded-2xl shadow-sm">
          {FILTER_ITEMS.map((item) => {
            const isActive = filterMode === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setFilterMode(item.id)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 whitespace-nowrap relative",
                  isActive
                    ? "text-[#FDFBF7] dark:text-[#EBE8E3] shadow-md font-black"
                    : "text-[#6C5B4C] hover:text-[#1A1D1A] dark:text-[#9A9EA4] dark:hover:text-white hover:bg-[#FAF8F3] dark:hover:bg-[#202420]"
                )}
              >
                {isActive && (
                  <clientMotion.div
                    layoutId="activeAssetFilter"
                    className="absolute inset-0 bg-gradient-to-r from-[#2B493D] to-[#213F33] dark:from-[#4E6C5F] dark:to-[#385A4D] rounded-xl"
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
        <div className="bg-white dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/10 rounded-[2.5rem] p-12 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-[#FAF8F3] dark:bg-[#202420] flex items-center justify-center text-[#987B5E]">
            <Gem className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-[#1A1D1A] dark:text-[#EBE8E3] font-heading">No assets found</h3>
          <p className="text-sm text-[#6C5B4C] dark:text-[#9A9EA4] max-w-sm font-medium">
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
