"use server";

import dbConnect from "@/lib/db/index";
import { User } from "@/models/User";
import { Loan } from "@/models/Loan";
import { revalidatePath } from "next/cache";
import { getAuthenticatedUser } from "@/lib/auth/session";

export async function getLoansPageData(firebaseUidInput?: string) {
  await dbConnect();
  try {
    let user;
    if (firebaseUidInput) {
      user = await User.findOne({ firebaseUid: firebaseUidInput }).lean();
    } else {
      user = await getAuthenticatedUser();
    }

    if (!user) return { success: false, error: "User not found" };
    
    const loans = await Loan.find({ userId: (user as any)._id }).sort({ createdAt: -1 }).lean();
    
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
  try {
    const user = await getAuthenticatedUser();
    const newLoan = await Loan.create({
      userId: user._id,
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
  try {
    const user = await getAuthenticatedUser();
    const loan = await Loan.findOneAndUpdate({ _id: loanId, userId: user._id }, { status: 'SETTLED' });
    if (!loan) throw new Error("Loan not found or unauthorized");
    
    revalidatePath("/loans");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function recordPartialLoanPayment(loanId: string, paidAmount: number) {
  try {
    const user = await getAuthenticatedUser();
    const loan = await Loan.findOne({ _id: loanId, userId: user._id });
    if (!loan) throw new Error("Loan not found or unauthorized");

    if (paidAmount <= 0) throw new Error("Payment amount must be greater than zero");

    const newAmount = loan.amount - paidAmount;
    if (newAmount <= 0) {
      loan.amount = 0;
      loan.status = 'SETTLED';
    } else {
      loan.amount = newAmount;
      loan.status = 'PARTIAL';
    }

    await loan.save();
    revalidatePath("/loans");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function extendLoanDate(loanId: string, newDate: Date) {
  try {
    const user = await getAuthenticatedUser();
    const loan = await Loan.findOneAndUpdate({ _id: loanId, userId: user._id }, { dueDate: newDate });
    if (!loan) throw new Error("Loan not found or unauthorized");
    
    revalidatePath("/loans");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteLoan(loanId: string) {
  try {
    const user = await getAuthenticatedUser();
    const loan = await Loan.findOneAndDelete({ _id: loanId, userId: user._id });
    if (!loan) throw new Error("Loan not found or unauthorized");
    
    revalidatePath("/loans");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateLoan(loanId: string, data: any) {
  try {
    const user = await getAuthenticatedUser();
    const loan = await Loan.findOne({ _id: loanId, userId: user._id });
    if (!loan) throw new Error("Loan not found or unauthorized");

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
