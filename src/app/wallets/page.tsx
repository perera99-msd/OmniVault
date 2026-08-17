import { getWalletsPageData } from "@/actions/finance";
import { WalletCard } from "@/components/cards/WalletCard";
import { TransferFundsForm } from "@/components/forms/TransferFundsForm";
import { CreateWalletForm } from "@/components/forms/CreateWalletForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Landmark, CreditCard, Wallet as WalletIcon, ShieldCheck, ArrowRightLeft } from "lucide-react";
import * as motion from "framer-motion/client";
import { BaseCurrencySelector } from "@/components/dashboard/BaseCurrencySelector";
import { CURRENCY_SYMBOLS } from "@/lib/utils/currency";

export default async function WalletsPage(props: { searchParams: Promise<{ base?: string }> | { base?: string } }) {
  const searchParams = await (props.searchParams instanceof Promise ? props.searchParams : Promise.resolve(props.searchParams));
  const baseCurrency = searchParams?.base || "LKR";
  const { convertCurrency } = require("@/lib/utils/currency");

  const res = await getWalletsPageData();
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
      <p className={`${isHero ? 'text-xl sm:text-[2rem] text-[#FDFBF7]' : 'text-lg sm:text-2xl text-[#1A1D1A] dark:text-[#EBE8E3]'} font-black tracking-tight flex items-baseline gap-0.5 sm:gap-1 tabular-nums truncate font-heading`}>
        <span className={`${isHero ? 'text-[#D4B48A] text-sm sm:text-xl font-sans' : 'text-[#987B5E] font-medium text-sm sm:text-lg font-sans'} shrink-0`}>{currentSymbol}</span>
        <span className="truncate">{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </p>
    </div>
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#FDFBF7] dark:bg-[#121412] transition-colors duration-500 pb-32 md:pb-12 overflow-hidden selection:bg-[#987B5E]/30">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#987B5E]/10 dark:bg-[#987B5E]/5 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-[#213F33]/10 dark:bg-[#385A4D]/10 blur-[150px] rounded-full pointer-events-none" />

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
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#181B18] shadow-sm border border-[#E8E2D8] dark:border-white/10 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#987B5E]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#6C5B4C] dark:text-[#9A9EA4]">Secure Capital Storage</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#1A1D1A] dark:text-[#EBE8E3] leading-none font-heading">
                Vaults
              </h1>
              <p className="text-[#6C5B4C] dark:text-[#9A9EA4] text-sm md:text-base font-bold tracking-wide max-w-md">
                Manage your connected institutions, digital assets, and physical reserves in one unified portfolio.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 w-full sm:w-auto">
              <div className="hidden sm:block">
                <BaseCurrencySelector currentBase={baseCurrency} />
              </div>
              
              <div className="flex w-full sm:w-auto gap-3">
                <Dialog>
                  <DialogTrigger className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#FAF8F3] dark:bg-[#202420] text-[#1A1D1A] dark:text-[#EBE8E3] border border-[#E8E2D8] dark:border-white/10 px-6 sm:px-8 py-3.5 rounded-full font-bold text-[14px] shadow-sm hover:bg-white active:scale-95 transition-all duration-300">
                    <ArrowRightLeft className="w-4 h-4 text-[#987B5E]" /> Transfer
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md bg-[#FDFBF7] dark:bg-[#181B18] border-[#E8E2D8] dark:border-white/10 shadow-2xl p-6 sm:p-8 rounded-[2.5rem]">
                    <DialogHeader className="mb-4">
                      <DialogTitle className="text-2xl font-black text-center text-[#1A1D1A] dark:text-[#EBE8E3] font-heading">Transfer Capital</DialogTitle>
                    </DialogHeader>
                    <TransferFundsForm wallets={wallets} />
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger className="flex-1 sm:flex-none flex items-center justify-center gap-2 btn-tria-primary px-6 sm:px-8 py-3.5 rounded-full font-bold text-[14px] shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all duration-300">
                    <Plus className="w-4 h-4 stroke-[3px]" /> Add Vault
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md bg-[#FDFBF7] dark:bg-[#181B18] border-[#E8E2D8] dark:border-white/10 shadow-2xl p-6 sm:p-8 rounded-[2.5rem]">
                    <DialogHeader className="mb-4">
                      <DialogTitle className="text-2xl font-black text-center text-[#1A1D1A] dark:text-[#EBE8E3] font-heading">Create Vault</DialogTitle>
                    </DialogHeader>
                    <CreateWalletForm />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </motion.header>

          {/* Aggregated Analytics Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <div className="bg-gradient-to-br from-[#2B493D] via-[#213F33] to-[#162922] p-4 sm:p-6 rounded-2xl sm:rounded-[2.5rem] shadow-lg relative overflow-hidden group col-span-2 sm:col-span-1 lg:col-span-1 border border-[#987B5E]/30">
              <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-[#987B5E]/20 rounded-full blur-2xl -mr-6 -mt-6 sm:-mr-10 sm:-mt-10 transition-transform group-hover:scale-150"></div>
              <p className="text-[9px] sm:text-[10px] text-[#D4B48A] font-black uppercase tracking-[0.25em] mb-1">Total Vault Reserves</p>
              {renderTotals(totalWealth, true)}
            </div>
            
            <div className="bg-white dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/5 p-4 sm:p-6 rounded-2xl sm:rounded-[2.5rem] shadow-sm flex flex-col justify-between group col-span-1">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                <Landmark className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#987B5E]" />
                <p className="text-[9px] sm:text-[10px] text-[#6C5B4C] dark:text-[#9A9EA4] font-black uppercase tracking-[0.15em] truncate">Banking</p>
              </div>
              {renderTotals(bankTotals)}
            </div>

            <div className="bg-white dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/5 p-4 sm:p-6 rounded-2xl sm:rounded-[2.5rem] shadow-sm flex flex-col justify-between group col-span-1">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#987B5E]" />
                <p className="text-[9px] sm:text-[10px] text-[#6C5B4C] dark:text-[#9A9EA4] font-black uppercase tracking-[0.15em] truncate">Digital</p>
              </div>
              {renderTotals(digitalTotals)}
            </div>

            <div className="bg-white dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/5 p-4 sm:p-6 rounded-2xl sm:rounded-[2.5rem] shadow-sm flex flex-col justify-between group col-span-2 sm:col-span-1 lg:col-span-1">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                <WalletIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#987B5E]" />
                <p className="text-[9px] sm:text-[10px] text-[#6C5B4C] dark:text-[#9A9EA4] font-black uppercase tracking-[0.15em] truncate">Cash Reserves</p>
              </div>
              {renderTotals(cashTotals)}
            </div>
          </motion.div>

          {/* Categorized Wallet Grids */}
          {wallets.length === 0 ? (
            <motion.div variants={itemVariants} className="text-center py-24 bg-white dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/5 rounded-[2.5rem] shadow-sm">
              <div className="w-20 h-20 bg-[#FAF8F3] dark:bg-[#202420] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner text-[#987B5E]">
                <WalletIcon className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-[#1A1D1A] dark:text-[#EBE8E3] mb-2 font-heading">No Vaults Connected</h3>
              <p className="text-[#6C5B4C] dark:text-[#9A9EA4] font-medium text-sm">Add your first vault to begin managing your wealth.</p>
            </motion.div>
          ) : (
            <div className="space-y-16 pt-4">
              
              {/* Bank Accounts Section */}
              {bankWallets.length > 0 && (
                <motion.section variants={itemVariants}>
                  <h3 className="text-xl font-bold tracking-tight text-[#1A1D1A] dark:text-[#EBE8E3] mb-6 flex items-center gap-3 font-heading">
                    <div className="p-2 bg-[#213F33]/10 dark:bg-[#385A4D]/20 rounded-xl text-[#213F33] dark:text-[#4E6C5F]">
                      <Landmark className="w-5 h-5" />
                    </div>
                    Banking Institutions
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
                  <h3 className="text-xl font-bold tracking-tight text-[#1A1D1A] dark:text-[#EBE8E3] mb-6 flex items-center gap-3 font-heading">
                    <div className="p-2 bg-[#987B5E]/10 dark:bg-[#987B5E]/20 rounded-xl text-[#987B5E] dark:text-[#D4B48A]">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    Digital & Brokerage
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
                  <h3 className="text-xl font-bold tracking-tight text-[#1A1D1A] dark:text-[#EBE8E3] mb-6 flex items-center gap-3 font-heading">
                    <div className="p-2 bg-[#7A6652]/10 dark:bg-[#7A6652]/20 rounded-xl text-[#7A6652] dark:text-[#C5A880]">
                      <WalletIcon className="w-5 h-5" />
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

            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
