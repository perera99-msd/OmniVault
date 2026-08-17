"use server";

import dbConnect from "@/lib/db/index";
import { User } from "@/models/User";
import { UpcomingPayment } from "@/models/UpcomingPayment";
import { Wallet } from "@/models/Wallet";
import { Transaction } from "@/models/Transaction";
import { revalidatePath } from "next/cache";
import { getAuthenticatedUser } from "@/lib/auth/session";

export async function createUpcomingPayment(data: {
  firebaseUid?: string;
  name: string;
  amount: number;
  dueDate: Date;
  walletId?: string;
}) {
  try {
    await dbConnect();
    let user;
    if (data.firebaseUid) {
      user = await User.findOne({ firebaseUid: data.firebaseUid }).lean();
    } else {
      user = await getAuthenticatedUser();
    }
    if (!user) throw new Error("User not found or unauthorized");

    let currency = (user as any).baseCurrency || "LKR";
    if (data.walletId) {
      const wallet = await Wallet.findOne({ _id: data.walletId, userId: (user as any)._id }).lean();
      if (wallet && (wallet as any).currency) {
        currency = (wallet as any).currency;
      }
    }

    const payment = new UpcomingPayment({
      userId: (user as any)._id,
      name: data.name,
      amount: data.amount,
      currency,
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

export async function getUpcomingPayments(firebaseUidInput?: string) {
  try {
    await dbConnect();
    let user;
    if (firebaseUidInput) {
      user = await User.findOne({ firebaseUid: firebaseUidInput }).lean();
    } else {
      user = await getAuthenticatedUser();
    }
    if (!user) throw new Error("User not found or unauthorized");

    const payments = await UpcomingPayment.find({ userId: (user as any)._id })
      .populate("walletId", "name currency")
      .sort({ dueDate: 1 })
      .lean();

    // Convert ObjectIds to strings and ensure currency fallback
    const serializedPayments = payments.map((p: any) => ({
      ...p,
      _id: p._id.toString(),
      userId: p.userId.toString(),
      currency: p.currency || (p.walletId && p.walletId.currency) || (user as any).baseCurrency || "LKR",
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
    const user = await getAuthenticatedUser();
    
    const payment = await UpcomingPayment.findOne({ _id: paymentId, userId: user._id });
    if (!payment) throw new Error("Payment not found or unauthorized");
    if (payment.isPaid) throw new Error("Payment is already paid");

    const finalWalletId = walletIdToDeduct || payment.walletId;

    if (finalWalletId) {
      const wallet = await Wallet.findOne({ _id: finalWalletId, userId: user._id });
      if (wallet) {
        // Create an Expense transaction automatically
        const tx = new Transaction({
          userId: user._id,
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
    const user = await getAuthenticatedUser();
    const result = await UpcomingPayment.findOneAndDelete({ _id: paymentId, userId: user._id });
    if (!result) throw new Error("Payment not found or unauthorized");

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
    const user = await getAuthenticatedUser();
    const payment = await UpcomingPayment.findOne({ _id: paymentId, userId: user._id });
    if (!payment) throw new Error("Payment not found or unauthorized");

    payment.name = data.name;
    payment.amount = data.amount;
    payment.dueDate = data.dueDate;
    payment.walletId = data.walletId || null;

    if (data.walletId) {
      const wallet = await Wallet.findOne({ _id: data.walletId, userId: user._id }).lean();
      if (wallet && (wallet as any).currency) {
        payment.currency = (wallet as any).currency;
      }
    }

    await payment.save();
    revalidatePath("/upcoming");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Update upcoming payment error:", error);
    return { success: false, error: error.message };
  }
}
