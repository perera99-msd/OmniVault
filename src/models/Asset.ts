import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMortgagePayment {
  date: Date;
  amount: number;
  interestPortion: number;
  principalPortion: number;
  remainingPrincipal: number;
}

export interface IMortgageDetails {
  provider?: string;
  mortgageAmount?: number; // Original loan principal
  currentPrincipal?: number; // Current outstanding principal
  startDate?: Date;
  validPeriodMonths?: number;
  interestRate?: number; // e.g. 2.4
  rateType?: "MONTHLY" | "YEARLY"; // default MONTHLY
  totalInterestPaid?: number;
  totalPrincipalPaid?: number;
  lastPaymentDate?: Date;
  status?: "ACTIVE" | "SETTLED";
  settledDate?: Date;
  payments?: IMortgagePayment[];
}

export interface IAsset extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  category: "GOLD" | "REAL_ESTATE" | "BUSINESS" | "VEHICLE" | "OTHER";
  initialValue: number;
  currentValue: number;
  currency: "LKR" | "USD" | "EUR";
  location?: string;
  description?: string;
  isMortgaged: boolean;
  mortgageDetails?: IMortgageDetails;
  mortgageHistory?: IMortgageDetails[];
}

const MortgagePaymentSchema = new Schema<IMortgagePayment>(
  {
    date: { type: Date, default: Date.now },
    amount: { type: Number, required: true },
    interestPortion: { type: Number, default: 0 },
    principalPortion: { type: Number, default: 0 },
    remainingPrincipal: { type: Number, default: 0 },
  },
  { _id: true }
);

const MortgageDetailsSchema = new Schema<IMortgageDetails>(
  {
    provider: { type: String, required: false },
    mortgageAmount: { type: Number, required: false },
    currentPrincipal: { type: Number, required: false },
    startDate: { type: Date, required: false },
    validPeriodMonths: { type: Number, required: false },
    interestRate: { type: Number, required: false },
    rateType: { type: String, enum: ["MONTHLY", "YEARLY"], default: "MONTHLY" },
    totalInterestPaid: { type: Number, default: 0 },
    totalPrincipalPaid: { type: Number, default: 0 },
    lastPaymentDate: { type: Date, required: false },
    status: { type: String, enum: ["ACTIVE", "SETTLED"], default: "ACTIVE" },
    settledDate: { type: Date, required: false },
    payments: { type: [MortgagePaymentSchema], default: [] },
  },
  { _id: true }
);

const AssetSchema = new Schema<IAsset>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ["GOLD", "REAL_ESTATE", "BUSINESS", "VEHICLE", "OTHER"],
      required: true,
    },
    initialValue: { type: Number, required: true },
    currentValue: { type: Number, required: true },
    currency: { type: String, enum: ["LKR", "USD", "EUR"], default: "LKR" },
    location: { type: String, required: false },
    description: { type: String, required: false },
    isMortgaged: { type: Boolean, default: false },
    mortgageDetails: { type: MortgageDetailsSchema, required: false },
    mortgageHistory: { type: [MortgageDetailsSchema], default: [] },
  },
  { timestamps: true }
);

if (mongoose.models.Asset) {
  delete mongoose.models.Asset;
}

export const Asset: Model<IAsset> = mongoose.model<IAsset>("Asset", AssetSchema);
