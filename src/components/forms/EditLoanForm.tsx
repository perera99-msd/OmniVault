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
import { Textarea } from "@/components/ui/textarea";
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
import { updateLoan } from "@/actions/loans";
import { PremiumSpinner } from "@/components/ui/PremiumSpinner";

const formSchema = z.object({
  personName: z.string().min(2, "Name must be at least 2 characters."),
  type: z.enum(["GIVEN", "RECEIVED"]),
  amount: z.coerce.number().positive("Amount must be positive."),
  hasDeadline: z.boolean(),
  dueDate: z.string().optional(),
  description: z.string().optional(),
});

interface EditLoanFormProps {
  loan: any;
}

export function EditLoanForm({ loan }: EditLoanFormProps) {
  const [open, setOpen] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      personName: loan.personName,
      type: loan.type,
      amount: loan.amount,
      hasDeadline: !!loan.dueDate,
      dueDate: loan.dueDate ? new Date(loan.dueDate).toISOString().split('T')[0] : "",
      description: loan.description || "",
    },
  });

  const hasDeadline = form.watch("hasDeadline");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setSubmitMessage(null);
    try {
      const res = await updateLoan(loan._id, {
        personName: values.personName,
        type: values.type,
        amount: values.amount,
        hasDeadline: values.hasDeadline,
        dueDate: values.hasDeadline && values.dueDate ? new Date(values.dueDate) : null,
        description: values.description,
      });

      if (res.success) {
        setSubmitMessage({ type: "success", text: "Loan updated successfully!" });
        setTimeout(() => {
          setOpen(false);
          setSubmitMessage(null);
        }, 1500);
      } else {
        setSubmitMessage({ type: "error", text: res.error || "Failed to update loan." });
      }
    } catch (error: any) {
      setSubmitMessage({ type: "error", text: error.message });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="w-11 h-11 flex items-center justify-center rounded-xl text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-500/20" title="Edit">
        <Edit2 className="w-4 h-4" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/5 shadow-2xl p-6 sm:p-8 rounded-[2rem] max-h-[90vh] overflow-y-auto hide-scrollbar">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            <Edit2 className="w-5 h-5 text-blue-500" /> Edit Contract
          </DialogTitle>
          <DialogDescription className="text-zinc-500 font-medium">
            Update the details of this loan contract.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="personName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Person / Entity Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. John Doe" className="h-14 bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 rounded-2xl font-medium px-4 text-zinc-900 dark:text-white focus-visible:ring-blue-500/50" {...field} />
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
                    <FormLabel className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Loan Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-14 bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 rounded-2xl font-bold px-4 text-zinc-900 dark:text-white focus:ring-blue-500/50">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white dark:bg-[#161917] border border-zinc-200 dark:border-white/10 rounded-xl shadow-xl">
                        <SelectItem value="GIVEN" className="font-bold">I Lent Money</SelectItem>
                        <SelectItem value="RECEIVED" className="font-bold">I Borrowed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="ml-1" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hasDeadline"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#18181b] p-4 h-14 mt-6">
                    <div className="space-y-0.5">
                      <FormLabel className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Set Deadline?</FormLabel>
                    </div>
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="w-5 h-5 accent-blue-500"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem className="bg-zinc-50 dark:bg-white/5 rounded-3xl p-4 sm:p-5 border border-transparent focus-within:border-blue-500/30 transition-colors shadow-sm">
                  <FormLabel className="text-[13px] text-zinc-500 dark:text-zinc-400 font-medium ml-1">Amount</FormLabel>
                  <FormControl>
                    <div className="flex items-center mt-1">
                      <span className="text-2xl font-black mr-1 opacity-80 text-blue-600">Rs</span>
                      <input 
                        type="number" 
                        step="0.01" 
                        className="bg-transparent border-none text-3xl font-black text-zinc-900 dark:text-white focus:outline-none w-full p-0" 
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="ml-1" />
                </FormItem>
              )}
            />

            {hasDeadline && (
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" className="h-14 bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 rounded-2xl font-medium px-4 text-zinc-900 dark:text-white focus-visible:ring-blue-500/50" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage className="ml-1" />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g. For dinner last night" 
                      className="bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 rounded-2xl resize-none p-4 text-zinc-900 dark:text-white focus-visible:ring-blue-500/50" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="ml-1" />
                </FormItem>
              )}
            />

            {submitMessage && (
              <div className={`p-3 rounded-xl text-sm font-bold text-center ${submitMessage.type === "success" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"}`}>
                {submitMessage.text}
              </div>
            )}

            <div className="pt-4">
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-2xl h-14 shadow-sm font-bold transition-all text-[16px]"
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
