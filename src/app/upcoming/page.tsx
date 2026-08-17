import { getUpcomingPayments } from "@/actions/upcoming";
import { getUserDashboardData } from "@/actions/finance";
import { CreateUpcomingPaymentForm } from "@/components/forms/CreateUpcomingPaymentForm";
import { EditUpcomingPaymentForm } from "@/components/forms/EditUpcomingPaymentForm";
import { PaymentQuickActions } from "@/components/upcoming/PaymentQuickActions";
import { CheckCircle, Wallet, Clock, CalendarHeart } from "lucide-react";
import { format, isPast, isToday, isTomorrow, differenceInDays } from "date-fns";
import * as motion from "framer-motion/client";
import { formatCurrency } from "@/lib/utils/currency";

export default async function UpcomingPaymentsPage() {
  const [paymentsRes, dashboardRes] = await Promise.all([
    getUpcomingPayments(),
    getUserDashboardData()
  ]);

  if (!paymentsRes.success || !dashboardRes.success || !dashboardRes.data) {
    return (
      <div className="flex h-full items-center justify-center bg-[#FDFBF7] dark:bg-[#121412]">
        <p className="text-[#6C5B4C] dark:text-[#9A9EA4] font-bold">Failed to load data.</p>
      </div>
    );
  }

  const payments = paymentsRes.data || [];
  const { wallets, user } = dashboardRes.data;
  const baseCurrency = (user as any)?.baseCurrency || "LKR";

  const unpaidPayments = payments.filter((p: any) => !p.isPaid);
  const paidPayments = payments.filter((p: any) => p.isPaid);

  const getRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    if (isPast(date)) return "Overdue";
    const diff = differenceInDays(date, new Date());
    return `In ${diff} Days`;
  };

  const getColorClass = (dateString: string) => {
    const date = new Date(dateString);
    if (isPast(date) && !isToday(date)) return "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20";
    if (isToday(date) || isTomorrow(date)) return "bg-[#987B5E]/10 text-[#987B5E] dark:text-[#D4B48A] border border-[#987B5E]/30";
    return "bg-[#FAF8F3] dark:bg-[#202420] text-[#6C5B4C] dark:text-[#EBE8E3] border border-[#E8E2D8] dark:border-white/10";
  };

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
      <div className="absolute top-[5%] left-[5%] w-[30%] h-[30%] bg-[#987B5E]/10 dark:bg-[#987B5E]/5 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-[25%] h-[25%] bg-[#213F33]/10 dark:bg-[#385A4D]/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="relative p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto z-10">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
        
          {/* Header */}
          <motion.header variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 pb-6 border-b border-[#E8E2D8] dark:border-white/5">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#181B18] shadow-sm border border-[#E8E2D8] dark:border-white/10 mb-1">
                <CalendarHeart className="w-3.5 h-3.5 text-[#987B5E]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#6C5B4C] dark:text-[#9A9EA4]">Cash Flow Schedule</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#1A1D1A] dark:text-[#EBE8E3] leading-none font-heading">
                Upcoming
              </h1>
              <p className="text-[#6C5B4C] dark:text-[#9A9EA4] text-sm md:text-base font-bold tracking-wide">
                Track and manage your recurring bills, loan amortizations, and obligations.
              </p>
            </div>
            <CreateUpcomingPaymentForm wallets={wallets} baseCurrency={baseCurrency} />
          </motion.header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Pending Column */}
            <div className="space-y-6">
              <motion.h2 variants={itemVariants} className="text-2xl font-black tracking-tight text-[#1A1D1A] dark:text-[#EBE8E3] flex items-center gap-3 font-heading">
                <span className="w-3 h-3 rounded-full bg-[#987B5E] shadow-[0_0_12px_rgba(152,123,94,0.7)] animate-pulse"></span> Pending Obligations
              </motion.h2>
              
              {unpaidPayments.length === 0 ? (
                <motion.div variants={itemVariants} className="bg-white dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/5 rounded-[2rem] p-12 text-center shadow-sm">
                  <p className="text-[#6C5B4C] dark:text-[#9A9EA4] font-bold text-sm">No pending payments. You're completely up to date.</p>
                </motion.div>
              ) : (
                <motion.div variants={itemVariants} className="space-y-4">
                  {unpaidPayments.map((payment: any) => {
                    const isOverdue = isPast(new Date(payment.dueDate)) && !isToday(new Date(payment.dueDate));
                    
                    return (
                      <div key={payment._id} className="bg-white dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/5 rounded-[1.8rem] p-6 shadow-sm hover:-translate-y-1 transition-all duration-300 group">
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner ${getColorClass(payment.dueDate)}`}>
                              {payment.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-black text-xl text-[#1A1D1A] dark:text-[#EBE8E3] tracking-tight font-heading">{payment.name}</h3>
                              <div className="flex items-center gap-1.5 mt-1">
                                <Clock className={`w-3.5 h-3.5 ${isOverdue ? "text-rose-500" : "text-[#987B5E]"}`} />
                                <p className={`text-xs font-bold ${isOverdue ? "text-rose-600 dark:text-rose-400" : "text-[#6C5B4C] dark:text-[#9A9EA4]"}`}>
                                  {format(new Date(payment.dueDate), "MMM dd, yyyy")} <span className="opacity-75">({getRelativeDate(payment.dueDate)})</span>
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-black text-2xl tabular-nums tracking-tight font-heading ${isOverdue ? "text-rose-600 dark:text-rose-400" : "text-[#1A1D1A] dark:text-[#EBE8E3]"}`}>
                              {formatCurrency(payment.amount, payment.currency || payment.walletId?.currency || baseCurrency)}
                            </p>
                          </div>
                        </div>
                        
                        {payment.walletId && (
                          <div className="flex items-center gap-2 text-[11px] font-bold text-[#6C5B4C] dark:text-[#9A9EA4] mb-6 bg-[#FAF8F3] dark:bg-[#202420] px-3.5 py-2 rounded-xl border border-[#E8E2D8] dark:border-white/10 w-max shadow-sm">
                            <Wallet className="w-3.5 h-3.5 text-[#987B5E]" /> Deduct from: <span className="text-[#1A1D1A] dark:text-[#EBE8E3] font-bold uppercase">{payment.walletId.name}</span>
                          </div>
                        )}

                        <div className="flex justify-end gap-3 mt-4 border-t border-[#E8E2D8] dark:border-white/5 pt-5">
                          <EditUpcomingPaymentForm payment={payment} wallets={wallets} baseCurrency={baseCurrency} />
                          <PaymentQuickActions paymentId={payment._id.toString()} paymentName={payment.name} />
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </div>

            {/* Paid Column */}
            <div className="space-y-6 lg:opacity-80 lg:hover:opacity-100 transition-opacity duration-500">
              <motion.h2 variants={itemVariants} className="text-2xl font-black tracking-tight text-[#1A1D1A] dark:text-[#EBE8E3] flex items-center gap-3 font-heading">
                <span className="w-3 h-3 rounded-full bg-[#213F33] dark:bg-[#4E6C5F]"></span> Completed & Settled
              </motion.h2>
              
              {paidPayments.length === 0 ? (
                <motion.div variants={itemVariants} className="bg-white/60 dark:bg-[#181B18]/60 border border-[#E8E2D8] dark:border-white/5 rounded-[2rem] p-12 text-center shadow-sm">
                  <p className="text-[#6C5B4C] dark:text-[#9A9EA4] font-bold text-sm">No completed payments recorded this cycle.</p>
                </motion.div>
              ) : (
                <motion.div variants={itemVariants} className="space-y-3">
                  {paidPayments.map((payment: any) => (
                    <div key={payment._id} className="bg-white dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/5 shadow-sm rounded-[1.4rem] p-4 flex justify-between items-center transition-all hover:border-[#987B5E]/30">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#213F33]/10 dark:bg-[#385A4D]/20 text-[#213F33] dark:text-[#4E6C5F] flex items-center justify-center">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-[#6C5B4C] dark:text-[#9A9EA4] line-through">{payment.name}</h3>
                          <p className="text-[10px] font-black text-[#987B5E] uppercase tracking-widest">{format(new Date(payment.dueDate), "MMM dd, yyyy")}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-[#6C5B4C] dark:text-[#9A9EA4] tabular-nums font-heading">
                          {formatCurrency(payment.amount, payment.currency || payment.walletId?.currency || baseCurrency)}
                        </p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
