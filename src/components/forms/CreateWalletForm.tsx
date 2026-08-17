"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createWallet } from "@/actions/finance";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { CURRENCY_SYMBOLS } from "@/lib/utils/currency";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  type: z.enum(["Cash", "Bank", "Digital"]),
  currency: z.enum(["LKR", "USD", "EUR"]),
  balance: z.coerce.number().min(0, "Balance cannot be negative"),
});

interface CreateWalletFormProps {
  onSuccess?: () => void;
}

export function CreateWalletForm({ onSuccess }: CreateWalletFormProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: "",
      type: "Bank",
      currency: "LKR",
      balance: 0,
    },
  });

  const selectedCurrency = form.watch("currency") || "LKR";
  const currencySymbol = (CURRENCY_SYMBOLS[selectedCurrency] || selectedCurrency).trim();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    const res = await createWallet({
      ...values,
    });
    
    setLoading(false);
    if (res.success) {
      form.reset();
      if (onSuccess) {
        onSuccess();
      } else {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      }
    } else {
      alert("Error: " + res.error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] font-black text-[#6C5B4C] dark:text-[#9A9EA4] uppercase tracking-wider ml-1">Vault Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Chase Checking" className="h-14 bg-white dark:bg-[#202420] border border-[#E8E2D8] dark:border-white/10 rounded-2xl font-medium px-4 text-[#1A1D1A] dark:text-[#EBE8E3] focus-visible:ring-[#987B5E]/50 focus:border-[#987B5E]" {...field} />
              </FormControl>
              <FormMessage className="ml-1" />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black text-[#6C5B4C] dark:text-[#9A9EA4] uppercase tracking-wider ml-1">Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-14 bg-white dark:bg-[#202420] border border-[#E8E2D8] dark:border-white/10 rounded-2xl font-bold px-4 text-[#1A1D1A] dark:text-[#EBE8E3] focus:ring-[#987B5E]/50 focus:border-[#987B5E]">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-[#FDFBF7] dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/10 rounded-xl shadow-xl">
                    <SelectItem value="Bank" className="font-bold text-[#1A1D1A] dark:text-[#EBE8E3]">Bank Account</SelectItem>
                    <SelectItem value="Cash" className="font-bold text-[#1A1D1A] dark:text-[#EBE8E3]">Physical Cash</SelectItem>
                    <SelectItem value="Digital" className="font-bold text-[#1A1D1A] dark:text-[#EBE8E3]">Digital Wallet</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="ml-1" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black text-[#6C5B4C] dark:text-[#9A9EA4] uppercase tracking-wider ml-1">Currency</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-14 bg-white dark:bg-[#202420] border border-[#E8E2D8] dark:border-white/10 rounded-2xl font-bold px-4 text-[#1A1D1A] dark:text-[#EBE8E3] focus:ring-[#987B5E]/50 focus:border-[#987B5E]">
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-[#FDFBF7] dark:bg-[#181B18] border border-[#E8E2D8] dark:border-white/10 rounded-xl shadow-xl">
                    <SelectItem value="LKR" className="font-bold text-[#1A1D1A] dark:text-[#EBE8E3]">LKR</SelectItem>
                    <SelectItem value="USD" className="font-bold text-[#1A1D1A] dark:text-[#EBE8E3]">USD</SelectItem>
                    <SelectItem value="EUR" className="font-bold text-[#1A1D1A] dark:text-[#EBE8E3]">EUR</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="ml-1" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="balance"
          render={({ field }) => (
            <FormItem className="bg-white dark:bg-[#202420] rounded-3xl p-4 sm:p-5 border border-[#E8E2D8] dark:border-white/10 focus-within:border-[#987B5E] transition-colors shadow-sm mt-2">
              <FormLabel className="text-[11px] text-[#6C5B4C] dark:text-[#9A9EA4] font-bold uppercase tracking-wider ml-1">Starting Balance</FormLabel>
              <FormControl>
                <div className="flex items-center mt-1">
                  <span className="text-2xl font-black mr-1 opacity-80 text-[#987B5E]">{currencySymbol}</span>
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00"
                    className="bg-transparent border-none text-3xl font-black text-[#1A1D1A] dark:text-[#EBE8E3] focus:outline-none w-full placeholder:text-[#9A9EA4] p-0 font-heading" 
                    {...field} 
                  />
                </div>
              </FormControl>
              <FormMessage className="ml-1" />
            </FormItem>
          )}
        />

        <div className="pt-4">
          <Button 
            type="submit" 
            className="w-full btn-tria-primary rounded-2xl h-14 shadow-sm font-bold transition-all text-[16px]" 
            disabled={loading}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Vault"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
