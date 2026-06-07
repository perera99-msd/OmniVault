"use server";

import dbConnect from "@/lib/db/index";
import { User } from "@/models/User";
import { Loan } from "@/models/Loan";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const firebaseUid = cookieStore.get("firebaseUid")?.value;
  if (!firebaseUid) throw new Error("Unauthorized: No session found");
  
  await dbConnect();
  const user = await User.findOne({ firebaseUid }).lean();
  if (!user) throw new Error("Unauthorized: User not found");
  
  return user;
}

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
