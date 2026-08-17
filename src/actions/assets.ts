"use server";

import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/db";
import { User } from "@/models/User";
import { Asset } from "@/models/Asset";
import { convertCurrency } from "@/lib/utils/currency";
import { getAuthenticatedUser } from "@/lib/auth/session";

export async function getAssetsPageData(firebaseUidInput?: string, baseCurrencyInput?: string) {
  try {
    await dbConnect();
    let user;
    if (firebaseUidInput) {
      user = await User.findOne({ firebaseUid: firebaseUidInput });
    } else {
      user = await getAuthenticatedUser();
    }

    if (!user) throw new Error("User not found");

    const baseCurrency = baseCurrencyInput || (user as any).baseCurrency || "LKR";
    const assetsRaw = await Asset.find({ userId: user._id }).sort({ createdAt: -1 }).lean();

    let totalUnmortgagedWealth = 0;
    let totalPortfolioValue = 0;
    let totalMortgageLiabilities = 0;
    let totalMortgagePaid = 0;

    const catMap: Record<string, { unmortgagedValue: number; totalValue: number; count: number }> = {
      GOLD: { unmortgagedValue: 0, totalValue: 0, count: 0 },
      REAL_ESTATE: { unmortgagedValue: 0, totalValue: 0, count: 0 },
      BUSINESS: { unmortgagedValue: 0, totalValue: 0, count: 0 },
      VEHICLE: { unmortgagedValue: 0, totalValue: 0, count: 0 },
      OTHER: { unmortgagedValue: 0, totalValue: 0, count: 0 },
    };

    const settledArchive: any[] = [];

    const assets = assetsRaw.map((asset: any) => {
      const currency = asset.currency || "LKR";
      const convertedCurrent = convertCurrency(asset.currentValue || 0, currency, baseCurrency);
      const convertedInitial = convertCurrency(asset.initialValue || 0, currency, baseCurrency);

      let convertedMortgageAmount = 0;
      let convertedCurrentPrincipal = 0;
      let convertedTotalPrincipalPaid = 0;
      let convertedTotalInterestPaid = 0;

      if (asset.mortgageHistory && Array.isArray(asset.mortgageHistory)) {
        asset.mortgageHistory.forEach((mh: any, idx: number) => {
          settledArchive.push({
            ...mh,
            _id: mh._id?.toString() || `${asset._id}-hist-${idx}`,
            assetId: asset._id.toString(),
            assetName: asset.name,
            assetCategory: asset.category,
            assetCurrency: currency,
            historyIndex: idx,
          });
        });
      }

      if (asset.isMortgaged && asset.mortgageDetails) {
        const origAmount = asset.mortgageDetails.mortgageAmount || 0;
        const currPrincipal = asset.mortgageDetails.currentPrincipal !== undefined
          ? asset.mortgageDetails.currentPrincipal
          : origAmount;

        convertedMortgageAmount = convertCurrency(origAmount, currency, baseCurrency);
        convertedCurrentPrincipal = convertCurrency(currPrincipal, currency, baseCurrency);
        convertedTotalPrincipalPaid = convertCurrency(
          asset.mortgageDetails.totalPrincipalPaid || 0,
          currency,
          baseCurrency
        );
        convertedTotalInterestPaid = convertCurrency(
          asset.mortgageDetails.totalInterestPaid || 0,
          currency,
          baseCurrency
        );

        totalMortgageLiabilities += convertedCurrentPrincipal;
        totalMortgagePaid += convertedTotalPrincipalPaid;
      } else {
        totalUnmortgagedWealth += convertedCurrent;
      }

      totalPortfolioValue += convertedCurrent;

      const cat = asset.category || "OTHER";
      if (!catMap[cat]) catMap[cat] = { unmortgagedValue: 0, totalValue: 0, count: 0 };
      catMap[cat].count += 1;
      catMap[cat].totalValue += convertedCurrent;
      if (!asset.isMortgaged) {
        catMap[cat].unmortgagedValue += convertedCurrent;
      }

      return {
        ...asset,
        _id: asset._id.toString(),
        userId: asset.userId.toString(),
        convertedCurrent,
        convertedInitial,
        convertedMortgageAmount,
        convertedCurrentPrincipal,
        convertedTotalPrincipalPaid,
        convertedTotalInterestPaid,
      };
    });

    const categoryBreakdown = Object.entries(catMap).map(([cat, data]) => ({
      category: cat,
      ...data,
    }));

    // Sort settled archive by date descending
    settledArchive.sort((a, b) => {
      const dA = new Date(a.settledDate || a.lastPaymentDate || 0).getTime();
      const dB = new Date(b.settledDate || b.lastPaymentDate || 0).getTime();
      return dB - dA;
    });

    return {
      success: true,
      data: {
        user: JSON.parse(JSON.stringify(user)),
        assets: JSON.parse(JSON.stringify(assets)),
        settledArchive: JSON.parse(JSON.stringify(settledArchive)),
        summary: {
          baseCurrency,
          totalUnmortgagedWealth,
          totalPortfolioValue,
          totalMortgageLiabilities,
          totalMortgagePaid,
        },
        categoryBreakdown,
      },
    };
  } catch (error: any) {
    console.error("Error in getAssetsPageData:", error);
    return { success: false, error: error.message };
  }
}

