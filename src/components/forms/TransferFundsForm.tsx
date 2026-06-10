"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { addTransaction } from "@/actions/finance";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PremiumSpinner } from "@/components/ui/PremiumSpinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRightLeft, Landmark, CreditCard, Wallet as WalletIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  sourceWalletId: z.string().min(1, "Source wallet is required"),
  destinationWalletId: z.string().min(1, "Destination wallet is required"),
  description: z.string().optional(),
  dateString: z.string().min(1, "Date is required"),
}).refine(data => data.sourceWalletId !== data.destinationWalletId, {
  message: "Destination cannot be the same as source",
  path: ["destinationWalletId"],
});

interface TransferFundsFormProps {
  wallets: any[];
}

export function TransferFundsForm({ wallets }: TransferFundsFormProps) {
  const [loading, setLoading] = useState(false);

  const defaultWalletId = wallets.length > 0 ? wallets[0]._id : "";
  const defaultDestWalletId = wallets.length > 1 ? wallets[1]._id : "";
  const todayStr = new Date().toISOString().split("T")[0];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      amount: 0,
      sourceWalletId: defaultWalletId,
      destinationWalletId: defaultDestWalletId,
      description: "",
      dateString: todayStr,
    },
  });

  const watchSource = form.watch("sourceWalletId");
  const watchDest = form.watch("destinationWalletId");

  const getWalletIcon = (type: string) => {
    switch (type) {
      case "Bank": return <Landmark className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case "Digital": return <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case "Cash": return <WalletIcon className="w-5 h-5 text-rose-600 dark:text-rose-400" />;
      default: return <WalletIcon className="w-5 h-5 text-zinc-400" />;
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);

    const [year, month, day] = values.dateString.split("-").map(Number);
    const now = new Date();
    const finalDate = new Date(year, month - 1, day, now.getHours(), now.getMinutes(), now.getSeconds());

    const res = await addTransaction({
      type: "TRANSFER",
      amount: values.amount,
      sourceWalletId: values.sourceWalletId,
      destinationWalletId: values.destinationWalletId,
      description: values.description || "Wallet Transfer",
      date: finalDate
    });
    
    setLoading(false);
    if (res.success) {
      form.reset({
        ...form.getValues(),
        amount: 0,
        description: "",
      });
      toast.success("Transfer Successful!", {
        description: `Funds have been moved securely.`
      });
    } else {
      toast.error("Transfer failed", {
        description: res.error
      });
    }
  }

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex flex-col">
          
          {/* AMOUNT BLOCK */}
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem className="bg-zinc-50 dark:bg-white/5 rounded-3xl p-5 border border-transparent focus-within:border-blue-500/30 transition-colors shadow-sm">
                <FormLabel className="text-[13px] text-zinc-500 dark:text-zinc-400 font-medium ml-1">Transfer Amount</FormLabel>
                <FormControl>
                  <div className="flex items-center mt-1">
                    <span className="text-2xl font-black mr-1 opacity-80 text-blue-600 dark:text-blue-400">Rs</span>
                    <input 
                      type="number" 
                      placeholder="0.00" 
                      step="0.01" 
                      className="bg-transparent border-none text-3xl font-black text-zinc-900 dark:text-white focus:outline-none w-full placeholder:text-zinc-300 dark:placeholder:text-zinc-600 p-0"
                      {...field} 
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4 relative">
            {/* Source Wallet */}
            <FormField
              control={form.control}
              name="sourceWalletId"
              render={({ field }) => (
                <FormItem className="bg-zinc-50 dark:bg-white/5 rounded-3xl p-5 border border-transparent focus-within:border-zinc-300 transition-colors shadow-sm">
                  <FormLabel className="text-[13px] text-zinc-500 dark:text-zinc-400 font-medium ml-1">From Wallet</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full bg-transparent border-none shadow-none p-0 h-auto focus:ring-0 text-lg font-bold text-zinc-900 dark:text-white mt-2 hover:bg-transparent data-[state=open]:bg-transparent">
                        <div className="flex items-center gap-3">
                          {field.value ? (
                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center shadow-sm border border-zinc-100 dark:border-white/5">
                              {getWalletIcon(wallets.find(w => w._id === field.value)?.type)}
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 shadow-sm">
                              ?
                            </div>
                          )}
                          <div className="flex flex-col text-left">
                            <span>{field.value ? wallets.find(w => w._id === field.value)?.name : "Select Source"}</span>
                            {field.value && (
                              <span className="text-xs text-zinc-500 font-medium mt-0.5">
                                Balance: {wallets.find(w => w._id === field.value)?.balance?.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-xl">
                      {wallets.map((w) => (
                        <SelectItem key={w._id} value={w._id} className="py-3 cursor-pointer">
                          <span className="font-medium text-base">{w.name}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white dark:bg-[#18181b] rounded-full border border-zinc-200 dark:border-zinc-800 shadow-md flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4 text-zinc-400 rotate-90" />
            </div>

            {/* Destination Wallet */}
            <FormField
              control={form.control}
              name="destinationWalletId"
              render={({ field }) => (
                <FormItem className="bg-zinc-50 dark:bg-white/5 rounded-3xl p-5 border border-transparent focus-within:border-zinc-300 transition-colors shadow-sm">
                  <FormLabel className="text-[13px] text-zinc-500 dark:text-zinc-400 font-medium ml-1">To Wallet</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full bg-transparent border-none shadow-none p-0 h-auto focus:ring-0 text-lg font-bold text-zinc-900 dark:text-white mt-2 hover:bg-transparent data-[state=open]:bg-transparent">
                        <div className="flex items-center gap-3">
                          {field.value ? (
                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center shadow-sm border border-zinc-100 dark:border-white/5">
                              {getWalletIcon(wallets.find(w => w._id === field.value)?.type)}
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 shadow-sm">
                              ?
                            </div>
                          )}
                          <div className="flex flex-col text-left">
                            <span>{field.value ? wallets.find(w => w._id === field.value)?.name : "Select Destination"}</span>
                          </div>
                        </div>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-xl">
                      {wallets.map((w) => (
                        <SelectItem key={w._id} value={w._id} className="py-3 cursor-pointer">
                          <span className="font-medium text-base">{w.name}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="dateString"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest ml-1">Date</FormLabel>
                  <FormControl>
                    <Input type="date" className="h-12 rounded-xl bg-zinc-50 dark:bg-white/5 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white px-4 font-medium" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest ml-1">Note (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Transfer reason..." className="h-12 rounded-xl bg-zinc-50 dark:bg-white/5 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white px-4 font-medium" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full h-14 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-500/25 disabled:opacity-50 text-base"
          >
            {loading ? <PremiumSpinner /> : "Confirm Transfer"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
