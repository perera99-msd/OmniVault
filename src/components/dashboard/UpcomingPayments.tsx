"use client";

import { Calendar, Clock, DollarSign } from "lucide-react";
import { format, isPast, isToday } from "date-fns";
import { formatCurrency } from "@/lib/utils/currency";

type UpcomingPayment = {
  id: string;
  name: string;
  amount: number;
  currency?: string;
  dueDate: Date;
  status: string;
};

interface UpcomingPaymentsProps {
  upcomingPayments: UpcomingPayment[];
}

export function UpcomingPayments({ upcomingPayments }: UpcomingPaymentsProps) {
  if (!upcomingPayments || upcomingPayments.length === 0) {
    return (
      <div className="bg-[#ffffff] dark:bg-[#424242] rounded-[2rem] p-10 border border-[#d7ccc8] dark:border-[#616161] shadow-sm flex flex-col items-center justify-center text-center transition-colors duration-500">
        <div className="w-16 h-16 bg-[#f5f5f5] dark:bg-[#212121] rounded-full flex items-center justify-center mb-4">
          <Calendar className="w-8 h-8 text-[#a1887f] dark:text-[#9e9e9e]" />
        </div>
        <p className="text-[#8d6e63] dark:text-[#9e9e9e] font-bold text-sm">No upcoming payments</p>
      </div>
    );
  }

  // Sort by date and take top 5
  const sortedPayments = [...upcomingPayments]
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  return (
    <div className="bg-[#ffffff] dark:bg-[#424242] rounded-[2rem] p-6 border border-[#d7ccc8] dark:border-[#616161] shadow-[0_20px_40px_rgba(0,0,0,0.03)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.2)] transition-colors duration-500">
      <div className="space-y-4">
        {sortedPayments.map((payment) => {
          const date = new Date(payment.dueDate);
          const past = isPast(date) && !isToday(date);
          const today = isToday(date);

          return (
            <div 
              key={payment.id} 
              className={`flex items-center justify-between p-4 rounded-[1.5rem] transition-all duration-300 border ${
                past 
                  ? "bg-red-50 dark:bg-red-500/5 border-red-100 dark:border-red-500/10" 
                  : today
                    ? "bg-[#009900]/5 border-[#009900]/20 dark:bg-[#66cc66]/5 dark:border-[#66cc66]/20"
                    : "bg-[#f5f5f5] dark:bg-[#212121] border-[#d7ccc8]/50 dark:border-[#616161]/50 hover:border-[#d7ccc8] dark:hover:border-[#616161]"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
                  past ? "bg-white dark:bg-[#424242]" : "bg-white dark:bg-[#424242]"
                }`}>
                  <DollarSign className={`w-6 h-6 ${past ? "text-red-500" : "text-[#003300] dark:text-[#ffffff]"}`} />
                </div>
                
                <div>
                  <h4 className={`font-black text-[15px] ${past ? "text-red-700 dark:text-red-400" : "text-[#003300] dark:text-[#ffffff]"}`}>
                    {payment.name}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock className={`w-3.5 h-3.5 ${past ? "text-red-500" : "text-[#a1887f] dark:text-[#9e9e9e]"}`} />
                    <span className={`text-[12px] font-bold ${past ? "text-red-500" : "text-[#a1887f] dark:text-[#9e9e9e]"}`}>
                      {today ? "Due Today" : format(date, "MMM dd, yyyy")}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <p className={`font-black tracking-tight text-[16px] ${past ? "text-red-700 dark:text-red-400" : "text-[#003300] dark:text-[#ffffff]"}`}>
                  {formatCurrency(payment.amount, payment.currency || "LKR")}
                </p>
                {past && <span className="text-[10px] font-bold uppercase tracking-widest text-red-500 bg-red-100 dark:bg-red-500/20 px-2 py-0.5 rounded-full">Overdue</span>}
              </div>
            </div>
          );
        })}
      </div>
      
      {upcomingPayments.length > 5 && (
        <button className="w-full mt-4 py-3 rounded-xl bg-[#f5f5f5] dark:bg-[#212121] text-[#8d6e63] dark:text-[#9e9e9e] font-bold text-[13px] hover:bg-[#d7ccc8] dark:hover:bg-[#616161] hover:text-[#003300] dark:hover:text-[#ffffff] transition-colors">
          View All Payments
        </button>
      )}
    </div>
  );
}