export async function createAsset(data: {
  firebaseUid?: string;
  name: string;
  category: string;
  initialValue: number;
  currentValue: number;
  currency?: string;
  location?: string;
  description?: string;
  isMortgaged?: boolean;
  mortgageDetails?: {
    provider?: string;
    mortgageAmount?: number;
    startDate?: Date | string;
    validPeriodMonths?: number;
    interestRate?: number;
    rateType?: "MONTHLY" | "YEARLY";
  };
}) {
  try {
    await dbConnect();
    let user;
    if (data.firebaseUid) {
      user = await User.findOne({ firebaseUid: data.firebaseUid });
    } else {
      user = await getAuthenticatedUser();
    }

    if (!user) throw new Error("User not found or unauthorized");

    const stDate = data.mortgageDetails?.startDate
      ? new Date(data.mortgageDetails.startDate)
      : new Date();
    const mAmount = data.mortgageDetails?.mortgageAmount || 0;

    const newAsset = new Asset({
      userId: user._id,
      name: data.name,
      category: data.category,
      initialValue: data.initialValue,
      currentValue: data.currentValue,
      currency: data.currency || (user as any).baseCurrency || "LKR",
      location: data.location || "",
      description: data.description || "",
      isMortgaged: !!data.isMortgaged,
      mortgageDetails: data.isMortgaged
        ? {
            provider: data.mortgageDetails?.provider || "",
            mortgageAmount: mAmount,
            currentPrincipal: mAmount,
            startDate: stDate,
            validPeriodMonths: data.mortgageDetails?.validPeriodMonths || 12,
            interestRate: data.mortgageDetails?.interestRate || 0,
            rateType: data.mortgageDetails?.rateType || "MONTHLY",
            totalInterestPaid: 0,
            totalPrincipalPaid: 0,
            lastPaymentDate: stDate,
            status: "ACTIVE",
            payments: [],
          }
        : undefined,
      mortgageHistory: [],
    });

    await newAsset.save();
    revalidatePath("/assets");
    return { success: true, asset: JSON.parse(JSON.stringify(newAsset)) };
  } catch (error: any) {
    console.error("Error in createAsset:", error);
    return { success: false, error: error.message };
  }
}

