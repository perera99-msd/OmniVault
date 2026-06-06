"use server";

import dbConnect from "@/lib/db/index";
import { User } from "@/models/User";
import { Loan } from "@/models/Loan";
import { revalidatePath } from "next/cache";

export async function getLoansPageData(firebaseUid: string) {
  await dbConnect();
  try {
    const user = await User.findOne({ firebaseUid }).lean();
    if (!user) return { success: false, error: "User not found" };
    
    const loans = await Loan.find({ userId: user._id }).sort({ createdAt: -1 }).lean();
    
    return {
      success: true,
      data: {
        user: JSON.parse(JSON.stringify(user)),
        loans: JSON.parse(JSON.stringify(loans))
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createLoan(data: any) {
  await dbConnect();
  try {
    const newLoan = await Loan.create({
      userId: data.userId,
      personName: data.personName,
      type: data.type, // 'GIVEN' or 'RECEIVED'
      amount: data.amount,
      status: 'PENDING',
      dueDate: data.hasDeadline ? data.dueDate : null,
      description: data.description || ""
    });
    
    revalidatePath("/loans");
    revalidatePath("/", "layout");
    return { success: true, loan: JSON.parse(JSON.stringify(newLoan)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function settleLoan(loanId: string) {
  await dbConnect();
  try {
    await Loan.findByIdAndUpdate(loanId, { status: 'SETTLED' });
    revalidatePath("/loans");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function extendLoanDate(loanId: string, newDate: Date) {
  await dbConnect();
  try {
    await Loan.findByIdAndUpdate(loanId, { dueDate: newDate });
    revalidatePath("/loans");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteLoan(loanId: string) {
  await dbConnect();
  try {
    await Loan.findByIdAndDelete(loanId);
    revalidatePath("/loans");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateLoan(loanId: string, data: any) {
  await dbConnect();
  try {
    const loan = await Loan.findById(loanId);
    if (!loan) throw new Error("Loan not found");

    loan.personName = data.personName;
    loan.type = data.type;
    loan.amount = data.amount;
    loan.dueDate = data.hasDeadline ? data.dueDate : null;
    loan.description = data.description || "";

    await loan.save();
    revalidatePath("/loans");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
