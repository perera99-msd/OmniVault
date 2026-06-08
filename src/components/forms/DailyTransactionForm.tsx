"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { addTransaction, createCategory } from "@/actions/finance";
import { useAppStore } from "@/lib/store/useStore";
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
import { cn } from "@/lib/utils";

const formSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  sourceWalletId: z.string().min(1, "Wallet is required"),
  categoryId: z.string().optional(),
  newCategoryName: z.string().optional(),
  description: z.string().optional(),
  dateString: z.string().min(1, "Date is required"),
});

interface DailyTransactionFormProps {
  wallets: any[];
  categories: any[];
}

export function DailyTransactionForm({ wallets, categories }: DailyTransactionFormProps) {
  const selectedWalletId = useAppStore((state) => state.selectedWalletId);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [loading, setLoading] = useState(false);

  const defaultWalletId = selectedWalletId || (wallets.length > 0 ? wallets[0]._id : "");

  // Default to today "YYYY-MM-DD"
  const todayStr = new Date().toISOString().split("T")[0];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      type: "EXPENSE",
      amount: 0,
      sourceWalletId: defaultWalletId,
      description: "",
      dateString: todayStr,
      newCategoryName: "",
    },
  });

  const watchType = form.watch("type");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);

    let finalCategoryId = values.categoryId;

    if (isCreatingCategory && values.newCategoryName) {
      const catRes = await createCategory({
        name: values.newCategoryName,
        type: watchType,
        icon: "✨", 
        color: "#009900" 
      });
      if (catRes.success) {
        finalCategoryId = catRes.category._id;
        setIsCreatingCategory(false);
      } else {
        toast.error("Failed to create category: " + catRes.error);
        setLoading(false);
        return;
      }
    }

    // Convert local YYYY-MM-DD back to a Date object, preserving current time
    const [year, month, day] = values.dateString.split("-").map(Number);
    const now = new Date();
    const finalDate = new Date(year, month - 1, day, now.getHours(), now.getMinutes(), now.getSeconds());

    const res = await addTransaction({
      ...values,
      categoryId: finalCategoryId,
      date: finalDate
    });
    
    setLoading(false);
    if (res.success) {
      form.reset({
        ...form.getValues(),
        amount: 0,
        description: "",
      });
      toast.success("Transaction successfully added!", {
        description: `Added to ${values.type.toLowerCase()}s.`
      });
    } else {
      toast.error("Failed to add transaction", {
        description: res.error
      });
    }
  }

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex flex-col">
          
          {/* INCOME/EXPENSE TOGGLE */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <div className="flex bg-zinc-50/80 dark:bg-zinc-800/50 p-1.5 rounded-2xl w-full mx-auto shadow-inner">
                    <button
                      type="button"
                      onClick={() => field.onChange("EXPENSE")}
                      className={cn(
                        "flex-1 py-2.5 text-[13px] font-bold rounded-xl transition-all duration-300",
                        field.value === "EXPENSE" 
                          ? "bg-white dark:bg-[#1e1e1e] shadow-sm text-red-500 dark:text-red-400" 
                          : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                      )}
                    >
                      Expense
                    </button>
                    <button
                      type="button"
                      onClick={() => field.onChange("INCOME")}
                      className={cn(
                        "flex-1 py-2.5 text-[13px] font-bold rounded-xl transition-all duration-300",
                        field.value === "INCOME" 
                          ? "bg-white dark:bg-[#1e1e1e] shadow-sm text-emerald-600 dark:text-emerald-400" 
                          : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                      )}
                    >
                      Income
                    </button>
                  </div>
                </FormControl>
              </FormItem>
            )}
          />

          {/* AMOUNT BLOCK */}
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem className="bg-zinc-50 dark:bg-white/5 rounded-3xl p-5 border border-transparent focus-within:border-emerald-500/30 transition-colors shadow-sm">
                <FormLabel className="text-[13px] text-zinc-500 dark:text-zinc-400 font-medium ml-1">Amount</FormLabel>
                <FormControl>
                  <div className="flex items-center mt-1">
                    <span className={cn("text-2xl font-black mr-1 opacity-80", watchType === "EXPENSE" ? "text-red-500" : "text-emerald-600")}>Rs</span>
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

          {/* CATEGORY BLOCK */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem className="bg-zinc-50 dark:bg-white/5 rounded-3xl p-5 border border-transparent focus-within:border-emerald-500/30 transition-colors shadow-sm">
                  <FormLabel className="text-[13px] text-zinc-500 dark:text-zinc-400 font-medium ml-1">Category</FormLabel>
                  <Select onValueChange={(val) => {
                    if (val === "NEW") {
                      setIsCreatingCategory(true);
                      field.onChange(undefined);
                    } else {
                      setIsCreatingCategory(false);
                      field.onChange(val);
                    }
                  }} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full bg-transparent border-none shadow-none p-0 h-auto focus:ring-0 text-lg font-bold text-zinc-900 dark:text-white mt-2 hover:bg-transparent data-[state=open]:bg-transparent">
                        <div className="flex items-center gap-3">
                          {field.value && field.value !== "NEW" ? (
                            <div className="w-10 h-10 rounded-xl bg-[#fdf5e6] dark:bg-amber-500/10 flex items-center justify-center text-xl shadow-sm border border-amber-900/5">
                              {categories.find(c => c._id === field.value)?.icon || "✨"}
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 shadow-sm">
                              ?
                            </div>
                          )}
                          <span>
                            {field.value ? categories.find(c => c._id === field.value)?.name : "Select Category"}
                          </span>
                        </div>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-xl">
                      <SelectItem value="NEW" className="font-bold text-emerald-600 py-3">
                        + Create New Category
                      </SelectItem>
                      {categories
                        .filter((c) => c.type === watchType)
                        .map((c) => (
                          <SelectItem key={c._id} value={c._id} className="py-3 cursor-pointer">
                            <span className="mr-2 text-lg">{c.icon}</span> <span className="font-medium text-base">{c.name}</span>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isCreatingCategory && (
              <FormField
                control={form.control}
                name="newCategoryName"
                render={({ field }) => (
                  <FormItem className="px-2 animate-in slide-in-from-top-2">
                    <FormLabel className="text-xs font-bold text-emerald-600">New Category Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Groceries" className="h-12 rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181b]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          {/* PAYMENT TYPE (WALLETS) */}
          <FormField
            control={form.control}
            name="sourceWalletId"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-[15px] text-zinc-900 dark:text-white font-bold ml-1">Payment Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full h-14 rounded-2xl bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-bold text-[15px] px-4 focus:ring-emerald-500/50 shadow-sm transition-colors">
                      {field.value ? wallets.find(w => w._id === field.value)?.name : "Select a Wallet"}
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-xl">
                    {wallets.map((w) => (
                      <SelectItem key={w._id} value={w._id} className="py-3 cursor-pointer font-bold">
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* DATE & DESCRIPTION */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="dateString"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input type="date" className="h-12 rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181b] text-sm font-medium" {...field} />
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
                  <FormControl>
                    <Input placeholder="Note (Optional)" className="h-12 rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181b] text-sm font-medium" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* ACTION BUTTONS */}
          <div className="pt-4 pb-2">
            <Button 
              type="submit" 
              disabled={loading || wallets.length === 0}
              className={cn(
                "w-full h-14 rounded-2xl text-[16px] font-bold text-white shadow-sm transition-colors",
                watchType === "EXPENSE" ? "bg-red-500 hover:bg-red-600" : "bg-[#abcfa8] hover:bg-[#95c590] text-zinc-900"
              )}
            >
              {loading ? <PremiumSpinner size="sm" color={watchType === "EXPENSE" ? "white" : "zinc"} /> : "Add Transaction"}
            </Button>
          </div>

        </form>
      </Form>
    </div>
  );
}
