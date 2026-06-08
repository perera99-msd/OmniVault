import { cookies } from "next/headers";
import { getWalletsPageData } from "@/actions/finance";
import { WalletCard } from "@/components/cards/WalletCard";
import { CreateWalletForm } from "@/components/forms/CreateWalletForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Landmark, CreditCard, Wallet as WalletIcon, ShieldCheck } from "lucide-react";
import * as motion from "framer-motion/client";
import { BaseCurrencySelector } from "@/components/dashboard/BaseCurrencySelector";
import { CURRENCY_SYMBOLS } from "@/lib/utils/currency";

export default async function WalletsPage(props: { searchParams: Promise<{ base?: string }> | { base?: string } }) {
  const cookieStore = await cookies();
  const firebaseUid = cookieStore.get("firebaseUid")?.value;

  if (!firebaseUid) return null;

  const searchParams = await (props.searchParams instanceof Promise ? props.searchParams : Promise.resolve(props.searchParams));
  const baseCurrency = searchParams?.base || "LKR";
  const { convertCurrency } = require("@/lib/utils/currency");

  const res = await getWalletsPageData(firebaseUid);
  if (!res.success || !res.data) return null;

  const { wallets } = res.data;

  const bankWallets = wallets.filter((w: any) => w.type === "Bank");
  const digitalWallets = wallets.filter((w: any) => w.type === "Digital");
  const cashWallets = wallets.filter((w: any) => w.type === "Cash");

  const aggregateTotals = (walletList: any[]) => {
    return walletList.reduce((sum: number, w: any) => sum + convertCurrency(w.balance, w.currency || "LKR", baseCurrency), 0);
  };

  const totalWealth = aggregateTotals(wallets);
  const bankTotals = aggregateTotals(bankWallets);
  const digitalTotals = aggregateTotals(digitalWallets);
  const cashTotals = aggregateTotals(cashWallets);

  const currentSymbol = CURRENCY_SYMBOLS[baseCurrency] || "Rs ";

  const renderTotals = (total: number, isHero: boolean = false) => (
    <div className="flex flex-col mt-1 sm:mt-2">
      <p className={`${isHero ? 'text-xl sm:text-[2rem] text-white' : 'text-lg sm:text-2xl text-zinc-900 dark:text-white'} font-black tracking-tighter flex items-baseline gap-0.5 sm:gap-1 tabular-nums truncate`}>
        <span className={`${isHero ? 'text-emerald-100/70 text-sm sm:text-xl' : 'text-zinc-400 font-medium text-sm sm:text-lg'} shrink-0`}>{currentSymbol}</span>
        <span className="truncate">{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </p>
    </div>
  );

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#f8fafc] dark:bg-[#09090b] transition-colors duration-500 pb-32 md:pb-12 overflow-hidden selection:bg-emerald-500/30">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 dark:bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-blue-400/10 dark:bg-blue-900/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto z-10">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-6 sm:space-y-8"
        >

          {/* Header & New Vault Action */}
          <motion.header variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 pb-2 sm:pb-6 relative">
            <div className="absolute top-0 right-0 sm:hidden">
              <BaseCurrencySelector currentBase={baseCurrency} />
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200/50 dark:border-zinc-800/50 mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Secure Storage</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-900 dark:text-white leading-none">
                Vaults
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base font-bold tracking-wide max-w-md">
                Manage your connected banks, digital wallets, and cash reserves securely in one place.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 w-full sm:w-auto">
              <div className="hidden sm:block">
                <BaseCurrencySelector currentBase={baseCurrency} />
              </div>
              <Dialog>
                <DialogTrigger className="flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-8 py-4 rounded-full font-bold text-[14px] shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all duration-300 w-full sm:w-auto justify-center">
                  <Plus className="w-4 h-4 stroke-[3px]" /> Add New Vault
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-white dark:bg-[#121214] border-zinc-100 dark:border-zinc-800/60 shadow-2xl p-6 sm:p-8 rounded-[2rem]">
                  <DialogHeader className="mb-4">
                    <DialogTitle className="text-2xl font-bold text-center text-zinc-900 dark:text-white">Create Vault</DialogTitle>
                  </DialogHeader>
                      <CreateWalletForm />
                </DialogContent>
              </Dialog>
            </div>
          </motion.header>

          {/* Aggregated Analytics Cards (SaaS Bento) */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <div className="bg-emerald-500 dark:bg-emerald-600 p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] shadow-lg relative overflow-hidden group col-span-2 sm:col-span-1 lg:col-span-1">
              <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/20 rounded-full blur-2xl -mr-6 -mt-6 sm:-mr-10 sm:-mt-10 transition-transform group-hover:scale-150"></div>
              <p className="text-[9px] sm:text-[10px] text-emerald-50 font-bold uppercase tracking-[0.2em] mb-1">Total Wealth</p>
              {renderTotals(totalWealth, true)}
            </div>
            
            <div className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/5 p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] shadow-sm flex flex-col justify-between group col-span-1">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                <Landmark className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400 group-hover:text-emerald-500 transition-colors" />
                <p className="text-[9px] sm:text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-[0.1em] sm:tracking-[0.2em] truncate">Bank Assets</p>
              </div>
              {renderTotals(bankTotals)}
            </div>

            <div className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/5 p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] shadow-sm flex flex-col justify-between group col-span-1">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400 group-hover:text-blue-500 transition-colors" />
                <p className="text-[9px] sm:text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-[0.1em] sm:tracking-[0.2em] truncate">Digital Assets</p>
              </div>
              {renderTotals(digitalTotals)}
            </div>

            <div className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/5 p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] shadow-sm flex flex-col justify-between group col-span-2 sm:col-span-1 lg:col-span-1">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                <WalletIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400 group-hover:text-rose-500 transition-colors" />
                <p className="text-[9px] sm:text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-[0.1em] sm:tracking-[0.2em] truncate">Physical Cash</p>
              </div>
              {renderTotals(cashTotals)}
            </div>
          </motion.div>

          {/* Categorized Wallet Grids */}
          {wallets.length === 0 ? (
            <motion.div variants={itemVariants} className="text-center py-24 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/5 rounded-[2rem] shadow-sm">
              <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <WalletIcon className="w-10 h-10 text-zinc-300 dark:text-zinc-600" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">No Vaults Connected</h3>
              <p className="text-zinc-500 font-medium text-sm">Add your first wallet to start tracking your net worth.</p>
            </motion.div>
          ) : (
            <div className="space-y-16 pt-4">
              
              {/* Bank Accounts Section */}
              {bankWallets.length > 0 && (
                <motion.section variants={itemVariants}>
                  <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6 flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
                      <Landmark className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    Bank Institutions
                  </h3>
                  <div className="flex overflow-x-auto hide-scrollbar gap-4 pb-6 pt-2 snap-x snap-mandatory w-full -mx-4 px-4 sm:mx-0 sm:px-0">
                    {bankWallets.map((w: any) => (
                      <div key={w._id} className="shrink-0 w-[85vw] sm:w-[340px] xl:w-[380px] snap-center">
                        <WalletCard wallet={{ id: w._id, name: w.name, type: w.type, balance: w.balance, currency: w.currency }} />
                      </div>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Digital Wallets Section */}
              {digitalWallets.length > 0 && (
                <motion.section variants={itemVariants}>
                  <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6 flex items-center gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
                      <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    Digital & Crypto
                  </h3>
                  <div className="flex overflow-x-auto hide-scrollbar gap-4 pb-6 pt-2 snap-x snap-mandatory w-full -mx-4 px-4 sm:mx-0 sm:px-0">
                    {digitalWallets.map((w: any) => (
                      <div key={w._id} className="shrink-0 w-[85vw] sm:w-[340px] xl:w-[380px] snap-center">
                        <WalletCard wallet={{ id: w._id, name: w.name, type: w.type, balance: w.balance, currency: w.currency }} />
                      </div>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Physical Cash Section */}
              {cashWallets.length > 0 && (
                <motion.section variants={itemVariants}>
                  <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6 flex items-center gap-3">
                    <div className="p-2 bg-rose-50 dark:bg-rose-500/10 rounded-lg">
                      <WalletIcon className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    </div>
                    Cash Reserves
                  </h3>
                  <div className="flex overflow-x-auto hide-scrollbar gap-4 pb-6 pt-2 snap-x snap-mandatory w-full -mx-4 px-4 sm:mx-0 sm:px-0">
                    {cashWallets.map((w: any) => (
                      <div key={w._id} className="shrink-0 w-[85vw] sm:w-[340px] xl:w-[380px] snap-center">
                        <WalletCard wallet={{ id: w._id, name: w.name, type: w.type, balance: w.balance, currency: w.currency }} />
                      </div>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Dropzone Add Button */}
              <motion.section variants={itemVariants} className="pt-4 pb-8">
                <Dialog>
                  <DialogTrigger className="w-full flex flex-col items-center justify-center p-10 border-2 border-dashed border-zinc-200 dark:border-white/5 rounded-[2rem] bg-zinc-50/50 dark:bg-[#121214] hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 hover:border-emerald-500/50 transition-all duration-300 group">
                    <div className="w-14 h-14 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300 mb-4">
                      <Plus className="w-6 h-6 text-zinc-400 group-hover:text-emerald-500 transition-colors" />
                    </div>
                    <span className="font-bold text-zinc-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">Add Another Vault</span>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md bg-white dark:bg-[#121214] border-zinc-100 dark:border-zinc-800/60 shadow-2xl p-6 sm:p-8 rounded-[2rem]">
                    <DialogHeader className="mb-4">
                      <DialogTitle className="text-2xl font-black text-center text-zinc-900 dark:text-white">Create Vault</DialogTitle>
                    </DialogHeader>
                        <CreateWalletForm />
                  </DialogContent>
                </Dialog>
              </motion.section>

            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
