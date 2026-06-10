"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateTransaction, createCategory } from "@/actions/finance";
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
import { cn } from "@/lib/utils";
import { PremiumSpinner } from "@/components/ui/PremiumSpinner";

const formSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  sourceWalletId: z.string().min(1, "Wallet is required"),
  categoryId: z.string().optional(),
  newCategoryName: z.string().optional(),
  description: z.string().optional(),
  dateString: z.string().min(1, "Date is required"),
});

interface EditTransactionFormProps {
  transaction: any;
  wallets: any[];
  categories: any[];
  onSuccess?: () => void;
}

export function EditTransactionForm({ transaction, wallets, categories, onSuccess }: EditTransactionFormProps) {
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [loading, setLoading] = useState(false);

  // Format initial date to YYYY-MM-DD
  const initialDateStr = new Date(transaction.date).toISOString().split("T")[0];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      type: transaction.type,
      amount: transaction.amount,
      sourceWalletId: transaction.sourceWalletId?._id?.toString() || transaction.sourceWalletId?.toString(),
      description: transaction.description || "",
      dateString: initialDateStr,
      categoryId: transaction.categoryId?._id?.toString() || transaction.categoryId?.toString() || undefined,
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
        type: watchType === "TRANSFER" ? "EXPENSE" : watchType,
        icon: "✨", 
        color: "#009900" 
      });
      if (catRes.success) {
        finalCategoryId = catRes.category._id;
        setIsCreatingCategory(false);
      } else {
        alert("Error creating category: " + catRes.error);
        setLoading(false);
        return;
      }
    }

    const [year, month, day] = values.dateString.split("-").map(Number);
    // Try to preserve original time if same day
    const origDate = new Date(transaction.date);
    let finalDate;
    if (origDate.getFullYear() === year && (origDate.getMonth() + 1) === month && origDate.getDate() === day) {
        finalDate = origDate;
    } else {
        const now = new Date();
        finalDate = new Date(year, month - 1, day, now.getHours(), now.getMinutes(), now.getSeconds());
    }

    const res = await updateTransaction(transaction._id, {
      amount: values.amount,
      type: values.type,
      sourceWalletId: values.sourceWalletId,
      categoryId: finalCategoryId,
      description: values.description,
      date: finalDate
    });
    
    setLoading(false);
    if (res.success) {
      if (onSuccess) onSuccess();
    } else {
      alert("Error: " + res.error);
    }
  }

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {watchType !== "TRANSFER" && (
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex bg-zinc-100 dark:bg-white/5 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => field.onChange("EXPENSE")}
                        className={cn(
                          "flex-1 py-3 text-sm font-bold rounded-lg transition-all",
                          field.value === "EXPENSE" 
                            ? "bg-white dark:bg-[#1a1a1c] shadow-sm text-rose-600 dark:text-rose-500" 
                            : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                        )}
                      >
                        Expense
                      </button>
                      <button
                        type="button"
                        onClick={() => field.onChange("INCOME")}
                        className={cn(
                          "flex-1 py-3 text-sm font-bold rounded-lg transition-all",
                          field.value === "INCOME" 
                            ? "bg-white dark:bg-[#1a1a1c] shadow-sm text-emerald-600 dark:text-emerald-500" 
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
          )}

          {watchType === "TRANSFER" && (
             <p className="text-sm font-bold text-blue-500 dark:text-blue-400 p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-center">
               Editing Transfer Transaction
             </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-zinc-500">Amount</FormLabel>
                  <FormControl>
                    <Input className="h-14 bg-zinc-50 dark:bg-[#1a1a1c] border-zinc-200 dark:border-zinc-800 rounded-xl px-4 text-zinc-900 dark:text-white font-medium focus-visible:ring-emerald-500/50" type="number" placeholder="0.00" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateString"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-zinc-500">Date</FormLabel>
                  <FormControl>
                    <Input className="h-14 bg-zinc-50 dark:bg-[#1a1a1c] border-zinc-200 dark:border-zinc-800 rounded-xl px-4 text-zinc-900 dark:text-white font-medium focus-visible:ring-emerald-500/50" type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="sourceWalletId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-zinc-500">Wallet</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-14 bg-zinc-50 dark:bg-[#1a1a1c] border-zinc-200 dark:border-zinc-800 rounded-xl px-4 text-zinc-900 dark:text-white font-medium focus:ring-emerald-500/50">
                        <SelectValue placeholder="Select a wallet">
                          {wallets.find((w) => w._id.toString() === field.value)?.name || "Select a wallet"}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white dark:bg-[#1a1a1c] border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl">
                      {wallets.map((w) => (
                        <SelectItem key={w._id.toString()} value={w._id.toString()} className="cursor-pointer focus:bg-zinc-100 dark:focus:bg-white/5">
                          {w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchType !== "TRANSFER" && (
              <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-zinc-500">Category</FormLabel>
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
                            <SelectTrigger className="h-14 bg-zinc-50 dark:bg-[#1a1a1c] border-zinc-200 dark:border-zinc-800 rounded-xl px-4 text-zinc-900 dark:text-white font-medium focus:ring-emerald-500/50">
                              <SelectValue placeholder="Select category">
                                {(() => {
                                  if (field.value === "NEW") return "+ Create New Category";
                                  const cat = categories.find((c) => c._id.toString() === field.value);
                                  return cat ? `${cat.icon} ${cat.name}` : "Select category";
                                })()}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white dark:bg-[#1a1a1c] border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                            <SelectItem value="NEW" className="font-bold text-emerald-600 dark:text-emerald-500 cursor-pointer focus:bg-zinc-100 dark:focus:bg-white/5">
                              + Create New Category
                            </SelectItem>
                            {categories
                              .filter((c) => c.type === watchType)
                              .map((c) => (
                                <SelectItem key={c._id.toString()} value={c._id.toString()} className="cursor-pointer focus:bg-zinc-100 dark:focus:bg-white/5">
                                  {c.icon} {c.name}
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
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-zinc-500">New Category Name</FormLabel>
                        <FormControl>
                          <Input className="h-14 bg-zinc-50 dark:bg-[#1a1a1c] border-zinc-200 dark:border-zinc-800 rounded-xl px-4 text-zinc-900 dark:text-white font-medium focus-visible:ring-emerald-500/50" placeholder="e.g. Groceries" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold uppercase tracking-wider text-zinc-500">Description (Optional)</FormLabel>
                <FormControl>
                  <Input className="h-14 bg-zinc-50 dark:bg-[#1a1a1c] border-zinc-200 dark:border-zinc-800 rounded-xl px-4 text-zinc-900 dark:text-white font-medium focus-visible:ring-emerald-500/50" placeholder="What was this for?" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full h-14 font-bold rounded-xl text-md shadow-[0_5px_15px_rgba(16,185,129,0.3)] bg-emerald-500 hover:bg-emerald-600 text-white transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2" disabled={loading}>
            {loading ? <PremiumSpinner /> : "Update Transaction"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
