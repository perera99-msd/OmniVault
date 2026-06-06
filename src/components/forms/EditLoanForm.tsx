"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Pencil } from "lucide-react";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { updateLoan } from "@/actions/loans";

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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={
        <Button size="icon" variant="ghost" className="h-8 w-8 text-[#8d6e63] dark:text-[#9e9e9e] hover:bg-[#d7ccc8]/30 dark:hover:bg-[#616161]/30 rounded-xl">
          <Pencil className="h-4 w-4" />
        </Button>
      } />
      <SheetContent className="bg-white dark:bg-[#161917] border-l border-zinc-200 dark:border-white/5 sm:max-w-md w-full overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-extrabold text-zinc-900 dark:text-white">Edit Loan</SheetTitle>
          <SheetDescription className="text-zinc-500 font-medium">
            Update the details of this loan.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="personName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Person Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. John Doe" className="bg-zinc-50 dark:bg-black/20 border-zinc-200 dark:border-white/10 rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Loan Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-zinc-50 dark:bg-black/20 border-zinc-200 dark:border-white/10 rounded-xl">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white dark:bg-[#161917] border-zinc-200 dark:border-white/10 rounded-xl">
                      <SelectItem value="GIVEN">I lent money to them</SelectItem>
                      <SelectItem value="RECEIVED">I borrowed from them</SelectItem>
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
              name="hasDeadline"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black/20 p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm font-bold text-zinc-900 dark:text-white">Set a Deadline?</FormLabel>
                  </div>
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="w-5 h-5 accent-[#009900]"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {hasDeadline && (
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" className="bg-zinc-50 dark:bg-black/20 border-zinc-200 dark:border-white/10 rounded-xl" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g. For dinner last night" 
                      className="bg-zinc-50 dark:bg-black/20 border-zinc-200 dark:border-white/10 rounded-xl resize-none" 
                      {...field} 
                    />
                  </FormControl>
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
              {form.formState.isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
