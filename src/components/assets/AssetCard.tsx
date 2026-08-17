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
  Info,
  Check,
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
    badge: "bg-[#987B5E]/10 text-[#987B5E] dark:text-[#D4B48A] border-[#987B5E]/20",
    icon: "text-[#987B5E]",
  },
  REAL_ESTATE: {
    badge: "bg-[#213F33]/10 text-[#213F33] dark:text-[#4E6C5F] border-[#213F33]/20",
    icon: "text-[#213F33] dark:text-[#4E6C5F]",
  },
  BUSINESS: {
    badge: "bg-[#6C5B4C]/10 text-[#6C5B4C] dark:text-[#C5A880] border-[#6C5B4C]/20",
    icon: "text-[#6C5B4C]",
  },
  VEHICLE: {
    badge: "bg-[#4E6C5F]/10 text-[#4E6C5F] dark:text-[#EBE8E3] border-[#4E6C5F]/20",
    icon: "text-[#4E6C5F]",
  },
  OTHER: {
    badge: "bg-[#53585F]/10 text-[#53585F] dark:text-[#9A9EA4] border-[#53585F]/20",
    icon: "text-[#53585F]",
  },
};

export function AssetCard({ asset, currencySymbol, onEdit }: AssetCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [installmentModalOpen, setInstallmentModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  const [paymentAmount, setPaymentAmount] = useState("");
  const [customInterestPortion, setCustomInterestPortion] = useState<string | null>(null);
  const [customPrincipalPortion, setCustomPrincipalPortion] = useState<string | null>(null);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

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

  const isMortgaged = asset.isMortgaged && asset.mortgageDetails;
  const origPrincipal = asset.mortgageDetails?.mortgageAmount || 0;
  const currentPrincipal = asset.mortgageDetails?.currentPrincipal !== undefined
    ? asset.mortgageDetails.currentPrincipal
    : origPrincipal;

  const rateType = asset.mortgageDetails?.rateType || "MONTHLY";
  const rawRate = asset.mortgageDetails?.interestRate ?? asset.mortgageDetails?.interestRateMonthly ?? 0;
  const monthlyRate = rateType === "YEARLY" ? rawRate / 12 : rawRate;

  const suggestedNextMonthInterest = currentPrincipal * (monthlyRate / 100);

  const refDateStr = asset.mortgageDetails?.lastPaymentDate || asset.mortgageDetails?.startDate;
  const refDate = refDateStr ? new Date(refDateStr) : new Date();

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
    <div className="group relative bg-white dark:bg-[#181B18] rounded-[2rem] border border-[#E8E2D8] dark:border-white/10 p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden">
      <div>
        {/* Header: Category Badge & Actions */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className={cn("px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border flex items-center gap-1.5", style.badge)}>
              <IconComponent className="w-3.5 h-3.5" />
              {asset.category.replace("_", " ")}
            </span>
            {isMortgaged && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#987B5E]/10 text-[#987B5E] dark:text-[#D4B48A] border border-[#987B5E]/20 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-[#987B5E]" />
                Mortgaged
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(asset)}
              className="p-2 rounded-xl text-[#6C5B4C] dark:text-[#9A9EA4] hover:text-[#1A1D1A] dark:hover:text-white hover:bg-[#FAF8F3] dark:hover:bg-[#202420] transition-all"
              title="Edit Asset"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 rounded-xl text-[#6C5B4C] dark:text-[#9A9EA4] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all"
              title="Delete Asset"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title & Location */}
        <h3 className="text-xl font-bold tracking-tight text-[#1A1D1A] dark:text-[#EBE8E3] mb-1.5 line-clamp-1 font-heading">
          {asset.name}
        </h3>

        {(asset.location || isMortgaged) && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#6C5B4C] dark:text-[#9A9EA4] mb-4">
            <MapPin className={cn("w-3.5 h-3.5 shrink-0", isMortgaged ? "text-[#987B5E]" : "text-[#9A9EA4]")} />
            <span className="truncate">
              {isMortgaged
                ? `Mortgaged at: ${asset.mortgageDetails.provider || "Pawn Broker / Lender"}`
                : asset.location}
            </span>
          </div>
        )}

        {/* Valuation Box */}
        <div className="bg-[#FAF8F3] dark:bg-[#202420] rounded-2xl p-4 border border-[#E8E2D8] dark:border-white/5 space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#6C5B4C] dark:text-[#9A9EA4]">Current Market Value</span>
            <span className="font-black text-base text-[#1A1D1A] dark:text-[#EBE8E3] font-heading">
              {formatCurrency(currentVal, assetCurrency)}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-2 border-t border-[#E8E2D8] dark:border-white/5">
            <span className="font-medium text-[#6C5B4C] dark:text-[#9A9EA4]">Acquired Value:</span>
            <span className="font-bold text-[#1A1D1A] dark:text-[#EBE8E3]">
              {formatCurrency(initialVal, assetCurrency)}
            </span>
          </div>

          {initialVal > 0 && (
            <div className="flex items-center justify-end gap-1 text-[11px] font-black">
              {diff >= 0 ? (
                <span className="text-[#213F33] dark:text-[#4E6C5F] flex items-center gap-0.5 font-heading">
                  <TrendingUp className="w-3 h-3" /> +{formatCurrency(diff, assetCurrency)} (+{pctChange}%)
                </span>
              ) : (
                <span className="text-rose-600 dark:text-rose-400 flex items-center gap-0.5 font-heading">
                  <TrendingDown className="w-3 h-3" /> -{formatCurrency(Math.abs(diff), assetCurrency)} ({pctChange}%)
                </span>
              )}
            </div>
          )}
        </div>

        {/* Mortgage & Redemption Box */}
        {isMortgaged && (
          <div className="bg-white dark:bg-[#202420] border border-[#987B5E]/30 rounded-2xl p-4 space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#987B5E] shrink-0" />
                <span className="text-xs font-black uppercase tracking-wider text-[#987B5E]">
                  {asset.mortgageDetails.provider || "Mortgage Active"}
                </span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-[#987B5E]/10 text-[#987B5E] dark:text-[#D4B48A] px-2 py-0.5 rounded-md border border-[#987B5E]/20">
                {rawRate}% / {rateType === "YEARLY" ? "Year" : "Month"}
              </span>
            </div>

            <div className={cn("flex items-center justify-between p-2 rounded-xl text-[11px] font-bold border", isOverdue ? "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400" : "bg-[#FAF8F3] dark:bg-[#181B18] border-[#E8E2D8] dark:border-white/10 text-[#1A1D1A] dark:text-[#EBE8E3]")}>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#987B5E] shrink-0" />
                <span>Next Interest Day: <strong>{nextCalcDate.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</strong></span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded text-[#987B5E]">
                {isOverdue ? `${overdueDays}D Overdue!` : daysRemaining === 0 ? "Due Today!" : `In ${daysRemaining} Days`}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div>
                <p className="text-[10px] uppercase font-bold text-[#6C5B4C] dark:text-[#9A9EA4]">Current Principal</p>
                <p className="font-black text-[#1A1D1A] dark:text-[#EBE8E3] text-sm font-heading">
                  {formatCurrency(currentPrincipal, assetCurrency)}
                </p>
                {currentPrincipal < origPrincipal && (
                  <p className="text-[9px] font-bold text-[#213F33] dark:text-[#4E6C5F]">
                    Orig: {formatCurrency(origPrincipal, assetCurrency)}
                  </p>
                )}
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-[#6C5B4C] dark:text-[#9A9EA4]">Next Month Interest</p>
                <p className="font-black text-[#987B5E] dark:text-[#D4B48A] text-sm font-heading">
                  {formatCurrency(suggestedNextMonthInterest, assetCurrency)}
                </p>
                <p className="text-[9px] font-bold text-[#6C5B4C]">
                  ({monthlyRate.toFixed(2)}% of balance)
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-[#6C5B4C] dark:text-[#9A9EA4]">Total Interest Paid</p>
                <p className="font-black text-[#987B5E] dark:text-[#D4B48A] font-heading">
                  {formatCurrency(totalInterestPaid, assetCurrency)}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-[#6C5B4C] dark:text-[#9A9EA4]">Principal Cleared</p>
                <p className="font-black text-[#213F33] dark:text-[#4E6C5F] font-heading">
                  {formatCurrency(totalPrincipalPaid, assetCurrency)}
                </p>
              </div>
            </div>

            <div className="pt-2.5 border-t border-[#E8E2D8] dark:border-white/10 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {payments.length > 0 && (
                  <Dialog open={historyModalOpen} onOpenChange={setHistoryModalOpen}>
                    <DialogTrigger
                      render={
                        <button
                          type="button"
                          className="px-2.5 py-1.5 bg-[#FAF8F3] hover:bg-white dark:bg-[#181B18] dark:hover:bg-[#272D27] text-[#1A1D1A] dark:text-[#EBE8E3] font-bold text-[11px] rounded-xl transition-all flex items-center gap-1 border border-[#E8E2D8] dark:border-white/10"
                        />
                      }
                    >
                      <History className="w-3.5 h-3.5 text-[#987B5E]" /> {payments.length} Payments
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-xl bg-[#FDFBF7] dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/10 p-6 rounded-[2rem] shadow-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-black tracking-tight text-[#1A1D1A] dark:text-[#EBE8E3] flex items-center gap-2 font-heading">
                          <History className="w-5 h-5 text-[#987B5E]" /> Active Mortgage Timeline Log
                        </DialogTitle>
                      </DialogHeader>

                      <div className="space-y-3 mt-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
                        {payments.map((p: any, idx: number) => {
                          const isEdit = editingIndex === idx;
                          return (
                            <div key={idx} className="p-3.5 rounded-2xl bg-white dark:bg-[#202420] border border-[#E8E2D8] dark:border-white/5 space-y-2">
                              {isEdit ? (
                                <div className="space-y-3 text-xs">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="block text-[10px] uppercase font-bold text-[#6C5B4C] mb-0.5">Date</label>
                                      <input
                                        type="date"
                                        value={editDate}
                                        onChange={(e) => setEditDate(e.target.value)}
                                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#FAF8F3] dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/10 font-bold text-xs"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] uppercase font-bold text-[#6C5B4C] mb-0.5">Total Paid</label>
                                      <input
                                        type="number"
                                        step="any"
                                        value={editAmt}
                                        onChange={(e) => setEditAmt(e.target.value)}
                                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#FAF8F3] dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/10 font-bold text-xs"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] uppercase font-bold text-[#987B5E] mb-0.5">Interest Portion</label>
                                      <input
                                        type="number"
                                        step="any"
                                        value={editInt}
                                        onChange={(e) => setEditInt(e.target.value)}
                                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#FAF8F3] dark:bg-[#181B18] border border-[#987B5E]/30 font-bold text-xs"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] uppercase font-bold text-[#213F33] dark:text-[#4E6C5F] mb-0.5">Principal Portion</label>
                                      <input
                                        type="number"
                                        step="any"
                                        value={editPrinc}
                                        onChange={(e) => setEditPrinc(e.target.value)}
                                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#FAF8F3] dark:bg-[#181B18] border border-[#213F33]/30 font-bold text-xs"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex justify-end gap-2 pt-1">
                                    <button
                                      type="button"
                                      onClick={() => setEditingIndex(null)}
                                      className="px-3 py-1 rounded-lg text-xs font-bold text-[#6C5B4C]"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      disabled={isUpdatingLog}
                                      onClick={() => handleSaveLogEdit(idx)}
                                      className="px-3 py-1 rounded-lg text-xs font-bold btn-tria-primary text-white flex items-center gap-1 shadow-sm"
                                    >
                                      {isUpdatingLog ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Save
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-center justify-between text-xs font-bold">
                                    <span className="text-[#6C5B4C] dark:text-[#9A9EA4]">
                                      {new Date(p.date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[#1A1D1A] dark:text-[#EBE8E3] font-black text-sm font-heading">
                                        Paid {formatCurrency(p.amount, assetCurrency)}
                                      </span>
                                      <div className="flex items-center gap-1 border-l border-[#E8E2D8] dark:border-white/10 pl-2">
                                        <button
                                          type="button"
                                          onClick={() => startEditLog(p, idx)}
                                          className="p-1 text-[#6C5B4C] hover:text-[#1A1D1A] dark:hover:text-white transition-all"
                                          title="Edit Payment Log"
                                        >
                                          <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          disabled={isUpdatingLog}
                                          onClick={() => handleDeleteLog(idx)}
                                          className="p-1 text-[#6C5B4C] hover:text-rose-500 transition-all"
                                          title="Delete Payment Log"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2 text-[11px] pt-1.5 border-t border-[#E8E2D8] dark:border-white/5 font-medium">
                                    <div>
                                      <span className="text-[#6C5B4C] dark:text-[#9A9EA4]">Interest Settled:</span>
                                      <p className="font-bold text-[#987B5E] dark:text-[#D4B48A]">{formatCurrency(p.interestPortion, assetCurrency)}</p>
                                    </div>
                                    <div>
                                      <span className="text-[#6C5B4C] dark:text-[#9A9EA4]">Principal Reduced:</span>
                                      <p className="font-bold text-[#213F33] dark:text-[#4E6C5F]">{formatCurrency(p.principalPortion, assetCurrency)}</p>
                                    </div>
                                    <div>
                                      <span className="text-[#6C5B4C] dark:text-[#9A9EA4]">New Balance:</span>
                                      <p className="font-bold text-[#1A1D1A] dark:text-[#EBE8E3]">{formatCurrency(p.remainingPrincipal, assetCurrency)}</p>
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
                      className="px-3.5 py-1.5 btn-tria-primary font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 ml-auto"
                    />
                  }
                >
                  <Plus className="w-3.5 h-3.5" /> Record Payment
                </DialogTrigger>

                <DialogContent className="sm:max-w-xl bg-[#FDFBF7] dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/10 p-6 rounded-[2rem] shadow-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-black tracking-tight text-[#1A1D1A] dark:text-[#EBE8E3] flex items-center gap-2 font-heading">
                      <DollarSign className="w-6 h-6 text-[#987B5E]" /> Mortgage Payment & Interest Split
                    </DialogTitle>
                  </DialogHeader>

                  <form onSubmit={handlePayInstallment} className="space-y-4 mt-2">
                    <div className="p-3.5 rounded-2xl bg-white dark:bg-[#202420] border border-[#987B5E]/30 text-xs space-y-1">
                      <div className="flex justify-between font-bold text-[#1A1D1A] dark:text-[#EBE8E3]">
                        <span>Current Outstanding Principal:</span>
                        <span className="font-black font-heading">{formatCurrency(currentPrincipal, assetCurrency)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-[#987B5E]">
                        <span>Suggested Next Month Interest ({monthlyRate.toFixed(2)}%):</span>
                        <span className="font-black font-heading">{formatCurrency(suggestedNextMonthInterest, assetCurrency)}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-[#6C5B4C] dark:text-[#9A9EA4] mb-1.5">
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
                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#202420] border border-[#E8E2D8] dark:border-white/10 text-[#1A1D1A] dark:text-[#EBE8E3] font-bold text-base focus:outline-none focus:border-[#987B5E]"
                      />
                    </div>

                    {typedPayAmt > 0 && (
                      <div className="bg-white dark:bg-[#202420] p-4 rounded-2xl border border-[#E8E2D8] dark:border-white/10 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase tracking-wider text-[#1A1D1A] dark:text-[#EBE8E3] flex items-center gap-1.5 font-heading">
                            <Info className="w-3.5 h-3.5 text-[#987B5E]" /> Automatic Payment Allocation
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setCustomInterestPortion(String(autoInterest));
                              setCustomPrincipalPortion(String(autoPrincipal));
                            }}
                            className="text-[11px] font-bold text-[#987B5E] hover:underline"
                          >
                            Customize Split
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-[#987B5E] mb-1">
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
                                className="w-full px-3 py-1.5 rounded-lg bg-[#FAF8F3] dark:bg-[#181B18] border border-[#987B5E]/30 font-bold text-xs text-[#1A1D1A] dark:text-[#EBE8E3]"
                              />
                            ) : (
                              <p className="font-black text-[#987B5E] text-sm bg-[#FAF8F3] dark:bg-[#181B18] px-3 py-2 rounded-xl font-heading">
                                {formatCurrency(autoInterest, assetCurrency)}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase text-[#213F33] dark:text-[#4E6C5F] mb-1">
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
                                className="w-full px-3 py-1.5 rounded-lg bg-[#FAF8F3] dark:bg-[#181B18] border border-[#213F33]/30 font-bold text-xs text-[#1A1D1A] dark:text-[#EBE8E3]"
                              />
                            ) : (
                              <p className="font-black text-[#213F33] dark:text-[#4E6C5F] text-sm bg-[#FAF8F3] dark:bg-[#181B18] px-3 py-2 rounded-xl font-heading">
                                {formatCurrency(autoPrincipal, assetCurrency)}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-[#FAF8F3] dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/10 text-xs space-y-1">
                          <p className="font-bold text-[#1A1D1A] dark:text-[#EBE8E3] flex items-center justify-between">
                            <span>Projected Outstanding Balance:</span>
                            <span className="font-black font-heading">{formatCurrency(projectedNewPrincipal, assetCurrency)}</span>
                          </p>
                          <p className="text-[11px] text-[#6C5B4C] dark:text-[#9A9EA4] font-medium flex items-center justify-between">
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
                        className="px-4 py-2.5 rounded-xl font-bold text-xs text-[#6C5B4C] hover:bg-[#FAF8F3] dark:hover:bg-[#202420] transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingPayment || typedPayAmt <= 0}
                        className="px-5 py-2.5 rounded-xl font-black text-xs btn-tria-primary shadow-md transition-all flex items-center gap-2"
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
          <p className="text-xs text-[#6C5B4C] dark:text-[#9A9EA4] font-medium line-clamp-2 mt-2">
            {asset.description}
          </p>
        )}
      </div>
    </div>
  );
}