export async function updateAsset(
  assetId: string,
  data: {
    name: string;
    category: string;
    initialValue: number;
    currentValue: number;
    currency?: string;
    location?: string;
    description?: string;
    isMortgaged?: boolean;
    mortgageDetails?: {
      provider?: string;
      mortgageAmount?: number;
      currentPrincipal?: number;
      startDate?: Date | string;
      validPeriodMonths?: number;
      interestRate?: number;
      rateType?: "MONTHLY" | "YEARLY";
    };
  }
) {
  try {
    await dbConnect();
    const user = await getAuthenticatedUser();
    const asset = await Asset.findOne({ _id: assetId, userId: user._id });
    if (!asset) throw new Error("Asset not found or unauthorized");

    asset.name = data.name;
    asset.category = data.category as any;
    asset.initialValue = data.initialValue;
    asset.currentValue = data.currentValue;
    if (data.currency) asset.currency = data.currency as any;
    if (data.location !== undefined) asset.location = data.location;
    if (data.description !== undefined) asset.description = data.description;

    // If un-mortgaging an asset that had payments, archive it first
    if (!data.isMortgaged && asset.isMortgaged && asset.mortgageDetails) {
      if (asset.mortgageDetails.payments && asset.mortgageDetails.payments.length > 0) {
        if (!asset.mortgageHistory) asset.mortgageHistory = [];
        asset.mortgageDetails.status = "SETTLED";
        asset.mortgageDetails.settledDate = new Date();
        asset.mortgageHistory.push(asset.mortgageDetails);
      }
      asset.isMortgaged = false;
      asset.mortgageDetails = undefined;
    } else if (data.isMortgaged) {
      asset.isMortgaged = true;
      const origAmount = data.mortgageDetails?.mortgageAmount !== undefined
        ? data.mortgageDetails.mortgageAmount
        : (asset.mortgageDetails?.mortgageAmount || 0);

      const currPrincipal = data.mortgageDetails?.currentPrincipal !== undefined
        ? data.mortgageDetails.currentPrincipal
        : (asset.mortgageDetails?.currentPrincipal !== undefined ? asset.mortgageDetails.currentPrincipal : origAmount);

      const stDate = data.mortgageDetails?.startDate
        ? new Date(data.mortgageDetails.startDate)
        : (asset.mortgageDetails?.startDate || new Date());

      asset.mortgageDetails = {
        provider: data.mortgageDetails?.provider || asset.mortgageDetails?.provider || "",
        mortgageAmount: origAmount,
        currentPrincipal: currPrincipal,
        startDate: stDate,
        validPeriodMonths: data.mortgageDetails?.validPeriodMonths !== undefined ? data.mortgageDetails.validPeriodMonths : (asset.mortgageDetails?.validPeriodMonths || 12),
        interestRate: data.mortgageDetails?.interestRate !== undefined ? data.mortgageDetails.interestRate : (asset.mortgageDetails?.interestRate || 0),
        rateType: data.mortgageDetails?.rateType || asset.mortgageDetails?.rateType || "MONTHLY",
        totalInterestPaid: asset.mortgageDetails?.totalInterestPaid || 0,
        totalPrincipalPaid: asset.mortgageDetails?.totalPrincipalPaid || 0,
        lastPaymentDate: asset.mortgageDetails?.lastPaymentDate || stDate,
        status: "ACTIVE",
        payments: asset.mortgageDetails?.payments || [],
      };
    }

    await asset.save();
    revalidatePath("/assets");
    return { success: true, asset: JSON.parse(JSON.stringify(asset)) };
  } catch (error: any) {
    console.error("Error in updateAsset:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteAsset(assetId: string) {
  try {
    await dbConnect();
    const user = await getAuthenticatedUser();
    const result = await Asset.findOneAndDelete({ _id: assetId, userId: user._id });
    if (!result) throw new Error("Asset not found or unauthorized");
    revalidatePath("/assets");
    return { success: true };
  } catch (error: any) {
    console.error("Error in deleteAsset:", error);
    return { success: false, error: error.message };
  }
}

export async function recordMortgagePayment(
  assetId: string,
  data: {
    amount: number;
    interestPortion: number;
    principalPortion: number;
    date?: string;
  }
) {
  try {
    await dbConnect();
    const user = await getAuthenticatedUser();
    const asset = await Asset.findOne({ _id: assetId, userId: user._id });
    if (!asset || !asset.isMortgaged || !asset.mortgageDetails) {
      throw new Error("Mortgaged asset not found or unauthorized");
    }

    const currentPrinc = asset.mortgageDetails.currentPrincipal !== undefined
      ? asset.mortgageDetails.currentPrincipal
      : (asset.mortgageDetails.mortgageAmount || 0);

    const newPrincipal = Math.max(0, currentPrinc - data.principalPortion);
    const payDate = data.date ? new Date(data.date) : new Date();

    if (!asset.mortgageDetails.payments) {
      asset.mortgageDetails.payments = [];
    }

    asset.mortgageDetails.payments.push({
      date: payDate,
      amount: data.amount,
      interestPortion: data.interestPortion,
      principalPortion: data.principalPortion,
      remainingPrincipal: newPrincipal,
    });

    asset.mortgageDetails.currentPrincipal = newPrincipal;
    asset.mortgageDetails.totalInterestPaid = (asset.mortgageDetails.totalInterestPaid || 0) + data.interestPortion;
    asset.mortgageDetails.totalPrincipalPaid = (asset.mortgageDetails.totalPrincipalPaid || 0) + data.principalPortion;
    asset.mortgageDetails.lastPaymentDate = payDate;

    // Check if fully settled!
    if (newPrincipal <= 0) {
      asset.mortgageDetails.status = "SETTLED";
      asset.mortgageDetails.settledDate = payDate;
      if (!asset.mortgageHistory) asset.mortgageHistory = [];
      asset.mortgageHistory.push(asset.mortgageDetails);
      asset.isMortgaged = false;
      asset.mortgageDetails = undefined;
    }

    await asset.save();
    revalidatePath("/assets");
    return { success: true, asset: JSON.parse(JSON.stringify(asset)) };
  } catch (error: any) {
    console.error("Error in recordMortgagePayment:", error);
    return { success: false, error: error.message };
  }
}

export async function editMortgagePayment(
  assetId: string,
  paymentIndex: number,
  data: {
    amount: number;
    interestPortion: number;
    principalPortion: number;
    date?: string;
  },
  isHistory?: boolean,
  historyIndex?: number
) {
  try {
    await dbConnect();
    const user = await getAuthenticatedUser();
    const asset = await Asset.findOne({ _id: assetId, userId: user._id });
    if (!asset) throw new Error("Asset not found or unauthorized");

    let target: any = null;
    if (isHistory && historyIndex !== undefined && asset.mortgageHistory && asset.mortgageHistory[historyIndex]) {
      target = asset.mortgageHistory[historyIndex];
    } else if (asset.mortgageDetails) {
      target = asset.mortgageDetails;
    }

    if (!target || !target.payments || !target.payments[paymentIndex]) {
      throw new Error("Payment record not found");
    }

    const payDate = data.date ? new Date(data.date) : new Date(target.payments[paymentIndex].date);
    target.payments[paymentIndex] = {
      ...target.payments[paymentIndex],
      date: payDate,
      amount: data.amount,
      interestPortion: data.interestPortion,
      principalPortion: data.principalPortion,
    };

    // Re-calculate running balances across all payments chronologically
    let runningPrinc = target.mortgageAmount || 0;
    let totInt = 0;
    let totPrinc = 0;
    let lastDate = target.startDate || new Date();

    target.payments.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

    target.payments.forEach((p: any) => {
      totInt += p.interestPortion || 0;
      totPrinc += p.principalPortion || 0;
      runningPrinc = Math.max(0, runningPrinc - (p.principalPortion || 0));
      p.remainingPrincipal = runningPrinc;
      lastDate = p.date;
    });

    target.currentPrincipal = runningPrinc;
    target.totalInterestPaid = totInt;
    target.totalPrincipalPaid = totPrinc;
    target.lastPaymentDate = lastDate;

    // If active mortgage and now principal is 0, settle it!
    if (!isHistory && runningPrinc <= 0) {
      target.status = "SETTLED";
      target.settledDate = new Date();
      if (!asset.mortgageHistory) asset.mortgageHistory = [];
      asset.mortgageHistory.push(target);
      asset.isMortgaged = false;
      asset.mortgageDetails = undefined;
    }

    await asset.save();
    revalidatePath("/assets");
    return { success: true };
  } catch (error: any) {
    console.error("Error in editMortgagePayment:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteMortgagePayment(
  assetId: string,
  paymentIndex: number,
  isHistory?: boolean,
  historyIndex?: number
) {
  try {
    await dbConnect();
    const user = await getAuthenticatedUser();
    const asset = await Asset.findOne({ _id: assetId, userId: user._id });
    if (!asset) throw new Error("Asset not found or unauthorized");

    let target: any = null;
    if (isHistory && historyIndex !== undefined && asset.mortgageHistory && asset.mortgageHistory[historyIndex]) {
      target = asset.mortgageHistory[historyIndex];
    } else if (asset.mortgageDetails) {
      target = asset.mortgageDetails;
    }

    if (!target || !target.payments || !target.payments[paymentIndex]) {
      throw new Error("Payment record not found");
    }

    target.payments.splice(paymentIndex, 1);

    // Re-calculate running balances
    let runningPrinc = target.mortgageAmount || 0;
    let totInt = 0;
    let totPrinc = 0;
    let lastDate = target.startDate || new Date();

    target.payments.forEach((p: any) => {
      totInt += p.interestPortion || 0;
      totPrinc += p.principalPortion || 0;
      runningPrinc = Math.max(0, runningPrinc - (p.principalPortion || 0));
      p.remainingPrincipal = runningPrinc;
      lastDate = p.date;
    });

    target.currentPrincipal = runningPrinc;
    target.totalInterestPaid = totInt;
    target.totalPrincipalPaid = totPrinc;
    target.lastPaymentDate = lastDate;

    await asset.save();
    revalidatePath("/assets");
    return { success: true };
  } catch (error: any) {
    console.error("Error in deleteMortgagePayment:", error);
    return { success: false, error: error.message };
  }
}
