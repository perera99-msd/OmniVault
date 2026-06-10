"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import dbConnect from "@/lib/db";
import { User } from "@/models/User";
import { Wallet } from "@/models/Wallet";
import { Category } from "@/models/Category";
import { Transaction } from "@/models/Transaction";
import { UpcomingPayment } from "@/models/UpcomingPayment";

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

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const firebaseUid = cookieStore.get("firebaseUid")?.value;
  if (!firebaseUid) throw new Error("Unauthorized: No session found");
  
  await dbConnect();
  const user = await User.findOne({ firebaseUid }).lean();
  if (!user) throw new Error("Unauthorized: User not found");
  
  return user;
}

export async function createWallet(data: { name: string; type: "Cash" | "Bank" | "Digital"; balance?: number }) {
  try {
    const user = await getAuthenticatedUser();
    const wallet = await Wallet.create({ ...data, userId: user._id });
    revalidatePath("/", "layout");
    return { success: true, wallet: JSON.parse(JSON.stringify(wallet)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createCategory(data: { name: string; type: "INCOME" | "EXPENSE"; icon: string; color: string }) {
  try {
    const user = await getAuthenticatedUser();
    const category = await Category.create({ ...data, userId: user._id });
    revalidatePath("/");
    return { success: true, category: JSON.parse(JSON.stringify(category)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addTransaction(data: {
  amount: number;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  sourceWalletId: string;
  destinationWalletId?: string;
  categoryId?: string;
  description?: string;
  date?: Date;
}) {
  try {
    const user = await getAuthenticatedUser();

    // Verify Source Wallet Ownership
    const sourceWallet = await Wallet.findOne({ _id: data.sourceWalletId, userId: user._id });
    if (!sourceWallet) throw new Error("Source wallet not found or unauthorized");

    // Create the Transaction Record
    const transaction = await Transaction.create({ ...data, userId: user._id });

    if (data.type === "EXPENSE" || data.type === "TRANSFER") {
      sourceWallet.balance -= data.amount;
    } else if (data.type === "INCOME") {
      sourceWallet.balance += data.amount;
    }
    await sourceWallet.save();

    // Verify and Update Destination Wallet
    if (data.type === "TRANSFER" && data.destinationWalletId) {
      const destWallet = await Wallet.findOne({ _id: data.destinationWalletId, userId: user._id });
      if (!destWallet) throw new Error("Destination wallet not found or unauthorized");
      
      destWallet.balance += data.amount;
      await destWallet.save();
    }

    revalidatePath("/");
    return { success: true, transaction: JSON.parse(JSON.stringify(transaction)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getUserDashboardData(firebaseUid: string, baseCurrency: string = "LKR") {
  await dbConnect();
  try {
    let user = await User.findOne({ firebaseUid }).lean();
    if (!user) {
      // Auto-provision if missing (for older Firebase test accounts)
      const newUser = await User.create({ firebaseUid, email: "missing@email.com", name: "OmniVault User" });
      user = await User.findById(newUser._id).lean();
    }

    if (!user) {
      return { success: false, error: "Critical error provisioning user" };
    }

    const userId = user._id;

    // Concurrently fetch wallets, categories, and recent transactions
    const [wallets, categories, recentTransactions, upcomingPayments, allTransactions] = await Promise.all([
      Wallet.find({ userId }).lean(),
      Category.find({ userId }).lean(),
      Transaction.find({ userId })
        .populate("sourceWalletId", "name type currency")
        .populate("destinationWalletId", "name type currency")
        .populate("categoryId", "name type color icon")
        .sort({ date: -1, createdAt: -1 })
        .limit(10)
        .lean(),
      UpcomingPayment.find({ userId, isPaid: false })
        .populate("walletId", "name currency")
        .sort({ dueDate: 1 })
        .lean(),
      Transaction.find({ userId }).lean() // Fetch all for accurate multi-currency aggregation in JS
    ]);

    // Import utility locally to avoid circular dependencies if any
    const { convertCurrency } = require("@/lib/utils/currency");

    // Spending Aggregation (Today, This Month, This Year) in baseCurrency
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();

    const spendingData = { spentThisYear: 0, spentThisMonth: 0, spentToday: 0 };
    const inflowData = { earnedThisYear: 0, earnedThisMonth: 0, earnedToday: 0 };

    // Net Worth History variables
    const last6MonthsStart = new Date(now.getFullYear(), now.getMonth() - 5, 1).getTime();
    const monthlyCashflowMap: Record<string, { income: number, expense: number }> = {};

    allTransactions.forEach((tx: any) => {
      const txDate = new Date(tx.date).getTime();
      const txCurrency = tx.currency || "LKR"; // Fallback for old data
      const convertedAmount = convertCurrency(tx.amount, txCurrency, baseCurrency);

      // Income/Expense Aggregations
      if (txDate >= startOfYear) {
        if (tx.type === "EXPENSE") {
          spendingData.spentThisYear += convertedAmount;
          if (txDate >= startOfMonth) spendingData.spentThisMonth += convertedAmount;
          if (txDate >= startOfToday) spendingData.spentToday += convertedAmount;
        } else if (tx.type === "INCOME") {
          inflowData.earnedThisYear += convertedAmount;
          if (txDate >= startOfMonth) inflowData.earnedThisMonth += convertedAmount;
          if (txDate >= startOfToday) inflowData.earnedToday += convertedAmount;
        }
      }

      // Monthly Cashflow for Net Worth Chart
      if (txDate >= last6MonthsStart) {
        const dateObj = new Date(tx.date);
        const key = `${dateObj.getFullYear()}-${dateObj.getMonth() + 1}`;
        if (!monthlyCashflowMap[key]) monthlyCashflowMap[key] = { income: 0, expense: 0 };
        
        if (tx.type === "INCOME") monthlyCashflowMap[key].income += convertedAmount;
        if (tx.type === "EXPENSE") monthlyCashflowMap[key].expense += convertedAmount;
      }
    });

    // Net Worth History Calculation (Last 6 Months)
    const currentTotalAssets = wallets.reduce((sum: number, w: any) => sum + convertCurrency(w.balance, w.currency || "LKR", baseCurrency), 0);
    
    // Build the history array backwards
    const netWorthHistory = [];
    let runningNetWorth = currentTotalAssets;
    
    // Create an array of the last 6 months (including current)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const userCreatedAt = new Date((user as any).createdAt || now);
    const userCreatedYear = userCreatedAt.getFullYear();
    const userCreatedMonth = userCreatedAt.getMonth() + 1;
    
    for (let i = 0; i < 6; i++) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const targetYear = targetDate.getFullYear();
      const targetMonth = targetDate.getMonth() + 1; // 1-12
      
      const key = `${targetYear}-${targetMonth}`;
      const monthData = monthlyCashflowMap[key] || { income: 0, expense: 0 };
      
      let valueForMonth = runningNetWorth;
      // If this month is strictly before the user joined, net worth is 0
      if (targetYear < userCreatedYear || (targetYear === userCreatedYear && targetMonth < userCreatedMonth)) {
        valueForMonth = 0;
      }

      // Calculate the specific date to show in the tooltip
      let dateLabel = "";
      if (i === 0) {
        // Current month: Show today's date
        dateLabel = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      } else {
        // Previous months: Show the last day of that month
        const lastDayOfMonth = new Date(targetYear, targetMonth, 0);
        dateLabel = lastDayOfMonth.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
      
      netWorthHistory.unshift({
        month: monthNames[targetMonth - 1],
        dateLabel: dateLabel,
        value: valueForMonth,
      });

      // To find the net worth AT THE END of the PREVIOUS month, we reverse this month's flow
      const netCashFlowThisMonth = monthData.income - monthData.expense;
      runningNetWorth = runningNetWorth - netCashFlowThisMonth;
    }

    // Sort wallets: Recently used first
    const orderedRecentWalletIds = Array.from(new Set(
      recentTransactions.flatMap((tx: any) => [
        tx.sourceWalletId?._id?.toString(),
        tx.destinationWalletId?._id?.toString()
      ]).filter(Boolean)
    ));

    const sortedWallets = [...wallets].sort((a: any, b: any) => {
      const aId = a._id.toString();
      const bId = b._id.toString();
      
      const aIndex = orderedRecentWalletIds.indexOf(aId);
      const bIndex = orderedRecentWalletIds.indexOf(bId);

      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return {
      success: true,
      data: {
        user: JSON.parse(JSON.stringify(user)),
        wallets: JSON.parse(JSON.stringify(sortedWallets)),
        categories: JSON.parse(JSON.stringify(categories)),
        recentTransactions: JSON.parse(JSON.stringify(recentTransactions)),
        upcomingPayments: JSON.parse(JSON.stringify(upcomingPayments)),
        spendingData: JSON.parse(JSON.stringify(spendingData)),
        inflowData: JSON.parse(JSON.stringify(inflowData)),
        netWorthHistory: JSON.parse(JSON.stringify(netWorthHistory))
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getWalletsPageData(firebaseUid: string) {
  await dbConnect();
  try {
    const user = await User.findOne({ firebaseUid }).lean();
    if (!user) return { success: false, error: "User not found" };
    
    const wallets = await Wallet.find({ userId: user._id }).sort({ createdAt: -1 }).lean();
    
    return {
      success: true,
      data: {
        user: JSON.parse(JSON.stringify(user)),
        wallets: JSON.parse(JSON.stringify(wallets))
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateWalletName(walletId: string, newName: string) {
  try {
    const user = await getAuthenticatedUser();
    const wallet = await Wallet.findOneAndUpdate(
      { _id: walletId, userId: user._id },
      { name: newName }
    );
    if (!wallet) throw new Error("Wallet not found or unauthorized");
    
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteWallet(walletId: string) {
  try {
    const user = await getAuthenticatedUser();
    const wallet = await Wallet.findOneAndDelete({ _id: walletId, userId: user._id });
    if (!wallet) throw new Error("Wallet not found or unauthorized");

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getTransactionsHistory(firebaseUid: string, filter: string = 'THIS_MONTH') {
  await dbConnect();
  try {
    const user = await User.findOne({ firebaseUid }).lean();
    if (!user) return { success: false, error: "User not found" };

    const now = new Date();
    const currentYear = now.getFullYear();
    let startDate, endDate;

    switch (filter) {
      case 'TODAY':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      case 'THIS_WEEK': {
        const firstDayOfWeek = new Date(now);
        firstDayOfWeek.setDate(now.getDate() - now.getDay());
        firstDayOfWeek.setHours(0, 0, 0, 0);
        const lastDayOfWeek = new Date(firstDayOfWeek);
        lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
        lastDayOfWeek.setHours(23, 59, 59, 999);
        startDate = firstDayOfWeek;
        endDate = lastDayOfWeek;
        break;
      }
      case 'THIS_MONTH':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      case 'Q1':
        startDate = new Date(currentYear, 0, 1);
        endDate = new Date(currentYear, 2, 31, 23, 59, 59, 999);
        break;
      case 'Q2':
        startDate = new Date(currentYear, 3, 1);
        endDate = new Date(currentYear, 5, 30, 23, 59, 59, 999);
        break;
      case 'Q3':
        startDate = new Date(currentYear, 6, 1);
        endDate = new Date(currentYear, 8, 30, 23, 59, 59, 999);
        break;
      case 'Q4':
        startDate = new Date(currentYear, 9, 1);
        endDate = new Date(currentYear, 11, 31, 23, 59, 59, 999);
        break;
      case 'FULL_YEAR':
      default:
        startDate = new Date(currentYear, 0, 1);
        endDate = new Date(currentYear, 11, 31, 23, 59, 59, 999);
        break;
    }

    const [transactions, wallets, categories] = await Promise.all([
      Transaction.find({
        userId: user._id,
        date: { $gte: startDate, $lte: endDate }
      })
        .populate('sourceWalletId')
        .populate('destinationWalletId')
        .populate('categoryId')
        .sort({ date: -1 })
        .lean(),
      Wallet.find({ userId: user._id }).lean(),
      Category.find({ userId: user._id }).lean()
    ]);

    return {
      success: true,
      data: {
        user: JSON.parse(JSON.stringify(user)),
        transactions: JSON.parse(JSON.stringify(transactions)),
        wallets: JSON.parse(JSON.stringify(wallets)),
        categories: JSON.parse(JSON.stringify(categories)),
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteTransaction(transactionId: string) {
  try {
    const user = await getAuthenticatedUser();
    const transaction = await Transaction.findOne({ _id: transactionId, userId: user._id });
    if (!transaction) throw new Error("Transaction not found or unauthorized");

    // 1. Reverse Source Wallet
    const sourceWallet = await Wallet.findOne({ _id: transaction.sourceWalletId, userId: user._id });
    if (sourceWallet) {
      if (transaction.type === "EXPENSE" || transaction.type === "TRANSFER") {
        sourceWallet.balance += transaction.amount;
      } else if (transaction.type === "INCOME") {
        sourceWallet.balance -= transaction.amount;
      }
      await sourceWallet.save();
    }

    // 2. Reverse Destination Wallet (if Transfer)
    if (transaction.type === "TRANSFER" && transaction.destinationWalletId) {
      const destWallet = await Wallet.findOne({ _id: transaction.destinationWalletId, userId: user._id });
      if (destWallet) {
        destWallet.balance -= transaction.amount;
        await destWallet.save();
      }
    }

    // 3. Delete the Transaction Record
    await Transaction.findByIdAndDelete(transactionId);

    revalidatePath("/");
    revalidatePath("/transactions");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateTransaction(transactionId: string, newData: {
  amount: number;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  sourceWalletId: string;
  destinationWalletId?: string;
  categoryId?: string;
  description?: string;
  date?: Date;
}) {
  try {
    const user = await getAuthenticatedUser();
    const oldTransaction = await Transaction.findOne({ _id: transactionId, userId: user._id });
    if (!oldTransaction) throw new Error("Transaction not found or unauthorized");

    // 1. REVERSE OLD TRANSACTION
    const oldSourceWallet = await Wallet.findOne({ _id: oldTransaction.sourceWalletId, userId: user._id });
    if (oldSourceWallet) {
      if (oldTransaction.type === "EXPENSE" || oldTransaction.type === "TRANSFER") {
        oldSourceWallet.balance += oldTransaction.amount;
      } else if (oldTransaction.type === "INCOME") {
        oldSourceWallet.balance -= oldTransaction.amount;
      }
      await oldSourceWallet.save();
    }

    if (oldTransaction.type === "TRANSFER" && oldTransaction.destinationWalletId) {
      const oldDestWallet = await Wallet.findOne({ _id: oldTransaction.destinationWalletId, userId: user._id });
      if (oldDestWallet) {
        oldDestWallet.balance -= oldTransaction.amount;
        await oldDestWallet.save();
      }
    }

    // 2. APPLY NEW TRANSACTION
    const newSourceWallet = await Wallet.findOne({ _id: newData.sourceWalletId, userId: user._id });
    if (!newSourceWallet) throw new Error("New source wallet not found or unauthorized");

    if (newData.type === "EXPENSE" || newData.type === "TRANSFER") {
      newSourceWallet.balance -= newData.amount;
    } else if (newData.type === "INCOME") {
      newSourceWallet.balance += newData.amount;
    }
    await newSourceWallet.save();

    if (newData.type === "TRANSFER" && newData.destinationWalletId) {
      const newDestWallet = await Wallet.findOne({ _id: newData.destinationWalletId, userId: user._id });
      if (!newDestWallet) throw new Error("New destination wallet not found or unauthorized");
      
      newDestWallet.balance += newData.amount;
      await newDestWallet.save();
    }

    // 3. UPDATE RECORD
    oldTransaction.amount = newData.amount;
    oldTransaction.type = newData.type;
    oldTransaction.sourceWalletId = newData.sourceWalletId as any;
    oldTransaction.destinationWalletId = newData.destinationWalletId as any;
    oldTransaction.categoryId = newData.categoryId as any;
    oldTransaction.description = newData.description || "";
    if (newData.date) oldTransaction.date = newData.date;

    await oldTransaction.save();

    revalidatePath("/");
    revalidatePath("/transactions");
    return { success: true, transaction: JSON.parse(JSON.stringify(oldTransaction)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- CATEGORIES PAGE ACTIONS ---

export async function getCategoriesPageData(firebaseUid: string, baseCurrency: string = "LKR") {
  await dbConnect();
  try {
    const user = await User.findOne({ firebaseUid });
    if (!user) throw new Error("User not found");

    const { convertCurrency } = require("@/lib/utils/currency");

    const categories = await Category.find({ userId: user._id }).lean();
    const transactions = await Transaction.find({ userId: user._id, type: { $in: ["INCOME", "EXPENSE"] } }).populate('sourceWalletId', 'currency').lean();
    
    const txStatsMap: Record<string, {
      dayAmount: number; dayCount: number;
      monthAmount: number; monthCount: number;
      yearAmount: number; yearCount: number;
      allAmount: number; allCount: number;
    }> = {};

    const uncategorizedIncomeStats = { dayAmount: 0, dayCount: 0, monthAmount: 0, monthCount: 0, yearAmount: 0, yearCount: 0, allAmount: 0, allCount: 0 };
    const uncategorizedExpenseStats = { dayAmount: 0, dayCount: 0, monthAmount: 0, monthCount: 0, yearAmount: 0, yearCount: 0, allAmount: 0, allCount: 0 };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    for (const tx of transactions as any[]) {
      const currency = tx.currency || tx.sourceWalletId?.currency || "LKR";
      const convertedAmount = convertCurrency(tx.amount, currency, baseCurrency);
      const txDate = new Date(tx.date);

      if (!tx.categoryId) {
        const stats = tx.type === "INCOME" ? uncategorizedIncomeStats : uncategorizedExpenseStats;
        stats.allAmount += convertedAmount;
        stats.allCount += 1;
        if (txDate >= startOfYear) { stats.yearAmount += convertedAmount; stats.yearCount += 1; }
        if (txDate >= startOfMonth) { stats.monthAmount += convertedAmount; stats.monthCount += 1; }
        if (txDate >= today) { stats.dayAmount += convertedAmount; stats.dayCount += 1; }
        continue;
      }

      const catId = tx.categoryId.toString();
      if (!txStatsMap[catId]) {
        txStatsMap[catId] = {
          dayAmount: 0, dayCount: 0,
          monthAmount: 0, monthCount: 0,
          yearAmount: 0, yearCount: 0,
          allAmount: 0, allCount: 0
        };
      }
      
      txStatsMap[catId].allAmount += convertedAmount;
      txStatsMap[catId].allCount += 1;

      if (txDate >= startOfYear) {
        txStatsMap[catId].yearAmount += convertedAmount;
        txStatsMap[catId].yearCount += 1;
      }
      if (txDate >= startOfMonth) {
        txStatsMap[catId].monthAmount += convertedAmount;
        txStatsMap[catId].monthCount += 1;
      }
      if (txDate >= today) {
        txStatsMap[catId].dayAmount += convertedAmount;
        txStatsMap[catId].dayCount += 1;
      }
    }

    const categoriesWithStats = categories.map(cat => {
      const stats = txStatsMap[cat._id.toString()] || {
        dayAmount: 0, dayCount: 0, monthAmount: 0, monthCount: 0, yearAmount: 0, yearCount: 0, allAmount: 0, allCount: 0
      };
      return { ...cat, ...stats };
    });

    if (uncategorizedIncomeStats.allAmount > 0) {
      categoriesWithStats.push({
        _id: "uncategorized-income",
        name: "Uncategorized",
        type: "INCOME",
        icon: "📁",
        color: "#71717a",
        ...uncategorizedIncomeStats
      } as any);
    }

    if (uncategorizedExpenseStats.allAmount > 0) {
      categoriesWithStats.push({
        _id: "uncategorized-expense",
        name: "Uncategorized",
        type: "EXPENSE",
        icon: "📁",
        color: "#71717a",
        ...uncategorizedExpenseStats
      } as any);
    }

    return { success: true, data: JSON.parse(JSON.stringify(categoriesWithStats)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateCategory(categoryId: string, newName: string, newIcon?: string) {
  await dbConnect();
  const cookieStore = await cookies();
  const firebaseUid = cookieStore.get("firebaseUid")?.value;
  if (!firebaseUid) return { success: false, error: "Unauthorized" };

  try {
    const user = await User.findOne({ firebaseUid });
    if (!user) throw new Error("User not found");

    const updateData: any = { name: newName };
    if (newIcon) updateData.icon = newIcon;

    const category = await Category.findOneAndUpdate(
      { _id: categoryId, userId: user._id },
      updateData,
      { new: true }
    );
    if (!category) throw new Error("Category not found");

    revalidatePath("/categories");
    revalidatePath("/transactions");
    return { success: true, category: JSON.parse(JSON.stringify(category)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCategory(categoryId: string) {
  await dbConnect();
  const cookieStore = await cookies();
  const firebaseUid = cookieStore.get("firebaseUid")?.value;
  if (!firebaseUid) return { success: false, error: "Unauthorized" };

  try {
    const user = await User.findOne({ firebaseUid });
    if (!user) throw new Error("User not found");

    const category = await Category.findOneAndDelete({ _id: categoryId, userId: user._id });
    if (!category) throw new Error("Category not found");

    // Unassign transactions
    await Transaction.updateMany(
      { categoryId: categoryId, userId: user._id },
      { $unset: { categoryId: "" } }
    );

    revalidatePath("/categories");
    revalidatePath("/transactions");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
