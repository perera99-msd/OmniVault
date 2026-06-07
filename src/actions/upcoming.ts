"use server";

import dbConnect from "@/lib/db/index";
import { User } from "@/models/User";
import { UpcomingPayment } from "@/models/UpcomingPayment";
import { Wallet } from "@/models/Wallet";
import { Transaction } from "@/models/Transaction";
import { revalidatePath } from "next/cache";

export async function createUpcomingPayment(data: {
  firebaseUid: string;
  name: string;
  amount: number;
  dueDate: Date;
  walletId?: string;
}) {
  try {
    await dbConnect();
    const user = await User.findOne({ firebaseUid: data.firebaseUid }).lean();
    if (!user) throw new Error("User not found");

    const payment = new UpcomingPayment({
      userId: user._id,
      name: data.name,
      amount: data.amount,
      dueDate: data.dueDate,
      walletId: data.walletId || null,
    });

    await payment.save();
    revalidatePath("/upcoming");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Create upcoming payment error:", error);
    return { success: false, error: error.message };
  }
}

export async function getUpcomingPayments(firebaseUid: string) {
  try {
    await dbConnect();
    const user = await User.findOne({ firebaseUid }).lean();
    if (!user) throw new Error("User not found");

    const payments = await UpcomingPayment.find({ userId: user._id })
      .populate("walletId", "name currency")
      .sort({ dueDate: 1 })
      .lean();

    // Convert ObjectIds to strings
    const serializedPayments = payments.map((p: any) => ({
      ...p,
      _id: p._id.toString(),
      userId: p.userId.toString(),
      walletId: p.walletId ? {
        _id: p.walletId._id.toString(),
        name: p.walletId.name,
        currency: p.walletId.currency
      } : undefined,
    }));

    return { success: true, data: serializedPayments };
  } catch (error: any) {
    console.error("Get upcoming payments error:", error);
    return { success: false, error: error.message };
  }
}

export async function markUpcomingPaymentAsPaid(paymentId: string, walletIdToDeduct?: string) {
  try {
    await dbConnect();
    
    const payment = await UpcomingPayment.findById(paymentId);
    if (!payment) throw new Error("Payment not found");
    if (payment.isPaid) throw new Error("Payment is already paid");

    const finalWalletId = walletIdToDeduct || payment.walletId;

    if (finalWalletId) {
      const wallet = await Wallet.findById(finalWalletId);
      if (wallet) {
        // Create an Expense transaction automatically
        const tx = new Transaction({
          userId: payment.userId,
          type: "EXPENSE",
          amount: payment.amount,
          date: new Date(),
          sourceWalletId: finalWalletId,
          description: payment.name,
        });
        await tx.save();

        wallet.balance -= payment.amount;
        await wallet.save();
      }
    }

    payment.isPaid = true;
    await payment.save();

    revalidatePath("/upcoming");
    revalidatePath("/");
    revalidatePath("/transactions");
    return { success: true };
  } catch (error: any) {
    console.error("Mark upcoming payment as paid error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteUpcomingPayment(paymentId: string) {
  try {
    await dbConnect();
    await UpcomingPayment.findByIdAndDelete(paymentId);
    revalidatePath("/upcoming");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Delete upcoming payment error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateUpcomingPayment(
  paymentId: string,
  data: {
    name: string;
    amount: number;
    dueDate: Date;
    walletId?: string;
  }
) {
  try {
    await dbConnect();
    const payment = await UpcomingPayment.findById(paymentId);
    if (!payment) throw new Error("Payment not found");

    payment.name = data.name;
    payment.amount = data.amount;
    payment.dueDate = data.dueDate;
    payment.walletId = data.walletId || null;

    await payment.save();
    revalidatePath("/upcoming");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Update upcoming payment error:", error);
    return { success: false, error: error.message };
  }
}
