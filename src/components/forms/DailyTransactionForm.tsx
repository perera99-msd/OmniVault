"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
  userId: string;
  wallets: any[];
  categories: any[];
}

export function DailyTransactionForm({ userId, wallets, categories }: DailyTransactionFormProps) {
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
        userId,
        name: values.newCategoryName,
        type: watchType,
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

    // Convert local YYYY-MM-DD back to a Date object, preserving current time
    const [year, month, day] = values.dateString.split("-").map(Number);
    const now = new Date();
    const finalDate = new Date(year, month - 1, day, now.getHours(), now.getMinutes(), now.getSeconds());

    const res = await addTransaction({
      userId,
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
      alert("Transaction Added!");
    } else {
      alert("Error: " + res.error);
    }
  }

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
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
                          ? "bg-white dark:bg-[#1e1e1e] shadow-sm text-red-600 dark:text-red-400" 
                          : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                      )}
                    >
                      Add Expense
                    </button>
                    <button
                      type="button"
                      onClick={() => field.onChange("INCOME")}
                      className={cn(
                        "flex-1 py-3 text-sm font-bold rounded-lg transition-all",
                        field.value === "INCOME" 
                          ? "bg-white dark:bg-[#1e1e1e] shadow-sm text-[#009900] dark:text-[#66cc66]" 
                          : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                      )}
                    >
                      Add Income
                    </button>
                  </div>
                </FormControl>
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" step="0.01" {...field} />
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
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
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
                  <FormLabel>Wallet</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a wallet" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {wallets.map((w) => (
                        <SelectItem key={w._id} value={w._id}>
                          {w.name} (${w.balance.toLocaleString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
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
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="NEW" className="font-bold text-primary">
                          + Create New Category
                        </SelectItem>
                        {categories
                          .filter((c) => c.type === watchType)
                          .map((c) => (
                            <SelectItem key={c._id} value={c._id}>
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
                      <FormLabel>New Category Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Groceries" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="What was this for?" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full font-bold shadow-md shadow-primary/30" disabled={loading || wallets.length === 0}>
            {loading ? "Processing..." : (wallets.length === 0 ? "Create a Wallet First" : "Save Transaction")}
          </Button>
        </form>
      </Form>
    </div>
  );
}
