"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
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
} from "@/components/ui/select";
import { ArrowRightLeft, Landmark, CreditCard, Wallet as WalletIcon } from "lucide-react";

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
  const router = useRouter();
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

  const getWalletIcon = (type: string) => {
    switch (type) {
      case "Bank": return <Landmark className="w-5 h-5 text-[#213F33] dark:text-[#4E6C5F]" />;
      case "Digital": return <CreditCard className="w-5 h-5 text-[#987B5E] dark:text-[#D4B48A]" />;
      case "Cash": return <WalletIcon className="w-5 h-5 text-[#6C5B4C] dark:text-[#C5A880]" />;
      default: return <WalletIcon className="w-5 h-5 text-[#9A9EA4]" />;
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
      description: values.description || "Vault Transfer",
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
        description: `Funds have been moved securely between vaults.`
      });
      router.refresh();
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
              <FormItem className="bg-white dark:bg-[#202420] rounded-3xl p-5 border border-[#E8E2D8] dark:border-white/10 focus-within:border-[#987B5E] transition-colors shadow-sm">
                <FormLabel className="text-[11px] text-[#6C5B4C] dark:text-[#9A9EA4] font-bold uppercase tracking-wider ml-1">Transfer Amount</FormLabel>
                <FormControl>
                  <div className="flex items-center mt-1">
                    <span className="text-2xl font-black mr-1 opacity-80 text-[#987B5E]">Rs</span>
                    <input 
                      type="number" 
                      placeholder="0.00" 
                      step="0.01" 
                      className="bg-transparent border-none text-3xl font-black text-[#1A1D1A] dark:text-[#EBE8E3] focus:outline-none w-full placeholder:text-[#9A9EA4] p-0 font-heading"
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
                <FormItem className="bg-white dark:bg-[#202420] rounded-3xl p-5 border border-[#E8E2D8] dark:border-white/10 shadow-sm">
                  <FormLabel className="text-[11px] text-[#6C5B4C] dark:text-[#9A9EA4] font-bold uppercase tracking-wider ml-1">From Vault</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full bg-transparent border-none shadow-none p-0 h-auto focus:ring-0 text-lg font-bold text-[#1A1D1A] dark:text-[#EBE8E3] mt-2 hover:bg-transparent data-[state=open]:bg-transparent">
                        <div className="flex items-center gap-3">
                          {field.value ? (
                            <div className="w-10 h-10 rounded-xl bg-[#FAF8F3] dark:bg-[#181B18] flex items-center justify-center shadow-sm border border-[#E8E2D8] dark:border-white/5">
                              {getWalletIcon(wallets.find(w => w._id === field.value)?.type)}
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-[#FAF8F3] dark:bg-[#181B18] flex items-center justify-center text-[#9A9EA4] shadow-sm">
                              ?
                            </div>
                          )}
                          <div className="flex flex-col text-left">
                            <span>{field.value ? wallets.find(w => w._id === field.value)?.name : "Select Source"}</span>
                            {field.value && (
                              <span className="text-xs text-[#6C5B4C] dark:text-[#9A9EA4] font-medium mt-0.5">
                                Balance: {wallets.find(w => w._id === field.value)?.balance?.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-2xl border-[#E8E2D8] dark:border-white/10 shadow-xl bg-[#FDFBF7] dark:bg-[#181B18]">
                      {wallets.map((w) => (
                        <SelectItem key={w._id} value={w._id} className="py-3 cursor-pointer text-[#1A1D1A] dark:text-[#EBE8E3]">
                          <span className="font-medium text-base">{w.name}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white dark:bg-[#181B18] rounded-full border border-[#E8E2D8] dark:border-white/10 shadow-md flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4 text-[#987B5E] rotate-90" />
            </div>

            {/* Destination Wallet */}
            <FormField
              control={form.control}
              name="destinationWalletId"
              render={({ field }) => (
                <FormItem className="bg-white dark:bg-[#202420] rounded-3xl p-5 border border-[#E8E2D8] dark:border-white/10 shadow-sm">
                  <FormLabel className="text-[11px] text-[#6C5B4C] dark:text-[#9A9EA4] font-bold uppercase tracking-wider ml-1">To Vault</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full bg-transparent border-none shadow-none p-0 h-auto focus:ring-0 text-lg font-bold text-[#1A1D1A] dark:text-[#EBE8E3] mt-2 hover:bg-transparent data-[state=open]:bg-transparent">
                        <div className="flex items-center gap-3">
                          {field.value ? (
                            <div className="w-10 h-10 rounded-xl bg-[#FAF8F3] dark:bg-[#181B18] flex items-center justify-center shadow-sm border border-[#E8E2D8] dark:border-white/5">
                              {getWalletIcon(wallets.find(w => w._id === field.value)?.type)}
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-[#FAF8F3] dark:bg-[#181B18] flex items-center justify-center text-[#9A9EA4] shadow-sm">
                              ?
                            </div>
                          )}
                          <div className="flex flex-col text-left">
                            <span>{field.value ? wallets.find(w => w._id === field.value)?.name : "Select Destination"}</span>
                          </div>
                        </div>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-2xl border-[#E8E2D8] dark:border-white/10 shadow-xl bg-[#FDFBF7] dark:bg-[#181B18]">
                      {wallets.map((w) => (
                        <SelectItem key={w._id} value={w._id} className="py-3 cursor-pointer text-[#1A1D1A] dark:text-[#EBE8E3]">
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
                  <FormLabel className="text-[10px] font-black text-[#6C5B4C] dark:text-[#9A9EA4] uppercase tracking-widest ml-1">Date</FormLabel>
                  <FormControl>
                    <Input type="date" className="h-12 rounded-xl bg-white dark:bg-[#202420] border-[#E8E2D8] dark:border-white/10 text-[#1A1D1A] dark:text-[#EBE8E3] px-4 font-medium" {...field} />
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
                  <FormLabel className="text-[10px] font-black text-[#6C5B4C] dark:text-[#9A9EA4] uppercase tracking-widest ml-1">Note (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Transfer reason..." className="h-12 rounded-xl bg-white dark:bg-[#202420] border-[#E8E2D8] dark:border-white/10 text-[#1A1D1A] dark:text-[#EBE8E3] px-4 font-medium" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full h-14 btn-tria-primary text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md disabled:opacity-50 text-base"
          >
            {loading ? <PremiumSpinner /> : "Confirm Transfer"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
