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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  amount: z.coerce.number().positive(),
  sourceWalletId: z.string().min(1, "Source wallet is required"),
  destinationWalletId: z.string().optional(),
  categoryId: z.string().optional(),
  description: z.string().optional(),
});

export function DailyTransactionForm() {
  const selectedWalletId = useAppStore((state) => state.selectedWalletId);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "EXPENSE",
      amount: 0,
      sourceWalletId: selectedWalletId || "temp-wallet-id", // Fallback for UI testing
      description: "",
    },
  });

  const watchType = form.watch("type");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    const res = await addTransaction({
      userId: "temp-user-id", // To be replaced with Firebase Auth UID
      ...values,
      date: new Date()
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

  async function handleCreateCategory(e: React.MouseEvent) {
    e.preventDefault();
    if (!newCategoryName) return;
    
    const res = await createCategory({
      userId: "temp-user-id", // To be replaced with Auth UID
      name: newCategoryName,
      type: watchType === "TRANSFER" ? "EXPENSE" : watchType,
      icon: "tag", // Default icon
      color: "#009900" // Default color
    });

    if (res.success) {
      form.setValue("categoryId", res.category._id);
      setIsCreatingCategory(false);
      setNewCategoryName("");
    } else {
      alert("Error creating category: " + res.error);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto border-border bg-card shadow-lg shadow-primary/5">
      <CardHeader>
        <CardTitle className="text-2xl text-foreground">Add Transaction</CardTitle>
        <CardDescription>Record an income, expense, or transfer.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="EXPENSE">Expense</SelectItem>
                      <SelectItem value="INCOME">Income</SelectItem>
                      <SelectItem value="TRANSFER">Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            {watchType !== "TRANSFER" && (
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={(val) => {
                      if (val === "NEW") {
                        setIsCreatingCategory(true);
                      } else {
                        field.onChange(val);
                        setIsCreatingCategory(false);
                      }
                    }} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="60d5ecb8b392d7001f3e3a12">Groceries</SelectItem>
                        <SelectItem value="60d5ecb8b392d7001f3e3a13">Salary</SelectItem>
                        <SelectItem value="NEW" className="text-primary font-bold">+ Create New Category</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {isCreatingCategory && (
              <div className="p-4 border border-primary/20 rounded-xl space-y-3 bg-primary/5">
                <FormLabel>New Category Name</FormLabel>
                <div className="flex gap-2">
                  <Input 
                    value={newCategoryName} 
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g. Aunt's Donation" 
                  />
                  <Button type="button" variant="secondary" onClick={handleCreateCategory}>Save</Button>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full font-bold shadow-md shadow-primary/30" disabled={loading}>
              {loading ? "Adding..." : "Add Transaction"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
