"use client";

import { useState } from "react";
import {
  Coins,
  Building2,
  Store,
  Car,
  Package,
  MapPin,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Calendar,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  DollarSign,
  Loader2,
  History,
  AlertTriangle,
  Info,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/currency";
import {
  deleteAsset,
  recordMortgagePayment,
  editMortgagePayment,
  deleteMortgagePayment,
} from "@/actions/assets";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AssetCardProps {
  asset: any;
  currencySymbol: string;
  onEdit: (asset: any) => void;
}

const CATEGORY_ICONS: Record<string, any> = {
  GOLD: Coins,
  REAL_ESTATE: Building2,
  BUSINESS: Store,
  VEHICLE: Car,
  OTHER: Package,
};

const CATEGORY_STYLES: Record<string, { badge: string; icon: string }> = {
  GOLD: {
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    icon: "text-amber-500",
  },
  REAL_ESTATE: {
    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    icon: "text-emerald-500",
  },
  BUSINESS: {
    badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    icon: "text-blue-500",
  },
  VEHICLE: {
    badge: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    icon: "text-purple-500",
  },
  OTHER: {
    badge: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
    icon: "text-pink-500",
  },
};

export function AssetCard({ asset, currencySymbol, onEdit }: AssetCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [installmentModalOpen, setInstallmentModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  // Payment modal state
  const [paymentAmount, setPaymentAmount] = useState("");
  const [customInterestPortion, setCustomInterestPortion] = useState<string | null>(null);
  const [customPrincipalPortion, setCustomPrincipalPortion] = useState<string | null>(null);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // Edit payment log state
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editAmt, setEditAmt] = useState("");
  const [editInt, setEditInt] = useState("");
  const [editPrinc, setEditPrinc] = useState("");
  const [editDate, setEditDate] = useState("");
  const [isUpdatingLog, setIsUpdatingLog] = useState(false);

  const IconComponent = CATEGORY_ICONS[asset.category] || Package;
  const style = CATEGORY_STYLES[asset.category] || CATEGORY_STYLES.OTHER;
  const assetCurrency = asset.currency || "LKR";

  const initialVal = asset.initialValue || 0;
  const currentVal = asset.currentValue || 0;
  const diff = currentVal - initialVal;
  const pctChange = initialVal > 0 ? ((diff / initialVal) * 100).toFixed(1) : "0";

  // Mortgage calculations
  const isMortgaged = asset.isMortgaged && asset.mortgageDetails;
  const origPrincipal = asset.mortgageDetails?.mortgageAmount || 0;
  const currentPrincipal = asset.mortgageDetails?.currentPrincipal !== undefined
    ? asset.mortgageDetails.currentPrincipal
    : origPrincipal;

  const rateType = asset.mortgageDetails?.rateType || "MONTHLY";
  const rawRate = asset.mortgageDetails?.interestRate ?? asset.mortgageDetails?.interestRateMonthly ?? 0;
  const monthlyRate = rateType === "YEARLY" ? rawRate / 12 : rawRate;

  // Suggested next month interest
  const suggestedNextMonthInterest = currentPrincipal * (monthlyRate / 100);

  // Reference date: last payment date OR start date
  const refDateStr = asset.mortgageDetails?.lastPaymentDate || asset.mortgageDetails?.startDate;
  const refDate = refDateStr ? new Date(refDateStr) : new Date();

  // Next interest calculation date is exactly 1 month after reference date
  const nextCalcDate = new Date(refDate);
  nextCalcDate.setMonth(nextCalcDate.getMonth() + 1);

  const now = new Date();
  const diffTime = nextCalcDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isOverdue = daysRemaining < 0;
  const overdueDays = Math.abs(daysRemaining);

  const cyclesElapsed = isOverdue ? Math.max(1, Math.ceil(overdueDays / 30) + 1) : 1;
  const targetInterest = suggestedNextMonthInterest * cyclesElapsed;

  const totalInterestPaid = asset.mortgageDetails?.totalInterestPaid || 0;
  const totalPrincipalPaid = asset.mortgageDetails?.totalPrincipalPaid || 0;
  const payments = asset.mortgageDetails?.payments || [];

  // Live calculation for modal preview
  const typedPayAmt = parseFloat(paymentAmount) || 0;
  const autoInterest = Math.min(typedPayAmt, targetInterest);
  const autoPrincipal = Math.max(0, typedPayAmt - autoInterest);

  const activeInterestPortion = customInterestPortion !== null ? (parseFloat(customInterestPortion) || 0) : autoInterest;
  const activePrincipalPortion = customPrincipalPortion !== null ? (parseFloat(customPrincipalPortion) || 0) : autoPrincipal;
  const projectedNewPrincipal = Math.max(0, currentPrincipal - activePrincipalPortion);
  const projectedNextMonthInterest = projectedNewPrincipal * (monthlyRate / 100);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to remove "${asset.name}"?`)) return;
    setIsDeleting(true);
    await deleteAsset(asset._id);
    setIsDeleting(false);
  };

  const handlePayInstallment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (typedPayAmt <= 0) return;

    setIsSubmittingPayment(true);
    await recordMortgagePayment(asset._id, {
      amount: typedPayAmt,
      interestPortion: activeInterestPortion,
      principalPortion: activePrincipalPortion,
    });
    setIsSubmittingPayment(false);
    setInstallmentModalOpen(false);
    setPaymentAmount("");
    setCustomInterestPortion(null);
    setCustomPrincipalPortion(null);
  };

  const startEditLog = (p: any, idx: number) => {
    setEditingIndex(idx);
    setEditAmt(String(p.amount));
    setEditInt(String(p.interestPortion));
    setEditPrinc(String(p.principalPortion));
    setEditDate(new Date(p.date).toISOString().split("T")[0]);
  };

  const handleSaveLogEdit = async (idx: number) => {
    setIsUpdatingLog(true);
    await editMortgagePayment(asset._id, idx, {
      amount: parseFloat(editAmt) || 0,
      interestPortion: parseFloat(editInt) || 0,
      principalPortion: parseFloat(editPrinc) || 0,
      date: editDate,
    });
    setIsUpdatingLog(false);
    setEditingIndex(null);
  };

  const handleDeleteLog = async (idx: number) => {
    if (!confirm("Remove this installment record?")) return;
    setIsUpdatingLog(true);
    await deleteMortgagePayment(asset._id, idx);
    setIsUpdatingLog(false);
  };

  return (
    <div className="group relative bg-white dark:bg-[#121214] rounded-[2rem] border border-zinc-200/80 dark:border-white/10 p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/5 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/10 transition-all duration-500" />

      <div>
        {/* Header: Category Badge & Actions */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className={cn("px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border flex items-center gap-1.5", style.badge)}>
              <IconComponent className="w-3.5 h-3.5" />
              {asset.category.replace("_", " ")}
            </span>
            {isMortgaged && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-amber-500" />
                Mortgaged
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(asset)}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              title="Edit Asset"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 rounded-xl text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all"
              title="Delete Asset"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title & Location */}
        <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white mb-1.5 line-clamp-1">
          {asset.name}
        </h3>

        {(asset.location || isMortgaged) && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-4">
            <MapPin className={cn("w-3.5 h-3.5 shrink-0", isMortgaged ? "text-amber-500" : "text-zinc-400")} />
            <span className="truncate">
              {isMortgaged
                ? `Mortgaged at: ${asset.mortgageDetails.provider || "Pawn Broker / Lender"}`
                : asset.location}
            </span>
          </div>
        )}

        {/* Valuation Box */}
        <div className="bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl p-4 border border-zinc-200/60 dark:border-white/5 space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-zinc-500 dark:text-zinc-400">Current Market Value</span>
            <span className="font-black text-base text-zinc-900 dark:text-white">
              {formatCurrency(currentVal, assetCurrency)}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-2 border-t border-zinc-200/50 dark:border-white/5">
            <span className="font-medium text-zinc-400">Acquired / Initial Value:</span>
            <span className="font-bold text-zinc-600 dark:text-zinc-300">
              {formatCurrency(initialVal, assetCurrency)}
            </span>
          </div>

          {initialVal > 0 && (
            <div className="flex items-center justify-end gap-1 text-[11px] font-black">
              {diff >= 0 ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> +{formatCurrency(diff, assetCurrency)} (+{pctChange}%)
                </span>
              ) : (
                <span className="text-rose-600 dark:text-rose-400 flex items-center gap-0.5">
                  <TrendingDown className="w-3 h-3" /> -{formatCurrency(Math.abs(diff), assetCurrency)} ({pctChange}%)
                </span>
              )}
            </div>
          )}
        </div>

        {/* Mortgage & Redemption Box */}
        {isMortgaged && (
          <div className="bg-amber-50/70 dark:bg-amber-500/5 border border-amber-500/30 rounded-2xl p-4 space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">
                  {asset.mortgageDetails.provider || "Mortgage Active"}
                </span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-md border border-amber-500/20">
                {rawRate}% / {rateType === "YEARLY" ? "Year" : "Month"}
              </span>
            </div>

            <div className={cn("flex items-center justify-between p-2 rounded-xl text-[11px] font-bold border", isOverdue ? "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400" : "bg-amber-500/10 border-amber-500/20 text-amber-900 dark:text-amber-200")}>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span>Next Interest Day: <strong>{nextCalcDate.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</strong></span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded">
                {isOverdue ? `${overdueDays}D Overdue!` : daysRemaining === 0 ? "Due Today!" : `In ${daysRemaining} Days`}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div>
                <p className="text-[10px] uppercase font-bold text-amber-600/70 dark:text-amber-400/70">Current Principal</p>
                <p className="font-black text-amber-950 dark:text-amber-200 text-sm">
                  {formatCurrency(currentPrincipal, assetCurrency)}
                </p>
                {currentPrincipal < origPrincipal && (
                  <p className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                    Orig: {formatCurrency(origPrincipal, assetCurrency)}
                  </p>
                )}
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-amber-600/70 dark:text-amber-400/70">Next Month Interest</p>
                <p className="font-black text-amber-950 dark:text-amber-200 text-sm">
                  {formatCurrency(suggestedNextMonthInterest, assetCurrency)}
                </p>
                <p className="text-[9px] font-bold text-amber-600/80">
                  ({monthlyRate.toFixed(2)}% of balance)
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-amber-600/70 dark:text-amber-400/70">Total Interest Paid</p>
                <p className="font-black text-amber-900 dark:text-amber-200">
                  {formatCurrency(totalInterestPaid, assetCurrency)}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-amber-600/70 dark:text-amber-400/70">Principal Cleared</p>
                <p className="font-black text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(totalPrincipalPaid, assetCurrency)}
                </p>
              </div>
            </div>

            <div className="pt-2.5 border-t border-amber-500/20 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {payments.length > 0 && (
                  <Dialog open={historyModalOpen} onOpenChange={setHistoryModalOpen}>
                    <DialogTrigger
                      render={
                        <button
                          type="button"
                          className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold text-[11px] rounded-xl transition-all flex items-center gap-1"
                        />
                      }
                    >
                      <History className="w-3.5 h-3.5" /> {payments.length} Payments
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-xl bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/10 p-6 rounded-[2rem] shadow-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
                          <History className="w-5 h-5 text-amber-500" /> Active Mortgage Timeline Log
                        </DialogTitle>
                      </DialogHeader>

                      <div className="space-y-3 mt-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
                        {payments.map((p: any, idx: number) => {
                          const isEdit = editingIndex === idx;
                          return (
                            <div key={idx} className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-white/5 space-y-2">
                              {isEdit ? (
                                <div className="space-y-3 text-xs">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-0.5">Date</label>
                                      <input
                                        type="date"
                                        value={editDate}
                                        onChange={(e) => setEditDate(e.target.value)}
                                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-white/10 font-bold text-xs"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-0.5">Total Paid</label>
                                      <input
                                        type="number"
                                        step="any"
                                        value={editAmt}
                                        onChange={(e) => setEditAmt(e.target.value)}
                                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-white/10 font-bold text-xs"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] uppercase font-bold text-amber-500 mb-0.5">Interest Portion</label>
                                      <input
                                        type="number"
                                        step="any"
                                        value={editInt}
                                        onChange={(e) => setEditInt(e.target.value)}
                                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-amber-400/30 font-bold text-xs"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] uppercase font-bold text-emerald-500 mb-0.5">Principal Portion</label>
                                      <input
                                        type="number"
                                        step="any"
                                        value={editPrinc}
                                        onChange={(e) => setEditPrinc(e.target.value)}
                                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-emerald-400/30 font-bold text-xs"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex justify-end gap-2 pt-1">
                                    <button
                                      type="button"
                                      onClick={() => setEditingIndex(null)}
                                      className="px-3 py-1 rounded-lg text-xs font-bold text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      disabled={isUpdatingLog}
                                      onClick={() => handleSaveLogEdit(idx)}
                                      className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-500 text-white flex items-center gap-1 shadow-sm"
                                    >
                                      {isUpdatingLog ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Save
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-center justify-between text-xs font-bold">
                                    <span className="text-zinc-500 dark:text-zinc-400">
                                      {new Date(p.date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-zinc-900 dark:text-white font-black text-sm">
                                        Paid {formatCurrency(p.amount, assetCurrency)}
                                      </span>
                                      <div className="flex items-center gap-1 border-l border-zinc-200 dark:border-white/10 pl-2">
                                        <button
                                          type="button"
                                          onClick={() => startEditLog(p, idx)}
                                          className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all"
                                          title="Edit Payment Log"
                                        >
                                          <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          disabled={isUpdatingLog}
                                          onClick={() => handleDeleteLog(idx)}
                                          className="p-1 text-zinc-400 hover:text-rose-500 transition-all"
                                          title="Delete Payment Log"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2 text-[11px] pt-1.5 border-t border-zinc-200/50 dark:border-white/5 font-medium">
                                    <div>
                                      <span className="text-zinc-400">Interest Settled:</span>
                                      <p className="font-bold text-amber-600 dark:text-amber-400">{formatCurrency(p.interestPortion, assetCurrency)}</p>
                                    </div>
                                    <div>
                                      <span className="text-zinc-400">Principal Reduced:</span>
                                      <p className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(p.principalPortion, assetCurrency)}</p>
                                    </div>
                                    <div>
                                      <span className="text-zinc-400">New Balance:</span>
                                      <p className="font-bold text-zinc-900 dark:text-white">{formatCurrency(p.remainingPrincipal, assetCurrency)}</p>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              <Dialog open={installmentModalOpen} onOpenChange={setInstallmentModalOpen}>
                <DialogTrigger
                  render={
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentAmount("");
                        setCustomInterestPortion(null);
                        setCustomPrincipalPortion(null);
                      }}
                      className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 ml-auto"
                    />
                  }
                >
                  <Plus className="w-3.5 h-3.5" /> Record Payment
                </DialogTrigger>

                <DialogContent className="sm:max-w-xl bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/10 p-6 rounded-[2rem] shadow-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
                      <DollarSign className="w-6 h-6 text-amber-500" /> Mortgage Payment & Interest Split
                    </DialogTitle>
                  </DialogHeader>

                  <form onSubmit={handlePayInstallment} className="space-y-4 mt-2">
                    <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
                      <div className="flex justify-between font-bold text-amber-900 dark:text-amber-200">
                        <span>Current Outstanding Principal:</span>
                        <span className="font-black">{formatCurrency(currentPrincipal, assetCurrency)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-amber-800 dark:text-amber-300">
                        <span>Suggested Next Month Interest ({monthlyRate.toFixed(2)}%):</span>
                        <span className="font-black">{formatCurrency(suggestedNextMonthInterest, assetCurrency)}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                        Total Payment Amount ({assetCurrency}) *
                      </label>
                      <input
                        type="number"
                        step="any"
                        required
                        placeholder="e.g. 10000"
                        value={paymentAmount}
                        onChange={(e) => {
                          setPaymentAmount(e.target.value);
                          setCustomInterestPortion(null);
                          setCustomPrincipalPortion(null);
                        }}
                        className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white font-bold text-base focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    {typedPayAmt > 0 && (
                      <div className="bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-2xl border border-zinc-200 dark:border-white/10 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                            <Info className="w-3.5 h-3.5 text-blue-500" /> Automatic Payment Allocation
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setCustomInterestPortion(String(autoInterest));
                              setCustomPrincipalPortion(String(autoPrincipal));
                            }}
                            className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Customize Split
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400 mb-1">
                              Settles Accrued Interest
                            </label>
                            {customInterestPortion !== null ? (
                              <input
                                type="number"
                                step="any"
                                value={customInterestPortion}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setCustomInterestPortion(val);
                                  const numVal = parseFloat(val) || 0;
                                  setCustomPrincipalPortion(String(Math.max(0, typedPayAmt - numVal)));
                                }}
                                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-amber-300 dark:border-amber-500/30 font-bold text-xs"
                              />
                            ) : (
                              <p className="font-black text-amber-900 dark:text-amber-200 text-sm bg-amber-500/10 px-3 py-2 rounded-xl">
                                {formatCurrency(autoInterest, assetCurrency)}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 mb-1">
                              Reduces Loan Principal
                            </label>
                            {customPrincipalPortion !== null ? (
                              <input
                                type="number"
                                step="any"
                                value={customPrincipalPortion}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setCustomPrincipalPortion(val);
                                  const numVal = parseFloat(val) || 0;
                                  setCustomInterestPortion(String(Math.max(0, typedPayAmt - numVal)));
                                }}
                                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-emerald-300 dark:border-emerald-500/30 font-bold text-xs"
                              />
                            ) : (
                              <p className="font-black text-emerald-900 dark:text-emerald-200 text-sm bg-emerald-500/10 px-3 py-2 rounded-xl">
                                {formatCurrency(autoPrincipal, assetCurrency)}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs space-y-1">
                          <p className="font-bold text-blue-900 dark:text-blue-200 flex items-center justify-between">
                            <span>Projected Outstanding Balance:</span>
                            <span className="font-black">{formatCurrency(projectedNewPrincipal, assetCurrency)}</span>
                          </p>
                          <p className="text-[11px] text-blue-700 dark:text-blue-300 font-medium flex items-center justify-between">
                            <span>Next Month Interest ({monthlyRate.toFixed(2)}%):</span>
                            <span className="font-bold">{formatCurrency(projectedNextMonthInterest, assetCurrency)}</span>
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-3">
                      <button
                        type="button"
                        onClick={() => setInstallmentModalOpen(false)}
                        className="px-4 py-2.5 rounded-xl font-bold text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingPayment || typedPayAmt <= 0}
                        className="px-5 py-2.5 rounded-xl font-black text-xs bg-amber-500 hover:bg-amber-600 text-white shadow-md transition-all flex items-center gap-2"
                      >
                        {isSubmittingPayment ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        Confirm Payment
                      </button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}

        {asset.description && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium line-clamp-2 mt-2">
            {asset.description}
          </p>
        )}
      </div>
    </div>
  );
}
