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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-sm hover:shadow-md transition-all h-12 px-6" />}>
        <Plus className="w-5 h-5 mr-2" /> Add Upcoming Payment
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/5 shadow-2xl p-6 sm:p-8 rounded-[2rem]">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Schedule Payment</DialogTitle>
          <DialogDescription className="text-zinc-500 font-medium">
            Keep track of your future bills and subscriptions.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Payment Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Netflix Subscription" className="h-14 bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 rounded-2xl font-medium px-4 text-zinc-900 dark:text-white focus-visible:ring-emerald-500/50" {...field} />
                  </FormControl>
                  <FormMessage className="ml-1" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem className="bg-zinc-50 dark:bg-white/5 rounded-3xl p-4 sm:p-5 border border-transparent focus-within:border-emerald-500/30 transition-colors shadow-sm">
                  <FormLabel className="text-[13px] text-zinc-500 dark:text-zinc-400 font-medium ml-1">Amount</FormLabel>
                  <FormControl>
                    <div className="flex items-center mt-1">
                      <span className="text-2xl font-black mr-1 opacity-80 text-emerald-600">Rs</span>
                      <input 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00"
                        className="bg-transparent border-none text-3xl font-black text-zinc-900 dark:text-white focus:outline-none w-full placeholder:text-zinc-300 dark:placeholder:text-zinc-600 p-0" 
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
                    <FormLabel className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" className="h-14 bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 rounded-2xl font-medium px-4 text-zinc-900 dark:text-white focus-visible:ring-emerald-500/50" {...field} />
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
                    <FormLabel className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Pay From (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-14 bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 rounded-2xl font-bold px-4 text-zinc-900 dark:text-white focus:ring-emerald-500/50">
                          <SelectValue placeholder="Select a vault" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white dark:bg-[#161917] border border-zinc-200 dark:border-white/10 rounded-xl shadow-xl">
                        <SelectItem value="none" className="font-bold">Don't specify</SelectItem>
                        {wallets.map((wallet) => (
                          <SelectItem key={wallet._id} value={wallet._id} className="font-bold">
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
              <div className={`p-3 rounded-xl text-sm font-bold text-center ${submitMessage.type === "success" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"}`}>
                {submitMessage.text}
              </div>
            )}

            <div className="pt-4">
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl h-14 shadow-sm font-bold transition-all text-[16px]"
              >
                {form.formState.isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Payment"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
