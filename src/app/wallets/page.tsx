import { cookies } from "next/headers";
import { getWalletsPageData } from "@/actions/finance";
import { WalletCard } from "@/components/cards/WalletCard";
import { CreateWalletForm } from "@/components/forms/CreateWalletForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Landmark, CreditCard, Wallet as WalletIcon, ShieldCheck } from "lucide-react";
import * as motion from "framer-motion/client";

export default async function WalletsPage() {
  const cookieStore = await cookies();
  const firebaseUid = cookieStore.get("firebaseUid")?.value;

  if (!firebaseUid) return null;

  const res = await getWalletsPageData(firebaseUid);
  if (!res.success || !res.data) return null;

  const { user, wallets } = res.data;

  // Aggregate Data by Currency
  const aggregateByCurrency = (walletList: any[]) => {
    return {
      USD: walletList.filter(w => w.currency === "USD" || !w.currency).reduce((acc: number, w: any) => acc + w.balance, 0),
      EUR: walletList.filter(w => w.currency === "EUR").reduce((acc: number, w: any) => acc + w.balance, 0),
      GBP: walletList.filter(w => w.currency === "GBP").reduce((acc: number, w: any) => acc + w.balance, 0),
    };
  };

  const bankWallets = wallets.filter((w: any) => w.type === "Bank");
  const digitalWallets = wallets.filter((w: any) => w.type === "Digital");
  const cashWallets = wallets.filter((w: any) => w.type === "Cash");

  const totalWealth = aggregateByCurrency(wallets);
  const bankTotals = aggregateByCurrency(bankWallets);
  const digitalTotals = aggregateByCurrency(digitalWallets);
  const cashTotals = aggregateByCurrency(cashWallets);

  const formatCurrency = (amount: number, code: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const renderTotals = (totals: {USD: number, EUR: number, GBP: number}, isHero: boolean = false) => (
    <div className="flex flex-col mt-2">
      <p className={`${isHero ? 'text-[2rem] text-zinc-900 dark:text-white' : 'text-2xl text-zinc-800 dark:text-zinc-100'} font-black tracking-tighter flex items-baseline gap-1 tabular-nums`}>
        {formatCurrency(totals.USD, 'USD')}
      </p>
      {(totals.EUR > 0 || totals.GBP > 0) && (
        <div className="flex gap-3 mt-3 border-t border-zinc-100 dark:border-zinc-800/60 pt-3">
          {totals.EUR > 0 && <span className="text-[11px] font-bold text-zinc-500 tracking-tight tabular-nums">EUR €{totals.EUR.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>}
          {totals.GBP > 0 && <span className="text-[11px] font-bold text-zinc-500 tracking-tight tabular-nums">GBP £{totals.GBP.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>}
        </div>
      )}
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
          className="space-y-8"
        >

          {/* Header & New Vault Action */}
          <motion.header variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 pb-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200/50 dark:border-zinc-800/50 mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Secure Storage</span>
              </div>
              <h1 className="text-[3.5rem] md:text-[4.5rem] font-black tracking-tighter text-zinc-900 dark:text-white leading-none">
                Vaults
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base font-bold tracking-wide max-w-md">
                Manage your connected banks, digital wallets, and cash reserves securely in one place.
              </p>
            </div>

            <Dialog>
              <DialogTrigger className="flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-8 py-4 rounded-full font-bold text-[14px] shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all duration-300">
                <Plus className="w-4 h-4 stroke-[3px]" /> Add New Vault
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-white dark:bg-[#121214] border-zinc-100 dark:border-zinc-800/60 shadow-2xl p-6 sm:p-8 rounded-[2rem]">
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-2xl font-black text-center text-zinc-900 dark:text-white">Create Vault</DialogTitle>
                </DialogHeader>
                <CreateWalletForm userId={user._id} />
              </DialogContent>
            </Dialog>
          </motion.header>

          {/* Aggregated Analytics Cards (SaaS Bento) */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-emerald-500 dark:bg-emerald-600 p-6 rounded-[2rem] shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
              <p className="text-[10px] text-emerald-50 font-black uppercase tracking-[0.2em] mb-1">Total Wealth</p>
              <div className="flex flex-col mt-2">
                <p className="text-[2rem] text-white font-black tracking-tighter flex items-baseline gap-1 tabular-nums">
                  {formatCurrency(totalWealth.USD, 'USD')}
                </p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-[#121214] border border-zinc-100 dark:border-zinc-800/60 p-6 rounded-[2rem] shadow-xl shadow-zinc-200/40 dark:shadow-none flex flex-col justify-between group">
              <div className="flex items-center gap-2 mb-1">
                <Landmark className="w-4 h-4 text-zinc-400 group-hover:text-emerald-500 transition-colors" />
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-[0.2em]">Bank Assets</p>
              </div>
              {renderTotals(bankTotals)}
            </div>

            <div className="bg-white dark:bg-[#121214] border border-zinc-100 dark:border-zinc-800/60 p-6 rounded-[2rem] shadow-xl shadow-zinc-200/40 dark:shadow-none flex flex-col justify-between group">
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="w-4 h-4 text-zinc-400 group-hover:text-blue-500 transition-colors" />
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-[0.2em]">Digital Assets</p>
              </div>
              {renderTotals(digitalTotals)}
            </div>

            <div className="bg-white dark:bg-[#121214] border border-zinc-100 dark:border-zinc-800/60 p-6 rounded-[2rem] shadow-xl shadow-zinc-200/40 dark:shadow-none flex flex-col justify-between group">
              <div className="flex items-center gap-2 mb-1">
                <WalletIcon className="w-4 h-4 text-zinc-400 group-hover:text-rose-500 transition-colors" />
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-[0.2em]">Physical Cash</p>
              </div>
              {renderTotals(cashTotals)}
            </div>
          </motion.div>

          {/* Categorized Wallet Grids */}
          {wallets.length === 0 ? (
            <motion.div variants={itemVariants} className="text-center py-24 bg-white dark:bg-[#121214] border border-zinc-100 dark:border-zinc-800/60 rounded-[2.5rem] shadow-xl shadow-zinc-200/40 dark:shadow-none">
              <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <WalletIcon className="w-10 h-10 text-zinc-300 dark:text-zinc-600" />
              </div>
              <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-2">No Vaults Connected</h3>
              <p className="text-zinc-500 font-medium text-sm">Add your first wallet to start tracking your net worth.</p>
            </motion.div>
          ) : (
            <div className="space-y-16 pt-4">
              
              {/* Bank Accounts Section */}
              {bankWallets.length > 0 && (
                <motion.section variants={itemVariants}>
                  <h3 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white mb-6 flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
                      <Landmark className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    Bank Institutions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {bankWallets.map((w: any) => (
                      <WalletCard key={w._id} wallet={{ id: w._id, name: w.name, type: w.type, balance: w.balance }} />
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Digital Wallets Section */}
              {digitalWallets.length > 0 && (
                <motion.section variants={itemVariants}>
                  <h3 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white mb-6 flex items-center gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
                      <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    Digital & Crypto
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {digitalWallets.map((w: any) => (
                      <WalletCard key={w._id} wallet={{ id: w._id, name: w.name, type: w.type, balance: w.balance }} />
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Physical Cash Section */}
              {cashWallets.length > 0 && (
                <motion.section variants={itemVariants}>
                  <h3 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white mb-6 flex items-center gap-3">
                    <div className="p-2 bg-rose-50 dark:bg-rose-500/10 rounded-lg">
                      <WalletIcon className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    </div>
                    Cash Reserves
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {cashWallets.map((w: any) => (
                      <WalletCard key={w._id} wallet={{ id: w._id, name: w.name, type: w.type, balance: w.balance }} />
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Dropzone Add Button */}
              <motion.section variants={itemVariants} className="pt-4 pb-8">
                <Dialog>
                  <DialogTrigger className="w-full flex flex-col items-center justify-center p-10 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[2rem] bg-zinc-50/50 dark:bg-zinc-900/20 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 hover:border-emerald-500/50 transition-all duration-300 group">
                    <div className="w-14 h-14 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300 mb-4">
                      <Plus className="w-6 h-6 text-zinc-400 group-hover:text-emerald-500 transition-colors" />
                    </div>
                    <span className="font-bold text-zinc-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">Add Another Vault</span>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md bg-white dark:bg-[#121214] border-zinc-100 dark:border-zinc-800/60 shadow-2xl p-6 sm:p-8 rounded-[2rem]">
                    <DialogHeader className="mb-4">
                      <DialogTitle className="text-2xl font-black text-center text-zinc-900 dark:text-white">Create Vault</DialogTitle>
                    </DialogHeader>
                    <CreateWalletForm userId={user._id} />
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
