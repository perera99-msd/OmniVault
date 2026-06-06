import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUpcomingPayments, markUpcomingPaymentAsPaid, deleteUpcomingPayment } from "@/actions/upcoming";
import { getUserDashboardData } from "@/actions/finance";
import { CreateUpcomingPaymentForm } from "@/components/forms/CreateUpcomingPaymentForm";
import { EditUpcomingPaymentForm } from "@/components/forms/EditUpcomingPaymentForm";
import { CalendarClock, CheckCircle, Trash2, Wallet, DollarSign, Clock, CalendarHeart } from "lucide-react";
import { format, isPast, isToday, isTomorrow, differenceInDays } from "date-fns";
import * as motion from "framer-motion/client";

export default async function UpcomingPaymentsPage() {
  const cookieStore = await cookies();
  const firebaseUid = cookieStore.get("firebaseUid")?.value;

  if (!firebaseUid) {
    redirect("/");
  }

  const [paymentsRes, dashboardRes] = await Promise.all([
    getUpcomingPayments(firebaseUid),
    getUserDashboardData(firebaseUid)
  ]);

  if (!paymentsRes.success || !dashboardRes.success || !dashboardRes.data) {
    return (
      <div className="flex h-full items-center justify-center bg-[#f8fafc] dark:bg-[#09090b]">
        <p className="text-zinc-500 font-bold">Failed to load data.</p>
      </div>
    );
  }

  const payments = paymentsRes.data || [];
  const { wallets } = dashboardRes.data;

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
    if (isToday(date) || isTomorrow(date)) return "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20";
    return "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700";
  };

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
      <div className="absolute top-[5%] left-[5%] w-[30%] h-[30%] bg-amber-500/10 dark:bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-[25%] h-[25%] bg-emerald-500/10 dark:bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto z-10">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
        
          {/* Header */}
          <motion.header variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 pb-6 border-b border-zinc-200 dark:border-zinc-800">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200/50 dark:border-zinc-800/50 mb-2">
                <CalendarHeart className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Scheduled</span>
              </div>
              <h1 className="text-[3.5rem] md:text-[4.5rem] font-black tracking-tighter text-zinc-900 dark:text-white leading-none">
                Upcoming
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base font-bold tracking-wide">
                Track and manage your scheduled bills and subscriptions.
              </p>
            </div>
            <CreateUpcomingPaymentForm firebaseUid={firebaseUid} wallets={wallets} />
          </motion.header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Pending Column */}
            <div className="space-y-6">
              <motion.h2 variants={itemVariants} className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)] animate-pulse"></span> Pending Bills
              </motion.h2>
              
              {unpaidPayments.length === 0 ? (
                <motion.div variants={itemVariants} className="bg-white dark:bg-[#121214] border border-zinc-100 dark:border-zinc-800/60 rounded-[2rem] p-12 text-center shadow-xl shadow-zinc-200/40 dark:shadow-none">
                  <p className="text-zinc-500 font-bold text-sm">No pending payments. You're all caught up!</p>
                </motion.div>
              ) : (
                <motion.div variants={itemVariants} className="space-y-4">
                  {unpaidPayments.map((payment: any) => {
                    const isOverdue = isPast(new Date(payment.dueDate)) && !isToday(new Date(payment.dueDate));
                    
                    return (
                      <div key={payment._id} className="bg-white dark:bg-[#121214] border border-zinc-100 dark:border-zinc-800/60 rounded-[1.5rem] p-6 shadow-xl shadow-zinc-200/40 dark:shadow-none hover:-translate-y-1 hover:shadow-2xl hover:shadow-zinc-200/60 transition-all duration-300 group">
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner ${getColorClass(payment.dueDate)}`}>
                              {payment.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-black text-xl text-zinc-900 dark:text-white tracking-tight">{payment.name}</h3>
                              <div className="flex items-center gap-1.5 mt-1">
                                <Clock className={`w-3.5 h-3.5 ${isOverdue ? "text-rose-500" : "text-zinc-400"}`} />
                                <p className={`text-xs font-bold ${isOverdue ? "text-rose-600 dark:text-rose-400" : "text-zinc-500 dark:text-zinc-400"}`}>
                                  {format(new Date(payment.dueDate), "MMM dd, yyyy")} <span className="opacity-75">({getRelativeDate(payment.dueDate)})</span>
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-black text-2xl tabular-nums tracking-tight ${isOverdue ? "text-rose-600 dark:text-rose-400" : "text-zinc-900 dark:text-white"}`}>
                              <span className="text-sm mr-1 opacity-50">USD</span>
                              {payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>
                        
                        {payment.walletId && (
                          <div className="flex items-center gap-2 text-[11px] font-bold text-zinc-500 dark:text-zinc-400 mb-6 bg-zinc-50 dark:bg-zinc-800/50 px-3 py-2 rounded-xl border border-zinc-100 dark:border-zinc-800 w-max shadow-sm">
                            <Wallet className="w-3.5 h-3.5" /> Pay from: <span className="text-zinc-700 dark:text-zinc-300">{payment.walletId.name}</span>
                          </div>
                        )}

                        <div className="flex justify-end gap-3 mt-4 border-t border-zinc-100 dark:border-zinc-800/60 pt-5">
                          <EditUpcomingPaymentForm payment={payment} wallets={wallets} />
                          
                          <form action={async () => {
                            "use server";
                            await deleteUpcomingPayment(payment._id);
                          }}>
                            <button type="submit" className="w-11 h-11 rounded-xl flex items-center justify-center text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-200 dark:hover:border-rose-500/20" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </form>
                          
                          <form action={async () => {
                            "use server";
                            await markUpcomingPaymentAsPaid(payment._id);
                          }}>
                            <button type="submit" className="px-6 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-sm shadow-[0_5px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_20px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 active:scale-95 flex items-center gap-2 transition-all">
                              <CheckCircle className="w-4 h-4" /> Mark as Paid
                            </button>
                          </form>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </div>

            {/* Paid Column */}
            <div className="space-y-6 lg:opacity-70 lg:hover:opacity-100 transition-opacity duration-500">
              <motion.h2 variants={itemVariants} className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-zinc-300 dark:bg-zinc-700"></span> Completed
              </motion.h2>
              
              {paidPayments.length === 0 ? (
                <motion.div variants={itemVariants} className="bg-white/50 dark:bg-[#121214]/50 border border-zinc-100 dark:border-zinc-800/60 rounded-[2rem] p-12 text-center shadow-sm">
                  <p className="text-zinc-400 font-bold text-sm">No completed payments yet.</p>
                </motion.div>
              ) : (
                <motion.div variants={itemVariants} className="space-y-3">
                  {paidPayments.map((payment: any) => (
                    <div key={payment._id} className="bg-zinc-50 dark:bg-[#121214] border border-zinc-200/60 dark:border-zinc-800/60 rounded-[1.2rem] p-4 flex justify-between items-center transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-zinc-500 dark:text-zinc-400 line-through decoration-zinc-300 dark:decoration-zinc-600">{payment.name}</h3>
                          <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{format(new Date(payment.dueDate), "MMM dd, yyyy")}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-sm text-zinc-400 dark:text-zinc-500 tabular-nums">
                          USD {payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
