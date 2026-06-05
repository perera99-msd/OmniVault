"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/db";
import { User } from "@/models/User";
import { Wallet } from "@/models/Wallet";
import { Category } from "@/models/Category";
import { Transaction } from "@/models/Transaction";

export async function createUser(data: { firebaseUid: string; email: string; name: string }) {
  await dbConnect();
  try {
    let user = await User.findOne({ firebaseUid: data.firebaseUid });
    if (!user) {
      user = await User.create(data);
    }
    return { success: true, user: JSON.parse(JSON.stringify(user)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createWallet(data: { userId: string; name: string; type: "Cash" | "Bank" | "Digital"; balance?: number }) {
  await dbConnect();
  try {
    const wallet = await Wallet.create(data);
    revalidatePath("/");
    return { success: true, wallet: JSON.parse(JSON.stringify(wallet)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createCategory(data: { userId: string; name: string; type: "INCOME" | "EXPENSE"; icon: string; color: string }) {
  await dbConnect();
  try {
    const category = await Category.create(data);
    revalidatePath("/");
    return { success: true, category: JSON.parse(JSON.stringify(category)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addTransaction(data: {
  userId: string;
  amount: number;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  sourceWalletId: string;
  destinationWalletId?: string;
  categoryId?: string;
  description?: string;
  date?: Date;
}) {
  await dbConnect();
  
  // Start a Mongoose session for transaction integrity
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Create the Transaction Record
    const transaction = await Transaction.create([data], { session });

    // 2. Update Source Wallet
    const sourceWallet = await Wallet.findById(data.sourceWalletId).session(session);
    if (!sourceWallet) throw new Error("Source wallet not found");

    if (data.type === "EXPENSE" || data.type === "TRANSFER") {
      sourceWallet.balance -= data.amount;
    } else if (data.type === "INCOME") {
      sourceWallet.balance += data.amount;
    }
    await sourceWallet.save({ session });

    // 3. Update Destination Wallet (if Transfer)
    if (data.type === "TRANSFER" && data.destinationWalletId) {
      const destWallet = await Wallet.findById(data.destinationWalletId).session(session);
      if (!destWallet) throw new Error("Destination wallet not found");
      
      destWallet.balance += data.amount;
      await destWallet.save({ session });
    }

    // Commit the entire transaction
    await session.commitTransaction();
    session.endSession();

    revalidatePath("/");
    return { success: true, transaction: JSON.parse(JSON.stringify(transaction[0])) };
  } catch (error: any) {
    // Abort if anything fails
    await session.abortTransaction();
    session.endSession();
    return { success: false, error: error.message };
  }
}
