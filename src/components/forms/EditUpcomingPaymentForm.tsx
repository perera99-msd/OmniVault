"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { updateUpcomingPayment } from "@/actions/upcoming";
import { PremiumSpinner } from "@/components/ui/PremiumSpinner";
import { CURRENCY_SYMBOLS } from "@/lib/utils/currency";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  amount: z.coerce.number().positive("Amount must be positive."),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
  walletId: z.string().optional(),
});

interface EditUpcomingPaymentFormProps {
  payment: any;
  wallets: any[];
  baseCurrency?: string;
}

export function EditUpcomingPaymentForm({ payment, wallets, baseCurrency }: EditUpcomingPaymentFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: payment.name,
      amount: payment.amount,
      dueDate: new Date(payment.dueDate).toISOString().split('T')[0],
      walletId: payment.walletId?._id || "none",
    },
  });

  const selectedWalletId = form.watch("walletId");
  const selectedWallet = wallets?.find((w) => w._id === selectedWalletId);
  const currentCurrency = selectedWallet?.currency || payment.currency || payment.walletId?.currency || baseCurrency || "LKR";
  const currencySymbol = (CURRENCY_SYMBOLS[currentCurrency] || currentCurrency).trim();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setSubmitMessage(null);
    try {
      const res = await updateUpcomingPayment(payment._id, {
        name: values.name,
        amount: values.amount,
        dueDate: new Date(values.dueDate),
        walletId: values.walletId === "none" ? undefined : values.walletId,
      });

      if (res.success) {
        setSubmitMessage({ type: "success", text: "Payment updated successfully!" });
        router.refresh();
        setTimeout(() => {
          setOpen(false);
          setSubmitMessage(null);
        }, 1500);
      } else {
        setSubmitMessage({ type: "error", text: res.error || "Failed to update payment." });
      }
    } catch (error: any) {
      setSubmitMessage({ type: "error", text: error.message });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <button className="p-2 text-[#6C5B4C] hover:text-[#987B5E] hover:bg-[#FAF8F3] dark:hover:bg-[#202420] rounded-xl transition-colors w-11 h-11 flex items-center justify-center border border-transparent hover:border-[#E8E2D8] dark:hover:border-white/10" />
      }>
        <Edit2 className="w-4 h-4" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-[#FDFBF7] dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/10 shadow-2xl p-6 sm:p-8 rounded-[2rem]">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-black tracking-tight text-[#1A1D1A] dark:text-[#EBE8E3] flex items-center gap-2 font-heading">
            <Edit2 className="w-5 h-5 text-[#987B5E]" /> Edit Payment
          </DialogTitle>
          <DialogDescription className="text-[#6C5B4C] dark:text-[#9A9EA4] font-medium">
            Update the details of your scheduled payment.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black text-[#6C5B4C] dark:text-[#9A9EA4] uppercase tracking-wider ml-1">Payment Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Netflix Subscription" className="h-14 bg-white dark:bg-[#202420] border border-[#E8E2D8] dark:border-white/10 rounded-2xl font-medium px-4 text-[#1A1D1A] dark:text-[#EBE8E3] focus-visible:ring-[#987B5E]/50 focus:border-[#987B5E]" {...field} />
                  </FormControl>
                  <FormMessage className="ml-1" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem className="bg-white dark:bg-[#202420] rounded-3xl p-4 sm:p-5 border border-[#E8E2D8] dark:border-white/10 focus-within:border-[#987B5E] transition-colors shadow-sm">
                  <FormLabel className="text-[11px] text-[#6C5B4C] dark:text-[#9A9EA4] font-bold uppercase tracking-wider ml-1">Amount</FormLabel>
                  <FormControl>
                    <div className="flex items-center mt-1">
                      <span className="text-2xl font-black mr-1 opacity-80 text-[#987B5E]">{currencySymbol}</span>
                      <input 
                        type="number" 
                        step="0.01" 
                        className="bg-transparent border-none text-3xl font-black text-[#1A1D1A] dark:text-[#EBE8E3] focus:outline-none w-full p-0 font-heading" 
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="ml-1" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black text-[#6C5B4C] dark:text-[#9A9EA4] uppercase tracking-wider ml-1">Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" className="h-14 bg-white dark:bg-[#202420] border border-[#E8E2D8] dark:border-white/10 rounded-2xl font-medium px-4 text-[#1A1D1A] dark:text-[#EBE8E3] focus-visible:ring-[#987B5E]/50 focus:border-[#987B5E]" {...field} />
                    </FormControl>
                    <FormMessage className="ml-1" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="walletId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black text-[#6C5B4C] dark:text-[#9A9EA4] uppercase tracking-wider ml-1">Pay From (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-14 bg-white dark:bg-[#202420] border border-[#E8E2D8] dark:border-white/10 rounded-2xl font-bold px-4 text-[#1A1D1A] dark:text-[#EBE8E3] focus:ring-[#987B5E]/50 focus:border-[#987B5E]">
                          <SelectValue placeholder="Select a vault" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#FDFBF7] dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/10 rounded-xl shadow-xl">
                        <SelectItem value="none" className="font-bold text-[#6C5B4C] dark:text-[#9A9EA4]">Don't specify</SelectItem>
                        {wallets.map((wallet) => (
                          <SelectItem key={wallet._id} value={wallet._id} className="font-bold text-[#1A1D1A] dark:text-[#EBE8E3]">
                            {wallet.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="ml-1" />
                  </FormItem>
                )}
              />
            </div>

            {submitMessage && (
              <div className={`p-3 rounded-xl text-sm font-bold text-center ${submitMessage.type === "success" ? "bg-[#213F33]/10 text-[#213F33] dark:text-[#4E6C5F]" : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"}`}>
                {submitMessage.text}
              </div>
            )}

            <div className="pt-4">
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="w-full btn-tria-primary text-white rounded-2xl h-14 shadow-sm font-bold transition-all text-[16px]"
              >
                {form.formState.isSubmitting ? <PremiumSpinner /> : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
