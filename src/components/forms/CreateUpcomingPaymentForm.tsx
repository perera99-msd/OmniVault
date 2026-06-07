"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Plus } from "lucide-react";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { createUpcomingPayment } from "@/actions/upcoming";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  amount: z.coerce.number().positive("Amount must be positive."),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
  walletId: z.string().optional(),
});

interface CreateUpcomingPaymentFormProps {
  firebaseUid: string;
  wallets: any[];
}

export function CreateUpcomingPaymentForm({ firebaseUid, wallets }: CreateUpcomingPaymentFormProps) {
  const [open, setOpen] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: "",
      amount: 0,
      dueDate: new Date().toISOString().split('T')[0],
      walletId: "none",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setSubmitMessage(null);
    try {
      const res = await createUpcomingPayment({
        firebaseUid,
        name: values.name,
        amount: values.amount,
        dueDate: new Date(values.dueDate),
        walletId: values.walletId === "none" ? undefined : values.walletId,
      });

      if (res.success) {
        setSubmitMessage({ type: "success", text: "Payment scheduled successfully!" });
        setTimeout(() => {
          form.reset();
          setOpen(false);
          setSubmitMessage(null);
        }, 1500);
      } else {
        setSubmitMessage({ type: "error", text: res.error || "Failed to schedule payment." });
      }
    } catch (error: any) {
      setSubmitMessage({ type: "error", text: error.message });
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={
        <Button className="bg-[#009900] hover:bg-[#007700] text-white rounded-xl shadow-lg hover:shadow-xl transition-all">
          <Plus className="w-5 h-5 mr-2" /> Add Upcoming Payment
        </Button>
      } />
      <SheetContent className="bg-white dark:bg-[#161917] border-l border-zinc-200 dark:border-white/5 sm:max-w-md w-full">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-extrabold text-zinc-900 dark:text-white">Schedule Payment</SheetTitle>
          <SheetDescription className="text-zinc-500 font-medium">
            Keep track of your future bills and subscriptions.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Payment Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Netflix Subscription" className="bg-zinc-50 dark:bg-black/20 border-zinc-200 dark:border-white/10 rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Amount</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" className="bg-zinc-50 dark:bg-black/20 border-zinc-200 dark:border-white/10 rounded-xl font-mono" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Due Date</FormLabel>
                  <FormControl>
                    <Input type="date" className="bg-zinc-50 dark:bg-black/20 border-zinc-200 dark:border-white/10 rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="walletId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Pay From (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-zinc-50 dark:bg-black/20 border-zinc-200 dark:border-white/10 rounded-xl">
                        <SelectValue placeholder="Select a vault" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white dark:bg-[#161917] border-zinc-200 dark:border-white/10 rounded-xl">
                      <SelectItem value="none">Don't specify</SelectItem>
                      {wallets.map((wallet) => (
                        <SelectItem key={wallet._id} value={wallet._id}>
                          {wallet.name} ({wallet.currency || "LKR"})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {submitMessage && (
              <div className={`p-3 rounded-xl text-sm font-bold text-center ${submitMessage.type === "success" ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"}`}>
                {submitMessage.text}
              </div>
            )}

            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="w-full bg-[#009900] hover:bg-[#007700] text-white rounded-xl h-12 shadow-lg shadow-[#009900]/20 font-bold transition-all"
            >
              {form.formState.isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Payment"}
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
